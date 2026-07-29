<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="enterprise-detail-drawer__backdrop"
      role="presentation"
      @click.self="requestClose"
      @keydown="handleKeydown"
    >
      <aside
        ref="drawer"
        class="enterprise-detail-drawer"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
      >
        <header>
          <div>
            <p>{{ eyebrow }}</p>
            <h2 :id="titleId">{{ title }}</h2>
          </div>
          <IdButton
            ref="closeButton"
            icon-only
            :accessible-label="closeLabel"
            variant="ghost"
            @click="requestClose"
          >
            <template #icon>×</template>
          </IdButton>
        </header>
        <div class="enterprise-detail-drawer__content">
          <slot></slot>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script>
import IdButton from "@/components/ui/IdButton.vue";

let drawerSequence = 0;

export default {
  name: "EnterpriseDetailDrawer",
  components: { IdButton },
  emits: ["close"],
  props: {
    closeLabel: { type: String, required: true },
    eyebrow: { type: String, required: true },
    open: { type: Boolean, default: false },
    title: { type: String, required: true },
  },
  data() {
    drawerSequence += 1;
    return {
      previouslyFocusedElement: null,
      titleId: `enterprise-detail-drawer-${drawerSequence}`,
    };
  },
  watch: {
    open: {
      immediate: true,
      handler(value) {
        if (value) this.activate();
        else this.restoreFocus();
      },
    },
  },
  beforeUnmount() {
    this.restoreFocus();
  },
  methods: {
    activate() {
      if (typeof document === "undefined") return;
      this.previouslyFocusedElement = document.activeElement;
      this.$nextTick(() => this.$refs.closeButton?.$el?.focus());
    },
    restoreFocus() {
      const element = this.previouslyFocusedElement;
      if (element instanceof HTMLElement && document.contains(element)) {
        this.$nextTick(() => element.focus());
      }
      this.previouslyFocusedElement = null;
    },
    requestClose() {
      this.$emit("close");
    },
    handleKeydown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        this.requestClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        this.$refs.drawer?.querySelectorAll(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (focusable.length === 0) {
        event.preventDefault();
        this.$refs.drawer?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
  },
};
</script>

<style scoped>
.enterprise-detail-drawer__backdrop {
  background: var(--id-color-overlay);
  display: flex;
  inset: 0;
  justify-content: flex-end;
  position: fixed;
  z-index: 1900;
}

.enterprise-detail-drawer {
  background: var(--id-color-surface);
  border-left: 1px solid var(--id-color-border);
  box-shadow: var(--id-shadow-dialog);
  color: var(--id-color-text);
  height: 100%;
  max-width: 100%;
  overflow: auto;
  padding: var(--id-space-5);
  width: min(42rem, 100%);
}

.enterprise-detail-drawer header {
  align-items: flex-start;
  display: flex;
  gap: var(--id-space-4);
  justify-content: space-between;
}

.enterprise-detail-drawer header p {
  color: var(--id-color-text-muted);
  font-size: var(--id-font-size-caption);
  letter-spacing: 0.12em;
  margin: 0;
  text-transform: uppercase;
}

.enterprise-detail-drawer h2 {
  margin: var(--id-space-2) 0 0;
}

.enterprise-detail-drawer__content {
  margin-top: var(--id-space-5);
}
</style>
