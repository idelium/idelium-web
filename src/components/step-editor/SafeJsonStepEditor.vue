<template>
  <section class="safe-json-editor" :aria-label="copy.accessibleLabel">
    <header>
      <div>
        <h2>{{ copy.title }}</h2>
        <p>{{ copy.description }}</p>
      </div>
      <div class="safe-json-editor__actions">
        <button type="button" v-on:click="formatSource">
          {{ copy.format }}
        </button>
        <button type="button" :disabled="!canApply" v-on:click="applySource">
          {{ copy.apply }}
        </button>
      </div>
    </header>

    <label :for="editorId" class="visually-hidden">{{
      copy.editorLabel
    }}</label>
    <VAceEditor
      :id="editorId"
      v-model:value="source"
      class="safe-json-editor__source"
      lang="json"
      theme="chrome"
      :aria-label="copy.editorLabel"
      :options="editorOptions"
    />

    <p class="safe-json-editor__size">
      {{ format(copy.sourceSize, { count: sourceBytes }) }}
    </p>

    <section
      v-if="analysis.diagnostics.length > 0"
      class="safe-json-editor__diagnostics"
      :aria-label="copy.diagnostics"
      role="alert"
    >
      <h3>{{ copy.diagnostics }}</h3>
      <ul>
        <li
          v-for="diagnostic in analysis.diagnostics"
          v-bind:key="diagnosticKey(diagnostic)"
        >
          <strong>{{ diagnosticMessage(diagnostic) }}</strong>
          <span>
            {{
              format(copy.location, {
                column: diagnostic.column,
                line: diagnostic.line,
                path: diagnostic.path,
              })
            }}
          </span>
          <span>{{ remediationMessage(diagnostic) }}</span>
        </li>
      </ul>
    </section>
    <p v-else class="safe-json-editor__valid" aria-live="polite">
      {{ canApply ? copy.readyToApply : copy.valid }}
    </p>
  </section>
</template>

<script>
import { VAceEditor } from "vue3-ace-editor";

import {
  MAX_JSON_SOURCE_BYTES,
  analyzeJsonSource,
  formatJsonSource,
} from "@/domain/safeJsonEditor";

let editorSequence = 0;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export default {
  name: "SafeJsonStepEditor",
  components: { VAceEditor },
  emits: ["apply", "update:modelValue"],
  props: {
    copy: { type: Object, required: true },
    modelValue: { type: [Array, Object], required: true },
    validateModel: { type: Function, default: null },
  },
  data() {
    editorSequence += 1;
    return {
      editorId: `safe-json-editor-${editorSequence}`,
      lastValidModel: clone(this.modelValue),
      source: JSON.stringify(this.modelValue, null, 2),
    };
  },
  computed: {
    analysis() {
      return analyzeJsonSource(this.source, {
        validate: this.validateModel,
      });
    },
    canApply() {
      return (
        this.analysis.valid &&
        JSON.stringify(this.analysis.value) !== JSON.stringify(this.modelValue)
      );
    },
    editorOptions() {
      return {
        displayIndentGuides: true,
        maxLines: 40,
        minLines: 12,
        printMargin: false,
        showGutter: true,
        showLineNumbers: true,
        tabSize: 2,
        useSoftTabs: true,
      };
    },
    sourceBytes() {
      return new TextEncoder().encode(this.source).length;
    },
  },
  watch: {
    analysis: {
      deep: true,
      handler(value) {
        if (value.valid) this.lastValidModel = clone(value.value);
      },
    },
    modelValue: {
      deep: true,
      handler(value) {
        const serialized = JSON.stringify(value, null, 2);
        if (JSON.stringify(value) === JSON.stringify(this.analysis.value)) {
          return;
        }
        this.lastValidModel = clone(value);
        this.source = serialized;
      },
    },
  },
  methods: {
    applySource() {
      if (!this.canApply) return;
      const value = clone(this.analysis.value);
      this.lastValidModel = value;
      this.$emit("update:modelValue", value);
      this.$emit("apply", value);
    },
    diagnosticKey(diagnostic) {
      return [
        diagnostic.code,
        diagnostic.path,
        diagnostic.line,
        diagnostic.column,
      ].join(":");
    },
    diagnosticMessage(diagnostic) {
      const key = diagnostic.code.replace("stepEditor.json.", "");
      return this.copy.validation[key] || this.copy.validation.schema;
    },
    format(template, values) {
      return Object.entries(values).reduce(
        (message, [key, value]) =>
          message.replaceAll(`{${key}}`, String(value)),
        template,
      );
    },
    formatSource() {
      const result = formatJsonSource(this.source);
      if (result.source !== this.source) this.source = result.source;
    },
    remediationMessage(diagnostic) {
      const key = diagnostic.remediationKey.replace(
        "StepEditor.json.remediation.",
        "",
      );
      return this.copy.remediation[key] || this.copy.remediation.schema;
    },
  },
};

export { MAX_JSON_SOURCE_BYTES };
</script>

<style scoped>
.safe-json-editor {
  display: grid;
  gap: var(--id-space-4);
  min-width: 0;
}

.safe-json-editor header,
.safe-json-editor__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
  align-items: center;
  justify-content: space-between;
}

.safe-json-editor h2,
.safe-json-editor p {
  margin: 0;
}

.safe-json-editor__source {
  width: 100%;
  min-height: min(24rem, 55dvh);
  max-height: min(42rem, 70dvh);
  overflow: auto;
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
}

.safe-json-editor__diagnostics {
  display: grid;
  gap: var(--id-space-3);
  padding: var(--id-space-4);
  color: var(--id-color-danger-text);
  border: 1px solid var(--id-color-danger);
  border-radius: var(--id-radius-medium);
  background: var(--id-color-danger-surface);
}

.safe-json-editor__diagnostics ul,
.safe-json-editor__diagnostics li {
  display: grid;
  gap: var(--id-space-2);
}

.safe-json-editor__diagnostics ul {
  margin: 0;
  padding-inline-start: var(--id-space-5);
}

.safe-json-editor__valid {
  color: var(--id-color-success);
}

.safe-json-editor__size {
  color: var(--id-color-text-muted);
}
</style>
