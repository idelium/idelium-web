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
                  :placeholder="language[config.currentLanguage].Tests.placeholderDescriptionTest"
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
                :placeholder="language[config.currentLanguage].Tests.placeholderNameTest"
                v-model="newNameTest"
                :disabled="disableNameTest"
              />
              <input
                class="form-control formTest"
                :placeholder="language[config.currentLanguage].Tests.placeholderDescriptionTest"
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
        <div class="row tests-workspace" v-if="tabOpen != 2">
          <div class="col-sm-6">
            <span style="font-size: 16px !important">{{
              language[config.currentLanguage].Tests.steps
            }}</span>
            <input
              class="form-control"
              type="text"
              v-model.lazy="stepFilter"
              :placeholder="language[config.currentLanguage].Tests.placeholderFilterStep"
              style="margin-bottom: 5px"
            />

            <draggable
              class="dragArea list-group tests-steps-list"
              :list="arraySteps"
              :group="{ name: 'people', pull: 'clone', put: false }"
              @change="log"
              :sort="false"
              item-key="id"
            >
              <template #item="{ element }">
                <div class="list-group-item" style="cursor: grab">
                  <span style="text-transform: uppercase">{{ element.description }}</span>
                </div>
              </template>
            </draggable>
          </div>
          <div class="col-sm-1 tests-workspace-spacer"></div>
          <div class="col-sm-5 tests-selected-panel">
            <span style="font-size: 16px !important">{{
              language[config.currentLanguage].Tests.stepsToDo
            }}</span>
            <draggable
              class="dragArea list-group tests-selected-list"
              :list="arrayStepsSelectedDragged"
              group="people"
              :drop="true"
              @change="log"
              item-key="id"
            >
              <template #item="{ element, index }">
                <div>
                  <div style="text-align: center; width: 100%" v-if="index > 0">
                    <span>
                      <font-awesome-icon
                        icon="arrow-circle-down"
                        style="font-size: 25px; margin-top: 5px; margin-bottom: 5px"
                    /></span>
                  </div>

                  <div
                    class="list-group-item"
                    style="
                      cursor: move;
                      border-radius: 25px;
                      padding: 20px;
                      text-align: center !important;
                    "
                  >
                    <span style="text-transform: uppercase">{{ element.description }}</span>
                    <a
                      href="#"
                      v-on:click="deleteItem(index)"
                      style="text-decoration: none; float: right"
                      ><font-awesome-icon icon="times-circle" class="deleteIcon iconClass"
                    /></a>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
        <div class="row tests-import-workspace" v-if="tabOpen == 2">
          <div class="col-sm-8 text-truncate">
            <div class="tests-import-list-wrapper">
              <draggable
                class="dragArea list-group"
                :list="arrayStepsImported"
                :sort="true"
                item-key="id"
              >
                <template #item="{ element, index }">
                  <div style="margin-right: 10px">
                    <div style="text-align: center; width: 100%" v-if="index > 0">
                      <span>
                        <font-awesome-icon
                          icon="arrow-circle-down"
                          style="font-size: 25px; margin-top: 5px; margin-bottom: 5px"
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
                        v-if="arrayEditImportedSteps[index] == false && element.steps[0].findBy"
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
                          v-for="(target, index2) in seleniumImport[index].targets"
                          :key="index2"
                          :value="target[0]"
                        >
                          {{ target[0] }}
                        </option>
                      </select>
                      <a
                        href="#"
                        v-on:click="deleteItemImported(index)"
                        style="text-decoration: none; float: right"
                        ><font-awesome-icon icon="times-circle" class="deleteIcon iconClass"
                      /></a>
                    </div>
                  </div>
                </template>
              </draggable>
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
import apiClient from '@/services/apiClient'
import { getSelectedProjectId } from '@/stores/session'
import { buildTestPayload } from '@/domain/workflowPayloads'

import draggable from 'vuedraggable'
import importSelenium from './tests/importSelenium.vue'
import { routableTabs } from '@/shared/routableTabs'

