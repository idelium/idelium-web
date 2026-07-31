<template>
  <div class="costum tests-page">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div
            class="nav nav-tabs idelium-enterprise-tabs"
            id="nav-tab"
            role="tablist"
          >
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
          <div
            class="tab-content idelium-enterprise-tab-content"
            id="pills-tabContent"
          >
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
              <ImportIdeliumTest
                ref="importTestUpload"
                v-on:importTest="importTest"
              />
              <!-- end tabTitleModify tab -->
            </div>
          </div>
        </div>
        <section
          v-if="shouldShowStepComposition"
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
            :allow-duplicates="true"
            :available-items="builderAvailableSteps"
            :copy="sequenceBuilderCopy"
            layout="split"
            :picker-filters="testStepPickerFilters"
            :picker-meta="testStepPickerMeta"
            :picker-query="testStepPickerQuery"
            :sequence="testStepSequenceItems"
            :validation="testStepValidation"
            v-on:picker-query-change="handleStepPickerQuery"
            v-on:update:sequence="updateTestStepSequence"
          />
        </section>
        <section
          v-else-if="tabOpen == 0"
          class="tests-composition tests-composition--empty"
          aria-labelledby="test-composition-empty-title"
        >
          <header>
            <h2 id="test-composition-empty-title">
              {{
                language[config.currentLanguage].Tests
                  .selectTestToManageStepsTitle
              }}
            </h2>
            <p>
              {{
                language[config.currentLanguage].Tests
                  .selectTestToManageStepsDescription
              }}
            </p>
          </header>
        </section>
        <section
          class="tests-import-workspace"
          v-if="tabOpen == 2 && arrayStepsImported.length != 0"
          aria-labelledby="tests-import-review-title"
        >
          <div class="tests-import-review-panel">
            <header class="tests-import-review-header">
              <div>
                <p class="tests-import-eyebrow">
                  {{ language[config.currentLanguage].Tests.importReviewEyebrow }}
                </p>
                <h2 id="tests-import-review-title">
                  {{
                    importedNameTest ||
                    language[config.currentLanguage].Tests.importReviewFallbackTitle
                  }}
                </h2>
                <p>
                  {{
                    importedDescriptionTest ||
                    language[config.currentLanguage].Tests.importReviewDescription
                  }}
                </p>
              </div>
              <dl class="tests-import-summary">
                <div>
                  <dt>{{ language[config.currentLanguage].Tests.importedSteps }}</dt>
                  <dd>{{ arrayStepsImported.length }}</dd>
                </div>
                <div>
                  <dt>
                    {{ language[config.currentLanguage].Tests.importedActions }}
                  </dt>
                  <dd>{{ importedActionsTotal() }}</dd>
                </div>
              </dl>
            </header>
            <div class="tests-import-list-wrapper">
              <ol class="tests-import-review">
                <li
                  v-for="(element, index) in arrayStepsImported"
                  v-bind:key="arrayImportedStepKeys[index]"
                  class="tests-import-review__item"
                >
                  <article class="tests-import-step-card">
                    <div class="tests-import-step-card__order">
                      {{ index + 1 }}
                    </div>
                    <div class="tests-import-step-card__body">
                      <button
                        type="button"
                        class="tests-import-step-card__title"
                        v-on:click="editImportedItem(index)"
                        v-if="arrayEditImportedSteps[index] == false"
                      >
                        {{ element.name }}
                      </button>
                      <input
                        class="form-control tests-import-step-card__input"
                        v-if="arrayEditImportedSteps[index] == true"
                        v-on:keyup.enter="endEditImportedItem(index)"
                        v-model="arrayStepsImported[index].name"
                      />
                      <p class="tests-import-step-card__meta">
                        {{
                          formatImportCount(
                            importedActionCount(element),
                            language[config.currentLanguage].Tests.importedActionsCount,
                          )
                        }}
                        <span v-if="element.steps?.[0]?.findBy">
                          · {{ element.steps[0].findBy }}
                        </span>
                      </p>
                      <ul
                        class="tests-import-action-preview"
                        v-if="Array.isArray(element.steps)"
                      >
                        <li
                          v-for="(action, actionIndex) in element.steps.slice(0, 3)"
                          v-bind:key="`${arrayImportedStepKeys[index]}-${actionIndex}`"
                        >
                          <span>{{ action.stepType || action.type || "action" }}</span>
                          <code>{{ actionTargetSummary(action) }}</code>
                        </li>
                      </ul>
                    </div>
                    <div class="tests-import-step-card__actions">
                      <button
                        type="button"
                        class="tests-icon-action tests-icon-action--reorder"
                        v-on:click="moveImportedItem(index, index - 1)"
                        :disabled="index === 0"
                        :title="
                          language[config.currentLanguage].Tests.moveImportedUp
                        "
                      >
                        <font-awesome-icon
                          icon="arrow-up"
                          class="idelium-action-icon--update"
                        />
                      </button>
                      <button
                        type="button"
                        class="tests-icon-action tests-icon-action--reorder"
                        v-on:click="moveImportedItem(index, index + 1)"
                        :disabled="index === arrayStepsImported.length - 1"
                        :title="
                          language[config.currentLanguage].Tests
                            .moveImportedDown
                        "
                      >
                        <font-awesome-icon
                          icon="arrow-down"
                          class="idelium-action-icon--update"
                        />
                      </button>
                      <button
                        type="button"
                        class="tests-icon-action tests-icon-action--edit"
                        v-on:click="editImportedItem(index)"
                        :title="
                          language[config.currentLanguage].Tests.editImported
                        "
                      >
                        <font-awesome-icon
                          icon="pen"
                          class="idelium-action-icon--modify"
                        />
                      </button>
                      <button
                        type="button"
                        class="tests-icon-action tests-icon-action--delete"
                        v-on:click="deleteItemImported(index)"
                        :title="language[config.currentLanguage].Actions.remove"
                      >
                        <font-awesome-icon
                          icon="times-circle"
                          class="deleteIcon iconClass idelium-action-icon--remove"
                        />
                      </button>
                    </div>
                  </article>
                </li>
              </ol>
            </div>
          </div>
          <aside class="tests-import-actions-panel">
            <p class="tests-import-eyebrow">
              {{ language[config.currentLanguage].Tests.importReadyEyebrow }}
            </p>
            <h3>{{ language[config.currentLanguage].Tests.importReadyTitle }}</h3>
            <p>
              {{ language[config.currentLanguage].Tests.importReadyDescription }}
            </p>
            <button
              type="button"
              class="btn btn-success tests-import-primary-action"
              v-on:click="saveImportTest()"
            >
              {{ language[config.currentLanguage].Tests.btnImportTest }}
            </button>
            <button
              type="button"
              class="btn btn-secondary tests-import-secondary-action"
              v-on:click="cancelUpload()"
            >
              {{ language[config.currentLanguage].Tests.btnCancel }}
            </button>
          </aside>
        </section>
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

