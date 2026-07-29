<template>
  <section class="sequence-builder" :aria-label="accessibleLabel">
    <EntityPicker
      v-model:selected-ids="pickerSelectedIds"
      :accessible-label="copy.picker.title"
      :copy="copy.picker"
      :error="pickerError"
      :filters="pickerFilters"
      :items="availableItems"
      :loading="pickerLoading"
      :meta="pickerMeta"
      :metadata-labels="copy.metadata"
      :permission-denied="pickerPermissionDenied"
      :query="pickerQuery"
      :stale="pickerStale"
      v-on:add-item="addItem"
      v-on:add-selected="addSelected"
      v-on:query-change="$emit('picker-query-change', $event)"
      v-on:retry="$emit('picker-retry')"
    />

    <section
      class="sequence-builder__selected"
      v-on:dragover.prevent
      v-on:drop="dropItem"
    >
      <header class="sequence-builder__selected-header">
        <div>
          <h2>{{ copy.selectedTitle }}</h2>
          <p>{{ copy.selectedDescription }}</p>
        </div>
        <div class="sequence-builder__actions">
          <IdButton
            variant="danger"
            :disabled="selectedSequenceIds.length === 0"
            v-on:click="removeSelected"
          >
            {{ copy.removeSelected }}
          </IdButton>
          <IdButton
            variant="secondary"
            :disabled="undoEntry == null"
            v-on:click="undo"
          >
            {{ copy.undo }}
          </IdButton>
        </div>
      </header>

      <EnterpriseGridState
        v-if="sequenceItems.length === 0"
        variant="empty"
        :title="copy.emptyTitle"
        :description="copy.emptyDescription"
      />

      <ol v-else class="sequence-builder__items">
        <li
          v-for="item in sequenceItems"
          v-bind:key="item.identity"
          class="sequence-builder__item"
        >
          <label>
            <input
              type="checkbox"
              :checked="selectedSequenceSet.has(item.identity)"
              :aria-label="copy.selectItem.replace('{name}', item.name)"
              v-on:change="toggleSequenceSelection(item.identity)"
            />
            <span>
              <strong>{{ item.name }}</strong>
              <span class="sequence-builder__position">
                {{ copy.position.replace("{position}", item.position) }}
              </span>
            </span>
          </label>
          <IdButton variant="danger" v-on:click="removeItem(item.identity)">
            {{ copy.removeItem.replace("{name}", item.name) }}
          </IdButton>
        </li>
      </ol>
    </section>

    <p class="visually-hidden" aria-live="polite">{{ announcement }}</p>
  </section>
</template>

<script>
import EntityPicker from "@/components/sequence/EntityPicker.vue";
import EnterpriseGridState from "@/components/shared/EnterpriseGridState.vue";
import IdButton from "@/components/ui/IdButton.vue";

