<template>
  <section class="wizard-step-editor" :aria-label="copy.accessibleLabel">
    <SequenceBuilder
      :accessible-label="copy.sequence.accessibleLabel"
      :allow-duplicates="true"
      :available-items="availableActions"
      :copy="copy.sequence"
      :impact-summary="impactSummary"
      :sequence="draft"
      :show-configure="true"
      :validation="sequenceValidation"
      v-on:acknowledge-warnings="acknowledgedCodes = $event"
      v-on:activate="activeIdentity = $event.identity"
      v-on:update:sequence="recordChange"
    />

    <aside
      v-if="activeAction != null"
      class="wizard-step-editor__inspector"
      :aria-label="copy.inspector"
    >
      <header>
        <div>
          <span>{{
            format(copy.actionNumber, { number: activePosition })
          }}</span>
          <h2>{{ activeAction.name }}</h2>
          <p>{{ activeAction.summary || copy.noSummary }}</p>
        </div>
        <button type="button" v-on:click="activeIdentity = null">
          {{ copy.closeInspector }}
        </button>
      </header>
      <dl>
        <div>
          <dt>{{ copy.runtime }}</dt>
          <dd>{{ activeAction.metadata?.runtime || copy.notAvailable }}</dd>
        </div>
        <div>
          <dt>{{ copy.failureBehavior }}</dt>
          <dd>
            {{ activeAction.metadata?.failureBehavior || copy.notAvailable }}
          </dd>
        </div>
        <div>
          <dt>{{ copy.screenshotPolicy }}</dt>
          <dd>
            {{ activeAction.metadata?.screenshotPolicy || copy.notAvailable }}
          </dd>
        </div>
        <div>
          <dt>{{ copy.validationStatus }}</dt>
          <dd>
            {{
              activeDiagnostics.length === 0
                ? copy.valid
                : format(copy.invalid, { count: activeDiagnostics.length })
            }}
          </dd>
        </div>
      </dl>
      <ul v-if="activeDiagnostics.length > 0">
        <li
          v-for="diagnostic in activeDiagnostics"
          v-bind:key="`${diagnostic.code}:${diagnostic.path}`"
        >
          {{
            format(copy.validationDiagnostic, {
              number: activePosition,
              property: diagnostic.path || diagnostic.scope || "action",
            })
          }}
        </li>
      </ul>
      <slot
        name="properties"
        :action="activeAction"
        :position="activePosition"
        :update-action="updateActiveAction"
      ></slot>
    </aside>

    <SequenceSaveBar
      :can-redo="canRedo"
      :can-save="saveState.canSave"
      :can-undo="canUndo"
      :copy="copy.saveBar"
      :dirty="dirty"
      :last-saved-at="lastSavedAt"
      :locale="locale"
      :saving="saving"
      :server-version="serverVersion"
      v-on:discard="discard"
      v-on:redo="redo"
      v-on:save="save"
      v-on:undo="undo"
    />
  </section>
</template>

<script>
import SequenceBuilder from "@/components/sequence/SequenceBuilder.vue";
import SequenceSaveBar from "@/components/sequence/SequenceSaveBar.vue";
import { sequenceSaveState } from "@/domain/sequenceBuilder";

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? []));
}

