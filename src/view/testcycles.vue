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
              :disabled="arrayTestCycles.length == 0"
              v-on:click="getTestCycles(1)"
            >
              {{ language[config.currentLanguage].TestCycles.tabTitleModify }}
            </button>
            <button
              class="nav-link"
              id="nav-tabTitleNewTestCycle-tab"
              data-bs-toggle="tab"
              data-bs-target="#nav-tabTitleNewTestCycle"
              type="button"
              role="tab"
              ref="tabTitleNewTestCycle"
              aria-controls="nav-tabTitleNewTestCycle"
              :aria-selected="'false'"
              v-on:click="tabOpen = 1"
            >
              {{ language[config.currentLanguage].TestCycles.tabTitleNewTestCycle }}
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
              <div v-if="arrayTestCycles.length > 0">
                <div class="card" v-if="commandLine">
                  <span style="font-size: 12px">{{
                    language[config.currentLanguage].TestCycles.commandLineInfo
                  }}</span
                  ><br />
                  <br />
                  <span class="commandLine">{{ commandLine }}</span>
                  <span
                    class="text-success"
                    variant="link"
                    size="sm"
                    v-on:click="copyClipboard(commandLine)"
                    style="float: right; cursor: pointer"
                  >
                    <font-awesome-icon
                      icon="copy"
                      style="margin-left: 5px; font-size: 24px !important"
                      alt="copy clipboard"
                    />
                  </span>
                </div>
                <v-select
                  label="name"
                  :options="arrayTestCycles"
                  v-model="testCycleSelected"
                  class="costum formTestCycle"
                  style="min-width: 98%"
                ></v-select>
                <input
                  class="form-control formTestCycle"
                  v-if="testCycleSelected != null"
                  :placeholder="
                    language[config.currentLanguage].TestCycles.placeholderDescriptionTestCycle
                  "
                  v-model="modifyDescriptionTestCycle"
                  :disabled="testCycleSelected == null"
                />
                <button
                  type="button"
                  v-if="testCycleSelected != null"
                  class="btn btn-success"
                  size="sm"
                  style="float: right"
                  :disabled="testCycleSelected == null"
                  v-on:click="modifyTestCycle()"
                >
                  {{ language[config.currentLanguage].TestCycles.btnModifyTestCycle }}
                </button>
                <br />
              </div>
              <!-- end tabTitleModify tab -->
            </div>
            <div
              class="tab-pane fade show active"
              id="nav-tabTitleNewTestCycle"
              role="tabpanel"
              aria-labelledby="tabTitleNewTestCycle-tab"
            >
              <!-- start tabTitleNewTestCycle tab -->
              <input
                class="form-control formTestCycle"
                :placeholder="language[config.currentLanguage].TestCycles.placeholderNameTestCycle"
                v-model="newNameTestCycle"
                :disabled="disableNameTestCycle"
              />
              <input
                class="form-control formTestCycle"
                :placeholder="
                  language[config.currentLanguage].TestCycles.placeholderDescriptionTestCycle
                "
                v-model="newDescriptionTestCycle"
                :disabled="disableTestCycleDescription"
              />
              <button
                type="button"
                class="btn btn-success"
                size="sm"
                style="float: right"
                :disabled="disableBtnCreateTestCycle"
                v-on:click="saveTestCycle()"
              >
                {{ language[config.currentLanguage].TestCycles.btnCreateTestCycle }}
              </button>
              <!-- end tabTitleNewTestCycle tab -->
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-6">
            <span style="font-size: 16px !important">{{
              language[config.currentLanguage].TestCycles.tests
            }}</span>
            <input
              class="form-control"
              type="text"
              v-model.lazy="testFilter"
              :placeholder="language[config.currentLanguage].TestCycles.placeholderFilterTest"
              style="margin-bottom: 5px"
            />
            <draggable
              class="dragArea list-group"
              :list="arrayTests"
              :group="{ name: 'people', pull: 'clone', put: false }"
              @change="log"
              item-key="id"
            >
              <template #item="{ element }">
                <div class="list-group-item" style="cursor: grab">
                  <span style="text-transform: uppercase">{{ element.name }}</span>
                </div>
              </template>
            </draggable>
          </div>
          <div class="col-sm-1"></div>
          <div class="col-sm-4" style="border-style: dashed; overflow-y: auto">
            <span style="font-size: 16px !important">{{
              language[config.currentLanguage].TestCycles.testsToDo
            }}</span>
            <div class="list-group">
              <draggable
                class="dragArea list-group"
                style="min-height: 75vh; max-height: 75vh"
                :list="arrayTestsSelectedDragged"
                group="people"
                item-key="id"
                @change="log"
              >
                <template #item="{ element, index }">
                  <div class="list-group-item d-flex justify-content-between" style="cursor: move">
                    <span style="text-transform: uppercase">{{ element.name }}</span>
                    <a href="#" v-on:click="deleteItem(index)" style="text-decoration: none"
                      ><font-awesome-icon
                        icon="times-circle"
                        class="iconClass"
                        style="float: right; color: red; font-size: 12px"
                    /></a>
                  </div>
                </template>
              </draggable>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-1" />
    </div>
  </div>
</template>
<!--style src="vue-multiselect/dist/vue-multiselect.min.css"></style-->
<style scoped>
.formTestCycle {
  margin: 10px;
  width: 98%;
  text-transform: uppercase;
}
.commandLine {
  font-family: Times, 'Times New Roman' !important;
  font-size: 12px !important;
}
</style>

