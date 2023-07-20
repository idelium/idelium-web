<template>
  <div class="costum">
    <div class="row">
      <div class="col-sm-1" />
      <div class="col-sm-10">
        <div class="card">
          <div class="nav nav-tabs" id="nav-tab" role="tablist">
            <button
              class="nav-link active"
              id="nav-tabTitleModify-tab"
              data-bs-toggle="tab"
              data-bs-target="#nav-tabTitleModify"
              type="button"
              role="tab"
              aria-controls="nav-tabTitleModify"
              :aria-selected="'false'"
              ref="home"
              :disabled="arrayTests.length == 0"
              v-on:click="tabOpen = 0"
            >
              {{ language[config.currentLanguage].Tests.tabTitleModify }}
            </button>
            <button
              class="nav-link"
              id="nav-tabTitleNewTest-tab"
              data-bs-toggle="tab"
              data-bs-target="#nav-tabTitleNewTest"
              type="button"
              role="tab"
              ref="tabTitleNewTest"
              aria-controls="nav-tabTitleNewTest"
              :aria-selected="'false'"
              v-on:click="tabOpen = 1"
            >
              {{ language[config.currentLanguage].Tests.tabTitleNewTest }}
            </button>
            <button
              class="nav-link"
              id="nav-tabTitleImportTest-tab"
              data-bs-toggle="tab"
              data-bs-target="#nav-tabTitleImportTest"
              type="button"
              role="tab"
              ref="tabTitleImportTest"
              aria-controls="nav-tabTitleImportTest"
              :aria-selected="'false'"
              v-on:click="tabOpen = 2"
            >
              {{ language[config.currentLanguage].Tests.tabTitleImportTest }}
            </button>
          </div>
          <div class="tab-content" id="pills-tabContent">
            <div
              class="tab-pane fade show active"
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
              class="tab-pane fade"
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
              class="tab-pane fade"
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
        <div class="row" v-if="tabOpen != 2">
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
              class="dragArea list-group"
              :list="arraySteps"
              :group="{ name: 'people', pull: 'clone', put: false }"
              @change="log"
              :sort="false"
              style="height: 70vh !important; overflow-y: auto !important"
              item-key="id"
            >
              <template #item="{ element }">
                <div class="list-group-item" style="cursor: grab">
                  <span style="text-transform: uppercase">{{ element.description }}</span>
                </div>
              </template>
            </draggable>
          </div>
          <div class="col-sm-1"></div>
          <div class="col-sm-4" style="border-style: dashed; overflow-y: auto">
            <span style="font-size: 16px !important">{{
              language[config.currentLanguage].Tests.stepsToDo
            }}</span>
            <draggable
              class="dragArea list-group"
              style="min-height: 75vh; max-height: 75vh"
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
        <div class="row" v-if="tabOpen == 2">
          <div class="col-sm-2" />
          <div class="col-sm-7 text-truncate">
            <div style="height: 70vh; overflow-y: auto; text-overflow: ellipsis">
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
          <div class="col-sm-1"></div>
        </div>
      </div>
      <div class="col-sm-1" />
    </div>
  </div>
</template>
<style scoped>
.formTest {
  margin: 10px;
  width: 98%;
  text-transform: uppercase;
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
</style>

<script>
import axios from 'axios'

import draggable from 'vuedraggable'
import importSelenium from './tests/importSelenium.vue'

export default {
  name: 'Tests',
  components: {
    draggable,
    importSelenium
  },
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
      console.log(filter)
      this.searchTextSteps(filter)
    },
    arrayStepsSelectedDragged() {
      console.log('arrayStepsSelectedDragged: ' + this.arrayStepsSelectedDragged.length)
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
      console.log(this.files)
    }
  },
  methods: {
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
          console.log(i)
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
      axios
        .get(
          this.config.serviceBaseUrl + this.config.url.steps + '/' + localStorage.projectIdSelected,
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          console.log(response)
          this.arraySteps = this.listOriginalSteps = response.data
          console.log(this.arraySteps)
          this.getTests()
        })
        .catch((e) => {
          this.error = e
        })
    },
    getTests() {
      this.emitter.emit('showLoader', true)
      axios
        .get(
          this.config.serviceBaseUrl + this.config.url.tests + '/' + localStorage.projectIdSelected,
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayTests = response.data
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
      axios
        .get(
          this.config.serviceBaseUrl +
            this.config.url.tests +
            '/' +
            localStorage.projectIdSelected +
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
      axios
        .post(
          this.config.serviceBaseUrl + this.config.url.tests,
          {
            name: this.newNameTest,
            description: this.newDescriptionTest,
            config: JSON.stringify(this.arrayStepsSelectedDragged),
            idProject: localStorage.projectIdSelected
          },
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
      axios
        .post(
          this.config.serviceBaseUrl + this.config.url.importtest,
          {
            name: this.importedNameTest,
            description: this.importedDescriptionTest,
            import: JSON.stringify(this.arrayStepsImported),
            idProject: localStorage.projectIdSelected
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          console.log(response)
          this.arrayStepsSelectedDragged = []
          this.arrayStepsImported = []
          this.cancelUpload()
          this.getSteps()
          this.$refs.home.click()
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    modifyTest() {
      this.emitter.emit('showLoader', true)
      axios
        .put(
          this.config.serviceBaseUrl +
            this.config.url.tests +
            '/' +
            localStorage.projectIdSelected +
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
      console.log(this.arrayStepsSelectedDragged)
      this.copyArray()
    },
    deleteItem(index) {
      this.arrayStepsSelectedDragged.splice(index, 1)
      console.log(this.arrayStepsSelectedDragged)
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
      console.log(obj)
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