export default {
  name: "SequenceBuilder",
  components: { EnterpriseGridState, EntityPicker, IdButton },
  emits: [
    "duplicate",
    "picker-query-change",
    "picker-retry",
    "update:sequence",
  ],
  props: {
    accessibleLabel: { type: String, required: true },
    availableItems: { type: Array, default: () => [] },
    copy: { type: Object, required: true },
    pickerError: { type: [Error, Object, String], default: null },
    pickerFilters: { type: Array, default: () => [] },
    pickerLoading: { type: Boolean, default: false },
    pickerMeta: { type: Object, default: () => ({}) },
    pickerPermissionDenied: { type: Boolean, default: false },
    pickerQuery: {
      type: Object,
      default: () => ({ page: 1, search: "", filters: {} }),
    },
    pickerStale: { type: Boolean, default: false },
    sequence: { type: Array, default: () => [] },
  },
  data() {
    return {
      announcement: "",
      pickerSelectedIds: [],
      selectedSequenceIds: [],
      undoEntry: null,
    };
  },
  computed: {
    sequenceItems() {
      return this.sequence.map((item, index) => ({
        ...item,
        position: index + 1,
      }));
    },
    sequenceIdentitySet() {
      return new Set(this.sequenceItems.map((item) => item.identity));
    },
    selectedSequenceSet() {
      return new Set(this.selectedSequenceIds);
    },
  },
  methods: {
    addItem(item) {
      this.addItems([item]);
    },
    addSelected(identities) {
      const requested = new Set((identities ?? []).map(String));
      const items = this.availableItems.filter((item) =>
        requested.has(String(item.identity)),
      );
      this.addItems(items);
    },
    addItems(items) {
      const additions = [];
      const duplicates = [];
      for (const item of items) {
        if (this.sequenceIdentitySet.has(item.identity)) {
          duplicates.push(item);
        } else if (
          !additions.some((addition) => addition.identity === item.identity)
        ) {
          additions.push(item);
        }
      }
      if (duplicates.length > 0) {
        this.announcement = this.copy.duplicate.replace(
          "{count}",
          duplicates.length,
        );
        this.$emit("duplicate", duplicates);
      }
      if (additions.length === 0) return;
      const next = [...this.sequenceItems, ...additions].map(
        this.withoutPosition,
      );
      this.undoEntry = null;
      this.pickerSelectedIds = [];
      this.announcement = this.copy.added.replace("{count}", additions.length);
      this.$emit("update:sequence", next);
    },
    dropItem(event) {
      event.preventDefault();
      const identity = event.dataTransfer?.getData("text/plain");
      const item = this.availableItems.find(
        (entry) => String(entry.identity) === String(identity),
      );
      if (item) this.addItem(item);
    },
    toggleSequenceSelection(identity) {
      const selected = new Set(this.selectedSequenceSet);
      if (selected.has(identity)) selected.delete(identity);
      else selected.add(identity);
      this.selectedSequenceIds = [...selected];
    },
    removeItem(identity) {
      this.removeItems([identity]);
    },
    removeSelected() {
      this.removeItems(this.selectedSequenceIds);
    },
    removeItems(identities) {
      const requested = new Set(identities);
      const removed = this.sequenceItems
        .map((item, index) => ({ item: this.withoutPosition(item), index }))
        .filter(({ item }) => requested.has(item.identity));
      if (removed.length === 0) return;
      const previousSelection = [...this.selectedSequenceIds];
      const next = this.sequenceItems
        .filter((item) => !requested.has(item.identity))
        .map(this.withoutPosition);
      this.undoEntry = { removed, previousSelection };
      this.selectedSequenceIds = this.selectedSequenceIds.filter(
        (identity) => !requested.has(identity),
      );
      this.announcement = this.copy.removed.replace("{count}", removed.length);
      this.$emit("update:sequence", next);
    },
    undo() {
      if (this.undoEntry == null) return;
      const restored = this.sequenceItems.map(this.withoutPosition);
      for (const { item, index } of [...this.undoEntry.removed].sort(
        (left, right) => left.index - right.index,
      )) {
        restored.splice(index, 0, item);
      }
      this.selectedSequenceIds = [...this.undoEntry.previousSelection];
      this.announcement = this.copy.restored.replace(
        "{count}",
        this.undoEntry.removed.length,
      );
      this.undoEntry = null;
      this.$emit("update:sequence", restored);
    },
    withoutPosition(item) {
      const { position, ...persisted } = item;
      return persisted;
    },
  },
};
</script>

<style scoped>
.sequence-builder {
  display: grid;
  gap: var(--id-space-5);
}

.sequence-builder__selected {
  background: var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  min-height: 12rem;
  padding: var(--id-space-4);
}

.sequence-builder__selected-header,
.sequence-builder__actions,
.sequence-builder__item,
.sequence-builder__item label {
  align-items: center;
  display: flex;
  gap: var(--id-space-3);
}

.sequence-builder__selected-header,
.sequence-builder__item {
  justify-content: space-between;
}

.sequence-builder__selected-header h2,
.sequence-builder__selected-header p {
  margin: 0;
}

.sequence-builder__items {
  display: grid;
  gap: var(--id-space-2);
  margin: var(--id-space-4) 0 0;
  padding-left: var(--id-space-5);
}

.sequence-builder__item {
  background: var(--id-color-surface);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  padding: var(--id-space-3);
}

.sequence-builder__item input {
  min-height: var(--id-control-min-size);
  min-width: var(--id-control-min-size);
}

.sequence-builder__item label span {
  display: grid;
}

.sequence-builder__position {
  color: var(--id-color-text-muted);
}

@media (max-width: 48rem) {
  .sequence-builder__selected-header,
  .sequence-builder__item {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
