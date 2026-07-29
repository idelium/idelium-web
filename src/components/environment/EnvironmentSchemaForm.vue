<template>
  <form class="environment-schema-form" novalidate v-on:submit.prevent="save">
    <section
      class="environment-schema-form__section"
      :aria-labelledby="`${formId}-identity-title`"
    >
      <h2 :id="`${formId}-identity-title`">{{ copy.sections.identity }}</h2>
      <IdFormField
        :id="`${formId}-name`"
        :label="copy.fields.name.label"
        :helper-text="copy.fields.name.help"
        :required="true"
        :error="fieldError('identity.name')"
      >
        <template v-slot="{ inputId, describedBy, invalid }">
          <input
            :id="inputId"
            type="text"
            :value="draft.identity.name"
            :aria-describedby="describedBy || undefined"
            :aria-invalid="invalid"
            v-on:input="updateIdentity('name', $event.target.value)"
          />
        </template>
      </IdFormField>
      <IdFormField
        :id="`${formId}-description`"
        :label="copy.fields.description.label"
        :helper-text="copy.fields.description.help"
        :optional-label="copy.optional"
      >
        <template v-slot="{ inputId, describedBy }">
          <textarea
            :id="inputId"
            :value="draft.identity.description"
            :aria-describedby="describedBy || undefined"
            v-on:input="updateIdentity('description', $event.target.value)"
          ></textarea>
        </template>
      </IdFormField>
    </section>

    <section
      class="environment-schema-form__section"
      :aria-labelledby="`${formId}-runtime-title`"
    >
      <h2 :id="`${formId}-runtime-title`">{{ copy.sections.runtime }}</h2>
      <IdFormField
        :id="`${formId}-type`"
        :label="copy.fields.type.label"
        :helper-text="copy.fields.type.help"
        :required="true"
      >
        <template v-slot="{ inputId, describedBy }">
          <select
            :id="inputId"
            :value="draft.type"
            :aria-describedby="describedBy || undefined"
            v-on:change="requestTypeChange($event.target.value)"
          >
            <option v-for="type in types" v-bind:key="type" :value="type">
              {{ typeLabel(type) }}
            </option>
          </select>
        </template>
      </IdFormField>
    </section>

    <section
      v-for="section in activeSchema.sections"
      v-bind:key="section.id"
      class="environment-schema-form__section"
      :aria-labelledby="`${formId}-${section.id}-title`"
    >
      <header>
        <h2 :id="`${formId}-${section.id}-title`">
          {{ sectionLabel(section.id) }}
        </h2>
        <span v-if="sectionErrorCount(section.id) > 0" role="status">
          {{
            format(copy.sectionErrors, {
              count: sectionErrorCount(section.id),
            })
          }}
        </span>
      </header>
      <IdFormField
        v-for="field in section.fields"
        v-bind:key="field.name"
        :id="`${formId}-${safeDomId(field.name)}`"
        :label="fieldLabel(field.name)"
        :helper-text="fieldHelp(field.name)"
        :required="field.required"
        :optional-label="copy.optional"
        :error="fieldError(`config.${field.name}`)"
      >
        <template v-slot="{ inputId, describedBy, invalid }">
          <select
            v-if="field.control === 'enum'"
            :id="inputId"
            :value="draft.config[field.name]"
            :aria-describedby="describedBy || undefined"
            :aria-invalid="invalid"
            v-on:change="updateConfig(field.name, $event.target.value)"
          >
            <option
              v-for="option in field.enum"
              v-bind:key="option"
              :value="option"
            >
              {{ option }}
            </option>
          </select>
          <input
            v-else-if="field.control === 'boolean'"
            :id="inputId"
            type="checkbox"
            :checked="draft.config[field.name] === true"
            :aria-describedby="describedBy || undefined"
            :aria-invalid="invalid"
            v-on:change="updateConfig(field.name, $event.target.checked)"
          />
          <input
            v-else
            :id="inputId"
            :type="field.control === 'integer' ? 'number' : 'text'"
            :value="draft.config[field.name] ?? ''"
            :min="field.minimum ?? undefined"
            :max="field.maximum ?? undefined"
            :aria-describedby="describedBy || undefined"
            :aria-invalid="invalid"
            v-on:input="updateConfig(field.name, $event.target.value)"
          />
        </template>
      </IdFormField>
    </section>

    <section
      v-if="activeSchema.capabilities.variables"
      class="environment-schema-form__section"
      :aria-labelledby="`${formId}-variables-title`"
    >
      <h2 :id="`${formId}-variables-title`">{{ copy.sections.variables }}</h2>
      <slot name="variables" :model="draft"></slot>
    </section>

    <section
      v-if="activeSchema.capabilities.secretReferences"
      class="environment-schema-form__section"
      :aria-labelledby="`${formId}-secrets-title`"
    >
      <h2 :id="`${formId}-secrets-title`">{{ copy.sections.secrets }}</h2>
      <slot name="secrets" :model="draft"></slot>
    </section>

    <details class="environment-schema-form__advanced">
      <summary>{{ copy.sections.advanced }}</summary>
      <p>{{ copy.advancedDescription }}</p>
      <label :for="`${formId}-advanced-source`">
        {{ copy.advancedLabel }}
      </label>
      <textarea
        :id="`${formId}-advanced-source`"
        v-model="advancedSource"
        spellcheck="false"
      ></textarea>
      <p v-if="advancedError" role="alert">{{ advancedError }}</p>
      <button type="button" v-on:click="applyAdvanced">
        {{ copy.applyAdvanced }}
      </button>
    </details>

    <aside
      v-if="pendingTypeChange != null"
      class="environment-schema-form__type-warning"
      role="alertdialog"
      :aria-labelledby="`${formId}-type-warning-title`"
    >
      <h2 :id="`${formId}-type-warning-title`">
        {{ copy.typeChangeTitle }}
      </h2>
      <p>{{ copy.typeChangeDescription }}</p>
      <ul>
        <li
          v-for="diagnostic in pendingTypeChange.plan.incompatible"
          v-bind:key="diagnostic.path"
        >
          {{ diagnostic.path }}
        </li>
      </ul>
      <button type="button" v-on:click="cancelTypeChange">
        {{ copy.cancel }}
      </button>
      <button type="button" v-on:click="confirmTypeChange">
        {{ copy.confirmTypeChange }}
      </button>
    </aside>

    <footer class="environment-schema-form__save">
      <span aria-live="polite">
        {{
          diagnostics.length === 0
            ? copy.valid
            : format(copy.formErrors, { count: diagnostics.length })
        }}
      </span>
      <button type="submit" :disabled="diagnostics.length > 0 || saving">
        {{ saving ? copy.saving : copy.save }}
      </button>
    </footer>
  </form>
