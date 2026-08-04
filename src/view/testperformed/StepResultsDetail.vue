<template>
  <div class="costum step-results-detail-page">
    <section class="card step-results-hero">
      <div>
        <span class="step-results-eyebrow">
          {{ labels.stepResults }}
        </span>
        <h1 class="step-results-title">
          {{ testName }}
        </h1>
        <p class="step-results-description">
          {{ labels.stepResultsDetailDescription }}
        </p>
      </div>
      <button
        type="button"
        class="btn btn-outline-light step-results-back"
        v-on:click="goBackToTestsPerformed()"
      >
        <font-awesome-icon icon="arrow-left" class="iconClass" />
        {{ labels.backToTestResults }}
      </button>
    </section>

    <section class="card step-results-context-panel">
      <div class="step-results-panel-header">
        <div>
          <span class="step-results-section-title">
            {{ labels.executionContext }}
          </span>
          <p class="step-results-helper">
            {{ labels.executionContextHelp }}
          </p>
        </div>
      </div>
      <dl class="step-results-context-grid">
        <div>
          <dt>{{ labels.environment }}</dt>
          <dd>{{ executionContext.environment }}</dd>
        </div>
        <div>
          <dt>{{ labels.browser }}</dt>
          <dd>{{ executionContext.browser }}</dd>
        </div>
        <div>
          <dt>{{ labels.device }}</dt>
          <dd>{{ executionContext.device }}</dd>
        </div>
        <div>
          <dt>{{ labels.operatingSystem }}</dt>
          <dd>{{ executionContext.operatingSystem }}</dd>
        </div>
      </dl>
    </section>

    <section class="card step-results-panel">
      <div class="step-results-panel-header">
        <div>
          <span class="step-results-section-title">
            {{ labels.stepResults }}
          </span>
          <p class="step-results-helper">
            {{ labels.stepResultsDetailHelp }}
          </p>
        </div>
        <span class="step-results-counter">
          {{ selectedTestSteps.length }}
        </span>
      </div>

      <div v-if="selectedTestSteps.length > 0" class="step-results-list">
        <article
          v-for="(step, index) in selectedTestSteps"
          v-bind:key="step.id || index"
          :class="[
            'step-results-row',
            { 'step-results-row--postman': isPostmanExecution(step) },
          ]"
        >
          <span :class="['step-results-status', getStepVariant(step)]">
            {{ getStepStatusLabel(step) }}
          </span>
          <div class="step-results-row-main">
            <strong>{{ step.name }}</strong>
            <small>
              {{ labels.stepDuration }}:
              {{ stepDuration(step) }}
            </small>
          </div>
          <section
            v-if="isPostmanExecution(step)"
            class="step-results-postman-summary"
            :aria-label="postmanLabels.executionResults"
          >
            <span class="step-results-postman-count">
              {{ stepPostmanResults(step).length }}
              {{ postmanLabels.requests }}
            </span>
            <button
              type="button"
              class="btn step-results-more-details"
              v-on:click="openPostmanDetails(step)"
            >
              <font-awesome-icon icon="eye" class="iconClass" />
              {{ postmanLabels.moreDetails }}
            </button>
          </section>
          <span class="step-results-index">#{{ index + 1 }}</span>
        </article>
      </div>

      <div v-else class="step-results-empty step-results-empty-large">
        {{ labels.emptySteps }}
      </div>
    </section>

    <modalPostmanResponse ref="modalPostmanResponseShow" elevated />

    <div
      v-if="postmanDetailsStep"
      class="step-results-modal-backdrop"
      role="presentation"
      v-on:click.self="closePostmanDetails()"
    >
      <section
        class="step-results-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="postmanLabels.executionResults"
      >
        <header class="step-results-modal-header">
          <div>
            <span class="step-results-eyebrow">
              {{ postmanLabels.detailsEyebrow }}
            </span>
            <h2>{{ postmanDetailsStep.name }}</h2>
            <p>{{ postmanLabels.executionResultsHelp }}</p>
          </div>
          <button
            type="button"
            class="btn btn-outline-light step-results-modal-close"
            v-on:click="closePostmanDetails()"
          >
            {{ postmanLabels.close }}
          </button>
        </header>

        <div class="step-results-modal-content">
          <PostmanResultTable
            v-if="postmanDetailsResults.length > 0"
            :results="postmanDetailsResults"
            :labels="postmanLabels"
            @show-response="showPostmanResponse"
          />
          <div v-else class="step-results-empty">
            {{ postmanLabels.emptyResults }}
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import PostmanResultTable from "./PostmanResultTable.vue";
import modalPostmanResponse from "./modalPostmanResponse.vue";
import apiClient from "@/services/apiClient";
import { parsePostmanResults } from "@/domain/postmanResults";

