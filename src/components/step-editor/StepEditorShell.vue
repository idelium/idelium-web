<template>
  <section
    ref="shell"
    :class="[
      'step-editor-shell',
      {
        'step-editor-shell--compact': isCompact,
        'step-editor-shell--fullscreen': fullScreen,
      },
    ]"
    :aria-label="copy.accessibleLabel"
    :style="panelStyle"
    v-on:keydown.esc="exitFullScreen"
  >
    <header class="step-editor-shell__header">
      <div>
        <h1>{{ copy.title }}</h1>
        <p>{{ copy.description }}</p>
      </div>
      <div class="step-editor-shell__header-actions">
        <IdButton
          v-if="codeMode"
          variant="secondary"
          v-on:click="toggleFullScreen"
        >
          {{ fullScreen ? copy.exitFullScreen : copy.fullScreen }}
        </IdButton>
        <slot name="actions"></slot>
      </div>
    </header>

    <div
      v-if="isCompact"
      class="step-editor-shell__tabs"
      role="tablist"
      :aria-label="copy.panelNavigation"
    >
      <button
        v-for="panel in panels"
        v-bind:key="panel.id"
        type="button"
        role="tab"
        :id="`step-editor-tab-${panel.id}`"
        :aria-controls="`step-editor-panel-${panel.id}`"
        :aria-selected="activePanel === panel.id"
        :tabindex="activePanel === panel.id ? 0 : -1"
        v-on:click="activatePanel(panel.id)"
        v-on:keydown.left.prevent="movePanelFocus(-1, $event)"
        v-on:keydown.right.prevent="movePanelFocus(1, $event)"
      >
        {{ panel.label }}
      </button>
    </div>

    <div class="step-editor-shell__workspace">
      <section
        v-show="!isCompact || activePanel === 'catalog'"
        id="step-editor-panel-catalog"
        class="step-editor-shell__panel step-editor-shell__panel--catalog"
        :aria-labelledby="
          isCompact ? 'step-editor-tab-catalog' : 'step-editor-catalog-title'
        "
        :role="isCompact ? 'tabpanel' : 'region'"
      >
        <h2 id="step-editor-catalog-title" class="visually-hidden">
          {{ copy.catalog }}
        </h2>
        <slot name="catalog"></slot>
      </section>

      <button
        v-if="!isCompact"
        type="button"
        class="step-editor-shell__resize"
        role="separator"
        aria-orientation="vertical"
        :aria-label="copy.resizeCatalog"
        :aria-valuemin="18"
        :aria-valuemax="35"
        :aria-valuenow="Math.round(catalogWidth)"
        v-on:pointerdown="startResize('catalog', $event)"
        v-on:keydown.left.prevent="resizeBy('catalog', -2)"
        v-on:keydown.right.prevent="resizeBy('catalog', 2)"
      ></button>

      <section
        v-show="!isCompact || activePanel === 'sequence'"
        id="step-editor-panel-sequence"
        class="step-editor-shell__panel step-editor-shell__panel--sequence"
        :aria-labelledby="
          isCompact ? 'step-editor-tab-sequence' : 'step-editor-sequence-title'
        "
        :role="isCompact ? 'tabpanel' : 'region'"
      >
        <h2 id="step-editor-sequence-title" class="visually-hidden">
          {{ copy.sequence }}
        </h2>
        <slot name="sequence"></slot>
      </section>

      <button
        v-if="!isCompact"
        type="button"
        class="step-editor-shell__resize"
        role="separator"
        aria-orientation="vertical"
        :aria-label="copy.resizeInspector"
        :aria-valuemin="18"
        :aria-valuemax="35"
        :aria-valuenow="Math.round(inspectorWidth)"
        v-on:pointerdown="startResize('inspector', $event)"
        v-on:keydown.left.prevent="resizeBy('inspector', 2)"
        v-on:keydown.right.prevent="resizeBy('inspector', -2)"
      ></button>

      <section
        v-show="!isCompact || activePanel === 'inspector'"
        id="step-editor-panel-inspector"
        class="step-editor-shell__panel step-editor-shell__panel--inspector"
        :aria-labelledby="
          isCompact
            ? 'step-editor-tab-inspector'
            : 'step-editor-inspector-title'
        "
        :role="isCompact ? 'tabpanel' : 'region'"
      >
        <h2 id="step-editor-inspector-title" class="visually-hidden">
          {{ copy.inspector }}
        </h2>
        <slot name="inspector"></slot>
      </section>
    </div>

    <footer class="step-editor-shell__footer">
      <slot name="footer"></slot>
    </footer>
  </section>
</template>

<script>
import IdButton from "@/components/ui/IdButton.vue";

