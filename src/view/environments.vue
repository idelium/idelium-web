<template>
  <div>
    <nav>
      <div class="nav nav-tabs" id="nav-tab" role="tablist">
        <button
          class="nav-link active"
          id="nav-home-tab"
          data-bs-toggle="tab"
          data-bs-target="#nav-home"
          type="button"
          role="tab"
          aria-controls="nav-home"
          :aria-selected="'false'"
        >
          {{ language[config.currentLanguage].Environments.tabOrderEnvironments }}
        </button>
        <button
          class="nav-link"
          id="nav-newenv-tab"
          data-bs-toggle="tab"
          data-bs-target="#nav-newenv"
          ref="tab2"
          type="button"
          role="tab"
          aria-controls="nav-newenv"
          :aria-selected="'true'"
        >
          {{ language[config.currentLanguage].Environments.tabNewEnvironment }}
        </button>
      </div>
    </nav>
    <div class="tab-content" id="pills-tabContent">
      <div
        class="tab-pane fade show active"
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
                <th scope="col">
                  {{ language[config.currentLanguage].Environments.id }}
                </th>
                <th scope="col">
                  {{ language[config.currentLanguage].Environments.code }}
                </th>
                <th scope="col">
                  {{ language[config.currentLanguage].Environments.description }}
                </th>
                <th scope="col"></th>
                <th scope="col"></th>
                <th scope="col"></th>
              </thead>
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
                    class="text-success"
                    v-on:click="duplicateEnvironment(index)"
                    style="cursor: pointer"
                    ><font-awesome-icon icon="clone" style="font-size: 1rem"
                  /></span>
                </td>
                <td>
                  <span
                    class="text-danger"
                    v-on:click="deleteEnvironment(index)"
                    style="cursor: pointer"
                    ><font-awesome-icon icon="trash" style="font-size: 1rem"
                  /></span>
                </td>
                <td>
                  <span
                    class="text-primary"
                    v-on:click="downloadEnvironment(index)"
                    style="cursor: pointer"
                    ><font-awesome-icon icon="download" style="font-size: 1rem"
                  /></span>
                </td>
              </tr>
              <!--/draggable-->
            </table>
          </div>
          <div class="col-sm-1" />
        </div>
        <!-- end content tab -->
      </div>
      <div class="tab-pane fade" id="nav-newenv" role="tabpanel" aria-labelledby="newenv-tab">
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
                language[config.currentLanguage].Environments.placeholderDescriptionEnvironment
              "
            />
          </div>
          <div class="col">
            <input
              v-model="environmentNameFile"
              type="text"
              class="form-control"
              :placeholder="language[config.currentLanguage].Environments.placeholderFileName"
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
              :disabled="environmentDescription.length == 0 || environmentNameFile.length == 0"
            >
              {{ language[config.currentLanguage].Environments.btnSaveEnvironment }}
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
            <div class="alert alert-danger" v-if="errorNewVersionMessage != null">
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
                v-on:click="modalElem.hide()"
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
import { Modal, Button } from 'bootstrap'
import JsonEditor from '../components/JsonEditor.vue'
import axios from 'axios'
//import draggable from 'vuedraggable'
import download from '@/shared/download'
import wizard from './environments/wizard.vue'
import param from './environments/environmentsParameter'

