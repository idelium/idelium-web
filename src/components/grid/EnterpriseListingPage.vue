<template>
  <section class="enterprise-listing-page">
    <header class="enterprise-listing-page__header">
      <div>
        <p class="enterprise-listing-page__eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <IdButton
        v-if="createLabel"
        variant="primary"
        v-on:click="$emit('create')"
      >
        {{ createLabel }}
      </IdButton>
      <slot name="actions"></slot>
    </header>
    <div class="enterprise-listing-page__panel">
      <slot></slot>
    </div>
  </section>
</template>

<script>
import IdButton from "@/components/ui/IdButton.vue";

export default {
  name: "EnterpriseListingPage",
  components: { IdButton },
  emits: ["create"],
  props: {
    createLabel: { type: String, default: "" },
    description: { type: String, required: true },
    eyebrow: { type: String, required: true },
    title: { type: String, required: true },
  },
};
</script>

<style scoped>
.enterprise-listing-page {
  display: grid;
  gap: var(--id-space-5);
  min-width: 0;
  padding: var(--id-space-5);
}

.enterprise-listing-page__header,
.enterprise-listing-page__panel {
  background: var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
}

.enterprise-listing-page__header {
  align-items: center;
  display: flex;
  gap: var(--id-space-4);
  justify-content: space-between;
  padding: var(--id-space-5);
}

.enterprise-listing-page__header h1,
.enterprise-listing-page__header p {
  margin: 0;
}

.enterprise-listing-page__eyebrow {
  color: var(--id-color-text-muted);
  font-size: var(--id-font-size-small);
  font-weight: var(--id-font-weight-bold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.enterprise-listing-page__panel {
  display: grid;
  gap: var(--id-space-4);
  padding: var(--id-space-5);
}

@media (max-width: 48rem) {
  .enterprise-listing-page {
    padding: var(--id-space-3);
  }

  .enterprise-listing-page__header {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
