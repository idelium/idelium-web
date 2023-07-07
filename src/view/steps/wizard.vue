<template>
  <div style="margin-top: 10px">
    <div class="row">
      <div class="col-sm-1" />
      <div class="col">
        <div class="card">
          <div class="card-body">
            <div class="row">
              <div class="col-sm-1" />
              <div class="col-sm-3">
                <label class="form-check-label" for="flexCheckChecked">
                  {{ language[config.currentLanguage].Steps.wizard.name }}
                </label>
              </div>
              <div class="col-sm-7">
                <input class="form-control" id="input-horizontal" v-model="name" />
              </div>
              <div class="col-sm-1" />
            </div>
            <div class="row">
              <div class="col-sm-1" />
              <div class="col-sm-3">
                <font-awesome-icon
                  icon="door-open"
                  style="font-size: 20px; float: left; margin-top: 5px; margin-right: 10px"
                />
                <label class="form-check-label" for="flexCheckChecked">
                  {{ language[config.currentLanguage].Steps.wizard.failedExit }}
                </label>
              </div>
              <div class="col-sm-7">
                <div class="col-sm-7 form-check form-switch">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    v-model="failedExit"
                    name="check-button"
                  />
                </div>
              </div>
              <div class="col-sm-1" />
            </div>
            <div class="row">
              <div class="col-sm-1" />
              <div class="col-sm-3">
                <font-awesome-icon
                  icon="camera"
                  style="font-size: 20px; float: left; margin-top: 5px; margin-right: 10px"
                />
                <label class="form-check-label" for="flexCheckChecked">
                  {{ language[config.currentLanguage].Steps.wizard.attachScreenshot }}
                </label>
              </div>
              <div class="col-sm-7">
                <div class="form-check form-switch">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    v-model="attachScreenshot"
                    name="check-button"
                  />
                </div>
              </div>
              <div class="col-sm-1" />
            </div>
            <div class="row">
              <div class="col-sm-1" />
              <div class="col">
                <button
                  type="button"
                  class="btn btn-success"
                  style="float: right"
                  size="sm"
                  v-on:click="listPlugin()"
                >
                  <font-awesome-icon icon="plus" />
                  {{ language[config.currentLanguage].Steps.wizard.addStep }}
                </button>
              </div>
              <div class="col-sm-1" />
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-1" />
    </div>
    <div class="row">
      <div class="col">
        <div :class="displayCard">
          <div class="card" :style="'margin-top:10px;min-height:' + minheight">
            <div class="card-body">
              <h5 class="card-title">
                {{ language[config.currentLanguage].Steps.wizard.typeStepTitle }}
              </h5>
              <div class="row">
                <div class="col-sm-8">
                  <div class="row">
                    <div class="col">
                      <select
                        class="form-select form-select-sm form-control"
                        v-model="typeOfWrapperSelected"
                        :disabled="isSelectWrapperDisabled"
                      >
                        <option
                          v-for="item in arrayTypeOfWrapper"
                          v-bind:key="item"
                          :value="item.value"
                        >
                          {{ item.text }}
                        </option>
                      </select>
                    </div>
                    <div class="col-sm-7">
                      <v-select
                        label="name"
                        :options="stepsType"
                        v-model="stepTypeSelected"
                        class="costum"
                        style="float: left; min-width: 100%"
                      ></v-select>
                    </div>
                    <div class="col">
                      <button
                        type="button"
                        class="btn btn-success"
                        size="sm"
                        v-on:click="addEditTypeStep(true)"
                        :disabled="isBtnAddStepTypeDisabled"
                      >
                        <font-awesome-icon icon="plus" />
                        {{ language[config.currentLanguage].Steps.wizard.step.addStepType }}
                      </button>
                      <button
                        type="button"
                        class="btn btn-warning"
                        size="sm"
                        :class="showBtnEditTestType"
                        style="margin-left: 10px"
                        v-on:click="addEditTypeStep(false)"
                        :disabled="isBtnAddStepTypeDisabled"
                      >
                        {{ language[config.currentLanguage].Steps.wizard.step.editStepType }}
                      </button>
                    </div>
                  </div>
                  <div class="row" style="margin-top: 10px">
                    <div class="col">
                      <div class="row" v-if="stepTypeSelected != null">
                        <div class="col-sm-2">
                          <label class="form-check-label" for="flexCheckChecked">
                            {{ language[config.currentLanguage].Steps.wizard.step.note }}
                          </label>
                        </div>
                        <div class="col">
                          <input
                            class="form-control"
                            id="input-horizontal-note"
                            :state="isNoteOk"
                            v-model="note"
                          />
                        </div>
                      </div>
                      <div class="fieldMaker">
                        <div style="margin-right: 10px">
                          <div
                            v-for="(syntax, index) in arraySyntax"
                            v-bind:key="index"
                            class="row costum"
                            style="margin-top: 10px"
                          >
                            <div class="col-sm-2">
                              <label class="form-check-label" for="flexCheckChecked">
                                {{ syntax.typeName }}
                              </label>
                            </div>
                            <div class="col-sm-7" style="margin-left: -45px">
                              <input
                                class="form-control"
                                v-if="syntax.type == 'string' || syntax.type == 'integer'"
                                :id="'input-horizontal' + index"
                                :state="stateInput[index]"
                                @input="checkInput(syntax.type, index)"
                                v-model="responseTypeSelect[index]"
                              />
                              <select
                                class="form-select form-select-sm form-control"
                                v-model="responseTypeSelect[index]"
                                v-if="syntax.type == 'options'"
                              >
                                <option
                                  v-for="item in syntax.options"
                                  v-bind:key="item"
                                  :value="item"
                                >
                                  {{ item }}
                                </option>
                              </select>
                              <json-editor
                                v-if="syntax.type == 'json'"
                                :ref="'editor_' + index"
                                style="height: 25vh; width: 60vh"
                                :onChange="changeJson"
                                :options="options"
                                :json="responseTypeSelect[index]"
                                :refName="index"
                              />
                              <file-upload
                                v-if="syntax.type == 'postman_collection'"
                                ref="upload"
                                v-model="files"
                                class="upload"
                                :extensions="extensions"
                                :accept="accept"
                                @input-filter="inputFilter"
                                :drop="true"
                                :multiple="true"
                              >
                                <div class="upload-text">
                                  <div>
                                    {{
                                      language[config.currentLanguage].Steps.wizard
                                        .uploadPostmanCollection
                                    }}
                                  </div>
                                  <div>
                                    {{
                                      language[config.currentLanguage].Steps.wizard
                                        .uploadPostmanEnvironment
                                    }}
                                    <span v-if="showOverriteLabel == true">
                                      {{
                                        language[config.currentLanguage].Steps.wizard
                                          .uploadPostmanEnvironmentOverrite
                                      }}</span
                                    >
                                  </div>
                                </div>
                                <div class="upload-text error">
                                  {{ errortext }}
                                </div>
                              </file-upload>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col">
                  <div class="card" :style="'min-height:' + minheight">
                    <div class="card-body">
                      <h5 class="card-title">
                        {{ language[config.currentLanguage].Steps.wizard.typeStepOrderTitle }}
                      </h5>
                      <div class="draggableBlock">
                        <draggable
                          v-model="arrayStepTypeToAdd"
                          tag="transition-group"
                          :component-data="{ name: 'fade' }"
                          item-key="id"
                        >
                          <template #item="{ element }">
                            <div class="list-group-item costum text-truncate">
                              <span v-on:click="editStepType(element)">{{ element.note }}</span>
                              <a
                                href="#"
                                v-on:click="deleteStepType(index)"
                                style="text-decoration: none"
                              >
                                <font-awesome-icon icon="times-circle" class="deleteIcon" />
                              </a>
                            </div>
                          </template>
                        </draggable>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.upload {
  border-style: dashed;
  border-color: white;
  text-align: center;
  height: 20vh;
  width: 99%;
  position: relative;
}
.uploadLoaded {
  border-style: dashed;
  border-color: green;
  text-align: center;
  height: 20vh;
  width: 99%;
  position: relative;
}
.upload-text {
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: 2rem;
  width: 100%;
}
.upload-text-environment {
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: 2rem;
  width: 100%;
}

