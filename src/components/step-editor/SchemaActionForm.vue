<template>
  <form class="schema-action-form" novalidate v-on:submit.prevent>
    <IdFormField
      v-for="field in visibleFields"
      v-bind:key="field.name"
      :id="`${formId}-${safeDomId(field.name)}`"
      :label="fieldLabel(field)"
      :helper-text="fieldHelp(field)"
      :required="field.required"
      :optional-label="copy.optional"
      :error="fieldError(field)"
    >
      <template v-slot="{ inputId, describedBy, invalid }">
        <select
          v-if="field.control === 'select'"
          :id="inputId"
          :value="model.values[field.name]"
          :aria-describedby="describedBy || undefined"
          :aria-invalid="invalid"
          v-on:change="updateField(field, $event.target.value)"
        >
          <option value="">{{ copy.selectPlaceholder }}</option>
          <option
            v-for="option in field.enum"
            v-bind:key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>

        <input
          v-else-if="field.control === 'checkbox'"
          :id="inputId"
          type="checkbox"
          :checked="model.values[field.name] === true"
          :aria-describedby="describedBy || undefined"
          :aria-invalid="invalid"
          v-on:change="updateField(field, $event.target.checked)"
        />

        <textarea
          v-else-if="field.control === 'json' || field.control === 'textarea'"
          :id="inputId"
          :value="displayValue(field)"
          :aria-describedby="describedBy || undefined"
          :aria-invalid="invalid"
          :spellcheck="field.control !== 'json'"
          v-on:input="updateField(field, $event.target.value)"
        ></textarea>

        <div
          v-else-if="field.control === 'locator'"
          class="schema-action-form__locator"
        >
          <select
            :id="inputId"
            :value="locatorValue(field).strategy"
            :aria-describedby="describedBy || undefined"
            :aria-invalid="invalid"
            :aria-label="copy.locatorStrategy"
            v-on:change="updateLocator(field, 'strategy', $event.target.value)"
          >
            <option
              v-for="strategy in copy.locatorStrategies"
              v-bind:key="strategy"
              :value="strategy"
            >
              {{ strategy }}
            </option>
          </select>
          <input
            type="text"
            :value="locatorValue(field).value"
            :aria-label="copy.locatorValue"
            :aria-describedby="describedBy || undefined"
            :aria-invalid="invalid"
            v-on:input="updateLocator(field, 'value', $event.target.value)"
          />
        </div>

        <div
          v-else-if="field.control === 'list'"
          class="schema-action-form__list"
        >
          <div
            v-for="(item, index) in listValue(field)"
            v-bind:key="index"
            class="schema-action-form__list-item"
          >
            <input
              :id="index === 0 ? inputId : undefined"
              :type="field.itemType"
              :value="item"
              :aria-label="
                format(copy.listItem, {
                  field: fieldLabel(field),
                  position: index + 1,
                })
              "
              :aria-describedby="describedBy || undefined"
              :aria-invalid="invalid"
              v-on:input="updateListItem(field, index, $event.target.value)"
            />
            <button
              type="button"
              :aria-label="format(copy.removeListItem, { position: index + 1 })"
              v-on:click="removeListItem(field, index)"
            >
              {{ copy.remove }}
            </button>
          </div>
          <button type="button" v-on:click="addListItem(field)">
            {{ copy.addListItem }}
          </button>
        </div>

        <input
          v-else
          :id="inputId"
          :type="field.control === 'number' ? 'number' : 'text'"
          :value="model.values[field.name] ?? ''"
          :min="field.minimum ?? undefined"
          :max="field.maximum ?? undefined"
          :maxlength="field.maxLength"
          :autocomplete="
            field.control === 'secret-reference' ? 'off' : undefined
          "
          :aria-describedby="describedBy || undefined"
          :aria-invalid="invalid"
          v-on:input="updateField(field, $event.target.value)"
        />
      </template>
    </IdFormField>

    <p class="schema-action-form__status" aria-live="polite">
      {{
        diagnostics.length === 0
          ? copy.validationReady
          : format(copy.validationErrors, { count: diagnostics.length })
      }}
    </p>
  </form>
