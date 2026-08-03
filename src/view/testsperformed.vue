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
      <div class="testsperformed-hero-actions">
        <button
          type="button"
          class="btn testsperformed-latest-result"
          v-on:click="showLatestResult()"
          :title="language[config.currentLanguage].TestsPerformed.showLatestResult"
        >
          <font-awesome-icon
            icon="eye"
            class="iconClass idelium-action-icon--view"
          />
          {{ language[config.currentLanguage].TestsPerformed.showLatestResult }}
        </button>
        <button
          type="button"
          class="btn btn-outline-light testsperformed-refresh"
          v-on:click="refreshResults()"
          :title="language[config.currentLanguage].Actions.refresh"
        >
          <font-awesome-icon
            icon="history"
            class="iconClass idelium-action-icon--refresh"
          />
          {{ language[config.currentLanguage].TestsPerformed.refresh }}
        </button>
      </div>
    </section>

    <nav class="testsperformed-page-tabs" role="tablist">
      <button
        type="button"
        :class="[
          'testsperformed-page-tab',
          { active: activeExecutionTab === 'running' },
        ]"
        role="tab"
        :aria-selected="activeExecutionTab === 'running'"
        v-on:click="selectExecutionTab('running')"
      >
        <font-awesome-icon icon="rocket" class="iconClass" />
        {{ language[config.currentLanguage].TestsPerformed.testRunningTab }}
        <span>{{ visibleExecutionActivity.length }}</span>
      </button>
      <button
        type="button"
        :class="[
          'testsperformed-page-tab',
          { active: activeExecutionTab === 'results' },
        ]"
        role="tab"
        :aria-selected="activeExecutionTab === 'results'"
        v-on:click="selectExecutionTab('results')"
      >
        <font-awesome-icon icon="vial" class="iconClass" />
        {{ language[config.currentLanguage].TestsPerformed.testResultsTab }}
        <span>{{ arrayTestCyclesDate.length }}</span>
      </button>
    </nav>

    <section v-show="activeExecutionTab === 'results'" class="testsperformed-summary">
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

    <section
      v-if="currentRunDetail"
      v-show="activeExecutionTab === 'results'"
      class="card testsperformed-run-detail"
      aria-labelledby="run-detail-title"
    >
      <div class="testsperformed-panel-header">
        <div>
          <span class="testsperformed-section-title">
            {{ language[config.currentLanguage].TestsPerformed.runDetail }}
          </span>
          <h2 id="run-detail-title">#{{ currentRunDetail.id }}</h2>
          <p class="testsperformed-helper">
            {{ currentRunDetail.cycle.name }} ·
            {{ currentRunDetail.environment.name }} ·
            {{ currentRunDetail.target.name }}
          </p>
        </div>
        <span
          :class="[
            'testsperformed-status',
            parallelRunVariant(currentRunDetail.status),
          ]"
        >
          {{ runDetailStatusLabel(currentRunDetail) }}
        </span>
      </div>
      <dl class="testsperformed-run-detail-grid">
        <div>
          <dt>
            {{ language[config.currentLanguage].TestsPerformed.initiator }}
          </dt>
          <dd>{{ currentRunDetail.initiator }}</dd>
        </div>
        <div>
          <dt>
            {{ language[config.currentLanguage].TestsPerformed.correlationId }}
          </dt>
          <dd>{{ currentRunDetail.correlationId || "—" }}</dd>
        </div>
        <div>
          <dt>
            {{ language[config.currentLanguage].TestsPerformed.progress }}
          </dt>
          <dd>
            {{ currentRunDetail.progress.completed }}/{{
              currentRunDetail.progress.total
            }}
          </dd>
        </div>
        <div>
          <dt>
            {{
              language[config.currentLanguage].TestsPerformed.workerConcurrency
            }}
          </dt>
          <dd>
            {{ currentRunDetail.concurrency.active }}/{{
              currentRunDetail.concurrency.requested
            }}
          </dd>
        </div>
      </dl>
      <div class="testsperformed-run-tabs" role="tablist">
        <button
          v-for="tab in currentRunDetail.tabs"
          v-bind:key="tab"
          type="button"
          :class="[
            'testsperformed-status-filter',
            { active: runDetailActiveTab === tab },
          ]"
          v-on:click="selectRunDetailTab(tab)"
        >
          {{ runDetailTabLabel(tab) }}
        </button>
      </div>
      <pre class="testsperformed-command">{{
        currentRunDetail.reproducibilityCommand
      }}</pre>
      <div class="testsperformed-run-tab-content" aria-live="polite">
        <div
          v-if="runDetailActiveTab === 'overview'"
          class="testsperformed-advanced-grid"
        >
          <article>
            <span>{{ language[config.currentLanguage].TestsPerformed.status }}</span>
            <strong>{{ runDetailStatusLabel(currentRunDetail) }}</strong>
          </article>
          <article>
            <span>{{ language[config.currentLanguage].TestsPerformed.testsInRun }}</span>
            <strong>{{ arrayTest.length }}</strong>
          </article>
          <article>
            <span>{{ language[config.currentLanguage].TestsPerformed.stepsInTest }}</span>
            <strong>{{ selectedTestSteps.length }}</strong>
          </article>
        </div>
        <div
          v-else-if="runDetailActiveTab === 'tests'"
          class="testsperformed-advanced-list"
        >
          <button
            v-for="test in arrayTest"
            v-bind:key="'advanced-test-' + test.id"
            type="button"
            class="testsperformed-advanced-row"
            v-on:click="selectPerformedTest(test)"
          >
            <span :class="['testsperformed-status', getTestVariant(test)]">
              {{ getTestStatusLabel(test) }}
            </span>
            <strong>{{ test.name }}</strong>
          </button>
          <div v-if="arrayTest.length === 0" class="testsperformed-empty testsperformed-empty-compact">
            {{ language[config.currentLanguage].TestsPerformed.emptyTests }}
          </div>
        </div>
        <div
          v-else-if="runDetailActiveTab === 'workers'"
          class="testsperformed-advanced-grid"
        >
          <article>
            <span>{{ language[config.currentLanguage].TestsPerformed.workerConcurrency }}</span>
            <strong>
              {{ currentRunDetail.concurrency.active }}/{{
                currentRunDetail.concurrency.requested
              }}
            </strong>
          </article>
          <article>
            <span>{{ language[config.currentLanguage].TestsPerformed.progress }}</span>
            <strong>
              {{ currentRunDetail.progress.completed }}/{{
                currentRunDetail.progress.total
              }}
            </strong>
          </article>
        </div>
        <div
          v-else-if="runDetailActiveTab === 'timeline'"
          class="testsperformed-advanced-list"
        >
          <div
            v-for="step in selectedTestSteps"
            v-bind:key="'advanced-step-' + step.id"
            class="testsperformed-advanced-row"
          >
            <span :class="['testsperformed-status', getStepVariant(step)]">
              {{ getStepStatusLabel(step) }}
            </span>
            <strong>{{ step.name }}</strong>
            <small>{{ stepDuration(step) }}</small>
          </div>
          <div
            v-if="selectedTestSteps.length === 0"
            class="testsperformed-empty testsperformed-empty-compact"
          >
            {{ language[config.currentLanguage].TestsPerformed.selectTestFirst }}
          </div>
        </div>
        <div
          v-else-if="runDetailActiveTab === 'logs'"
          class="testsperformed-advanced-empty"
        >
          {{ language[config.currentLanguage].TestsPerformed.noLogs }}
        </div>
        <div
          v-else-if="runDetailActiveTab === 'artifacts'"
          class="testsperformed-advanced-list"
        >
          <article
            v-for="artifact in secureArtifacts"
            v-bind:key="'advanced-artifact-' + artifact.id"
            class="testsperformed-advanced-row"
          >
            <span>{{ artifact.contentType }}</span>
            <strong>{{ artifact.name }}</strong>
            <button
              type="button"
              class="btn btn-sm btn-outline-light testsperformed-page-button"
              v-on:click="openArtifactFullView(artifact)"
            >
              {{ language[config.currentLanguage].TestsPerformed.fullArtifact }}
            </button>
          </article>
          <div
            v-if="secureArtifacts.length === 0"
            class="testsperformed-empty testsperformed-empty-compact"
          >
            {{ language[config.currentLanguage].TestsPerformed.noArtifacts }}
          </div>
        </div>
        <div
          v-else-if="runDetailActiveTab === 'reports'"
          class="testsperformed-report-toolbar"
        >
          <button
            v-for="format in reportFormats"
            v-bind:key="'advanced-report-' + format"
            type="button"
            class="testsperformed-report-button"
            :disabled="!selectedExecution || !isReportFormatAvailable(selectedExecution, format)"
            :title="selectedExecution ? reportButtonLabel(selectedExecution, format) : format"
            v-on:click="selectedExecution && downloadReport(selectedExecution, format)"
          >
            {{ format.toUpperCase() }}
          </button>
        </div>
        <div class="testsperformed-advanced-empty">
          {{ language[config.currentLanguage].TestsPerformed.noAdvancedData }}
        </div>
      </div>
      <div class="testsperformed-run-actions" aria-live="polite">
        <div>
          <span class="testsperformed-section-title">
            {{ language[config.currentLanguage].TestsPerformed.retryTitle }}
          </span>
          <p class="testsperformed-helper">
            {{ retryRunStateLabel("failed") }}
          </p>
        </div>
        <div class="testsperformed-run-action-buttons">
          <button
            type="button"
            class="btn btn-sm btn-outline-light testsperformed-page-button"
            v-on:click="retryRun('full')"
            :disabled="!retryEligibilityFor('full').allowed"
          >
            {{ language[config.currentLanguage].TestsPerformed.rerun }}
          </button>
          <button
            type="button"
            class="btn btn-sm testsperformed-page-button testsperformed-primary-button"
            v-on:click="retryRun('failed')"
            :disabled="!retryEligibilityFor('failed').allowed"
          >
            {{ language[config.currentLanguage].TestsPerformed.retryFailed }}
          </button>
        </div>
        <p
          v-if="retryEligibilityFor('failed').requiresPreflight"
          class="testsperformed-live-alert"
        >
          {{
            language[config.currentLanguage].TestsPerformed
              .retryPreflightRequired
          }}
          {{ retryUnavailableAssetList }}
        </p>
        <p
          v-if="retryAudit[currentRunDetail.id]"
          class="testsperformed-cancellation-audit"
        >
          {{ retryAudit[currentRunDetail.id].message }}
        </p>
      </div>
      <div
        v-if="showRunDrilldown"
        class="testsperformed-drilldown"
        :aria-label="
          language[config.currentLanguage].TestsPerformed.drilldownTitle
        "
      >
        <button
          v-for="node in drilldownNodes"
          v-bind:key="node.id"
          type="button"
          :class="[
            'testsperformed-drilldown-node',
            `testsperformed-drilldown-node--${node.level}`,
            { active: selectedDetailId === node.id },
          ]"
          v-on:click="selectDrilldownNode(node)"
        >
          <span
            :class="['testsperformed-status', parallelRunVariant(node.status)]"
          >
            {{ parallelRunStatusLabel(node.status) }}
          </span>
          <strong>{{ node.name }}</strong>
          <span v-if="node.method">{{ node.method }} {{ node.url }}</span>
          <span v-if="node.failure">{{ node.failure.message }}</span>
        </button>
      </div>
      <div
        v-if="showArtifactViewer"
        class="testsperformed-artifacts"
        :aria-label="
          language[config.currentLanguage].TestsPerformed.artifactViewer
        "
      >
        <article
          v-for="artifact in secureArtifacts"
          v-bind:key="artifact.id"
          class="testsperformed-artifact-card"
        >
          <div>
            <strong>{{ artifact.name }}</strong>
            <span
              >{{ artifact.contentType }} · {{ artifact.sizeBytes }} bytes</span
            >
          </div>
          <p>{{ artifactExplanationFor(artifact) }}</p>
          <pre v-if="artifact.preview.available">{{
            artifact.preview.content
          }}</pre>
          <button
            type="button"
            class="btn btn-sm btn-outline-light testsperformed-page-button"
            v-on:click="openArtifactFullView(artifact)"
          >
            {{ language[config.currentLanguage].TestsPerformed.fullArtifact }}
          </button>
        </article>
        <div
          v-if="secureArtifacts.length === 0"
          class="testsperformed-empty testsperformed-empty-compact"
        >
          {{ language[config.currentLanguage].TestsPerformed.noArtifacts }}
        </div>
      </div>
      <p v-if="currentRunDetail.partial" class="testsperformed-live-alert">
        {{ language[config.currentLanguage].TestsPerformed.partialRunDetail }}
      </p>
    </section>

    <section
      v-show="activeExecutionTab === 'results'"
      class="card testsperformed-analytics-panel"
      aria-live="polite"
    >
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

    <section
      v-show="activeExecutionTab === 'results'"
      class="card testsperformed-history-panel"
    >
      <EnterpriseDataTable
        accessible-label="Run history"
        :actions="runHistoryActions"
        :columns="runHistoryColumns"
        :copy="runHistoryGridCopy"
        :has-active-filters="runHistoryHasFilters"
        :meta="{ total: runHistoryRows.length }"
        row-key="id"
        :rows="runHistoryRows"
        :sort="{
          field: runHistoryFilters.sort.field,
          direction: runHistoryFilters.sort.direction,
        }"
        v-on:action="handleRunHistoryAction"
        v-on:clear-filters="clearRunHistoryFilters"
        v-on:row-activate="openRunHistoryRow"
        v-on:sort="updateRunHistorySort"
      >
        <template #toolbar>
          <div class="testsperformed-history-toolbar">
            <label>
              <span>
                {{ language[config.currentLanguage].TestsPerformed.status }}
              </span>
              <select
                v-model="runHistoryStatus"
                class="form-control testsperformed-filter-control"
                v-on:change="applyRunHistoryFilters()"
              >
                <option value="">
                  {{
                    language[config.currentLanguage].TestsPerformed.allStatuses
                  }}
                </option>
                <option
                  v-for="status in liveRunStatusOptions"
                  v-bind:key="status"
                  :value="status"
                >
                  {{ parallelRunStatusLabel(status) }}
                </option>
              </select>
            </label>
            <label>
              <span>
                {{ language[config.currentLanguage].TestsPerformed.tag }}
              </span>
              <input
                v-model="runHistoryTag"
                class="form-control testsperformed-filter-control"
                v-on:change="applyRunHistoryFilters()"
              />
            </label>
            <button
              type="button"
              class="btn btn-sm btn-outline-light testsperformed-page-button"
              v-on:click="saveRunHistoryView"
            >
              {{ language[config.currentLanguage].TestsPerformed.saveView }}
            </button>
          </div>
        </template>
      </EnterpriseDataTable>
      <div
        v-if="runHistorySavedViews.length > 0"
        class="testsperformed-saved-views"
      >
        <button
          v-for="view in runHistorySavedViews"
          v-bind:key="view.id"
          type="button"
          class="testsperformed-status-filter"
          v-on:click="applyRunHistorySavedView(view)"
        >
          {{ view.name }}
        </button>
      </div>
    </section>

    <section
      v-show="activeExecutionTab === 'running'"
      class="card testsperformed-parallel-panel"
      aria-live="polite"
    >
      <div class="testsperformed-panel-header">
        <div>
          <span class="testsperformed-section-title">
            {{ language[config.currentLanguage].TestsPerformed.liveRuns }}
          </span>
          <p class="testsperformed-helper">
            {{
              language[config.currentLanguage].TestsPerformed
                .liveRunsDescription
            }}
          </p>
        </div>
        <div class="testsperformed-live-toolbar">
          <button
            v-for="status in liveRunStatusOptions"
            v-bind:key="status"
            type="button"
            :class="[
              'testsperformed-status-filter',
              { active: liveRunStatuses.includes(status) },
            ]"
            v-on:click="toggleLiveRunStatus(status)"
          >
            {{ parallelRunStatusLabel(status) }}
          </button>
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
      </div>
      <p class="sr-only" aria-live="polite">
        {{ liveRunAnnouncement }}
      </p>
      <p class="testsperformed-live-transport" aria-live="polite">
        {{ liveTransportLabel }}
      </p>
      <div
        v-if="visibleExecutionActivity.length > 0"
        class="testsperformed-parallel-grid"
      >
        <article
          v-for="run in visibleExecutionActivity"
          v-bind:key="run.id"
          :class="[
            'testsperformed-parallel-card',
            { 'testsperformed-parallel-card--stale': run.stale },
          ]"
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
                #{{ run.id }} · {{ run.cycle.name }}
              </strong>
              <span class="testsperformed-helper">
                {{ run.target || run.updateChannel }}
              </span>
              <span
                v-if="run.classic"
                class="testsperformed-helper testsperformed-classic-source"
              >
                {{
                  language[config.currentLanguage].TestsPerformed
                    .classicRunSource
                }}
              </span>
            </div>
            <div class="testsperformed-live-actions">
              <button
                v-if="run.canOpenDetails"
                type="button"
                class="btn btn-sm btn-outline-light testsperformed-page-button"
                v-on:click="openParallelRunDetails(run)"
              >
                {{
                  language[config.currentLanguage].TestsPerformed.viewDetails
                }}
              </button>
              <button
                v-if="canCancelParallelRun(run)"
                type="button"
                class="btn btn-sm btn-outline-light testsperformed-cancel-button"
                v-on:click="confirmCancelParallelRun(run)"
              >
                {{ language[config.currentLanguage].TestsPerformed.cancelRun }}
              </button>
            </div>
          </div>
          <div
            class="testsperformed-live-progress"
            role="progressbar"
            :aria-valuenow="run.progress.percent"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="liveRunProgressLabel(run)"
          >
            <span :style="{ width: run.progress.percent + '%' }"></span>
          </div>
          <dl class="testsperformed-worker-metrics">
            <div>
              <dt>
                {{
                  language[config.currentLanguage].TestsPerformed
                    .workerConcurrency
                }}
              </dt>
              <dd>
                {{ run.activeConcurrency }}/{{ run.requestedConcurrency }}
              </dd>
            </div>
            <div>
              <dt>
                {{ language[config.currentLanguage].TestsPerformed.progress }}
              </dt>
              <dd>{{ run.progress.completed }}/{{ run.progress.total }}</dd>
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
          <p v-if="run.stale || run.degraded" class="testsperformed-live-alert">
            {{
              run.stale
                ? language[config.currentLanguage].TestsPerformed.staleTelemetry
                : language[config.currentLanguage].TestsPerformed
                    .degradedChannel
            }}
          </p>
          <p
            v-if="cancellationAudit[run.id]"
            class="testsperformed-cancellation-audit"
          >
            {{ cancellationAuditLabel(run) }}
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

    <section
      v-show="activeExecutionTab === 'results'"
      class="testsperformed-workspace"
    >
      <article class="card testsperformed-execution-summary">
        <div class="testsperformed-panel-header">
          <div>
            <span class="testsperformed-section-title">
              {{
                language[config.currentLanguage].TestsPerformed
                  .executionSummary
              }}
            </span>
            <p class="testsperformed-helper">
              {{
                language[config.currentLanguage].TestsPerformed
                  .executionSummaryHelp
              }}
            </p>
          </div>
          <span
            v-if="selectedExecution"
            :class="['testsperformed-status', getVariant(selectedExecution.status)]"
          >
            {{ getStatusLabel(selectedExecution.status) }}
          </span>
        </div>
        <div class="testsperformed-execution-metrics">
          <article>
            <span>{{
              language[config.currentLanguage].TestsPerformed.selectedRun
            }}</span>
            <strong>{{
              selectedExecution ? `#${selectedExecution.id}` : "—"
            }}</strong>
          </article>
          <article>
            <span>{{
              language[config.currentLanguage].TestsPerformed.cycleDuration
            }}</span>
            <strong>{{ selectedExecutionDuration }}</strong>
          </article>
          <article>
            <span>{{
              language[config.currentLanguage].TestsPerformed.testsInRun
            }}</span>
            <strong>{{ arrayTest.length }}</strong>
          </article>
          <article>
            <span>{{
              language[config.currentLanguage].TestsPerformed.stepsInTest
            }}</span>
            <strong>{{ selectedTestSteps.length }}</strong>
          </article>
          <article>
            <span>{{
              language[config.currentLanguage].TestsPerformed.environment
            }}</span>
            <strong>{{ selectedExecutionContext.environment }}</strong>
          </article>
          <article>
            <span>{{
              language[config.currentLanguage].TestsPerformed.browser
            }}</span>
            <strong>{{ selectedExecutionContext.browser }}</strong>
          </article>
          <article>
            <span>{{
              language[config.currentLanguage].TestsPerformed.device
            }}</span>
            <strong>{{ selectedExecutionContext.device }}</strong>
          </article>
          <article>
            <span>{{
              language[config.currentLanguage].TestsPerformed.operatingSystem
            }}</span>
            <strong>{{ selectedExecutionContext.operatingSystem }}</strong>
          </article>
        </div>
      </article>

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
            <span
              v-if="testCycleSelected == testCycle.id"
              class="testsperformed-selected-badge"
            >
              {{ language[config.currentLanguage].TestsPerformed.selectedItem }}
            </span>
            <span class="testsperformed-item-main">
              <strong>{{ testCycle.name }}</strong>
            </span>
          </button>
        </div>
        <div
          v-if="cyclePagination.total != null"
          class="testsperformed-pagination"
        >
          <button
            type="button"
            class="btn btn-sm btn-outline-light testsperformed-page-button"
            :disabled="cyclePagination.page <= 1"
            v-on:click="changeCyclePage(-1)"
          >
            {{ language[config.currentLanguage].TestsPerformed.previousPage }}
          </button>
          <span>{{ paginationLabel(cyclePagination) }}</span>
          <button
            type="button"
            class="btn btn-sm btn-outline-light testsperformed-page-button"
            :disabled="cyclePagination.page >= cyclePagination.lastPage"
            v-on:click="changeCyclePage(1)"
          >
            {{ language[config.currentLanguage].TestsPerformed.nextPage }}
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
            :aria-pressed="testCycleDateSelected == testCycleDate.id"
            v-on:click="getTest(testCycleDate.id)"
            :title="language[config.currentLanguage].TestsPerformed.openDetails"
          >
            <span class="testsperformed-item-icon">
              <font-awesome-icon
                icon="clock"
                class="idelium-action-icon--refresh"
              />
            </span>
            <span
              v-if="testCycleDateSelected == testCycleDate.id"
              class="testsperformed-selected-badge"
            >
              {{ language[config.currentLanguage].TestsPerformed.selectedItem }}
            </span>
            <span class="testsperformed-item-main">
              <strong>{{ testCycleDate.date }}</strong>
              <small class="testsperformed-item-meta">
                {{
                  language[config.currentLanguage].TestsPerformed.cycleDuration
                }}:
                {{ runDuration(testCycleDate) }}
              </small>
              <small class="testsperformed-item-meta testsperformed-context-line">
                {{ executionContextSummary(testCycleDate) }}
              </small>
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
            :class="{ active: testSelected == test.id }"
            v-on:click="selectPerformedTest(test)"
            :title="language[config.currentLanguage].TestsPerformed.viewDetails"
          >
            <span :class="['testsperformed-status', getTestVariant(test)]">
              {{ getTestStatusLabel(test) }}
            </span>
            <span
              v-if="testSelected == test.id"
              class="testsperformed-selected-badge"
            >
              {{ language[config.currentLanguage].TestsPerformed.selectedItem }}
            </span>
            <strong>{{ test.name }}</strong>
            <small class="testsperformed-item-meta">
              #{{ test.id }}
            </small>
            <span class="testsperformed-detail-link">
              {{
                language[config.currentLanguage].TestsPerformed
                  .showStepResults
              }}
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

      <article class="card testsperformed-panel testsperformed-step-panel">
        <div class="testsperformed-panel-header">
          <div>
            <span class="testsperformed-section-title">
              {{
                language[config.currentLanguage].TestsPerformed.stepResults
              }}
            </span>
            <p class="testsperformed-helper">
              {{
                selectedTestName ||
                language[config.currentLanguage].TestsPerformed.selectTestFirst
              }}
            </p>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-outline-light testsperformed-page-button"
            :disabled="testSelected == null"
            v-on:click="openSelectedTestDetails()"
          >
            {{ language[config.currentLanguage].TestsPerformed.viewDetails }}
          </button>
        </div>
        <div
          v-if="selectedTestSteps.length > 0"
          class="testsperformed-step-list"
        >
          <article
            v-for="(step, index) in selectedTestSteps"
            v-bind:key="step.id || index"
            :class="[
              'testsperformed-step-row',
              {
                'testsperformed-step-row--postman':
                  isPostmanExecution(step),
              },
            ]"
          >
            <span :class="['testsperformed-status', getStepVariant(step)]">
              {{ getStepStatusLabel(step) }}
            </span>
            <div>
              <strong>{{ step.name }}</strong>
              <small>
                {{
                  language[config.currentLanguage].TestsPerformed.stepDuration
                }}:
                {{ stepDuration(step) }}
              </small>
            </div>
            <span class="testsperformed-step-index">#{{ index + 1 }}</span>
            <section
              v-if="isPostmanExecution(step)"
              class="testsperformed-postman-step-details"
              :aria-label="language[config.currentLanguage].Postman.executionResults"
            >
              <div class="testsperformed-postman-step-header">
                <div>
                  <strong>
                    {{ language[config.currentLanguage].Postman.executionResults }}
                  </strong>
                  <p>
                    {{
                      language[config.currentLanguage].Postman
                        .executionResultsHelp
                    }}
                  </p>
                </div>
                <span class="testsperformed-postman-step-count">
                  {{ stepPostmanResults(step).length }}
                  {{ language[config.currentLanguage].Postman.requests }}
                </span>
              </div>
              <PostmanResultTable
                v-if="stepPostmanResults(step).length > 0"
                :results="stepPostmanResults(step)"
                :labels="language[config.currentLanguage].Postman"
                @show-response="showPostmanResponse"
              />
              <div
                v-else
                class="testsperformed-empty testsperformed-empty-compact"
              >
                {{ language[config.currentLanguage].Postman.emptyResults }}
              </div>
            </section>
          </article>
        </div>
        <div
          v-if="selectedTestSteps.length === 0"
          class="testsperformed-empty testsperformed-empty-large"
        >
          {{
            testSelected == null
              ? language[config.currentLanguage].TestsPerformed.selectTestFirst
              : language[config.currentLanguage].TestsPerformed.emptySteps
          }}
        </div>
      </article>
    </section>
    <modalTestPerformed ref="modalTestPerformed" :test="arrayTest" />
    <modalPostmanResponse ref="modalPostmanResponseShow" />
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
  overflow-x: hidden;
  overflow-y: auto;
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

