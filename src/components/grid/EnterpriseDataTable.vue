<template>
  <section
    class="enterprise-data-table"
    :class="`enterprise-data-table--${effectiveDensity}`"
    :aria-busy="loading ? 'true' : 'false'"
    :aria-label="accessibleLabel"
  >
    <div
      v-if="$slots.toolbar || preferencesEnabled"
      class="enterprise-data-table__toolbar"
    >
      <slot name="toolbar"></slot>
      <details
        v-if="preferencesEnabled"
        class="enterprise-data-table__preferences"
      >
        <summary>{{ copy.preferences.title }}</summary>
        <fieldset>
          <legend>{{ copy.preferences.density }}</legend>
          <label v-for="option in densityOptions" :key="option">
            <input
              type="radio"
              name="grid-density"
              :value="option"
              :checked="effectiveDensity === option"
              @change="updateDensity(option)"
            />
            {{ copy.preferences[option] }}
          </label>
        </fieldset>
        <fieldset>
          <legend>{{ copy.preferences.columns }}</legend>
          <div
            v-for="(column, index) in orderedColumns"
            :key="column.key"
            class="enterprise-data-table__preference-row"
          >
            <label>
              <input
                type="checkbox"
                :checked="isColumnVisible(column)"
                :disabled="column.required || !column.configurable"
                @change="toggleColumn(column)"
              />
              {{ column.label }}
            </label>
            <IdButton
              icon-only
              :accessible-label="`${copy.preferences.moveUp}: ${column.label}`"
              :disabled="index === 0 || !column.configurable"
              variant="ghost"
              @click="moveColumn(column.key, -1)"
            >
              <template #icon>↑</template>
            </IdButton>
            <IdButton
              icon-only
              :accessible-label="`${copy.preferences.moveDown}: ${column.label}`"
              :disabled="
                index === orderedColumns.length - 1 || !column.configurable
              "
              variant="ghost"
              @click="moveColumn(column.key, 1)"
            >
              <template #icon>↓</template>
            </IdButton>
          </div>
        </fieldset>
        <IdButton variant="secondary" @click="resetPreferences">
          {{ copy.preferences.reset }}
        </IdButton>
      </details>
    </div>

    <EnterpriseGridState
      v-if="visibleState"
      :title="stateCopy.title"
      :description="stateCopy.description"
      :variant="visibleState"
    />

    <div
      v-if="displayRows.length > 0"
      class="enterprise-data-table__viewport"
      tabindex="0"
      :aria-label="scrollLabel"
    >
      <table>
        <thead>
          <tr>
            <th v-if="selectable" class="enterprise-data-table__selection">
              <input
                type="checkbox"
                :aria-label="selectPageLabel"
                :checked="pageSelected"
                @change="togglePage"
              />
            </th>
            <th
              v-for="column in normalizedColumns"
              :key="column.key"
              :aria-sort="sortState(column)"
              scope="col"
            >
              <button
                v-if="column.sortable"
                class="enterprise-data-table__sort"
                type="button"
                @click="$emit('sort', nextSort(column))"
              >
                {{ column.label }}
                <span aria-hidden="true">{{ sortIndicator(column) }}</span>
              </button>
              <span v-else>{{ column.label }}</span>
            </th>
            <th v-if="visibleActions.length > 0" scope="col">
              <span class="visually-hidden">{{ actionsLabel }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in displayRows"
            :key="rowIdentity(row)"
            tabindex="0"
            @keydown.enter="$emit('row-activate', row)"
            @keydown.space.prevent="$emit('row-activate', row)"
          >
            <td v-if="selectable" class="enterprise-data-table__selection">
              <input
                type="checkbox"
                :aria-label="selectRowLabel(row)"
                :checked="isSelected(row)"
                @change="toggleRow(row)"
              />
            </td>
            <td
              v-for="column in normalizedColumns"
              :key="column.key"
              :data-label="column.label"
              :class="`enterprise-data-table__cell--${column.type}`"
            >
              {{ cellValue(row, column) }}
            </td>
            <td
              v-if="visibleActions.length > 0"
              class="enterprise-data-table__actions"
            >
              <IdButton
                v-for="action in visibleActions"
                :key="action.id"
                :accessible-label="`${action.label}: ${rowLabel(row)}`"
                :variant="action.variant || 'ghost'"
                :disabled="action.disabled === true"
                @click="$emit('action', { action: action.id, row })"
              >
                {{ action.label }}
              </IdButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="visually-hidden" aria-live="polite">
      {{ resultAnnouncement }}
    </p>
  </section>
</template>

<script>
import EnterpriseGridState from "@/components/shared/EnterpriseGridState.vue";
import IdButton from "@/components/ui/IdButton.vue";
import {
  boundedLocalRows,
  formatGridCellValue,
  getGridRowIdentity,
  gridStateFromResult,
  normalizeGridActions,
  sanitizeGridPreferences,
  validateGridColumns,
} from "@/domain/enterpriseGrid";

export default {
  name: "EnterpriseDataTable",
  components: { EnterpriseGridState, IdButton },
  emits: [
    "action",
    "preferences-change",
    "row-activate",
    "selection-change",
    "sort",
  ],
  props: {
    accessibleLabel: { type: String, required: true },
    actions: { type: Array, default: () => [] },
    capabilities: { type: Array, default: () => [] },
    columns: { type: Array, required: true },
    copy: { type: Object, required: true },
    density: {
      type: String,
      default: "comfortable",
      validator: (value) =>
        ["comfortable", "compact", "spacious"].includes(value),
    },
    error: { type: [Error, Object, String], default: null },
    loading: { type: Boolean, default: false },
    localLimit: { type: Number, default: 1000 },
    meta: { type: Object, default: () => ({}) },
    permissionDenied: { type: Boolean, default: false },
    preferences: { type: Object, default: null },
    preferencesEnabled: { type: Boolean, default: false },
    rowKey: { type: [String, Function], default: "id" },
    rows: { type: Array, default: () => [] },
    selectable: { type: Boolean, default: false },
    selectedIds: { type: Array, default: () => [] },
    sort: { type: Object, default: null },
  },
  computed: {
    allColumns() {
      return validateGridColumns(this.columns);
    },
    normalizedPreferences() {
      return sanitizeGridPreferences(this.preferences, this.allColumns);
    },
    orderedColumns() {
      return this.normalizedPreferences.columnOrder.map((key) =>
        this.allColumns.find((column) => column.key === key),
      );
    },
    normalizedColumns() {
      const visible = new Set(this.normalizedPreferences.visibleColumns);
      return this.orderedColumns.filter((column) => visible.has(column.key));
    },
    effectiveDensity() {
      return this.preferences?.density ?? this.density;
    },
    densityOptions() {
      return ["comfortable", "compact", "spacious"];
    },
    displayRows() {
      return boundedLocalRows(this.rows, this.localLimit);
    },
    visibleActions() {
      return normalizeGridActions(this.actions, this.capabilities);
    },
    visibleState() {
      const state = gridStateFromResult({
        loading: this.loading && this.rows.length === 0,
        error: this.error,
        permissionDenied: this.permissionDenied,
        rows: this.displayRows,
        meta: this.meta,
      });
      return state === "partial" ? "stale" : state;
    },
    stateCopy() {
      return this.copy.states?.[this.visibleState] ?? this.copy.states?.empty;
    },
    pageSelected() {
      return (
        this.displayRows.length > 0 &&
        this.displayRows.every((row) => this.isSelected(row))
      );
    },
    selectedSet() {
      return new Set(this.selectedIds.map(String));
    },
    resultAnnouncement() {
      return String(this.copy.resultCount ?? "{count} results").replace(
        "{count}",
        String(this.meta.total ?? this.displayRows.length),
      );
    },
    actionsLabel() {
      return this.copy.actions ?? "Actions";
    },
    scrollLabel() {
      return this.copy.scrollRegion ?? this.accessibleLabel;
    },
    selectPageLabel() {
      return this.copy.selectPage ?? "Select this page";
    },
  },
  methods: {
    rowIdentity(row) {
      return getGridRowIdentity(row, this.rowKey);
    },
    rowLabel(row) {
      return String(row.name ?? row.account ?? this.rowIdentity(row));
    },
    cellValue(row, column) {
      return formatGridCellValue(row?.[column.key], column);
    },
    isSelected(row) {
      return this.selectedSet.has(this.rowIdentity(row));
    },
    toggleRow(row) {
      const identity = this.rowIdentity(row);
      const selection = new Set(this.selectedSet);
      if (selection.has(identity)) selection.delete(identity);
      else selection.add(identity);
      this.$emit("selection-change", [...selection]);
    },
    togglePage() {
      const selection = new Set(this.selectedSet);
      for (const row of this.displayRows) {
        const identity = this.rowIdentity(row);
        if (this.pageSelected) selection.delete(identity);
        else selection.add(identity);
      }
      this.$emit("selection-change", [...selection]);
    },
    selectRowLabel(row) {
      return `${this.copy.selectRow ?? "Select"} ${this.rowLabel(row)}`;
    },
    sortState(column) {
      if (this.sort?.field !== column.key) return "none";
      return this.sort.direction === "desc" ? "descending" : "ascending";
    },
    sortIndicator(column) {
      if (this.sort?.field !== column.key) return "↕";
      return this.sort.direction === "desc" ? "↓" : "↑";
    },
    nextSort(column) {
      return {
        field: column.key,
        direction:
          this.sort?.field === column.key && this.sort.direction === "asc"
            ? "desc"
            : "asc",
      };
    },
    isColumnVisible(column) {
      return this.normalizedPreferences.visibleColumns.includes(column.key);
    },
    emitPreferences(changes) {
      this.$emit(
        "preferences-change",
        sanitizeGridPreferences(
          { ...this.normalizedPreferences, ...changes },
          this.allColumns,
        ),
      );
    },
    updateDensity(density) {
      this.emitPreferences({ density });
    },
    toggleColumn(column) {
      if (column.required || !column.configurable) return;
      const visibleColumns = new Set(this.normalizedPreferences.visibleColumns);
      if (visibleColumns.has(column.key)) visibleColumns.delete(column.key);
      else visibleColumns.add(column.key);
      this.emitPreferences({ visibleColumns: [...visibleColumns] });
    },
    moveColumn(columnKey, direction) {
      const columnOrder = [...this.normalizedPreferences.columnOrder];
      const currentIndex = columnOrder.indexOf(columnKey);
      const nextIndex = currentIndex + direction;
      if (
        currentIndex < 0 ||
        nextIndex < 0 ||
        nextIndex >= columnOrder.length
      ) {
        return;
      }
      [columnOrder[currentIndex], columnOrder[nextIndex]] = [
        columnOrder[nextIndex],
        columnOrder[currentIndex],
      ];
      this.emitPreferences({ columnOrder });
    },
    resetPreferences() {
      this.$emit(
        "preferences-change",
        sanitizeGridPreferences(null, this.allColumns),
      );
    },
  },
};
</script>

<style scoped>
.enterprise-data-table {
  display: grid;
  gap: var(--id-space-4);
  min-width: 0;
}

.enterprise-data-table__toolbar {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
  justify-content: space-between;
}

.enterprise-data-table__preferences {
  background: var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  max-width: min(24rem, 100%);
  padding: var(--id-space-3);
}

.enterprise-data-table__preferences summary {
  cursor: pointer;
  font-weight: var(--id-font-weight-bold);
  min-height: var(--id-control-min-size);
}

.enterprise-data-table__preferences fieldset {
  border: 0;
  display: grid;
  gap: var(--id-space-2);
  margin: var(--id-space-3) 0;
  padding: 0;
}

.enterprise-data-table__preference-row {
  align-items: center;
  display: grid;
  gap: var(--id-space-2);
  grid-template-columns: minmax(0, 1fr) auto auto;
}

.enterprise-data-table__viewport {
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  max-width: 100%;
  overflow: auto;
}

.enterprise-data-table__viewport:focus-visible {
  box-shadow: var(--id-focus-ring);
  outline: none;
}

table {
  border-collapse: collapse;
  min-width: 42rem;
  width: 100%;
}

th {
  background: var(--id-color-surface-raised);
  color: var(--id-color-text-muted);
  font-size: var(--id-font-size-caption);
  letter-spacing: 0.08em;
  position: sticky;
  text-align: left;
  text-transform: uppercase;
  top: 0;
  z-index: 1;
}

th,
td {
  border-bottom: 1px solid var(--id-color-border);
  padding: var(--id-space-4);
  vertical-align: middle;
}

.enterprise-data-table--compact th,
.enterprise-data-table--compact td {
  padding: var(--id-space-2) var(--id-space-3);
}

.enterprise-data-table--spacious th,
.enterprise-data-table--spacious td {
  padding: var(--id-space-5);
}

tbody tr {
  background: var(--id-color-surface);
  color: var(--id-color-text);
}

tbody tr:focus-visible {
  box-shadow: inset var(--id-focus-ring);
  outline: none;
}

.enterprise-data-table__sort {
  background: transparent;
  border: 0;
  color: inherit;
  font: inherit;
  min-height: var(--id-control-min-size);
  padding: 0;
}

.enterprise-data-table__selection {
  text-align: center;
  width: var(--id-control-icon-size);
}

.enterprise-data-table__selection input {
  min-height: 1.25rem;
  min-width: 1.25rem;
}

.enterprise-data-table__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-2);
  justify-content: flex-end;
}

.enterprise-data-table__cell--technical {
  font-family: var(--id-font-mono);
}
</style>