</template>

<script>
import IdFormField from "@/components/ui/IdFormField.vue";
import {
  applyEnvironmentTypeChange,
  environmentTypeChangePlan,
  validateEnvironmentForm,
} from "@/domain/environmentForm";

let formSequence = 0;
const SENSITIVE_KEY =
  /(authorization|cookie|credential|password|secret|session|token)/i;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export default {
  name: "EnvironmentSchemaForm",
  components: { IdFormField },
  emits: ["save", "update:modelValue"],
  props: {
    copy: { type: Object, required: true },
    modelValue: { type: Object, required: true },
    saving: { type: Boolean, default: false },
    schemas: { type: Object, required: true },
  },
  data() {
    formSequence += 1;
    const draft = clone(this.modelValue);
    return {
      advancedError: "",
      advancedSource: JSON.stringify(redactAdvanced(draft.config), null, 2),
      draft,
      formId: `environment-schema-form-${formSequence}`,
      pendingTypeChange: null,
    };
  },
  computed: {
    activeSchema() {
      return this.schemas[this.draft.type];
    },
    diagnostics() {
      return validateEnvironmentForm(this.draft, this.activeSchema);
    },
    types() {
      return Object.keys(this.schemas);
    },
  },
  methods: {
    applyAdvanced() {
      try {
        const parsed = JSON.parse(this.advancedSource);
        if (
          parsed == null ||
          typeof parsed !== "object" ||
          Array.isArray(parsed)
        ) {
          throw new Error("invalid");
        }
        this.advancedError = "";
        this.draft.config = clone(parsed);
        this.emitModel();
      } catch {
        this.advancedError = this.copy.validation.json;
      }
    },
    cancelTypeChange() {
      this.pendingTypeChange = null;
    },
    confirmTypeChange() {
      const change = applyEnvironmentTypeChange(
        this.draft.config,
        this.schemas[this.pendingTypeChange.type],
      );
      this.draft.type = this.pendingTypeChange.type;
      this.draft.config = change.config;
      this.pendingTypeChange = null;
      this.advancedSource = JSON.stringify(
        redactAdvanced(this.draft.config),
        null,
        2,
      );
      this.emitModel();
    },
    emitModel() {
      this.$emit("update:modelValue", clone(this.draft));
    },
    fieldError(path) {
      const diagnostic = this.diagnostics.find((entry) => entry.path === path);
      if (diagnostic == null) return "";
      return this.copy.validation[
        diagnostic.code.replace("environmentForm.", "")
      ];
    },
    fieldHelp(name) {
      return this.copy.fields[name]?.help || "";
    },
    fieldLabel(name) {
      return this.copy.fields[name]?.label || name;
    },
    format(template, values) {
      return Object.entries(values).reduce(
        (message, [key, value]) =>
          message.replaceAll(`{${key}}`, String(value)),
        template,
      );
    },
    requestTypeChange(type) {
      if (type === this.draft.type) return;
      const plan = environmentTypeChangePlan(
        this.draft.config,
        this.schemas[type],
      );
      if (plan.requiresConfirmation) {
        this.pendingTypeChange = { plan, type };
        return;
      }
      this.pendingTypeChange = { plan, type };
      this.confirmTypeChange();
    },
    safeDomId(value) {
      return String(value).replace(/[^a-zA-Z0-9_-]/g, "-");
    },
    save() {
      if (this.diagnostics.length > 0 || this.saving) return;
      this.$emit("save", clone(this.draft));
    },
    sectionErrorCount(section) {
      return this.diagnostics.filter(
        (diagnostic) => diagnostic.section === section,
      ).length;
    },
    sectionLabel(section) {
      return this.copy.schemaSections[section] || section;
    },
    typeLabel(type) {
      return this.copy.types[type] || type;
    },
    updateConfig(name, value) {
      this.draft.config[name] = value;
      this.advancedSource = JSON.stringify(
        redactAdvanced(this.draft.config),
        null,
        2,
      );
      this.emitModel();
    },
    updateIdentity(name, value) {
      this.draft.identity[name] = value;
      this.emitModel();
    },
  },
};

