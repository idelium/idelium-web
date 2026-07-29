<template>
  <div class="costum testcycles-page">
    <section class="card testcycles-setup-card">
      <div class="card-header testcycles-tabs-header">
        <ul
          class="nav nav-tabs card-header-tabs testcycles-tabs"
          id="nav-tab"
          role="tablist"
        >
          <li class="nav-item" role="presentation">
            <button
              :class="[tabButtonClass('modify'), 'testcycles-tab']"
              id="nav-tabTitleModify-tab"
              type="button"
              role="tab"
              aria-controls="nav-tabTitleModify"
              :aria-selected="isActiveTab('modify')"
              ref="home"
              :disabled="isTestCycleModifyTabDisabled"
              v-on:click="
                openTab('modify');
                getTestCycles(1);
              "
            >
              {{ language[config.currentLanguage].TestCycles.tabTitleModify }}
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              :class="[tabButtonClass('new'), 'testcycles-tab']"
              id="nav-tabTitleNewTestCycle-tab"
              type="button"
              role="tab"
              ref="tabTitleNewTestCycle"
              aria-controls="nav-tabTitleNewTestCycle"
              :aria-selected="isActiveTab('new')"
              v-on:click="openTab('new')"
            >
              {{
                language[config.currentLanguage].TestCycles.tabTitleNewTestCycle
              }}
            </button>
          </li>
        </ul>
      </div>

      <div class="tab-content testcycles-tab-content" id="pills-tabContent">
        <div
          :class="tabPaneClass('modify')"
          id="nav-tabTitleModify"
          role="tabpanel"
          aria-labelledby="tabTitleModify-tab"
        >
          <div v-if="arrayTestCycles.length > 0" class="testcycles-form-grid">
            <div class="testcycles-field">
              <v-select
                label="name"
                :options="arrayTestCycles"
                v-model="testCycleSelected"
                class="costum"
              ></v-select>
            </div>
            <input
              class="form-control testcycles-field"
              v-if="testCycleSelected != null"
              :placeholder="
                language[config.currentLanguage].TestCycles
                  .placeholderDescriptionTestCycle
              "
              v-model="modifyDescriptionTestCycle"
              :disabled="testCycleSelected == null"
            />
            <button
              type="button"
              v-if="testCycleSelected != null"
              class="btn btn-success testcycles-primary-action"
              size="sm"
              :disabled="testCycleSelected == null"
              v-on:click="modifyTestCycle()"
            >
              {{
                language[config.currentLanguage].TestCycles.btnModifyTestCycle
              }}
            </button>
          </div>

          <div class="card testcycles-command-card" v-if="commandLine">
            <div class="testcycles-command-copy">
              <span class="testcycles-section-title">
                {{
                  language[config.currentLanguage].TestCycles.commandLineInfo
                }}
              </span>
              <button
                type="button"
                class="btn btn-link testcycles-copy-button"
                v-on:click="copyClipboard(commandLine)"
                :title="language[config.currentLanguage].Actions.copy"
              >
                <font-awesome-icon
                  icon="copy"
                  class="idelium-action-icon--copy"
                  alt="copy clipboard"
                />
              </button>
            </div>
            <code class="commandLine">{{ commandLine }}</code>
          </div>
        </div>

        <div
          :class="tabPaneClass('new')"
          id="nav-tabTitleNewTestCycle"
          role="tabpanel"
          aria-labelledby="tabTitleNewTestCycle-tab"
        >
          <div class="testcycles-form-grid">
            <label class="testcycles-field-group">
              <span>{{ language[config.currentLanguage].TestCycles.nameLabel }}</span>
              <input
                class="form-control testcycles-field"
                :placeholder="
                  language[config.currentLanguage].TestCycles
                    .placeholderNameTestCycle
                "
                v-model="newNameTestCycle"
                :disabled="disableNameTestCycle"
              />
            </label>
            <label class="testcycles-field-group">
              <span>
                {{ language[config.currentLanguage].TestCycles.descriptionLabel }}
              </span>
              <input
                class="form-control testcycles-field"
                :placeholder="
                  language[config.currentLanguage].TestCycles
                    .placeholderDescriptionTestCycle
                "
                v-model="newDescriptionTestCycle"
                :disabled="disableTestCycleDescription"
              />
            </label>
            <button
              type="button"
              class="btn btn-success testcycles-primary-action"
              size="sm"
              :disabled="disableBtnCreateTestCycle"
              v-on:click="saveTestCycle()"
            >
              {{
                language[config.currentLanguage].TestCycles.btnCreateTestCycle
              }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section
      class="testcycles-guidance"
      v-if="isActiveTab('new')"
      aria-labelledby="cycle-guidance-title"
    >
      <div class="testcycles-guidance__intro">
        <p class="testcycles-eyebrow">
          {{ language[config.currentLanguage].TestCycles.builderEyebrow }}
        </p>
        <h2 id="cycle-guidance-title">
          {{ language[config.currentLanguage].TestCycles.builderTitle }}
        </h2>
        <p>
          {{ language[config.currentLanguage].TestCycles.builderDescription }}
        </p>
      </div>
      <ol class="testcycles-guidance__steps">
        <li
          v-for="step in cycleCreationSteps"
          v-bind:key="step.key"
          :class="{ complete: step.complete }"
        >
          <span>{{ step.order }}</span>
          <div>
            <strong>{{ step.title }}</strong>
            <p>{{ step.description }}</p>
          </div>
        </li>
      </ol>
      <dl class="testcycles-guidance__summary">
        <div>
          <dt>{{ language[config.currentLanguage].TestCycles.availableTests }}</dt>
          <dd>{{ builderAvailableTests.length }}</dd>
        </div>
        <div>
          <dt>{{ language[config.currentLanguage].TestCycles.selectedTests }}</dt>
          <dd>{{ arrayTestsSelectedDragged.length }}</dd>
        </div>
        <div>
          <dt>{{ language[config.currentLanguage].TestCycles.readyStatus }}</dt>
          <dd>{{ cycleCreationStatus }}</dd>
        </div>
      </dl>
    </section>

    <section
      class="testcycles-composition"
      aria-labelledby="cycle-composition-title"
    >
      <header>
        <h2 id="cycle-composition-title">
          {{ language[config.currentLanguage].TestCycles.compositionTitle }}
        </h2>
        <p>
          {{
            language[config.currentLanguage].TestCycles.compositionDescription
          }}
        </p>
      </header>
      <SequenceBuilder
        :accessible-label="sequenceBuilderCopy.accessibleLabel"
        :available-items="builderAvailableTests"
        :copy="sequenceBuilderCopy"
        :picker-filters="testCyclePickerFilters"
        :picker-meta="testCyclePickerMeta"
        :picker-query="testCyclePickerQuery"
        :sequence="testCycleSequenceItems"
        :validation="testCycleValidation"
        v-on:picker-query-change="handleTestCyclePickerQuery"
        v-on:update:sequence="updateTestCycleSequence"
      />
    </section>
  </div>
</template>
<!--style src="vue-multiselect/dist/vue-multiselect.min.css"></style-->
<style scoped>
.testcycles-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin: 0 auto;
  max-width: 1280px;
  width: 100%;
}

