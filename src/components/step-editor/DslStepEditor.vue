<template>
  <section class="dsl-step-editor" :aria-label="copy.accessibleLabel">
    <header>
      <div>
        <h2>{{ copy.title }}</h2>
        <p>{{ copy.description }}</p>
      </div>
      <button
        v-if="!liveUpdate"
        type="button"
        :disabled="!canApply"
        v-on:click="applySource"
      >
        {{ copy.apply }}
      </button>
    </header>

    <label :for="editorId" class="visually-hidden">{{
      copy.editorLabel
    }}</label>
    <VAceEditor
      :id="editorId"
      v-model:value="source"
      class="dsl-step-editor__source"
      lang="text"
      theme="chrome"
      :aria-label="copy.editorLabel"
      :options="editorOptions"
    />

    <div
      class="dsl-step-editor__validation-status"
      :class="`dsl-step-editor__validation-status--${validationState}`"
      role="status"
      aria-live="polite"
    >
      <span class="dsl-step-editor__validation-dot" aria-hidden="true"></span>
      <strong>{{ validationStatusLabel }}</strong>
      <span>{{ validationStatusDescription }}</span>
    </div>

    <section
      v-if="showCompletions"
      class="dsl-step-editor__completions"
      :aria-label="copy.completions"
    >
      <h3>{{ copy.completions }}</h3>
      <p>{{ copy.completionsDescription }}</p>
      <ul>
        <li v-for="completion in completions" v-bind:key="completion.id">
          <button type="button" v-on:click="insertCompletion(completion)">
            {{ completionLabel(completion) }}
          </button>
          <code>{{ completion.insertText }}</code>
          <a
            v-if="completion.documentationUrl"
            :href="completion.documentationUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ copy.documentation }}
          </a>
        </li>
      </ul>
      <p v-if="completions.length === 0">{{ copy.noCompletions }}</p>
    </section>

    <section
      v-if="diagnostics.length > 0"
      class="dsl-step-editor__diagnostics"
      :aria-label="copy.diagnostics"
      role="alert"
    >
      <div class="dsl-step-editor__diagnostics-header">
        <span class="dsl-step-editor__diagnostics-icon" aria-hidden="true">
          &lt;/&gt;
        </span>
        <div>
          <h3>{{ copy.diagnostics }}</h3>
          <p>{{ copy.diagnosticsDescription }}</p>
        </div>
      </div>
      <ul>
        <li
          v-for="diagnostic in diagnostics"
          v-bind:key="diagnosticKey(diagnostic)"
          :class="`dsl-step-editor__diagnostic--${diagnostic.severity}`"
        >
          <div class="dsl-step-editor__diagnostic-marker" aria-hidden="true">
            {{ diagnosticSeverityLabel(diagnostic.severity) }}
          </div>
          <div class="dsl-step-editor__diagnostic-content">
            <div class="dsl-step-editor__diagnostic-title-row">
              <strong>{{ diagnosticMessage(diagnostic.code) }}</strong>
              <code>{{ diagnostic.code }}</code>
            </div>
            <div class="dsl-step-editor__diagnostic-meta">
              <span>
                {{
                  format(copy.location, {
                    column: diagnostic.column,
                    line: diagnostic.line,
                  })
                }}
              </span>
              <span>{{ copy.validationStatus.fixErrors }}</span>
            </div>
            <p>{{ remediationMessage(diagnostic.code) }}</p>
          </div>
        </li>
      </ul>
    </section>
    <p v-else aria-live="polite">
      {{ canApply ? copy.readyToApply : copy.valid }}
    </p>
  </section>
</template>

<script>
import { VAceEditor } from "vue3-ace-editor";

import {
  createDslCompletions,
  validateDslCatalogCompatibility,
  validateDslSource,
} from "@/domain/dslValidation";

let editorSequence = 0;

