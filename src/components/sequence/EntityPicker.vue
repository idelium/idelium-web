<template>
  <section class="entity-picker" :aria-label="accessibleLabel">
    <header class="entity-picker__header">
      <div>
        <h2>{{ copy.title }}</h2>
        <p>{{ copy.description }}</p>
      </div>
      <span class="entity-picker__count" aria-live="polite">
        {{
          copy.resultCount.replace(
            "{count}",
            String(meta.total ?? items.length),
          )
        }}
      </span>
      <IdButton
        variant="primary"
        :disabled="selectedIds.length === 0"
        v-on:click="$emit('add-selected', selectedIds)"
      >
        {{ copy.addSelected }}
      </IdButton>
    </header>

    <div class="entity-picker__controls">
      <label class="entity-picker__search">
        <span>{{ copy.searchLabel }}</span>
        <input
          v-model="search"
          type="search"
          :placeholder="copy.searchPlaceholder"
          v-on:input="scheduleSearch"
        />
      </label>
      <label
        v-for="filter in filters"
        v-bind:key="filter.key"
        class="entity-picker__filter"
      >
        <span>{{ filter.label }}</span>
        <select
          :value="query.filters?.[filter.key] ?? ''"
          v-on:change="changeFilter(filter.key, $event.target.value)"
        >
          <option value="">{{ copy.allFilterValues }}</option>
          <option
            v-for="option in filter.options"
            v-bind:key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>

    <EnterpriseGridState
      v-if="visibleState"
      :variant="visibleState"
      :title="stateCopy.title"
      :description="stateCopy.description"
    >
      <template #actions>
        <IdButton
          v-if="visibleState === 'error' || visibleState === 'stale'"
          variant="secondary"
          v-on:click="$emit('retry')"
        >
          {{ copy.retry }}
        </IdButton>
        <IdButton
          v-if="visibleState === 'no-results'"
          variant="secondary"
          v-on:click="clearQuery"
        >
          {{ copy.clearFilters }}
        </IdButton>
      </template>
    </EnterpriseGridState>

    <ul
      v-else
      class="entity-picker__items"
      v-on:scroll.passive="updateVirtualWindow"
    >
      <li
        v-if="topSpacerHeight > 0"
        class="entity-picker__spacer"
        aria-hidden="true"
        :style="{ height: `${topSpacerHeight}px` }"
      ></li>
      <li
        v-for="item in renderedItems"
        v-bind:key="item.identity"
        :data-identity="item.identity"
        :class="[
          'entity-picker__item',
          { 'entity-picker__item--disabled': !isEligible(item) },
        ]"
        :draggable="isEligible(item)"
        v-on:dblclick="addItem(item)"
        v-on:dragstart="startDrag(item, $event)"
      >
        <label>
          <input
            type="checkbox"
            :checked="isSelected(item)"
            :disabled="!isEligible(item)"
            :aria-describedby="
              !isEligible(item)
                ? `entity-picker-reason-${safeDomId(item)}`
                : null
            "
            v-on:change="toggleItem(item)"
          />
          <span class="entity-picker__item-content">
            <strong>{{ item.name }}</strong>
            <span class="entity-picker__metadata">
              <span
                v-for="entry in metadataEntries(item)"
                v-bind:key="entry.key"
              >
                {{ entry.label }}: {{ entry.value }}
              </span>
            </span>
          </span>
        </label>
        <IdButton
          variant="secondary"
          :disabled="!isEligible(item)"
          v-on:click="addItem(item)"
        >
          {{ copy.addItem.replace("{name}", item.name) }}
        </IdButton>
        <p
          v-if="!isEligible(item)"
          :id="`entity-picker-reason-${safeDomId(item)}`"
          class="entity-picker__reason"
        >
          {{ disabledReason(item) }}
        </p>
      </li>
      <li
        v-if="bottomSpacerHeight > 0"
        class="entity-picker__spacer"
        aria-hidden="true"
        :style="{ height: `${bottomSpacerHeight}px` }"
      ></li>
    </ul>

    <nav class="entity-picker__pagination" :aria-label="copy.paginationLabel">
      <IdButton
        variant="secondary"
        :disabled="loading || !meta.hasPreviousPage"
        v-on:click="changePage((meta.page || 1) - 1)"
      >
        {{ copy.previousPage }}
      </IdButton>
      <span>
        {{
          copy.pageStatus
            .replace("{page}", String(meta.page || 1))
            .replace("{pages}", String(meta.lastPage || 1))
        }}
      </span>
      <IdButton
        variant="secondary"
        :disabled="loading || !meta.hasNextPage"
        v-on:click="changePage((meta.page || 1) + 1)"
      >
        {{ copy.nextPage }}
      </IdButton>
    </nav>
  </section>
</template>

