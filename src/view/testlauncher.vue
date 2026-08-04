<template>
  <main class="launch-page" aria-labelledby="launch-page-title">
    <section class="launch-page__hero">
      <div>
        <p>{{ launcherCopy.pageEyebrow }}</p>
        <h1 id="launch-page-title">{{ launcherCopy.pageTitle }}</h1>
        <span>{{ launcherCopy.pageDescription }}</span>
      </div>
      <div class="launch-page__hero-actions">
        <span :class="['launch-page__readiness', launchReadiness.className]">
          <font-awesome-icon :icon="launchReadiness.icon" aria-hidden="true" />
          {{ launchReadiness.label }}
        </span>
        <button
          class="btn btn-outline-light btn-sm"
          type="button"
          v-on:click="refreshLaunchAssets"
        >
          <font-awesome-icon icon="rotate" aria-hidden="true" />
          {{ launcherCopy.refresh }}
        </button>
      </div>
    </section>

    <section class="launch-page__path" :aria-label="launcherCopy.pathLabel">
      <article
        v-for="step in launchPathSteps"
        v-bind:key="step.key"
        :class="[
          'launch-page__path-step',
          { 'launch-page__path-step--complete': step.complete },
        ]"
      >
        <span class="launch-page__path-index">{{ step.index }}</span>
        <div>
          <strong>{{ step.title }}</strong>
          <small>{{ step.value }}</small>
        </div>
      </article>
    </section>

    <section class="launch-page__workspace">
      <div class="launch-page__selectors">
        <LaunchAssetSelector
          v-model="selectedCycleId"
          group-name="launch-cycle"
          :copy="launcherCopy.cycleSelector"
          :items="cycleAssets"
          :query="cycleQuery"
          v-on:query-change="updateCycleQuery"
          v-on:update:model-value="selectCycle"
        />
        <LaunchAssetSelector
          v-model="selectedEnvironmentId"
          group-name="launch-environment"
          :copy="launcherCopy.environmentSelector"
          :items="environmentAssets"
          :query="environmentQuery"
          v-on:query-change="updateEnvironmentQuery"
          v-on:update:model-value="selectEnvironment"
        />
      </div>

      <aside class="launch-page__side-panel">
        <LaunchTargetConfigurator
          v-model="selectedTargetId"
          :concurrency="concurrency"
          :copy="language[config.currentLanguage].LaunchTarget"
          :overrides="targetOverrides"
          :targets="targetAssets"
          v-on:update:concurrency="selectConcurrency"
          v-on:update:model-value="selectTarget"
          v-on:update:overrides="selectOverrides"
        />

        <LaunchPreflightPanel
          :copy="language[config.currentLanguage].LaunchPreflight"
          :result="preflightResult"
          :running="preflightRunning"
          :stale="preflightStale"
          v-on:focus-area="focusLaunchArea"
          v-on:run="runPreflight"
        />
      </aside>
    </section>

    <section class="launch-page__review" aria-live="polite">
      <LaunchReviewSummary
        :copy="language[config.currentLanguage].LaunchReview"
        :summary="launchReviewSummary"
      />
      <button
        class="btn btn-success"
        type="button"
        :disabled="!canOpenTargetSelection || launchSubmitting"
        :title="language[config.currentLanguage].Actions.launch"
        v-on:click="launchSelectedCycle"
      >
        <font-awesome-icon
          icon="rocket"
          class="idelium-action-icon idelium-action-icon--launch"
          aria-hidden="true"
        />
        {{
          launchSubmitting ? launcherCopy.launching : launcherCopy.launchtest
        }}
      </button>
      <p v-if="launchError" class="launch-page__error" aria-live="polite">
        {{ launchErrorCopy }}
        <span v-if="launchError.correlationId">
          {{ launcherCopy.correlationId }}: {{ launchError.correlationId }}
        </span>
        <button
          v-if="launchError.recoverable"
          class="btn btn-link btn-sm"
          type="button"
          v-on:click="retryLaunch"
        >
          {{ launcherCopy.retryLaunch }}
        </button>
      </p>
    </section>

    <platformLauncher ref="platformLauncher" />
  </main>
</template>

