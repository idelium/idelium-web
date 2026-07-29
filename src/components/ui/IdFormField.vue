<template>
  <div :class="['id-form-field', { 'id-form-field--invalid': invalid }]">
    <label :for="inputId" class="id-form-field__label">
      {{ label }}
      <span v-if="required" class="id-form-field__required" aria-hidden="true"
        >*</span
      >
      <span v-else-if="optionalLabel" class="id-form-field__optional">
        {{ optionalLabel }}
      </span>
    </label>
    <slot
      :described-by="describedBy"
      :input-id="inputId"
      :invalid="invalid"
    ></slot>
    <p v-if="helperText" :id="helperId" class="id-form-field__helper">
      {{ helperText }}
    </p>
    <p v-if="error" :id="errorId" class="id-form-field__error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<script>
let fieldSequence = 0;

export default {
  name: "IdFormField",
  props: {
    error: {
      type: String,
      default: "",
    },
    helperText: {
      type: String,
      default: "",
    },
    id: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      required: true,
    },
    optionalLabel: {
      type: String,
      default: "",
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    fieldSequence += 1;
    return {
      generatedId: `id-field-${fieldSequence}`,
    };
  },
  computed: {
    inputId() {
      return this.id || this.generatedId;
    },
    helperId() {
      return `${this.inputId}-helper`;
    },
    errorId() {
      return `${this.inputId}-error`;
    },
    invalid() {
      return Boolean(this.error);
    },
    describedBy() {
      return [
        this.helperText ? this.helperId : "",
        this.error ? this.errorId : "",
      ]
        .filter(Boolean)
        .join(" ");
    },
  },
};
</script>
