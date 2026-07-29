<template>
  <main class="launch-page" aria-labelledby="launch-page-title">
    <section class="launch-page__hero">
      <div>
        <p>{{ launcherCopy.pageEyebrow }}</p>
        <h1 id="launch-page-title">{{ launcherCopy.pageTitle }}</h1>
        <span>{{ launcherCopy.pageDescription }}</span>
      </div>
      <button
        class="btn btn-outline-light btn-sm"
        type="button"
        v-on:click="refreshLaunchAssets"
      >
        <font-awesome-icon icon="rotate" aria-hidden="true" />
        {{ launcherCopy.refresh }}
      </button>
    </section>

    <section class="launch-page__grid">
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
    </section>

    <section class="launch-page__review" aria-live="polite">
      <div>
        <p>{{ launcherCopy.reviewEyebrow }}</p>
        <h2>{{ launcherCopy.reviewTitle }}</h2>
        <span>{{ launcherCopy.reviewDescription }}</span>
      </div>
      <dl>
        <div>
          <dt>{{ launcherCopy.testcycle }}</dt>
          <dd>{{ selectedCycle?.name || launcherCopy.notSelected }}</dd>
        </div>
        <div>
          <dt>{{ launcherCopy.environment }}</dt>
          <dd>{{ selectedEnvironment?.name || launcherCopy.notSelected }}</dd>
        </div>
      </dl>
      <button
        class="btn btn-success"
        type="button"
        :disabled="!canOpenTargetSelection"
        :title="language[config.currentLanguage].Actions.launch"
        v-on:click="launchSelectedCycle"
      >
        <font-awesome-icon
          icon="rocket"
          class="idelium-action-icon idelium-action-icon--launch"
          aria-hidden="true"
        />
        {{ launcherCopy.launchtest }}
      </button>
    </section>

    <platformLauncher ref="platformLauncher" />
  </main>
</template>

<script>
import LaunchAssetSelector from "@/components/launch/LaunchAssetSelector.vue";
import {
  buildLaunchAssetQuery,
  buildLaunchSelectionQuery,
  isLaunchSelectionCompatible,
  launchSelectionFromRoute,
  normalizeLaunchAssetRows,
} from "@/domain/launchSelection";
import apiClient from "@/services/apiClient";
import { getSelectedProjectId } from "@/stores/session";

import platformLauncher from "./platformlauncher/modalListPlatform.vue";

export default {
  name: "TestLauncherComponent",
  components: {
    LaunchAssetSelector,
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
      listEnvironments: [],
      selectedCycleId: routeSelection.cycleId,
      selectedEnvironmentId: routeSelection.environmentId,
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
    canOpenTargetSelection() {
      return (
        this.selectedCycle &&
        this.selectedEnvironment &&
        !this.selectedCycle.disabledReason &&
        !this.selectedEnvironment.disabledReason
      );
    },
  },
  created() {
    this.getTestCycles();
    this.emitter.on("refreshTestLauncher", () => {
      this.refreshLaunchAssets();
    });
  },
  methods: {
    refreshLaunchAssets() {
      this.getTestCycles();
      this.getEnvironments();
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
          this.syncDraftRoute();
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
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
      this.syncDraftRoute();
    },
    syncDraftRoute() {
      if (!this.$router?.replace) return;
      const nextQuery = buildLaunchSelectionQuery(this.$route?.query ?? {}, {
        cycleId: this.selectedCycleId,
        environmentId: this.selectedEnvironmentId,
      });
      if (
        String(this.$route?.query?.cycleId ?? "") ===
          String(nextQuery.cycleId ?? "") &&
        String(this.$route?.query?.environmentId ?? "") ===
          String(nextQuery.environmentId ?? "")
      ) {
        return;
      }
      this.$router.replace({ query: nextQuery });
    },
    launchSelectedCycle() {
      if (!this.canOpenTargetSelection) return;
      this.$refs.platformLauncher.showModal(
        this.selectedCycle.id,
        this.selectedEnvironment.code ?? this.selectedEnvironment.id,
      );
    },
  },
};
</script>

<style scoped>
.launch-page {
  display: grid;
  gap: var(--id-space-5);
  width: 100%;
}

.launch-page__hero,
.launch-page__review {
  background:
    linear-gradient(135deg, rgb(255 108 27 / 18%), transparent 38%),
    var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  display: flex;
  gap: var(--id-space-4);
  justify-content: space-between;
  padding: var(--id-space-5);
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
.launch-page__review dt {
  color: var(--id-color-text-muted);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.launch-page__grid {
  display: grid;
  gap: var(--id-space-4);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.launch-page__review {
  align-items: flex-end;
}

.launch-page__review dl {
  display: grid;
  gap: var(--id-space-3);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  min-width: min(100%, 32rem);
}

.launch-page__review dd {
  color: var(--id-color-text);
  font-weight: 700;
  margin: var(--id-space-1) 0 0;
}

@media (max-width: 64rem) {
  .launch-page__grid,
  .launch-page__review dl {
    grid-template-columns: 1fr;
  }

  .launch-page__hero,
  .launch-page__review {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