export default {
  name: "StepResultsDetail",
  components: {
    PostmanResultTable,
    modalPostmanResponse,
  },
  data() {
    return {
      selectedTestSteps: [],
      postmanDetailsStep: null,
      runExecutionContext: {},
      testName: "",
    };
  },
  computed: {
    labels() {
      return this.language[this.config.currentLanguage].TestsPerformed;
    },
    postmanLabels() {
      return this.language[this.config.currentLanguage].Postman;
    },
    testId() {
      return this.$route?.params?.testId ?? null;
    },
    projectId() {
      return this.$route?.params?.projectId ?? null;
    },
    backQuery() {
      const query = { ...(this.$route?.query || {}) };
      delete query.testName;
      return query;
    },
    postmanDetailsResults() {
      return this.postmanDetailsStep
        ? this.stepPostmanResults(this.postmanDetailsStep)
        : [];
    },
    runId() {
      return this.$route?.query?.runId ?? null;
    },
    testCycleId() {
      return this.$route?.query?.testCycleId ?? null;
    },
    executionContext() {
      return this.executionContextFor(this.runExecutionContext);
    },
  },
  watch: {
    "$route.params.testId"() {
      this.loadStepResults();
    },
  },
  created() {
    this.testName =
      this.$route?.query?.testName || this.labels.stepResultsDetailFallback;
    this.loadStepResults();
    this.loadExecutionContext();
  },
  methods: {
    goBackToTestsPerformed() {
      if (!this.$router?.push) return;
      this.$router.push({
        name: "testsperformed",
        params: {
          projectId: this.projectId,
        },
        query: this.backQuery,
      });
    },
    loadStepResults() {
      if (this.testId == null) return Promise.resolve([]);
      this.emitter.emit("showLoader", true);
      return apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.getStepPerformed +
            "/" +
            this.testId,
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.selectedTestSteps = Array.isArray(response.data)
            ? response.data
            : [];
          return this.selectedTestSteps;
        })
        .catch((e) => {
          this.emitter.emit("showLoader", false);
          this.Logout(this, e);
          return [];
        });
    },
    loadExecutionContext() {
      if (this.testCycleId == null || this.runId == null) {
        this.runExecutionContext = {};
        return Promise.resolve({});
      }
      return apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.getTestCyclePerformed +
            "/" +
            this.testCycleId,
          {
            headers: this.setHeaders(),
            params: {
              page: this.queryInteger("runPage", 1),
              perPage: this.queryInteger("runPerPage", 25),
              sort: "date",
              direction: "desc",
            },
          },
        )
        .then((response) => {
          const runs = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.data)
              ? response.data.data
              : [];
          const run =
            runs.find((entry) => String(entry.id) === String(this.runId)) || {};
          this.runExecutionContext =
            run.executionContext ?? run.execution_context ?? run.context ?? {};
          return this.runExecutionContext;
        })
        .catch((e) => {
          this.Logout(this, e);
          this.runExecutionContext = {};
          return {};
        });
    },
    getVariant(status) {
      if (status == 0) return "secondary";
      if (status == 1) return "success";
      if (String(status) === "5") return "warning";
      return "danger";
    },
    getStatusLabel(status) {
      if (status == 0) return this.labels.statusPending;
      if (status == 1) return this.labels.statusPassed;
      if (String(status) === "5") return this.labels.statusSkipped;
      return this.labels.statusFailed;
    },
    isPostmanExecution(value) {
      return [
        value?.type,
        value?.runtime,
        value?.stepType,
        value?.step_type,
        value?.actionType,
        value?.name,
      ]
        .filter(Boolean)
        .map((entry) => String(entry).toLowerCase())
        .some((entry) => entry === "postman" || entry.includes("postman"));
    },
    postmanPayload(value) {
      return (
        value?.postmanData ??
        value?.postmanResults ??
        value?.postman_data ??
        value?.results ??
        value?.data ??
        []
      );
    },
    postmanResults(value) {
      if (!this.isPostmanExecution(value)) return [];
      return parsePostmanResults(this.postmanPayload(value));
    },
    stepPostmanResults(step) {
      return this.postmanResults(step);
    },
    openPostmanDetails(step) {
      this.postmanDetailsStep = step;
    },
    closePostmanDetails() {
      this.postmanDetailsStep = null;
    },
    getStepVariant(step) {
      if (
        this.isPostmanExecution(step) &&
        this.stepPostmanResults(step).some((result) => result.passed === false)
      ) {
        return "danger";
      }
      return this.getVariant(step?.status);
    },
    getStepStatusLabel(step) {
      if (this.getStepVariant(step) === "danger") return this.labels.statusFailed;
      return this.getStatusLabel(step?.status);
    },
    showPostmanResponse(result) {
      this.$refs.modalPostmanResponseShow?.showModal?.(result);
    },
    stepDuration(step) {
      const payload = this.safeJsonObject(step?.data);
      const explicitDuration =
        payload.durationMilliseconds ||
        payload.trace?.timing?.durationMilliseconds ||
        step?.durationMilliseconds ||
        step?.durationMs;
      if (Number(explicitDuration) > 0) {
        return this.formatElapsed(Number(explicitDuration));
      }
      return this.formatElapsed(
        this.timestampDiff(step?.created_at, step?.updated_at),
      );
    },
    timestampDiff(start, end) {
      const startMs = Date.parse(String(start || ""));
      const endMs = Date.parse(String(end || ""));
      if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) {
        return 0;
      }
      return endMs - startMs;
    },
    formatElapsed(milliseconds) {
      const value = Number(milliseconds || 0);
      if (value <= 0) return "—";
      if (value >= 1000) {
        return `${(value / 1000).toFixed(value >= 10000 ? 1 : 2)} s`;
      }
      return `${Math.round(value)} ms`;
    },
    queryInteger(name, fallback) {
      const value = this.$route?.query?.[name];
      const firstValue = Array.isArray(value) ? value[0] : value;
      const parsed = Number(firstValue);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
    },
    executionContextFor(rawContext) {
      const context = this.safeJsonObject(rawContext);
      const browser = [context.browser, context.browserVersion]
        .filter(Boolean)
        .join(" ");
      const operatingSystem = [context.platformName, context.platformVersion]
        .filter(Boolean)
        .join(" ");
      return {
        environment:
          context.environmentName || context.environment || this.labels.notCaptured,
        browser: browser || this.labels.notCaptured,
        device:
          context.deviceName ||
          context.device ||
          context.deviceType ||
          this.labels.notCaptured,
        operatingSystem: operatingSystem || this.labels.notCaptured,
      };
    },
    safeJsonObject(value) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return value;
      }
      if (typeof value !== "string" || value.length === 0) return {};
      try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? parsed
          : {};
      } catch {
        return {};
      }
    },
  },
};
</script>