export default {
  name: 'TestsComponent',
  components: {
    draggable,
    importSelenium
  },
  mixins: [routableTabs('modify', ['modify', 'new', 'import'])],
  data() {
    return {
      delay: 1000,
      arraySteps: [],
      arrayStepsSelectedDragged: [],
      arrayStepsImported: [],
      arrayEditImportedSteps: [],
      listOriginalSteps: [],
      arrayTests: [],
      testSelected: null,
      stepFilter: '',
      disableNameTest: true,
      disableTestDescription: true,
      disableBtnCreateTest: true,
      newNameTest: '',
      newDescriptionTest: '',
      importedNameTest: '',
      importedDescriptionTest: '',
      modifyDescriptionTest: '',
      tabOpen: 0,
      testsLoaded: false,
      importedFromSelenium: false,
      seleniumImport: {}
    }
  },
  created() {
    this.getSteps()
    this.emitter.on('refreshTest', (msg) => {
      if (msg == true) this.getSteps()
      else this.$forceUpdate()
      
    })
  },
  watch: {
    stepFilter() {
      // Do something with search nameIssue after it debounced
      let filter = this.stepFilter
      this.searchTextSteps(filter)
    },
    arrayStepsSelectedDragged() {
      this.disableNameTest = this.arrayStepsSelectedDragged.length == 0
    },
    newNameTest() {
      this.disableTestDescription = this.newNameTest.length == 0
    },
    newDescriptionTest() {
      this.disableBtnCreateTest = this.newDescriptionTest.length == 0
    },
    testSelected() {
      this.getTest()
    },
    /*$route() {
      this.$forceUpdate();
    }, */
    files() {
    }
  },
  computed: {
    isModifyTabDisabled() {
      return this.testsLoaded && this.arrayTests.length === 0
    }
  },
  methods: {
    onRoutableTabChange(tab) {
      this.tabOpen = ['modify', 'new', 'import'].indexOf(tab)
    },
    redirectEmptyTests() {
      if (this.isModifyTabDisabled && this.isActiveTab('modify')) {
        this.openTab('new')
      }
    },
    cancelUpload() {
      this.$refs.selenium.showUploadComponent()
      this.seleniumImport = {}
      this.arrayStepsImported = []
    },
    importTest(value) {
      this.importedNameTest = value.name
      this.importedDescriptionTest = value.description
      if (value.tests) {
        this.seleniumImport = value.seleniumImport
        this.arrayStepsImported = value.tests
        this.importedFromSelenium = true
        this.arrayEditImportedSteps = []
        for (let i in this.arrayStepsImported) {
          this.arrayEditImportedSteps.push(false)
        }
      }
    },
    searchTextSteps(filter) {
      this.arraySteps = this.listOriginalSteps.filter((d) =>
        d.name.toLowerCase().includes(filter.toLowerCase())
      )
    },
    getSteps() {
      this.emitter.emit('showLoader', true)
      apiClient
        .get(
          this.config.serviceBaseUrl + this.config.url.steps + '/' + getSelectedProjectId(),
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.arraySteps = this.listOriginalSteps = response.data
          this.getTests()
        })
        .catch((e) => {
          this.error = e
        })
    },
    getTests() {
      this.emitter.emit('showLoader', true)
      apiClient
        .get(
          this.config.serviceBaseUrl + this.config.url.tests + '/' + getSelectedProjectId(),
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayTests = response.data
          this.testsLoaded = true
          this.redirectEmptyTests()
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    getTest() {
      if (this.testSelected == null) {
        this.modifyDescriptionTest = ''
        this.arrayStepsSelectedDragged = []
        return false
      }
      this.emitter.emit('showLoader', true)
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.tests +
            '/' +
            getSelectedProjectId() +
            '/' +
            this.testSelected.id,
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayStepsSelectedDragged = JSON.parse(response.data.config)
          this.modifyDescriptionTest = response.data.description
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    saveTest() {
      this.emitter.emit('showLoader', true)
      apiClient
        .post(
          this.config.serviceBaseUrl + this.config.url.tests,
          buildTestPayload({
            name: this.newNameTest,
            description: this.newDescriptionTest,
            steps: this.arrayStepsSelectedDragged,
            projectId: getSelectedProjectId()
          }),
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.listPlugins = response.data
          this.arraySteps = this.listOriginalSteps
          this.arrayStepsSelectedDragged = []
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    saveImportTest() {
      this.emitter.emit('showLoader', true)
      apiClient
        .post(
          this.config.serviceBaseUrl + this.config.url.importtest,
          {
            name: this.importedNameTest,
            description: this.importedDescriptionTest,
            import: JSON.stringify(this.arrayStepsImported),
            idProject: getSelectedProjectId()
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.arrayStepsSelectedDragged = []
          this.arrayStepsImported = []
          this.cancelUpload()
          this.getSteps()
          this.openTab('modify')
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    modifyTest() {
      this.emitter.emit('showLoader', true)
      apiClient
        .put(
          this.config.serviceBaseUrl +
            this.config.url.tests +
            '/' +
            getSelectedProjectId() +
            '/' +
            this.testSelected.id,
          {
            config: JSON.stringify(this.arrayStepsSelectedDragged),
            description: this.modifyDescriptionTest
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.listPlugins = response.data
          this.arraySteps = this.listOriginalSteps
        })
        .catch((e) => {
          //this.Logout(this)
          alert(e)
          this.error = e
        })
    },
    log: function () {
      this.copyArray()
    },
    deleteItem(index) {
      this.arrayStepsSelectedDragged.splice(index, 1)
      this.copyArray()
    },
    deleteItemImported(index) {
      this.arrayStepsImported.splice(index, 1)
    },
    editImportedItem(index) {
      for (let i in this.arrayEditImportedSteps) this.arrayEditImportedSteps[i] = false
      this.arrayEditImportedSteps[index] = true
      this.targetSelected =
        this.arrayStepsImported[index].steps[0].findBy +
        '=' +
        this.arrayStepsImported[index].steps[0].target
      this.$forceUpdate()
    },
    endEditImportedItem(index) {
      this.arrayEditImportedSteps[index] = false
      this.$forceUpdate()
    },
    changeTarget(index, obj) {
      let target = obj.target.value.substring(obj.target.value.indexOf('=') + 1)
      let findBy = obj.target.value.substring(0, obj.target.value.indexOf('='))
      this.arrayStepsImported[index].steps[0].target = target
      this.arrayStepsImported[index].steps[1].target = target
      this.arrayStepsImported[index].steps[0].findBy = findBy
      this.arrayStepsImported[index].steps[1].findBy = findBy
      this.endEditImportedItem(index)
    },
    copyArray() {
      this.disableNameTest = this.arrayStepsSelectedDragged.length == 0
      this.arrayStepsSelected = []
      for (let i = 0; i < this.arrayStepsSelectedDragged.length; i++) {
        this.arrayStepsSelected.push(this.arrayStepsSelectedDragged[i].name)
      }
    }
  }
}
</script>
