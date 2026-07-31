<template>
  <section
    :class="['sequence-builder', `sequence-builder--${layout}`]"
    :aria-label="accessibleLabel"
  >
    <div class="sequence-builder__workspace">
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
        v-on:drag-end="endAvailableDrag"
        v-on:drag-start="startAvailableDrag"
        v-on:prepare-drag="startAvailableDrag"
        v-on:query-change="$emit('picker-query-change', $event)"
        v-on:retry="$emit('picker-retry')"
      />

      <section
        class="sequence-builder__selected"
        v-on:dragenter="prepareDrop"
        v-on:dragover="prepareDrop"
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

        <ol
          v-else
          class="sequence-builder__items"
          v-on:dragenter="prepareDrop"
          v-on:dragover="prepareDrop"
        >
          <li
            v-for="item in sequenceItems"
            v-bind:key="item.identity"
            :ref="(element) => setItemElement(item.identity, element)"
            class="sequence-builder__item"
            draggable="true"
            tabindex="-1"
            :title="copy.dragHandle.replace('{name}', item.name)"
            v-on:dragstart="startSequenceDrag(item.identity, $event)"
            v-on:dragend="endSequenceDrag"
            v-on:dragover="dragOverItem(item.identity, $event)"
            v-on:drop="dropReorderedItem(item.identity, $event)"
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
            <div class="sequence-builder__item-actions">
              <IdButton
                v-if="showConfigure"
                variant="primary"
                v-on:click="$emit('activate', item)"
              >
                {{ copy.configureItem.replace("{name}", item.name) }}
              </IdButton>
              <IdButton
                v-if="allowDuplicates"
                icon-only
                class="sequence-builder__duplicate-action"
                variant="secondary"
                :accessible-label="
                  copy.duplicateItem.replace('{name}', item.name)
                "
                :tooltip="copy.duplicateItem.replace('{name}', item.name)"
                v-on:click="duplicateItem(item.identity)"
              >
                <template #icon>
                  <font-awesome-icon icon="clone" aria-hidden="true" />
                </template>
              </IdButton>
              <IdButton
                icon-only
                class="sequence-builder__remove-action"
                variant="danger"
                :accessible-label="copy.removeItem.replace('{name}', item.name)"
                :tooltip="copy.removeItem.replace('{name}', item.name)"
                v-on:click="removeItem(item.identity)"
              >
                <template #icon>
                  <font-awesome-icon icon="trash" aria-hidden="true" />
                </template>
              </IdButton>
            </div>
            <p
              v-if="item.position === 1"
              :id="`sequence-start-reason-${safeDomId(item.identity)}`"
              class="visually-hidden"
            >
              {{ copy.alreadyFirst }}
            </p>
            <p
              v-if="item.position === sequenceItems.length"
              :id="`sequence-end-reason-${safeDomId(item.identity)}`"
              class="visually-hidden"
            >
              {{ copy.alreadyLast }}
            </p>
          </li>
        </ol>
      </section>
    </div>

    <SequenceValidationPanel
      v-if="validation != null"
      v-model:acknowledged-codes="acknowledgedWarningCodes"
      :copy="copy.validation"
      :diagnostic-copy="copy.diagnostics"
      :impact="impactSummary"
      :remediation-copy="copy.remediation"
      :validation="validation"
      v-on:update:acknowledged-codes="acknowledgeWarnings"
    />

    <p class="visually-hidden" aria-live="polite">{{ announcement }}</p>
  </section>
</template>

<script>
import EntityPicker from "@/components/sequence/EntityPicker.vue";
import SequenceValidationPanel from "@/components/sequence/SequenceValidationPanel.vue";
import EnterpriseGridState from "@/components/shared/EnterpriseGridState.vue";
import IdButton from "@/components/ui/IdButton.vue";

