<template>
  <div>
    <nav>
      <div class="nav nav-tabs" id="nav-tab" role="tablist">
        <button
          :class="tabButtonClass('order')"
          id="nav-home-tab"
          type="button"
          role="tab"
          aria-controls="nav-home"
          :aria-selected="isActiveTab('order')"
          :disabled="isEnvironmentOrderTabDisabled"
          v-on:click="openTab('order')"
        >
          {{
            language[config.currentLanguage].Environments.tabOrderEnvironments
          }}
        </button>
        <button
          :class="tabButtonClass('new')"
          id="nav-newenv-tab"
          ref="tab2"
          type="button"
          role="tab"
          aria-controls="nav-newenv"
          :aria-selected="isActiveTab('new')"
          v-on:click="openTab('new')"
        >
          {{ language[config.currentLanguage].Environments.tabNewEnvironment }}
        </button>
      </div>
    </nav>
    <div class="tab-content" id="pills-tabContent">
      <div
        :class="tabPaneClass('order')"
        id="nav-home"
        role="tabpanel"
        aria-labelledby="home-tab"
      >
        <!--start content tab --->
        <EnterpriseListingGrid
          v-model:search="environmentSearch"
          class="idelium-tab-grid"
          :accessible-label="environmentCopy.listTitle"
          :actions="environmentActions"
          :columns="environmentColumns"
          :error="error"
          :has-active-filters="environmentGridQuery.search !== ''"
          :listing-copy="environmentCopy"
          :loading="environmentGridLoading"
          :meta="environmentGridMeta"
          :rows="listEnvironments"
          :sort="environmentSort"
          :table-copy="environmentTableCopy"
          v-on:action="handleEnvironmentAction"
          v-on:clear-filters="clearEnvironmentSearch"
          v-on:page-change="changeEnvironmentPage"
          v-on:retry="getEnvironments"
          v-on:row-activate="openEnvironment"
          v-on:search="scheduleEnvironmentSearch"
          v-on:sort="sortEnvironments"
        />
        <!-- end content tab -->
      </div>
      <div
        :class="tabPaneClass('new')"
        id="nav-newenv"
        role="tabpanel"
        aria-labelledby="newenv-tab"
      >
        <!-- start content tab -->
        <section class="idelium-environment-form">
          <div class="idelium-environment-form__header">
            <div>
              <span class="idelium-environment-form__eyebrow">
                {{ language[config.currentLanguage].Environments.formEyebrow }}
              </span>
              <h2>
                {{ language[config.currentLanguage].Environments.formTitle }}
              </h2>
              <p>
                {{
                  language[config.currentLanguage].Environments.formDescription
                }}
              </p>
            </div>
            <button
              type="button"
              class="btn btn-success btn-sm idelium-environment-form__save"
              v-on:click="savePreSave(true)"
              :disabled="isEnvironmentSaveDisabled"
            >
              <font-awesome-icon icon="plus" />
              {{
                language[config.currentLanguage].Environments.btnSaveEnvironment
              }}
            </button>
          </div>

          <div class="idelium-environment-form__grid">
            <div class="idelium-environment-form__field">
              <label class="form-label" for="environment-description">
                {{
                  language[config.currentLanguage].Environments
                    .environmentDescriptionLabel
                }}
              </label>
              <input
                id="environment-description"
                v-model="environmentDescription"
                type="text"
                class="form-control"
                :placeholder="
                  language[config.currentLanguage].Environments
                    .placeholderDescriptionEnvironment
                "
              />
              <div class="form-text">
                {{
                  language[config.currentLanguage].Environments
                    .environmentDescriptionHelp
                }}
              </div>
            </div>
            <div class="idelium-environment-form__field">
              <label class="form-label" for="environment-code">
                {{
                  language[config.currentLanguage].Environments
                    .environmentCodeLabel
                }}
              </label>
              <input
                id="environment-code"
                v-model="environmentNameFile"
                type="text"
                class="form-control"
                :placeholder="
                  language[config.currentLanguage].Environments
                    .placeholderFileName
                "
                :disabled="environmentDescription.length == 0"
              />
              <div class="form-text">
                {{
                  language[config.currentLanguage].Environments
                    .environmentCodeHelp
                }}
              </div>
            </div>
            <div class="idelium-environment-form__field">
              <label class="form-label" for="environment-template">
                {{
                  language[config.currentLanguage].Environments
                    .environmentTypeLabel
                }}
              </label>
              <select
                id="environment-template"
                class="form-select"
                v-model="skeletonJsonType"
                @change="changeSkeleton(skeletonJsonType)"
              >
                <option value="web">
                  {{ language[config.currentLanguage].Environments.typeWeb }}
                </option>
                <option value="app">
                  {{ language[config.currentLanguage].Environments.typeApp }}
                </option>
                <option value="webservice">
                  {{
                    language[config.currentLanguage].Environments.typeWebservice
                  }}
                </option>
              </select>
              <div class="form-text">
                {{
                  language[config.currentLanguage].Environments
                    .environmentTypeHelp
                }}
              </div>
            </div>
          </div>

          <div class="idelium-environment-form__builder">
            <div class="idelium-environment-form__builder-header">
              <div>
                <span class="idelium-environment-form__eyebrow">
                  {{
                    language[config.currentLanguage].Environments.builderEyebrow
                  }}
                </span>
                <h3>
                  {{
                    language[config.currentLanguage].Environments.builderTitle
                  }}
                </h3>
              </div>
              <span class="idelium-environment-form__badge">
                {{ skeletonJsonType }}
              </span>
            </div>
            <wizard
              ref="wizard"
              v-if="modeSelected == 'wizard'"
              :json="jsonEnvironments"
              :environmentType="skeletonJsonType"
              v-on:changeWizardJson="changeWizardJson"
            />
            <json-editor
              ref="editor"
              class="idelium-environment-form__editor"
              :onChange="changeJson"
              :options="options"
              :json="loadJsonToEdit"
              v-if="modeSelected == 'json'"
            />
          </div>
        </section>
        <!-- end content tab -->
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
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div
              class="alert alert-danger"
              v-if="errorNewVersionMessage != null"
            >
              {{ errorNewVersionMessage }}
            </div>
            {{ codeSelected }}
            <json-editor
              ref="editor"
              style="height: 800px"
              :onChange="changeJsonResume"
              :options="options"
              :json="resumeJson"
            />
            <p></p>
            <p></p>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                style="color: black !important; float: left !important"
                v-on:click="hideEditorModal()"
              >
                {{ language[config.currentLanguage].Environments.btnCancel }}
              </button>
              <button
                type="button"
                class="btn btn-danger btn-sm"
                style="float: right"
                v-on:click="updateJson()"
                :disabled="btnSaveEnable == false"
              >
                {{ language[config.currentLanguage].Environments.btnSave }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.pane {
  display: inline-block;
  overflow-y: scroll;
  max-height: 600px;
  width: 100%;
}

/*.thead {
    overflow-y: scroll;
    display: inline-block;
} */

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

.idelium-environment-form {
  background:
    radial-gradient(
      circle at top right,
      rgba(255, 122, 24, 0.16),
      transparent 28rem
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0.045), transparent),
    rgba(35, 38, 49, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
  box-shadow: 0 1.4rem 3rem rgba(0, 0, 0, 0.22);
  color: #f8fafc;
  margin: 0 auto;
  padding: 1.25rem;
  width: 100%;
}

.idelium-environment-form__header {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.idelium-environment-form__eyebrow {
  color: rgba(255, 255, 255, 0.62);
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
}

.idelium-environment-form h2,
.idelium-environment-form h3 {
  color: #ffffff;
  font-family: Arial, sans-serif;
  font-weight: 900;
  letter-spacing: 0.1em;
  margin: 0;
  text-transform: uppercase;
}

.idelium-environment-form h2 {
  font-size: 1rem;
}

.idelium-environment-form h3 {
  font-size: 0.82rem;
}

.idelium-environment-form p {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  margin: 0.45rem 0 0;
  max-width: 48rem;
}

.idelium-environment-form__save {
  align-items: center;
  border-radius: 0.85rem;
  display: inline-flex;
  font-weight: 900;
  gap: 0.45rem;
  letter-spacing: 0.1em;
  min-height: 2.65rem;
  padding: 0.55rem 1rem;
  text-transform: uppercase;
  white-space: nowrap;
}

.idelium-environment-form__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.9fr) minmax(14rem, 0.7fr);
  margin-bottom: 1.25rem;
}

