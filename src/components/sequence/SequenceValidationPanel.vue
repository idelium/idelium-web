<template>
  <section
    class="sequence-validation"
    :aria-label="copy.title"
    :data-can-save="saveState.canSave"
  >
    <header>
      <div>
        <h2>{{ copy.title }}</h2>
        <p>{{ copy.description }}</p>
      </div>
      <strong
        :class="[
          'sequence-validation__status',
          `sequence-validation__status--${saveState.canSave ? 'ready' : 'blocked'}`,
        ]"
      >
        {{ saveState.canSave ? copy.ready : copy.blocked }}
      </strong>
    </header>

    <ul v-if="validation.diagnostics.length > 0">
      <li
        v-for="diagnostic in validation.diagnostics"
        v-bind:key="diagnosticKey(diagnostic)"
        :class="`sequence-validation__diagnostic sequence-validation__diagnostic--${diagnostic.severity}`"
      >
        <strong>{{ severityLabel(diagnostic.severity) }}</strong>
        <span>{{ diagnosticMessage(diagnostic) }}</span>
        <span>{{ remediationMessage(diagnostic) }}</span>
        <label v-if="diagnostic.requiresAcknowledgement">
          <input
            type="checkbox"
            :checked="acknowledgedCodes.includes(diagnostic.code)"
            v-on:change="toggleAcknowledgement(diagnostic.code)"
          />
          {{ copy.acknowledge }}
        </label>
      </li>
    </ul>
    <p v-else>{{ copy.noDiagnostics }}</p>

    <aside v-if="impact.total > 0" class="sequence-validation__impact">
      <h3>{{ copy.impactTitle }}</h3>
      <p>{{ copy.impactDescription }}</p>
      <dl>
        <div>
          <dt>{{ copy.tests }}</dt>
          <dd>{{ impact.references.tests }}</dd>
        </div>
        <div>
          <dt>{{ copy.cycles }}</dt>
          <dd>{{ impact.references.cycles }}</dd>
        </div>
        <div>
          <dt>{{ copy.schedules }}</dt>
          <dd>{{ impact.references.schedules }}</dd>
        </div>
      </dl>
    </aside>

    <p class="visually-hidden" aria-live="polite">
      {{ saveState.canSave ? copy.ready : copy.blocked }}
    </p>
  </section>
</template>

<script>
import { sequenceSaveState } from "@/domain/sequenceBuilder";

export default {
  name: "SequenceValidationPanel",
  emits: ["update:acknowledgedCodes"],
  props: {
    acknowledgedCodes: { type: Array, default: () => [] },
    copy: { type: Object, required: true },
    diagnosticCopy: { type: Object, required: true },
    impact: {
      type: Object,
      default: () => ({
        references: { tests: 0, cycles: 0, schedules: 0 },
        total: 0,
      }),
    },
    remediationCopy: { type: Object, required: true },
    validation: {
      type: Object,
      default: () => ({ canSave: true, diagnostics: [] }),
    },
  },
  computed: {
    saveState() {
      return sequenceSaveState(this.validation, this.acknowledgedCodes);
    },
  },
  methods: {
    diagnosticKey(diagnostic) {
      return [
        diagnostic.source,
        diagnostic.code,
        diagnostic.identity,
        diagnostic.scope,
      ].join(":");
    },
    severityLabel(severity) {
      return severity === "warning" ? this.copy.warning : this.copy.error;
    },
    diagnosticMessage(diagnostic) {
      const key = diagnostic.code.replace("sequence.", "");
      const message =
        this.diagnosticCopy[key] ?? this.diagnosticCopy.serverRejected;
      return diagnostic.identity == null
        ? message
        : `${message} (${diagnostic.identity})`;
    },
    remediationMessage(diagnostic) {
      const key = diagnostic.remediationKey.replace(
        "sequence.remediation.",
        "",
      );
      return this.remediationCopy[key] ?? this.remediationCopy.serverRejected;
    },
    toggleAcknowledgement(code) {
      const next = new Set(this.acknowledgedCodes);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      this.$emit("update:acknowledgedCodes", [...next]);
    },
  },
};
</script>

<style scoped>
.sequence-validation {
  background: var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  display: grid;
  gap: var(--id-space-4);
  padding: var(--id-space-4);
}

.sequence-validation header,
.sequence-validation dl,
.sequence-validation dl div {
  align-items: center;
  display: flex;
  gap: var(--id-space-3);
}

.sequence-validation header {
  justify-content: space-between;
}

.sequence-validation h2,
.sequence-validation h3,
.sequence-validation p,
.sequence-validation dd {
  margin: 0;
}

.sequence-validation ul {
  display: grid;
  gap: var(--id-space-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

.sequence-validation__diagnostic {
  border-left: var(--id-space-1) solid var(--id-color-border);
  display: grid;
  gap: var(--id-space-1);
  padding: var(--id-space-3);
}

.sequence-validation__diagnostic--error {
  border-left-color: var(--id-color-danger);
}

.sequence-validation__diagnostic--warning {
  border-left-color: var(--id-color-warning);
}

.sequence-validation__status--ready {
  color: var(--id-color-success);
}

.sequence-validation__status--blocked {
  color: var(--id-color-danger);
}

.sequence-validation__impact {
  border-top: 1px solid var(--id-color-border);
  display: grid;
  gap: var(--id-space-2);
  padding-top: var(--id-space-3);
}

.sequence-validation dl {
  flex-wrap: wrap;
  margin: 0;
}

.sequence-validation dd {
  font-weight: 700;
}
</style>
