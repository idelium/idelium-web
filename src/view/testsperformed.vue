<template>
  <div class="costum testsperformed-page">
    <section class="card testsperformed-hero">
      <div>
        <span class="testsperformed-eyebrow">
          {{ language[config.currentLanguage].TestsPerformed.pageEyebrow }}
        </span>
        <h1 class="testsperformed-title">
          {{ language[config.currentLanguage].TestsPerformed.pageTitle }}
        </h1>
        <p class="testsperformed-description">
          {{ language[config.currentLanguage].TestsPerformed.pageDescription }}
        </p>
      </div>
      <button
        type="button"
        class="btn btn-outline-light testsperformed-refresh"
        v-on:click="getTestCycles()"
        :title="language[config.currentLanguage].Actions.refresh"
      >
        <font-awesome-icon
          icon="history"
          class="iconClass idelium-action-icon--refresh"
        />
        {{ language[config.currentLanguage].TestsPerformed.refresh }}
      </button>
    </section>

    <section class="testsperformed-summary">
      <article class="card testsperformed-metric">
        <span class="testsperformed-metric-label">
          {{ language[config.currentLanguage].TestsPerformed.columnTestCycle }}
        </span>
        <strong>{{ arrayTestCycles.length }}</strong>
      </article>
      <article class="card testsperformed-metric">
        <span class="testsperformed-metric-label">
          {{
            language[config.currentLanguage].TestsPerformed.columnTestCycleDate
          }}
        </span>
        <strong>{{ arrayTestCyclesDate.length }}</strong>
      </article>
      <article class="card testsperformed-metric">
        <span class="testsperformed-metric-label">
          {{ language[config.currentLanguage].TestsPerformed.columnTest }}
        </span>
        <strong>{{ arrayTest.length }}</strong>
      </article>
      <article class="card testsperformed-metric">
        <span class="testsperformed-metric-label">
          {{ language[config.currentLanguage].TestsPerformed.parallelRuns }}
        </span>
        <strong>{{ parallelRuns.length }}</strong>
      </article>
    </section>

    <section class="card testsperformed-analytics-panel" aria-live="polite">
      <div class="testsperformed-panel-header">
        <div>
          <span class="testsperformed-section-title">
            {{ language[config.currentLanguage].TestsPerformed.analyticsTitle }}
          </span>
          <p class="testsperformed-helper">
            {{
              language[config.currentLanguage].TestsPerformed
                .analyticsDescription
            }}
          </p>
        </div>
        <div class="testsperformed-analytics-filters">
          <label>
            <span>
              {{
                language[config.currentLanguage].TestsPerformed.analyticsWindow
              }}
            </span>
            <input
              v-model="analyticsWindow"
              class="form-control testsperformed-filter-control"
              inputmode="numeric"
              v-on:change="persistAnalyticsFilters()"
            />
          </label>
          <label>
            <span>
              {{
                language[config.currentLanguage].TestsPerformed
                  .analyticsTimezone
              }}
            </span>
            <input
              v-model="analyticsTimezone"
              class="form-control testsperformed-filter-control"
              v-on:change="persistAnalyticsFilters()"
            />
          </label>
        </div>
      </div>
      <p class="testsperformed-helper">{{ analyticsQueryDescription }}</p>
      <div class="testsperformed-analytics-statuses" role="group">
        <button
          v-for="status in analyticsStatusOptions"
          v-bind:key="status"
          type="button"
          :class="[
            'testsperformed-status-filter',
            { active: analyticsStatuses.includes(status) },
          ]"
          v-on:click="toggleAnalyticsStatus(status)"
        >
          {{ statusLabel(status) }}
        </button>
      </div>
      <div class="testsperformed-analytics-grid">
        <article class="testsperformed-analytics-card">
          <span>{{
            language[config.currentLanguage].TestsPerformed.passRate
          }}</span>
          <strong>{{ percent(executionAnalytics.passRate) }}</strong>
        </article>
        <article class="testsperformed-analytics-card">
          <span>{{
            language[config.currentLanguage].TestsPerformed.failureRate
          }}</span>
          <strong>{{ percent(executionAnalytics.failureRate) }}</strong>
        </article>
        <article class="testsperformed-analytics-card">
          <span>{{
            language[config.currentLanguage].TestsPerformed.averageDuration
          }}</span>
          <strong>{{ executionAnalytics.averageDurationMs }} ms</strong>
        </article>
        <article class="testsperformed-analytics-card">
          <span>{{
            language[config.currentLanguage].TestsPerformed.averageQueue
          }}</span>
          <strong>{{ executionAnalytics.averageQueueMs }} ms</strong>
        </article>
      </div>
      <dl class="testsperformed-taxonomy">
        <div
          v-for="(count, failureClass) in executionAnalytics.failuresByClass"
          v-bind:key="failureClass"
        >
          <dt>{{ failureClass }}</dt>
          <dd>{{ count }}</dd>
        </div>
      </dl>
      <div
        v-if="executionAnalytics.flakyTests.length > 0"
        class="testsperformed-flaky-list"
      >
        <span class="testsperformed-section-title">
          {{ language[config.currentLanguage].TestsPerformed.flakyTests }}
        </span>
        <ul>
          <li
            v-for="flakyTest in executionAnalytics.flakyTests"
            v-bind:key="flakyTest.testId || flakyTest.testName"
          >
            {{ flakyTest.testName }}
          </li>
        </ul>
      </div>
    </section>

    <section class="card testsperformed-parallel-panel" aria-live="polite">
      <div class="testsperformed-panel-header">
        <div>
          <span class="testsperformed-section-title">
            {{ language[config.currentLanguage].TestsPerformed.parallelRuns }}
          </span>
          <p class="testsperformed-helper">
            {{
              language[config.currentLanguage].TestsPerformed
                .parallelRunsDescription
            }}
          </p>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-outline-light testsperformed-icon-button"
          v-on:click="loadParallelRuns()"
          :title="language[config.currentLanguage].Actions.refresh"
        >
          <font-awesome-icon
            icon="history"
            class="idelium-action-icon--refresh"
          />
        </button>
      </div>
      <div v-if="parallelRuns.length > 0" class="testsperformed-parallel-grid">
        <article
          v-for="run in parallelRuns"
          v-bind:key="run.id"
          class="testsperformed-parallel-card"
        >
          <div class="testsperformed-parallel-card-header">
            <div>
              <span
                :class="[
                  'testsperformed-status',
                  parallelRunVariant(run.status),
                ]"
              >
                {{ parallelRunStatusLabel(run.status) }}
              </span>
              <strong>
                {{
                  language[config.currentLanguage].TestsPerformed
                    .parallelRunLabel
                }}
                #{{ run.id }}
              </strong>
            </div>
            <button
              v-if="canCancelParallelRun(run)"
              type="button"
              class="btn btn-sm btn-outline-light testsperformed-cancel-button"
              v-on:click="confirmCancelParallelRun(run)"
            >
              {{ language[config.currentLanguage].TestsPerformed.cancelRun }}
            </button>
          </div>
          <dl class="testsperformed-worker-metrics">
            <div>
              <dt>
                {{
                  language[config.currentLanguage].TestsPerformed
                    .workerConcurrency
                }}
              </dt>
              <dd>{{ run.activeWorkers }}/{{ run.requestedConcurrency }}</dd>
            </div>
            <div>
              <dt>
                {{
                  language[config.currentLanguage].TestsPerformed
                    .workerCompleted
                }}
              </dt>
              <dd>{{ run.completedWorkers }}</dd>
            </div>
            <div>
              <dt>
                {{
                  language[config.currentLanguage].TestsPerformed.workerFailed
                }}
              </dt>
              <dd>{{ run.failedWorkers }}</dd>
            </div>
            <div>
              <dt>
                {{
                  language[config.currentLanguage].TestsPerformed
                    .workerCancelled
                }}
              </dt>
              <dd>{{ run.cancelledWorkers }}</dd>
            </div>
          </dl>
          <p
            v-if="classifyParallelRunFailure(run)"
            class="testsperformed-failure-classification"
          >
            {{ classifyParallelRunFailure(run) }}
          </p>
          <ul
            v-if="parallelResultSummary(run).length > 0"
            class="testsperformed-worker-list"
          >
            <li
              v-for="worker in parallelResultSummary(run)"
              v-bind:key="worker.workerId"
            >
              <span>{{ worker.workerId }}</span>
              <span
                :class="[
                  'testsperformed-worker-state',
                  parallelRunVariant(worker.status),
                ]"
              >
                {{ parallelRunStatusLabel(worker.status) }}
              </span>
            </li>
          </ul>
        </article>
      </div>
      <div v-else class="testsperformed-empty testsperformed-empty-compact">
        {{ language[config.currentLanguage].TestsPerformed.emptyParallelRuns }}
      </div>
    </section>

    <section class="testsperformed-workspace">
      <article class="card testsperformed-panel">
        <div class="testsperformed-panel-header">
          <div>
            <span class="testsperformed-section-title">
              {{
                language[config.currentLanguage].TestsPerformed.columnTestCycle
              }}
            </span>
            <p class="testsperformed-helper">
              {{ language[config.currentLanguage].TestsPerformed.selectCycle }}
            </p>
          </div>
          <span class="testsperformed-counter">{{
            arrayTestCycles.length
          }}</span>
        </div>
        <div
          v-if="arrayTestCycles.length > 0"
          class="list-group testsperformed-list"
        >
          <button
            :class="[
              'list-group-item',
              'testsperformed-item',
              { active: testCycleSelected == testCycle.id },
            ]"
            v-for="testCycle in arrayTestCycles"
            v-bind:key="testCycle.id"
            type="button"
            v-on:click="getTestCyclesDate(testCycle.id)"
            :title="language[config.currentLanguage].TestsPerformed.selectRun"
          >
            <span class="testsperformed-item-icon">
              <font-awesome-icon
                icon="sync"
                class="idelium-action-icon--refresh"
              />
            </span>
            <span class="testsperformed-item-main">
              <strong>{{ testCycle.name }}</strong>
            </span>
          </button>
        </div>
        <div
          v-if="arrayTestCyclesDate.length === 0"
          class="testsperformed-empty"
        >
          {{ language[config.currentLanguage].TestsPerformed.emptyCycles }}
        </div>
      </article>

      <article class="card testsperformed-panel">
        <div class="testsperformed-panel-header">
          <div>
            <span class="testsperformed-section-title">
              {{
                language[config.currentLanguage].TestsPerformed
                  .columnTestCycleDate
              }}
            </span>
            <p class="testsperformed-helper">
              {{ language[config.currentLanguage].TestsPerformed.selectRun }}
            </p>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-outline-light testsperformed-icon-button"
            :disabled="testCycleSelected == null"
            v-on:click="getTestCyclesDate(testCycleSelected)"
            :title="language[config.currentLanguage].Actions.refresh"
          >
            <font-awesome-icon
              icon="history"
              class="idelium-action-icon--refresh"
            />
          </button>
        </div>
        <div
          v-if="arrayTestCyclesDate.length > 0"
          class="list-group testsperformed-list"
        >
          <button
            :class="[
              'list-group-item',
              'testsperformed-item',
              { active: testCycleDateSelected == testCycleDate.id },
            ]"
            v-for="testCycleDate in arrayTestCyclesDate"
            v-bind:key="testCycleDate.id"
            type="button"
            v-on:click="getTest(testCycleDate.id)"
            :title="language[config.currentLanguage].TestsPerformed.openDetails"
          >
            <span class="testsperformed-item-icon">
              <font-awesome-icon
                icon="clock"
                class="idelium-action-icon--refresh"
              />
            </span>
            <span class="testsperformed-item-main">
              <strong>{{ testCycleDate.date }}</strong>
              <span class="testsperformed-report-toolbar">
                <button
                  v-for="format in reportFormats"
                  v-bind:key="format"
                  type="button"
                  class="testsperformed-report-button"
                  :disabled="!isReportFormatAvailable(testCycleDate, format)"
                  :aria-label="reportButtonLabel(testCycleDate, format)"
                  :title="reportButtonLabel(testCycleDate, format)"
                  v-on:click.stop="downloadReport(testCycleDate, format)"
                >
                  {{ format.toUpperCase() }}
                </button>
              </span>
              <span
                v-if="reportDownloadErrorFor(testCycleDate.id)"
                class="testsperformed-report-error"
                role="alert"
              >
                {{ reportDownloadErrorFor(testCycleDate.id) }}
              </span>
            </span>
          </button>
        </div>
        <div
          v-if="runPagination.total != null"
          class="testsperformed-pagination"
          aria-live="polite"
        >
          <button
            type="button"
            class="btn btn-sm btn-outline-light testsperformed-page-button"
            :disabled="runPagination.page <= 1"
            v-on:click="changeRunPage(-1)"
          >
            {{ language[config.currentLanguage].TestsPerformed.previousPage }}
          </button>
          <span>{{ paginationLabel(runPagination) }}</span>
          <button
            type="button"
            class="btn btn-sm btn-outline-light testsperformed-page-button"
            :disabled="runPagination.page >= runPagination.lastPage"
            v-on:click="changeRunPage(1)"
          >
            {{ language[config.currentLanguage].TestsPerformed.nextPage }}
          </button>
        </div>
        <div v-else class="testsperformed-empty">
          {{
            testCycleSelected == null
              ? language[config.currentLanguage].TestsPerformed.selectCycleFirst
              : language[config.currentLanguage].TestsPerformed.emptyRuns
          }}
        </div>
      </article>

      <article class="card testsperformed-panel testsperformed-tests-panel">
        <div class="testsperformed-panel-header">
          <div>
            <span class="testsperformed-section-title">
              {{ language[config.currentLanguage].TestsPerformed.columnTest }}
            </span>
            <p class="testsperformed-helper">
              {{ language[config.currentLanguage].TestsPerformed.openDetails }}
            </p>
          </div>
          <span class="testsperformed-counter">{{ arrayTest.length }}</span>
        </div>
        <div v-if="arrayTest.length > 0" class="testsperformed-test-grid">
          <button
            class="card testsperformed-test-card"
            v-for="test in arrayTest"
            v-bind:key="test.id"
            type="button"
            v-on:click="getStep(test.id, test.name)"
            :title="language[config.currentLanguage].TestsPerformed.viewDetails"
          >
            <span :class="['testsperformed-status', getTestVariant(test)]">
              {{ getTestStatusLabel(test) }}
            </span>
            <strong>{{ test.name }}</strong>
            <span class="testsperformed-detail-link">
              {{ language[config.currentLanguage].TestsPerformed.viewDetails }}
            </span>
          </button>
        </div>
        <div
          v-if="testPagination.total != null"
          class="testsperformed-pagination"
          aria-live="polite"
        >
          <button
            type="button"
            class="btn btn-sm btn-outline-light testsperformed-page-button"
            :disabled="testPagination.page <= 1"
            v-on:click="changeTestPage(-1)"
          >
            {{ language[config.currentLanguage].TestsPerformed.previousPage }}
          </button>
          <span>{{ paginationLabel(testPagination) }}</span>
          <button
            type="button"
            class="btn btn-sm btn-outline-light testsperformed-page-button"
            :disabled="testPagination.page >= testPagination.lastPage"
            v-on:click="changeTestPage(1)"
          >
            {{ language[config.currentLanguage].TestsPerformed.nextPage }}
          </button>
        </div>
        <div
          v-if="arrayTest.length === 0"
          class="testsperformed-empty testsperformed-empty-large"
        >
          {{
            testCycleDateSelected == null
              ? language[config.currentLanguage].TestsPerformed.selectRunFirst
              : language[config.currentLanguage].TestsPerformed.emptyTests
          }}
        </div>
      </article>
    </section>
    <modalTestPerformed ref="modalTestPerformed" :test="arrayTest" />
  </div>
