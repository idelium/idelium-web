<template>
  <section class="step-test-panel" :aria-label="copy.accessibleLabel">
    <header>
      <div>
        <h2>{{ copy.title }}</h2>
        <p>{{ copy.description }}</p>
      </div>
    </header>

    <div class="step-test-panel__selection">
      <label>
        {{ copy.environment }}
        <select v-model="environmentId">
          <option value="">{{ copy.selectEnvironment }}</option>
          <option
            v-for="environment in eligibleEnvironments"
            v-bind:key="environment.id"
            :value="environment.id"
          >
            {{ environment.name }}
          </option>
        </select>
      </label>
      <label>
        {{ copy.target }}
        <select v-model="targetId">
          <option value="">{{ copy.selectTarget }}</option>
          <option
            v-for="target in eligibleTargets"
            v-bind:key="target.id"
            :value="target.id"
          >
            {{ target.name }}
          </option>
        </select>
      </label>
      <label>
        {{ copy.timeout }}
        <input
          v-model.number="timeoutMs"
          type="number"
          min="1000"
          max="120000"
          step="1000"
        />
      </label>
    </div>

    <div class="step-test-panel__actions">
      <button type="button" :disabled="running" v-on:click="runTest">
        {{ copy.run }}
      </button>
      <button type="button" :disabled="!running" v-on:click="cancelTest">
        {{ copy.cancel }}
      </button>
    </div>

    <section
      v-if="result != null"
      class="step-test-panel__result"
      :aria-label="copy.result"
      aria-live="polite"
    >
      <h3>{{ copy.status[result.status] }}</h3>
      <p>{{ format(copy.duration, { duration: result.durationMs }) }}</p>
      <p v-if="result.remediationCode">
        {{
          copy.remediation[result.remediationCode] || copy.remediation.default
        }}
      </p>
      <ul v-if="result.logs.length > 0">
        <li v-for="(line, index) in result.logs" v-bind:key="index">
          <code>{{ line }}</code>
        </li>
      </ul>
      <ul v-if="result.artifacts.length > 0">
        <li v-for="artifact in result.artifacts" v-bind:key="artifact.id">
          {{
            format(copy.artifact, {
              name: artifact.name,
              size: artifact.size,
            })
          }}
        </li>
      </ul>
    </section>

    <section class="step-test-panel__impact" :aria-label="copy.impact">
      <h3>{{ copy.impact }}</h3>
      <p>{{ copy.impactDescription }}</p>
      <ul>
        <li
          v-for="item in normalizedImpact.items"
          v-bind:key="`${item.type}:${item.id}`"
        >
          <strong>{{ item.name }}</strong>
          <span>{{ copy.consumerTypes[item.type] }}</span>
          <span>
            {{
              item.pinnedVersion
                ? format(copy.pinnedVersion, {
                    version: item.pinnedVersion,
                  })
                : copy.unpinned
            }}
          </span>
        </li>
      </ul>
      <p v-if="normalizedImpact.items.length === 0">{{ copy.noImpact }}</p>
      <p>
        {{
          format(copy.pagination, {
            page: normalizedImpact.page,
            pageSize: normalizedImpact.pageSize,
            total: normalizedImpact.total,
          })
        }}
      </p>
    </section>

    <fieldset>
      <legend>{{ copy.governance }}</legend>
      <label v-if="governance.publishVersion">
        <input
          v-model="governanceAction"
          type="radio"
          value="publish-version"
        />
        {{ copy.publishVersion }}
      </label>
      <label v-if="governance.updateDraft">
        <input v-model="governanceAction" type="radio" value="update-draft" />
        {{ copy.updateDraft }}
      </label>
    </fieldset>
    <button type="button" v-on:click="$emit('governance', governanceAction)">
      {{ copy.continueUpdate }}
    </button>
  </section>
</template>

<script>
import {
  createStepTestRequest,
  normalizeStepGovernancePolicy,
  normalizeStepImpact,
  normalizeStepTestResult,
} from "@/domain/stepTestExecution";

