<template>
  <section
    :aria-busy="type === 'loading' ? 'true' : undefined"
    :class="['id-feedback-state', `id-feedback-state--${type}`]"
    :role="isError ? 'alert' : 'status'"
  >
    <slot name="icon"></slot>
    <h2 class="id-feedback-state__title">{{ title }}</h2>
    <p v-if="message" class="id-feedback-state__message">{{ message }}</p>
    <IdButton
      v-if="actionLabel"
      :variant="isError ? 'primary' : 'secondary'"
      v-on:click="$emit('action')"
    >
      {{ actionLabel }}
    </IdButton>
  </section>
</template>

<script>
import IdButton from "./IdButton.vue";

const SUPPORTED_TYPES = [
  "loading",
  "empty",
  "no-results",
  "error",
  "permission",
  "stale",
];

export default {
  name: "IdFeedbackState",
  components: {
    IdButton,
  },
  emits: ["action"],
  props: {
    actionLabel: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "empty",
      validator: (value) => SUPPORTED_TYPES.includes(value),
    },
  },
  computed: {
    isError() {
      return ["error", "permission"].includes(this.type);
    },
  },
};
</script>