export default {
  name: 'EnvironmentsComponent',
  inheritAttrs: false,
  data: () => {
    return {
      enabled: true,
      listEnvironments: [],
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
        mode: 'code',
        modes: ['tree', 'code']
      },
      modeOptions: [
        { text: 'wizard', value: 'wizard' },
        { text: 'json editor', value: 'json' }
      ],
      modeSelected: 'wizard',
      environmentDescription: '',
      environmentNameFile: '',
      loadJsonToEdit: '',
      errorNewVersionMessage: null,
      skeletonJsonType: 'web',
      codeSelected: null,
      defaultJson: {
        projectId: 'idProject',
        environment: 'BS',
        base_url: 'https://example.com',
        url: 'https://example.com/#/live',
        xpath_check_url: "//td[@class='lead']",
        username: 'user',
        password: 'password',
        userAgent: '<user agent>',
        browser: 'chrome',
        device: 'Nexus 5',
        deviceType: 'Smartphone',
        accept_self_certificate: true
      },
      defaultAppJson: {
        projectId: 'id project',
        environment: 'environment',
        os: 'android',
        appiumServer: 'http://localhost:4723/wd/hub',
        appiumDesiredCaps: {
          uiautomator2ServerInstallTimeout: 100000,
          androidInstallTimeout: 100000,
          platformName: '<platform Android or iOS>',
          platformVersion: 'for example 8.1',
          deviceName: 'Android Emulator',
          appPackage: 'for example it.idelium.app.name.dev',
          app: '/your_build_path/example.(apk or ipa)'
        },
        isRealDevice: true,
        idJsonSelected: null
      }
    }
  },
  options: {},
  computed: {
    strippedContent() {
      let regex = /(<([^>]+)>)/gi
      return this.comment.content.rendered.replace(regex, '')
    },
    draggingInfo() {
      return this.dragging ? 'under drag' : ''
    }
  },
  watch: {
    $route() {
      this.page = 0
      this.$forceUpdate()
    }
  },
  mounted() {
    this.modalElem = new Modal(document.getElementById('myModal'))
    this.buttonElem = new Button(document.getElementById('nav-newenv-tab'))
    this.getEnvironments()
    setTimeout(
      function () {
        this.$refs.wizard.generateJson(null)
      }.bind(this),
      100
    )
  },
  created() {
    console.log('environments')
    this.emitter.on('refreshEnvironment', (msg) => {
      if (msg == true) this.getEnvironments()
      else this.$forceUpdate()
    })
  },
  methods: {
    changeViewMode() {
      if (this.modeSelected == 'wizard') {
        console.log('before put')
        console.log(this.jsonEnvironments)
        setTimeout(
          function () {
            this.$refs.wizard.putJson(this.rememberJson)
          }.bind(this),
          100
        )
      }
    },
    isLetter(e) {
      let char = String.fromCharCode(e.keyCode) // Get the character
      if (/^[A-Za-z]+$/.test(char) || char == '_' || char == '-') return true
      // Match with regex
      else e.preventDefault() // If not match, don't add to input text
    },
    deleteEnvironment(index) {
      this.$confirm(
        this.language[this.config.currentLanguage].Environments.confirmationDelete +
          this.listEnvironments[index].code +
          ' ?',
        '',
        'warning'
      ).then(() => this.deleteAction(index))
    },
    deleteAction(index) {
      this.emitter.emit('showLoader', true)
      axios
        .delete(
          this.config.serviceBaseUrl +
            this.config.url.environments +
            '/' +
            localStorage.projectIdSelected +
            '/' +
            this.listEnvironments[index].id,
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.btnSaveEnable = false
          this.listEnvironments = response.data
          this.emitter.emit('showLoader', false)
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    duplicateEnvironment(index) {
      this.getJson(
        this.listEnvironments[index].id,
        this.listEnvironments[index].code,
        this.listEnvironments[index].description,
        true,
        false
      )
    },
    downloadEnvironment(index) {
      this.getJson(
        this.listEnvironments[index].id,
        this.listEnvironments[index].code,
        this.listEnvironments[index].description,
        false,
        true
      )
    },
    getJson(id, code = null, description = null, isDuplicate = false, isDownload = false) {
      this.emitter.emit('showLoader', true)
      axios
        .get(
          this.config.serviceBaseUrl +
            this.config.url.environments +
            '/' +
            localStorage.projectIdSelected +
            '/' +
            id,
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          console.log(response)
          this.emitter.emit('showLoader', false)
          if (isDuplicate == false) {
            if (isDownload == false) {
              this.jsonResumeNameSelected = id
              this.modalElem.show()
              this.resumeJson = JSON.parse(response.data.config)
              this.idJsonSelecteds = id
              this.codeSelected = code
            } else {
              download.file(code + '.json', response.data.config, 'application/json')
            }
          } else {
            //this.$refs.newEnvironment.activate()
            this.$refs.tab2.click()
            this.loadJsonToEdit = JSON.parse(response.data.config)
            this.jsonEnvironments = this.loadJsonToEdit
            this.environmentDescription = description + '(copy)'
            this.environmentNameFile = code + '_copy'
          }
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    getEnvironments() {
      this.emitter.emit('showLoader', true)
      axios
        .get(
          this.config.serviceBaseUrl +
            this.config.url.environments +
            '/' +
            localStorage.projectIdSelected,
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.listEnvironments = response.data
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    changeJson: function (json) {
      console.log('change json from editor')
      console.log(json)
      this.jsonEnvironments = json
      this.rememberJson = json
    },
    changeWizardJson: function (json) {
      console.log('changeWizardJson')
      console.log(json)
      this.loadJsonToEdit = this.jsonEnvironments = json
      this.saveJson(true)
    },
    changeJsonResume: function (json) {
      this.jsonResumeEnvironments = json
      this.btnSaveEnable = true
      this.saveJson(true)
    },
    savePreSave(isNew) {
      console.log('savePreSave: ' + isNew)
      if (this.modeSelected == 'json') {
        this.saveJson(isNew)
      } else {
        this.$refs.wizard.generateJson(false)
      }
    },
    saveJson(isNew = null) {
      console.log('saveJson')
      let fileName = null
      let jsonObject = null
      if (isNew == false) {
        fileName = this.jsonResumeNameSelected
        jsonObject = this.jsonResumeEnvironments
      } else {
        fileName = this.environmentNameFile.toLowerCase()
        //jsonObject=this.loadJsonToEdit
        jsonObject = this.jsonEnvironments
      }
      this.emitter.emit('showLoader', true)
      axios
        .post(
          this.config.serviceBaseUrl + this.config.url.environments,
          {
            code: fileName,
            config: JSON.stringify(jsonObject),
            description: this.environmentDescription,
            idProject: localStorage.projectIdSelected
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.btnSaveEnable = false
          this.modalElem.hide()
          this.loadJsonToEdit = this.generateJson(param.selenium)

          this.listEnvironments = response.data
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    updateJson() {
      this.emitter.emit('showLoader', true)
      axios
        .put(
          this.config.serviceBaseUrl +
            this.config.url.environments +
            '/' +
            localStorage.projectIdSelected +
            '/' +
            this.idJsonSelecteds,
          {
            config: JSON.stringify(this.jsonResumeEnvironments)
          },
          {
            headers: this.setHeaders()
          }
        )
        .then(
          (response) => {
            this.emitter.emit('showLoader', false)
            this.btnSaveEnable = false
            this.modalElem.hide()
            this.loadJsonToEdit = this.generateJson(param.selenium)
            this.listEnvironments = response.data
          },
          {
            headers: this.setHeaders()
          }
        )
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    changeSkeleton(skeleton) {
      if (skeleton == 'web') {
        this.loadJsonToEdit = this.generateJson(param.selenium)
      } else if (skeleton == 'webservice') {
        this.loadJsonToEdit = this.generateJson(param.webservice)
      } else {
        this.loadJsonToEdit = this.generateJson(param.appium)
      }
      console.log(this.loadJsonToEdit)
    },
    generateJson(json) {
      console.log('generateJson')
      let jsonCreated = {}
      let subParameter = false
      let jsonSub = {}
      for (let i in json) {
        if (json[i].typeName == 'uiautomator2ServerInstallTimeout') subParameter = true
        if (subParameter == true) jsonSub[json[i].typeName] = json[i].default
        else jsonCreated[json[i].typeName] = json[i].default
      }
      if (subParameter == true) jsonCreated['appiumDesiredCaps'] = jsonSub
      console.log(jsonCreated)
      return jsonCreated
    }
  },
  components: {
    wizard,
    //draggable,
    JsonEditor
  }
}
// @ts-ignore
</script>