.idelium-environment-form__field {
  min-width: 0;
}

.idelium-environment-form .form-label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.72rem !important;
  font-weight: 800;
  letter-spacing: 0.12em !important;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
}

.idelium-environment-form .form-text {
  color: rgba(255, 255, 255, 0.56);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  margin-top: 0.45rem;
}

.idelium-environment-form__builder {
  background: rgba(12, 15, 24, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1rem;
}

.idelium-environment-form__builder-header {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.idelium-environment-form__badge {
  background: rgba(255, 122, 24, 0.14);
  border: 1px solid rgba(255, 122, 24, 0.34);
  border-radius: 999px;
  color: #ffb36f;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  padding: 0.35rem 0.7rem;
  text-transform: uppercase;
}

.idelium-environment-form__editor {
  height: min(42rem, 58vh);
}

@media (max-width: 1100px) {
  .idelium-environment-form__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .idelium-environment-form__header,
  .idelium-environment-form__builder-header {
    align-items: stretch;
    flex-direction: column;
  }

  .idelium-environment-form__save {
    justify-content: center;
    width: 100%;
  }
}
</style>

<script>
import { Modal, Button } from "bootstrap";
import EnterpriseListingGrid from "@/components/grid/EnterpriseListingGrid.vue";
import JsonEditor from "../components/JsonEditor.vue";
import apiClient from "@/services/apiClient";
import {
  isGridRouteQueryKey,
  parseGridResponse,
  parseGridRouteQuery,
  serializeGridRouteQuery,
} from "@/domain/enterpriseGrid";
import { getSelectedProjectId } from "@/stores/session";
import { buildEnvironmentPayload } from "@/domain/workflowPayloads";
import { hideModalSafely } from "@/shared/bootstrapModal";
//import draggable from 'vuedraggable'
import download from "@/shared/download";
import { routableTabs } from "@/shared/routableTabs";
import wizard from "./environments/wizard.vue";
import param from "./environments/environmentsParameter";

const ENVIRONMENT_SORTS = [
  "id",
  "code",
  "description",
  "created_at",
  "updated_at",
];

export default {
  name: "EnvironmentsComponent",
  inheritAttrs: false,
  mixins: [routableTabs("order", ["order", "new"])],
  data: () => {
    return {
      enabled: true,
      error: null,
      listEnvironments: [],
      environmentsLoaded: false,
      modalElem: null,
      buttonElem: null,
      wizardGenerateTimer: null,
      wizardRestoreTimer: null,
      dragging: false,
      jsonEnvironments: null,
      jsonResumeEnvironments: null,
      jsoneditorModal: false,
      resumeJson: null,
      jsonResumeNameSelected: null,
      btnSaveEnable: false,
      options: {
        mode: "code",
        modes: ["tree", "code"],
      },
      modeOptions: [
        { text: "wizard", value: "wizard" },
        { text: "json editor", value: "json" },
      ],
      modeSelected: "wizard",
      environmentDescription: "",
      environmentNameFile: "",
      loadJsonToEdit: "",
      errorNewVersionMessage: null,
      environmentGridLoading: false,
      environmentGridMeta: {
        page: 1,
        pageSize: 25,
        total: 0,
        lastPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      environmentGridQuery: {
        page: 1,
        pageSize: 25,
        search: "",
        sort: "created_at",
        direction: "asc",
      },
      environmentSearch: "",
      environmentSearchTimer: null,
      updatingEnvironmentRoute: false,
      skeletonJsonType: "web",
      codeSelected: null,
      defaultJson: {
        projectId: "idProject",
        environment: "BS",
        base_url: "https://example.com",
        url: "https://example.com/#/live",
        xpath_check_url: "//td[@class='lead']",
        username: "user",
        password: "password",
        userAgent: "<user agent>",
        browser: "chrome",
        device: "Nexus 5",
        deviceType: "Smartphone",
        accept_self_certificate: true,
      },
      defaultAppJson: {
        projectId: "id project",
        environment: "environment",
        os: "android",
        appiumServer: "http://localhost:4723/wd/hub",
        appiumDesiredCaps: {
          uiautomator2ServerInstallTimeout: 100000,
          androidInstallTimeout: 100000,
          platformName: "<platform Android or iOS>",
          platformVersion: "for example 8.1",
          deviceName: "Android Emulator",
          appPackage: "for example it.idelium.app.name.dev",
          app: "/your_build_path/example.(apk or ipa)",
        },
        isRealDevice: true,
        idJsonSelected: null,
      },
    };
  },
  options: {},
  computed: {
    environmentCopy() {
      return this.language[this.config.currentLanguage].Environments;
    },
    environmentTableCopy() {
      return this.language[this.config.currentLanguage].DataTable;
    },
    environmentColumns() {
      return [
        {
          key: "id",
          label: this.environmentCopy.id,
          required: true,
          sortable: true,
          type: "technical",
        },
        {
          key: "code",
          label: this.environmentCopy.code,
          required: true,
          sortable: true,
        },
        {
          key: "description",
          label: this.environmentCopy.description,
          sortable: true,
        },
      ];
    },
    environmentActions() {
      const actions = this.language[this.config.currentLanguage].Actions;
      return [
        { id: "edit", label: actions.edit },
        { id: "duplicate", label: actions.duplicate },
        { id: "download", label: actions.download },
        { id: "delete", label: actions.delete, variant: "danger" },
      ];
    },
    environmentSort() {
      return {
        field: this.environmentGridQuery.sort,
        direction: this.environmentGridQuery.direction,
      };
    },
    strippedContent() {
      let regex = /(<([^>]+)>)/gi;
      return this.comment.content.rendered.replace(regex, "");
    },
    draggingInfo() {
      return this.dragging ? "under drag" : "";
    },
    isEnvironmentOrderTabDisabled() {
      return this.environmentsLoaded && this.listEnvironments.length === 0;
    },
    isEnvironmentSaveDisabled() {
      return (
        this.environmentDescription.length == 0 ||
        this.environmentNameFile.length == 0
      );
    },
  },
  watch: {
    $route() {
      this.page = 0;
      if (!this.updatingEnvironmentRoute && this.restoreEnvironmentQuery()) {
        this.getEnvironments();
      }
      this.$forceUpdate();
    },
  },
  mounted() {
    this.restoreEnvironmentQuery();
    this.modalElem = new Modal(document.getElementById("myModal"));
    this.buttonElem = new Button(document.getElementById("nav-newenv-tab"));
    this.getEnvironments();
    this.wizardGenerateTimer = setTimeout(() => {
      this.$refs.wizard?.generateJson(null);
      this.wizardGenerateTimer = null;
    }, 100);
  },
  beforeUnmount() {
    clearTimeout(this.wizardGenerateTimer);
    clearTimeout(this.wizardRestoreTimer);
    clearTimeout(this.environmentSearchTimer);
  },
  created() {
    this.emitter.on("refreshEnvironment", (msg) => {
      if (msg == true) this.getEnvironments();
      else this.$forceUpdate();
    });
  },
  methods: {
    restoreEnvironmentQuery() {
      const parsed = parseGridRouteQuery(this.$route?.query || {}, {
        allowedSorts: ENVIRONMENT_SORTS,
      });
      const next = {
        page: parsed.page,
        pageSize: parsed.pageSize,
        search: parsed.search,
        sort: parsed.sort?.field || "created_at",
        direction: parsed.sort?.direction || "asc",
      };
      const changed =
        JSON.stringify(next) !== JSON.stringify(this.environmentGridQuery);
      this.environmentGridQuery = next;
      this.environmentSearch = parsed.search;
      return changed;
    },
    async updateEnvironmentRoute(changes) {
      const next = { ...this.environmentGridQuery, ...changes };
      if (
        changes.search !== undefined ||
        changes.sort !== undefined ||
        changes.direction !== undefined
      ) {
        next.page = 1;
      }
      this.environmentGridQuery = next;
      if (this.$router && this.$route) {
        const preserved = Object.fromEntries(
          Object.entries(this.$route.query || {}).filter(
            ([key]) => !isGridRouteQueryKey(key),
          ),
        );
        this.updatingEnvironmentRoute = true;
        try {
          await this.$router.replace({
            query: {
              ...preserved,
              ...serializeGridRouteQuery(
                {
                  ...next,
                  sort: { field: next.sort, direction: next.direction },
                },
                { allowedSorts: ENVIRONMENT_SORTS },
              ),
            },
          });
        } finally {
          this.updatingEnvironmentRoute = false;
        }
      }
      return this.getEnvironments();
    },
    scheduleEnvironmentSearch(value) {
      clearTimeout(this.environmentSearchTimer);
      this.environmentSearchTimer = setTimeout(() => {
        this.environmentSearchTimer = null;
        this.updateEnvironmentRoute({ search: value });
      }, 250);
    },
    clearEnvironmentSearch() {
      this.environmentSearch = "";
      return this.updateEnvironmentRoute({ search: "" });
    },
    changeEnvironmentPage(page) {
      return this.updateEnvironmentRoute({
        page: Math.max(Number(page) || 1, 1),
      });
    },
    sortEnvironments(sort) {
      return this.updateEnvironmentRoute({
        sort: sort.field,
        direction: sort.direction,
      });
    },
    environmentIndex(environment) {
      return this.listEnvironments.findIndex(
        (item) => String(item.id) === String(environment.id),
      );
    },
    openEnvironment(environment) {
      return this.getJson(environment.id, environment.code);
    },
    handleEnvironmentAction({ action, row }) {
      const index = this.environmentIndex(row);
      if (action === "edit") this.openEnvironment(row);
      if (action === "duplicate") this.duplicateEnvironment(index);
      if (action === "download") this.downloadEnvironment(index);
      if (action === "delete") this.deleteEnvironment(index);
    },
    redirectEmptyEnvironments() {
      if (this.isEnvironmentOrderTabDisabled && this.isActiveTab("order")) {
        this.openTab("new");
      }
    },
    changeViewMode() {
      if (this.modeSelected == "wizard") {
        clearTimeout(this.wizardRestoreTimer);
        this.wizardRestoreTimer = setTimeout(() => {
          this.$refs.wizard?.putJson(this.rememberJson);
          this.wizardRestoreTimer = null;
        }, 100);
      }
    },
    isLetter(e) {
      let char = String.fromCharCode(e.keyCode); // Get the character
      if (/^[A-Za-z]+$/.test(char) || char == "_" || char == "-") return true;
      // Match with regex
      else e.preventDefault(); // If not match, don't add to input text
    },
    deleteEnvironment(index) {
      return this.$showConfirm({
        message:
          this.language[this.config.currentLanguage].Environments
            .confirmationDelete +
          this.listEnvironments[index].code +
          " ?",
        variant: "warning",
      }).then((confirmed) => {
        if (confirmed) this.deleteAction(index);
      });
    },
    deleteAction(index) {
      this.emitter.emit("showLoader", true);
      apiClient
        .delete(
          this.config.serviceBaseUrl +
            this.config.url.environments +
            "/" +
            getSelectedProjectId() +
            "/" +
            this.listEnvironments[index].id,
          {
            headers: this.setHeaders(),
          },
        )
        .then(() => {
          this.btnSaveEnable = false;
          this.environmentsLoaded = true;
          return this.getEnvironments();
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    duplicateEnvironment(index) {
      this.getJson(
        this.listEnvironments[index].id,
        this.listEnvironments[index].code,
        this.listEnvironments[index].description,
        true,
        false,
      );
    },
    downloadEnvironment(index) {
      this.getJson(
        this.listEnvironments[index].id,
        this.listEnvironments[index].code,
        this.listEnvironments[index].description,
        false,
        true,
      );
    },
    getJson(
      id,
      code = null,
      description = null,
      isDuplicate = false,
      isDownload = false,
    ) {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.environments +
            "/" +
            getSelectedProjectId() +
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
              this.jsonResumeNameSelected = id;
              this.modalElem.show();
              this.resumeJson = JSON.parse(response.data.config);
              this.idJsonSelecteds = id;
              this.codeSelected = code;
            } else {
              download.file(
                code + ".json",
                response.data.config,
                "application/json",
              );
            }
          } else {
            this.openTab("new");
            this.loadJsonToEdit = JSON.parse(response.data.config);
            this.jsonEnvironments = this.loadJsonToEdit;
            this.environmentDescription = description + "(copy)";
            this.environmentNameFile = code + "_copy";
          }
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    getEnvironments() {
      this.emitter.emit("showLoader", true);
      this.environmentGridLoading = true;
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.environments +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
            params: this.environmentGridQuery,
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          const result = parseGridResponse(response);
          this.listEnvironments = result.rows;
          this.environmentGridMeta = {
            ...result.meta,
            lastPage: Math.max(
              Math.ceil(result.meta.total / result.meta.pageSize),
              1,
            ),
          };
          this.environmentsLoaded = true;
          this.redirectEmptyEnvironments();
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        })
        .finally(() => {
          this.environmentGridLoading = false;
          this.emitter.emit("showLoader", false);
        });
    },
    changeJson: function (json) {
      this.jsonEnvironments = json;
      this.rememberJson = json;
    },
    changeWizardJson: function (json) {
      this.loadJsonToEdit = this.jsonEnvironments = json;
      this.saveJson(true);
    },
    changeJsonResume: function (json) {
      this.jsonResumeEnvironments = json;
      this.btnSaveEnable = true;
      this.saveJson(true);
    },
    savePreSave(isNew) {
      if (this.modeSelected == "json") {
        this.saveJson(isNew);
      } else {
        this.$refs.wizard.generateJson(false);
      }
    },
    hideEditorModal() {
      hideModalSafely(this.$refs.mymodal, this.modalElem);
    },
    saveJson(isNew = null) {
      let fileName = null;
      let jsonObject = null;
      if (isNew == false) {
        fileName = this.jsonResumeNameSelected;
        jsonObject = this.jsonResumeEnvironments;
      } else {
        fileName = this.environmentNameFile.toLowerCase();
        //jsonObject=this.loadJsonToEdit
        jsonObject = this.jsonEnvironments;
      }
      this.emitter.emit("showLoader", true);
      apiClient
        .post(
          this.config.serviceBaseUrl + this.config.url.environments,
          buildEnvironmentPayload({
            code: fileName,
            config: jsonObject,
            description: this.environmentDescription,
            projectId: getSelectedProjectId(),
          }),
          {
            headers: this.setHeaders(),
          },
        )
        .then(() => {
          this.emitter.emit("showLoader", false);
          this.btnSaveEnable = false;
          this.hideEditorModal();
          this.loadJsonToEdit = this.generateJson(param.selenium);

          return this.getEnvironments();
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    updateJson() {
      this.emitter.emit("showLoader", true);
      apiClient
        .put(
          this.config.serviceBaseUrl +
            this.config.url.environments +
            "/" +
            getSelectedProjectId() +
            "/" +
            this.idJsonSelecteds,
          {
            config: JSON.stringify(this.jsonResumeEnvironments),
          },
          {
            headers: this.setHeaders(),
          },
        )
        .then(
          () => {
            this.emitter.emit("showLoader", false);
            this.btnSaveEnable = false;
            this.hideEditorModal();
            this.loadJsonToEdit = this.generateJson(param.selenium);
            return this.getEnvironments();
          },
          {
            headers: this.setHeaders(),
          },
        )
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    changeSkeleton(skeleton) {
      if (skeleton == "web") {
        this.loadJsonToEdit = this.generateJson(param.selenium);
      } else if (skeleton == "webservice") {
        this.loadJsonToEdit = this.generateJson(param.webservice);
      } else {
        this.loadJsonToEdit = this.generateJson(param.appium);
      }
    },
    generateJson(json) {
      let jsonCreated = {};
      let subParameter = false;
      let jsonSub = {};
      for (let i in json) {
        if (json[i].typeName == "uiautomator2ServerInstallTimeout")
          subParameter = true;
        const defaultValue =
          json[i].type == "json"
            ? JSON.parse(JSON.stringify(json[i].default))
            : json[i].default;
        if (subParameter == true) jsonSub[json[i].typeName] = defaultValue;
        else jsonCreated[json[i].typeName] = defaultValue;
      }
      if (subParameter == true) jsonCreated["appiumDesiredCaps"] = jsonSub;
      return jsonCreated;
    },
  },
  components: {
    EnterpriseListingGrid,
    wizard,
    //draggable,
    JsonEditor,
  },
};
// @ts-ignore
</script>