<script>
import EnterpriseGridState from "@/components/shared/EnterpriseGridState.vue";
import IdButton from "@/components/ui/IdButton.vue";
import { gridStateFromResult } from "@/domain/enterpriseGrid";
import { SEQUENCE_ITEM_STATUS } from "@/domain/sequenceBuilder";

export default {
  name: "EntityPicker",
  components: { EnterpriseGridState, IdButton },
  emits: [
    "add-item",
    "add-selected",
    "drag-start",
    "query-change",
    "retry",
    "update:selectedIds",
  ],
  props: {
    accessibleLabel: { type: String, required: true },
    copy: { type: Object, required: true },
    error: { type: [Error, Object, String], default: null },
    filters: { type: Array, default: () => [] },
    estimatedItemHeight: { type: Number, default: 88 },
    items: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    meta: { type: Object, default: () => ({}) },
    metadataLabels: { type: Object, default: () => ({}) },
    permissionDenied: { type: Boolean, default: false },
    query: {
      type: Object,
      default: () => ({ page: 1, search: "", filters: {} }),
    },
    selectedIds: { type: Array, default: () => [] },
    stale: { type: Boolean, default: false },
    virtualizationThreshold: { type: Number, default: 100 },
    virtualWindowSize: { type: Number, default: 50 },
  },
  data() {
    return {
      metadataCache: new Map(),
      search: this.query.search ?? "",
      searchTimer: null,
      virtualStart: 0,
    };
  },
  computed: {
    selectedSet() {
      return new Set(this.selectedIds.map(String));
    },
    virtualized() {
      return this.items.length > this.virtualizationThreshold;
    },
    renderedItems() {
      if (!this.virtualized) return this.items;
      return this.items.slice(
        this.virtualStart,
        this.virtualStart + this.virtualWindowSize,
      );
    },
    topSpacerHeight() {
      return this.virtualized
        ? this.virtualStart * this.estimatedItemHeight
        : 0;
    },
    bottomSpacerHeight() {
      if (!this.virtualized) return 0;
      const remaining = Math.max(
        this.items.length - this.virtualStart - this.virtualWindowSize,
        0,
      );
      return remaining * this.estimatedItemHeight;
    },
    hasActiveFilters() {
      return (
        this.search.trim() !== "" ||
        Object.values(this.query.filters ?? {}).some(
          (value) => value != null && value !== "",
        )
      );
    },
    visibleState() {
      return gridStateFromResult({
        loading: this.loading,
        error: this.error,
        permissionDenied: this.permissionDenied,
        rows: this.items,
        meta: { ...this.meta, stale: this.stale || this.meta.stale },
        hasActiveFilters: this.hasActiveFilters,
      });
    },
    stateCopy() {
      return this.copy.states[this.visibleState] ?? this.copy.states.empty;
    },
  },
  watch: {
    "query.search"(value) {
      this.search = value ?? "";
    },
    items() {
      this.metadataCache.clear();
      this.virtualStart = Math.min(
        this.virtualStart,
        Math.max(this.items.length - this.virtualWindowSize, 0),
      );
    },
  },
  beforeUnmount() {
    clearTimeout(this.searchTimer);
  },
  methods: {
    isEligible(item) {
      return (
        item.disabledReason == null &&
        ![
          SEQUENCE_ITEM_STATUS.ARCHIVED,
          SEQUENCE_ITEM_STATUS.MISSING,
          SEQUENCE_ITEM_STATUS.STALE,
          SEQUENCE_ITEM_STATUS.UNAUTHORIZED,
        ].includes(item.status)
      );
    },
    isSelected(item) {
      return this.selectedSet.has(String(item.identity));
    },
    toggleItem(item) {
      if (!this.isEligible(item)) return;
      const next = new Set(this.selectedSet);
      if (next.has(String(item.identity))) next.delete(String(item.identity));
      else next.add(String(item.identity));
      this.$emit("update:selectedIds", [...next]);
    },
    addItem(item) {
      if (this.isEligible(item)) this.$emit("add-item", item);
    },
    startDrag(item, event) {
      if (!this.isEligible(item)) {
        event.preventDefault();
        return;
      }
      event.dataTransfer?.setData("text/plain", String(item.identity));
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "copy";
      this.$emit("drag-start", item);
    },
    scheduleSearch() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.searchTimer = null;
        this.emitQuery({ page: 1, search: this.search });
      }, 250);
    },
    changeFilter(key, value) {
      this.emitQuery({
        page: 1,
        filters: {
          ...(this.query.filters ?? {}),
          [key]: value,
        },
      });
    },
    changePage(page) {
      this.emitQuery({ page: Math.max(Number(page) || 1, 1) });
    },
    clearQuery() {
      this.search = "";
      this.emitQuery({ page: 1, search: "", filters: {} });
    },
    emitQuery(changes) {
      const currentQuery = this.normalizedQuery(this.query);
      const nextQuery = this.normalizedQuery({
        ...this.query,
        ...changes,
        filters: changes.filters ?? this.query.filters ?? {},
      });
      if (this.sameQuery(currentQuery, nextQuery)) return;
      this.$emit("query-change", nextQuery);
    },
    normalizedQuery(query) {
      const filters = Object.fromEntries(
        Object.entries(query?.filters ?? {}).filter(
          ([, value]) => value != null && value !== "",
        ),
      );
      return {
        ...query,
        page: Math.max(Number(query?.page) || 1, 1),
        search: query?.search ?? "",
        filters,
      };
    },
    sameQuery(left, right) {
      return JSON.stringify(left) === JSON.stringify(right);
    },
    metadataEntries(item) {
      const cached = this.metadataCache.get(item.identity);
      if (
        cached?.metadata === item.metadata &&
        cached?.labels === this.metadataLabels
      ) {
        return cached.entries;
      }
      const entries = Object.entries(item.metadata ?? {})
        .filter(([key, value]) => this.metadataLabels[key] && value !== "")
        .map(([key, value]) => ({
          key,
          label: this.metadataLabels[key],
          value,
        }));
      this.metadataCache.set(item.identity, {
        entries,
        labels: this.metadataLabels,
        metadata: item.metadata,
      });
      return entries;
    },
    updateVirtualWindow(event) {
      if (!this.virtualized) return;
      const requested = Math.max(
        0,
        Math.min(
          Math.floor(event.currentTarget.scrollTop / this.estimatedItemHeight),
          this.items.length - this.virtualWindowSize,
        ),
      );
      const activeIdentity = document.activeElement
        ?.closest("[data-identity]")
        ?.getAttribute("data-identity");
      const activeIndex = this.items.findIndex(
        (item) => String(item.identity) === String(activeIdentity),
      );
      if (
        activeIndex >= 0 &&
        (activeIndex < requested ||
          activeIndex >= requested + this.virtualWindowSize)
      ) {
        this.virtualStart = Math.max(
          0,
          Math.min(activeIndex, this.items.length - this.virtualWindowSize),
        );
        return;
      }
      this.virtualStart = requested;
    },
    disabledReason(item) {
      const key = String(item.disabledReason ?? "").replace(/^sequence\./, "");
      return (
        this.copy.disabledReasons?.[key] ??
        this.copy.disabledReasons?.unavailable ??
        ""
      );
    },
    safeDomId(item) {
      return String(item.identity).replace(/[^a-zA-Z0-9_-]/g, "-");
    },
  },
};
</script>

