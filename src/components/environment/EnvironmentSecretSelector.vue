<template>
  <section
    class="environment-secret-selector"
    :aria-labelledby="`${selectorId}-title`"
  >
    <header>
      <div>
        <h2 :id="`${selectorId}-title`">{{ copy.title }}</h2>
        <p>{{ copy.description }}</p>
      </div>
    </header>

    <label :for="`${selectorId}-select`">{{ copy.label }}</label>
    <select
      :id="`${selectorId}-select`"
      :value="modelValue"
      v-on:change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="">{{ copy.placeholder }}</option>
      <option
        v-for="reference in references"
        v-bind:key="reference.id"
        :value="reference.id"
        :disabled="reference.status !== 'active'"
      >
        {{ reference.name }} — {{ statusLabel(reference.status) }}
      </option>
    </select>

    <dl v-if="selectedReference != null">
      <div>
        <dt>{{ copy.metadata.name }}</dt>
        <dd>{{ selectedReference.name }}</dd>
      </div>
      <div>
        <dt>{{ copy.metadata.provider }}</dt>
        <dd>{{ selectedReference.provider }}</dd>
      </div>
      <div>
        <dt>{{ copy.metadata.scope }}</dt>
        <dd>{{ selectedReference.scope }}</dd>
      </div>
      <div>
        <dt>{{ copy.metadata.status }}</dt>
        <dd>{{ statusLabel(selectedReference.status) }}</dd>
      </div>
      <div>
        <dt>{{ copy.metadata.lastValidated }}</dt>
        <dd>{{ selectedReference.lastValidatedAt || copy.neverValidated }}</dd>
      </div>
    </dl>
    <p v-else-if="modelValue" role="alert">{{ copy.validation.unavailable }}</p>

    <button
      v-if="modelValue"
      type="button"
      class="environment-secret-selector__remove"
      v-on:click="requestRemoval"
    >
      {{ copy.remove }}
    </button>

    <div
      v-if="removalPending"
      class="environment-secret-selector__confirmation"
      role="alertdialog"
      :aria-labelledby="`${selectorId}-confirmation-title`"
      aria-modal="true"
    >
      <h3 :id="`${selectorId}-confirmation-title`">
        {{ copy.confirmation.title }}
      </h3>
      <p>
        {{
          format(copy.confirmation.description, {
            count: selectedReference?.usageCount || 0,
          })
        }}
      </p>
      <div>
        <button type="button" v-on:click="removalPending = false">
          {{ copy.confirmation.cancel }}
        </button>
        <button type="button" v-on:click="confirmRemoval">
          {{ copy.confirmation.confirm }}
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import { findSecretReference } from "@/domain/environmentSecrets";

let selectorSequence = 0;

export default {
  name: "EnvironmentSecretSelector",
  emits: ["remove", "update:modelValue"],
  props: {
    catalog: { type: Object, required: true },
    copy: { type: Object, required: true },
    modelValue: { type: String, default: "" },
  },
  data() {
    selectorSequence += 1;
    return {
      removalPending: false,
      selectorId: `environment-secret-selector-${selectorSequence}`,
    };
  },
  computed: {
    references() {
      return Array.isArray(this.catalog.references)
        ? this.catalog.references
        : [];
    },
    selectedReference() {
      return findSecretReference(this.catalog, this.modelValue).reference;
    },
  },
  methods: {
    confirmRemoval() {
      this.removalPending = false;
      this.$emit("update:modelValue", "");
      this.$emit("remove", this.modelValue);
    },
    format(template, values) {
      return Object.entries(values).reduce(
        (message, [key, value]) =>
          message.replaceAll(`{${key}}`, String(value)),
        template,
      );
    },
    requestRemoval() {
      if ((this.selectedReference?.usageCount ?? 0) > 0) {
        this.removalPending = true;
        return;
      }
      this.confirmRemoval();
    },
    statusLabel(status) {
      return this.copy.status[status] || this.copy.status.unavailable;
    },
  },
};
</script>

<style scoped>
.environment-secret-selector {
  display: grid;
  gap: var(--id-space-3);
  min-width: 0;
}

.environment-secret-selector h2,
.environment-secret-selector h3,
.environment-secret-selector p {
  margin: 0;
}

.environment-secret-selector select {
  width: 100%;
}

.environment-secret-selector dl {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
  gap: var(--id-space-3);
  margin: 0;
  padding: var(--id-space-3);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
}

.environment-secret-selector dl div {
  min-width: 0;
}

.environment-secret-selector dt {
  color: var(--id-color-text-muted);
  font-size: var(--id-font-size-caption);
}

.environment-secret-selector dd {
  margin: var(--id-space-1) 0 0;
  overflow-wrap: anywhere;
}

.environment-secret-selector__remove {
  justify-self: start;
  color: var(--id-color-danger);
}

.environment-secret-selector__confirmation {
  position: fixed;
  z-index: 1100;
  inset: 50% auto auto 50%;
  display: grid;
  width: min(32rem, calc(100vw - 2rem));
  gap: var(--id-space-4);
  padding: var(--id-space-5);
  border: 1px solid var(--id-color-border-strong);
  border-radius: var(--id-radius-large);
  background: var(--id-color-surface-raised);
  box-shadow: var(--id-shadow-dialog);
  transform: translate(-50%, -50%);
}

.environment-secret-selector__confirmation > div {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
  justify-content: flex-end;
}
</style>
