<template>
  <div class="costum tests-page">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="nav nav-tabs" id="nav-tab" role="tablist">
            <button
              :class="tabButtonClass('modify')"
              id="nav-tabTitleModify-tab"
              type="button"
              role="tab"
              aria-controls="nav-tabTitleModify"
              :aria-selected="isActiveTab('modify')"
              ref="home"
              :disabled="isModifyTabDisabled"
              v-on:click="openTab('modify')"
            >
              {{ language[config.currentLanguage].Tests.tabTitleModify }}
            </button>
            <button
              :class="tabButtonClass('new')"
              id="nav-tabTitleNewTest-tab"
              type="button"
              role="tab"
              ref="tabTitleNewTest"
              aria-controls="nav-tabTitleNewTest"
              :aria-selected="isActiveTab('new')"
              v-on:click="openTab('new')"
            >
              {{ language[config.currentLanguage].Tests.tabTitleNewTest }}
            </button>
            <button
              :class="tabButtonClass('import')"
              id="nav-tabTitleImportTest-tab"
              type="button"
              role="tab"
              ref="tabTitleImportTest"
              aria-controls="nav-tabTitleImportTest"
              :aria-selected="isActiveTab('import')"
              v-on:click="openTab('import')"
            >
              {{ language[config.currentLanguage].Tests.tabTitleImportTest }}
            </button>
          </div>
          <div class="tab-content" id="pills-tabContent">
            <div
              :class="tabPaneClass('modify')"
              id="nav-tabTitleModify"
              role="tabpanel"
              aria-labelledby="tabTitleModify-tab"
            >
              <!-- start tabTitleModify tab -->
              <div v-if="arrayTests.length > 0">
                <v-select
                  label="name"
                  :options="arrayTests"
                  v-model="testSelected"
                  class="costum formTest"
                  style="min-width: 98%"
                ></v-select>
                <input
                  class="form-control formTest"
                  v-if="testSelected != null"
                  :placeholder="
                    language[config.currentLanguage].Tests
                      .placeholderDescriptionTest
                  "
                  v-model="modifyDescriptionTest"
                  :disabled="testSelected == null"
                />
                <button
                  type="button"
                  v-if="testSelected != null"
                  class="btn btn-success"
                  size="sm"
                  style="float: right"
                  :disabled="testSelected == null"
                  v-on:click="modifyTest()"
                >
                  {{ language[config.currentLanguage].Tests.btnModifyTest }}
                </button>
                <br />
              </div>
              <!-- end tabTitleModify tab -->
            </div>
            <div
              :class="tabPaneClass('new')"
              id="nav-tabTitleNewTest"
              role="tabpanel"
              aria-labelledby="tabTitleNewTest-tab"
            >
              <!-- start tabTitleModify tab -->
              <input
                class="form-control formTest"
                :placeholder="
                  language[config.currentLanguage].Tests.placeholderNameTest
                "
                v-model="newNameTest"
                :disabled="disableNameTest"
              />
              <input
                class="form-control formTest"
                :placeholder="
                  language[config.currentLanguage].Tests
                    .placeholderDescriptionTest
                "
                v-model="newDescriptionTest"
                :disabled="disableTestDescription"
              />
              <button
                type="button"
                class="btn btn-success btn-sm"
                style="float: right"
                :disabled="disableBtnCreateTest"
                v-on:click="saveTest()"
              >
                {{ language[config.currentLanguage].Tests.btnCreateTest }}
              </button>
              <!-- end tabTitleModify tab -->
            </div>
            <div
              :class="tabPaneClass('import')"
              id="nav-tabTitleImportTest"
              role="tabpanel"
              aria-labelledby="tabTitleImportTest-tab"
            >
              <!-- start tabTitleModify tab -->
              <importSelenium ref="selenium" v-on:importTest="importTest" />
              <!-- end tabTitleModify tab -->
            </div>
          </div>
        </div>
        <section
          v-if="tabOpen != 2"
          class="tests-composition"
          aria-labelledby="test-composition-title"
        >
          <header>
            <h2 id="test-composition-title">
              {{ language[config.currentLanguage].Tests.compositionTitle }}
            </h2>
            <p>
              {{
                language[config.currentLanguage].Tests.compositionDescription
              }}
            </p>
          </header>
          <SequenceBuilder
            :accessible-label="sequenceBuilderCopy.accessibleLabel"
            :available-items="builderAvailableSteps"
            :copy="sequenceBuilderCopy"
            :picker-filters="testStepPickerFilters"
            :picker-meta="testStepPickerMeta"
            :picker-query="testStepPickerQuery"
            :sequence="testStepSequenceItems"
            :validation="testStepValidation"
            v-on:picker-query-change="handleStepPickerQuery"
            v-on:update:sequence="updateTestStepSequence"
          />
        </section>
        <div class="row tests-import-workspace" v-if="tabOpen == 2">
          <div class="col-sm-8 text-truncate">
            <div class="tests-import-list-wrapper">
              <ol class="list-group tests-import-review">
                <li
                  v-for="(element, index) in arrayStepsImported"
                  v-bind:key="arrayImportedStepKeys[index]"
                  class="tests-import-review__item"
                >
                  <div style="margin-right: 10px">
                    <div
                      style="text-align: center; width: 100%"
                      v-if="index > 0"
                    >
                      <span>
                        <font-awesome-icon
                          icon="arrow-circle-down"
                          style="
                            font-size: 25px;
                            margin-top: 5px;
                            margin-bottom: 5px;
                          "
                      /></span>
                    </div>

                    <div
                      class="list-group-item"
                      style="
                        cursor: pointer;
                        border-radius: 25px;
                        padding: 20px;
                        text-align: center !important;
                      "
                    >
                      <span
                        style="text-transform: uppercase"
                        v-on:click="editImportedItem(index)"
                        v-if="arrayEditImportedSteps[index] == false"
                        >{{ element.name }},,,</span
                      >
                      <span
                        style="text-transform: uppercase"
                        v-on:click="editImportedItem(index)"
                        v-if="
                          arrayEditImportedSteps[index] == false &&
                          element.steps[0].findBy
                        "
                        ><br />({{ element.steps[0].findBy }})</span
                      >
                      <input
                        class="form-control formTest"
                        v-if="arrayEditImportedSteps[index] == true"
                        v-on:keyup.enter="endEditImportedItem(index)"
                        v-model="arrayStepsImported[index].name"
                        style="width: 80%"
                      />
                      <select
                        v-if="
                          arrayEditImportedSteps[index] == true &&
                          seleniumImport[index].targets.length > 0
                        "
                        @change="changeTarget(index, $event)"
                        v-model="targetSelected"
                        class="form-control"
                        style="width: 80%; margin-left: 10px"
                      >
                        <option
                          v-for="(target, index2) in seleniumImport[index]
                            .targets"
                          :key="index2"
                          :value="target[0]"
                        >
                          {{ target[0] }}
                        </option>
                      </select>
                      <button
                        type="button"
                        class="tests-icon-action"
                        v-on:click="moveImportedItem(index, index - 1)"
                        :disabled="index === 0"
                        :title="
                          language[config.currentLanguage].Tests.moveImportedUp
                        "
                      >
                        {{ language[config.currentLanguage].Tests.moveUp }}
                      </button>
                      <button
                        type="button"
                        class="tests-icon-action"
                        v-on:click="moveImportedItem(index, index + 1)"
                        :disabled="index === arrayStepsImported.length - 1"
                        :title="
                          language[config.currentLanguage].Tests
                            .moveImportedDown
                        "
                      >
                        {{ language[config.currentLanguage].Tests.moveDown }}
                      </button>
                      <button
                        type="button"
                        class="tests-icon-action"
                        v-on:click="editImportedItem(index)"
                        :title="
                          language[config.currentLanguage].Tests.editImported
                        "
                      >
                        {{ language[config.currentLanguage].Tests.edit }}
                      </button>
                      <button
                        type="button"
                        class="tests-icon-action"
                        v-on:click="deleteItemImported(index)"
                        :title="language[config.currentLanguage].Actions.remove"
                      >
                        <font-awesome-icon
                          icon="times-circle"
                          class="deleteIcon iconClass idelium-action-icon--remove"
                        />
                      </button>
                    </div>
                  </div>
                </li>
              </ol>
            </div>
          </div>
          <div class="col-sm-3">
            <button
              type="button"
              class="btn btn-success"
              v-if="arrayStepsImported.length != 0"
              size="sm"
              style="float: right"
              v-on:click="saveImportTest()"
            >
              {{ language[config.currentLanguage].Tests.btnImportTest }}
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              v-if="arrayStepsImported.length != 0"
              style="float: right; color: black !important; margin-right: 5px"
              v-on:click="cancelUpload()"
            >
              {{ language[config.currentLanguage].Tests.btnCancel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.tests-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 76px - 3rem);
  height: calc(100dvh - 76px - 3rem);
  max-width: 100%;
  min-height: 0;
  overflow: hidden;
  width: 100%;
}

