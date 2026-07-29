<template>
  <section class="id-context-switcher" :aria-label="labels.activeContext">
    <div v-if="normalizedProjects.length" class="id-context-switcher__field">
      <span :id="projectLabelId" class="id-context-switcher__label">
        {{ labels.project }}
      </span>
      <v-select
        :aria-labelledby="projectLabelId"
        :clearable="false"
        :disabled="disabled"
        :model-value="projectId"
        :options="normalizedProjects"
        :reduce="(option) => option.id"
        label="label"
        v-on:update:model-value="$emit('update:projectId', $event)"
      />
    </div>

    <div v-if="normalizedCustomers.length" class="id-context-switcher__field">
      <span :id="customerLabelId" class="id-context-switcher__label">
        {{ labels.customer }}
      </span>
      <v-select
        :aria-labelledby="customerLabelId"
        :clearable="false"
        :disabled="disabled"
        :model-value="customerId"
        :options="normalizedCustomers"
        :reduce="(option) => option.id"
        label="label"
        v-on:update:model-value="$emit('update:customerId', $event)"
      />
    </div>

    <IdButton
      v-if="normalizedCustomers.length"
      :disabled="disabled || !customerId"
      variant="secondary"
      v-on:click="$emit('applyCustomer', customerId)"
    >
      {{ labels.switchCustomer }}
    </IdButton>
  </section>
</template>

<script>
import vSelect from "vue-select";
import IdButton from "@/components/ui/IdButton.vue";

let contextSwitcherSequence = 0;

export default {
  name: "ContextSwitcher",
  components: {
    IdButton,
    vSelect,
  },
  emits: ["applyCustomer", "update:customerId", "update:projectId"],
  props: {
    customerId: {
      type: [Number, String],
      default: null,
    },
    customers: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    labels: {
      type: Object,
      required: true,
    },
    projectId: {
      type: [Number, String],
      default: null,
    },
    projects: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    contextSwitcherSequence += 1;
    return {
      instanceId: contextSwitcherSequence,
    };
  },
  computed: {
    customerLabelId() {
      return `id-context-customer-${this.instanceId}`;
    },
    normalizedCustomers() {
      return this.customers.map((customer) => ({
        ...customer,
        label: customer.costumer || customer.name || String(customer.id),
      }));
    },
    normalizedProjects() {
      return this.projects.map((project) => ({
        ...project,
        label: project.name || project.project || String(project.id),
      }));
    },
    projectLabelId() {
      return `id-context-project-${this.instanceId}`;
    },
  },
};
</script>

<style scoped>
.id-context-switcher {
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  gap: var(--id-space-3);
  min-width: 0;
}

.id-context-switcher__field {
  align-items: center;
  background: var(--id-color-surface);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-pill);
  display: flex;
  gap: var(--id-space-2);
  min-width: 13rem;
  padding: var(--id-space-1) var(--id-space-2) var(--id-space-1)
    var(--id-space-3);
}

.id-context-switcher__label {
  color: var(--id-color-text-subtle);
  flex: 0 0 auto;
  font-size: var(--id-font-size-caption);
  font-weight: var(--id-font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.id-context-switcher :deep(.v-select) {
  flex: 1 1 auto;
  min-width: 8rem;
}

.id-context-switcher :deep(.vs__dropdown-toggle) {
  background: var(--id-color-surface-raised);
  border: 0;
  border-radius: var(--id-radius-pill);
  min-height: 2.25rem;
}

.id-context-switcher :deep(.vs__selected),
.id-context-switcher :deep(.vs__search),
.id-context-switcher :deep(.vs__open-indicator) {
  color: var(--id-color-text);
}

@media (max-width: 980px) {
  .id-context-switcher {
    align-items: stretch;
    flex-direction: column;
  }

  .id-context-switcher__field {
    min-width: 100%;
  }
}
</style>
