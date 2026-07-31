<template>
  <div class="idelium-steps-page">
    <div class="nav nav-tabs" id="nav-tab" role="tablist">
      <button
        :class="tabButtonClass('order')"
        id="nav-tabOrderSteps-tab"
        type="button"
        role="tab"
        aria-controls="nav-tabOrderSteps"
        :aria-selected="isActiveTab('order')"
        :disabled="isStepOrderTabDisabled"
        v-on:click="
          openTab('order');
          getSteps();
        "
      >
        {{ language[config.currentLanguage].Steps.tabOrderSteps }}
      </button>
      <button
        :class="tabButtonClass('new')"
        id="nav-tabNewStep-tab"
        type="button"
        role="tab"
        ref="tabNewStep"
        aria-controls="nav-tabNewStep"
        :aria-selected="isActiveTab('new')"
        v-on:click="openTab('new')"
      >
        {{ language[config.currentLanguage].Steps.tabNewStep }}
      </button>
    </div>
    <div class="tab-content" id="pills-tabContent">
      <div
        :class="tabPaneClass('order')"
        id="nav-tabOrderSteps"
        role="tabpanel"
        aria-labelledby="tabOrderSteps-tab"
      >
        <!-- start tabOrderSteps tab -->
        <section class="idelium-steps-order-panel">
          <EnterpriseListingGrid
            class="idelium-steps-order-grid"
            v-model:search="stepSearch"
            :accessible-label="stepCopy.listTitle"
            :actions="stepActions"
            :columns="stepColumns"
            density="compact"
            :error="error"
            :has-active-filters="gridQuery.search !== ''"
            :listing-copy="stepCopy"
            :loading="stepGridLoading"
            :meta="gridMeta"
            :rows="listSteps"
            :sort="stepSort"
            :table-copy="stepTableCopy"
            v-on:action="handleStepAction"
            v-on:clear-filters="clearStepSearch"
            v-on:page-change="changeStepPage"
            v-on:retry="getSteps"
            v-on:row-activate="openStep"
            v-on:search="scheduleStepSearch"
            v-on:sort="sortSteps"
          >
            <template #toolbar>
              <button
                type="button"
                class="btn btn-success"
                v-on:click="saveOrderSteps()"
                :disabled="btnSaveOrderDisabled"
              >
                {{ stepCopy.btnSaveOrder }}
              </button>
            </template>
          </EnterpriseListingGrid>
        </section>
        <!-- end tabOrderSteps tab -->
      </div>
      <div
        :class="tabPaneClass('new')"
        id="nav-tabNewStep"
        role="tabpanel"
        aria-labelledby="tabNewStep-tab"
      >
        <!-- start tabOrderSteps tab -->
        <div class="row">
          <div class="col-sm-2">
            <select
              v-model="modeSelected"
              class="form-select form-select-sm form-control"
            >
              <option
                v-for="item in modeOptions"
                v-bind:key="item"
                :value="item.value"
              >
                {{ item.text }}
              </option>
            </select>
          </div>
          <div class="col-7">
            <input
              v-model="stepDescription"
              type="text"
              class="form-control form-control-sm"
              :placeholder="
                language[config.currentLanguage].Steps
                  .placeholderDescriptionStep
              "
            />
          </div>
          <!--div class="col">
            <input
              v-model="stepNameFile"
              type="text"
              class="form-control form-control-sm"
              :placeholder="language[config.currentLanguage].Steps.placeholderFileName"
              v-on:keypress="isLetter($event, false)"
              :disabled="stepDescription.length == 0"
            />
          </div-->
          <div class="col">
            <button
              type="button"
              class="btn btn-success"
              size="sm"
              style="float: right"
              v-on:click="saveStep()"
              :disabled="
                stepDescription.length == 0 || stepNameFile.length == 0
              "
            >
              {{ language[config.currentLanguage].Steps.btnSaveStep }}
            </button>
          </div>
        </div>
        <json-editor
          ref="editor"
          style="height: 80vh"
          v-if="modeSelected == 'json'"
          :onChange="changeJson"
          :options="options"
          :json="loadJsonToEdit"
          minheight="30vh"
        />
        <div
          v-if="modeSelected == 'dsl'"
          class="idelium-dsl-editor"
          aria-live="polite"
        >
          <label class="form-label" for="step-dsl-source">
            {{ language[config.currentLanguage].Steps.dsl.sourceLabel }}
          </label>
          <textarea
            id="step-dsl-source"
            v-model="dslSource"
            class="form-control idelium-dsl-editor__source"
            :placeholder="
              language[config.currentLanguage].Steps.dsl.sourcePlaceholder
            "
            aria-describedby="step-dsl-help step-dsl-diagnostics"
          ></textarea>
          <div id="step-dsl-help" class="form-text">
            {{ language[config.currentLanguage].Steps.dsl.sourceHelp }}
          </div>
          <section
            class="idelium-dsl-editor__constructs"
            :aria-label="
              language[config.currentLanguage].Steps.dsl.constructsTitle
            "
          >
            <article
              v-for="construct in localizedDslConstructs"
              :key="construct.id"
              class="idelium-dsl-editor__construct-card"
            >
              <h6>{{ construct.title }}</h6>
              <p>{{ construct.description }}</p>
              <code>{{ construct.statements[0] }}</code>
            </article>
          </section>
          <button
            type="button"
            class="btn btn-outline-info btn-sm mt-3"
            v-on:click="validateDsl('new')"
          >
            {{ language[config.currentLanguage].Steps.dsl.validate }}
          </button>
          <ul
            v-if="dslDiagnostics.length > 0"
            id="step-dsl-diagnostics"
            class="idelium-dsl-editor__diagnostics"
          >
            <li v-for="diagnostic in dslDiagnostics" :key="diagnostic.code">
              <strong>{{ diagnostic.severity }}</strong>
              {{
                formatDslDiagnostic(
                  diagnostic,
                  language[config.currentLanguage].Steps.dsl,
                )
              }}
            </li>
          </ul>
        </div>
        <wizard
          ref="wizard"
          v-if="modeSelected == 'wizard'"
          id-prefix="step-new"
          :jsonFromEditor="jsonSteps"
          v-on:setStepDescription="setStepDescription"
          v-on:syncJson="syncJson"
        />
        <!-- end tabOrderSteps tab -->
      </div>
    </div>
    <div
      class="modal fade"
      ref="mymodal"
      id="myModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              {{
                language[config.currentLanguage].Platforms.ManagePlatform
                  .modalAddPlatform.modalTitle
              }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p />
            <div class="col-sm-2">
              <select v-model="modeEditSelected" class="form-control">
                <option
                  v-for="item in modeOptions"
                  v-bind:key="item"
                  :value="item.value"
                >
                  {{ item.text }}
                </option>
              </select>
            </div>
            <div class="col">
              <input
                v-model="stepEditDescription"
                type="text"
                class="form-control"
                :placeholder="
                  language[config.currentLanguage].Steps
                    .placeholderDescriptionStep
                "
              />
            </div>
            <div class="col">
              <input
                v-model="stepEditNameFile"
                type="text"
                class="form-control"
                :placeholder="
                  language[config.currentLanguage].Steps.placeholderFileName
                "
                v-on:keypress="isLetter($event, true)"
                :disabled="stepEditDescription.length == 0"
              />
            </div>
            <wizard
              ref="wizardEdit"
              v-if="modeEditSelected == 'wizard'"
              id-prefix="step-edit"
              :jsonFromEditor_prop="resumeJson"
              v-on:setStepDescription="setEditStepDescription"
              v-on:syncJson="syncEditJson"
              minheight="20vh"
            />
            <json-editor
              ref="editor"
              v-if="modeEditSelected == 'json'"
              style="height: 80vh"
              :onChange="changeJsonResume"
              :options="options"
              :json="resumeJson"
            />
            <div
              v-if="modeEditSelected == 'dsl'"
              class="idelium-dsl-editor"
              aria-live="polite"
            >
              <label class="form-label" for="step-edit-dsl-source">
                {{ language[config.currentLanguage].Steps.dsl.sourceLabel }}
              </label>
              <textarea
                id="step-edit-dsl-source"
                v-model="dslEditSource"
                class="form-control idelium-dsl-editor__source"
                :placeholder="
                  language[config.currentLanguage].Steps.dsl.sourcePlaceholder
                "
                aria-describedby="step-edit-dsl-help step-edit-dsl-diagnostics"
                v-on:input="btnSaveEnable = true"
              ></textarea>
              <div id="step-edit-dsl-help" class="form-text">
                {{ language[config.currentLanguage].Steps.dsl.sourceHelp }}
              </div>
              <section
                class="idelium-dsl-editor__constructs"
                :aria-label="
                  language[config.currentLanguage].Steps.dsl.constructsTitle
                "
              >
                <article
                  v-for="construct in localizedDslConstructs"
                  :key="construct.id"
                  class="idelium-dsl-editor__construct-card"
                >
                  <h6>{{ construct.title }}</h6>
                  <p>{{ construct.description }}</p>
                  <code>{{ construct.statements[0] }}</code>
                </article>
              </section>
              <button
                type="button"
                class="btn btn-outline-info btn-sm mt-3"
                v-on:click="validateDsl('edit')"
              >
                {{ language[config.currentLanguage].Steps.dsl.validate }}
              </button>
              <ul
                v-if="dslEditDiagnostics.length > 0"
                id="step-edit-dsl-diagnostics"
                class="idelium-dsl-editor__diagnostics"
              >
                <li
                  v-for="diagnostic in dslEditDiagnostics"
                  :key="diagnostic.code"
                >
                  <strong>{{ diagnostic.severity }}</strong>
                  {{
                    formatDslDiagnostic(
                      diagnostic,
                      language[config.currentLanguage].Steps.dsl,
                    )
                  }}
                </li>
              </ul>
            </div>
            <p></p>
            <p></p>
            <div class="footer-modal">
              <button
                type="button"
                class="btn btn-danger"
                size="sm"
                style="float: right"
                v-on:click="updateStep()"
                :disabled="btnSaveEnable == false"
              >
                {{ language[config.currentLanguage].Steps.btnSave }}
              </button>
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                style="color: black !important"
                v-on:click="modalElem.hide()"
              >
                {{ language[config.currentLanguage].Steps.btnCancel }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.thead {
  overflow-y: scroll;
  display: inline-block;
}

/* test */

.modal-fullscreen1 .modal {
  padding: 0 !important;
}
.modal-fullscreen1 .modal-dialog {
  max-width: 100%;
  height: auto;
  margin: 0;
}
.modal-fullscreen1 .modal-content {
  border: 0;
  border-radius: 0;
  min-height: 100%;
  height: auto;
}

.modal-fullscreen2 .modal {
  padding: 0 !important;
}
.modal-fullscreen2 .modal-dialog {
  max-width: 100%;
  height: 100%;
  margin: 0;
}
.modal-fullscreen2 .modal-content {
  width: calc(100% - 2rem);
  min-height: 100%;
  height: auto;
  margin: 1rem;
}
.buttons {
  margin-top: 35px;
}
.idelium-steps-page {
  min-width: 0;
}

.idelium-steps-order-panel {
  margin: 0 auto;
  max-width: min(92rem, calc(100vw - 4rem));
  padding: 1rem 0 0;
}

.idelium-steps-order-grid {
  background:
    linear-gradient(
      135deg,
      rgba(255, 108, 32, 0.08),
      rgba(34, 40, 56, 0.82) 22rem
    ),
    rgba(30, 34, 46, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.15rem;
  box-shadow: 0 1.25rem 3rem rgba(0, 0, 0, 0.24);
  padding: 0.85rem;
}

.idelium-steps-order-grid .enterprise-data-table {
  gap: 0.65rem;
}

.idelium-steps-order-grid .enterprise-data-table__toolbar {
  align-items: end;
  gap: 0.75rem;
}

.idelium-steps-order-grid .enterprise-listing-grid__search {
  max-width: min(34rem, 100%);
}

.idelium-steps-order-grid .enterprise-listing-grid__search span {
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.idelium-steps-order-grid .enterprise-listing-grid__search input {
  min-height: 2.35rem;
}

.idelium-steps-order-grid .enterprise-data-table__viewport {
  border-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.95rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.idelium-steps-order-grid table {
  min-width: 52rem;
}

.idelium-steps-order-grid th {
  background:
    linear-gradient(180deg, rgba(255, 108, 32, 0.1), transparent),
    rgba(43, 48, 63, 0.96);
  font-size: 0.66rem;
  letter-spacing: 0.16em;
}

.idelium-steps-order-grid td {
  font-size: 0.78rem;
  line-height: 1.25;
}

.idelium-steps-order-grid th:nth-child(1),
.idelium-steps-order-grid td:nth-child(1),
.idelium-steps-order-grid th:nth-child(4),
.idelium-steps-order-grid td:nth-child(4) {
  width: 5.5rem;
}

.idelium-steps-order-grid th:nth-child(2),
.idelium-steps-order-grid td:nth-child(2) {
  width: 18rem;
}

.idelium-steps-order-grid td:nth-child(2),
.idelium-steps-order-grid td:nth-child(3) {
  max-width: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.idelium-steps-order-grid .enterprise-data-table__actions {
  flex-wrap: nowrap;
  gap: 0.35rem;
}

.idelium-steps-order-grid .enterprise-data-table__actions .id-button {
  min-height: 1.9rem;
  padding: 0.25rem 0.55rem;
}

.idelium-steps-order-grid .enterprise-listing-grid__pagination {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.idelium-steps-order-grid .btn-success {
  border-radius: 999px;
  min-height: 2.25rem;
  padding: 0.35rem 0.9rem;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.idelium-dsl-editor {
  margin-top: 1.5rem;
}
.idelium-dsl-editor__source {
  min-height: 46vh;
  resize: vertical;
  font-family:
    "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  letter-spacing: normal;
}
.idelium-dsl-editor__diagnostics {
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(255, 97, 34, 0.55);
  border-radius: 0.75rem;
  color: #ffd8cc;
  background: rgba(255, 97, 34, 0.08);
}
.idelium-dsl-editor__constructs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}
.idelium-dsl-editor__construct-card {
  padding: 0.875rem;
  border: 1px solid rgba(83, 117, 255, 0.28);
  border-radius: 0.75rem;
  background: rgba(17, 24, 39, 0.05);
}
.idelium-dsl-editor__construct-card h6 {
  margin: 0 0 0.375rem;
}
.idelium-dsl-editor__construct-card p {
  margin: 0 0 0.5rem;
}

@media (max-width: 62rem) {
  .idelium-steps-order-panel {
    max-width: calc(100vw - 1.5rem);
  }
}
</style>

<script>
import apiClient from "@/services/apiClient";
import EnterpriseListingGrid from "@/components/grid/EnterpriseListingGrid.vue";
import { getSelectedProjectId } from "@/stores/session";
import { buildStepPayload } from "@/domain/workflowPayloads";
import {
  isGridRouteQueryKey,
  parseGridRouteQuery,
  serializeGridRouteQuery,
} from "@/domain/enterpriseGrid";
import { Modal } from "bootstrap";

import JsonEditor from "../components/JsonEditor.vue";
import wizard from "./steps/wizard.vue";
import download from "@/shared/download";
import { routableTabs } from "@/shared/routableTabs";
import { normalizeEditableStepConfig } from "@/domain/stepConfig";
import {
  buildDslSourcePayload,
  extractDslSource,
  isDslSourcePayload,
  localizeDslConstructs,
  validateDslSource,
} from "@/domain/dslValidation";

let templateJson = {
  name: "<nome step>",
  failedExit: true,
  attachScreenshot: true,
  steps: [
    {
      stepType: "",
      xpath: "",
      note: "",
    },
  ],
};

const STEP_SORTS = [
  "id",
  "name",
  "description",
  "order",
  "created_at",
  "updated_at",
];

export default {
  name: "StepsComponent",
  inheritAttrs: false,
  mixins: [routableTabs("order", ["order", "new"])],
  components: {
    EnterpriseListingGrid,
    JsonEditor,
    wizard,
  },
  data: () => {
    return {
      enabled: true,
      error: null,
      listSteps: [],
      stepsLoaded: false,
      arrayRealStep: [],
      dragging: false,
      jsonSteps: null,
      jsonEditSteps: null,
      jsonResumeSteps: null,
      resumeJson: null,
      jsonResumeNameSelected: null,
      routeStepIdOpened: null,
      btnSaveEnable: false,
      idResume: null,
      options: {
        mode: "code",
        modes: ["tree", "code"],
      },
      modeOptions: [
        { text: "wizard", value: "wizard" },
        { text: "json editor", value: "json" },
        { text: "DSL", value: "dsl" },
      ],
      modeSelected: "wizard",
      modeEditSelected: "wizard",
      dslSource: 'idelium 1.0\n\ntest "smoke" {\n}\n',
      dslEditSource: "",
      dslDiagnostics: [],
      dslEditDiagnostics: [],
      stepDescription: "",
      stepNameFile: "",
      stepEditDescription: "",
      stepEditNameFile: "",
      loadJsonToEdit: "",
      loadEditJsonToEdit: "",
      defaultJson: templateJson,
      isLetterCheck: false,
      btnSaveOrderDisabled: true,
      isLetterEditCheck: false,
      gridQuery: {
        page: 1,
        pageSize: 25,
        sort: "order",
        direction: "asc",
        search: "",
      },
      gridMeta: {
        page: 1,
        pageSize: 25,
        total: null,
        lastPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      stepGridLoading: false,
      stepSearch: "",
      stepSearchTimer: null,
      updatingStepRoute: false,
    };
  },
  options: {},
  computed: {
    stepCopy() {
      return this.language[this.config.currentLanguage].Steps;
    },
    stepTableCopy() {
      return this.language[this.config.currentLanguage].DataTable;
    },
    stepColumns() {
      return [
        {
          key: "id",
          label: this.stepCopy.colId,
          required: true,
          sortable: true,
          type: "technical",
        },
        {
          key: "name",
          label: this.stepCopy.colName,
          required: true,
          sortable: true,
        },
        {
          key: "description",
          label: this.stepCopy.colDescription,
          sortable: true,
        },
        {
          key: "order",
          label: this.stepCopy.colOrder,
          sortable: true,
          type: "technical",
        },
      ];
    },
    stepActions() {
      const actions = this.language[this.config.currentLanguage].Actions;
      return [
        {
          id: "move-up",
          label: this.stepCopy.moveUp,
          disabled: (row) => this.listSteps.indexOf(row) <= 0,
        },
        {
          id: "move-down",
          label: this.stepCopy.moveDown,
          disabled: (row) =>
            this.listSteps.indexOf(row) === this.listSteps.length - 1,
        },
        { id: "edit", label: actions.edit },
        { id: "duplicate", label: actions.duplicate },
        { id: "download", label: actions.download },
        { id: "delete", label: actions.delete, variant: "danger" },
      ];
    },
    stepSort() {
      return {
        field: this.gridQuery.sort,
        direction: this.gridQuery.direction,
      };
    },
    strippedContent() {
      let regex = /(<([^>]+)>)/gi;
      return this.comment.content.rendered.replace(regex, "");
    },
    draggingInfo() {
      return this.dragging ? "under drag" : "";
    },
    isStepOrderTabDisabled() {
      return this.stepsLoaded && this.listSteps.length === 0;
    },
    localizedDslConstructs() {
      return localizeDslConstructs(
        this.language[this.config.currentLanguage].Steps.dsl,
      );
    },
  },
  watch: {
    modeSelected() {
      if (this.modeSelected == "wizard") {
        this.syncWizardJson();
      }
    },
    modeEditSelected() {
      if (this.modeEditSelected == "wizard") {
        this.syncEditWizardJson();
      }
    },
    jsonSteps() {
      if (this.jsonSteps != null) this.stepDescription = this.jsonSteps.name;
    },
    jsonEditSteps() {
      if (this.jsonEditSteps != null)
        this.stepEditDescription = this.jsonEditSteps.name;
    },
    stepDescription() {
      if (this.isLetterCheck == false) {
        let stringToReplace = this.stepDescription
          .replace(/[^\w\s]/gi, "")
          .toLowerCase();
        this.stepNameFile = stringToReplace.replace(/ /g, "_");
      }
    },
    $route() {
      if (!this.updatingStepRoute && this.restoreStepQuery()) {
        this.getSteps();
      }
      this.openRoutedStepForEdit();
      this.$forceUpdate();
    },
  },
  mounted() {
    this.restoreStepQuery();
    this.getSteps();
    this.loadJsonToEdit = this.defaultJson;
    this.modalElem = new Modal(document.getElementById("myModal"));
    this.openRoutedStepForEdit();
  },
  beforeUnmount() {
    clearTimeout(this.stepSearchTimer);
    this.emitter.emit("showLoader", false);
  },
  created() {
    this.emitter.on("refreshStep", (msg) => {
      if (msg == true) this.getSteps();
      else this.$forceUpdate();
    });
  },
  methods: {
    restoreStepQuery() {
      const parsed = parseGridRouteQuery(this.$route?.query || {}, {
        allowedSorts: STEP_SORTS,
      });
      const next = {
        page: parsed.page,
        pageSize: parsed.pageSize,
        search: parsed.search,
        sort: parsed.sort?.field || "order",
        direction: parsed.sort?.direction || "asc",
      };
      const changed = JSON.stringify(next) !== JSON.stringify(this.gridQuery);
      this.gridQuery = next;
      this.stepSearch = parsed.search;
      return changed;
    },
    async updateStepRoute(changes) {
      const next = { ...this.gridQuery, ...changes };
      if (
        changes.search !== undefined ||
        changes.sort !== undefined ||
        changes.direction !== undefined
      ) {
        next.page = 1;
      }
      this.gridQuery = next;
      if (this.$router && this.$route) {
        const preserved = Object.fromEntries(
          Object.entries(this.$route.query || {}).filter(
            ([key]) => !isGridRouteQueryKey(key),
          ),
        );
        this.updatingStepRoute = true;
        try {
          await this.$router.replace({
            query: {
              ...preserved,
              ...serializeGridRouteQuery(
                {
                  ...next,
                  sort: { field: next.sort, direction: next.direction },
                },
                { allowedSorts: STEP_SORTS },
              ),
            },
          });
        } finally {
          this.updatingStepRoute = false;
        }
      }
      return this.getSteps();
    },
    scheduleStepSearch(value) {
      clearTimeout(this.stepSearchTimer);
      this.stepSearchTimer = setTimeout(() => {
        this.stepSearchTimer = null;
        this.updateStepRoute({ search: value });
      }, 250);
    },
    clearStepSearch() {
      this.stepSearch = "";
      return this.updateStepRoute({ search: "" });
    },
    changeStepPage(page) {
      return this.updateStepRoute({ page: Math.max(Number(page) || 1, 1) });
    },
    sortSteps(sort) {
      return this.updateStepRoute({
        sort: sort.field,
        direction: sort.direction,
      });
    },
    openStep(step) {
      return this.getJson(step.id, step.name, step.description);
    },
    moveStep(step, offset) {
      const currentIndex = this.listSteps.indexOf(step);
      const nextIndex = currentIndex + offset;
      if (
        currentIndex < 0 ||
        nextIndex < 0 ||
        nextIndex >= this.listSteps.length
      ) {
        return;
      }
      const reordered = [...this.listSteps];
      [reordered[currentIndex], reordered[nextIndex]] = [
        reordered[nextIndex],
        reordered[currentIndex],
      ];
      this.listSteps = reordered;
      this.btnSaveOrderDisabled = false;
    },
    handleStepAction({ action, row }) {
      if (action === "move-up") this.moveStep(row, -1);
      if (action === "move-down") this.moveStep(row, 1);
      if (action === "edit") this.openStep(row);
      if (action === "duplicate") this.duplicateStep(row);
      if (action === "download") this.downloadStep(row);
      if (action === "delete") this.deleteStep(row);
    },
    currentProjectId() {
      return this.$route?.params?.projectId || getSelectedProjectId();
    },
    routedStepId() {
      return this.$route?.query?.stepId || this.$route?.query?.id || null;
    },
    openRoutedStepForEdit() {
      const stepId = this.routedStepId();
      if (stepId == null || this.routeStepIdOpened === String(stepId)) return;

      this.routeStepIdOpened = String(stepId);
      this.getJson(stepId);
    },
    redirectEmptySteps() {
      if (this.isStepOrderTabDisabled && this.isActiveTab("order")) {
        this.openTab("new");
      }
    },
    moveElement(e) {
      this.btnSaveOrderDisabled = false;
    },
    syncWizardJson() {
      setTimeout(
        function () {
          this.$refs.wizard.changeJsonEditor();
        }.bind(this),
        100,
      );
    },
    syncEditWizardJson() {
      setTimeout(
        function () {
          this.$refs.wizardEdit.changeJsonEditor();
        }.bind(this),
        500,
      );
    },
    setStepDescription(e) {
      this.stepDescription = e;
    },
    setEditStepDescription() {
      this.stepEditDescription;
    },
    formatDslDiagnostic(diagnostic, labels) {
      return `${labels.line} ${diagnostic.line}, ${labels.column} ${diagnostic.column}: ${diagnostic.message} ${diagnostic.remediation}`;
    },
    validateDsl(target = "new") {
      const source = target === "edit" ? this.dslEditSource : this.dslSource;
      const result = validateDslSource(source);
      if (target === "edit") {
        this.dslEditDiagnostics = result.diagnostics;
      } else {
        this.dslDiagnostics = result.diagnostics;
      }
      return result.valid;
    },
    currentStepConfigForSave() {
      if (this.modeSelected === "dsl") {
        if (!this.validateDsl("new")) return null;
        return buildDslSourcePayload(this.dslSource);
      }
      return this.jsonSteps;
    },
    currentStepConfigForUpdate() {
      if (this.modeEditSelected === "dsl") {
        if (!this.validateDsl("edit")) return null;
        return buildDslSourcePayload(this.dslEditSource);
      }
      return this.jsonResumeSteps;
    },
    isLetter(e, isEdit = false) {
      let char = String.fromCharCode(e.keyCode); // Get the character
      if (/^[A-Za-z]+$/.test(char) || char == "_" || char == "-") return true;
      // Match with regex
      else e.preventDefault(); // If not match, don't add to input text
      if (isEdit == false) this.isLetterCheck = true;
      else this.isLetterEditCheck = false;
    },
    deleteStep(element) {
      return this.$showConfirm({
        message:
          this.language[this.config.currentLanguage].Steps.confirmationDelete +
          element.name,
        variant: "warning",
      }).then((confirmed) => {
        if (confirmed) this.deleteAction(element);
      });
    },
    deleteAction(element) {
      apiClient
        .delete(
          this.config.serviceBaseUrl +
            this.config.url.steps +
            "/" +
            this.currentProjectId() +
            "/" +
            element.id,
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.btnSaveEnable = false;
          const index = this.listSteps.findIndex(
            (item) => item.id == element.id,
          );
          this.listSteps.splice(index, 1);
          this.stepsLoaded = true;
          this.redirectEmptySteps();
          this.modalElem.hide();
        })
        .catch((e) => {
          this.Logout(this, e);
        });
    },
    normalizeGridResponse(responseData) {
      if (Array.isArray(responseData)) {
        return {
          rows: responseData,
          meta: {
            ...this.gridMeta,
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
          page: Number(meta.page) || this.gridQuery.page,
          pageSize: Number(meta.pageSize) || this.gridQuery.pageSize,
          total: Number.isFinite(Number(meta.total)) ? Number(meta.total) : 0,
          lastPage: Math.max(Number(meta.lastPage) || 1, 1),
          hasNextPage: Boolean(meta.hasNextPage),
          hasPreviousPage: Boolean(meta.hasPreviousPage),
        },
      };
    },
    duplicateStep(element) {
      this.getJson(element.id, element.name, element.description, true, false);
    },
    downloadStep(element) {
      this.getJson(element.id, element.name, element.description, false, true);
    },
    getJson(
      id,
      name = null,
      stepDescription = null,
      isDuplicate = false,
      isDownload = false,
    ) {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.steps +
            "/" +
            this.currentProjectId() +
            "/" +
            id,
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          if (isDuplicate == false) {
            if (isDownload == false) {
              this.jsonResumeNameSelected = name;
              this.stepEditDescription = response.data.description;
              this.stepEditNameFile = response.data.name;
              if (isDslSourcePayload(response.data.config)) {
                this.modeEditSelected = "dsl";
                this.dslEditSource = extractDslSource(response.data.config);
                this.dslEditDiagnostics = [];
                this.resumeJson = null;
                this.jsonEditSteps = null;
                this.jsonResumeSteps = null;
              } else {
                this.modeEditSelected = "wizard";
                this.resumeJson = normalizeEditableStepConfig(
                  response.data.config,
                  response.data.description || response.data.name,
                );
                this.jsonEditSteps = this.resumeJson;
                this.jsonResumeSteps = this.resumeJson;
                this.syncEditWizardJson();
              }
              this.idResume = id;
              this.modalElem.show();
            } else {
              download.file(
                response.data.name + ".json",
                response.data.config,
                "application/json",
              );
            }
          } else {
            this.openTab("new");
            this.loadJsonToEdit = JSON.parse(response.data.config);
            this.jsonSteps = this.loadJsonToEdit;
            this.stepDescription = stepDescription + "(copy)";
            this.stepNameFile = name + "_copy";
            this.idResume = null;
            this.syncWizardJson();
          }
        })
        .catch((e) => {
          this.Logout(this, e);
        });
    },
    getSteps() {
      this.emitter.emit("showLoader", true);
      this.stepGridLoading = true;
      if (
        this.currentProjectId() === null ||
        this.currentProjectId() === undefined
      ) {
        this.emitter.emit("showLoader", false);
        this.stepGridLoading = false;
        return false;
      }
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.steps +
            "/" +
            this.currentProjectId(),
          {
            headers: this.setHeaders(),
            params: this.gridQuery,
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          const result = this.normalizeGridResponse(response.data);
          this.listSteps = result.rows;
          this.gridMeta = result.meta;
          this.stepsLoaded = true;
          this.redirectEmptySteps();
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        })
        .finally(() => {
          this.stepGridLoading = false;
          this.emitter.emit("showLoader", false);
        });
    },
    changeJson(json) {
      this.jsonSteps = json;
    },
    syncJson: function (json) {
      this.loadJsonToEdit = json;
      this.jsonSteps = json;
    },
    syncEditJson: function (json) {
      this.loadEditJsonToEdit = json;
      this.jsonEditSteps = json;
      this.jsonResumeSteps = json;
      this.btnSaveEnable = true;
    },
    changeJsonResume: function (json) {
      this.jsonResumeSteps = json;
      this.btnSaveEnable = true;
    },
    saveStep() {
      let regex = RegExp("[-*#+=;:\/,~ \.\$ ]+");
      if (this.jsonSteps == null) {
        this.jsonSteps = this.defaultJson;
      }
      const stepConfig = this.currentStepConfigForSave();
      if (stepConfig === null) return false;
      if (this.stepDescription.length == 0 || this.stepNameFile.length == 0) {
        this.$showAlert({
          message:
            this.language[this.config.currentLanguage].Steps
              .errorMessageInputEmpty,
          variant: "warning",
        });
        return false;
      }
      if (regex.test(this.stepNameFile)) {
        this.$showAlert({
          message:
            this.language[this.config.currentLanguage].Steps
              .errorCharactersError,
          variant: "warning",
        });
        return false;
      }
      this.emitter.emit("showLoader", true);
      apiClient
        .post(
          this.config.serviceBaseUrl + this.config.url.steps,
          buildStepPayload({
            description: this.stepDescription,
            name: this.stepNameFile,
            config: stepConfig,
            projectId: this.currentProjectId(),
          }),
          {
            headers: this.setHeaders(),
          },
        )
        .then(() => {
          this.stepsLoaded = true;
          this.stepDescription = "";
          this.stepNameFile = "";
          this.jsonSteps = null;
          this.dslSource = 'idelium 1.0\n\ntest "smoke" {\n}\n';
          this.dslDiagnostics = [];
          //this.saveOrderSteps()
          this.isLetterCheck = false;
          this.loadJsonToEdit = this.defaultJson;
          this.emitter.emit("showLoader", false);
          return this.getSteps();
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    saveOrderSteps() {
      this.emitter.emit("showLoader", true);
      apiClient
        .post(
          this.config.serviceBaseUrl +
            this.config.url.steps +
            "/" +
            this.currentProjectId() +
            "/updateorder",
          {
            order: this.listSteps,
            offset: (this.gridQuery.page - 1) * this.gridQuery.pageSize,
          },
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.btnSaveOrderDisabled = true;
        })
        .catch((e) => {
          this.Logout(this, e);
        });
    },
    updateStep() {
      const stepConfig = this.currentStepConfigForUpdate();
      if (stepConfig === null) return false;
      this.emitter.emit("showLoader", true);
      apiClient
        .put(
          this.config.serviceBaseUrl +
            this.config.url.steps +
            "/" +
            this.currentProjectId() +
            "/" +
            this.idResume,
          {
            description: this.stepEditDescription.toLowerCase(),
            name: this.stepEditNameFile.toLowerCase(),
            config: JSON.stringify(stepConfig),
          },
          {
            headers: this.setHeaders(),
          },
        )
        .then(() => {
          this.btnSaveEnable = false;
          this.modalElem.hide();
          this.stepsLoaded = true;
          this.emitter.emit("showLoader", false);
          return this.getSteps();
        })
        .catch();
    },
  },
};
</script>
