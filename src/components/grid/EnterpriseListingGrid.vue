<template>
  <div class="enterprise-listing-grid">
    <EnterpriseDataTable
      :accessible-label="accessibleLabel"
      :actions="actions"
      :capabilities="capabilities"
      :columns="columns"
      :copy="tableCopy"
      :error="error"
      :has-active-filters="hasActiveFilters"
      :loading="loading"
      :meta="meta"
      :permission-denied="permissionDenied"
      :rows="rows"
      :row-key="rowKey"
      :sort="sort"
      v-on:action="$emit('action', $event)"
      v-on:clear-filters="$emit('clear-filters')"
      v-on:create="$emit('create')"
      v-on:retry="$emit('retry')"
      v-on:row-activate="$emit('row-activate', $event)"
      v-on:sort="$emit('sort', $event)"
    >
      <template #toolbar>
        <label class="enterprise-listing-grid__search">
          <span>{{ listingCopy.searchLabel }}</span>
          <input
            :value="search"
            type="search"
            :placeholder="listingCopy.searchPlaceholder"
            v-on:input="updateSearch"
          />
        </label>
        <slot name="toolbar"></slot>
      </template>
    </EnterpriseDataTable>

    <nav
      class="enterprise-listing-grid__pagination"
      :aria-label="listingCopy.paginationLabel"
    >
      <IdButton
        variant="secondary"
        :disabled="loading || !meta.hasPreviousPage"
        v-on:click="$emit('page-change', currentPage - 1)"
      >
        {{ listingCopy.previousPage }}
      </IdButton>
      <span>{{ pageStatus }}</span>
      <IdButton
        variant="secondary"
        :disabled="loading || !meta.hasNextPage"
        v-on:click="$emit('page-change', currentPage + 1)"
      >
        {{ listingCopy.nextPage }}
      </IdButton>
    </nav>
  </div>
</template>

<script>
import EnterpriseDataTable from "@/components/grid/EnterpriseDataTable.vue";
import IdButton from "@/components/ui/IdButton.vue";

export default {
  name: "EnterpriseListingGrid",
  components: { EnterpriseDataTable, IdButton },
  emits: [
    "action",
    "clear-filters",
    "create",
    "page-change",
    "retry",
    "row-activate",
    "search",
    "sort",
    "update:search",
  ],
  props: {
    accessibleLabel: { type: String, required: true },
    actions: { type: Array, default: () => [] },
    capabilities: { type: Array, default: () => [] },
    columns: { type: Array, required: true },
    error: { type: [Error, Object, String], default: null },
    hasActiveFilters: { type: Boolean, default: false },
    listingCopy: { type: Object, required: true },
    loading: { type: Boolean, default: false },
    meta: { type: Object, default: () => ({}) },
    permissionDenied: { type: Boolean, default: false },
    rowKey: { type: [String, Function], default: "id" },
    rows: { type: Array, default: () => [] },
    search: { type: String, default: "" },
    sort: { type: Object, default: null },
    tableCopy: { type: Object, required: true },
  },
  computed: {
    currentPage() {
      return Math.max(Number(this.meta.page) || 1, 1);
    },
    lastPage() {
      return Math.max(Number(this.meta.lastPage) || 1, 1);
    },
    pageStatus() {
      return String(this.listingCopy.pageStatus)
        .replace("{page}", String(this.currentPage))
        .replace("{pages}", String(this.lastPage));
    },
  },
  methods: {
    updateSearch(event) {
      const value = event.target.value;
      this.$emit("update:search", value);
      this.$emit("search", value);
    },
  },
};
</script>

<style scoped>
.enterprise-listing-grid {
  display: grid;
  gap: var(--id-space-4);
  min-width: 0;
}

.enterprise-listing-grid__search {
  display: grid;
  gap: var(--id-space-2);
  max-width: 30rem;
  width: 100%;
}

.enterprise-listing-grid__search input {
  background: var(--id-color-surface);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  color: var(--id-color-text);
  min-height: var(--id-control-min-size);
  padding: 0 var(--id-space-3);
}

.enterprise-listing-grid__pagination {
  align-items: center;
  display: flex;
  gap: var(--id-space-3);
  justify-content: flex-end;
}

@media (max-width: 48rem) {
  .enterprise-listing-grid__pagination {
    justify-content: space-between;
  }
}
</style>