.error {
  color: orangered;
  top: 70% !important;
  font-size: 1rem;
  text-transform: uppercase;
}

.fieldMaker {
  width: 55vw;
  height: 50vh !important;
  overflow: auto;
}
.form-check-label {
  font-size: 10px !important;
}
.iconClass {
  font-size: 10px !important;
}
.hide-element {
  opacity: 0;
}
.draggableBlock {
  min-width: 100%;
  max-height: 40vh;
  overflow: scroll;
  overflow-x: hidden;
}
.list-group-item {
  padding: 0.25rem 1.25rem;
  min-width: 15vw;
  max-width: 15vw;
}
.deleteIcon {
  position: absolute !important;
  color: red !important;
  font-size: 12px;
  margin-top: 8px;
  margin-bottom: 10px;
  right: 5px !important;
}
.fade-in {
  animation: fadeIn ease 1s;
  -webkit-animation: fadeIn ease 1s;
  -moz-animation: fadeIn ease 1s;
  -o-animation: fadeIn ease 1s;
  -ms-animation: fadeIn ease 1s;
}
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-moz-keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-webkit-keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-o-keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-ms-keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.fade-out {
  animation: fadeOut ease 2s;
  -webkit-animation: fadeOut ease 2s;
  -moz-animation: fadeOut ease 2s;
  -o-animation: fadeOut ease 2s;
  -ms-animation: fadeOut ease 2s;
}
@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-moz-keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-webkit-keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-o-keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-ms-keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>

