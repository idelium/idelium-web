<template>
  <nav class="plugins-tabs-container">
    <div class="nav nav-tabs" id="nav-tab" role="tablist">
      <button
        :class="tabButtonClass('list')"
        id="nav-home-tab"
        type="button"
        role="tab"
        aria-controls="nav-home"
        :aria-selected="isActiveTab('list')"
        :disabled="isPluginListDisabled"
        v-on:click="
          openTab('list');
          listPlugin();
        "
      >
        {{ language[config.currentLanguage].Plugins.tabListPlugins }}
      </button>
      <button
        :class="tabButtonClass('new')"
        ref="tab2"
        id="nav-newplugin-tab"
        type="button"
        role="tab"
        aria-controls="nav-newplugin"
        :aria-selected="isActiveTab('new')"
        v-on:click="
          openTab('new');
          newPlugin();
        "
      >
        {{ language[config.currentLanguage].Plugins.tabNewPlugin }}
      </button>
      <button
        :class="tabButtonClass('import')"
        id="nav-import-tab"
        ref="test"
        type="button"
        role="tab"
        aria-controls="nav-import"
        :aria-selected="isActiveTab('import')"
        v-on:click="openTab('import')"
      >
        {{ language[config.currentLanguage].Plugins.tabTitleImportPlugin }}
      </button>
    </div>
  </nav>
  <div class="tab-content" id="pills-tabContent">
    <div
      :class="tabPaneClass('list')"
      id="nav-home"
      role="tabpanel"
      aria-labelledby="home-tab"
    >
      <!-- start home tab -->
      <EnterpriseListingGrid
        v-model:search="pluginSearch"
        class="idelium-tab-grid"
        :accessible-label="pluginCopy.listTitle"
        :actions="pluginActions"
        :columns="pluginColumns"
        :error="error"
        :has-active-filters="pluginGridQuery.search !== ''"
        :listing-copy="pluginCopy"
        :loading="pluginGridLoading"
        :meta="pluginGridMeta"
        :rows="displayPlugins"
        :sort="pluginSort"
        :table-copy="pluginTableCopy"
        v-on:action="handlePluginAction"
        v-on:clear-filters="clearPluginSearch"
        v-on:page-change="changePluginPage"
        v-on:retry="listPlugin"
        v-on:row-activate="openPlugin"
        v-on:search="schedulePluginSearch"
        v-on:sort="sortPlugins"
      />
      <!-- end home tab -->
    </div>
    <div
      :class="tabPaneClass('new')"
      id="nav-newplugin"
      role="tabpanel"
      aria-labelledby="newplugin-tab"
    >
      <!-- start newplugin tab -->
      <div class="row plugins-new-toolbar">
        <div class="col-12 col-lg-4">
          <input
            v-model="descriptionNewFile"
            placeholder="name of plugin"
            class="form-control plugins-new-control"
          />
        </div>
        <div class="col-12 col-lg">
          <input
            v-model="nameNewFile"
            placeholder="name of plugin"
            class="form-control plugins-new-control"
            v-on:keypress="isLetter($event)"
            :disabled="descriptionNewFile.length == 0"
          />
        </div>
        <div class="col-12 col-lg-auto">
          <button
            type="button"
            class="btn btn-success btn-sm plugins-save-button"
            v-on:click="savePlugin(nameNewFile, textNew, descriptionNewFile)"
            :disabled="
              descriptionNewFile.length == 0 || nameNewFile.length == 0
            "
          >
            Save
          </button>
        </div>
      </div>
      <div class="row plugins-editor-row">
        <div class="col plugins-editor-column">
          <v-ace-editor
            v-model:value="textNew"
            class="plugins-code-editor"
            lang="python"
            theme="chrome"
            v-if="showEditor == true"
          />
        </div>
      </div>
      <!-- end newplugin tab -->
    </div>
    <div
      :class="tabPaneClass('import')"
      id="nav-import"
      role="tabpanel"
      aria-labelledby="import-tab"
    >
      <!-- start import tab -->
      <importplugin ref="selenium" v-on:importPlugin="importPlugin" />
      <!-- end import tab -->
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
          <h5 class="modal-title" id="exampleModalLabel">{{ titleModal }}</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <v-ace-editor
            v-model:value="textPlugin"
            lang="python"
            theme="chrome"
            style="height: 300px"
            v-if="showEditorResume == true"
          />
          <p></p>
          <p></p>
          <div class="footer-modal">
            <button
              type="button"
              class="btn btn-danger"
              size="sm"
              style="float: right"
              v-on:click="updatePlugin(textPlugin)"
            >
              {{ language[config.currentLanguage].Plugins.btnSave }}
            </button>
            <button
              type="button"
              variant="seconday"
              size="sm"
              v-on:click="modalElem.hide()"
            >
              {{ language[config.currentLanguage].Plugins.btnCancel }}
            </button>
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
  max-height: 80%;
  margin: 0;
}
.modal-fullscreen2 .modal-content {
  width: calc(100% - 3rem);
  min-height: 50%;
  height: auto;
  margin: 1rem;
}
.buttons {
  margin-top: 35px;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.plugins-tabs-container {
  margin: 0 auto;
  max-width: 1280px;
  width: 100%;
}

.plugins-new-toolbar {
  --bs-gutter-x: 1rem;
  --bs-gutter-y: 1rem;
  align-items: end;
  flex: 0 0 auto;
  margin-bottom: 1rem;
}

.plugins-new-control {
  height: 3rem;
  margin: 0;
}

.plugins-save-button {
  height: 2.5rem;
  min-width: 7rem;
}

.plugins-approval-badge {
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  padding: 0.35rem 0.65rem;
  text-transform: uppercase;
}

.plugins-approval-badge--success {
  background: rgba(31, 122, 66, 0.22);
  color: #57d68d;
}

.plugins-approval-badge--warning {
  background: rgba(196, 126, 9, 0.22);
  color: #ffbe5c;
}

.plugins-approval-badge--danger {
  background: rgba(197, 48, 48, 0.22);
  color: #ff7a7a;
}

.plugins-approval-hash {
  color: rgba(255, 255, 255, 0.58);
  display: block;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  margin-top: 0.25rem;
}

.plugins-editor-row {
  --bs-gutter-x: 0;
  min-height: 0;
}

.plugins-editor-column {
  min-height: 0;
}

.plugins-code-editor {
  border-radius: 0.9rem;
  height: clamp(22rem, calc(100vh - 31rem), 42rem);
  height: clamp(22rem, calc(100dvh - 31rem), 42rem);
  min-height: 0;
  overflow: hidden;
  width: 100%;
}

@media only screen and (max-width: 760px) {
  .plugins-code-editor {
    height: clamp(20rem, calc(100vh - 27rem), 34rem);
    height: clamp(20rem, calc(100dvh - 27rem), 34rem);
  }
}
</style>

<script>
import EnterpriseListingGrid from "@/components/grid/EnterpriseListingGrid.vue";
import apiClient from "@/services/apiClient";
import {
  isGridRouteQueryKey,
  parseGridResponse,
  parseGridRouteQuery,
  serializeGridRouteQuery,
} from "@/domain/enterpriseGrid";
import { getSelectedProjectId } from "@/stores/session";
import { Modal } from "bootstrap";
import { VAceEditor } from "vue3-ace-editor";

import importplugin from "./plugin/importPlugin.vue";
import download from "@/shared/download";
import { routableTabs } from "@/shared/routableTabs";
import { pluginApprovalView, shortPluginHash } from "@/domain/pluginManifest";

const PLUGIN_SORTS = ["id", "name", "description", "created_at", "updated_at"];

export default {
  name: "PluginsComponent",
  inheritAttrs: false,
  mixins: [routableTabs("list", ["list", "new", "import"])],
  data: () => {
    return {
      modalElem: null,
      error: null,
      enabled: true,
      listPlugins: [],
      dragging: false,
      jsonSteps: null,
      jsonResumeSteps: null,
      jsoneditorModal: false,
      resumeJson: null,
      textNew: "new",
      jsonResumeNameSelected: null,
      btnSaveEnable: false,
      lang: "python",
      textPlugin: "test",
      stepDescription: null,
      stepNameFile: null,
      showEditor: false,
      showEditorResume: false,
      nameNewFile: "",
      descriptionNewFile: "",
      titleModal: "",
      pluginSelected: null,
      tabIndex: 0,
      pluginsLoaded: false,
      pluginGridLoading: false,
      pluginGridMeta: {
        page: 1,
        pageSize: 25,
        total: 0,
        lastPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      pluginGridQuery: {
        page: 1,
        pageSize: 25,
        search: "",
        sort: "created_at",
        direction: "asc",
      },
      pluginSearch: "",
      pluginSearchTimer: null,
      updatingPluginRoute: false,
    };
  },
  options: {},
  created() {
    this.emitter.on("refreshPlugin", (msg) => {
      if (msg == true) this.listPlugin();
      else this.$forceUpdate();
    });
  },
  computed: {
    pluginCopy() {
      return this.language[this.config.currentLanguage].Plugins;
    },
    pluginTableCopy() {
      return this.language[this.config.currentLanguage].DataTable;
    },
    pluginColumns() {
      return [
        {
          key: "name",
          label: this.pluginCopy.name,
          required: true,
          sortable: true,
        },
        {
          key: "description",
          label: this.pluginCopy.description,
          sortable: true,
        },
        {
          key: "approvalLabel",
          label: this.pluginCopy.approval,
          type: "status",
        },
        {
          key: "sourceHash",
          label: this.pluginCopy.integrity,
          type: "technical",
        },
      ];
    },
    pluginActions() {
      const actions = this.language[this.config.currentLanguage].Actions;
      return [
        { id: "edit", label: actions.edit },
        { id: "download", label: actions.download },
        { id: "delete", label: actions.delete, variant: "danger" },
      ];
    },
    displayPlugins() {
      return this.listPlugins.map((plugin) => ({
        ...plugin,
        approvalLabel: this.pluginApproval(plugin).label,
        sourceHash: this.shortPluginHash(plugin),
      }));
    },
    pluginSort() {
      return {
        field: this.pluginGridQuery.sort,
        direction: this.pluginGridQuery.direction,
      };
    },
    isPluginListDisabled() {
      return this.pluginsLoaded && this.listPlugins.length === 0;
    },
  },
  watch: {
    $route() {
      this.page = 0;
      if (!this.updatingPluginRoute && this.restorePluginQuery()) {
        this.listPlugin();
      }
      this.$forceUpdate();
    },
  },
  mounted() {
    this.restorePluginQuery();
    this.modalElem = new Modal(document.getElementById("myModal"));
    this.listPlugin();
  },
  beforeUnmount() {
    clearTimeout(this.pluginSearchTimer);
  },
  methods: {
    restorePluginQuery() {
      const parsed = parseGridRouteQuery(this.$route?.query || {}, {
        allowedSorts: PLUGIN_SORTS,
      });
      const next = {
        page: parsed.page,
        pageSize: parsed.pageSize,
        search: parsed.search,
        sort: parsed.sort?.field || "created_at",
        direction: parsed.sort?.direction || "asc",
      };
      const changed =
        JSON.stringify(next) !== JSON.stringify(this.pluginGridQuery);
      this.pluginGridQuery = next;
      this.pluginSearch = parsed.search;
      return changed;
    },
    async updatePluginRoute(changes) {
      const next = { ...this.pluginGridQuery, ...changes };
      if (
        changes.search !== undefined ||
        changes.sort !== undefined ||
        changes.direction !== undefined
      ) {
        next.page = 1;
      }
      this.pluginGridQuery = next;
      if (this.$router && this.$route) {
        const preserved = Object.fromEntries(
          Object.entries(this.$route.query || {}).filter(
            ([key]) => !isGridRouteQueryKey(key),
          ),
        );
        this.updatingPluginRoute = true;
        try {
          await this.$router.replace({
            query: {
              ...preserved,
              ...serializeGridRouteQuery(
                {
                  ...next,
                  sort: { field: next.sort, direction: next.direction },
                },
                { allowedSorts: PLUGIN_SORTS },
              ),
            },
          });
        } finally {
          this.updatingPluginRoute = false;
        }
      }
      return this.listPlugin();
    },
    schedulePluginSearch(value) {
      clearTimeout(this.pluginSearchTimer);
      this.pluginSearchTimer = setTimeout(() => {
        this.pluginSearchTimer = null;
        this.updatePluginRoute({ search: value });
      }, 250);
    },
    clearPluginSearch() {
      this.pluginSearch = "";
      return this.updatePluginRoute({ search: "" });
    },
    changePluginPage(page) {
      return this.updatePluginRoute({ page: Math.max(Number(page) || 1, 1) });
    },
    sortPlugins(sort) {
      return this.updatePluginRoute({
        sort: sort.field,
        direction: sort.direction,
      });
    },
    pluginIndex(plugin) {
      return this.listPlugins.findIndex(
        (item) => String(item.id) === String(plugin.id),
      );
    },
    openPlugin(plugin) {
      return this.getPlugin(plugin.id, plugin.name, false);
    },
    handlePluginAction({ action, row }) {
      const index = this.pluginIndex(row);
      if (action === "edit") this.openPlugin(row);
      if (action === "download") this.downloadPlugin(index);
      if (action === "delete") this.deletePlugin(index);
    },
    onRoutableTabChange(tab) {
      if (tab === "new" && this.textNew === "new") this.newPlugin();
    },
    redirectEmptyPlugins() {
      if (this.isPluginListDisabled && this.isActiveTab("list")) {
        this.openTab("new");
      }
    },
    importPlugin(value) {
      this.showEditor = false;
      this.textNew = value;
      this.tabIndex = 1;
      this.openTab("new");
      setTimeout(
        function () {
          this.showEditor = true;
          this.$wkToast(
            this.language[this.config.currentLanguage].Plugins.pluginImported,
          );
        }.bind(this),
        100,
      );
    },
    isLetter(e) {
      let char = String.fromCharCode(e.keyCode); // Get the character
      if (/^[A-Za-z]+$/.test(char) || char == "_" || char == "-") return true;
      // Match with regex
      else e.preventDefault(); // If not match, don't add to input text
    },
    newPlugin() {
      this.showEditor = false;
      this.textNew = this.config.pluginTemplate;
      setTimeout(
        function () {
          this.showEditor = true;
        }.bind(this),
        100,
      );
    },
    downloadPlugin(index) {
      this.getPlugin(
        this.listPlugins[index].id,
        this.listPlugins[index].name,
        true,
      );
    },
    getPlugin(id, name, isDownload = false) {
      this.showEditorResume = false;
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.plugins +
            "/" +
            getSelectedProjectId() +
            "/" +
            id,
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.textPlugin = JSON.parse(response.data.code)[0];
          this.titleModal = name;
          if (isDownload == false) {
            this.pluginSelected = id;
            this.modalElem.show();
            setTimeout(
              function () {
                this.showEditorResume = true;
              }.bind(this),
              100,
            );
          } else {
            download.file(name + ".py", this.textPlugin, "text/plain");
          }
        })
        .catch((e) => {
          this.error = e;
        });
    },
    pluginApproval(plugin) {
      return pluginApprovalView(
        plugin,
        this.language[this.config.currentLanguage].Plugins.approvalStates,
      );
    },
    shortPluginHash(plugin) {
      return shortPluginHash(plugin);
    },
    deletePlugin(index) {
      return this.$showConfirm({
        message:
          this.language[this.config.currentLanguage].Plugins
            .confirmationDelete +
          this.listPlugins[index].name +
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
            this.config.url.plugins +
            "/" +
            getSelectedProjectId() +
            "/" +
            this.listPlugins[index].id,
          {
            headers: this.setHeaders(),
          },
        )
        .then(() => {
          this.emitter.emit("showLoader", false);
          this.pluginsLoaded = true;
          return this.listPlugin();
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    savePlugin(filename, code, description) {
      this.emitter.emit("showLoader", true);
      apiClient
        .post(
          this.config.serviceBaseUrl + this.config.url.plugins,
          {
            name: filename,
            code: [code],
            description: description,
            idProject: getSelectedProjectId(),
          },
          {
            headers: this.setHeaders(),
          },
        )
        .then(() => {
          this.emitter.emit("showLoader", false);
          this.pluginsLoaded = true;
          this.descriptionNewFile = "";
          this.nameNewFile = "";
          return this.listPlugin();
        })
        .catch((e) => {
          //this.Logout(this)
          this.error = e;
        });
    },
    updatePlugin(code) {
      this.emitter.emit("showLoader", true);
      apiClient
        .put(
          this.config.serviceBaseUrl +
            this.config.url.plugins +
            "/" +
            getSelectedProjectId() +
            "/" +
            this.pluginSelected,
          {
            code: [code],
          },
          {
            headers: this.setHeaders(),
          },
        )
        .then(
          () => {
            this.emitter.emit("showLoader", false);
            this.pluginsLoaded = true;
            this.jsoneditorModal = false;
            this.descriptionNewFile = "";
            this.nameNewFile = "";
            return this.listPlugin();
          },
          {
            headers: {
              Accept: "application/json",
            },
          },
        )
        .catch((e) => {
          //this.Logout(this)
          this.error = e;
        });
    },
    listPlugin() {
      this.emitter.emit("showLoader", true);
      this.pluginGridLoading = true;
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.plugins +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
            params: this.pluginGridQuery,
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          const result = parseGridResponse(response);
          this.listPlugins = result.rows;
          this.pluginGridMeta = {
            ...result.meta,
            lastPage: Math.max(
              Math.ceil(result.meta.total / result.meta.pageSize),
              1,
            ),
          };
          this.pluginsLoaded = true;
          this.redirectEmptyPlugins();
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        })
        .finally(() => {
          this.pluginGridLoading = false;
          this.emitter.emit("showLoader", false);
        });
    },
  },
  components: {
    EnterpriseListingGrid,
    VAceEditor,
    importplugin,
  },
};
</script>
