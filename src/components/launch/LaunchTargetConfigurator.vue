<template>
  <section class="launch-target" :aria-label="copy.accessibleLabel">
    <header class="launch-target__header">
      <div>
        <h2>{{ copy.title }}</h2>
        <p>{{ copy.description }}</p>
      </div>
      <label class="launch-target__concurrency">
        <span>{{ copy.concurrency }}</span>
        <input
          :value="concurrency"
          type="number"
          min="1"
          :max="selectedTarget?.capacity?.max || 1"
          v-on:input="updateConcurrency($event.target.value)"
        />
      </label>
    </header>

    <ul class="launch-target__items">
      <li
        v-for="target in targets"
        v-bind:key="target.identity"
        :class="[
          'launch-target__item',
          {
            'launch-target__item--active':
              String(modelValue) === String(target.id),
            'launch-target__item--disabled': target.disabledReason,
          },
        ]"
      >
        <label>
          <input
            type="radio"
            name="launch-target"
            :value="target.id"
            :checked="String(modelValue) === String(target.id)"
            :disabled="Boolean(target.disabledReason)"
            :aria-describedby="
              target.disabledReason ? `${target.identity}-reason` : undefined
            "
            v-on:change="selectTarget(target)"
          />
          <span class="launch-target__body">
            <span class="launch-target__name">{{ target.name }}</span>
            <span class="launch-target__meta">
              <span>{{ copy.health }}: {{ target.health }}</span>
              <span
                >{{ copy.runtime }}:
                {{ target.metadata.runtime || "any" }}</span
              >
              <span
                >{{ copy.region }}: {{ target.metadata.region || "n/a" }}</span
              >
              <span>{{ copy.queue }}: {{ target.metadata.queue }}</span>
              <span>
                {{ copy.capacity }}: {{ target.capacity.available }}/{{
                  target.capacity.max
                }}
              </span>
            </span>
            <span v-if="target.healthStale" class="launch-target__stale">
              {{ copy.healthStale }}
            </span>
          </span>
        </label>
        <p
          v-if="target.disabledReason"
          :id="`${target.identity}-reason`"
          class="launch-target__reason"
        >
          {{ disabledReason(target.disabledReason) }}
        </p>
      </li>
    </ul>

    <div class="launch-target__overrides">
      <label>
        <span>{{ copy.browserOverride }}</span>
        <input
          :value="overrides.browser || ''"
          type="text"
          :disabled="!allowsOverride('browserOverride')"
          v-on:input="updateOverride('browser', $event.target.value)"
        />
      </label>
      <label>
        <span>{{ copy.deviceOverride }}</span>
        <input
          :value="overrides.device || ''"
          type="text"
          :disabled="!allowsOverride('deviceOverride')"
          v-on:input="updateOverride('device', $event.target.value)"
        />
      </label>
    </div>

    <ul v-if="diagnostics.length > 0" class="launch-target__diagnostics">
      <li
        v-for="diagnostic in diagnostics"
        v-bind:key="`${diagnostic.code}-${diagnostic.location}`"
        :class="`launch-target__diagnostic--${diagnostic.severity}`"
      >
        {{ remediation(diagnostic) }}
      </li>
    </ul>
  </section>
</template>

<script>
import { validateLaunchTargetConfiguration } from "@/domain/launchTargets";

export default {
  name: "LaunchTargetConfigurator",
  emits: ["update:concurrency", "update:modelValue", "update:overrides"],
  props: {
    concurrency: { type: Number, default: 1 },
    copy: { type: Object, required: true },
    modelValue: { type: [Number, String, null], default: null },
    overrides: { type: Object, default: () => ({}) },
    targets: { type: Array, default: () => [] },
  },
  computed: {
    selectedTarget() {
      return this.targets.find(
        (target) => String(target.id) === String(this.modelValue),
      );
    },
    diagnostics() {
      return validateLaunchTargetConfiguration({
        concurrency: this.concurrency,
        overrides: this.overrides,
        target: this.selectedTarget,
      });
    },
  },
  methods: {
    allowsOverride(capability) {
      return Boolean(this.selectedTarget?.capabilities?.includes(capability));
    },
    disabledReason(reason) {
      return (
        this.copy.disabledReasons?.[reason] ??
        this.copy.disabledReasons?.unavailable ??
        ""
      );
    },
    remediation(diagnostic) {
      const key = String(diagnostic.remediationKey ?? "")
        .split(".")
        .pop();
      return this.copy.remediation?.[key] ?? diagnostic.code;
    },
    selectTarget(target) {
      if (!target.disabledReason) this.$emit("update:modelValue", target.id);
    },
    updateConcurrency(value) {
      this.$emit("update:concurrency", Number.parseInt(value, 10) || 1);
    },
    updateOverride(key, value) {
      this.$emit("update:overrides", {
        ...this.overrides,
        [key]: String(value ?? "").trim() || null,
      });
    },
  },
};
</script>

<style scoped>
.launch-target {
  background: var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  display: grid;
  gap: var(--id-space-4);
  min-width: 0;
  padding: var(--id-space-4);
}

.launch-target__header {
  align-items: flex-start;
  display: flex;
  gap: var(--id-space-4);
  justify-content: space-between;
}

.launch-target__header h2,
.launch-target__header p {
  margin: 0;
}

.launch-target__concurrency,
.launch-target__overrides label {
  display: grid;
  gap: var(--id-space-2);
}

.launch-target__concurrency input,
.launch-target__overrides input {
  background: var(--id-color-surface);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  color: var(--id-color-text);
  min-height: var(--id-control-min-size);
  padding: 0 var(--id-space-3);
}

.launch-target__items,
.launch-target__diagnostics {
  display: grid;
  gap: var(--id-space-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

.launch-target__item {
  background: var(--id-color-surface);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  display: grid;
  gap: var(--id-space-2);
  padding: var(--id-space-3);
}

.launch-target__item--active {
  border-color: var(--id-color-primary);
  box-shadow: 0 0 0 2px var(--id-color-focus);
}

.launch-target__item--disabled {
  opacity: 0.68;
}

.launch-target__item label {
  align-items: flex-start;
  display: flex;
  gap: var(--id-space-3);
  margin: 0;
}

.launch-target__item input[type="radio"] {
  min-height: var(--id-control-min-size);
  min-width: var(--id-control-min-size);
}

.launch-target__body,
.launch-target__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-2) var(--id-space-3);
}

.launch-target__body {
  flex-direction: column;
}

.launch-target__name {
  color: var(--id-color-text);
  font-weight: 700;
}

.launch-target__meta {
  color: var(--id-color-text-muted);
}

.launch-target__stale,
.launch-target__reason,
.launch-target__diagnostic--warning {
  color: var(--id-color-warning);
}

.launch-target__diagnostic--error {
  color: var(--id-color-danger);
}

.launch-target__overrides {
  display: grid;
  gap: var(--id-space-3);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 48rem) {
  .launch-target__header,
  .launch-target__overrides {
    flex-direction: column;
    grid-template-columns: 1fr;
  }
}
</style>
