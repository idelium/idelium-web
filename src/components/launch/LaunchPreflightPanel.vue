<template>
  <section class="launch-preflight" :aria-label="copy.accessibleLabel">
    <header class="launch-preflight__header">
      <div>
        <h2>{{ copy.title }}</h2>
        <p>{{ copy.description }}</p>
      </div>
      <button
        class="btn btn-outline-light btn-sm"
        type="button"
        :disabled="running"
        v-on:click="$emit('run')"
      >
        <font-awesome-icon icon="rotate" aria-hidden="true" />
        {{ running ? copy.running : copy.run }}
      </button>
    </header>

    <p v-if="stale" class="launch-preflight__stale">
      {{ copy.stale }}
    </p>

    <div v-if="diagnostics.length === 0" class="launch-preflight__empty">
      {{ copy.empty }}
    </div>

    <div v-else class="launch-preflight__groups">
      <section
        v-for="group in groupedDiagnostics"
        v-bind:key="group.area"
        class="launch-preflight__group"
      >
        <h3>{{ areaLabel(group.area) }}</h3>
        <ul>
          <li
            v-for="diagnostic in group.items"
            v-bind:key="`${diagnostic.code}-${diagnostic.location}`"
            :class="[
              'launch-preflight__diagnostic',
              `launch-preflight__diagnostic--${diagnostic.severity}`,
            ]"
          >
            <strong>{{ severityLabel(diagnostic) }}</strong>
            <span>{{ diagnostic.message }}</span>
            <small v-if="diagnostic.remediation">
              {{ diagnostic.remediation }}
            </small>
            <button
              class="btn btn-link btn-sm"
              type="button"
              v-on:click="$emit('focus-area', diagnostic.focusTarget)"
            >
              {{ copy.focus }}
            </button>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<script>
import { preflightGroups } from "@/domain/launchPreflight";

export default {
  name: "LaunchPreflightPanel",
  emits: ["focus-area", "run"],
  props: {
    copy: { type: Object, required: true },
    result: { type: Object, default: null },
    running: { type: Boolean, default: false },
    stale: { type: Boolean, default: true },
  },
  computed: {
    diagnostics() {
      return this.result?.diagnostics ?? [];
    },
    groupedDiagnostics() {
      return Object.entries(preflightGroups(this.result)).map(
        ([area, items]) => ({ area, items }),
      );
    },
  },
  methods: {
    areaLabel(area) {
      return this.copy.areas?.[area] ?? area;
    },
    severityLabel(diagnostic) {
      if (diagnostic.blocking) return this.copy.blocking;
      return this.copy.severities?.[diagnostic.severity] ?? diagnostic.severity;
    },
  },
};
</script>

<style scoped>
.launch-preflight {
  background: var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  display: grid;
  gap: var(--id-space-4);
  padding: var(--id-space-4);
}

.launch-preflight__header {
  align-items: flex-start;
  display: flex;
  gap: var(--id-space-4);
  justify-content: space-between;
}

.launch-preflight__header h2,
.launch-preflight__header p,
.launch-preflight__group h3 {
  margin: 0;
}

.launch-preflight__stale,
.launch-preflight__empty {
  border: 1px dashed var(--id-color-border);
  border-radius: var(--id-radius-medium);
  color: var(--id-color-warning);
  padding: var(--id-space-3);
}

.launch-preflight__empty {
  color: var(--id-color-text-muted);
}

.launch-preflight__groups {
  display: grid;
  gap: var(--id-space-3);
}

.launch-preflight__group {
  display: grid;
  gap: var(--id-space-2);
}

.launch-preflight__group ul {
  display: grid;
  gap: var(--id-space-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

.launch-preflight__diagnostic {
  background: var(--id-color-surface);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  display: grid;
  gap: var(--id-space-2);
  padding: var(--id-space-3);
}

.launch-preflight__diagnostic--error {
  border-color: var(--id-color-danger);
}

.launch-preflight__diagnostic--warning {
  border-color: var(--id-color-warning);
}

.launch-preflight__diagnostic small {
  color: var(--id-color-text-muted);
}

@media (max-width: 48rem) {
  .launch-preflight__header {
    flex-direction: column;
  }
}
</style>
