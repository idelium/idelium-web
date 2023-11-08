<template>
  <div>
    <div class="nav nav-tabs" id="nav-tab" role="tablist">
      <button
        class="nav-link active"
        id="nav-tabOrderSteps-tab"
        data-bs-toggle="tab"
        data-bs-target="#nav-tabOrderSteps"
        type="button"
        role="tab"
        aria-controls="nav-tabOrderSteps"
        :aria-selected="'false'"
        v-on:click="getSteps()"
      >
        {{ language[config.currentLanguage].Steps.tabOrderSteps }}
      </button>
      <button
        class="nav-link"
        id="nav-tabNewStep-tab"
        data-bs-toggle="tab"
        data-bs-target="#nav-tabNewStep"
        type="button"
        role="tab"
        ref="tabNewStep"
        aria-controls="nav-tabNewStep"
        :aria-selected="'false'"
      >
        {{ language[config.currentLanguage].Steps.tabNewStep }}
      </button>
    </div>
    <div class="tab-content" id="pills-tabContent">
      <div
        class="tab-pane fade show active"
        id="nav-tabOrderSteps"
        role="tabpanel"
        aria-labelledby="tabOrderSteps-tab"
      >
        <!-- start tabOrderSteps tab -->
        <div class="row">
          <div class="col-sm-1" />
          <div class="col">
            <div class="paneColumn">
                    <div class="row">
                       <div class="col col col-lg-1">
                      {{ language[config.currentLanguage].Steps.colId }}
                       </div>
                       <div class="col col col-lg-4">
                      {{ language[config.currentLanguage].Steps.colName }}
                       </div>
                       <div class="col col col-lg-4">
                      {{ language[config.currentLanguage].Steps.colDescription }}
                       </div>
                       <div class="col col-lg-3"></div>
                    </div>
                <draggable
                  v-model="listSteps"
                  @change="moveElement"
                  :component-data="{ name: 'fade' }"
                  item-key="id"
                >
                  <template #item="{ element }">
                    <div class="row">
                       <div class="col col-lg-1">
                        {{element.id}}
                        </div>
                       <div class="col col col-lg-4">
                        <button
                          type="button"
                          class="btn btn-link btn-sm"
                          v-on:click="getJson(element.id)"
                        >
                          {{ element.name }}
                        </button>
                       </div>
                       <div class="col col col-lg-4">
                        <button
                          type="button"
                          class="btn btn-link btn-sm"
                          v-on:click="getJson(element.id)"
                        >
                          {{ element.description }}
                        </button>
                       </div>
                       <div class="col col-lg-1">
                        <span
                          id="clone"
                          class="text-success"
                          v-on:click="duplicateStep(element)"
                          style="cursor: pointer"
                          ><font-awesome-icon icon="clone" style="font-size: 1rem"
                        /></span>
                       </div>
                       <div class="col col-lg-1">
                        <span
                          class="text-primary"
                          v-on:click="downloadStep(element)"
                          style="cursor: pointer"
                          ><font-awesome-icon icon="download" style="font-size: 1rem"
                        /></span>
                       </div>
                       <div class="col col-lg-1">
                        <span
                          class="text-danger"
                          v-on:click="deleteStep(element)"
                          style="cursor: pointer"
                          ><font-awesome-icon icon="trash" style="font-size: 1rem"
                        /></span>
                       </div>
                    </div>
                  </template>
                </draggable>
            </div>
            <button
              type="button"
              class="btn btn-success"
              size="sm"
              style="float: right"
              v-on:click="saveOrderSteps()"
              :disabled="btnSaveOrderDisabled"
            >
              {{ language[config.currentLanguage].Steps.btnSaveOrder }}
            </button>
          </div>
          <div class="col-sm-1" />
        </div>
        <!-- end tabOrderSteps tab -->
      </div>
      <div
        class="tab-pane fade"
        id="nav-tabNewStep"
        role="tabpanel"
        aria-labelledby="tabNewStep-tab"
      >
        <!-- start tabOrderSteps tab -->
        <div class="row">
          <div class="col-sm-2">
            <select v-model="modeSelected" class="form-select form-select-sm form-control">
              <option v-for="item in modeOptions" v-bind:key="item" :value="item.value">
                {{ item.text }}
              </option>
            </select>
          </div>
          <div class="col-7">
            <input
              v-model="stepDescription"
              type="text"
              class="form-control form-control-sm"
              :placeholder="language[config.currentLanguage].Steps.placeholderDescriptionStep"
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
              :disabled="stepDescription.length == 0 || stepNameFile.length == 0"
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
        <wizard
          ref="wizard"
          v-if="modeSelected != 'json'"
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
                language[config.currentLanguage].Platforms.ManagePlatform.modalAddPlatform
                  .modalTitle
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
              <select v-model="modeEditSelected" :options="modeOptions" class="form-control">
                <option v-for="item in modeOptions" v-bind:key="item" :value="item.value">
                  {{ item.text }}
                </option>
              </select>
            </div>
            <div class="col">
              <input
                v-model="stepEditDescription"
                type="text"
                class="form-control"
                :placeholder="language[config.currentLanguage].Steps.placeholderDescriptionStep"
              />
            </div>
            <div class="col">
              <input
                v-model="stepEditNameFile"
                type="text"
                class="form-control"
                :placeholder="language[config.currentLanguage].Steps.placeholderFileName"
                v-on:keypress="isLetter($event, true)"
                :disabled="stepEditDescription.length == 0"
              />
            </div>
            <wizard
              ref="wizardEdit"
              v-if="modeEditSelected != 'json'"
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
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>