<script>
import axios from 'axios'

import draggable from 'vuedraggable'
import copy from 'copy-to-clipboard'

export default {
  name: 'TestCyclesComponent',
  components: {
    draggable
  },
  data() {
    return {
      delay: 1000,
      arrayTests: [],
      arrayTestsSelectedDragged: [],
      listOriginalTests: [],
      arrayTestCycles: [],
      testCycleSelected: null,
      testFilter: '',
      disableNameTestCycle: true,
      disableTestCycleDescription: true,
      disableBtnCreateTestCycle: true,
      newNameTestCycle: '',
      newDescriptionTestCycle: '',
      modifyDescriptionTestCycle: '',
      commandLine: ''
    }
  },
  created() {
    this.getTests(1)
    if (this.commandLine != '') this.setCommandLine()
    this.emitter.on('refreshTestCycle', (msg) => {
      console.log('refreshTestCycle')
      this.commandLine = ''
      this.testCycleSelected = null
      if (msg == true) this.getTests(2)
      else this.$forceUpdate()
    })
  },
  watch: {
    testFilter() {
      // Do something with search nameIssue after it debounced
      let filter = this.testFilter
      console.log(filter)
      this.searchTextTests(filter)
    },
    arrayTestsSelectedDragged() {
      this.disableNameTestCycle = this.arrayTestsSelectedDragged.length == 0
    },
    newNameTestCycle() {
      this.disableTestCycleDescription = this.newNameTestCycle.length == 0
    },
    newDescriptionTestCycle() {
      this.disableBtnCreateTestCycle = this.newDescriptionTestCycle.length == 0
    },
    testCycleSelected() {
      this.getTestCycle()
    }
  },
  methods: {
    copyClipboard(text) {
      copy(text)
      this.$wkToast(this.language[this.config.currentLanguage].TestCycles.commandLineCopy)
    },
    searchTextTests(filter) {
      this.arrayTests = this.listOriginalTests.filter((d) => d.name.includes(filter))
    },
    getTests(from) {
      this.emitter.emit('showLoader', true)
      console.log('getTests:' + from)
      axios
        .get(
          this.config.serviceBaseUrl + this.config.url.tests + '/' + localStorage.projectIdSelected,
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          console.log(response)
          this.arrayTests = this.listOriginalTests = response.data
          console.log(this.arrayTests)
          this.getTestCycles(2)
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    getTestCycles(from) {
      console.log('getTestCycles from:' + from)
      this.emitter.emit('showLoader', true)
      axios
        .get(
          this.config.serviceBaseUrl +
            this.config.url.testcycles +
            '/' +
            localStorage.projectIdSelected,
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayTestCycles = []
          for (let i = 0; i < response.data.length; i++) {
            let objectTc = response.data[i]
            objectTc.name = objectTc.name + '(' + objectTc.id + ')'
            this.arrayTestCycles.push(objectTc)
          }
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    setCommandLine() {
      this.commandLine =
        'idelium --idCycle=' +
        this.testCycleSelected.id +
        ' --idProject=' +
        localStorage.projectIdSelected +
        ' --environment=<environment name>'
    },
    getTestCycle() {
      if (this.testCycleSelected == null) {
        this.modifyDescriptionTestCycle = ''
        this.arrayTestsSelectedDragged = []
        return false
      }
      this.setCommandLine()
      this.emitter.emit('showLoader', true)
      axios
        .get(
          this.config.serviceBaseUrl +
            this.config.url.testcycles +
            '/' +
            localStorage.projectIdSelected +
            '/' +
            this.testCycleSelected.id,
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayTestsSelectedDragged = JSON.parse(response.data.config)
          this.modifyDescriptionTestCycle = response.data.description
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    saveTestCycle() {
      this.emitter.emit('showLoader', true)
      axios
        .post(
          this.config.serviceBaseUrl + this.config.url.testcycles,
          {
            name: this.newNameTestCycle,
            description: this.newDescriptionTestCycle,
            config: JSON.stringify(this.arrayTestsSelectedDragged),
            idProject: localStorage.projectIdSelected
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.listPlugins = response.data
          this.arrayTests = this.listOriginalTests
          this.arrayTestsSelectedDragged = []
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    modifyTestCycle() {
      this.emitter.emit('showLoader', true)
      axios
        .put(
          this.config.serviceBaseUrl +
            this.config.url.testcycles +
            '/' +
            localStorage.projectIdSelected +
            '/' +
            this.testCycleSelected.id,
          {
            config: JSON.stringify(this.arrayTestsSelectedDragged),
            description: this.modifyDescriptionTestCycle
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.listPlugins = response.data
          this.arrayTests = this.listOriginalTests
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    log: function () {
      console.log(this.arrayTestsSelectedDragged)
      this.copyArray()
      this.disableNameTestCycle = this.arrayTestsSelectedDragged.length == 0
    },
    deleteItem(index) {
      console.log('delete copy item: ' + index)
      this.arrayTestsSelectedDragged.splice(index, 1)
      console.log(this.arrayTestsSelectedDragged)
      this.copyArray()
      this.disableNameTestCycle = this.arrayTestsSelectedDragged.length == 0
    },
    copyArray() {
      this.arrayTestsSelected = []
      for (let i = 0; i < this.arrayTestsSelectedDragged.length; i++) {
        this.arrayTestsSelected.push(this.arrayTestsSelectedDragged[i].name)
      }
    }
  }
}
</script>