export default {
  name: "StepTestPanel",
  emits: ["governance"],
  props: {
    copy: { type: Object, required: true },
    environments: { type: Array, default: () => [] },
    executor: { type: Function, required: true },
    governancePolicy: { type: Object, default: () => ({}) },
    impact: { type: Object, default: () => ({}) },
    runtime: { type: String, required: true },
    stepId: { type: [String, Number], required: true },
    targets: { type: Array, default: () => [] },
    tenantId: { type: [String, Number], required: true },
  },
  data() {
    const governance = normalizeStepGovernancePolicy(this.governancePolicy);
    return {
      abortController: null,
      cancelled: false,
      environmentId: "",
      governanceAction: governance.defaultAction,
      result: null,
      running: false,
      targetId: "",
      timeoutHandle: null,
      timeoutMs: 30_000,
      timedOut: false,
    };
  },
  computed: {
    eligibleEnvironments() {
      return this.eligibleResources(this.environments);
    },
    eligibleTargets() {
      return this.eligibleResources(this.targets);
    },
    governance() {
      return normalizeStepGovernancePolicy(this.governancePolicy);
    },
    normalizedImpact() {
      return normalizeStepImpact(this.impact, { tenantId: this.tenantId });
    },
  },
  beforeUnmount() {
    this.abortController?.abort();
    clearTimeout(this.timeoutHandle);
  },
  methods: {
    cancelTest() {
      if (!this.running) return;
      this.timedOut = false;
      this.cancelled = true;
      this.abortController?.abort();
      this.result = normalizeStepTestResult({ status: "cancelled" });
      this.running = false;
      clearTimeout(this.timeoutHandle);
    },
    eligibleResources(resources) {
      return resources.filter(
        (resource) =>
          resource.authorized === true &&
          String(resource.tenantId) === String(this.tenantId) &&
          (resource.runtimes ?? []).includes(this.runtime),
      );
    },
    format(template, values) {
      return Object.entries(values).reduce(
        (message, [key, value]) =>
          message.replaceAll(`{${key}}`, String(value)),
        template,
      );
    },
    async runTest() {
      const prepared = createStepTestRequest(
        {
          environmentId: this.environmentId,
          runtime: this.runtime,
          stepId: this.stepId,
          targetId: this.targetId,
          timeoutMs: this.timeoutMs,
        },
        {
          environments: this.environments,
          targets: this.targets,
          tenantId: this.tenantId,
        },
      );
      if (prepared.request == null) {
        this.result = normalizeStepTestResult({
          remediationCode: "selectionUnavailable",
          status: "unavailable",
        });
        return;
      }
      this.running = true;
      this.timedOut = false;
      this.cancelled = false;
      this.abortController = new AbortController();
      this.timeoutHandle = setTimeout(() => {
        this.timedOut = true;
        this.abortController.abort();
      }, prepared.request.timeoutMs);
      try {
        const rawResult = await this.executor(prepared.request, {
          signal: this.abortController.signal,
        });
        this.result = normalizeStepTestResult(rawResult);
      } catch (error) {
        this.result = normalizeStepTestResult({
          remediationCode: this.cancelled
            ? "cancelled"
            : error?.code === "TARGET_UNAVAILABLE"
              ? "targetUnavailable"
              : this.timedOut
                ? "timeout"
                : "validationFailed",
          status: this.cancelled
            ? "cancelled"
            : error?.code === "TARGET_UNAVAILABLE"
              ? "unavailable"
              : this.timedOut
                ? "timeout"
                : "failed",
        });
      } finally {
        clearTimeout(this.timeoutHandle);
        this.running = false;
        this.abortController = null;
      }
    },
  },
};
</script>

<style scoped>
.step-test-panel {
  display: grid;
  gap: var(--id-space-4);
}

.step-test-panel h2,
.step-test-panel p {
  margin: 0;
}

.step-test-panel__selection,
.step-test-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
}

.step-test-panel__selection label {
  display: grid;
  flex: 1 1 12rem;
  gap: var(--id-space-2);
}

.step-test-panel__result,
.step-test-panel__impact,
.step-test-panel fieldset {
  display: grid;
  gap: var(--id-space-3);
  padding: var(--id-space-4);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  background: var(--id-color-surface-raised);
}

.step-test-panel__result ul,
.step-test-panel__impact ul {
  display: grid;
  gap: var(--id-space-2);
  margin: 0;
  padding-inline-start: var(--id-space-5);
}

.step-test-panel__impact li {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-2);
  justify-content: space-between;
}
</style>