<script>
import axios from 'axios'
import { Modal } from 'bootstrap'

import draggable from 'vuedraggable'
import JsonEditor from '../components/JsonEditor.vue'
import wizard from './steps/wizard.vue'
import download from '@/shared/download'

let templateJson = {
  name: '<nome step>',
  failedExit: true,
  attachScreenshot: true,
  steps: [
    {
      stepType: '',
      xpath: '',
      note: ''
    }
  ]
}

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'StepsComponent',
  inheritAttrs: false,
  data: () => {
    return {
      enabled: true,
      listSteps: [],
      arrayRealStep: [],
      dragging: false,
      jsonSteps: null,
      jsonEditSteps: null,
      jsonResumeSteps: null,
      resumeJson: null,
      jsonResumeNameSelected: null,
      btnSaveEnable: false,
      idResume: null,
      options: {
        mode: 'code',
        modes: ['tree', 'code']
      },
      modeOptions: [
        { text: 'wizard', value: 'wizard' },
        { text: 'json editor', value: 'json' }
      ],
      modeSelected: 'wizard',
      modeEditSelected: 'wizard',
      stepDescription: '',
      stepNameFile: '',
      stepEditDescription: '',
      stepEditNameFile: '',
      loadJsonToEdit: '',
      loadEditJsonToEdit: '',
      defaultJson: templateJson,
      isLetterCheck: false,
      btnSaveOrderDisabled: true,
      isLetterEditCheck: false
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
    modeSelected() {
      if (this.modeSelected == 'wizard') {
        this.syncWizardJson()
      }
    },
    modeEditSelected() {
      if (this.modeSelected == 'wizard') {
        this.syncEditWizardJson()
      }
    },
    jsonSteps() {
      if (this.jsonSteps != null) this.stepDescription = this.jsonSteps.name
    },
    jsonEditSteps() {
      if (this.jsonEditSteps != null) this.stepEditDescription = this.jsonEditSteps.name
    },
    stepDescription() {
      if (this.isLetterCheck == false) {
        let stringToReplace = this.stepDescription.replace(/[^\w\s]/gi, '').toLowerCase()
        this.stepNameFile = stringToReplace.replace(/ /g, '_')
      }
    },
    $route() {
      this.$forceUpdate()
    }
  },
  mounted() {
    this.getSteps()
    this.loadJsonToEdit = this.defaultJson
    this.modalElem = new Modal(document.getElementById('myModal'))
  },
  created() {
    console.log('steps')
    this.emitter.on('refreshStep', (msg) => {
      if (msg == true) this.getSteps()
      else this.$forceUpdate()
    })
  },
  methods: {
    moveElement(e) {
      console.log(e)
      this.btnSaveOrderDisabled = false
    },
    syncWizardJson() {
      setTimeout(
        function () {
          this.$refs.wizard.changeJsonEditor()
        }.bind(this),
        100
      )
    },
    syncEditWizardJson() {
      setTimeout(
        function () {
          this.$refs.wizardEdit.changeJsonEditor()
        }.bind(this),
        500
      )
    },
    setStepDescription(e) {
      console.log(e)
      this.stepDescription = e
    },
    setEditStepDescription() {
      this.stepEditDescription
    },
    isLetter(e, isEdit = false) {
      let char = String.fromCharCode(e.keyCode) // Get the character
      if (/^[A-Za-z]+$/.test(char) || char == '_' || char == '-') return true
      // Match with regex
      else e.preventDefault() // If not match, don't add to input text
      if (isEdit == false) this.isLetterCheck = true
      else this.isLetterEditCheck = false
    },
    deleteStep(element) {
      this.$confirm(
        this.language[this.config.currentLanguage].Steps.confirmationDelete + element.name,
        '',
        'warning'
      ).then(() => this.deleteAction(element))
    },
    deleteAction(element) {
      axios
        .delete(
          this.config.serviceBaseUrl +
            this.config.url.steps +
            '/' +
            localStorage.projectIdSelected +
            '/' +
            element.id,
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          console.log(response)
          this.btnSaveEnable = false
          const index = this.listSteps.findIndex((item) => item.id == element.id)
          this.listSteps.splice(index, 1)
          this.modalElem.hide()
        })
        .catch((e) => {
          this.Logout(this, e)
        })
    },
    duplicateStep(element) {
      console.log('duplicate')
      this.getJson(element.id, element.name, element.description, true, false)
    },
    downloadStep(element) {
      console.log('download')
      this.getJson(element.id, element.name, element.description, false, true)
    },
    getJson(id, name = null, stepDescription = null, isDuplicate = false, isDownload = false) {
      console.log('getJson id:' + id)
      this.emitter.emit('showLoader', true)
      axios
        .get(
          this.config.serviceBaseUrl +
            this.config.url.steps +
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
              this.jsonResumeNameSelected = name
              this.stepEditDescription = response.data.description
              this.stepEditNameFile = response.data.name
              this.resumeJson = JSON.parse(response.data.config)
              this.jsonEditSteps = this.resumeJson
              this.idResume = id
              this.modalElem.show()
              this.syncEditWizardJson()
            } else {
              download.file(response.data.name + '.json', response.data.config, 'application/json')
            }
          } else {
            this.$refs.tabNewStep.click()
            this.loadJsonToEdit = JSON.parse(response.data.config)
            this.jsonSteps = this.loadJsonToEdit
            this.stepDescription = stepDescription + '(copy)'
            this.stepNameFile = name + '_copy'
            this.idResume = null
            this.syncWizardJson()
          }
        })
        .catch((e) => {
          this.Logout(this, e)
        })
    },
    getSteps() {
      this.emitter.emit('showLoader', true)
      if (localStorage.projectIdSelected === null || localStorage.projectIdSelected === undefined) {
        console.log('skip')
        return false
      }
      axios
        .get(
          this.config.serviceBaseUrl + this.config.url.steps + '/' + localStorage.projectIdSelected,
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.listSteps = response.data
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    changeJson(json) {
      this.jsonSteps = json
    },
    syncJson: function (json) {
      console.log('syncJson')
      this.loadJsonToEdit = json
      this.jsonSteps = json
    },
    syncEditJson: function (json) {
      console.log('syncJson')
      this.loadEditJsonToEdit = json
      this.jsonEditSteps = json
      this.jsonResumeSteps = json
      this.btnSaveEnable = true
    },
    changeJsonResume: function (json) {
      this.jsonResumeSteps = json
      this.btnSaveEnable = true
    },
    saveStep() {
      // eslint-disable-next-line
      let regex = RegExp('[-*#+=;:\/,~ \.\$ ]+')
      if (this.jsonSteps == null) {
        this.jsonSteps = this.defaultJson
      }
      if (this.stepDescription.length == 0 || this.stepNameFile.length == 0) {
        alert(this.language[this.config.currentLanguage].Steps.errorMessageInputEmpty)
        return false
      }
      if (regex.test(this.stepNameFile)) {
        alert(this.language[this.config.currentLanguage].Steps.errorCharactersError)
        return false
      }
      this.emitter.emit('showLoader', true)
      axios
        .post(
          this.config.serviceBaseUrl + this.config.url.steps,
          {
            description: this.stepDescription.toLowerCase(),
            name: this.stepNameFile.toLowerCase(),
            config: JSON.stringify(this.jsonSteps),
            idProject: localStorage.projectIdSelected
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.listSteps.push({
            id: response.data.id,
            name: this.stepNameFile.toLowerCase(),
            description: this.stepDescription.toLowerCase()
          })
          this.stepDescription = ''
          this.stepNameFile = ''
          this.jsonSteps = null
          //this.saveOrderSteps()
          this.isLetterCheck = false
          this.loadJsonToEdit = this.defaultJson
          this.emitter.emit('showLoader', false)
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    saveOrderSteps() {
      this.emitter.emit('showLoader', true)
      console.log(this.listSteps)
      axios
        .post(
          this.config.serviceBaseUrl +
            this.config.url.steps +
            '/' +
            localStorage.projectIdSelected +
            '/updateorder',
          {
            order: this.listSteps
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          console.log(response)
          this.emitter.emit('showLoader', false)
          this.btnSaveOrderDisabled = true
        })
        .catch((e) => {
          this.Logout(this, e)
        })
    },
    updateStep() {
      this.emitter.emit('showLoader', true)
      axios
        .put(
          this.config.serviceBaseUrl +
            this.config.url.steps +
            '/' +
            localStorage.projectIdSelected +
            '/' +
            this.idResume,
          {
            description: this.stepEditDescription.toLowerCase(),
            name: this.stepEditNameFile.toLowerCase(),
            config: JSON.stringify(this.jsonResumeSteps)
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.btnSaveEnable = false
          this.modalElem.hide()
          this.listSteps = response.data
          this.emitter.emit('showLoader', false)
        })
        .catch()
    }
  },
  components: {
    draggable,
    JsonEditor,
    wizard
  }
}
</script>
