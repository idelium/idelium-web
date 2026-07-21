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
        <div class="row">
          <div class="col col-sm-1" />
          <div class="col">
            <table class="table table-striped costum">
              <thead>
                <tr>
                  <th scope="col">
                    {{ language[config.currentLanguage].Environments.id }}
                  </th>
                  <th scope="col">
                    {{ language[config.currentLanguage].Environments.code }}
                  </th>
                  <th scope="col">
                    {{
                      language[config.currentLanguage].Environments.description
                    }}
                  </th>
                  <th scope="col"></th>
                  <th scope="col"></th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                <!-- draggable v-model="listEnvironments" tag="tbody" -->
                <tr v-for="(item, index) in listEnvironments" :key="item.name">
                  <td>
                    {{ item.id }}
                  </td>
                  <td>
                    <button
                      type="button"
                      class="btn btn-link btn-sm"
                      v-on:click="getJson(item.id, item.code)"
                    >
                      {{ item.code }}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      class="btn btn-link btn-sm"
                      v-on:click="getJson(item.id, item.code)"
                    >
                      {{ item.description }}
                    </button>
                  </td>
                  <td>
                    <span
                      id="clone"
                      class="idelium-action-icon--duplicate"
                      v-on:click="duplicateEnvironment(index)"
                      :title="language[config.currentLanguage].Actions.duplicate"
                      role="button"
                      style="cursor: pointer"
                      ><font-awesome-icon
                        icon="clone"
                        class="idelium-action-icon idelium-action-icon--duplicate"
                    /></span>
                  </td>
                  <td>
                    <span
                      class="idelium-action-icon--delete"
                      v-on:click="deleteEnvironment(index)"
                      :title="language[config.currentLanguage].Actions.delete"
                      role="button"
                      style="cursor: pointer"
                      ><font-awesome-icon
                        icon="trash"
                        class="idelium-action-icon idelium-action-icon--delete"
                    /></span>
                  </td>
                  <td>
                    <span
                      class="idelium-action-icon--download"
                      v-on:click="downloadEnvironment(index)"
                      :title="language[config.currentLanguage].Actions.download"
                      role="button"
                      style="cursor: pointer"
                      ><font-awesome-icon
                        icon="download"
                        class="idelium-action-icon idelium-action-icon--download"
                    /></span>
                  </td>
                </tr>
                <!--/draggable-->
              </tbody>
            </table>
          </div>
          <div class="col-sm-1" />
        </div>
        <!-- end content tab -->
      </div>
      <div
        :class="tabPaneClass('new')"
        id="nav-newenv"
        role="tabpanel"
        aria-labelledby="newenv-tab"
      >
        <!-- start content tab -->
        <div class="row">
          <!--b-col sm="2">
                            <select v-model="modeSelected" :options="modeOptions" v-on:change="changeViewMode()" class="form-control"/>
                          </b-col-->
          <div class="col">
            <input
              v-model="environmentDescription"
              type="text"
              class="form-control"
              :placeholder="
                language[config.currentLanguage].Environments
                  .placeholderDescriptionEnvironment
              "
            />
          </div>
          <div class="col">
            <input
              v-model="environmentNameFile"
              type="text"
              class="form-control"
              :placeholder="
                language[config.currentLanguage].Environments
                  .placeholderFileName
              "
              :disabled="environmentDescription.length == 0"
            />
          </div>
          <div class="col">
            <select
              class="form-control"
              v-model="skeletonJsonType"
              @change="changeSkeleton(skeletonJsonType)"
            >
              <option value="web">Web</option>
              <option value="app">App</option>
              <option value="webservice">Webservice</option>
            </select>
          </div>
          <div class="col">
            <button
              type="button"
              class="btn btn-success btn-sm"
              style="float: right"
              v-on:click="savePreSave(true)"
              :disabled="
                environmentDescription.length == 0 ||
                environmentNameFile.length == 0
              "
            >
              {{
                language[config.currentLanguage].Environments.btnSaveEnvironment
              }}
            </button>
          </div>
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
          style="height: 800px"
          :onChange="changeJson"
          :options="options"
          :json="loadJsonToEdit"
          v-if="modeSelected == 'json'"
        />
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
</style>

<script>
import { Modal, Button } from "bootstrap";
import JsonEditor from "../components/JsonEditor.vue";
import apiClient from "@/services/apiClient";
import { getSelectedProjectId } from "@/stores/session";
import { buildEnvironmentPayload } from "@/domain/workflowPayloads";
import { hideModalSafely } from "@/shared/bootstrapModal";
//import draggable from 'vuedraggable'
import download from "@/shared/download";
import { routableTabs } from "@/shared/routableTabs";
import wizard from "./environments/wizard.vue";
import param from "./environments/environmentsParameter";

export default {
  name: "EnvironmentsComponent",
  inheritAttrs: false,
  mixins: [routableTabs("order", ["order", "new"])],
  data: () => {
    return {
      enabled: true,
      listEnvironments: [],
      environmentsLoaded: false,
      modalElem: null,
      buttonElem: null,
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
  },
  watch: {
    $route() {
      this.page = 0;
      this.$forceUpdate();
    },
  },
  mounted() {
    this.modalElem = new Modal(document.getElementById("myModal"));
    this.buttonElem = new Button(document.getElementById("nav-newenv-tab"));
    this.getEnvironments();
    setTimeout(
      function () {
        this.$refs.wizard.generateJson(null);
      }.bind(this),
      100,
    );
  },
  created() {
    this.emitter.on("refreshEnvironment", (msg) => {
      if (msg == true) this.getEnvironments();
      else this.$forceUpdate();
    });
  },
  methods: {
    redirectEmptyEnvironments() {
      if (this.isEnvironmentOrderTabDisabled && this.isActiveTab("order")) {
        this.openTab("new");
      }
    },
    changeViewMode() {
      if (this.modeSelected == "wizard") {
        setTimeout(
          function () {
            this.$refs.wizard.putJson(this.rememberJson);
          }.bind(this),
          100,
        );
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
        .then((response) => {
          this.btnSaveEnable = false;
          this.listEnvironments = response.data;
          this.environmentsLoaded = true;
          this.redirectEmptyEnvironments();
          this.emitter.emit("showLoader", false);
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
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.environments +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.listEnvironments = response.data;
          this.environmentsLoaded = true;
          this.redirectEmptyEnvironments();
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
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
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.btnSaveEnable = false;
          this.hideEditorModal();
          this.loadJsonToEdit = this.generateJson(param.selenium);

          this.listEnvironments = response.data;
          this.environmentsLoaded = true;
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
          (response) => {
            this.emitter.emit("showLoader", false);
            this.btnSaveEnable = false;
            this.hideEditorModal();
            this.loadJsonToEdit = this.generateJson(param.selenium);
            this.listEnvironments = response.data;
            this.environmentsLoaded = true;
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
        if (subParameter == true) jsonSub[json[i].typeName] = json[i].default;
        else jsonCreated[json[i].typeName] = json[i].default;
      }
      if (subParameter == true) jsonCreated["appiumDesiredCaps"] = jsonSub;
      return jsonCreated;
    },
  },
  components: {
    wizard,
    //draggable,
    JsonEditor,
  },
};
// @ts-ignore
</script>