<script>
import LaunchAssetSelector from "@/components/launch/LaunchAssetSelector.vue";
import LaunchPreflightPanel from "@/components/launch/LaunchPreflightPanel.vue";
import LaunchReviewSummary from "@/components/launch/LaunchReviewSummary.vue";
import LaunchTargetConfigurator from "@/components/launch/LaunchTargetConfigurator.vue";
import { createLaunchApiRequest } from "@/domain/launchContracts";
import { normalizeLaunchError } from "@/domain/launchErrors";
import {
  isPreflightStale,
  launchConfigurationHash,
  localPreflightResult,
  normalizePreflightResult,
} from "@/domain/launchPreflight";
import { buildLaunchReviewSummary } from "@/domain/launchReview";
import {
  canonicalExecutionRoute,
  createLaunchSubmission,
  normalizeLaunchSubmissionResult,
  shouldReconcileLaunchOutcome,
} from "@/domain/launchSubmission";
import {
  buildLaunchAssetQuery,
  buildLaunchSelectionQuery,
  isLaunchSelectionCompatible,
  launchSelectionFromRoute,
  normalizeLaunchAssetRows,
} from "@/domain/launchSelection";
import {
  defaultLaunchTargetsForRuntime,
  normalizeLaunchTargets,
  validateLaunchTargetConfiguration,
} from "@/domain/launchTargets";
import apiClient from "@/services/apiClient";
import { getSelectedProjectId } from "@/stores/session";

import platformLauncher from "./platformlauncher/modalListPlatform.vue";

