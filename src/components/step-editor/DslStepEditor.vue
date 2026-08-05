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
      <h3>{{ copy.diagnostics }}</h3>
      <ul>
        <li
          v-for="diagnostic in diagnostics"
          v-bind:key="diagnosticKey(diagnostic)"
          :class="`dsl-step-editor__diagnostic--${diagnostic.severity}`"
        >
          <strong>{{ diagnosticMessage(diagnostic.code) }}</strong>
          <span>{{ diagnostic.code }}</span>
          <span>
            {{
              format(copy.location, {
                column: diagnostic.column,
                line: diagnostic.line,
              })
            }}
          </span>
          <span>{{ remediationMessage(diagnostic.code) }}</span>
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

.dsl-step-editor__completions,
.dsl-step-editor__diagnostics {
  display: grid;
  gap: var(--id-space-3);
  padding: var(--id-space-4);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  background: var(--id-color-surface-raised);
}

.dsl-step-editor__completions ul,
.dsl-step-editor__diagnostics ul {
  display: grid;
  gap: var(--id-space-2);
  margin: 0;
  padding-inline-start: var(--id-space-5);
}

.dsl-step-editor__completions li {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-2);
  align-items: center;
}

.dsl-step-editor__diagnostics li {
  display: grid;
  gap: var(--id-space-1);
}

.dsl-step-editor__diagnostic--error {
  color: var(--id-color-danger-text);
}

.dsl-step-editor__diagnostic--warning {
  color: var(--id-color-warning-text);
}
</style>
