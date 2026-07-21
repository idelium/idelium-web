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
      <div class="row plugins-new-toolbar">
        <div class="col-sm-1" />
        <div class="col">
          <table class="table table-striped costum">
            <thead>
              <tr>
                <th scope="col">
                  {{ language[config.currentLanguage].Plugins.name }}
                </th>
                <th scope="col">
                  {{ language[config.currentLanguage].Plugins.description }}
                </th>
                <th scope="col"></th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in listPlugins" :key="item.name">
                <td>
                  <button
                    type="button"
                    class="btn btn-link btn-sm"
                    v-on:click="getPlugin(item.id, item.name, false)"
                  >
                    {{ item.name }}
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    class="btn btn-link btn-sm"
                    v-on:click="getPlugin(item.id, item.name, false)"
                  >
                    {{ item.description }}
                  </button>
                </td>
                <td>
                  <span
                    class="text-danger"
                    v-on:click="deletePlugin(index)"
                    style="cursor: pointer"
                    ><font-awesome-icon icon="trash" style="font-size: 1rem"
                  /></span>
                </td>
                <td>
                  <span
                    class="text-primary"
                    v-on:click="downloadPlugin(index)"
                    style="cursor: pointer"
                    ><font-awesome-icon icon="download" style="font-size: 1rem"
                  /></span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-sm-1" />
      </div>
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
import apiClient from "@/services/apiClient";
import { getSelectedProjectId } from "@/stores/session";
import { Modal } from "bootstrap";
import { VAceEditor } from "vue3-ace-editor";

import importplugin from "./plugin/importPlugin.vue";
import download from "@/shared/download";
import { routableTabs } from "@/shared/routableTabs";

export default {
  name: "PluginsComponent",
  inheritAttrs: false,
  mixins: [routableTabs("list", ["list", "new", "import"])],
  data: () => {
    return {
      modalElem: null,
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
    isPluginListDisabled() {
      return this.pluginsLoaded && this.listPlugins.length === 0;
    },
  },
  watch: {
    $route() {
      this.page = 0;
      this.$forceUpdate();
    },
  },
  mounted() {
    this.modalElem = new Modal(document.getElementById("myModal"));
    this.listPlugin();
  },
  methods: {
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
      //alert(this.config.timeChecksession)
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
    deletePlugin(index) {
      this.$confirm(
        this.language[this.config.currentLanguage].Plugins.confirmationDelete +
          this.listPlugins[index].name +
          " ?",
        "",
        "warning",
      ).then(() => this.deleteAction(index));
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
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.listPlugins = response.data;
          this.pluginsLoaded = true;
          this.redirectEmptyPlugins();
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
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.listPlugins = response.data;
          this.pluginsLoaded = true;
          this.descriptionNewFile = "";
          this.nameNewFile = "";
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
          (response) => {
            this.emitter.emit("showLoader", false);
            this.listPlugins = response.data;
            this.pluginsLoaded = true;
            this.jsoneditorModal = false;
            this.descriptionNewFile = "";
            this.nameNewFile = "";
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
      //alert(this.config.timeChecksession)
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.plugins +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.listPlugins = response.data;
          this.pluginsLoaded = true;
          this.redirectEmptyPlugins();
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
  },
  components: {
    VAceEditor,
    importplugin,
  },
};
</script>