export default {
  name: "TestLauncherComponent",
  components: {
    LaunchAssetSelector,
    LaunchPreflightPanel,
    LaunchReviewSummary,
    LaunchTargetConfigurator,
    platformLauncher,
  },
  data() {
    const routeSelection = launchSelectionFromRoute(this.$route?.query ?? {});
    return {
      arrayTestCycles: [],
      cycleQuery: buildLaunchAssetQuery({
        search: this.$route?.query?.cycleSearch,
      }),
      environmentQuery: buildLaunchAssetQuery({
        search: this.$route?.query?.environmentSearch,
      }),
      error: null,
      launchError: null,
      launchStatus: "idle",
      launchSubmitting: false,
      launchSubmissionKey: null,
      listEnvironments: [],
      preflightResult: null,
      preflightRunning: false,
      preflightTimer: null,
      rawPlatformTargets: [],
      rawTargets: [],
      concurrency: Number.parseInt(this.$route?.query?.concurrency, 10) || 1,
      selectedCycleId: routeSelection.cycleId,
      selectedEnvironmentId: routeSelection.environmentId,
      selectedTargetId: this.$route?.query?.targetId ?? "platform-pool",
      targetOverrides: {
        browser: this.$route?.query?.browser ?? null,
        device: this.$route?.query?.device ?? null,
      },
    };
  },
  computed: {
    launcherCopy() {
      return this.language[this.config.currentLanguage].TestLauncher;
    },
    selectedEnvironment() {
      return this.environmentAssets.find(
        (item) => String(item.id) === String(this.selectedEnvironmentId),
      );
    },
    selectedCycle() {
      return this.cycleAssets.find(
        (item) => String(item.id) === String(this.selectedCycleId),
      );
    },
    selectedTarget() {
      return this.targetAssets.find(
        (item) => String(item.id) === String(this.selectedTargetId),
      );
    },
    environmentAssets() {
      return normalizeLaunchAssetRows(this.listEnvironments, {
        projectId: getSelectedProjectId(),
        type: "environment",
      });
    },
    cycleAssets() {
      return normalizeLaunchAssetRows(this.arrayTestCycles, {
        projectId: getSelectedProjectId(),
        selectedRuntime: this.selectedEnvironment?.runtime,
        type: "cycle",
      });
    },
    targetAssets() {
      const runtime =
        this.selectedEnvironment?.runtime ?? this.selectedCycle?.runtime;
      const normalized = normalizeLaunchTargets(this.rawTargets, {
        selectedRuntime: runtime,
      });
      const platformTargets = normalizeLaunchTargets(this.rawPlatformTargets, {
        selectedRuntime: runtime,
      });
      const targets = [...platformTargets, ...normalized];
      if (
        this.selectedTargetId === "platform-pool" &&
        platformTargets.some((target) => !target.disabledReason)
      ) {
        return targets;
      }
      return targets.length > 0 ? targets : defaultLaunchTargetsForRuntime(runtime);
    },
    targetDiagnostics() {
      return validateLaunchTargetConfiguration({
        concurrency: this.concurrency,
        overrides: this.targetOverrides,
        target: this.selectedTarget,
      });
    },
    launchRequest() {
      return createLaunchApiRequest({
        concurrency: { limit: this.concurrency },
        cycle: this.selectedCycle?.raw ?? this.selectedCycle,
        environment: this.selectedEnvironment?.raw ?? this.selectedEnvironment,
        idProject: getSelectedProjectId(),
        options: this.targetOverrides,
        projectId: getSelectedProjectId(),
        target: this.selectedTarget?.raw ?? this.selectedTarget,
      });
    },
    currentPreflightHash() {
      return launchConfigurationHash(this.launchRequest.body);
    },
    preflightStale() {
      return isPreflightStale(this.preflightResult, this.currentPreflightHash);
    },
    launchReviewSummary() {
      return buildLaunchReviewSummary({
        baseUrl: this.config.serviceBaseUrl || "https://localhost",
        concurrency: this.concurrency,
        cycle: this.selectedCycle,
        environment: this.selectedEnvironment,
        launchRequest: this.launchRequest,
        overrides: this.targetOverrides,
        preflightResult: this.preflightResult,
        projectId: getSelectedProjectId(),
        target: this.selectedTarget,
      });
    },
    launchPathSteps() {
      const launchCopy = this.language[this.config.currentLanguage].Launch;
      return [
        {
          complete: Boolean(this.selectedCycle),
          index: "01",
          key: "cycle",
          title: this.launcherCopy.cycleSelector.title,
          value: this.selectedCycle?.name ?? this.launcherCopy.notSelected,
        },
        {
          complete: Boolean(this.selectedEnvironment),
          index: "02",
          key: "environment",
          title: this.launcherCopy.environmentSelector.title,
          value:
            this.selectedEnvironment?.name ?? this.launcherCopy.notSelected,
        },
        {
          complete: Boolean(this.selectedTarget),
          index: "03",
          key: "target",
          title: launchCopy.target,
          value: this.selectedTarget?.name ?? this.launcherCopy.notSelected,
        },
        {
          complete:
            Boolean(this.preflightResult) &&
            !this.preflightStale &&
            !this.preflightResult?.hasBlockingDiagnostics,
          index: "04",
          key: "preflight",
          title: launchCopy.preflight,
          value: this.preflightStale
            ? this.launcherCopy.preflightRequired
            : this.launcherCopy.preflightReady,
        },
      ];
    },
    launchReadiness() {
      if (this.launchSubmitting) {
        return {
          className: "launch-page__readiness--busy",
          icon: "rotate",
          label: this.launcherCopy.launching,
        };
      }
      if (this.canOpenTargetSelection) {
        return {
          className: "launch-page__readiness--ready",
          icon: "check-circle",
          label: this.launcherCopy.readyToLaunch,
        };
      }
      return {
        className: "launch-page__readiness--draft",
        icon: "exclamation-triangle",
        label: this.launcherCopy.needsReview,
      };
    },
    launchErrorCopy() {
      if (!this.launchError) return "";
      return (
        this.language[this.config.currentLanguage].LaunchErrors?.[
          this.launchError.type
        ] ?? this.launcherCopy.launchError
      );
    },
    canOpenTargetSelection() {
      return (
        this.selectedCycle &&
        this.selectedEnvironment &&
        this.selectedTarget &&
        !this.selectedCycle.disabledReason &&
        !this.selectedEnvironment.disabledReason &&
        this.targetDiagnostics.every((diagnostic) => !diagnostic.blocking) &&
        !this.preflightStale &&
        !this.preflightResult?.hasBlockingDiagnostics
      );
    },
  },
  watch: {
    concurrency() {
      this.invalidatePreflight();
    },
    selectedCycleId() {
      this.invalidatePreflight();
    },
    selectedEnvironmentId() {
      this.invalidatePreflight();
    },
    selectedTargetId() {
      this.invalidatePreflight();
    },
    targetOverrides: {
      deep: true,
      handler() {
        this.invalidatePreflight();
      },
    },
  },
  created() {
    this.getTestCycles();
    this.getLaunchTargets();
    this.emitter.on("refreshTestLauncher", () => {
      this.refreshLaunchAssets();
    });
  },
  beforeUnmount() {
    clearTimeout(this.preflightTimer);
  },
  methods: {
    refreshLaunchAssets() {
      this.getTestCycles();
      this.getEnvironments();
      this.getLaunchTargets();
    },
    getTestCycles() {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.testcycles +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
            params: this.cycleQuery,
          },
        )
        .then((response) => {
          this.arrayTestCycles = this.extractRows(response.data);
          this.ensureSelection("cycle");
          this.getEnvironments();
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    getEnvironments() {
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.environments +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
            params: this.environmentQuery,
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.listEnvironments = this.extractRows(response.data);
          this.ensureSelection("environment");
          this.clearIncompatibleCycle();
          this.ensureTargetSelection();
          this.syncDraftRoute();
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    getLaunchTargets() {
      const endpoint =
        this.config.url.launchTargets ??
        `${this.config.url.launchtest}/targets`;
      apiClient
        .get(
          this.config.serviceBaseUrl + endpoint + "/" + getSelectedProjectId(),
          {
            headers: this.setHeaders(),
            params: { page: 1, pageSize: 50 },
          },
        )
        .then((response) => {
          this.rawTargets = this.extractRows(response.data);
          this.ensureTargetSelection();
          this.syncDraftRoute();
          this.getManagedPlatformTargets();
        })
        .catch(() => {
          this.rawTargets = [];
          this.ensureTargetSelection();
          this.getManagedPlatformTargets();
        });
    },
    getManagedPlatformTargets() {
      if (!this.config.url.platforms) {
        this.rawPlatformTargets = [];
        return Promise.resolve([]);
      }
      return apiClient
        .get(this.config.serviceBaseUrl + this.config.url.platforms + "/types", {
          headers: this.setHeaders(),
        })
        .then((response) => {
          const types = this.extractRows(response.data);
          return Promise.all(
            types.map((type) =>
              apiClient
                .get(
                  this.config.serviceBaseUrl +
                    this.config.url.platforms +
                    "/manageplatforms/" +
                    type.id,
                  {
                    headers: this.setHeaders(),
                    params: { page: 1, pageSize: 50 },
                  },
                )
                .then((platformResponse) =>
                  this.extractRows(platformResponse.data).map((platform) =>
                    this.platformToLaunchTarget(platform, type),
                  ),
                )
                .catch(() => []),
            ),
          );
        })
        .then((groups) => {
          this.rawPlatformTargets = groups.flat();
          this.ensureTargetSelection();
          this.syncDraftRoute();
          return this.rawPlatformTargets;
        })
        .catch(() => {
          this.rawPlatformTargets = [];
          this.ensureTargetSelection();
          return [];
        });
    },
    platformToLaunchTarget(platform, type) {
      const platformId = platform.id;
      const typeName = String(type?.name || "").toLowerCase();
      const runtime = typeName.includes("mobile") ? "appium" : "selenium";
      const isAvailable =
        platform.status == null ||
        String(platform.status) === "1" ||
        String(platform.status).toLowerCase() === "free" ||
        String(platform.status).toLowerCase() === "healthy";
      return {
        browser: platform.browserDescription,
        capabilities: ["browserOverride"],
        capacity: {
          available: isAvailable ? 1 : 0,
          max: 1,
          queued: 0,
        },
        health: isAvailable ? "healthy" : "disabled",
        hostname: platform.hostname,
        id: `platform-${platformId}`,
        idPlatform: platformId,
        lastHealthAt: platform.updated_at ?? platform.updatedAt ?? new Date().toISOString(),
        name:
          platform.hostname ||
          [platform.osDescription, platform.browserDescription]
            .filter(Boolean)
            .join(" · ") ||
          `Platform ${platformId}`,
        platformId,
        region: platform.locationLabel ?? platform.location ?? "",
        runtime,
        type: "platform",
      };
    },
    extractRows(payload) {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
    ensureSelection(kind) {
      const key =
        kind === "cycle" ? "selectedCycleId" : "selectedEnvironmentId";
      const assets =
        kind === "cycle" ? this.cycleAssets : this.environmentAssets;
      if (assets.some((item) => String(item.id) === String(this[key]))) return;
      const firstEligible = assets.find((item) => !item.disabledReason);
      this[key] = firstEligible?.id ?? null;
    },
    clearIncompatibleCycle() {
      if (
        this.selectedCycle &&
        this.selectedEnvironment &&
        !isLaunchSelectionCompatible(
          this.selectedCycle,
          this.selectedEnvironment,
        )
      ) {
        this.selectedCycleId = null;
      }
    },
    ensureTargetSelection() {
      if (
        this.targetAssets.some(
          (item) => String(item.id) === String(this.selectedTargetId),
        )
      ) {
        return;
      }
      this.selectedTargetId =
        this.targetAssets.find((item) => !item.disabledReason)?.id ?? null;
    },
    updateCycleQuery(query) {
      this.cycleQuery = buildLaunchAssetQuery(query);
      this.getTestCycles();
    },
    updateEnvironmentQuery(query) {
      this.environmentQuery = buildLaunchAssetQuery(query);
      this.getEnvironments();
    },
    selectCycle(id) {
      this.selectedCycleId = id;
      this.syncDraftRoute();
    },
    selectEnvironment(id) {
      this.selectedEnvironmentId = id;
      this.clearIncompatibleCycle();
      this.ensureTargetSelection();
      this.syncDraftRoute();
    },
    selectTarget(id) {
      this.selectedTargetId = id;
      this.syncDraftRoute();
    },
    selectConcurrency(value) {
      this.concurrency = Math.max(Number.parseInt(value, 10) || 1, 1);
      this.syncDraftRoute();
    },
    selectOverrides(value) {
      this.targetOverrides = value;
      this.syncDraftRoute();
    },
    invalidatePreflight() {
      if (this.preflightResult) {
        this.preflightResult = {
          ...this.preflightResult,
          configurationHash: "stale",
        };
      }
      clearTimeout(this.preflightTimer);
      this.preflightTimer = setTimeout(() => {
        if (
          this.selectedCycle &&
          this.selectedEnvironment &&
          this.selectedTarget
        ) {
          this.runPreflight();
        }
      }, 350);
    },
    localPreflightDiagnostics() {
      return this.targetDiagnostics.map((diagnostic) => ({
        area: String(diagnostic.location || "target").split(".")[0],
        blocking: diagnostic.blocking,
        code: diagnostic.code,
        focusTarget: diagnostic.location,
        location: diagnostic.location,
        message: this.preflightMessage(diagnostic),
        remediation: this.preflightRemediation(diagnostic),
        severity: diagnostic.severity,
      }));
    },
    preflightMessage(diagnostic) {
      const key = String(diagnostic.remediationKey ?? "")
        .split(".")
        .pop();
      return (
        this.language[this.config.currentLanguage].LaunchTarget.remediation?.[
          key
        ] ?? diagnostic.code
      );
    },
    preflightRemediation(diagnostic) {
      const key = String(diagnostic.remediationKey ?? "")
        .split(".")
        .pop();
      return (
        this.language[this.config.currentLanguage].LaunchTarget.remediation?.[
          key
        ] ?? diagnostic.code
      );
    },
    runPreflight() {
      const hash = this.currentPreflightHash;
      const localResult = localPreflightResult(
        this.localPreflightDiagnostics(),
        hash,
      );
      if (
        !this.selectedCycle ||
        !this.selectedEnvironment ||
        !this.selectedTarget
      ) {
        this.preflightResult = localPreflightResult(
          [
            {
              area: "selection",
              blocking: true,
              code: "launch.preflight.selectionRequired",
              focusTarget: "selection",
              location: "selection",
              message:
                this.language[this.config.currentLanguage].LaunchPreflight
                  .selectionRequired,
              remediation:
                this.language[this.config.currentLanguage].LaunchPreflight
                  .selectionRequired,
              severity: "error",
            },
          ],
          hash,
        );
        return Promise.resolve(this.preflightResult);
      }
      this.preflightRunning = true;
      return Promise.resolve()
        .then(() =>
          apiClient.post(
            this.config.serviceBaseUrl +
              (this.config.url.launchPreflight ?? "admin/launch/preflight"),
            this.launchRequest.body,
            {
              headers: this.setHeaders(),
            },
          ),
        )
        .then((response) => {
          this.preflightResult = normalizePreflightResult(response.data, hash);
          if (localResult.diagnostics.length > 0) {
            this.preflightResult = normalizePreflightResult(
              {
                diagnostics: [
                  ...this.preflightResult.diagnostics,
                  ...localResult.diagnostics,
                ],
              },
              hash,
            );
          }
          return this.preflightResult;
        })
        .catch(() => {
          this.preflightResult = localResult;
          return this.preflightResult;
        })
        .finally(() => {
          this.preflightRunning = false;
        });
    },
    focusLaunchArea(area) {
      const selector = String(area).includes("environment")
        ? ".launch-asset-selector input"
        : ".launch-target input";
      this.$el.querySelector(selector)?.focus();
    },
    syncDraftRoute() {
      if (!this.$router?.replace) return;
      const nextQuery = buildLaunchSelectionQuery(this.$route?.query ?? {}, {
        cycleId: this.selectedCycleId,
        environmentId: this.selectedEnvironmentId,
      });
      nextQuery.targetId = this.selectedTargetId || undefined;
      nextQuery.concurrency =
        this.concurrency > 1 ? String(this.concurrency) : undefined;
      nextQuery.browser = this.targetOverrides.browser || undefined;
      nextQuery.device = this.targetOverrides.device || undefined;
      if (
        String(this.$route?.query?.cycleId ?? "") ===
          String(nextQuery.cycleId ?? "") &&
        String(this.$route?.query?.environmentId ?? "") ===
          String(nextQuery.environmentId ?? "") &&
        String(this.$route?.query?.targetId ?? "") ===
          String(nextQuery.targetId ?? "") &&
        String(this.$route?.query?.concurrency ?? "") ===
          String(nextQuery.concurrency ?? "") &&
        String(this.$route?.query?.browser ?? "") ===
          String(nextQuery.browser ?? "") &&
        String(this.$route?.query?.device ?? "") ===
          String(nextQuery.device ?? "")
      ) {
        return;
      }
      this.$router.replace({ query: nextQuery });
    },
    launchSelectedCycle() {
      if (!this.canOpenTargetSelection) return;
      const submission = createLaunchSubmission(
        this.launchRequest,
        this.launchSubmissionKey,
      );
      this.launchSubmissionKey = submission.idempotencyKey;
      this.launchSubmitting = true;
      this.launchError = null;
      this.launchStatus = "submitting";
      return apiClient
        .post(
          this.config.serviceBaseUrl + submission.endpoint,
          submission.body,
          { headers: { ...this.setHeaders(), ...submission.headers } },
        )
        .then((response) => this.handleLaunchSubmissionResponse(response))
        .catch((error) => {
          if (shouldReconcileLaunchOutcome(error)) {
            this.launchStatus = "unknown";
          } else {
            this.launchStatus = "rejected";
          }
          this.launchError = normalizeLaunchError(error);
          if (this.launchError.clearProtectedDraft) {
            this.targetOverrides = { browser: null, device: null };
            this.launchSubmissionKey = null;
          }
          if (this.launchError.requiresPreflight && this.preflightResult) {
            this.preflightResult = {
              ...this.preflightResult,
              configurationHash: "stale",
            };
          }
        })
        .finally(() => {
          this.launchSubmitting = false;
        });
    },
    handleLaunchSubmissionResponse(response) {
      const result = normalizeLaunchSubmissionResult(response);
      this.launchStatus = result.status;
      if (result.runId) {
        this.$router.push(
          canonicalExecutionRoute(getSelectedProjectId(), result.runId),
        );
      }
    },
    retryLaunch() {
      if (!this.launchError?.recoverable) return;
      return this.runPreflight().then(() => this.launchSelectedCycle());
    },
  },
};
</script>

<style scoped>
.launch-page {
  --launch-compact-font: 0.68rem;
  --launch-compact-label: 0.62rem;
  --launch-compact-radius: 0.9rem;
  display: grid;
  gap: 0.9rem;
  margin: 0 auto;
  max-width: 1280px;
  min-width: 0;
  width: 100%;
}

.launch-page,
.launch-page :deep(*) {
  font-size: var(--launch-compact-font);
  letter-spacing: 0.12em;
}

.launch-page__hero,
.launch-page__review {
  background:
    radial-gradient(circle at top left, rgb(255 108 27 / 24%), transparent 34%),
    linear-gradient(135deg, rgb(255 255 255 / 6%), transparent 48%),
    var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: var(--launch-compact-radius);
  display: flex;
  gap: 0.85rem;
  justify-content: space-between;
  padding: 0.9rem 1rem;
  box-shadow: 0 0.9rem 2.4rem rgb(0 0 0 / 20%);
}

.launch-page__hero {
  align-items: center;
}

.launch-page__hero p,
.launch-page__review p,
.launch-page__hero h1,
.launch-page__review h2,
.launch-page__hero span,
.launch-page__review span {
  margin: 0;
}

.launch-page__hero p,
.launch-page__review p,
.launch-page__review dt,
.launch-page__path-step strong {
  color: var(--id-color-text-muted);
  font-size: var(--launch-compact-label);
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.launch-page__hero h1 {
  color: var(--id-color-text);
  font-size: 1.35rem;
  line-height: 1;
  margin-top: 0.2rem;
}

.launch-page__hero span {
  color: var(--id-color-text-muted);
  display: block;
  line-height: 1.5;
  margin-top: 0.35rem;
  max-width: 52rem;
}

.launch-page__hero-actions {
  align-items: flex-end;
  display: grid;
  gap: 0.55rem;
  justify-items: end;
}

.launch-page__readiness {
  align-items: center;
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-pill);
  display: inline-flex;
  font-size: var(--launch-compact-label);
  font-weight: 900;
  gap: 0.4rem;
  letter-spacing: 0.14em;
  min-height: 1.85rem;
  padding: 0 0.75rem;
  text-transform: uppercase;
  white-space: nowrap;
}

.launch-page__readiness--ready {
  background: rgb(25 135 84 / 18%);
  border-color: rgb(25 135 84 / 42%);
  color: #9ef0c4;
}

.launch-page__readiness--busy {
  background: rgb(13 202 240 / 14%);
  border-color: rgb(13 202 240 / 36%);
  color: #a7ecff;
}

.launch-page__readiness--draft {
  background: rgb(255 193 7 / 13%);
  border-color: rgb(255 193 7 / 34%);
  color: #ffe29a;
}

.launch-page__path {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.launch-page__path-step {
  align-items: center;
  background: linear-gradient(180deg, rgb(255 255 255 / 5%), transparent),
    var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: var(--launch-compact-radius);
  display: flex;
  gap: 0.65rem;
  min-width: 0;
  padding: 0.7rem;
}

.launch-page__path-step--complete {
  border-color: rgb(255 108 27 / 52%);
  box-shadow: inset 0 0 0 1px rgb(255 108 27 / 16%);
}

.launch-page__path-index {
  align-items: center;
  background: rgb(255 108 27 / 14%);
  border: 1px solid rgb(255 108 27 / 32%);
  border-radius: 0.7rem;
  color: #ffd1b5;
  display: inline-flex;
  flex: 0 0 2rem;
  font-weight: 900;
  height: 2rem;
  justify-content: center;
}

.launch-page__path-step div {
  display: grid;
  gap: 0.15rem;
  min-width: 0;
}

.launch-page__path-step small {
  color: var(--id-color-text);
  font-size: 0.66rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.launch-page__workspace {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: minmax(0, 1.35fr) minmax(22rem, 0.65fr);
  min-width: 0;
}

.launch-page__selectors,
.launch-page__side-panel {
  display: grid;
  gap: 0.9rem;
  min-width: 0;
}

.launch-page__selectors {
  gap: 0.9rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.launch-page :deep(.launch-asset-selector),
.launch-page :deep(.launch-target),
.launch-page :deep(.launch-preflight) {
  background:
    linear-gradient(180deg, rgb(255 255 255 / 4%), transparent),
    var(--id-color-surface-raised);
  border-radius: var(--launch-compact-radius);
  gap: 0.75rem;
  padding: 0.85rem;
  box-shadow: 0 0.75rem 1.8rem rgb(0 0 0 / 16%);
}

.launch-page :deep(.launch-asset-selector__items) {
  gap: 0.45rem;
  max-height: min(18rem, 34vh);
}

.launch-page :deep(.launch-asset-selector__item),
.launch-page :deep(.launch-target__item),
.launch-page :deep(.launch-preflight__diagnostic) {
  border-radius: 0.75rem;
  gap: 0.35rem;
  padding: 0.65rem;
}

.launch-page :deep(.launch-asset-selector__header),
.launch-page :deep(.launch-target__header),
.launch-page :deep(.launch-preflight__header),
.launch-page :deep(.launch-review__header) {
  gap: 0.75rem;
}

.launch-page :deep(.launch-asset-selector__header h2),
.launch-page :deep(.launch-target__header h2),
.launch-page :deep(.launch-preflight__header h2),
.launch-page :deep(.launch-review__header h2) {
  font-size: 0.78rem;
  line-height: 1.2;
}

.launch-page :deep(.launch-asset-selector__header p),
.launch-page :deep(.launch-target__header p),
.launch-page :deep(.launch-preflight__header p),
.launch-page :deep(.launch-review__header span) {
  line-height: 1.45;
}

.launch-page :deep(.launch-asset-selector__search),
.launch-page :deep(.launch-target__concurrency),
.launch-page :deep(.launch-target__overrides label),
.launch-page :deep(.launch-review__command) {
  gap: 0.35rem;
}

.launch-page :deep(.launch-asset-selector__search input),
.launch-page :deep(.launch-target__concurrency input),
.launch-page :deep(.launch-target__overrides input),
.launch-page :deep(.launch-review__command textarea) {
  border-radius: 0.7rem;
  min-height: 2rem;
  padding: 0 0.7rem;
}

.launch-page :deep(.launch-review__command textarea) {
  min-height: 3.6rem;
  padding-block: 0.55rem;
}

.launch-page :deep(.launch-target__items),
.launch-page :deep(.launch-target__diagnostics),
.launch-page :deep(.launch-preflight__groups),
.launch-page :deep(.launch-review),
.launch-page :deep(.launch-review__grid) {
  gap: 0.55rem;
}

.launch-page :deep(.launch-asset-selector__item--active),
.launch-page :deep(.launch-target__item--active) {
  background:
    linear-gradient(90deg, rgb(255 108 27 / 18%), transparent 45%),
    var(--id-color-surface);
  border-color: rgb(255 108 27 / 68%);
  box-shadow:
    0 0 0 1px rgb(255 108 27 / 20%),
    0 1rem 2.2rem rgb(255 108 27 / 10%);
}

.launch-page :deep(.launch-asset-selector__name),
.launch-page :deep(.launch-target__name) {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.launch-page__review {
  align-items: flex-end;
  border-color: rgb(255 108 27 / 34%);
}

.launch-page__review dl {
  display: grid;
  gap: 0.65rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  min-width: min(100%, 32rem);
}

.launch-page__review dd {
  color: var(--id-color-text);
  font-weight: 700;
  margin: var(--id-space-1) 0 0;
}

.launch-page__review > button {
  border-radius: var(--id-radius-pill);
  box-shadow: 0 0.7rem 1.8rem rgb(25 135 84 / 16%);
  font-size: var(--launch-compact-label);
  font-weight: 900;
  letter-spacing: 0.12em;
  min-height: 2.25rem;
  padding-inline: 1rem;
  text-transform: uppercase;
  white-space: nowrap;
}

.launch-page__error {
  background: rgb(220 53 69 / 12%);
  border: 1px solid rgb(220 53 69 / 34%);
  border-radius: var(--id-radius-medium);
  color: #ffb8c1 !important;
  padding: 0.7rem;
}

@media (max-width: 64rem) {
  .launch-page__path,
  .launch-page__selectors,
  .launch-page__workspace,
  .launch-page__review dl {
    grid-template-columns: 1fr;
  }

  .launch-page__hero,
  .launch-page__review {
    align-items: stretch;
    flex-direction: column;
  }

  .launch-page__hero-actions {
    align-items: stretch;
    justify-items: stretch;
  }
}
</style>