.testsperformed-hero-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;
}

.testsperformed-refresh,
.testsperformed-latest-result {
  align-items: center;
  display: inline-flex;
  gap: 0.45rem;
  white-space: nowrap;
}

.testsperformed-refresh {
  border-color: rgba(255, 255, 255, 0.18);
}

.testsperformed-latest-result {
  background: linear-gradient(135deg, #ff8a1f 0%, #ff5a2a 100%);
  border: 0;
  box-shadow: 0 16px 34px rgba(255, 106, 31, 0.26);
  color: #111827;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.testsperformed-latest-result:hover,
.testsperformed-latest-result:focus {
  color: #111827;
  filter: brightness(1.06);
}

.testsperformed-page-tabs {
  align-items: center;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  display: inline-flex;
  flex: 0 0 auto;
  gap: 0.5rem;
  padding: 0.45rem;
  width: fit-content;
}

.testsperformed-page-tab {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 14px;
  color: rgba(246, 247, 251, 0.72);
  display: inline-flex;
  font-size: 0.72rem;
  font-weight: 900;
  gap: 0.45rem;
  letter-spacing: 0.14em;
  padding: 0.75rem 1rem;
  text-transform: uppercase;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease;
}

.testsperformed-page-tab span {
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  color: #ffffff;
  display: inline-flex;
  height: 1.35rem;
  justify-content: center;
  min-width: 1.35rem;
  padding: 0 0.35rem;
}

.testsperformed-page-tab:hover,
.testsperformed-page-tab:focus-visible {
  border-color: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  outline: none;
}

.testsperformed-page-tab.active {
  background: linear-gradient(135deg, #ff8a1f 0%, #ff5a2a 100%);
  box-shadow: 0 16px 34px rgba(255, 106, 31, 0.22);
  color: #111827;
}

.testsperformed-page-tab.active span {
  background: rgba(17, 24, 39, 0.16);
  color: #111827;
}

.testsperformed-summary {
  display: grid;
  flex: 0 0 auto;
  gap: 1rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  order: 3;
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
  order: 6;
  padding: 1rem;
}

.testsperformed-history-panel {
  display: grid;
  flex: 0 0 auto;
  gap: 0.9rem;
  max-height: 24rem;
  min-height: 14rem;
  order: 7;
  overflow: auto;
  padding: 1rem;
}

.testsperformed-run-detail {
  display: grid;
  flex: 0 0 auto;
  gap: 1rem;
  order: 5;
  padding: 1rem;
}

.testsperformed-run-detail h2 {
  color: #ffffff;
  margin: 0.25rem 0;
}

.testsperformed-run-detail-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
}

.testsperformed-run-detail-grid div {
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 0.75rem;
}

.testsperformed-run-detail-grid dt {
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.testsperformed-run-detail-grid dd {
  color: #ffffff;
  font-weight: 800;
  margin: 0.3rem 0 0;
  overflow-wrap: anywhere;
}

.testsperformed-run-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.testsperformed-command {
  background: rgba(5, 9, 18, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.75rem;
  color: #dbeafe;
  margin: 0;
  overflow: auto;
  padding: 0.85rem;
}

.testsperformed-run-tab-content {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.85rem;
  padding: 0.85rem;
}

.testsperformed-advanced-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
}

.testsperformed-advanced-grid article {
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 0.75rem;
}

.testsperformed-advanced-grid span,
.testsperformed-advanced-row small {
  color: rgba(255, 255, 255, 0.58);
  display: block;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.testsperformed-advanced-grid strong {
  color: #ffffff;
  display: block;
  margin-top: 0.35rem;
}

.testsperformed-advanced-list {
  display: grid;
  gap: 0.55rem;
}

.testsperformed-advanced-row {
  align-items: center;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  color: rgba(255, 255, 255, 0.86);
  display: grid;
  gap: 0.75rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
  padding: 0.75rem;
  text-align: left;
}

button.testsperformed-advanced-row:hover,
button.testsperformed-advanced-row:focus-visible {
  border-color: rgba(255, 107, 30, 0.58);
  color: #ffffff;
  outline: none;
}

.testsperformed-advanced-row strong {
  color: #ffffff;
}

.testsperformed-advanced-empty {
  border: 1px dashed rgba(255, 255, 255, 0.18);
  border-radius: 0.75rem;
  color: rgba(255, 255, 255, 0.62);
  padding: 1rem;
  text-align: center;
}

.testsperformed-run-actions {
  align-items: center;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.85rem;
  display: grid;
  gap: 0.85rem;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 0.85rem;
}

.testsperformed-run-action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: flex-end;
}

.testsperformed-primary-button {
  background: linear-gradient(135deg, #ff8a1d, #ff5f2d);
  border: 1px solid rgba(255, 138, 29, 0.76);
  color: #10131d;
}

.testsperformed-drilldown {
  display: grid;
  gap: 0.55rem;
  max-height: 24rem;
  overflow: auto;
}

.testsperformed-drilldown-node {
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  color: rgba(255, 255, 255, 0.86);
  display: grid;
  gap: 0.35rem;
  padding: 0.75rem;
  text-align: left;
}

.testsperformed-drilldown-node--step {
  margin-left: 1.25rem;
}

.testsperformed-drilldown-node--assertion {
  margin-left: 2.5rem;
}

.testsperformed-drilldown-node.active {
  border-color: rgba(255, 107, 30, 0.72);
  box-shadow: 0 0 0 1px rgba(255, 107, 30, 0.25);
}

.testsperformed-artifacts {
  display: grid;
  gap: 0.75rem;
}

.testsperformed-artifact-card {
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.85rem;
  color: rgba(255, 255, 255, 0.82);
  display: grid;
  gap: 0.65rem;
  padding: 0.85rem;
}

.testsperformed-artifact-card strong,
.testsperformed-artifact-card span {
  display: block;
}

.testsperformed-artifact-card pre {
  background: rgba(5, 9, 18, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.75rem;
  color: #dbeafe;
  max-height: 18rem;
  overflow: auto;
  padding: 0.75rem;
  white-space: pre-wrap;
}

.testsperformed-analytics-filters,
.testsperformed-analytics-statuses,
.testsperformed-live-toolbar,
.testsperformed-live-actions,
.testsperformed-history-toolbar,
.testsperformed-saved-views {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.testsperformed-analytics-filters label,
.testsperformed-history-toolbar label {
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
  min-height: auto;
  order: 4;
  overflow: visible;
}

.testsperformed-execution-summary,
.testsperformed-step-panel {
  grid-column: 1 / -1;
}

.testsperformed-execution-metrics {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.testsperformed-execution-metrics article {
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.85rem;
  padding: 0.85rem;
}

.testsperformed-execution-metrics span,
.testsperformed-item-meta,
.testsperformed-step-row small {
  color: rgba(255, 255, 255, 0.58);
  display: block;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.testsperformed-execution-metrics strong {
  color: #ffffff;
  display: block;
  font-size: 1.35rem;
  margin-top: 0.35rem;
}

.testsperformed-context-line {
  letter-spacing: 0.04em;
  line-height: 1.45;
  text-transform: none;
}

.testsperformed-parallel-panel {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  max-height: min(42rem, calc(100dvh - 18rem));
  min-height: min(32rem, calc(100dvh - 18rem));
  order: 3;
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

.testsperformed-parallel-card--stale {
  border-color: rgba(255, 193, 7, 0.42);
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

.testsperformed-live-progress {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  height: 0.5rem;
  margin: 1rem 0 0;
  overflow: hidden;
}

.testsperformed-live-progress span {
  background: linear-gradient(90deg, #1ec997, #ff8a1d);
  display: block;
  height: 100%;
  transition: width 160ms ease;
}

.testsperformed-live-alert {
  background: rgba(255, 193, 7, 0.12);
  border: 1px solid rgba(255, 193, 7, 0.24);
  border-radius: 0.75rem;
  color: #ffe0a3;
  margin: 0 0 0.85rem;
  padding: 0.7rem;
}

.testsperformed-live-transport {
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: -0.25rem 0 0;
  text-transform: uppercase;
}

.testsperformed-cancellation-audit {
  background: rgba(13, 110, 253, 0.12);
  border: 1px solid rgba(13, 110, 253, 0.24);
  border-radius: 0.75rem;
  color: #b7d6ff;
  margin: 0 0 0.85rem;
  padding: 0.7rem;
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

.testsperformed-status.warning,
.testsperformed-worker-state.warning {
  background: rgba(255, 193, 7, 0.18);
  color: #ffe0a3;
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
  position: relative;
  text-align: left;
  transition:
    background 160ms ease,
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
    rgba(255, 107, 30, 0.42),
    rgba(255, 139, 35, 0.16) 48%,
    rgba(255, 255, 255, 0.055)
  );
  border-color: rgba(255, 107, 30, 0.92);
  box-shadow:
    0 0 0 1px rgba(255, 107, 30, 0.28),
    0 1.15rem 2.8rem rgba(255, 107, 30, 0.22),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  color: #ffffff !important;
  transform: translateY(-1px);
}

.testsperformed-item.active::before,
.testsperformed-test-card.active::before {
  background: linear-gradient(180deg, #ff8a1d, #ff5f2d);
  border-radius: 999px;
  bottom: 0.75rem;
  box-shadow: 0 0.65rem 1.3rem rgba(255, 107, 30, 0.36);
  content: "";
  left: 0.45rem;
  position: absolute;
  top: 0.75rem;
  width: 0.24rem;
}

.testsperformed-item.active .testsperformed-item-icon {
  background: rgba(255, 107, 30, 0.28);
  color: #ffb86b;
}

.testsperformed-test-card.active {
  background: linear-gradient(
    135deg,
    rgba(255, 107, 30, 0.28),
    rgba(255, 139, 35, 0.09) 50%,
    rgba(255, 255, 255, 0.045)
  );
  border-color: rgba(255, 107, 30, 0.95);
  box-shadow:
    0 0 0 1px rgba(255, 107, 30, 0.28),
    0 1.15rem 2.8rem rgba(255, 107, 30, 0.18);
  transform: translateY(-1px);
}

.testsperformed-selected-badge {
  background: rgba(255, 107, 30, 0.95);
  border: 1px solid rgba(255, 186, 115, 0.88);
  border-radius: 999px;
  box-shadow: 0 0.75rem 1.5rem rgba(255, 107, 30, 0.28);
  color: #131722;
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: 0.11em;
  line-height: 1;
  padding: 0.28rem 0.42rem;
  position: absolute;
  right: 0.6rem;
  text-transform: uppercase;
  top: 0.55rem;
}

.testsperformed-step-list {
  display: grid;
  gap: 0.65rem;
  max-height: 22rem;
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.testsperformed-step-row {
  align-items: center;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 0.85rem;
  display: grid;
  gap: 0.85rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
  padding: 0.85rem;
}

.testsperformed-step-row strong {
  color: #ffffff;
  display: block;
}

.testsperformed-step-row--postman {
  align-items: start;
}

.testsperformed-postman-step-details {
  background: rgba(10, 13, 24, 0.6);
  border: 1px solid rgba(255, 108, 32, 0.28);
  border-radius: 0.85rem;
  display: grid;
  gap: 0.85rem;
  grid-column: 1 / -1;
  min-width: 0;
  overflow-x: auto;
  padding: 0.85rem;
}

.testsperformed-postman-step-header,
.testsperformed-postman-response-title {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.testsperformed-postman-step-header p {
  color: rgba(255, 255, 255, 0.64);
  font-size: 0.78rem;
  margin: 0.25rem 0 0;
}

.testsperformed-postman-step-count {
  background: rgba(255, 108, 32, 0.14);
  border: 1px solid rgba(255, 108, 32, 0.42);
  border-radius: 999px;
  color: #ffb48a;
  flex: 0 0 auto;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  padding: 0.35rem 0.65rem;
  text-transform: uppercase;
}

.testsperformed-postman-step-details :deep(table) {
  margin-bottom: 0;
  min-width: 64rem;
}

.testsperformed-postman-response-panel {
  background: rgba(0, 0, 0, 0.24);
  border: 1px solid rgba(255, 108, 32, 0.5);
  border-radius: 0.75rem;
  box-shadow: 0 1rem 2rem rgba(255, 108, 32, 0.12);
  padding: 0.85rem;
}

.testsperformed-postman-response-title span {
  color: rgba(255, 255, 255, 0.62);
  display: block;
  font-size: 0.72rem;
  margin-top: 0.2rem;
}

.testsperformed-postman-response-panel pre {
  color: rgba(255, 255, 255, 0.82);
  margin: 0.75rem 0 0;
  max-height: 18rem;
  overflow: auto;
  white-space: pre-wrap;
}

.testsperformed-step-index {
  color: rgba(255, 255, 255, 0.48);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.1em;
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

  .testsperformed-run-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<script>
import EnterpriseDataTable from "@/components/grid/EnterpriseDataTable.vue";
import modalPostmanResponse from "./testperformed/modalPostmanResponse.vue";
import modalTestPerformed from "./testperformed/modalTestPerformed.vue";
import PostmanResultTable from "./testperformed/PostmanResultTable.vue";

import apiClient from "@/services/apiClient";
import { parsePostmanResults } from "@/domain/postmanResults";
import {
  buildAnalyticsQuery,
  canDownloadExport,
  normalizeExportDescriptor,
  summarizeExecutionTrends,
} from "@/domain/resultAnalytics";
import {
  boundedLiveRunAnnouncements,
  createLivePollingState,
  filterLiveRuns,
  liveRunStatusVariant,
  mergeLiveRunWindow,
  nextLivePollingState,
  normalizeLiveRun,
  shouldContinueLivePolling,
} from "@/domain/liveRuns";
import {
  buildRunHistoryQuery,
  createRunHistorySavedView,
  normalizeRunHistoryFilters,
} from "@/domain/runHistory";
import {
  normalizeRunDetailOverview,
  normalizeRunDetailTab,
  runDetailRoute,
} from "@/domain/runDetailOverview";
import {
  drilldownSelectionRoute,
  normalizeDrilldownSelection,
  normalizeRunDrilldown,
} from "@/domain/runDrilldown";
import {
  artifactExplanation,
  fullArtifactRoute,
  normalizeArtifactCollection,
} from "@/domain/secureArtifacts";
import {
  cancellationEligibility,
  createCancellationRequest,
  normalizeCancellationResponse,
  shouldRetryCancellation,
} from "@/domain/runCancellation";
import {
  createRetryRunRequest,
  normalizeRetryRunResponse,
  retryEligibility,
} from "@/domain/runRetry";
import { getSelectedProjectId } from "@/stores/session";

const EXECUTION_TABS = new Set(["running", "results"]);

function normalizeExecutionTab(tab) {
  return EXECUTION_TABS.has(tab) ? tab : "results";
}

export default {
  name: "TestsPerformedComponent",
  components: {
    EnterpriseDataTable,
    modalPostmanResponse,
    modalTestPerformed,
    PostmanResultTable,
  },
  data() {
    return {
      arrayTestCycles: [],
      testCycleSelected: null,
      arrayTestCyclesDate: [],
      testCycleDateSelected: null,
      arrayTest: [],
      testSelected: null,
      selectedPerformedTest: null,
      selectedTestName: "",
      selectedTestSteps: [],
      spinreverse: null,
      spinreverseDate: null,
      parallelRuns: [],
      liveRunStatuses: [
        "queued",
        "running",
        "cancelling",
        "pending",
        "passed",
        "failed",
        "cancelled",
      ],
      liveRunStatusOptions: [
        "queued",
        "running",
        "cancelling",
        "pending",
        "passed",
        "failed",
        "cancelled",
      ],
      parallelRunPoller: null,
      parallelRunAbortController: null,
      livePollingState: createLivePollingState(),
      cancellationAudit: {},
      retryAudit: {},
      reportDownloadErrors: {},
      reportFormats: ["junit", "json", "markdown", "html"],
      activeExecutionTab: "results",
      analyticsWindow: "7d",
      analyticsTimezone: "UTC",
      analyticsStatuses: ["passed", "failed", "pending"],
      analyticsStatusOptions: ["passed", "failed", "pending", "cancelled"],
      runHistoryStatus: "",
      runHistoryTag: "",
      runHistoryFilters: normalizeRunHistoryFilters({}, { projectId: 1 }),
      runHistorySavedViews: [],
      runDetailActiveTab: "overview",
      runHistoryColumns: [
        { key: "id", label: "ID", sortable: true, type: "text" },
        { key: "date", label: "Updated", sortable: true, type: "text" },
        { key: "status", label: "Status", sortable: true, type: "badge" },
        { key: "cycle", label: "Cycle", sortable: true, type: "text" },
        { key: "target", label: "Target", sortable: false, type: "text" },
      ],
      runHistoryActions: [
        {
          id: "details",
          label: "Details",
          requires: null,
          variant: "secondary",
        },
      ],
      cyclePagination: {
        page: 1,
        perPage: 25,
        total: null,
        lastPage: 1,
        sort: "id",
        direction: "asc",
      },
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
    runHistoryRows() {
      return this.arrayTestCyclesDate.map((run) => ({
        id: run.id,
        cycle:
          run.cycleName ?? run.testCycleName ?? this.testCycleSelected ?? "",
        date: run.date ?? run.updatedAt ?? run.startedAt ?? "",
        status: this.parallelRunStatusLabel(
          this.analyticsStatusFromLegacy(run.status ?? run.outcome),
        ),
        target: run.target ?? run.targetName ?? "",
      }));
    },
    runHistoryHasFilters() {
      return Boolean(this.runHistoryStatus || this.runHistoryTag);
    },
    runHistoryGridCopy() {
      const labels = this.language[this.config.currentLanguage].TestsPerformed;
      return {
        actions: labels.actions,
        bulk: {
          allSelected: "{count} selected",
          clear: "Clear",
          selectAll: "Select all {count}",
          selected: "{count} selected",
          title: "Selection",
        },
        clearFilters: labels.clearFilters,
        empty: labels.emptyRuns,
        moreActions: labels.actions,
        noResults: labels.noResults,
        preferences: {
          columns: "Columns",
          comfortable: "Comfortable",
          compact: "Compact",
          density: "Density",
          moveDown: "Move down",
          moveUp: "Move up",
          reset: "Reset",
          spacious: "Spacious",
          title: "Preferences",
        },
        refreshComplete: labels.refresh,
        resultCount: labels.resultCount,
        retry: labels.refresh,
        scrollRegion: labels.runHistory,
        states: {
          empty: {
            title: labels.emptyRuns,
            description: labels.emptyRuns,
          },
          "no-results": {
            title: labels.noResults,
            description: labels.clearFilters,
          },
        },
      };
    },
    routeRunId() {
      return this.$route?.params?.runId ?? this.$route?.query?.runId ?? null;
    },
    currentRunDetail() {
      if (!this.routeRunId) return null;
      const run =
        this.arrayTestCyclesDate.find(
          (entry) => String(entry.id) === String(this.routeRunId),
        ) ??
        this.visibleLiveRuns.find(
          (entry) => String(entry.id) === String(this.routeRunId),
        ) ??
        {};
      return normalizeRunDetailOverview(run, {
        projectId: getSelectedProjectId(),
        runId: this.routeRunId,
      });
    },
    selectedDetailId() {
      return normalizeDrilldownSelection(this.$route?.query?.detailId);
    },
    showRunDrilldown() {
      return (
        this.currentRunDetail &&
        ["tests", "workers", "timeline"].includes(this.runDetailActiveTab)
      );
    },
    drilldownNodes() {
      return normalizeRunDrilldown(this.arrayTest, { limit: 150 }).nodes;
    },
    retryRunSource() {
      if (!this.currentRunDetail) return {};
      const failures = this.drilldownNodes
        .filter((node) => node.status === "failed")
        .map((node) => ({
          id: node.id,
          message: node.failure?.message,
          name: node.name,
        }));
      const run =
        this.arrayTestCyclesDate.find(
          (entry) => String(entry.id) === String(this.currentRunDetail.id),
        ) ?? {};
      return {
        ...run,
        assets: run.assets ?? run.relatedAssets ?? this.secureArtifacts,
        configuration: run.configuration ?? run.config ?? {},
        failures,
        id: this.currentRunDetail.id,
        projectId: getSelectedProjectId(),
        runtime:
          run.runtime ??
          run.runner ??
          this.arrayTest[0]?.runtime ??
          this.arrayTest[0]?.type ??
          "postman",
        status: this.currentRunDetail.status,
        tests: this.arrayTest,
      };
    },
    retryUnavailableAssetList() {
      return this.retryEligibilityFor("failed")
        .unavailableAssets.map((asset) => `${asset.name}@${asset.version}`)
        .join(", ");
    },
    showArtifactViewer() {
      return (
        this.currentRunDetail &&
        ["artifacts", "logs", "reports"].includes(this.runDetailActiveTab)
      );
    },
    secureArtifacts() {
      const artifacts = [
        ...this.arrayTest.flatMap((test) => test.artifacts ?? []),
        ...this.drilldownNodes.flatMap((node) => node.artifacts ?? []),
        ...this.arrayTestCyclesDate.flatMap((run) =>
          String(run.id) === String(this.routeRunId) ? (run.reports ?? []) : [],
        ),
      ];
      return normalizeArtifactCollection(artifacts, {
        projectId: getSelectedProjectId(),
        runId: this.routeRunId,
      });
    },
    visibleLiveRuns() {
      return filterLiveRuns(this.parallelRuns, {
        projectId: getSelectedProjectId(),
        statuses: this.liveRunStatuses,
      });
    },
    visibleExecutionActivity() {
      if (this.visibleLiveRuns.length > 0) return this.visibleLiveRuns;
      return this.classicRunActivity.filter((run) =>
        this.liveRunStatuses.includes(run.status),
      );
    },
    classicRunActivity() {
      return this.arrayTestCyclesDate.slice(0, 10).map((run) => {
        const status = this.analyticsStatusFromLegacy(
          run.status ?? run.outcome ?? run.state,
        );
        const completed = status === "passed" || status === "failed" ? 1 : 0;
        return {
          id: String(run.id),
          activeConcurrency: completed ? 0 : 1,
          canCancel: false,
          canOpenDetails: true,
          cancelledWorkers: status === "cancelled" ? 1 : 0,
          classic: true,
          completedWorkers: status === "passed" ? 1 : 0,
          cycle: {
            id: String(this.testCycleSelected ?? run.testCycleId ?? ""),
            name:
              run.cycleName ??
              run.testCycleName ??
              run.name ??
              this.arrayTestCycles.find(
                (cycle) => String(cycle.id) === String(this.testCycleSelected),
              )?.name ??
              "Run",
          },
          degraded: false,
          failedWorkers: status === "failed" ? 1 : 0,
          lastUpdateAt: run.updatedAt ?? run.updated_at ?? run.date,
          progress: { completed, total: 1, percent: completed * 100 },
          requestedConcurrency: 1,
          stale: false,
          status,
          target: run.target ?? run.targetName ?? "",
          terminal: completed === 1,
          updateChannel: "classic-cli",
          workerSummary: [],
        };
      });
    },
    liveRunAnnouncement() {
      return boundedLiveRunAnnouncements(
        this.visibleExecutionActivity,
        this.language[this.config.currentLanguage].TestsPerformed
          .parallelStatuses,
        3,
      ).join(". ");
    },
    liveTransportLabel() {
      const labels = this.language[this.config.currentLanguage].TestsPerformed;
      const state = this.livePollingState;
      const updated = state.lastUpdatedAt
        ? new Date(state.lastUpdatedAt).toLocaleTimeString()
        : labels.liveTransportPending;
      const status = state.degraded
        ? labels.liveTransportDegraded
        : labels.liveTransportHealthy;
      return labels.liveTransportStatus
        .replace("{transport}", labels.liveTransportPolling)
        .replace("{status}", status)
        .replace("{updated}", updated);
    },
    selectedExecution() {
      return (
        this.arrayTestCyclesDate.find(
          (run) => String(run.id) === String(this.testCycleDateSelected),
        ) || null
      );
    },
    selectedExecutionDuration() {
      return this.selectedExecution ? this.runDuration(this.selectedExecution) : "—";
    },
    selectedExecutionContext() {
      return this.executionContextFor(this.selectedExecution);
    },
  },
  watch: {
    $route() {
      this.stopParallelRunPolling();
      this.loadParallelRuns();
      this.startParallelRunPolling();
      this.syncExecutionTabFromRoute();
      this.restoreAnalyticsFiltersFromRoute();
      this.syncSelectionFromRoute();
      this.$forceUpdate();
    },
  },
  created() {
    this.syncExecutionTabFromRoute();
    this.restoreAnalyticsFiltersFromRoute();
    this.getTestCycles({ autoSelectLatest: true, restoreFromRoute: true });
    this.loadParallelRuns();
    this.startParallelRunPolling();
    if (typeof document !== "undefined") {
      document.addEventListener(
        "visibilitychange",
        this.handleLiveVisibilityChange,
      );
    }
    this.emitter.on("refreshTestCyclePerformed", (msg) => {
      if (msg == true) {
        this.refreshResults();
        this.loadParallelRuns();
      } else this.$forceUpdate();
    });
  },
  beforeUnmount() {
    this.stopParallelRunPolling();
    if (typeof document !== "undefined") {
      document.removeEventListener(
        "visibilitychange",
        this.handleLiveVisibilityChange,
      );
    }
  },
  methods: {
    getVariant(status) {
      let variant = null;
      if (status == 0) {
        variant = "secondary";
      } else if (status == 1) {
        variant = "success";
      } else if (String(status) === "5") {
        variant = "warning";
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
      if (String(status) === "5") {
        return this.language[this.config.currentLanguage].TestsPerformed
          .statusSkipped;
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
      if (!this.isPostmanExecution(test)) {
        return [];
      }
      return parsePostmanResults(this.postmanPayload(test));
    },
    stepPostmanResults(step) {
      const stepResults = this.postmanResults(step);
      if (stepResults.length > 0) return stepResults;
      if (!this.isPostmanExecution(step)) return [];
      return this.postmanResults(this.selectedPerformedTest);
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
    showPostmanResponse(result) {
      this.$refs.modalPostmanResponseShow?.showModal?.(result);
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
          const liveRuns = Array.isArray(response.data) ? response.data : [];
          this.parallelRuns = mergeLiveRunWindow(
            this.parallelRuns,
            liveRuns,
            { projectId: getSelectedProjectId() },
          );
          if (liveRuns.length === 0) {
            this.loadClassicRunActivity();
          }
          this.livePollingState = nextLivePollingState(
            this.livePollingState,
            {
              baseDelayMs: this.config.timeCheck || 5000,
              hidden: this.isDocumentHidden(),
            },
          );
          this.scheduleNextParallelRunPoll();
        })
        .catch((e) => {
          if (e?.code === "ERR_CANCELED") return;
          this.livePollingState = nextLivePollingState(
            this.livePollingState,
            {
              baseDelayMs: this.config.timeCheck || 5000,
              error: e,
              hidden: this.isDocumentHidden(),
            },
          );
          this.scheduleNextParallelRunPoll();
          this.Logout(this, e);
          this.error = e;
        });
    },
    loadClassicRunActivity() {
      const cycleId =
        this.testCycleSelected ?? this.arrayTestCycles[0]?.id ?? null;
      if (cycleId == null) return Promise.resolve([]);
      return apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.getTestCyclePerformed +
            "/" +
            cycleId,
          {
            headers: this.setHeaders(),
            params: this.paginatedParams({
              ...this.runPagination,
              page: 1,
              perPage: Math.max(this.runPagination.perPage || 25, 10),
            }),
          },
        )
        .then((response) => {
          const result = this.normalizePaginatedResponse(
            response.data,
            this.runPagination,
          );
          this.arrayTestCyclesDate = result.data;
          this.testCycleSelected = cycleId;
          return this.arrayTestCyclesDate;
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
          return [];
        });
    },
    startParallelRunPolling() {
      if (this.parallelRunPoller != null) return;
      this.scheduleNextParallelRunPoll();
    },
    stopParallelRunPolling() {
      if (this.parallelRunPoller != null) {
        window.clearTimeout(this.parallelRunPoller);
        this.parallelRunPoller = null;
      }
      this.cancelParallelRunRequest();
    },
    cancelParallelRunRequest() {
      this.parallelRunAbortController?.abort();
      this.parallelRunAbortController = null;
    },
    scheduleNextParallelRunPoll() {
      if (this.parallelRunPoller != null) {
        window.clearTimeout(this.parallelRunPoller);
        this.parallelRunPoller = null;
      }
      if (
        !shouldContinueLivePolling(this.parallelRuns, {
          routeActive: this.$route?.name !== "login",
        })
      ) {
        return;
      }
      this.parallelRunPoller = window.setTimeout(() => {
        this.parallelRunPoller = null;
        this.loadParallelRuns();
      }, this.livePollingState.nextDelayMs);
    },
    handleLiveVisibilityChange() {
      this.livePollingState = createLivePollingState({
        ...this.livePollingState,
        hidden: this.isDocumentHidden(),
        nextDelayMs: this.isDocumentHidden()
          ? Math.max(this.livePollingState.nextDelayMs, 20_000)
          : this.config.timeCheck || 5000,
      });
      this.stopParallelRunPolling();
      if (!this.isDocumentHidden()) this.loadParallelRuns();
      this.startParallelRunPolling();
    },
    isDocumentHidden() {
      return typeof document !== "undefined" && document.hidden === true;
    },
    parallelRunVariant(status) {
      return liveRunStatusVariant(status);
    },
    parallelRunStatusLabel(status) {
      const labels =
        this.language[this.config.currentLanguage].TestsPerformed
          .parallelStatuses;
      return labels?.[status] || status || labels?.unknown || "Unknown";
    },
    runDetailStatusLabel(runDetail) {
      if (runDetail?.status === "unknown" && runDetail?.partial) {
        return this.language[this.config.currentLanguage].TestsPerformed
          .partialRunStatus;
      }
      return this.parallelRunStatusLabel(runDetail?.status);
    },
    canCancelParallelRun(run) {
      return cancellationEligibility(normalizeLiveRun(run), ["run.cancel"])
        .allowed;
    },
    retryEligibilityFor(scope) {
      return retryEligibility(this.retryRunSource, scope);
    },
    retryRunStateLabel(scope) {
      const labels = this.language[this.config.currentLanguage].TestsPerformed;
      const eligibility = this.retryEligibilityFor(scope);
      if (eligibility.requiresPreflight) return labels.retryPreflightRequired;
      return labels.retryStates?.[eligibility.reason] ?? eligibility.reason;
    },
    retryRunEndpoint(runId) {
      return this.parallelRunEndpoint(runId, "/retry");
    },
    async retryRun(scope) {
      const labels = this.language[this.config.currentLanguage].TestsPerformed;
      const request = createRetryRunRequest(this.retryRunSource, {
        actor: "current-user",
        scope,
      });
      if (!request.allowed) {
        this.retryAudit = {
          ...this.retryAudit,
          [this.currentRunDetail.id]: {
            message: this.retryRunStateLabel(scope),
            status: request.eligibility.reason,
          },
        };
        return;
      }
      const confirmed = await this.$showConfirm({
        cancelLabel: labels.keepCurrentRun,
        confirmLabel: labels.confirmRetryRun,
        message: labels.retryRunMessage
          .replace("{runId}", this.currentRunDetail.id)
          .replace("{scope}", scope),
        title: labels.retryRunTitle,
        variant: "info",
      });
      if (!confirmed) return;

      this.retryAudit = {
        ...this.retryAudit,
        [this.currentRunDetail.id]: {
          idempotencyKey: request.idempotencyKey,
          message: labels.retryRequested,
          status: request.status,
        },
      };
      this.emitter.emit("showLoader", true);
      try {
        const response = await apiClient.post(
          this.retryRunEndpoint(this.currentRunDetail.id),
          request.body,
          {
            headers: { ...this.setHeaders(), ...request.headers },
          },
        );
        const retryResponse = normalizeRetryRunResponse(response, {
          projectId: getSelectedProjectId(),
          sourceRunId: this.currentRunDetail.id,
        });
        this.retryAudit = {
          ...this.retryAudit,
          [this.currentRunDetail.id]: {
            ...this.retryAudit[this.currentRunDetail.id],
            message: labels.retryCreated.replace(
              "{runId}",
              retryResponse.derivedRunId,
            ),
            status: "created",
            trace: retryResponse.trace,
          },
        };
        if (this.$router?.push) this.$router.push(retryResponse.route);
      } catch (e) {
        this.retryAudit = {
          ...this.retryAudit,
          [this.currentRunDetail.id]: {
            ...this.retryAudit[this.currentRunDetail.id],
            message: labels.retryFailedRequest,
            status: "failed",
          },
        };
        this.Logout(this, e);
      } finally {
        this.emitter.emit("showLoader", false);
      }
    },
    parallelResultSummary(run) {
      return normalizeLiveRun(run).workerSummary;
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
    cancellationAuditLabel(run) {
      const audit = this.cancellationAudit[run.id];
      const labels =
        this.language[this.config.currentLanguage].TestsPerformed
          .cancellationStates;
      return (
        labels?.[audit.status] ??
        labels?.[audit.audit?.outcome] ??
        labels?.requested ??
        "Cancellation requested"
      );
    },
    toggleLiveRunStatus(status) {
      if (this.liveRunStatuses.includes(status)) {
        this.liveRunStatuses = this.liveRunStatuses.filter(
          (entry) => entry !== status,
        );
      } else {
        this.liveRunStatuses = [...this.liveRunStatuses, status];
      }
      if (this.liveRunStatuses.length === 0) {
        this.liveRunStatuses = ["queued", "running", "cancelling"];
      }
    },
    liveRunProgressLabel(run) {
      const labels = this.language[this.config.currentLanguage].TestsPerformed;
      return `${run.cycle.name}: ${labels.progress} ${run.progress.completed}/${run.progress.total}`;
    },
    openParallelRunDetails(run) {
      if (this.$router?.push) {
        this.$router.push(
          runDetailRoute({
            projectId: getSelectedProjectId(),
            runId: run.id,
            tab: this.runDetailActiveTab,
          }),
        );
      } else {
        this.replaceExecutionQuery({ runId: String(run.id) });
      }
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
    syncExecutionTabFromRoute() {
      this.activeExecutionTab = normalizeExecutionTab(
        this.routeQueryText("view", "results"),
      );
    },
    selectExecutionTab(tab) {
      this.activeExecutionTab = normalizeExecutionTab(tab);
      this.replaceExecutionQuery({ view: this.activeExecutionTab });
    },
    replaceExecutionQuery(patch, options = {}) {
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
      const preserveScroll = options.preserveScroll !== false;
      const scrollLeft =
        typeof window !== "undefined" ? window.scrollX || window.pageXOffset || 0 : 0;
      const scrollTop =
        typeof window !== "undefined" ? window.scrollY || window.pageYOffset || 0 : 0;
      const navigation = this.$router.replace({ query: nextQuery });
      if (preserveScroll && typeof window !== "undefined") {
        Promise.resolve(navigation)
          .catch(() => {})
          .then(() => {
            const restore = () => {
              const canScroll =
                typeof window.scrollTo === "function" &&
                !String(window.scrollTo).includes("notImplemented");
              if (canScroll) {
                try {
                  window.scrollTo(scrollLeft, scrollTop);
                } catch {
                  // Test environments may expose scrollTo without implementing it.
                }
              }
            };
            if (typeof window.requestAnimationFrame === "function") {
              window.requestAnimationFrame(restore);
            } else {
              restore();
            }
          });
      }
    },
    restoreAnalyticsFiltersFromRoute() {
      this.analyticsWindow = this.routeQueryText("analyticsWindow", "7d");
      this.analyticsTimezone = this.routeQueryText("analyticsTimezone", "UTC");
      const statuses = this.routeQueryList("status").filter((status) =>
        this.analyticsStatusOptions.includes(status),
      );
      this.analyticsStatuses =
        statuses.length > 0 ? statuses : ["passed", "failed", "pending"];
      this.restoreRunHistoryFiltersFromRoute();
      this.runDetailActiveTab = normalizeRunDetailTab(this.$route?.query?.tab);
    },
    restoreRunHistoryFiltersFromRoute() {
      this.runHistoryFilters = normalizeRunHistoryFilters(this.$route?.query, {
        projectId: getSelectedProjectId(),
      });
      this.runHistoryStatus = this.runHistoryFilters.statuses[0] ?? "";
      this.runHistoryTag = this.runHistoryFilters.tag ?? "";
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
    applyRunHistoryFilters() {
      this.runHistoryFilters = normalizeRunHistoryFilters(
        {
          ...this.runHistoryFilters,
          statuses: this.runHistoryStatus ? [this.runHistoryStatus] : [],
          tag: this.runHistoryTag,
        },
        { projectId: getSelectedProjectId() },
      );
      this.replaceExecutionQuery(
        Object.fromEntries(buildRunHistoryQuery(this.runHistoryFilters)),
      );
    },
    clearRunHistoryFilters() {
      this.runHistoryStatus = "";
      this.runHistoryTag = "";
      this.applyRunHistoryFilters();
    },
    saveRunHistoryView() {
      const view = createRunHistorySavedView(
        {
          filters: this.runHistoryFilters,
          name: `View ${this.runHistorySavedViews.length + 1}`,
        },
        { owner: "local", projectId: getSelectedProjectId() },
      );
      this.runHistorySavedViews = [...this.runHistorySavedViews, view];
    },
    applyRunHistorySavedView(view) {
      this.runHistoryFilters = view.filters;
      this.runHistoryStatus = view.filters.statuses[0] ?? "";
      this.runHistoryTag = view.filters.tag ?? "";
      this.applyRunHistoryFilters();
    },
    updateRunHistorySort(sort) {
      this.runHistoryFilters = normalizeRunHistoryFilters(
        {
          ...this.runHistoryFilters,
          direction: sort.direction,
          sort: sort.field,
        },
        { projectId: getSelectedProjectId() },
      );
      this.applyRunHistoryFilters();
    },
    handleRunHistoryAction({ row }) {
      this.openRunHistoryRow(row);
    },
    openRunHistoryRow(row) {
      if (this.$router?.push) {
        this.$router.push(
          runDetailRoute({
            projectId: getSelectedProjectId(),
            runId: row.id,
            tab: this.runDetailActiveTab,
          }),
        );
      } else {
        this.getTest(row.id);
      }
    },
    selectRunDetailTab(tab) {
      this.runDetailActiveTab = normalizeRunDetailTab(tab);
      this.replaceExecutionQuery({ tab: this.runDetailActiveTab });
    },
    runDetailTabLabel(tab) {
      const labels =
        this.language[this.config.currentLanguage].TestsPerformed.runDetailTabs;
      return labels?.[tab] ?? tab;
    },
    selectDrilldownNode(node) {
      if (this.$router?.push && this.currentRunDetail) {
        this.$router.push(
          drilldownSelectionRoute({
            detailId: node.id,
            projectId: getSelectedProjectId(),
            runId: this.currentRunDetail.id,
            tab: this.runDetailActiveTab,
          }),
        );
      } else {
        this.replaceExecutionQuery({ detailId: node.id });
      }
    },
    artifactExplanationFor(artifact) {
      return artifactExplanation(
        artifact,
        this.language[this.config.currentLanguage].TestsPerformed
          .artifactStates,
      );
    },
    openArtifactFullView(artifact) {
      if (this.$router?.push && this.currentRunDetail) {
        this.$router.push(
          fullArtifactRoute({
            artifactId: artifact.id,
            projectId: getSelectedProjectId(),
            runId: this.currentRunDetail.id,
          }),
        );
      } else {
        this.replaceExecutionQuery({
          artifactId: artifact.id,
          tab: "artifacts",
        });
      }
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
    changeCyclePage(delta) {
      const nextPage = Math.min(
        Math.max(this.cyclePagination.page + delta, 1),
        this.cyclePagination.lastPage,
      );
      if (nextPage === this.cyclePagination.page) return;
      this.getTestCycles({ page: nextPage });
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
      const normalizedRun = normalizeLiveRun(run);
      const request = createCancellationRequest(normalizedRun, {
        actor: "current-user",
        capabilities: ["run.cancel"],
        idempotencyKey:
          this.cancellationAudit[normalizedRun.id]?.idempotencyKey,
        requestedAt: new Date(),
      });
      if (!request.allowed) return;
      const confirmed = await this.$showConfirm({
        cancelLabel: labels.keepRunning,
        confirmLabel: labels.confirmCancelRun,
        message: labels.cancelRunMessage
          .replace("{runId}", normalizedRun.id)
          .replace(
            "{scope}",
            `${normalizedRun.activeConcurrency}/${normalizedRun.requestedConcurrency}`,
          ),
        title: labels.cancelRunTitle,
        variant: "warning",
      });
      if (!confirmed) return;

      this.cancellationAudit = {
        ...this.cancellationAudit,
        [normalizedRun.id]: request,
      };
      this.parallelRuns = this.parallelRuns.map((parallelRun) =>
        String(parallelRun.id) === String(normalizedRun.id)
          ? { ...parallelRun, status: "cancelling" }
          : parallelRun,
      );
      this.emitter.emit("showLoader", true);
      apiClient
        .post(
          this.parallelRunEndpoint(normalizedRun.id, "/cancel"),
          request.body,
          {
            headers: { ...this.setHeaders(), ...request.headers },
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          const result = normalizeCancellationResponse(response, request);
          this.parallelRuns = this.parallelRuns.map((parallelRun) =>
            String(parallelRun.id) === String(normalizedRun.id)
              ? { ...parallelRun, ...result.run }
              : parallelRun,
          );
          this.cancellationAudit = {
            ...this.cancellationAudit,
            [normalizedRun.id]: {
              ...request,
              audit: result.audit,
              status: result.uiState,
            },
          };
        })
        .catch((e) => {
          this.emitter.emit("showLoader", false);
          this.cancellationAudit = {
            ...this.cancellationAudit,
            [normalizedRun.id]: {
              ...request,
              retryable: shouldRetryCancellation(e),
              status: shouldRetryCancellation(e) ? "retryable" : "rejected",
            },
          };
          this.Logout(this, e);
          this.error = e;
        });
    },
    getTestCycles(options = {}) {
      const selectedCycleId = this.testCycleSelected;
      this.spinreverse = "spin-reverse";
      this.arrayTestCyclesDate = [];
      this.arrayTest = [];
      this.testCycleSelected = null;
      this.testCycleDateSelected = null;
      this.emitter.emit("showLoader", true);
      this.cyclePagination = {
        ...this.cyclePagination,
        page:
          options.page ||
          this.routeQueryInteger("cyclePage", this.cyclePagination.page || 1),
        perPage: this.routeQueryInteger(
          "cyclePerPage",
          this.cyclePagination.perPage || 25,
        ),
      };
      return apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.testcycles +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
            params: {
              page: this.cyclePagination.page,
              pageSize: this.cyclePagination.perPage,
              sort: this.cyclePagination.sort,
              direction: this.cyclePagination.direction,
            },
          },
        )
        .then((response) => {
          this.spinreverse = null;
          this.emitter.emit("showLoader", false);
          if (Array.isArray(response.data)) {
            this.arrayTestCycles = response.data;
            this.cyclePagination = {
              ...this.cyclePagination,
              total: null,
              lastPage: 1,
            };
          } else {
            const meta = response.data?.meta || {};
            this.arrayTestCycles = Array.isArray(response.data?.data)
              ? response.data.data
              : [];
            this.cyclePagination = {
              ...this.cyclePagination,
              page: Number(meta.page) || this.cyclePagination.page,
              perPage: Number(meta.pageSize) || this.cyclePagination.perPage,
              total: Number.isFinite(Number(meta.total))
                ? Number(meta.total)
                : 0,
              lastPage: Math.max(Number(meta.lastPage) || 1, 1),
              sort: meta.sort || this.cyclePagination.sort,
              direction: meta.direction || this.cyclePagination.direction,
            };
          }
          this.replaceExecutionQuery({
            cyclePage: String(this.cyclePagination.page),
            cyclePerPage: String(this.cyclePagination.perPage),
          });
          if (options.restoreFromRoute === true) {
            const hasRouteSelection =
              this.routeQueryId("testCycleId") != null ||
              this.routeQueryId("runId") != null;
            if (hasRouteSelection) {
              this.restoreSelectionFromRoute();
              return;
            }
          }
          if (
            options.autoSelectLatest === true &&
            (selectedCycleId != null || this.cyclePagination.page === 1)
          ) {
            const cycleToSelect =
              this.arrayTestCycles.find(
                (cycle) => String(cycle.id) === String(selectedCycleId),
              ) || this.arrayTestCycles[0];
            if (cycleToSelect) {
              return this.getTestCyclesDate(cycleToSelect.id, {
                autoSelectLatest: true,
                page: 1,
              });
            }
          }
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    getTestCyclesDate(id, options = {}) {
      this.arrayTest = [];
      this.testSelected = null;
      this.selectedTestName = "";
      this.selectedTestSteps = [];
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
          if (options.autoSelectLatest === true && this.arrayTestCyclesDate[0]) {
            return this.getTest(this.arrayTestCyclesDate[0].id, {
              page: 1,
              syncRoute: options.syncRoute,
            });
          }
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
    refreshResults() {
      return this.getTestCycles({ autoSelectLatest: true });
    },
    showLatestResult() {
      return this.getTestCycles({ autoSelectLatest: true, page: 1 });
    },

    getTest(id, options = {}) {
      this.emitter.emit("showLoader", true);
      this.testCycleDateSelected = id;
      this.testSelected = null;
      this.selectedPerformedTest = null;
      this.selectedTestName = "";
      this.selectedTestSteps = [];
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
          if (this.arrayTest[0]) {
            this.selectPerformedTest(this.arrayTest[0], { syncRoute: false });
          }
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
    selectPerformedTest(test, options = {}) {
      this.testSelected = test?.id ?? null;
      this.selectedPerformedTest = test ?? null;
      this.selectedTestName = test?.name ?? "";
      this.selectedTestSteps = [];
      if (test?.id == null) return Promise.resolve();
      return this.loadStepResults(test.id, test.name, options);
    },
    openSelectedTestDetails() {
      if (this.testSelected == null) return;
      this.getStep(this.testSelected, this.selectedTestName);
    },
    getStepVariant(step) {
      if (this.isPostmanExecution(step)) {
        const failed = this.stepPostmanResults(step).some(
          (result) => result.passed === false,
        );
        if (failed) return "danger";
      }
      return this.getVariant(step?.status);
    },
    getStepStatusLabel(step) {
      if (this.getStepVariant(step) === "danger") {
        return this.language[this.config.currentLanguage].TestsPerformed
          .statusFailed;
      }
      if (String(step?.status) === "5") {
        return this.language[this.config.currentLanguage].TestsPerformed
          .statusSkipped;
      }
      return this.getStatusLabel(step?.status);
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
      return this.formatElapsed(this.timestampDiff(step?.created_at, step?.updated_at));
    },
    runDuration(run) {
      return this.formatElapsed(this.timestampDiff(run?.created_at, run?.updated_at));
    },
    executionContextFor(run) {
      const labels = this.language[this.config.currentLanguage].TestsPerformed;
      const context = this.safeJsonObject(
        run?.executionContext ?? run?.execution_context ?? run?.context,
      );
      const browser = [context.browser, context.browserVersion]
        .filter(Boolean)
        .join(" ");
      const operatingSystem = [context.platformName, context.platformVersion]
        .filter(Boolean)
        .join(" ");
      return {
        environment:
          context.environmentName || context.environment || labels.notCaptured,
        browser: browser || labels.notCaptured,
        device:
          context.deviceName ||
          context.device ||
          context.deviceType ||
          labels.notCaptured,
        operatingSystem: operatingSystem || labels.notCaptured,
      };
    },
    executionContextSummary(run) {
      const labels = this.language[this.config.currentLanguage].TestsPerformed;
      const context = this.executionContextFor(run);
      return [
        `${labels.environment}: ${context.environment}`,
        `${labels.browser}: ${context.browser}`,
        `${labels.device}: ${context.device}`,
        `${labels.operatingSystem}: ${context.operatingSystem}`,
      ].join(" · ");
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
    safeJsonObject(value) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return value;
      }
      if (typeof value !== "string" || value.length === 0) {
        return {};
      }
      try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? parsed
          : {};
      } catch {
        return {};
      }
    },
    loadStepResults(id, name, options = {}) {
      if (options.showLoader !== false) {
        this.emitter.emit("showLoader", true);
      }
      return apiClient
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
          this.testSelected = id;
          this.selectedTestName = name;
          this.selectedTestSteps = Array.isArray(response.data)
            ? response.data
            : [];
          return this.selectedTestSteps;
        })
        .catch((e) => {
          this.emitter.emit("showLoader", false);
          this.error = e;
          this.Logout(this, e);
          return [];
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
          this.testSelected = id;
          this.selectedTestName = name;
          this.selectedTestSteps = Array.isArray(response.data)
            ? response.data
            : [];
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
