<template>
  <section
    v-if="account"
    class="account-audit"
    :aria-labelledby="`${panelId}-title`"
  >
    <div class="account-audit__header">
      <div>
        <p class="account-audit__eyebrow">{{ copy.eyebrow }}</p>
        <h3 :id="`${panelId}-title`">{{ copy.title }}</h3>
        <p>{{ description }}</p>
      </div>
      <div class="account-audit__actions">
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="$emit('close')"
        >
          {{ copy.close }}
        </button>
        <button
          type="button"
          class="btn btn-warning btn-sm"
          :disabled="loading"
          @click="$emit('export')"
        >
          {{ copy.export }}
        </button>
      </div>
    </div>

    <div class="account-audit__filters" :aria-label="copy.filters">
      <label>
        <span>{{ copy.action }}</span>
        <select
          :value="filters.action"
          @change="updateFilter('action', $event.target.value)"
        >
          <option value="">{{ copy.all }}</option>
          <option value="invite">{{ copy.actions.invite }}</option>
          <option value="role-change">{{ copy.actions["role-change"] }}</option>
          <option value="suspend">{{ copy.actions.suspend }}</option>
          <option value="reactivate">{{ copy.actions.reactivate }}</option>
        </select>
      </label>
      <label>
        <span>{{ copy.outcome }}</span>
        <select
          :value="filters.outcome"
          @change="updateFilter('outcome', $event.target.value)"
        >
          <option value="">{{ copy.all }}</option>
          <option value="requested">{{ copy.outcomes.requested }}</option>
          <option value="success">{{ copy.outcomes.success }}</option>
          <option value="rejected">{{ copy.outcomes.rejected }}</option>
          <option value="failed">{{ copy.outcomes.failed }}</option>
        </select>
      </label>
    </div>

    <p v-if="error" class="account-audit__error" role="alert">
      {{ copy.safeFailure }}
    </p>
    <p v-else-if="loading" class="account-audit__empty">{{ copy.loading }}</p>
    <p v-else-if="events.length === 0" class="account-audit__empty">
      {{ copy.empty }}
    </p>

    <div v-else class="account-audit__table-wrap">
      <table class="account-audit__table">
        <thead>
          <tr>
            <th scope="col">{{ copy.timestamp }}</th>
            <th scope="col">{{ copy.actor }}</th>
            <th scope="col">{{ copy.action }}</th>
            <th scope="col">{{ copy.target }}</th>
            <th scope="col">{{ copy.outcome }}</th>
            <th scope="col">{{ copy.reason }}</th>
            <th scope="col">{{ copy.correlationId }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="event in events"
            :key="event.eventId || event.correlationId"
          >
            <td>{{ event.timestamp || "—" }}</td>
            <td>{{ event.actorId || "—" }}</td>
            <td>{{ event.action || "—" }}</td>
            <td>
              <span>{{ event.targetLabel || "—" }}</span>
              <small>{{ event.targetId }}</small>
            </td>
            <td>{{ event.outcome || "—" }}</td>
            <td>{{ event.reason || "—" }}</td>
            <td>{{ event.correlationId || "—" }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <nav class="account-audit__pagination" :aria-label="copy.pagination">
      <button
        type="button"
        class="btn btn-secondary btn-sm"
        :disabled="loading || !meta.hasPreviousPage"
        @click="$emit('page-change', currentPage - 1)"
      >
        {{ copy.previous }}
      </button>
      <span>{{ pageStatus }}</span>
      <button
        type="button"
        class="btn btn-secondary btn-sm"
        :disabled="loading || !meta.hasNextPage"
        @click="$emit('page-change', currentPage + 1)"
      >
        {{ copy.next }}
      </button>
    </nav>
  </section>
</template>

<script>
let panelSequence = 0;

export default {
  name: "AccountAuditHistory",
  emits: ["close", "export", "filter-change", "page-change"],
  props: {
    account: { type: Object, default: null },
    copy: { type: Object, required: true },
    error: { type: [Error, Object, String], default: null },
    events: { type: Array, default: () => [] },
    filters: { type: Object, default: () => ({ action: "", outcome: "" }) },
    loading: { type: Boolean, default: false },
    meta: { type: Object, default: () => ({}) },
  },
  data() {
    panelSequence += 1;
    return { panelId: `account-audit-${panelSequence}` };
  },
  computed: {
    currentPage() {
      return Math.max(Number(this.meta.page) || 1, 1);
    },
    description() {
      return String(this.copy.description)
        .replace(
          "{account}",
          this.account.email || this.account.account || this.account.name,
        )
        .replace("{accountId}", String(this.account.id || ""));
    },
    lastPage() {
      const pageSize = Math.max(Number(this.meta.pageSize) || 25, 1);
      return Math.max(Math.ceil((Number(this.meta.total) || 0) / pageSize), 1);
    },
    pageStatus() {
      return String(this.copy.pageStatus)
        .replace("{page}", String(this.currentPage))
        .replace("{pages}", String(this.lastPage));
    },
  },
  methods: {
    updateFilter(filter, value) {
      this.$emit("filter-change", { ...this.filters, [filter]: value });
    },
  },
};
</script>

<style scoped>
.account-audit {
  display: grid;
  gap: var(--id-space-4);
  padding: var(--id-space-5);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  background: var(--id-color-surface-raised);
  box-shadow: var(--id-shadow-soft);
}

.account-audit__header,
.account-audit__actions,
.account-audit__filters,
.account-audit__pagination {
  display: flex;
  gap: var(--id-space-3);
}

.account-audit__header {
  align-items: flex-start;
  justify-content: space-between;
}

.account-audit__eyebrow,
.account-audit h3,
.account-audit p {
  margin: 0;
}

.account-audit__eyebrow {
  color: var(--id-color-text-muted);
  font-size: var(--id-font-size-caption);
  font-weight: var(--id-font-weight-bold);
  text-transform: uppercase;
}

.account-audit__filters {
  flex-wrap: wrap;
}

.account-audit__filters label {
  display: grid;
  gap: var(--id-space-2);
  min-width: 14rem;
}

.account-audit__filters select {
  min-height: var(--id-control-min-size);
  padding: 0 var(--id-space-3);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  color: var(--id-color-text);
  background: var(--id-color-surface);
}

.account-audit__error,
.account-audit__empty {
  border: 1px dashed var(--id-color-border);
  border-radius: var(--id-radius-medium);
  padding: var(--id-space-4);
  color: var(--id-color-text-muted);
}

.account-audit__table-wrap {
  overflow-x: auto;
}

.account-audit__table {
  width: 100%;
  border-collapse: collapse;
}

.account-audit__table th,
.account-audit__table td {
  padding: var(--id-space-3);
  border-bottom: 1px solid var(--id-color-border);
  text-align: left;
  vertical-align: top;
}

.account-audit__table small {
  display: block;
  color: var(--id-color-text-muted);
}

.account-audit__pagination {
  align-items: center;
  justify-content: flex-end;
}

@media (max-width: 48rem) {
  .account-audit__header,
  .account-audit__pagination {
    flex-direction: column;
  }
}
</style>