<script>
import selenium from './selenium'
import appium from './appium'
import webservices from './webservices'
import postman from './postman'
import axios from 'axios'

import JsonEditor from '../../components/JsonEditor.vue'
import FileUpload from 'vue-upload-component'
import draggable from 'vuedraggable'

export default {
  name: 'wizard',
  components: {
    JsonEditor,
    draggable,
    FileUpload
  },
  props: ['jsonFromEditor_prop', 'minheight'],
  created() {
    console.log('wizard created')
    if (localStorage.wrapperSelected) this.typeOfWrapperSelected = localStorage.wrapperSelected
    console.log(this.jsonFromEditor_prop)
    this.initWrapperArray()
  },
  watch: {
    stepTypeSelected() {
      if (this.stepTypeSelected == null) return false
      this.arraySyntax = []
      this.arraySyntax = this.stepTypeSelected.syntax
      this.responseTypeSelect = []
      this.stateInput = []
      this.note = ''
      for (let i = 0; i < this.arraySyntax.length; i++) {
        this.stateInput.push(false)
        if (this.arraySyntax[i].type == 'string') {
          this.responseTypeSelect.push('')
        } else if (this.arraySyntax[i].type == 'integer') {
          this.responseTypeSelect.push(1)
        } else if (this.arraySyntax[i].type == 'json') {
          this.responseTypeSelect.push({})
        }
      }
    },
    typeOfWrapperSelected() {
      localStorage.wrapperSelected = this.typeOfWrapperSelected
      this.initWrapperArray()
      this.arrayStepTypeToAdd = []
      if (this.typeOfWrapperSelected == 'plugin') {
        this.listPlugin()
      }
    },
    textBdd() {
      console.log('textBdd change')
      this.checkPossibleAddType()
      this.buildJson()
    },
    note() {
      if (this.note.length > 0) this.isNoteOk = true
      else this.isNoteOk = false
      this.checkPossibleAddType()
      this.buildJson()
    },
    arrayStepTypeToAdd() {
      this.buildJson()
    },
    name() {
      this.$emit('setStepDescription', this.name)
      this.buildJson()
    },
    $route() {
      if (localStorage.wrapperSelected) this.typeOfWrapperSelected = localStorage.wrapperSelected
    }
  },
  data() {
    return {
      //upload vars
      files: [],
      extensions: 'json',
      accept: 'application/json',
      errortext: '',

      jsonFromEditor: null,
      name: '',
      textBdd: '',
      failedExit: true,
      attachScreenshot: true,
      displayCard: 'hide-element',
      stepsType: [],
      stepTypeSelected: null,
      responseTypeSelect: [],
      isSelectWrapperDisabled: false,
      arrayTypeOfWrapper: [
        { value: 'selenium', text: 'selenium' },
        { value: 'appium', text: 'appium' },
        { value: 'plugin', text: 'plugin' },
        { value: 'webservice', text: 'webservice' },
        { value: 'postman', text: 'postman' }
      ],
      typeOfWrapperSelected: 'selenium',
      arraySyntax: [],
      stateInput: [],
      arrayPlugins: [],
      jsonObject: {},
      options: {
        mode: 'code',
        modes: ['tree', 'code']
      },
      arrayStepTypeToAdd: [],
      note: '',
      isNoteOk: false,
      isBtnAddStepTypeDisabled: true,
      objectJsonToSend: {},
      showBtnEditTestType: 'hide-element',
      indexForEdit: -1,
      postmanJson: { environment: null, collection: null },
      showOverriteLabel: false
    }
  },
  methods: {
    inputFilter(newFile) {
      console.log('---------')
      this.errortext = ''
      var fileExt = newFile.name.split('.').pop()
      if (fileExt != 'json') {
        this.errortext =
          this.language[this.config.currentLanguage].Plugins.importPlugin.extensionIsWrong
        return false
      }
      //console.log( this.blobToString(newFile.file))
      let url = URL.createObjectURL(newFile.file)

      axios
        .get(url, {
          responseType: 'text'
        })
        .then((response) => {
          if (!response.data.info && !response.data.name) {
            this.errortext =
              this.language[
                this.config.currentLanguage
              ].Steps.wizard.importPostman.isNotCollectionFile
            return false
          }
          if (response.data.name != undefined) {
            this.postmanJson.environment = response.data
            this.showOverriteLabel = true
          } else {
            this.postmanJson.collection = response.data
            this.note = response.data.info.name
            this.addEditTypeStep(true, this.postmanJson)
          }
          console.log(this.postmanJson)
          //console.log(JSON.stringify(json_to_send));

          //this.addEditTypeStep(false, response.data);
        })
        .catch((e) => {
          this.error = e
        })
    },
    changeJsonEditor() {
      console.log('changeJsonEditor')
      if (this.jsonFromEditor_prop == {}) return false
      else {
        this.jsonFromEditor = this.jsonFromEditor_prop
        this.initWrapperArray()
      }
      console.log(this.jsonFromEditor)
      this.name = this.jsonFromEditor.name
      this.attachScreenshot = this.jsonFromEditor.attachScreenshot
      this.failedExit = this.jsonFromEditor.failedExit
      for (let i = 0; i < this.jsonFromEditor.steps.length; i++) {
        this.jsonFromEditor.steps[i]['id'] = Date.now()
      }
      this.arrayStepTypeToAdd = this.jsonFromEditor.steps
      if (this.arrayStepTypeToAdd.length > 0) this.displayCard = 'fade-in'
    },
    buildJson() {
      console.log('buildJson')
      this.buildJson
      console.log(this.arrayStepTypeToAdd)
      this.arrayStepTypeToAdd.forEach(function (v) {
        delete v.id
      })
      this.objectJsonToSend = {
        name: this.name,
        editorType: this.typeOfWrapperSelected,
        failedExit: this.failedExit,
        attachScreenshot: this.attachScreenshot,
        steps: this.arrayStepTypeToAdd
      }
      console.log(this.objectJsonToSend)
      this.$emit('syncJson', this.objectJsonToSend)
    },
    checkPossibleAddType() {
      let checkField = true
      for (let i = 0; i < this.arraySyntax.length; i++) {
        this.stateInput.push(false)
        if (
          (this.arraySyntax[i].type == 'string' && this.responseTypeSelect[i] == '') ||
          (this.arraySyntax[i].type == 'integer' && this.stateInput[i] === false)
        ) {
          checkField = false
        }
      }
      if (this.isNoteOk == true && checkField == true) this.isBtnAddStepTypeDisabled = false
      else this.isBtnAddStepTypeDisabled = true
    },
    searchFindTypeStep(typeStepName) {
      let found = false
      let index = selenium.stepsFile.findIndex((x) => x.name === typeStepName)
      if (index != -1) {
        this.typeOfWrapperSelected = 'selenium'
        this.fillStepsFileArray(this.typeOfWrapperSelected)
        found = true
      }
      index = appium.stepsFile.findIndex((x) => x.name === typeStepName)
      if (index != -1) {
        this.typeOfWrapperSelected = 'appium'
        this.fillStepsFileArray(this.typeOfWrapperSelected)
        found = true
      }
      index = this.arrayPlugins.findIndex((x) => x.name === typeStepName)
      if (index != -1) {
        this.typeOfWrapperSelected = 'plugin'
        this.fillStepsFileArray(this.typeOfWrapperSelected)
        found = true
      }
      index = webservices.stepsFile.findIndex((x) => x.name === typeStepName)
      if (index != -1) {
        this.typeOfWrapperSelected = 'webservice'
        this.fillStepsFileArray(this.typeOfWrapperSelected)
        found = true
      }
      index = webservices.stepsFile.findIndex((x) => x.name === typeStepName)
      if (index != -1) {
        this.typeOfWrapperSelected = 'postman'
        this.fillStepsFileArray(this.typeOfWrapperSelected)
        found = true
      }

      return found
    },
    editStepType(typeStep, repeat = false) {
      let index = this.arrayStepTypeToAdd.findIndex((x) => x.id === typeStep.id)

      console.log(typeStep)
      let found = false
      if (repeat == false) found = this.searchFindTypeStep(typeStep.stepType)
      let objectFound = this.stepsType.find((d) => d.name == typeStep.stepType)
      this.indexForEdit = index
      this.stepTypeSelected = objectFound
      setTimeout(
        function () {
          this.fillField(typeStep, found)
          this.showBtnEditTestType = 'fade-in'
        }.bind(this),
        100
      )
    },
    fillField(typeStep, found) {
      let arrayKey = Object.keys(typeStep)
      this.responseTypeSelect = []
      this.note = typeStep.note
      let objectFound = this.stepsType.find((d) => d.name == typeStep.stepType)
      for (let i = 0; i < objectFound.syntax.length; i++) {
        this.responseTypeSelect.push(null)
      }
      for (const element of arrayKey) {
        for (let i = 0; i < objectFound.syntax.length; i++) {
          console.log(objectFound.syntax[i].typeName + '==' + element)
          if (objectFound.syntax[i].typeName == element) {
            this.responseTypeSelect[i] = typeStep[element]
            this.checkInput(objectFound.syntax[i].type, i)
          }
        }
      }

      if (found == true) {
        setTimeout(
          function () {
            this.editStepType(typeStep, true)
          }.bind(this),
          100
        )
      }
    },
    addEditTypeStep(isAdd = true, upload = null) {
      let objectToStore = {}
      objectToStore['stepType'] = this.stepTypeSelected.name
      for (let i = 0; i < this.arraySyntax.length; i++) {
        console.log(this.arraySyntax[i])
        if (
          this.arraySyntax[i].type == 'string' ||
          this.arraySyntax[i].type == 'options' ||
          this.arraySyntax[i].type == 'json'
        ) {
          objectToStore[this.arraySyntax[i].typeName] = this.responseTypeSelect[i]
        } else if (this.arraySyntax[i].type == 'integer') {
          objectToStore[this.arraySyntax[i].typeName] = parseInt(this.responseTypeSelect[i])
        } else if (
          this.arraySyntax[i].type == 'postman_collection' ||
          this.arraySyntax[i].type == 'postman_environment'
        ) {
          objectToStore[this.arraySyntax[i].typeName] = upload
          this.postmanJson = { environment: null, collection: null }
          this.showOverriteLabel = false
        }
      }
      objectToStore['note'] = this.note
      if (isAdd == true) {
        objectToStore['id'] = Date.now()
        this.arrayStepTypeToAdd.push(objectToStore)
      } else {
        this.arrayStepTypeToAdd[this.indexForEdit] = objectToStore
        this.showBtnEditTestType = 'hide-element'
      }
      console.log('--------------------------------')
      console.log(objectToStore)
      console.log('--------------------------------')
      this.initWrapperArray()
    },
    deleteStepType(index) {
      this.arrayStepTypeToAdd.splice(index, 1)
    },
    initWrapperArray() {
      this.arraySyntax = []
      this.responseTypeSelect = []
      this.stepTypeSelected = null
      this.textBdd = ''
      this.note = ''
      this.isBtnAddStepTypeDisabled = true
      //console.log(this.stepsType);
      this.fillStepsFileArray(this.typeOfWrapperSelected)
    },
    fillStepsFileArray(wrapperName) {
      this.stepsType = []
      if (wrapperName == 'selenium') {
        for (const element of selenium.stepsFile) this.stepsType.push(element)
      } else if (wrapperName == 'appium') {
        for (const element of appium.stepsFile) this.stepsType.push(element)
      } else if (wrapperName == 'webservice') {
        console.log('eccomi')
        for (const element of webservices.stepsFile) this.stepsType.push(element)
      } else if (wrapperName == 'plugin') {
        this.stepsType = this.arrayPlugins
      } else if (wrapperName == 'postman') {
        for (const element of postman.stepsFile) this.stepsType.push(element)
      }
    },
    isNumber(n) {
      return /^-?[\d.]+(?:e-?\d+)?$/.test(n)
    },
    checkInput(typeStep, index) {
      if (typeStep == 'integer') {
        this.stateInput[index] = this.isNumber(this.responseTypeSelect[index])
      }
      if (typeStep == 'string') {
        if (this.responseTypeSelect[index].length == '') this.stateInput[index] = false
        else this.stateInput[index] = true
      }
      this.checkPossibleAddType()
    },
    changeJson(objectReturn, refName) {
      this.responseTypeSelect[parseInt(refName)] = objectReturn
    },
    listPlugin() {
      this.emitter.emit('showLoader', true)
      //alert(this.config.timeChecksession)
      axios
        .get(
          this.config.serviceBaseUrl +
            this.config.url.plugins +
            '/' +
            localStorage.projectIdSelected,
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          console.log(response)
          this.arrayPlugins = []
          for (const element of response.data) {
            let objectToPush = element
            objectToPush['syntax'] = [
              {
                typeName: 'params',
                type: 'json'
              }
            ]
            this.arrayPlugins.push(objectToPush)
          }
          this.initWrapperArray()
          this.displayCard = 'fade-in'
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    }
  }
}
</script>