export default {
  name: "StepEditorShell",
  components: { IdButton },
  emits: ["panel-change", "resize"],
  props: {
    codeMode: { type: Boolean, default: false },
    compact: { type: Boolean, default: null },
    compactBreakpoint: { type: Number, default: 960 },
    copy: { type: Object, required: true },
  },
  data() {
    return {
      activePanel: "sequence",
      catalogWidth: 24,
      fullScreen: false,
      inspectorWidth: 26,
      observedCompact: false,
      resizeObserver: null,
      resizing: null,
    };
  },
  computed: {
    isCompact() {
      return this.compact ?? this.observedCompact;
    },
    panels() {
      return [
        { id: "catalog", label: this.copy.catalog },
        { id: "sequence", label: this.copy.sequence },
        { id: "inspector", label: this.copy.inspector },
      ];
    },
    panelStyle() {
      return {
        "--step-catalog-width": `${this.catalogWidth}%`,
        "--step-inspector-width": `${this.inspectorWidth}%`,
      };
    },
  },
  mounted() {
    if (typeof ResizeObserver === "function") {
      this.resizeObserver = new ResizeObserver(([entry]) => {
        this.observedCompact =
          entry.contentRect.width <= this.compactBreakpoint;
      });
      this.resizeObserver.observe(this.$refs.shell);
    }
  },
  beforeUnmount() {
    this.stopResize();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  },
  methods: {
    activatePanel(panel) {
      if (!this.panels.some((entry) => entry.id === panel)) return;
      this.activePanel = panel;
      this.$emit("panel-change", panel);
    },
    movePanelFocus(offset, event) {
      const index = this.panels.findIndex(
        (panel) => panel.id === this.activePanel,
      );
      const next = (index + offset + this.panels.length) % this.panels.length;
      const nextPanel = this.panels[next].id;
      this.activatePanel(nextPanel);
      event.currentTarget.parentElement
        ?.querySelector(`#step-editor-tab-${nextPanel}`)
        ?.focus();
    },
    startResize(panel, event) {
      event.currentTarget.setPointerCapture?.(event.pointerId);
      this.resizing = {
        panel,
        startX: event.clientX,
        startWidth:
          panel === "catalog" ? this.catalogWidth : this.inspectorWidth,
        workspaceWidth:
          this.$el.querySelector(".step-editor-shell__workspace")
            ?.clientWidth || 1,
      };
      window.addEventListener("pointermove", this.resizeFromPointer);
      window.addEventListener("pointerup", this.stopResize, { once: true });
    },
    resizeFromPointer(event) {
      if (this.resizing == null) return;
      const direction = this.resizing.panel === "catalog" ? 1 : -1;
      const delta =
        ((event.clientX - this.resizing.startX) /
          this.resizing.workspaceWidth) *
        100 *
        direction;
      this.setPanelWidth(this.resizing.panel, this.resizing.startWidth + delta);
    },
    resizeBy(panel, delta) {
      const current =
        panel === "catalog" ? this.catalogWidth : this.inspectorWidth;
      this.setPanelWidth(panel, current + delta);
    },
    setPanelWidth(panel, value) {
      const bounded = Math.min(Math.max(Number(value), 18), 35);
      if (panel === "catalog") this.catalogWidth = bounded;
      else this.inspectorWidth = bounded;
      this.$emit("resize", {
        catalogWidth: this.catalogWidth,
        inspectorWidth: this.inspectorWidth,
      });
    },
    stopResize() {
      this.resizing = null;
      window.removeEventListener("pointermove", this.resizeFromPointer);
      window.removeEventListener("pointerup", this.stopResize);
    },
    toggleFullScreen() {
      this.fullScreen = !this.fullScreen;
    },
    exitFullScreen() {
      this.fullScreen = false;
    },
  },
};
</script>

<style scoped>
.step-editor-shell {
  display: grid;
  gap: var(--id-space-3);
  height: min(56rem, calc(100dvh - 7rem));
  min-height: 32rem;
  min-width: 0;
  overflow: hidden;
}

.step-editor-shell--fullscreen {
  background: var(--id-color-surface);
  height: 100dvh;
  inset: 0;
  padding: var(--id-space-4);
  position: fixed;
  width: 100vw;
  z-index: 1055;
}

.step-editor-shell__header,
.step-editor-shell__header-actions,
.step-editor-shell__tabs,
.step-editor-shell__footer {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
}

.step-editor-shell__header {
  justify-content: space-between;
}

.step-editor-shell__header h1,
.step-editor-shell__header p {
  margin: 0;
}

.step-editor-shell__workspace {
  display: grid;
  grid-template-columns:
    minmax(0, var(--step-catalog-width)) var(--id-space-2)
    minmax(18rem, 1fr) var(--id-space-2)
    minmax(0, var(--step-inspector-width));
  min-height: 0;
  overflow: hidden;
}

.step-editor-shell__panel {
  background: var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  min-height: 0;
  min-width: 0;
  overflow: auto;
  padding: var(--id-space-3);
}

.step-editor-shell__resize {
  align-self: stretch;
  background: var(--id-color-border);
  border: 0;
  border-radius: var(--id-radius-pill);
  cursor: col-resize;
  margin: 0 auto;
  min-height: var(--id-control-min-size);
  padding: 0;
  width: var(--id-space-1);
}

.step-editor-shell__resize:focus-visible {
  outline: var(--id-focus-ring);
  outline-offset: var(--id-focus-offset);
}

.step-editor-shell__tabs {
  border-bottom: 1px solid var(--id-color-border);
}

.step-editor-shell__tabs button {
  background: transparent;
  border: 0;
  border-bottom: var(--id-space-1) solid transparent;
  color: var(--id-color-text);
  min-height: var(--id-control-min-size);
  padding: var(--id-space-2) var(--id-space-3);
}

.step-editor-shell__tabs button[aria-selected="true"] {
  border-bottom-color: var(--id-color-accent);
}

.step-editor-shell__footer {
  justify-content: flex-end;
}

.step-editor-shell--compact {
  height: min(52rem, calc(100dvh - 5rem));
  min-height: 28rem;
}

.step-editor-shell--compact .step-editor-shell__workspace {
  display: block;
}

.step-editor-shell--compact .step-editor-shell__panel {
  height: 100%;
}

@media (max-width: 48rem) {
  .step-editor-shell,
  .step-editor-shell--compact {
    height: calc(100dvh - 4rem);
    min-height: 24rem;
  }
}
</style>