.tests-workspace {
  flex: 1 1 auto;
  margin-top: 1rem;
  min-height: 0;
  overflow: hidden;
}

.tests-import-workspace {
  display: grid;
  flex: 1 1 auto;
  gap: var(--id-space-4);
  grid-template-columns: minmax(0, 1fr) minmax(16rem, 22rem);
  margin-top: var(--id-space-4);
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

.tests-workspace > .col-sm-6,
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

.tests-import-review-panel,
.tests-import-actions-panel {
  background:
    linear-gradient(145deg, rgba(255, 122, 24, 0.08), transparent 34%),
    rgba(38, 42, 54, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.15rem;
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.18);
  min-height: 0;
}

.tests-import-review-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tests-import-review-header {
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: var(--id-space-4);
  justify-content: space-between;
  padding: var(--id-space-4);
}

.tests-import-review-header h2,
.tests-import-review-header p,
.tests-import-actions-panel h3,
.tests-import-actions-panel p {
  margin: 0;
}

.tests-import-review-header h2 {
  color: #ffffff;
  font-size: 1.35rem;
  letter-spacing: 0.02em;
  margin-bottom: 0.35rem;
}

.tests-import-review-header p,
.tests-import-actions-panel p {
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.55;
}

.tests-import-eyebrow {
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.tests-import-summary {
  display: grid;
  gap: var(--id-space-3);
  grid-template-columns: repeat(2, minmax(6rem, 1fr));
  margin: 0;
  min-width: 16rem;
}

.tests-import-summary div {
  background: rgba(10, 13, 24, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.85rem;
  padding: 0.85rem 1rem;
}

.tests-import-summary dt {
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.tests-import-summary dd {
  color: #ffffff;
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0.2rem 0 0;
}

.tests-import-list-wrapper {
  padding: var(--id-space-4);
  scrollbar-color: rgba(255, 122, 24, 0.8) rgba(255, 255, 255, 0.08);
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

.tests-import-step-card {
  align-items: flex-start;
  background: rgba(49, 53, 67, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
  display: grid;
  gap: var(--id-space-3);
  grid-template-columns: auto minmax(0, 1fr) auto;
  padding: 1rem;
}

.tests-import-step-card__order {
  align-items: center;
  background: rgba(255, 122, 24, 0.16);
  border: 1px solid rgba(255, 122, 24, 0.35);
  border-radius: 0.85rem;
  color: #ffb36c;
  display: inline-flex;
  font-weight: 800;
  height: 2.35rem;
  justify-content: center;
  min-width: 2.35rem;
}

.tests-import-step-card__body {
  min-width: 0;
}

.tests-import-step-card__title {
  background: transparent;
  border: 0;
  color: #ffffff;
  display: block;
  font-size: 0.92rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  overflow: hidden;
  padding: 0;
  text-align: left;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
  width: 100%;
}

.tests-import-step-card__input {
  background: rgba(10, 13, 24, 0.75);
  color: #ffffff;
  max-width: 42rem;
}

.tests-import-step-card__meta {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  margin: 0.35rem 0 0;
  text-transform: uppercase;
}

.tests-import-action-preview {
  display: grid;
  gap: 0.4rem;
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
}

.tests-import-action-preview li {
  align-items: center;
  color: rgba(255, 255, 255, 0.72);
  display: grid;
  gap: var(--id-space-2);
  grid-template-columns: minmax(6rem, auto) minmax(0, 1fr);
  min-width: 0;
}

.tests-import-action-preview span {
  color: #9ed4ff;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.tests-import-action-preview code {
  background: rgba(10, 13, 24, 0.48);
  border-radius: 0.45rem;
  color: rgba(255, 255, 255, 0.75);
  overflow: hidden;
  padding: 0.2rem 0.45rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tests-import-step-card__actions {
  display: flex;
  gap: 0.5rem;
}

.tests-import-actions-panel {
  align-self: start;
  display: grid;
  gap: var(--id-space-3);
  padding: var(--id-space-4);
}

.tests-import-actions-panel h3 {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.tests-import-primary-action,
.tests-import-secondary-action {
  width: 100%;
}

.deleteIcon {
  color: white;
  font-size: 12px;
}
.tests-icon-action {
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.7rem;
  display: inline-flex;
  height: 2rem;
  justify-content: center;
  padding: 0;
  width: 2rem;
}

.tests-icon-action:disabled {
  cursor: not-allowed;
  opacity: 0.35;
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

  .tests-import-workspace {
    grid-template-columns: 1fr;
    overflow: visible;
  }

  .tests-import-review-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .tests-import-summary {
    min-width: 0;
    width: 100%;
  }

  .tests-import-step-card {
    grid-template-columns: 1fr;
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
import ImportIdeliumTest from "./tests/importIdeliumTest.vue";
import { routableTabs } from "@/shared/routableTabs";

export default {
  name: "TestsComponent",
  components: {
    ImportIdeliumTest,
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
      importedFromIdelium: false,
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
    shouldShowStepComposition() {
      return this.tabOpen === 1 || (this.tabOpen === 0 && this.testSelected != null);
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
        duplicatePolicy: "allow",
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
        duplicatePolicy: "allow",
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
      this.$refs.importTestUpload.showUploadComponent();
      this.arrayStepsImported = [];
      this.arrayImportedStepKeys = [];
    },
    importedActionCount(step) {
      return Array.isArray(step?.steps) ? step.steps.length : 0;
    },
    importedActionsTotal() {
      return this.arrayStepsImported.reduce(
        (total, step) => total + this.importedActionCount(step),
        0,
      );
    },
    formatImportCount(count, template) {
      return String(template ?? "{count}").replace("{count}", count);
    },
    actionTargetSummary(action) {
      return (
        action?.findBy ??
        action?.url ??
        action?.value ??
        action?.locator ??
        action?.selector ??
        action?.name ??
        "configured action"
      );
    },
    importTest(value) {
      this.importedNameTest = value.name;
      this.importedDescriptionTest = value.description;
      if (value.tests) {
        this.arrayStepsImported = value.tests.map((step) =>
          JSON.parse(JSON.stringify(step)),
        );
        this.arrayImportedStepKeys = value.tests.map(
          (_step, index) => `import-${Date.now()}-${index}`,
        );
        this.importedFromIdelium = true;
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
      this.$forceUpdate();
    },
    endEditImportedItem(index) {
      this.arrayEditImportedSteps[index] = false;
      this.$forceUpdate();
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