export default {
  name: "DslStepEditor",
  components: { VAceEditor },
  emits: ["apply", "update:modelValue"],
  props: {
    activeRuntime: { type: String, default: "" },
    authorizedActionIds: { type: Array, default: () => [] },
    catalog: { type: Object, required: true },
    copy: { type: Object, required: true },
    editorMaxLines: { type: Number, default: 40 },
    editorMinLines: { type: Number, default: 12 },
    liveUpdate: { type: Boolean, default: false },
    localizedActions: { type: Object, default: () => ({}) },
    modelValue: { type: String, default: "" },
    showCompletions: { type: Boolean, default: true },
  },
  data() {
    editorSequence += 1;
    return {
      editorId: `dsl-step-editor-${editorSequence}`,
      lastValidSource: this.modelValue,
      source: this.modelValue,
    };
  },
  computed: {
    canApply() {
      return (
        this.diagnostics.every(
          (diagnostic) => diagnostic.severity === "warning",
        ) && this.source !== this.modelValue
      );
    },
    completions() {
      return createDslCompletions(this.catalog, {
        authorizedActionIds: this.authorizedActionIds,
      });
    },
    diagnostics() {
      const parsed = validateDslSource(this.source);
      return [
        ...parsed.diagnostics,
        ...validateDslCatalogCompatibility(this.source, this.catalog, {
          activeRuntime: this.activeRuntime,
        }),
      ];
    },
    editorOptions() {
      return {
        printMargin: false,
        showGutter: true,
        showLineNumbers: true,
        maxLines: this.editorMaxLines,
        minLines: this.editorMinLines,
        tabSize: 2,
        useSoftTabs: true,
      };
    },
    errorCount() {
      return this.diagnostics.filter(
        (diagnostic) => diagnostic.severity === "error",
      ).length;
    },
    validationState() {
      if (this.errorCount > 0) return "error";
      if (this.warningCount > 0) return "warning";
      return "valid";
    },
    validationStatusDescription() {
      if (this.errorCount > 0) return this.copy.validationStatus.fixErrors;
      if (this.warningCount > 0)
        return this.copy.validationStatus.reviewWarnings;
      return this.copy.validationStatus.ready;
    },
    validationStatusLabel() {
      if (this.errorCount > 0) {
        return this.format(this.copy.validationStatus.errors, {
          count: this.errorCount,
        });
      }
      if (this.warningCount > 0) {
        return this.format(this.copy.validationStatus.warnings, {
          count: this.warningCount,
        });
      }
      return this.copy.validationStatus.valid;
    },
    warningCount() {
      return this.diagnostics.filter(
        (diagnostic) => diagnostic.severity === "warning",
      ).length;
    },
  },
  watch: {
    diagnostics: {
      deep: true,
      handler(value) {
        if (value.every((diagnostic) => diagnostic.severity === "warning")) {
          this.lastValidSource = this.source;
        }
      },
    },
    modelValue(value) {
      if (value === this.source) return;
      this.lastValidSource = value;
      this.source = value;
    },
    source(value) {
      if (this.liveUpdate && value !== this.modelValue) {
        this.$emit("update:modelValue", value);
      }
    },
  },
  methods: {
    applySource() {
      if (!this.canApply) return;
      this.lastValidSource = this.source;
      this.$emit("update:modelValue", this.source);
      this.$emit("apply", this.source);
    },
    completionLabel(completion) {
      return (
        this.localizedActions[completion.id]?.label || completion.actionType
      );
    },
    diagnosticKey(diagnostic) {
      return [
        diagnostic.code,
        diagnostic.line,
        diagnostic.column,
        diagnostic.severity,
      ].join(":");
    },
    diagnosticMessage(code) {
      return this.copy.validation[code] || this.copy.validation.default;
    },
    diagnosticSeverityLabel(severity) {
      return String(severity ?? "").toUpperCase() === "WARNING"
        ? "WARN"
        : "ERR";
    },
    format(template, values) {
      return Object.entries(values).reduce(
        (message, [key, value]) =>
          message.replaceAll(`{${key}}`, String(value)),
        template,
      );
    },
    insertCompletion(completion) {
      const separator =
        this.source === "" || this.source.endsWith("\n") ? "" : "\n";
      this.source = `${this.source}${separator}${completion.insertText}`;
    },
    remediationMessage(code) {
      return this.copy.remediation[code] || this.copy.remediation.default;
    },
  },
};
</script>

<style scoped>
.dsl-step-editor {
  display: grid;
  gap: var(--id-space-4);
  min-width: 0;
}

.dsl-step-editor header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
  align-items: center;
  justify-content: space-between;
}

.dsl-step-editor h2,
.dsl-step-editor p {
  margin: 0;
}

.dsl-step-editor__source {
  width: 100%;
  min-height: min(24rem, 55dvh);
  max-height: min(42rem, 70dvh);
  overflow: auto;
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
}

.dsl-step-editor__validation-status {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-2);
  align-items: center;
  padding: var(--id-space-3) var(--id-space-4);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  background: var(--id-color-surface-raised);
}

.dsl-step-editor__validation-status strong,
.dsl-step-editor__validation-status span {
  margin: 0;
}

.dsl-step-editor__validation-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 999px;
  box-shadow: 0 0 0 0.25rem rgb(255 255 255 / 8%);
}

.dsl-step-editor__validation-status--valid {
  border-color: color-mix(
    in srgb,
    var(--id-color-success-text) 45%,
    transparent
  );
}