</template>
<style scoped>
.testsperformed-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: calc(100vh - 76px - 3rem);
  height: calc(100dvh - 76px - 3rem);
  margin: 0 auto;
  max-width: 100%;
  min-height: 0;
  overflow: hidden;
  width: 100%;
}

.testsperformed-hero {
  align-items: center;
  background:
    radial-gradient(
      circle at top left,
      rgba(255, 107, 30, 0.18),
      transparent 32rem
    ),
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.075),
      rgba(255, 255, 255, 0.025)
    );
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex: 0 0 auto;
  justify-content: space-between;
  padding: 1.35rem;
}

.testsperformed-eyebrow,
.testsperformed-section-title,
.testsperformed-metric-label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.testsperformed-title {
  color: #ffffff;
  font-size: clamp(1.6rem, 2.5vw, 2.4rem);
  margin: 0.35rem 0;
}

.testsperformed-description,
.testsperformed-helper {
  color: rgba(255, 255, 255, 0.66);
  margin: 0;
}

.testsperformed-refresh {
  align-items: center;
  border-color: rgba(255, 255, 255, 0.18);
  display: inline-flex;
  gap: 0.45rem;
  white-space: nowrap;
}

.testsperformed-summary {
  display: grid;
  flex: 0 0 auto;
  gap: 1rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.testsperformed-metric {
  padding: 1rem;
}

.testsperformed-metric strong {
  color: #ffffff;
  display: block;
  font-size: 2rem;
  line-height: 1;
  margin-top: 0.35rem;
}

.testsperformed-analytics-panel {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
}

.testsperformed-analytics-filters,
.testsperformed-analytics-statuses {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.testsperformed-analytics-filters label {
  color: rgba(255, 255, 255, 0.72);
  display: grid;
  font-size: 0.68rem;
  font-weight: 800;
  gap: 0.35rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.testsperformed-filter-control {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #ffffff;
  min-width: 8rem;
}

.testsperformed-status-filter {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  padding: 0.45rem 0.75rem;
  text-transform: uppercase;
}

.testsperformed-status-filter.active {
  background: linear-gradient(135deg, #ff8a1d, #ff5f2d);
  border-color: rgba(255, 138, 29, 0.76);
  color: #10131d;
}

.testsperformed-analytics-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.testsperformed-analytics-card {
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.9rem;
  padding: 0.85rem;
}

.testsperformed-analytics-card span {
  color: rgba(255, 255, 255, 0.62);
  display: block;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.testsperformed-analytics-card strong {
  color: #ffffff;
  display: block;
  font-size: 1.45rem;
  margin-top: 0.35rem;
}

.testsperformed-taxonomy {
  display: grid;
  gap: 0.55rem;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin: 0;
}

.testsperformed-taxonomy div {
  align-items: center;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.7rem;
  display: flex;
  justify-content: space-between;
  padding: 0.55rem 0.7rem;
}

.testsperformed-taxonomy dt {
  color: rgba(255, 255, 255, 0.64);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.testsperformed-taxonomy dd {
  color: #ffffff;
  font-weight: 800;
  margin: 0;
}

.testsperformed-flaky-list ul {
  color: rgba(255, 255, 255, 0.78);
  margin: 0.45rem 0 0;
}

.testsperformed-workspace {
  display: grid;
  flex: 1 1 auto;
  gap: 1rem;
  grid-template-columns: minmax(16rem, 0.85fr) minmax(16rem, 0.95fr) minmax(
      24rem,
      1.6fr
    );
  min-height: 0;
  overflow: hidden;
}

.testsperformed-parallel-panel {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  max-height: 20rem;
  min-height: 12rem;
  overflow: hidden;
  padding: 1rem;
}

.testsperformed-parallel-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  overflow-y: auto;
  padding-right: 0.25rem;
}

.testsperformed-parallel-card {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.06), transparent),
    rgba(9, 21, 37, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.95rem;
  color: rgba(255, 255, 255, 0.86);
  padding: 1rem;
}

.testsperformed-parallel-card-header {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.testsperformed-parallel-card-header strong {
  color: #ffffff;
  display: block;
  margin-top: 0.55rem;
}

.testsperformed-cancel-button {
  border-color: rgba(255, 143, 155, 0.42);
  color: #ffd2d7;
  white-space: nowrap;
}

.testsperformed-worker-metrics {
  display: grid;
  gap: 0.55rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 1rem 0;
}

.testsperformed-worker-metrics div {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.65rem;
  padding: 0.65rem;
}

.testsperformed-worker-metrics dt {
  color: rgba(255, 255, 255, 0.54);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.testsperformed-worker-metrics dd {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0.25rem 0 0;
}

.testsperformed-failure-classification {
  background: rgba(220, 53, 69, 0.12);
  border: 1px solid rgba(220, 53, 69, 0.25);
  border-radius: 0.75rem;
  color: #ffb0b8;
  margin: 0 0 0.85rem;
  padding: 0.7rem;
}

.testsperformed-worker-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.testsperformed-worker-list li {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.testsperformed-worker-state {
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 0.22rem 0.5rem;
  text-transform: uppercase;
}

.testsperformed-status.running,
.testsperformed-worker-state.running {
  background: rgba(13, 110, 253, 0.18);
  color: #8ec5ff;
}

.testsperformed-worker-state.secondary {
  background: rgba(148, 163, 184, 0.18);
  color: #cbd5e1;
}

.testsperformed-worker-state.success {
  background: rgba(25, 135, 84, 0.2);
  color: #75d7a0;
}

.testsperformed-worker-state.danger {
  background: rgba(220, 53, 69, 0.2);
  color: #ff8f9b;
}

.testsperformed-empty-compact {
  min-height: 7rem;
}

.testsperformed-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 1rem;
}

.testsperformed-panel-header {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.testsperformed-counter {
  align-items: center;
  background: rgba(255, 107, 30, 0.16);
  border: 1px solid rgba(255, 107, 30, 0.5);
  border-radius: 999px;
  color: #ffd1b8;
  display: inline-flex;
  font-weight: 800;
  justify-content: center;
  min-width: 2rem;
  padding: 0.25rem 0.65rem;
}

.testsperformed-list,
.testsperformed-test-grid {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 0.65rem;
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.testsperformed-item,
.testsperformed-test-card {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 0.75rem;
  color: rgba(255, 255, 255, 0.88);
  text-align: left;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.testsperformed-item {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  padding: 0.8rem;
}

.testsperformed-item:hover,
.testsperformed-test-card:hover {
  border-color: rgba(255, 107, 30, 0.55);
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.2);
  color: #ffffff;
  transform: translateY(-1px);
}

.testsperformed-item.active {
  background: linear-gradient(
    135deg,
    rgba(255, 107, 30, 0.26),
    rgba(255, 139, 35, 0.1)
  );
  border-color: rgba(255, 107, 30, 0.7);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  color: #ffffff !important;
}

.testsperformed-item-icon {
  align-items: center;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 0.65rem;
  display: inline-flex;
  height: 2.25rem;
  justify-content: center;
  width: 2.25rem;
}

.testsperformed-item-main {
  min-width: 0;
}

.testsperformed-report-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.55rem;
}

.testsperformed-report-button {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  color: #dbeafe;
  cursor: pointer;
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 0.22rem 0.5rem;
}

.testsperformed-report-button:focus-visible {
  outline: 2px solid #ffb37a;
  outline-offset: 2px;
}

.testsperformed-report-button:disabled {
  color: rgba(255, 255, 255, 0.36);
  cursor: not-allowed;
  opacity: 0.52;
}

.testsperformed-report-error {
  color: #ffb0b8;
  display: block;
  font-size: 0.76rem;
  margin-top: 0.45rem;
}

.testsperformed-pagination {
  align-items: center;
  color: rgba(255, 255, 255, 0.72);
  display: flex;
  font-size: 0.78rem;
  gap: 0.75rem;
  justify-content: center;
  letter-spacing: 0.08em;
  margin-top: 1rem;
  text-transform: uppercase;
}

.testsperformed-page-button {
  border-radius: 999px;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  min-width: 6rem;
  text-transform: uppercase;
}

.testsperformed-test-grid {
  max-height: none;
}

.testsperformed-test-card {
  cursor: pointer;
  gap: 0.55rem;
  padding: 1rem;
}

.testsperformed-status {
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 0.28rem 0.6rem;
  text-transform: uppercase;
  width: max-content;
}

.testsperformed-status.secondary {
  background: rgba(148, 163, 184, 0.18);
  color: #cbd5e1;
}

.testsperformed-status.success {
  background: rgba(25, 135, 84, 0.2);
  color: #75d7a0;
}

.testsperformed-status.danger {
  background: rgba(220, 53, 69, 0.2);
  color: #ff8f9b;
}

.testsperformed-detail-link {
  color: #ffb37a;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.testsperformed-empty {
  align-items: center;
  border: 1px dashed rgba(255, 255, 255, 0.16);
  border-radius: 0.9rem;
  color: rgba(255, 255, 255, 0.58);
  display: flex;
  flex: 1 1 auto;
  justify-content: center;
  min-height: 10rem;
  overflow: hidden;
  padding: 1.25rem;
  text-align: center;
}

.testsperformed-empty-large {
  min-height: 10rem;
}

.testsperformed-icon-button:disabled {
  opacity: 0.35;
}

.iconClass {
  margin-right: 5px;
}

@media (max-width: 1180px) {
  .testsperformed-page {
    height: auto;
    min-height: calc(100vh - 76px - 3rem);
    min-height: calc(100dvh - 76px - 3rem);
    overflow: visible;
  }

  .testsperformed-workspace {
    grid-template-columns: 1fr;
    overflow: visible;
  }

  .testsperformed-panel {
    min-height: auto;
  }

  .testsperformed-list,
  .testsperformed-test-grid {
    max-height: 24rem;
  }
}

@media (max-width: 760px) {
  .testsperformed-hero {
    align-items: flex-start;
    flex-direction: column;
    gap: 1rem;
  }

  .testsperformed-summary {
    grid-template-columns: 1fr;
  }

  .testsperformed-worker-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

<script>
import modalTestPerformed from "./testperformed/modalTestPerformed.vue";

import apiClient from "@/services/apiClient";
import { parsePostmanResults } from "@/domain/postmanResults";
import {
  buildAnalyticsQuery,
  canDownloadExport,
  normalizeExportDescriptor,
  summarizeExecutionTrends,
} from "@/domain/resultAnalytics";
import { getSelectedProjectId } from "@/stores/session";

export default {
  name: "TestsPerformedComponent",
  components: {
    modalTestPerformed,
  },
  data() {
    return {
      arrayTestCycles: [],
      testCycleSelected: null,
      arrayTestCyclesDate: [],
      testCycleDateSelected: null,
      arrayTest: [],
      testSelected: null,
      spinreverse: null,
      spinreverseDate: null,
      parallelRuns: [],
      parallelRunPoller: null,
      parallelRunAbortController: null,
      reportDownloadErrors: {},
      reportFormats: ["junit", "json", "markdown", "html"],
      analyticsWindow: "7d",
      analyticsTimezone: "UTC",
      analyticsStatuses: ["passed", "failed", "pending"],
      analyticsStatusOptions: ["passed", "failed", "pending", "cancelled"],
      runPagination: {
        page: 1,
        perPage: 25,
        total: null,
        lastPage: 1,
        sort: "date",
        direction: "desc",
      },
      testPagination: {
        page: 1,
        perPage: 25,
        total: null,
        lastPage: 1,
        sort: "id",
        direction: "asc",
      },
    };
  },
  computed: {
    analyticsExecutions() {
      return this.arrayTest
        .map((test) => this.analyticsExecutionForTest(test))
        .filter((test) => this.analyticsStatuses.includes(test.status));
    },
    executionAnalytics() {
      return summarizeExecutionTrends(this.analyticsExecutions, {
        window: this.analyticsWindow,
        timezone: this.analyticsTimezone,
      });
    },
    analyticsQueryDescription() {
      return buildAnalyticsQuery({
        projectId: getSelectedProjectId(),
        testCycleId: this.testCycleSelected,
        window: this.analyticsWindow,
        timezone: this.analyticsTimezone,
        statuses: this.analyticsStatuses,
      }).toString();
    },
  },
  watch: {
    $route() {
      this.stopParallelRunPolling();
      this.loadParallelRuns();
      this.startParallelRunPolling();
      this.restoreAnalyticsFiltersFromRoute();
      this.syncSelectionFromRoute();
      this.$forceUpdate();
    },
  },
  created() {
    this.restoreAnalyticsFiltersFromRoute();
    this.getTestCycles({ restoreFromRoute: true });
    this.loadParallelRuns();
    this.startParallelRunPolling();
    this.emitter.on("refreshTestCyclePerformed", (msg) => {
      if (msg == true) {
        this.getTestCycles({ restoreFromRoute: true });
        this.loadParallelRuns();
      } else this.$forceUpdate();
    });
  },
  beforeUnmount() {
    this.stopParallelRunPolling();
  },
  methods: {
    getVariant(status) {
      let variant = null;
      if (status == 0) {
        variant = "secondary";
      } else if (status == 1) {
        variant = "success";
      } else {
        variant = "danger";
      }
      return variant;
    },
    getStatusLabel(status) {
      if (status == 0) {
        return this.language[this.config.currentLanguage].TestsPerformed
          .statusPending;
      }
      if (status == 1) {
        return this.language[this.config.currentLanguage].TestsPerformed
          .statusPassed;
      }
      return this.language[this.config.currentLanguage].TestsPerformed
        .statusFailed;
    },
    statusLabel(status) {
      const labels = this.language[this.config.currentLanguage].TestsPerformed;
      const key = "status" + status.charAt(0).toUpperCase() + status.slice(1);
      return labels[key] || status;
    },
    percent(value) {
      return `${Math.round(value * 100)}%`;
    },
    postmanResults(test) {
      if (test?.type !== "postman") {
        return [];
      }
      return parsePostmanResults(test.postmanData ?? test.data ?? []);
    },
    isPostmanTestFailed(test) {
      return this.postmanResults(test).some(
        (result) => result.passed === false,
      );
    },
    getTestVariant(test) {
      if (this.isPostmanTestFailed(test)) {
        return "danger";
      }
      return this.getVariant(test?.status);
    },
    getTestStatusLabel(test) {
      if (this.isPostmanTestFailed(test)) {
        return this.language[this.config.currentLanguage].TestsPerformed
          .statusFailed;
      }
      return this.getStatusLabel(test?.status);
    },
    analyticsExecutionForTest(test) {
      const postmanFailed = this.isPostmanTestFailed(test);
      const status = postmanFailed
        ? "failed"
        : this.analyticsStatusFromLegacy(test?.status);
      const firstPostmanFailure = this.postmanResults(test).find(
        (result) => result.passed === false,
      );

      return {
        id: test?.id,
        testId: test?.idTest ?? test?.testId ?? test?.id,
        testName: test?.name,
        status,
        durationMs: test?.durationMs ?? test?.duration ?? test?.time ?? 0,
        queueMs: test?.queueMs ?? test?.queueTime ?? 0,
        errorClass: test?.errorClass ?? test?.failureClass,
        diagnostic:
          firstPostmanFailure?.diagnostic ||
          firstPostmanFailure?.message ||
          test?.diagnostic ||
          test?.message ||
          "",
      };
    },
    analyticsStatusFromLegacy(status) {
      if (status === 1 || status === "passed" || status === "success") {
        return "passed";
      }
      if (status === 2 || status === "failed" || status === "error") {
        return "failed";
      }
      if (status === "cancelled") return "cancelled";
      return "pending";
    },
    parallelRunEndpoint(runId = null, suffix = "") {
      const base =
        this.config.serviceBaseUrl +
        this.config.url.parallelRuns +
        "/" +
        getSelectedProjectId() +
        "/parallel-runs";
      return runId == null ? base + suffix : base + "/" + runId + suffix;
    },
    loadParallelRuns() {
      this.cancelParallelRunRequest();
      this.parallelRunAbortController =
        typeof AbortController === "undefined" ? null : new AbortController();
      apiClient
        .get(this.parallelRunEndpoint(), {
          headers: this.setHeaders(),
          signal: this.parallelRunAbortController?.signal,
        })
        .then((response) => {
          this.parallelRuns = Array.isArray(response.data) ? response.data : [];
        })
        .catch((e) => {
          if (e?.code === "ERR_CANCELED") return;
          this.Logout(this, e);
          this.error = e;
        });
    },
    startParallelRunPolling() {
      if (this.parallelRunPoller != null) return;
      this.parallelRunPoller = window.setInterval(() => {
        this.loadParallelRuns();
      }, this.config.timeCheck || 5000);
    },
    stopParallelRunPolling() {
      if (this.parallelRunPoller != null) {
        window.clearInterval(this.parallelRunPoller);
        this.parallelRunPoller = null;
      }
      this.cancelParallelRunRequest();
    },
    cancelParallelRunRequest() {
      this.parallelRunAbortController?.abort();
      this.parallelRunAbortController = null;
    },
    parallelRunVariant(status) {
      if (status === "completed") return "success";
      if (status === "failed" || status === "cancelled") return "danger";
      if (status === "running") return "running";
      return "secondary";
    },
    parallelRunStatusLabel(status) {
      const labels =
        this.language[this.config.currentLanguage].TestsPerformed
          .parallelStatuses;
      return labels?.[status] || status || labels?.unknown || "Unknown";
    },
    canCancelParallelRun(run) {
      return ["queued", "running", "cancelling"].includes(run?.status);
    },
    parallelResultSummary(run) {
      return Array.isArray(run?.resultSummary) ? run.resultSummary : [];
    },
    classifyParallelRunFailure(run) {
      const labels =
        this.language[this.config.currentLanguage].TestsPerformed
          .failureClasses;
      if (run?.failedWorkers > 0) return labels.workerFailure;
      if (run?.status === "cancelled" || run?.cancelledWorkers > 0) {
        return labels.cancelled;
      }
      if (run?.status === "failed") return labels.executionFailure;
      return null;
    },
    advertisedReports(run) {
      const source =
        run?.reports ?? run?.availableReports ?? run?.exports ?? [];
      if (Array.isArray(source)) {
        return source.reduce((reports, report) => {
          const format = (report?.format || report?.type || "").toLowerCase();
          if (format) reports[format] = report;
          return reports;
        }, {});
      }
      return Object.entries(source).reduce((reports, [format, report]) => {
        reports[format.toLowerCase()] =
          report === true ? { format, endpoint: null } : report;
        return reports;
      }, {});
    },
    reportDescriptor(run, format) {
      return this.advertisedReports(run)[format] ?? null;
    },
    isReportFormatAvailable(run, format) {
      const descriptor = this.reportDescriptor(run, format);
      if (descriptor == null) return false;
      if (
        typeof descriptor === "object" &&
        ("status" in descriptor ||
          "authorized" in descriptor ||
          "expiresAt" in descriptor)
      ) {
        return canDownloadExport(
          normalizeExportDescriptor({
            ...descriptor,
            url: this.safeDescriptorDownloadUrl(descriptor),
          }),
        );
      }
      return true;
    },
    reportButtonLabel(run, format) {
      const labels = this.language[this.config.currentLanguage].TestsPerformed;
      const state = this.isReportFormatAvailable(run, format)
        ? labels.downloadReport
        : labels.reportUnavailable;
      return `${state}: ${format.toUpperCase()} ${labels.reportForRun} #${run.id}`;
    },
    reportDownloadErrorFor(runId) {
      return this.reportDownloadErrors[runId] || null;
    },
    routeQueryId(name) {
      const value = this.$route?.query?.[name];
      const firstValue = Array.isArray(value) ? value[0] : value;
      const parsed = Number(firstValue);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    },
    routeQueryInteger(name, fallback) {
      const parsed = this.routeQueryId(name);
      return parsed == null ? fallback : parsed;
    },
    routeQueryText(name, fallback) {
      const value = this.$route?.query?.[name];
      const firstValue = Array.isArray(value) ? value[0] : value;
      return typeof firstValue === "string" && firstValue.trim() !== ""
        ? firstValue
        : fallback;
    },
    routeQueryList(name) {
      const value = this.$route?.query?.[name];
      if (Array.isArray(value)) return value.filter(Boolean);
      if (typeof value === "string" && value.trim() !== "") {
        return value.split(",").filter(Boolean);
      }
      return [];
    },
    replaceExecutionQuery(patch) {
      if (!this.$router?.replace) return;
      const nextQuery = {
        ...(this.$route?.query || {}),
        ...patch,
      };
      Object.keys(nextQuery).forEach((key) => {
        if (
          nextQuery[key] === null ||
          typeof nextQuery[key] === "undefined" ||
          nextQuery[key] === ""
        ) {
          delete nextQuery[key];
        }
      });
      const current = JSON.stringify(this.$route?.query || {});
      const next = JSON.stringify(nextQuery);
      if (current === next) return;
      this.$router.replace({ query: nextQuery });
    },
    restoreAnalyticsFiltersFromRoute() {
      this.analyticsWindow = this.routeQueryText("analyticsWindow", "7d");
      this.analyticsTimezone = this.routeQueryText("analyticsTimezone", "UTC");
      const statuses = this.routeQueryList("status").filter((status) =>
        this.analyticsStatusOptions.includes(status),
      );
      this.analyticsStatuses =
        statuses.length > 0 ? statuses : ["passed", "failed", "pending"];
    },
    persistAnalyticsFilters() {
      this.replaceExecutionQuery({
        analyticsWindow: this.analyticsWindow,
        analyticsTimezone: this.analyticsTimezone,
        status: this.analyticsStatuses.join(","),
      });
    },
    toggleAnalyticsStatus(status) {
      if (this.analyticsStatuses.includes(status)) {
        this.analyticsStatuses = this.analyticsStatuses.filter(
          (entry) => entry !== status,
        );
      } else {
        this.analyticsStatuses = [...this.analyticsStatuses, status];
      }
      if (this.analyticsStatuses.length === 0) {
        this.analyticsStatuses = ["passed", "failed", "pending"];
      }
      this.persistAnalyticsFilters();
    },
    restoreSelectionFromRoute() {
      const testCycleId = this.routeQueryId("testCycleId");
      if (testCycleId == null) return;

      this.getTestCyclesDate(testCycleId, { syncRoute: false }).then(() => {
        const runId = this.routeQueryId("runId");
        if (runId != null) {
          this.getTest(runId, { syncRoute: false });
        }
      });
    },
    syncSelectionFromRoute() {
      const testCycleId = this.routeQueryId("testCycleId");
      const runId = this.routeQueryId("runId");
      if (testCycleId == null && runId == null) {
        this.arrayTestCyclesDate = [];
        this.arrayTest = [];
        this.testCycleSelected = null;
        this.testCycleDateSelected = null;
        return;
      }
      if (
        testCycleId !== this.testCycleSelected ||
        (runId != null && runId !== this.testCycleDateSelected)
      ) {
        this.restoreSelectionFromRoute();
      }
    },
    paginatedParams(pagination) {
      return {
        page: pagination.page,
        perPage: pagination.perPage,
        sort: pagination.sort,
        direction: pagination.direction,
      };
    },
    normalizePaginatedResponse(responseData, pagination) {
      if (Array.isArray(responseData)) {
        return {
          data: responseData,
          pagination: {
            ...pagination,
            total: null,
            lastPage: 1,
          },
        };
      }

      const meta = responseData?.meta?.pagination || {};
      return {
        data: Array.isArray(responseData?.data) ? responseData.data : [],
        pagination: {
          ...pagination,
          page: Number(meta.page) || pagination.page,
          perPage: Number(meta.perPage) || pagination.perPage,
          total: Number.isFinite(Number(meta.total)) ? Number(meta.total) : 0,
          lastPage: Math.max(Number(meta.lastPage) || 1, 1),
          sort: meta.sort || pagination.sort,
          direction: meta.direction || pagination.direction,
        },
      };
    },
    paginationLabel(pagination) {
      const labels = this.language[this.config.currentLanguage].TestsPerformed;
      if (pagination.total == null) return "";
      return labels.paginationSummary
        .replace("{page}", pagination.page)
        .replace("{lastPage}", pagination.lastPage)
        .replace("{total}", pagination.total);
    },
    changeRunPage(delta) {
      if (this.testCycleSelected == null) return;
      const nextPage = Math.min(
        Math.max(this.runPagination.page + delta, 1),
        this.runPagination.lastPage,
      );
      if (nextPage === this.runPagination.page) return;
      this.getTestCyclesDate(this.testCycleSelected, { page: nextPage });
    },
    changeTestPage(delta) {
      if (this.testCycleDateSelected == null) return;
      const nextPage = Math.min(
        Math.max(this.testPagination.page + delta, 1),
        this.testPagination.lastPage,
      );
      if (nextPage === this.testPagination.page) return;
      this.getTest(this.testCycleDateSelected, { page: nextPage });
    },
    reportUrl(run, format) {
      const descriptor = this.reportDescriptor(run, format);
      const rawUrl =
        typeof descriptor === "string"
          ? descriptor
          : descriptor?.url || descriptor?.downloadUrl || descriptor?.endpoint;

      if (rawUrl) {
        return rawUrl.startsWith("http")
          ? rawUrl
          : this.config.serviceBaseUrl + rawUrl.replace(/^\/+/, "");
      }

      return (
        this.config.serviceBaseUrl +
        this.config.url.getTestCyclePerformed +
        "/" +
        run.testCycleId +
        "/" +
        run.id +
        "/reports/" +
        format
      );
    },
    safeDescriptorDownloadUrl(descriptor) {
      const rawUrl =
        descriptor?.url || descriptor?.downloadUrl || descriptor?.endpoint;
      if (!rawUrl) return null;
      if (String(rawUrl).startsWith("http")) return rawUrl;
      return "/" + String(rawUrl).replace(/^\/+/, "");
    },
    reportFilename(run, format) {
      const descriptor = this.reportDescriptor(run, format);
      if (descriptor?.filename) return descriptor.filename;

      const extensions = {
        html: "html",
        json: "json",
        junit: "xml",
        markdown: "md",
      };
      return `idelium-run-${run.id}.${extensions[format] || format}`;
    },
    downloadBlob(filename, data, mimeType) {
      const blob =
        data instanceof Blob ? data : new Blob([data], { type: mimeType });
      const objectUrl = URL.createObjectURL(blob);
      const element = document.createElement("a");
      element.href = objectUrl;
      element.download = filename;
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(objectUrl);
    },
    async downloadReport(run, format) {
      if (!this.isReportFormatAvailable(run, format)) return;

      const labels = this.language[this.config.currentLanguage].TestsPerformed;
      this.reportDownloadErrors = {
        ...this.reportDownloadErrors,
        [run.id]: null,
      };

      try {
        const response = await apiClient.get(this.reportUrl(run, format), {
          headers: this.setHeaders(),
          responseType: "blob",
        });
        this.downloadBlob(
          this.reportFilename(run, format),
          response.data,
          response.headers?.["content-type"] || "application/octet-stream",
        );
      } catch (e) {
        this.reportDownloadErrors = {
          ...this.reportDownloadErrors,
          [run.id]: labels.downloadFailed,
        };
        this.Logout(this, e);
      }
    },
    async confirmCancelParallelRun(run) {
      const labels = this.language[this.config.currentLanguage].TestsPerformed;
      const confirmed = await this.$showConfirm({
        cancelLabel: labels.keepRunning,
        confirmLabel: labels.confirmCancelRun,
        message: labels.cancelRunMessage,
        title: labels.cancelRunTitle,
        variant: "warning",
      });
      if (!confirmed) return;

      this.emitter.emit("showLoader", true);
      apiClient
        .post(
          this.parallelRunEndpoint(run.id, "/cancel"),
          {},
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.parallelRuns = this.parallelRuns.map((parallelRun) =>
            parallelRun.id === run.id ? response.data : parallelRun,
          );
        })
        .catch((e) => {
          this.emitter.emit("showLoader", false);
          this.Logout(this, e);
          this.error = e;
        });
    },
    getTestCycles(options = {}) {
      this.spinreverse = "spin-reverse";
      this.arrayTestCyclesDate = [];
      this.arrayTest = [];
      this.testCycleSelected = null;
      this.testCycleDateSelected = null;
      this.emitter.emit("showLoader", true);
      return apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.testcycles +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.spinreverse = null;
          this.emitter.emit("showLoader", false);
          this.arrayTestCycles = response.data;
          if (options.restoreFromRoute === true) {
            this.restoreSelectionFromRoute();
          }
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    getTestCyclesDate(id, options = {}) {
      this.arrayTest = [];
      this.emitter.emit("showLoader", true);
      this.spinreverseDate = "spin-reverse";
      this.runPagination = {
        ...this.runPagination,
        page:
          options.page ||
          this.routeQueryInteger("runPage", this.runPagination.page || 1),
        perPage: this.routeQueryInteger(
          "runPerPage",
          this.runPagination.perPage || 25,
        ),
      };
      return apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.getTestCyclePerformed +
            "/" +
            id,
          {
            headers: this.setHeaders(),
            params: this.paginatedParams(this.runPagination),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          const result = this.normalizePaginatedResponse(
            response.data,
            this.runPagination,
          );
          this.arrayTestCyclesDate = result.data;
          this.runPagination = result.pagination;
          this.testCycleSelected = id;
          this.testCycleDateSelected = null;
          this.spinreverseDate = null;
          if (options.syncRoute !== false) {
            this.replaceExecutionQuery({
              testCycleId: String(id),
              runId: null,
              runPage: String(this.runPagination.page),
              runPerPage: String(this.runPagination.perPage),
              testPage: null,
            });
          }
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },

    getTest(id, options = {}) {
      this.emitter.emit("showLoader", true);
      this.testPagination = {
        ...this.testPagination,
        page:
          options.page ||
          this.routeQueryInteger("testPage", this.testPagination.page || 1),
        perPage: this.routeQueryInteger(
          "testPerPage",
          this.testPagination.perPage || 25,
        ),
      };
      return apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.getTestPerformed +
            "/" +
            id,
          {
            headers: this.setHeaders(),
            params: this.paginatedParams(this.testPagination),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          const result = this.normalizePaginatedResponse(
            response.data,
            this.testPagination,
          );
          this.arrayTest = result.data;
          this.testPagination = result.pagination;
          this.testCycleDateSelected = id;
          if (options.syncRoute !== false) {
            this.replaceExecutionQuery({
              testCycleId:
                this.testCycleSelected == null
                  ? null
                  : String(this.testCycleSelected),
              runId: String(id),
              runPage: String(this.runPagination.page),
              runPerPage: String(this.runPagination.perPage),
              testPage: String(this.testPagination.page),
              testPerPage: String(this.testPagination.perPage),
            });
          }
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    getStep(id, name) {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.getStepPerformed +
            "/" +
            id,
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.$refs.modalTestPerformed.showModal(response.data, name);
        })
        .catch((e) => {
          this.error = e;
          this.Logout(this, e);
        });
    },
  },
};
</script>