<style scoped>
.entity-picker {
  background: var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  display: grid;
  gap: var(--id-space-4);
  min-width: 0;
  padding: var(--id-space-4);
}

.entity-picker__header,
.entity-picker__controls,
.entity-picker__pagination {
  align-items: center;
  display: flex;
  gap: var(--id-space-3);
  justify-content: space-between;
}

.entity-picker__header h2,
.entity-picker__header p {
  margin: 0;
}

.entity-picker__count {
  background: var(--id-color-surface-muted);
  border-radius: var(--id-radius-pill);
  padding: var(--id-space-2) var(--id-space-3);
}

.entity-picker__controls {
  align-items: end;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.entity-picker__search,
.entity-picker__filter {
  display: grid;
  gap: var(--id-space-2);
}

.entity-picker__search {
  flex: 1;
  min-width: min(100%, 18rem);
}

.entity-picker__search input,
.entity-picker__filter select {
  background: var(--id-color-surface);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  color: var(--id-color-text);
  min-height: var(--id-control-min-size);
  padding: 0 var(--id-space-3);
}

.entity-picker__items {
  display: grid;
  gap: var(--id-space-2);
  list-style: none;
  margin: 0;
  max-height: min(36rem, 60vh);
  overflow-y: auto;
  padding: 0;
}

.entity-picker__spacer {
  border: 0;
  min-height: 0;
  padding: 0;
  pointer-events: none;
}

.entity-picker__item {
  align-items: center;
  background: var(--id-color-surface);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  display: flex;
  gap: var(--id-space-3);
  justify-content: space-between;
  padding: var(--id-space-3);
}

.entity-picker__item label {
  align-items: flex-start;
  display: flex;
  gap: var(--id-space-3);
  min-width: 0;
}

.entity-picker__item input {
  min-height: var(--id-control-min-size);
  min-width: var(--id-control-min-size);
}

.entity-picker__item--disabled {
  opacity: 0.72;
}

.entity-picker__item-content {
  display: grid;
  gap: var(--id-space-2);
}

.entity-picker__metadata {
  color: var(--id-color-text-muted);
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
}

.entity-picker__reason {
  color: var(--id-color-warning);
  margin: var(--id-space-2) 0 0
    calc(var(--id-control-min-size) + var(--id-space-3));
}

@media (max-width: 48rem) {
  .entity-picker__header,
  .entity-picker__pagination {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