</template>

<script>
import IdFormField from "@/components/ui/IdFormField.vue";
import {
  createSchemaFormModel,
  serializeSchemaForm,
  validateSchemaForm,
  visibleSchemaFields,
} from "@/domain/schemaActionForm";

let formSequence = 0;

export default {
  name: "SchemaActionForm",
  components: { IdFormField },
  emits: ["update:modelValue", "validation"],
  props: {
    action: { type: Object, required: true },
    actionIndex: { type: Number, default: 0 },
    copy: { type: Object, required: true },
    fieldCopy: { type: Object, default: () => ({}) },
    modelValue: { type: Object, default: () => ({}) },
  },
  data() {
    formSequence += 1;
    return {
      formId: `schema-action-form-${formSequence}`,
      model: createSchemaFormModel(
        this.action,
        this.modelValue,
        this.actionIndex,
      ),
    };
  },
  computed: {
    diagnostics() {
      return validateSchemaForm(this.model);
    },
    visibleFields() {
      return visibleSchemaFields(this.model);
    },
  },
  watch: {
    diagnostics: {
      deep: true,
      immediate: true,
      handler(value) {
        this.$emit("validation", value);
      },
    },
  },
  methods: {
    addListItem(field) {
      this.updateField(field, [...this.listValue(field), ""]);
    },
    displayValue(field) {
      const value = this.model.values[field.name];
      if (field.control === "json" && typeof value !== "string") {
        return JSON.stringify(value ?? {}, null, 2);
      }
      return value ?? "";
    },
    fieldError(field) {
      const diagnostic = this.diagnostics.find(
        (entry) => entry.field === field.name,
      );
      if (diagnostic == null) return "";
      return this.copy.validation[diagnostic.code.split(".").at(-1)];
    },
    fieldHelp(field) {
      return this.fieldCopy[field.name]?.help || "";
    },
    fieldLabel(field) {
      return this.fieldCopy[field.name]?.label || field.name;
    },
    format(template, values) {
      return Object.entries(values).reduce(
        (message, [key, value]) =>
          message.replaceAll(`{${key}}`, String(value)),
        template,
      );
    },
    listValue(field) {
      const value = this.model.values[field.name];
      return Array.isArray(value) ? value : [];
    },
    locatorValue(field) {
      const value = this.model.values[field.name];
      return value != null && typeof value === "object"
        ? value
        : { strategy: "css", value: "" };
    },
    removeListItem(field, index) {
      this.updateField(
        field,
        this.listValue(field).filter((_, position) => position !== index),
      );
    },
    safeDomId(value) {
      return String(value).replace(/[^a-zA-Z0-9_-]/g, "-");
    },
    updateField(field, value) {
      this.model.values[field.name] = value;
      this.emitModel();
    },
    updateListItem(field, index, value) {
      const list = [...this.listValue(field)];
      list[index] = field.itemType === "number" ? Number(value) : value;
      this.updateField(field, list);
    },
    updateLocator(field, property, value) {
      this.updateField(field, {
        ...this.locatorValue(field),
        [property]: value,
      });
    },
    emitModel() {
      this.$emit("update:modelValue", serializeSchemaForm(this.model));
      this.$emit("validation", this.diagnostics);
    },
  },
};
</script>

<style scoped>
.schema-action-form {
  display: grid;
  gap: var(--id-space-4);
  min-width: 0;
}

.schema-action-form input,
.schema-action-form select,
.schema-action-form textarea {
  width: 100%;
}

.schema-action-form textarea {
  min-height: 8rem;
  font-family: var(--id-font-mono);
}

.schema-action-form__locator,
.schema-action-form__list,
.schema-action-form__list-item {
  display: grid;
  gap: var(--id-space-2);
}

.schema-action-form__locator,
.schema-action-form__list-item {
  grid-template-columns: minmax(8rem, 0.4fr) minmax(0, 1fr);
}

.schema-action-form__status {
  margin: 0;
  color: var(--id-color-text-muted);
}

@media (max-width: 40rem) {
  .schema-action-form__locator,
  .schema-action-form__list-item {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
