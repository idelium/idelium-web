<template>
  <section class="launch-asset-selector" :aria-label="copy.accessibleLabel">
    <header class="launch-asset-selector__header">
      <div>
        <h2>{{ copy.title }}</h2>
        <p>{{ copy.description }}</p>
      </div>
      <span class="launch-asset-selector__count" aria-live="polite">
        {{ copy.count.replace("{count}", String(items.length)) }}
      </span>
    </header>

    <label class="launch-asset-selector__search">
      <span>{{ copy.searchLabel }}</span>
      <input
        v-model="search"
        type="search"
        :placeholder="copy.searchPlaceholder"
        v-on:input="scheduleSearch"
      />
    </label>

    <ul class="launch-asset-selector__items">
      <li
        v-for="item in items"
        v-bind:key="item.identity"
        :class="[
          'launch-asset-selector__item',
          {
            'launch-asset-selector__item--active':
              String(modelValue) === String(item.id),
            'launch-asset-selector__item--disabled': item.disabledReason,
          },
        ]"
      >
        <label>
          <input
            type="radio"
            :name="groupName"
            :value="item.id"
            :checked="String(modelValue) === String(item.id)"
            :disabled="Boolean(item.disabledReason)"
            :aria-describedby="
              item.disabledReason ? `${item.identity}-reason` : undefined
            "
            v-on:change="selectItem(item)"
          />
          <span class="launch-asset-selector__body">
            <span class="launch-asset-selector__name">{{ item.name }}</span>
            <span class="launch-asset-selector__meta">
              <span
                >{{ copy.version }}: {{ item.metadata.version || "n/a" }}</span
              >
              <span
                >{{ copy.status }}: {{ item.metadata.status || "active" }}</span
              >
              <span
                >{{ copy.runtime }}: {{ item.metadata.runtime || "any" }}</span
              >
              <span>{{ copy.owner }}: {{ item.metadata.owner || "n/a" }}</span>
              <span
                >{{ copy.updatedAt }}:
                {{ item.metadata.updatedAt || "n/a" }}</span
              >
            </span>
          </span>
        </label>
        <p
          v-if="item.disabledReason"
          :id="`${item.identity}-reason`"
          class="launch-asset-selector__reason"
        >
          {{ disabledReason(item.disabledReason) }}
        </p>
      </li>
    </ul>

    <div v-if="items.length === 0" class="launch-asset-selector__empty">
      {{ copy.empty }}
    </div>
  </section>
</template>

<script>
export default {
  name: "LaunchAssetSelector",
  emits: ["query-change", "update:modelValue"],
  props: {
    copy: { type: Object, required: true },
    groupName: { type: String, required: true },
    items: { type: Array, default: () => [] },
    modelValue: { type: [Number, String, null], default: null },
    query: {
      type: Object,
      default: () => ({ page: 1, search: "" }),
    },
  },
  data() {
    return {
      search: this.query.search ?? "",
      searchTimer: null,
    };
  },
  watch: {
    "query.search"(value) {
      this.search = value ?? "";
    },
  },
  beforeUnmount() {
    clearTimeout(this.searchTimer);
  },
  methods: {
    disabledReason(reason) {
      return (
        this.copy.disabledReasons?.[reason] ??
        this.copy.disabledReasons?.unavailable ??
        ""
      );
    },
    scheduleSearch() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.searchTimer = null;
        this.$emit("query-change", {
          ...this.query,
          page: 1,
          search: this.search,
        });
      }, 250);
    },
    selectItem(item) {
      if (!item.disabledReason) this.$emit("update:modelValue", item.id);
    },
  },
};
</script>

<style scoped>
.launch-asset-selector {
  background: var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  display: grid;
  gap: var(--id-space-4);
  min-width: 0;
  padding: var(--id-space-4);
}

.launch-asset-selector__header {
  align-items: flex-start;
  display: flex;
  gap: var(--id-space-3);
  justify-content: space-between;
}

.launch-asset-selector__header h2,
.launch-asset-selector__header p {
  margin: 0;
}

.launch-asset-selector__count {
  background: var(--id-color-surface-muted);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-pill);
  color: var(--id-color-text);
  padding: var(--id-space-1) var(--id-space-3);
  white-space: nowrap;
}

.launch-asset-selector__search {
  display: grid;
  gap: var(--id-space-2);
}

.launch-asset-selector__search input {
  background: var(--id-color-surface);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  color: var(--id-color-text);
  min-height: var(--id-control-min-size);
  padding: 0 var(--id-space-3);
}

.launch-asset-selector__items {
  display: grid;
  gap: var(--id-space-2);
  list-style: none;
  margin: 0;
  max-height: min(28rem, 48vh);
  overflow-y: auto;
  padding: 0;
}

.launch-asset-selector__item {
  background: var(--id-color-surface);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  display: grid;
  gap: var(--id-space-2);
  padding: var(--id-space-3);
}

.launch-asset-selector__item--active {
  border-color: var(--id-color-primary);
  box-shadow: 0 0 0 2px var(--id-color-focus);
}

.launch-asset-selector__item--disabled {
  opacity: 0.68;
}

.launch-asset-selector__item label {
  align-items: flex-start;
  display: flex;
  gap: var(--id-space-3);
  margin: 0;
}

.launch-asset-selector__item input {
  min-height: var(--id-control-min-size);
  min-width: var(--id-control-min-size);
}

.launch-asset-selector__body,
.launch-asset-selector__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-2) var(--id-space-3);
  min-width: 0;
}

.launch-asset-selector__body {
  flex-direction: column;
}

.launch-asset-selector__name {
  color: var(--id-color-text);
  font-weight: 700;
}

.launch-asset-selector__meta {
  color: var(--id-color-text-muted);
}

.launch-asset-selector__reason {
  color: var(--id-color-warning);
  margin: 0 0 0 calc(var(--id-control-min-size) + var(--id-space-3));
}

.launch-asset-selector__empty {
  border: 1px dashed var(--id-color-border);
  border-radius: var(--id-radius-medium);
  color: var(--id-color-text-muted);
  padding: var(--id-space-4);
  text-align: center;
}

@media (max-width: 48rem) {
  .launch-asset-selector__header {
    flex-direction: column;
  }
}
</style>