<style scoped>
.step-results-detail-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: calc(100vh - 76px - 3rem);
  min-height: calc(100dvh - 76px - 3rem);
  width: 100%;
}

.step-results-hero,
.step-results-panel,
.step-results-context-panel {
  background:
    radial-gradient(circle at top left, rgba(255, 107, 30, 0.18), transparent 32rem),
    linear-gradient(135deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.025));
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
  box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.2);
  color: #fff;
}

.step-results-hero {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 1.35rem;
}

.step-results-eyebrow,
.step-results-section-title {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.step-results-title {
  font-size: clamp(1.7rem, 3vw, 2.6rem);
  margin: 0.25rem 0;
}

.step-results-description,
.step-results-helper {
  color: rgba(255, 255, 255, 0.74);
  margin: 0;
}

.step-results-back {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  gap: 0.45rem;
}

.step-results-panel {
  padding: 1.25rem;
}

.step-results-context-panel {
  padding: 1.1rem 1.25rem;
}

.step-results-panel-header {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.step-results-context-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 1rem 0 0;
}

.step-results-context-grid div {
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.8rem;
  min-width: 0;
  padding: 0.8rem;
}

.step-results-context-grid dt {
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.step-results-context-grid dd {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 800;
  margin: 0.35rem 0 0;
  overflow-wrap: anywhere;
}

.step-results-counter,
.step-results-postman-count {
  border: 1px solid rgba(255, 107, 30, 0.8);
  border-radius: 999px;
  color: #ffb27c;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.35rem 0.65rem;
  text-transform: uppercase;
}

.step-results-list {
  display: grid;
  gap: 0.8rem;
  margin-top: 1rem;
}

.step-results-row {
  align-items: center;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.9rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
  padding: 1rem;
}

.step-results-row--postman {
  align-items: center;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
}

.step-results-row-main {
  display: grid;
  gap: 0.25rem;
}

.step-results-row-main small,
.step-results-index {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.step-results-status {
  border-radius: 999px;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.4rem 0.65rem;
  text-transform: uppercase;
}

.step-results-status.secondary {
  background: rgba(148, 163, 184, 0.25);
}

.step-results-status.success {
  background: rgba(34, 197, 94, 0.24);
  color: #7ff0a2;
}

.step-results-status.warning {
  background: rgba(245, 158, 11, 0.22);
  color: #ffd17b;
}

.step-results-status.danger {
  background: rgba(239, 68, 68, 0.24);
  color: #ff9a9a;
}

.step-results-postman-summary {
  align-items: center;
  border: 1px solid rgba(255, 107, 30, 0.48);
  border-radius: 0.9rem;
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
  padding: 0.45rem 0.55rem;
  white-space: nowrap;
}

.step-results-more-details {
  align-items: center;
  background: linear-gradient(135deg, #ff7a1a, #ff4d24);
  border: 0;
  border-radius: 999px;
  color: #111827;
  display: inline-flex;
  font-size: 0.72rem;
  font-weight: 900;
  gap: 0.4rem;
  letter-spacing: 0.12em;
  padding: 0.55rem 0.9rem;
  text-transform: uppercase;
}

.step-results-modal-backdrop {
  align-items: center;
  background: rgba(3, 7, 18, 0.78);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 2rem;
  position: fixed;
  z-index: 1080;
}

.step-results-modal {
  background:
    radial-gradient(circle at top left, rgba(255, 107, 30, 0.14), transparent 34rem),
    #20232d;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 1rem;
  box-shadow: 0 2rem 6rem rgba(0, 0, 0, 0.45);
  color: #fff;
  display: flex;
  flex-direction: column;
  max-height: min(88vh, 980px);
  max-width: min(92vw, 1500px);
  overflow: hidden;
  width: 100%;
}

.step-results-modal-header {
  align-items: flex-start;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding: 1.2rem;
}

.step-results-modal-header h2 {
  margin: 0.2rem 0;
}

.step-results-modal-header p {
  color: rgba(255, 255, 255, 0.72);
  margin: 0;
}

.step-results-modal-close {
  border-radius: 999px;
  flex: 0 0 auto;
}

.step-results-modal-content {
  overflow: auto;
  padding: 1.2rem;
}

.step-results-empty {
  align-items: center;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  border-radius: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  min-height: 8rem;
  text-align: center;
}

.step-results-empty-large {
  margin-top: 1rem;
  min-height: 18rem;
}

@media (max-width: 900px) {
  .step-results-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .step-results-row {
    grid-template-columns: 1fr;
  }

  .step-results-context-grid {
    grid-template-columns: 1fr;
  }
}
</style>