.dsl-step-editor__validation-status--valid .dsl-step-editor__validation-dot {
  background: var(--id-color-success-text);
}

.dsl-step-editor__validation-status--warning {
  border-color: color-mix(
    in srgb,
    var(--id-color-warning-text) 55%,
    transparent
  );
}

.dsl-step-editor__validation-status--warning .dsl-step-editor__validation-dot {
  background: var(--id-color-warning-text);
}

.dsl-step-editor__validation-status--error {
  border-color: color-mix(
    in srgb,
    var(--id-color-danger-text) 55%,
    transparent
  );
}

.dsl-step-editor__validation-status--error .dsl-step-editor__validation-dot {
  background: var(--id-color-danger-text);
}

.dsl-step-editor__completions,
.dsl-step-editor__diagnostics {
  display: grid;
  gap: var(--id-space-3);
  padding: var(--id-space-4);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  background: var(--id-color-surface-raised);
}

.dsl-step-editor__diagnostics {
  overflow: hidden;
  padding: 0;
  border-color: color-mix(
    in srgb,
    var(--id-color-danger-text) 42%,
    transparent
  );
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--id-color-danger-text) 12%, transparent),
      transparent 48%
    ),
    var(--id-color-surface-raised);
  box-shadow: inset 0.25rem 0 0 var(--id-color-danger-text);
}

.dsl-step-editor__diagnostics-header {
  display: flex;
  gap: var(--id-space-3);
  align-items: center;
  padding: var(--id-space-4);
  border-bottom: 1px solid
    color-mix(in srgb, var(--id-color-danger-text) 24%, transparent);
  background: color-mix(in srgb, var(--id-color-danger-text) 8%, transparent);
}

.dsl-step-editor__diagnostics-header h3 {
  margin: 0;
  font-size: 1rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.dsl-step-editor__diagnostics-header p {
  margin: var(--id-space-1) 0 0;
  color: var(--id-color-text-muted);
}

.dsl-step-editor__diagnostics-icon {
  display: inline-grid;
  flex: 0 0 auto;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border: 1px solid
    color-mix(in srgb, var(--id-color-danger-text) 50%, transparent);
  border-radius: var(--id-radius-medium);
  color: var(--id-color-danger-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 800;
  background: color-mix(in srgb, var(--id-color-danger-text) 14%, transparent);
}

.dsl-step-editor__completions ul,
.dsl-step-editor__diagnostics ul {
  display: grid;
  gap: var(--id-space-2);
  margin: 0;
}

.dsl-step-editor__completions ul {
  padding-inline-start: var(--id-space-5);
}

.dsl-step-editor__diagnostics ul {
  padding: var(--id-space-4);
}

.dsl-step-editor__completions li {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-2);
  align-items: center;
}

.dsl-step-editor__diagnostics li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--id-space-3);
  align-items: start;
  padding: var(--id-space-3);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  background: color-mix(in srgb, var(--id-color-surface) 82%, transparent);
  list-style: none;
}

.dsl-step-editor__diagnostic-marker {
  min-width: 3rem;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
  font-weight: 800;
  line-height: 1;
  text-align: center;
}

.dsl-step-editor__diagnostic-content {
  display: grid;
  gap: var(--id-space-2);
  min-width: 0;
}

.dsl-step-editor__diagnostic-title-row,
.dsl-step-editor__diagnostic-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-2);
  align-items: center;
}

.dsl-step-editor__diagnostic-title-row strong {
  color: var(--id-color-text);
}

.dsl-step-editor__diagnostic-title-row code {
  padding: 0.2rem 0.45rem;
  border: 1px solid var(--id-color-border);
  border-radius: 999px;
  color: var(--id-color-text-muted);
  background: var(--id-color-surface);
}

.dsl-step-editor__diagnostic-meta {
  color: var(--id-color-text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.82rem;
}

.dsl-step-editor__diagnostic-content p {
  margin: 0;
}

.dsl-step-editor__diagnostic--error {
  color: var(--id-color-danger-text);
}

.dsl-step-editor__diagnostic--error .dsl-step-editor__diagnostic-marker {
  color: var(--id-color-danger-text);
  background: color-mix(in srgb, var(--id-color-danger-text) 18%, transparent);
}

.dsl-step-editor__diagnostic--warning {
  color: var(--id-color-warning-text);
}

.dsl-step-editor__diagnostic--warning .dsl-step-editor__diagnostic-marker {
  color: var(--id-color-warning-text);
  background: color-mix(in srgb, var(--id-color-warning-text) 18%, transparent);
}
</style>
