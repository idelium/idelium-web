<template>
  <EnterpriseListingGrid
    :accessible-label="accessibleLabel"
    :actions="actions"
    :columns="columns"
    :error="error"
    :has-active-filters="query.search !== ''"
    :listing-copy="copy"
    :loading="loading"
    :meta="meta"
    :rows="rows"
    :search="search"
    :sort="sort"
    :table-copy="tableCopy"
    v-on:action="$emit('action', $event)"
    v-on:clear-filters="$emit('clear-filters')"
    v-on:page-change="$emit('page-change', $event)"
    v-on:retry="$emit('retry')"
    v-on:row-activate="$emit('row-activate', $event)"
    v-on:search="$emit('search', $event)"
    v-on:sort="$emit('sort', $event)"
    v-on:update:search="$emit('update:search', $event)"
  />
</template>

<script>
import EnterpriseListingGrid from "@/components/grid/EnterpriseListingGrid.vue";

export default {
  name: "PlatformReferenceGrid",
  components: { EnterpriseListingGrid },
  emits: [
    "action",
    "clear-filters",
    "page-change",
    "retry",
    "row-activate",
    "search",
    "sort",
    "update:search",
  ],
  props: {
    accessibleLabel: { type: String, required: true },
    actions: { type: Array, required: true },
    columns: { type: Array, required: true },
    copy: { type: Object, required: true },
    error: { type: [Error, Object, String], default: null },
    loading: { type: Boolean, default: false },
    meta: { type: Object, required: true },
    query: { type: Object, required: true },
    rows: { type: Array, default: () => [] },
    search: { type: String, default: "" },
    sort: { type: Object, required: true },
    tableCopy: { type: Object, required: true },
  },
};
</script>
