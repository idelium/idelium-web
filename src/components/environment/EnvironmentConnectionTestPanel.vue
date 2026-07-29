<template>
  <section
    class="environment-connection-test"
    :aria-labelledby="`${panelId}-title`"
  >
    <header>
      <div>
        <h2 :id="`${panelId}-title`">{{ copy.title }}</h2>
        <p>{{ copy.description }}</p>
      </div>
      <button
        v-if="state === 'running'"
        type="button"
        v-on:click="cancel"
      >
        {{ copy.cancel }}
      </button>
      <button
        v-else
        type="button"
        :disabled="disabled"
        v-on:click="start"
      >
        {{ copy.start }}
      </button>
    </header>

    <div
      v-if="state === 'running'"
      class="environment-connection-test__progress"
      role="status"
      aria-live="polite"
    >
      <span aria-hidden="true"></span>
      {{ copy.running }}
    </div>

    <dl v-if="result != null">
      <div>
        <dt>{{ copy.metadata.outcome }}</dt>
        <dd>{{ outcomeLabel(result.code) }}</dd>
      </div>
      <div>
        <dt>{{ copy.metadata.duration }}</dt>
        <dd>{{ format(copy.duration, { duration: result.durationMs }) }}</dd>
      </div>
      <div>
        <dt>{{ copy.metadata.target }}</dt>
        <dd>{{ result.target || copy.notAvailable }}</dd>
      </div>
      <div>
        <dt>{{ copy.metadata.diagnostic }}</dt>
        <dd>
          <code>{{ result.diagnosticCode }}</code>
        </dd>
      </div>
    </dl>

    <p v-if="result != null" :class="resultClass" role="status">
      {{ remediation(result.code) }}
    </p>
  </section>
</template>

<script>
import {
  createConnectionTestRequest,
  normalizeConnectionTestResult,
} from "@/domain/environmentConnectionTest";

let panelSequence = 0;

export default {
  name: "EnvironmentConnectionTestPanel",
  emits: ["completed"],
  props: {
    copy: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
    execute: { type: Function, required: true },
    request: { type: Object, required: true },
  },
  data() {
    panelSequence += 1;
    return {
      abortController: null,
      panelId: `environment-connection-test-${panelSequence}`,
      result: null,
      state: "idle",
    };
  },
  computed: {
    resultClass() {
      return this.result?.success
        ? "environment-connection-test__success"
        : "environment-connection-test__error";
    },
  },
  beforeUnmount() {
    this.abortController?.abort();
    this.abortController = null;
  },
  methods: {
    cancel() {
      this.abortController?.abort();
      this.abortController = null;
      this.result = normalizeConnectionTestResult({ code: "cancelled" });
      this.state = "complete";
      this.$emit("completed", this.result);
    },
    format(template, values) {
      return Object.entries(values).reduce(
        (message, [key, value]) =>
          message.replaceAll(`{${key}}`, String(value)),
        template,
      );
    },
    outcomeLabel(code) {
      return this.copy.outcomes[code] || this.copy.outcomes.unexpected;
    },
    remediation(code) {
      return this.copy.remediation[code] || this.copy.remediation.unexpected;
    },
    async start() {
      if (this.disabled || this.state === "running") return;
      this.result = null;
      this.state = "running";
      this.abortController = new AbortController();
      try {
        const request = createConnectionTestRequest(this.request);
        const response = await this.execute(request, {
          signal: this.abortController.signal,
        });
        if (this.abortController == null) return;
        this.result = normalizeConnectionTestResult(response);
      } catch (error) {
        if (this.abortController == null) return;
        this.result = normalizeConnectionTestResult({
          code: error?.name === "AbortError" ? "cancelled" : "unexpected",
        });
      }
      this.abortController = null;
      this.state = "complete";
      this.$emit("completed", this.result);
    },
  },
};
</script>

<style scoped>
.environment-connection-test {
  display: grid;
  gap: var(--id-space-4);
  min-width: 0;
  padding: var(--id-space-4);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  background: var(--id-color-surface-raised);
}

.environment-connection-test header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
  align-items: flex-start;
  justify-content: space-between;
}

.environment-connection-test h2,
.environment-connection-test p {
  margin: 0;
}

.environment-connection-test__progress {
  display: flex;
  gap: var(--id-space-2);
  align-items: center;
}

.environment-connection-test__progress span {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: var(--id-radius-pill);
  background: var(--id-color-info);
}

.environment-connection-test dl {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
  gap: var(--id-space-3);
  margin: 0;
}

.environment-connection-test dt {
  color: var(--id-color-text-muted);
  font-size: var(--id-font-size-caption);
}

.environment-connection-test dd {
  margin: var(--id-space-1) 0 0;
  overflow-wrap: anywhere;
}

.environment-connection-test__success {
  color: var(--id-color-success);
}

.environment-connection-test__error {
  color: var(--id-color-danger);
}
</style>