.tests-page > .row,
.tests-page > .row > .col-12 {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
}

.tests-page .card {
  flex: 0 0 auto;
}

.formTest {
  margin: 10px;
  width: 98%;
  text-transform: uppercase;
}

.tests-workspace,
.tests-import-workspace {
  flex: 1 1 auto;
  margin-top: 1rem;
  min-height: 0;
  overflow: hidden;
}

.tests-composition {
  display: grid;
  gap: var(--id-space-4);
  margin-top: var(--id-space-4);
  min-height: 0;
  overflow: auto;
}

.tests-composition > header h2,
.tests-composition > header p {
  margin: 0;
}

.tests-import-review {
  display: grid;
  gap: var(--id-space-3);
  list-style: none;
  margin: 0;
  padding: 0;
}

.tests-import-review__item {
  min-width: 0;
}

.tests-workspace > .col-sm-6,
.tests-import-workspace > .col-sm-8,
.tests-selected-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tests-steps-list,
.tests-selected-list,
.tests-import-list-wrapper {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.tests-workspace-spacer {
  max-width: 2rem;
}

.tests-selected-panel {
  border: 1px dashed rgba(255, 122, 24, 0.45);
  border-radius: 1rem;
  overflow: hidden;
  padding-bottom: 0.75rem;
}

.tests-selected-list {
  border-radius: 0.9rem;
}

.tests-import-list-wrapper {
  text-overflow: ellipsis;
}

.deleteIcon {
  float: right;
  color: white;
  font-size: 12px;
  margin-right: -0.6rem;
}
.tests-icon-action {
  background: transparent;
  border: 0;
  float: right;
  padding: 0;
}
.modal-dialog {
  min-width: 80vw;
  margin: 1.75rem auto;
}

@media only screen and (max-width: 760px) {
  .tests-page {
    height: auto;
    min-height: calc(100vh - 76px - 3rem);
    min-height: calc(100dvh - 76px - 3rem);
    overflow: visible;
  }

  .tests-steps-list,
  .tests-selected-list,
  .tests-import-list-wrapper {
    min-height: 20rem;
  }

  .tests-workspace-spacer {
    display: none;
  }
}
</style>

<script>
import apiClient from "@/services/apiClient";
import { getSelectedProjectId } from "@/stores/session";
import { buildTestPayload } from "@/domain/workflowPayloads";
import {
  loadPersistedSequence,
  normalizeSequenceItem,
  validateSequenceComposition,
} from "@/domain/sequenceBuilder";
import SequenceBuilder from "@/components/sequence/SequenceBuilder.vue";
import english from "@/languages/english";
import importSelenium from "./tests/importSelenium.vue";
import { routableTabs } from "@/shared/routableTabs";

export default {
  name: "TestsComponent",
  components: {
    importSelenium,
    SequenceBuilder,
  },
  mixins: [routableTabs("modify", ["modify", "new", "import"])],
  data() {
    return {
      delay: 1000,
      arraySteps: [],
      arrayStepsSelectedDragged: [],
      arrayStepsImported: [],
      arrayImportedStepKeys: [],
      arrayEditImportedSteps: [],
      listOriginalSteps: [],
      arrayTests: [],
      testSelected: null,
      stepFilter: "",
      testStepPickerQuery: {
        page: 1,
        search: "",
        filters: {},
      },
      disableNameTest: true,
      disableTestDescription: true,
      disableBtnCreateTest: true,
      newNameTest: "",
      newDescriptionTest: "",
      importedNameTest: "",
      importedDescriptionTest: "",
      modifyDescriptionTest: "",
      tabOpen: 0,
      testsLoaded: false,
      testsGridQuery: {
        page: 1,
        pageSize: 25,
        sort: "id",
        direction: "asc",
      },
      testsGridMeta: {
        page: 1,
        pageSize: 25,
        total: null,
        lastPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      importedFromSelenium: false,
      seleniumImport: {},
    };
  },
  created() {
    this.getSteps();
    this.emitter.on("refreshTest", (msg) => {
      if (msg == true) this.getSteps();
      else this.$forceUpdate();
    });
  },
  watch: {
    stepFilter() {
      // Do something with search nameIssue after it debounced
      let filter = this.stepFilter;
      this.searchTextSteps(filter);
    },
    arrayStepsSelectedDragged() {
      this.disableNameTest = this.arrayStepsSelectedDragged.length == 0;
    },
    newNameTest() {
      this.disableTestDescription = this.newNameTest.length == 0;
    },
    newDescriptionTest() {
      this.disableBtnCreateTest = this.newDescriptionTest.length == 0;
    },
    testSelected() {
      this.getTest();
    },
    /*$route() {
      this.$forceUpdate();
    }, */
    files() {},
  },
  computed: {
    isModifyTabDisabled() {
      return this.testsLoaded && this.arrayTests.length === 0;
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
    builderAvailableSteps() {
      return this.arraySteps.map((step) => this.toBuilderStep(step));
    },
    testStepSequenceState() {
      return loadPersistedSequence(this.arrayStepsSelectedDragged, {
        availableItems: this.listOriginalSteps.map((step) =>
          this.toBuilderStep(step),
        ),
        entityType: "step",
      });
    },
    testStepSequenceItems() {
      return this.testStepSequenceState.items.map((item) => ({
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
    testStepValidation() {
      return validateSequenceComposition(this.testStepSequenceState, {
        minimumItems: 1,
      });
    },
    testStepPickerMeta() {
      return {
        page: 1,
        lastPage: 1,
        total: this.builderAvailableSteps.length,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    },
    testStepPickerFilters() {
      const runtimes = [
        ...new Set(
          this.listOriginalSteps
            .map((step) => this.stepRuntime(step))
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
  },
  methods: {
    stepRuntime(step) {
      return (
        step.runtime ??
        step.type ??
        step.config?.runtime ??
        step.config?.steps?.[0]?.runtime ??
        ""
      );
    },
    toBuilderStep(step) {
      const persisted = JSON.parse(JSON.stringify(step));
      const normalized = normalizeSequenceItem(
        {
          ...step,
          name: step.description ?? step.name,
          metadata: {
            runtime: this.stepRuntime(step),
            tags: Array.isArray(step.tags) ? step.tags.join(", ") : "",
            version: step.version ?? step.catalogVersion ?? "",
            status: step.status ?? "active",
          },
        },
        { entityType: "step" },
      );
      return { ...normalized, persisted };
    },
    updateTestStepSequence(nextSequence) {
      this.arrayStepsSelectedDragged = nextSequence.map((item) =>
        JSON.parse(JSON.stringify(item.persisted)),
      );
      this.copyArray();
    },
    handleStepPickerQuery(query) {
      this.testStepPickerQuery = query;
      this.stepFilter = query.search ?? "";
      this.searchTextSteps(this.stepFilter);
    },
    onRoutableTabChange(tab) {
      this.tabOpen = ["modify", "new", "import"].indexOf(tab);
    },
    redirectEmptyTests() {
      if (this.isModifyTabDisabled && this.isActiveTab("modify")) {
        this.openTab("new");
      }
    },
    cancelUpload() {
      this.$refs.selenium.showUploadComponent();
      this.seleniumImport = {};
      this.arrayStepsImported = [];
      this.arrayImportedStepKeys = [];
    },
    importTest(value) {
      this.importedNameTest = value.name;
      this.importedDescriptionTest = value.description;
      if (value.tests) {
        this.seleniumImport = value.seleniumImport;
        this.arrayStepsImported = value.tests.map((step) =>
          JSON.parse(JSON.stringify(step)),
        );
        this.arrayImportedStepKeys = value.tests.map(
          (_step, index) => `import-${Date.now()}-${index}`,
        );
        this.importedFromSelenium = true;
        this.arrayEditImportedSteps = [];
        for (let i in this.arrayStepsImported) {
          this.arrayEditImportedSteps.push(false);
        }
      }
    },
    searchTextSteps(filter) {
      const search = String(filter ?? "")
        .trim()
        .toLowerCase();
      const runtime = this.testStepPickerQuery.filters?.runtime;
      this.arraySteps = this.listOriginalSteps.filter((step) => {
        const displayName = step.description ?? step.name ?? "";
        const matchesSearch =
          search === "" || displayName.toLowerCase().includes(search);
        const matchesRuntime = !runtime || this.stepRuntime(step) === runtime;
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
    getSteps() {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.steps +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.arraySteps = this.listOriginalSteps = response.data;
          this.getTests();
        })
        .catch((e) => {
          this.error = e;
        });
    },
    getTests() {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.tests +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
            params: this.testsGridQuery,
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          const result = this.normalizeGridResponse(
            response.data,
            this.testsGridMeta,
          );
          this.arrayTests = result.rows;
          this.testsGridMeta = result.meta;
          this.testsLoaded = true;
          this.redirectEmptyTests();
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    getTest() {
      if (this.testSelected == null) {
        this.modifyDescriptionTest = "";
        this.arrayStepsSelectedDragged = [];
        return false;
      }
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.tests +
            "/" +
            getSelectedProjectId() +
            "/" +
            this.testSelected.id,
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.arrayStepsSelectedDragged = JSON.parse(response.data.config);
          this.modifyDescriptionTest = response.data.description;
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    saveTest() {
      this.emitter.emit("showLoader", true);
      apiClient
        .post(
          this.config.serviceBaseUrl + this.config.url.tests,
          buildTestPayload({
            name: this.newNameTest,
            description: this.newDescriptionTest,
            steps: this.arrayStepsSelectedDragged,
            projectId: getSelectedProjectId(),
          }),
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.listPlugins = response.data;
          this.arraySteps = this.listOriginalSteps;
          this.arrayStepsSelectedDragged = [];
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    saveImportTest() {
      this.emitter.emit("showLoader", true);
      apiClient
        .post(
          this.config.serviceBaseUrl + this.config.url.importtest,
          {
            name: this.importedNameTest,
            description: this.importedDescriptionTest,
            import: JSON.stringify(this.arrayStepsImported),
            idProject: getSelectedProjectId(),
          },
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.arrayStepsSelectedDragged = [];
          this.arrayStepsImported = [];
          this.cancelUpload();
          this.getSteps();
          this.openTab("modify");
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    modifyTest() {
      this.emitter.emit("showLoader", true);
      apiClient
        .put(
          this.config.serviceBaseUrl +
            this.config.url.tests +
            "/" +
            getSelectedProjectId() +
            "/" +
            this.testSelected.id,
          {
            config: JSON.stringify(this.arrayStepsSelectedDragged),
            description: this.modifyDescriptionTest,
          },
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.listPlugins = response.data;
          this.arraySteps = this.listOriginalSteps;
        })
        .catch((e) => {
          //this.Logout(this)
          this.$showAlert({
            message:
              e?.message ||
              this.language[this.config.currentLanguage].Dialog.operationFailed,
            variant: "danger",
          });
          this.error = e;
        });
    },
    log: function () {
      this.copyArray();
    },
    deleteItem(index) {
      this.arrayStepsSelectedDragged.splice(index, 1);
      this.copyArray();
    },
    deleteItemImported(index) {
      this.arrayStepsImported.splice(index, 1);
      this.arrayImportedStepKeys.splice(index, 1);
    },
    moveImportedItem(index, destination) {
      if (
        destination < 0 ||
        destination >= this.arrayStepsImported.length ||
        destination === index
      ) {
        return;
      }
      const [step] = this.arrayStepsImported.splice(index, 1);
      const [key] = this.arrayImportedStepKeys.splice(index, 1);
      this.arrayStepsImported.splice(destination, 0, step);
      this.arrayImportedStepKeys.splice(destination, 0, key);
    },
    editImportedItem(index) {
      for (let i in this.arrayEditImportedSteps)
        this.arrayEditImportedSteps[i] = false;
      this.arrayEditImportedSteps[index] = true;
      this.targetSelected =
        this.arrayStepsImported[index].steps[0].findBy +
        "=" +
        this.arrayStepsImported[index].steps[0].target;
      this.$forceUpdate();
    },
    endEditImportedItem(index) {
      this.arrayEditImportedSteps[index] = false;
      this.$forceUpdate();
    },
    changeTarget(index, obj) {
      let target = obj.target.value.substring(
        obj.target.value.indexOf("=") + 1,
      );
      let findBy = obj.target.value.substring(0, obj.target.value.indexOf("="));
      this.arrayStepsImported[index].steps[0].target = target;
      this.arrayStepsImported[index].steps[1].target = target;
      this.arrayStepsImported[index].steps[0].findBy = findBy;
      this.arrayStepsImported[index].steps[1].findBy = findBy;
      this.endEditImportedItem(index);
    },
    copyArray() {
      this.disableNameTest = this.arrayStepsSelectedDragged.length == 0;
      this.arrayStepsSelected = [];
      for (let i = 0; i < this.arrayStepsSelectedDragged.length; i++) {
        this.arrayStepsSelected.push(this.arrayStepsSelectedDragged[i].name);
      }
    },
  },
};
</script>