export default {
  name: "SequenceBuilder",
  components: {
    EnterpriseGridState,
    EntityPicker,
    IdButton,
    SequenceValidationPanel,
  },
  emits: [
    "activate",
    "acknowledge-warnings",
    "duplicate",
    "picker-query-change",
    "picker-retry",
    "update:sequence",
  ],
  props: {
    accessibleLabel: { type: String, required: true },
    allowDuplicates: { type: Boolean, default: false },
    availableItems: { type: Array, default: () => [] },
    copy: { type: Object, required: true },
    impactSummary: {
      type: Object,
      default: () => ({
        references: { tests: 0, cycles: 0, schedules: 0 },
        total: 0,
      }),
    },
    layout: {
      type: String,
      default: "stacked",
      validator: (value) => ["stacked", "split"].includes(value),
    },
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
    showConfigure: { type: Boolean, default: false },
    validation: { type: Object, default: null },
  },
  data() {
    return {
      acknowledgedWarningCodes: [],
      announcement: "",
      draggedAvailableIdentity: null,
      draggedSequenceIdentity: null,
      itemElements: {},
      pendingFocusIdentity: null,
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
  watch: {
    sequence() {
      if (this.pendingFocusIdentity == null) return;
      const identity = this.pendingFocusIdentity;
      this.pendingFocusIdentity = null;
      this.$nextTick(() => this.itemElements[identity]?.focus());
    },
  },
  beforeUpdate() {
    this.itemElements = {};
  },
  beforeUnmount() {
    this.draggedAvailableIdentity = null;
    this.draggedSequenceIdentity = null;
    this.pendingFocusIdentity = null;
    this.itemElements = {};
  },
  methods: {
    acknowledgeWarnings(codes) {
      this.acknowledgedWarningCodes = codes;
      this.$emit("acknowledge-warnings", codes);
    },
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
      this.insertItems(items, this.sequenceItems.length);
    },
    insertItems(items, requestedIndex) {
      const additions = [];
      const duplicates = [];
      for (const item of items) {
        if (!this.allowDuplicates && this.sequenceIdentitySet.has(item.identity)) {
          duplicates.push(item);
        } else if (
          this.allowDuplicates ||
          !additions.some((addition) => addition.identity === item.identity)
        ) {
          additions.push(this.prepareAddition(item, additions));
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
      const destinationIndex = Math.max(
        0,
        Math.min(Number(requestedIndex), this.sequenceItems.length),
      );
      const next = this.sequenceItems.map(this.withoutPosition);
      next.splice(destinationIndex, 0, ...additions);
      this.undoEntry = null;
      this.pickerSelectedIds = [];
      this.announcement = this.copy.added.replace("{count}", additions.length);
      this.$emit("update:sequence", next);
    },
    prepareAddition(item, pendingAdditions = []) {
      const addition = this.withoutPosition(item);
      if (!this.allowDuplicates) return addition;
      if (!this.sequenceIdentitySet.has(addition.identity)) return addition;
      const identity = this.nextOccurrenceIdentity(item, pendingAdditions);
      return {
        ...addition,
        identity,
        persisted: this.withSequenceIdentity(
          addition.persisted ?? addition,
          identity,
        ),
      };
    },
    dropItem(event) {
      event.preventDefault();
      if (this.draggedSequenceIdentity != null) return;
      const identity = this.readDraggedIdentity(event);
      const item = this.availableItems.find(
        (entry) => String(entry.identity) === String(identity),
      );
      this.draggedAvailableIdentity = null;
      if (item) this.addItem(item);
    },
    startAvailableDrag(item) {
      this.draggedAvailableIdentity = item.identity;
    },
    endAvailableDrag() {
      this.draggedAvailableIdentity = null;
    },
    startSequenceDrag(identity, event) {
      this.draggedSequenceIdentity = identity;
      this.draggedAvailableIdentity = null;
      event.dataTransfer?.setData("text/plain", String(identity));
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    },
    endSequenceDrag() {
      this.draggedSequenceIdentity = null;
    },
    dragOverItem(identity, event) {
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = this.dropEffectForDrag(event);
      }
      this.autoScroll(event);
    },
    dropReorderedItem(targetIdentity, event) {
      event.preventDefault();
      event.stopPropagation();
      const sourceIdentity =
        this.draggedSequenceIdentity ??
        this.readDraggedIdentity(event) ??
        null;
      this.draggedSequenceIdentity = null;
      this.draggedAvailableIdentity = null;
      if (sourceIdentity == null || sourceIdentity === targetIdentity) return;
      const targetIndex = this.sequenceItems.findIndex(
        (item) => item.identity === targetIdentity,
      );
      const sourceIndex = this.sequenceItems.findIndex(
        (item) => item.identity === sourceIdentity,
      );
      if (sourceIndex < 0) {
        const item = this.availableItems.find(
          (entry) => String(entry.identity) === String(sourceIdentity),
        );
        if (item) this.insertItems([item], targetIndex);
        return;
      }
      this.moveItem(sourceIdentity, targetIndex);
    },
    readDraggedIdentity(event) {
      return (
        this.draggedAvailableIdentity ??
        event.dataTransfer?.getData("application/x-idelium-sequence-item") ??
        event.dataTransfer?.getData("text/plain") ??
        null
      );
    },
    readTransferIdentity(event) {
      return (
        event.dataTransfer?.getData("application/x-idelium-sequence-item") ??
        event.dataTransfer?.getData("text/plain") ??
        null
      );
    },
    dropEffectForDrag(event) {
      if (this.draggedAvailableIdentity != null) return "copy";
      const transferredIdentity = this.readTransferIdentity(event);
      return this.sequenceIdentitySet.has(transferredIdentity)
        ? "move"
        : "copy";
    },
    prepareDrop(event) {
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = this.dropEffectForDrag(event);
      }
      this.autoScroll(event);
    },
    duplicateItem(identity) {
      const sourceIndex = this.sequenceItems.findIndex(
        (item) => item.identity === identity,
      );
      if (sourceIndex < 0) return;
      const source = this.withoutPosition(this.sequenceItems[sourceIndex]);
      const copyIdentity = this.nextOccurrenceIdentity(source);
      const duplicate = {
        ...source,
        identity: copyIdentity,
        persisted: this.withSequenceIdentity(
          source.persisted ?? source,
          copyIdentity,
        ),
      };
      const next = this.sequenceItems.map(this.withoutPosition);
      next.splice(sourceIndex + 1, 0, duplicate);
      this.pendingFocusIdentity = copyIdentity;
      this.undoEntry = null;
      this.announcement = this.copy.duplicated.replace("{name}", source.name);
      this.$emit("update:sequence", next);
    },
    baseIdentity(item) {
      return (
        item.referenceIdentity ??
        `${item.entityType ?? "entity"}:${item.entityId ?? item.id ?? "unknown"}`
      );
    },
    nextOccurrenceIdentity(item, pendingAdditions = []) {
      const baseIdentity = this.baseIdentity(item);
      const usedIdentities = new Set([
        ...this.sequenceItems.map((entry) => entry.identity),
        ...pendingAdditions.map((entry) => entry.identity),
      ]);
      let occurrence = 2;
      let identity = `${baseIdentity}:occurrence:${occurrence}`;
      while (usedIdentities.has(identity)) {
        occurrence += 1;
        identity = `${baseIdentity}:occurrence:${occurrence}`;
      }
      return identity;
    },
    withSequenceIdentity(persisted, identity) {
      return {
        ...(persisted ?? {}),
        sequenceIdentity: identity,
      };
    },
    autoScroll(event) {
      event.preventDefault();
      const container = event.currentTarget.closest(
        ".sequence-builder__selected",
      );
      if (container == null) return;
      const bounds = container.getBoundingClientRect();
      const threshold = Math.min(48, bounds.height / 4);
      let delta = 0;
      if (event.clientY < bounds.top + threshold) delta = -24;
      else if (event.clientY > bounds.bottom - threshold) delta = 24;
      if (delta === 0) return;
      const maximum = Math.max(
        container.scrollHeight - container.clientHeight,
        0,
      );
      container.scrollTop = Math.max(
        0,
        Math.min(maximum, container.scrollTop + delta),
      );
    },
    moveItem(identity, requestedIndex) {
      const sourceIndex = this.sequenceItems.findIndex(
        (item) => item.identity === identity,
      );
      if (sourceIndex < 0) return;
      const destinationIndex = Math.max(
        0,
        Math.min(Number(requestedIndex), this.sequenceItems.length - 1),
      );
      if (sourceIndex === destinationIndex) return;
      const next = this.sequenceItems.map(this.withoutPosition);
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(destinationIndex, 0, moved);
      this.pendingFocusIdentity = identity;
      this.undoEntry = null;
      this.announcement = this.copy.moved
        .replace("{name}", moved.name)
        .replace("{from}", sourceIndex + 1)
        .replace("{to}", destinationIndex + 1);
      this.$emit("update:sequence", next);
    },
    setItemElement(identity, element) {
      if (element == null) return;
      this.itemElements[identity] = element;
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
    safeDomId(identity) {
      return String(identity).replace(/[^a-zA-Z0-9_-]/g, "-");
    },
  },
};
</script>

<style scoped>
.sequence-builder {
  display: grid;
  gap: var(--id-space-5);
}

.sequence-builder__workspace {
  display: grid;
  gap: var(--id-space-5);
}

.sequence-builder--split .sequence-builder__workspace {
  align-items: start;
  grid-template-columns: minmax(18rem, 0.9fr) minmax(24rem, 1.1fr);
}

.sequence-builder__selected {
  background: var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  min-height: 12rem;
  padding: var(--id-space-4);
}

.sequence-builder--split .sequence-builder__selected {
  min-height: min(42rem, 70vh);
}

.sequence-builder--split :deep(.entity-picker__items),
.sequence-builder--split .sequence-builder__items {
  max-height: min(32rem, 58vh);
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
  max-height: min(32rem, 60vh);
  overflow-y: auto;
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

.sequence-builder__item-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-2);
  justify-content: flex-end;
}

.sequence-builder__item {
  cursor: grab;
}

.sequence-builder__duplicate-action,
.sequence-builder__remove-action {
  min-height: 2rem;
  min-width: 2rem;
  padding: 0;
}

.sequence-builder__item:active {
  cursor: grabbing;
}

.sequence-builder__item:focus-visible {
  outline: var(--id-focus-ring);
  outline-offset: var(--id-focus-offset);
}

.sequence-builder__item label span {
  display: grid;
}

.sequence-builder__position {
  color: var(--id-color-text-muted);
}

@media (max-width: 48rem) {
  .sequence-builder--split .sequence-builder__workspace {
    grid-template-columns: 1fr;
  }

  .sequence-builder__selected-header,
  .sequence-builder__item {
    align-items: stretch;
    flex-direction: column;
  }

  .sequence-builder__item-actions {
    justify-content: flex-start;
    width: 100%;
  }
}
</style>