function redactAdvanced(config) {
  return Object.fromEntries(
    Object.entries(config ?? {}).map(([key, value]) => [
      key,
      SENSITIVE_KEY.test(key) && !key.toLowerCase().endsWith("ref")
        ? "[REDACTED]"
        : value,
    ]),
  );
}
</script>

<style scoped>
.environment-schema-form {
  display: grid;
  gap: var(--id-space-5);
  min-width: 0;
  padding-bottom: 5rem;
}

.environment-schema-form__section,
.environment-schema-form__advanced,
.environment-schema-form__type-warning {
  display: grid;
  gap: var(--id-space-4);
  padding: var(--id-space-4);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  background: var(--id-color-surface-raised);
}

.environment-schema-form__section header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
  justify-content: space-between;
}

.environment-schema-form h2,
.environment-schema-form p {
  margin: 0;
}

.environment-schema-form input:not([type="checkbox"]),
.environment-schema-form select,
.environment-schema-form textarea {
  width: 100%;
}

.environment-schema-form__advanced textarea {
  min-height: 14rem;
  font-family: var(--id-font-mono);
}

.environment-schema-form__type-warning {
  border-color: var(--id-color-warning);
  color: var(--id-color-warning-text);
}

.environment-schema-form__save {
  position: sticky;
  bottom: var(--id-space-3);
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
  align-items: center;
  justify-content: space-between;
  padding: var(--id-space-3);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  background: var(--id-color-surface);
  box-shadow: var(--id-shadow-raised);
}

@media (max-width: 40rem) {
  .environment-schema-form {
    gap: var(--id-space-3);
  }

  .environment-schema-form__section,
  .environment-schema-form__advanced {
    padding: var(--id-space-3);
  }
}
</style>