export default {
  name: "WizardStepEditor",
  components: { SequenceBuilder, SequenceSaveBar },
  emits: ["save", "update:modelValue"],
  props: {
    availableActions: { type: Array, default: () => [] },
    copy: { type: Object, required: true },
    impactSummary: {
      type: Object,
      default: () => ({
        references: { tests: 0, cycles: 0, schedules: 0 },
        total: 0,
      }),
    },
    lastSavedAt: { type: String, default: null },
    locale: { type: String, default: "en" },
    modelValue: { type: Array, default: () => [] },
    saving: { type: Boolean, default: false },
    serverVersion: { type: [String, Number], default: null },
    validation: {
      type: Object,
      default: () => ({ canSave: true, diagnostics: [] }),
    },
  },
  data() {
    const initial = clone(this.modelValue);
    return {
      acknowledgedCodes: [],
      activeIdentity: null,
      baseline: initial,
      history: [initial],
      historyIndex: 0,
    };
  },
  computed: {
    activeAction() {
      return (
        this.draft.find((item) => item.identity === this.activeIdentity) ?? null
      );
    },
    activeDiagnostics() {
      if (this.activeAction == null) return [];
      return (this.validation.diagnostics ?? []).filter(
        (diagnostic) =>
          diagnostic.identity === this.activeIdentity ||
          diagnostic.path?.startsWith(`actions[${this.activePosition - 1}]`),
      );
    },
    activePosition() {
      return (
        this.draft.findIndex((item) => item.identity === this.activeIdentity) +
        1
      );
    },
    canRedo() {
      return this.historyIndex < this.history.length - 1;
    },
    canUndo() {
      return this.historyIndex > 0;
    },
    dirty() {
      return JSON.stringify(this.draft) !== JSON.stringify(this.baseline);
    },
    draft() {
      return this.history[this.historyIndex];
    },
    saveState() {
      return sequenceSaveState(this.validation, this.acknowledgedCodes);
    },
    sequenceValidation() {
      return {
        ...this.validation,
        diagnostics: (this.validation.diagnostics ?? []).filter(
          (diagnostic) =>
            diagnostic.code?.startsWith("sequence.") &&
            typeof diagnostic.remediationKey === "string",
        ),
      };
    },
  },
  mounted() {
    window.addEventListener("beforeunload", this.protectUnsavedChanges);
  },
  beforeUnmount() {
    window.removeEventListener("beforeunload", this.protectUnsavedChanges);
  },
  methods: {
    discard() {
      this.history = [clone(this.baseline)];
      this.historyIndex = 0;
      this.activeIdentity = null;
      this.$emit("update:modelValue", clone(this.draft));
    },
    format(template, values) {
      return Object.entries(values).reduce(
        (message, [key, value]) =>
          message.replaceAll(`{${key}}`, String(value)),
        template,
      );
    },
    protectUnsavedChanges(event) {
      if (!this.dirty) return;
      event.preventDefault();
      event.returnValue = "";
    },
    recordChange(next) {
      this.history = [
        ...this.history.slice(0, this.historyIndex + 1),
        clone(next),
      ].slice(-100);
      this.historyIndex = this.history.length - 1;
      this.$emit("update:modelValue", clone(this.draft));
    },
    redo() {
      if (!this.canRedo) return;
      this.historyIndex += 1;
      this.$emit("update:modelValue", clone(this.draft));
    },
    save() {
      if (!this.dirty || !this.saveState.canSave) return;
      this.$emit("save", clone(this.draft));
    },
    undo() {
      if (!this.canUndo) return;
      this.historyIndex -= 1;
      this.$emit("update:modelValue", clone(this.draft));
    },
    updateActiveAction(patch) {
      if (this.activeAction == null) return;
      this.recordChange(
        this.draft.map((action) =>
          action.identity === this.activeIdentity
            ? { ...action, ...clone(patch) }
            : action,
        ),
      );
    },
  },
};
</script>

<style scoped>
.wizard-step-editor {
  display: grid;
  gap: var(--id-space-5);
  min-width: 0;
}

.wizard-step-editor__inspector {
  display: grid;
  gap: var(--id-space-4);
  padding: var(--id-space-4);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  background: var(--id-color-surface-raised);
}

.wizard-step-editor__inspector header,
.wizard-step-editor__inspector dl {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-4);
  justify-content: space-between;
}

.wizard-step-editor__inspector h2,
.wizard-step-editor__inspector p,
.wizard-step-editor__inspector dl,
.wizard-step-editor__inspector dd {
  margin: 0;
}

.wizard-step-editor__inspector dl div {
  min-width: 10rem;
}

.wizard-step-editor__inspector dt {
  color: var(--id-color-text-muted);
}
</style>