.testcycles-setup-card,
.testcycles-panel {
  overflow: hidden;
}

.testcycles-tabs-header {
  background: rgba(255, 255, 255, 0.035);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.95rem 1rem 0;
}

.testcycles-tabs {
  border-bottom: 0;
  gap: 0.25rem;
}

.testcycles-tab {
  min-width: 11rem;
}

.testcycles-tab-content {
  padding: 1rem;
}

.testcycles-form-grid {
  align-items: center;
  display: grid;
  gap: 0.8rem;
  grid-template-columns: minmax(16rem, 1fr) minmax(16rem, 1fr) auto;
}

.testcycles-field-group {
  display: grid;
  gap: 0.45rem;
  margin: 0;
}

.testcycles-field-group span,
.testcycles-eyebrow {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.testcycles-field {
  margin: 0;
  text-transform: uppercase;
  width: 100%;
}

.testcycles-primary-action {
  justify-self: end;
  margin-top: 1.55rem;
  min-width: 9rem;
}

.testcycles-command-card {
  background: rgba(10, 12, 18, 0.52);
  border-radius: 0.9rem;
  box-shadow: none;
  margin-top: 1rem;
  padding: 1rem;
}

.testcycles-guidance {
  align-items: stretch;
  background:
    linear-gradient(135deg, rgba(255, 122, 24, 0.14), transparent 34%),
    rgba(38, 42, 54, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.2rem;
  box-shadow: 0 1.2rem 3rem rgba(0, 0, 0, 0.18);
  display: grid;
  gap: 1.15rem;
  grid-template-columns: minmax(0, 1fr) minmax(20rem, 1.2fr) minmax(16rem, 0.75fr);
  padding: 1.15rem;
}

.testcycles-guidance__intro h2,
.testcycles-guidance__intro p,
.testcycles-guidance__steps p {
  margin: 0;
}

.testcycles-guidance__intro h2 {
  color: #ffffff;
  font-size: clamp(1.35rem, 2.2vw, 2rem);
  margin: 0.2rem 0 0.45rem;
}

.testcycles-guidance__intro p,
.testcycles-guidance__steps p {
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.55;
}

.testcycles-guidance__steps {
  display: grid;
  gap: 0.7rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.testcycles-guidance__steps li {
  align-items: flex-start;
  background: rgba(10, 13, 24, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.95rem;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: auto minmax(0, 1fr);
  padding: 0.8rem;
}

.testcycles-guidance__steps li.complete {
  border-color: rgba(32, 201, 151, 0.38);
}

.testcycles-guidance__steps li > span {
  align-items: center;
  background: rgba(255, 122, 24, 0.18);
  border: 1px solid rgba(255, 122, 24, 0.34);
  border-radius: 999px;
  color: #ffd1b2;
  display: inline-flex;
  font-weight: 900;
  height: 2rem;
  justify-content: center;
  width: 2rem;
}

.testcycles-guidance__steps li.complete > span {
  background: rgba(32, 201, 151, 0.18);
  border-color: rgba(32, 201, 151, 0.4);
  color: #baf7df;
}

.testcycles-guidance__steps strong {
  color: #ffffff;
  display: block;
  font-size: 0.86rem;
  letter-spacing: 0.12em;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}

.testcycles-guidance__summary {
  display: grid;
  gap: 0.75rem;
  margin: 0;
}

.testcycles-guidance__summary div {
  background: rgba(10, 13, 24, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.95rem;
  padding: 0.9rem;
}

.testcycles-guidance__summary dt {
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.testcycles-guidance__summary dd {
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 900;
  margin: 0.2rem 0 0;
}

.testcycles-command-copy,
.testcycles-panel-header,
.testcycles-test-item {
  align-items: center;
  display: flex;
}

.testcycles-command-copy,
.testcycles-panel-header {
  justify-content: space-between;
}

.testcycles-copy-button {
  color: #b7f7df !important;
  min-width: auto;
  padding: 0.2rem 0.4rem !important;
}

.testcycles-section-title {
  color: #f8fafc;
  font-size: 0.72rem !important;
  font-weight: 800;
  letter-spacing: 0.14rem;
  text-transform: uppercase;
}

.testcycles-workspace {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: minmax(0, 1fr) minmax(22rem, 0.8fr);
}

.testcycles-composition {
  display: grid;
  gap: var(--id-space-4);
}

.testcycles-composition > header h2,
.testcycles-composition > header p {
  margin: 0;
}

.testcycles-panel {
  display: flex;
  flex-direction: column;
  min-height: 62vh;
  padding: 1rem;
}

.testcycles-panel-header {
  margin-bottom: 0.85rem;
}

.testcycles-counter {
  align-items: center;
  background: rgba(255, 122, 24, 0.16);
  border: 1px solid rgba(255, 122, 24, 0.32);
  border-radius: 999px;
  color: #ffd7bd;
  display: inline-flex;
  font-size: 0.72rem !important;
  font-weight: 800;
  justify-content: center;
  min-width: 2rem;
  padding: 0.18rem 0.55rem;
}

.testcycles-search {
  margin-bottom: 0.85rem;
}

.testcycles-list {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 0.55rem;
  max-height: 62vh;
  min-height: 18rem;
  overflow-y: auto;
  padding-right: 0.2rem;
}

.testcycles-selected-list {
  background:
    linear-gradient(180deg, rgba(255, 122, 24, 0.06), transparent),
    rgba(255, 255, 255, 0.025);
  border: 1px dashed rgba(255, 122, 24, 0.45);
  border-radius: 1rem;
  padding: 0.75rem;
}

.testcycles-selected-list.empty {
  min-height: 62vh;
}

.testcycles-test-item {
  background: rgba(255, 255, 255, 0.045) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 0.85rem !important;
  color: #f4f4f5 !important;
  cursor: grab;
  font-weight: 700;
  justify-content: space-between;
  padding: 0.85rem 0.95rem !important;
  text-transform: uppercase;
}

.testcycles-test-item.selected {
  cursor: move;
}

.testcycles-remove {
  align-items: center;
  background: rgba(220, 53, 69, 0.14);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 999px;
  color: #ffb8c1;
  cursor: pointer;
  display: inline-flex;
  height: 1.65rem;
  justify-content: center;
  width: 1.65rem;
}
.commandLine {
  color: #f8fafc;
  display: block;
  font-family:
    "SFMono-Regular", Consolas, "Liberation Mono", monospace !important;
  font-size: 12px !important;
  line-height: 1.7;
  margin-top: 0.75rem;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

@media only screen and (max-width: 980px) {
  .testcycles-form-grid,
  .testcycles-workspace,
  .testcycles-guidance {
    grid-template-columns: 1fr;
  }

  .testcycles-primary-action {
    justify-self: stretch;
    margin-top: 0;
  }
}
</style>

<script>
import apiClient from "@/services/apiClient";
import { getSelectedProjectId } from "@/stores/session";
import { buildTestCyclePayload } from "@/domain/workflowPayloads";
import {
  loadPersistedSequence,
  normalizeSequenceItem,
  validateSequenceComposition,
} from "@/domain/sequenceBuilder";
import SequenceBuilder from "@/components/sequence/SequenceBuilder.vue";
import english from "@/languages/english";
import copy from "copy-to-clipboard";
import { routableTabs } from "@/shared/routableTabs";

export default {
  name: "TestCyclesComponent",
  components: {
    SequenceBuilder,
  },
  mixins: [routableTabs("modify", ["modify", "new"])],
  data() {
    return {
      delay: 1000,
      arrayTests: [],
      arrayTestsSelectedDragged: [],
      listOriginalTests: [],
      arrayTestCycles: [],
      testCyclesLoaded: false,
      testCycleSelected: null,
      testCyclesGridQuery: {
        page: 1,
        pageSize: 25,
        sort: "id",
        direction: "asc",
      },
      testCyclesGridMeta: {
        page: 1,
        pageSize: 25,
        total: null,
        lastPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      testFilter: "",
      testCyclePickerQuery: {
        page: 1,
        search: "",
        filters: {},
      },
      disableNameTestCycle: true,
      disableTestCycleDescription: true,
      disableBtnCreateTestCycle: true,
      newNameTestCycle: "",
      newDescriptionTestCycle: "",
      modifyDescriptionTestCycle: "",
      commandLine: "",
    };
  },
  created() {
    this.getTests(1);
    if (this.commandLine != "") this.setCommandLine();
    this.emitter.on("refreshTestCycle", (msg) => {
      this.commandLine = "";
      this.testCycleSelected = null;
      if (msg == true) this.getTests(2);
      else this.$forceUpdate();
    });
  },
  watch: {
    testFilter() {
      // Do something with search nameIssue after it debounced
      let filter = this.testFilter;
      this.searchTextTests(filter);
    },
    arrayTestsSelectedDragged() {
      this.disableNameTestCycle = this.arrayTestsSelectedDragged.length == 0;
    },
    newNameTestCycle() {
      this.disableTestCycleDescription = this.newNameTestCycle.length == 0;
    },
    newDescriptionTestCycle() {
      this.disableBtnCreateTestCycle = this.newDescriptionTestCycle.length == 0;
    },
    testCycleSelected() {
      this.getTestCycle();
    },
  },
  computed: {
    isTestCycleModifyTabDisabled() {
      return this.testCyclesLoaded && this.arrayTestCycles.length === 0;
    },
    sequenceBuilderCopy() {
      const dictionary = this.language[this.config.currentLanguage] ?? english;
      const sequenceCopy =
        dictionary.SequenceBuilder ?? english.SequenceBuilder;
      return {
        ...sequenceCopy,
        picker: {
          ...sequenceCopy.picker,
          states: dictionary.DataTable?.states ?? english.DataTable.states,
        },
      };
    },
    builderAvailableTests() {
      return this.arrayTests.map((test) => this.toBuilderTest(test));
    },
    testCycleSequenceState() {
      return loadPersistedSequence(this.arrayTestsSelectedDragged, {
        availableItems: this.listOriginalTests.map((test) =>
          this.toBuilderTest(test),
        ),
        entityType: "test",
      });
    },
    testCycleSequenceItems() {
      return this.testCycleSequenceState.items.map((item) => ({
        ...item.persisted,
        disabledReason: item.disabledReason,
        identity: item.identity,
        metadata: item.metadata,
        name: item.name,
        persisted: item.persisted,
        status: item.status,
        version: item.version,
      }));
    },
    testCycleValidation() {
      return validateSequenceComposition(this.testCycleSequenceState, {
        minimumItems: 1,
      });
    },
    testCyclePickerMeta() {
      return {
        page: 1,
        lastPage: 1,
        total: this.builderAvailableTests.length,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    },
    testCyclePickerFilters() {
      const runtimes = [
        ...new Set(
          this.listOriginalTests
            .map((test) => test.runtime ?? test.type)
            .filter(Boolean),
        ),
      ];
      return runtimes.length === 0
        ? []
        : [
            {
              key: "runtime",
              label: this.sequenceBuilderCopy.metadata.runtime,
              options: runtimes.map((runtime) => ({
                label: runtime,
                value: runtime,
              })),
            },
          ];
    },
    cycleCreationSteps() {
      const copy = this.language[this.config.currentLanguage].TestCycles;
      return [
        {
          key: "select",
          order: "1",
          title: copy.builderStepSelectTitle,
          description: copy.builderStepSelectDescription,
          complete: this.arrayTestsSelectedDragged.length > 0,
        },
        {
          key: "order",
          order: "2",
          title: copy.builderStepOrderTitle,
          description: copy.builderStepOrderDescription,
          complete:
            this.testCycleSequenceItems.length > 0 &&
            this.testCycleSequenceItems.every(
              (item) => item.status !== "missing" && !item.disabledReason,
            ),
        },
        {
          key: "describe",
          order: "3",
          title: copy.builderStepDescribeTitle,
          description: copy.builderStepDescribeDescription,
          complete:
            this.newNameTestCycle.trim() !== "" &&
            this.newDescriptionTestCycle.trim() !== "",
        },
      ];
    },
    cycleCreationStatus() {
      const copy = this.language[this.config.currentLanguage].TestCycles;
      return this.disableBtnCreateTestCycle
        ? copy.readyStatusIncomplete
        : copy.readyStatusReady;
    },
  },
  methods: {
    toBuilderTest(test) {
      const persisted = JSON.parse(JSON.stringify(test));
      const normalized = normalizeSequenceItem(
        {
          ...test,
          metadata: {
            runtime: test.runtime ?? test.type ?? "",
            tags: Array.isArray(test.tags) ? test.tags.join(", ") : "",
            version: test.version ?? "",
            status: test.status ?? "active",
          },
        },
        { entityType: "test" },
      );
      return { ...normalized, persisted };
    },
    updateTestCycleSequence(nextSequence) {
      this.arrayTestsSelectedDragged = nextSequence.map((item) =>
        JSON.parse(JSON.stringify(item.persisted)),
      );
      this.copyArray();
    },
    handleTestCyclePickerQuery(query) {
      this.testCyclePickerQuery = query;
      this.testFilter = query.search ?? "";
      this.searchTextTests(this.testFilter);
    },
    copyClipboard(text) {
      copy(text);
      this.$wkToast(
        this.language[this.config.currentLanguage].TestCycles.commandLineCopy,
      );
    },
    searchTextTests(filter) {
      const search = String(filter ?? "")
        .trim()
        .toLowerCase();
      const runtime = this.testCyclePickerQuery.filters?.runtime;
      this.arrayTests = this.listOriginalTests.filter((test) => {
        const matchesSearch =
          search === "" || String(test.name).toLowerCase().includes(search);
        const matchesRuntime =
          !runtime || (test.runtime ?? test.type) === runtime;
        return matchesSearch && matchesRuntime;
      });
    },
    normalizeGridResponse(responseData, fallbackMeta) {
      if (Array.isArray(responseData)) {
        return {
          rows: responseData,
          meta: {
            ...fallbackMeta,
            total: null,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }

      const meta = responseData?.meta || {};
      return {
        rows: Array.isArray(responseData?.data) ? responseData.data : [],
        meta: {
          page: Number(meta.page) || fallbackMeta.page,
          pageSize: Number(meta.pageSize) || fallbackMeta.pageSize,
          total: Number.isFinite(Number(meta.total)) ? Number(meta.total) : 0,
          lastPage: Math.max(Number(meta.lastPage) || 1, 1),
          hasNextPage: Boolean(meta.hasNextPage),
          hasPreviousPage: Boolean(meta.hasPreviousPage),
        },
      };
    },
    getTests(from) {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.tests +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.arrayTests = this.listOriginalTests = response.data;
          this.getTestCycles(2);
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    getTestCycles(from) {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.testcycles +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
            params: this.testCyclesGridQuery,
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          const result = this.normalizeGridResponse(
            response.data,
            this.testCyclesGridMeta,
          );
          this.testCyclesGridMeta = result.meta;
          this.arrayTestCycles = [];
          for (let i = 0; i < result.rows.length; i++) {
            let objectTc = result.rows[i];
            objectTc.name = objectTc.name + "(" + objectTc.id + ")";
            this.arrayTestCycles.push(objectTc);
          }
          this.testCyclesLoaded = true;
          this.redirectEmptyTestCycles();
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    redirectEmptyTestCycles() {
      if (this.isTestCycleModifyTabDisabled && this.isActiveTab("modify")) {
        this.openTab("new");
      }
    },
    setCommandLine() {
      this.commandLine =
        "idelium --idCycle=" +
        this.testCycleSelected.id +
        " --idProject=" +
        getSelectedProjectId() +
        " --environment=<environment name>";
    },
    getTestCycle() {
      if (this.testCycleSelected == null) {
        this.modifyDescriptionTestCycle = "";
        this.arrayTestsSelectedDragged = [];
        return false;
      }
      this.setCommandLine();
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.testcycles +
            "/" +
            getSelectedProjectId() +
            "/" +
            this.testCycleSelected.id,
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.arrayTestsSelectedDragged = JSON.parse(response.data.config);
          this.modifyDescriptionTestCycle = response.data.description;
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    saveTestCycle() {
      this.emitter.emit("showLoader", true);
      apiClient
        .post(
          this.config.serviceBaseUrl + this.config.url.testcycles,
          buildTestCyclePayload({
            name: this.newNameTestCycle,
            description: this.newDescriptionTestCycle,
            tests: this.arrayTestsSelectedDragged,
            projectId: getSelectedProjectId(),
          }),
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.listPlugins = response.data;
          this.arrayTests = this.listOriginalTests;
          this.arrayTestsSelectedDragged = [];
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    modifyTestCycle() {
      this.emitter.emit("showLoader", true);
      apiClient
        .put(
          this.config.serviceBaseUrl +
            this.config.url.testcycles +
            "/" +
            getSelectedProjectId() +
            "/" +
            this.testCycleSelected.id,
          {
            config: JSON.stringify(this.arrayTestsSelectedDragged),
            description: this.modifyDescriptionTestCycle,
          },
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.listPlugins = response.data;
          this.arrayTests = this.listOriginalTests;
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    log: function () {
      this.copyArray();
      this.disableNameTestCycle = this.arrayTestsSelectedDragged.length == 0;
    },
    deleteItem(index) {
      this.arrayTestsSelectedDragged.splice(index, 1);
      this.copyArray();
      this.disableNameTestCycle = this.arrayTestsSelectedDragged.length == 0;
    },
    copyArray() {
      this.arrayTestsSelected = [];
      for (let i = 0; i < this.arrayTestsSelectedDragged.length; i++) {
        this.arrayTestsSelected.push(this.arrayTestsSelectedDragged[i].name);
      }
    },
  },
};
</script>
