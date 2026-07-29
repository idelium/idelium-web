<template>
  <section class="action-catalog" :aria-label="copy.accessibleLabel">
    <label class="action-catalog__search">
      <span>{{ copy.searchLabel }}</span>
      <input
        v-model="query"
        type="search"
        :placeholder="copy.searchPlaceholder"
        :aria-describedby="`${catalogId}-summary`"
      />
    </label>

    <p
      :id="`${catalogId}-summary`"
      class="action-catalog__summary"
      aria-live="polite"
    >
      {{ format(copy.resultCount, { count: filtered.total }) }}
    </p>

    <div v-if="filtered.groups.length > 0" class="action-catalog__groups">
      <section
        v-for="group in filtered.groups"
        v-bind:key="group.id"
        class="action-catalog__group"
        :aria-labelledby="`${catalogId}-group-${group.id}`"
      >
        <h3 :id="`${catalogId}-group-${group.id}`">
          {{ groupLabel(group.id) }}
        </h3>
        <ul>
          <li
            v-for="result in group.results"
            v-bind:key="result.action.id"
            class="action-catalog__result"
          >
            <button
              type="button"
              class="action-catalog__action"
              :disabled="!result.compatibility.addable"
              :aria-describedby="descriptionIds(result)"
              v-on:click="addAction(result)"
              v-on:keydown.enter.prevent="addAction(result)"
            >
              <span class="action-catalog__name">
                {{ actionLabel(result) }}
              </span>
              <code>{{ result.action.actionType }}</code>
              <span class="action-catalog__badges">
                <span
                  v-if="result.action.deprecation.deprecated"
                  class="action-catalog__badge action-catalog__badge--warning"
                >
                  {{ copy.deprecated }}
                </span>
                <span
                  v-if="result.action.lifecycle.experimental"
                  class="action-catalog__badge"
                >
                  {{ copy.experimental }}
                </span>
                <span
                  v-if="!result.compatibility.addable"
                  class="action-catalog__badge action-catalog__badge--danger"
                >
                  {{ copy.unsupported }}
                </span>
              </span>
            </button>
            <p
              :id="`${catalogId}-description-${safeDomId(result.action.id)}`"
              class="action-catalog__description"
            >
              {{ actionDescription(result) }}
            </p>
            <p
              v-if="!result.compatibility.addable"
              :id="`${catalogId}-remediation-${safeDomId(result.action.id)}`"
              class="action-catalog__remediation"
              role="status"
            >
              {{ remediation(result) }}
            </p>
            <a
              :href="result.action.documentation.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ copy.documentation }}
              <span class="visually-hidden">
                {{
                  format(copy.opensNewWindow, { action: actionLabel(result) })
                }}
              </span>
            </a>
          </li>
        </ul>
      </section>
    </div>
    <p v-else class="action-catalog__empty">{{ copy.empty }}</p>
  </section>
</template>

<script>
import { searchActionCatalog } from "@/domain/stepCatalog";

let catalogSequence = 0;

export default {
  name: "ActionCatalog",
  emits: ["add"],
  props: {
    activeRuntime: { type: String, default: "" },
    catalog: { type: Object, required: true },
    copy: { type: Object, required: true },
    localizedActions: { type: Object, default: () => ({}) },
    runtimeVersions: { type: Object, default: () => ({}) },
  },
  data() {
    catalogSequence += 1;
    return {
      catalogId: `action-catalog-${catalogSequence}`,
      query: "",
    };
  },
  computed: {
    filtered() {
      return searchActionCatalog(this.catalog, {
        activeRuntime: this.activeRuntime,
        localizedActions: this.localizedActions,
        query: this.query,
        runtimeVersions: this.runtimeVersions,
      });
    },
  },
  methods: {
    actionDescription(result) {
      return result.localized.description || this.copy.noDescription;
    },
    actionLabel(result) {
      return result.localized.label || result.action.actionType;
    },
    addAction(result) {
      if (!result.compatibility.addable) return;
      this.$emit("add", result.action);
    },
    descriptionIds(result) {
      const suffix = this.safeDomId(result.action.id);
      const ids = [`${this.catalogId}-description-${suffix}`];
      if (!result.compatibility.addable) {
        ids.push(`${this.catalogId}-remediation-${suffix}`);
      }
      return ids.join(" ");
    },
    format(template, values) {
      return Object.entries(values).reduce(
        (message, [key, value]) =>
          message.replaceAll(`{${key}}`, String(value)),
        template,
      );
    },
    groupLabel(group) {
      return this.copy.groups[group] || group;
    },
    remediation(result) {
      const key = result.compatibility.code;
      const template = this.copy.remediation[key] || this.copy.unsupported;
      return this.format(template, {
        maximum: result.action.runtimeConstraint.maximum || "",
        minimum: result.action.runtimeConstraint.minimum || "",
        runtime: result.action.runtime,
      });
    },
    safeDomId(value) {
      return String(value).replace(/[^a-zA-Z0-9_-]/g, "-");
    },
  },
};
</script>

<style scoped>
.action-catalog {
  display: grid;
  gap: var(--id-space-4);
  min-width: 0;
}

.action-catalog__search {
  display: grid;
  gap: var(--id-space-2);
  font-weight: 700;
}

.action-catalog__search input {
  width: 100%;
}

.action-catalog__summary,
.action-catalog__description,
.action-catalog__remediation,
.action-catalog__empty {
  margin: 0;
}

.action-catalog__groups {
  display: grid;
  gap: var(--id-space-5);
}

.action-catalog__group h3 {
  margin-block: 0 var(--id-space-3);
}

.action-catalog__group ul {
  display: grid;
  gap: var(--id-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.action-catalog__result {
  display: grid;
  gap: var(--id-space-2);
  padding: var(--id-space-3);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-md);
  background: var(--id-color-surface);
}

.action-catalog__action {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--id-space-2);
  align-items: center;
  width: 100%;
  padding: 0;
  border: 0;
  color: var(--id-color-text);
  text-align: start;
  background: transparent;
  cursor: pointer;
}

.action-catalog__action:focus-visible {
  outline: 2px solid var(--id-color-focus);
  outline-offset: var(--id-space-1);
}

.action-catalog__action:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}

.action-catalog__name {
  font-weight: 700;
}

.action-catalog__badges {
  display: flex;
  grid-column: 1 / -1;
  flex-wrap: wrap;
  gap: var(--id-space-2);
}

.action-catalog__badge {
  padding: var(--id-space-1) var(--id-space-2);
  border-radius: var(--id-radius-pill);
  color: var(--id-color-info-text);
  background: var(--id-color-info-surface);
}

.action-catalog__badge--warning {
  color: var(--id-color-warning-text);
  background: var(--id-color-warning-surface);
}

.action-catalog__badge--danger,
.action-catalog__remediation {
  color: var(--id-color-danger-text);
  background: var(--id-color-danger-surface);
}
</style>
