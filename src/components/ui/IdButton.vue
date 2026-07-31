<template>
  <button
    :aria-busy="loading ? 'true' : undefined"
    :aria-label="iconOnly ? accessibleLabel : undefined"
    :class="buttonClasses"
    :disabled="disabled || loading"
    :title="tooltip || undefined"
    :type="type"
    v-on:click="handleClick"
  >
    <span v-if="loading" class="id-button__spinner" aria-hidden="true"></span>
    <slot name="icon"></slot>
    <span v-if="!iconOnly"><slot></slot></span>
  </button>
</template>

<script>
const SUPPORTED_VARIANTS = [
  "primary",
  "secondary",
  "ghost",
  "warning",
  "danger",
];

export default {
  name: "IdButton",
  emits: ["click"],
  props: {
    accessibleLabel: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    iconOnly: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: "button",
    },
    tooltip: {
      type: String,
      default: "",
    },
    variant: {
      type: String,
      default: "secondary",
      validator: (value) => SUPPORTED_VARIANTS.includes(value),
    },
  },
  computed: {
    buttonClasses() {
      return [
        "id-button",
        `id-button--${this.variant}`,
        { "id-button--icon": this.iconOnly },
      ];
    },
  },
  methods: {
    handleClick(event) {
      if (!this.disabled && !this.loading) {
        this.$emit("click", event);
      }
    },
  },
};
</script>
