<template>
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
        aria-selected="true"
        v-on:click="listPlugin()"
      >
        {{ language[config.currentLanguage].Plugins.tabListPlugins }}
      </button>
      <button
        class="nav-link"
        ref="tab2"
        id="nav-newplugin-tab"
        data-bs-toggle="tab"
        data-bs-target="#nav-newplugin"
        type="button"
        role="tab"
        aria-controls="nav-newplugin"
        aria-selected="false"
        v-on:click="newPlugin()"
      >
        {{ language[config.currentLanguage].Plugins.tabNewPlugin }}
      </button>
      <button
        class="nav-link"
        id="nav-import-tab"
        ref="test"
        data-bs-toggle="tab"
        data-bs-target="#nav-import"
        type="button"
        role="tab"
        aria-controls="nav-import"
        aria-selected="false"
      >
        {{ language[config.currentLanguage].Plugins.tabTitleImportPlugin }}
      </button>
    </div>
  </nav>
  <div class="tab-content" id="pills-tabContent">
    <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="home-tab">
      <!-- start home tab -->
      <div class="row">
        <div class="col-sm-1" />
        <div class="col">
          <table class="table table-striped costum">
            <tr>
              <th scope="col">
                {{ language[config.currentLanguage].Plugins.name }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Plugins.description }}
              </th>
              <th scope="col"></th>
            </tr>
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
                <span class="text-danger" v-on:click="deletePlugin(index)" style="cursor: pointer"
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
          </table>
        </div>
        <div class="col-sm-1" />
      </div>
      <!-- end home tab -->
    </div>
    <div class="tab-pane fade" id="nav-newplugin" role="tabpanel" aria-labelledby="newplugin-tab">
      <!-- start newplugin tab -->
      <div class="row">
        <div class="col col-sm-1" />
        <div class="col col-sm-4">
          <input
            v-model="descriptionNewFile"
            placeholder="name of plugin"
            class="form-control"
            style="float: right; margin-left: 5px; margin-top: 5px"
          />
        </div>
        <div class="col">
          <input
            v-model="nameNewFile"
            placeholder="name of plugin"
            class="form-control"
            style="float: right; margin-left: 5px; margin-top: 5px"
            v-on:keypress="isLetter($event)"
            :disabled="descriptionNewFile.length == 0"
          />
        </div>
        <div class="col">
          <button
            type="button"
            class="btn btn-success btn-sm"
            style="margin-left: 5px; margin-top: 5px"
            v-on:click="savePlugin(nameNewFile, textNew, descriptionNewFile)"
            :disabled="descriptionNewFile.length == 0 || nameNewFile.length == 0"
          >
            Save
          </button>
        </div>
        <div class="col-sm-1" />
      </div>
      <div class="row">
        <div class="col-sm-1" />
        <div class="col">
          <!--ace-editor ref="new" v-model="textNew" v-if="showEditor==true" style="margin-top:10px;min-height:80vh;;max-height:80vh;"></ace-editor-->
          <v-ace-editor
            v-model:value="textNew"
            lang="python"
            theme="chrome"
            style="margin-top: 10px; min-height: 80vh; max-height: 80vh"
            v-if="showEditor == true"
          />
        </div>
        <div class="col-sm-1" />
      </div>
      <!-- end newplugin tab -->
    </div>
    <div class="tab-pane fade" id="nav-import" role="tabpanel" aria-labelledby="import-tab">
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
            <button type="button" variant="seconday" size="sm" v-on:click="modalElem.hide()">
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
</style>

<script>
import axios from 'axios'
import { Modal } from 'bootstrap'
//import AceEditor from '../components/ace-editor-vue';
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/theme-chrome'

import importplugin from './plugin/importPlugin.vue'
import download from '@/shared/download'

export default {
  name: 'plugins',
  inheritAttrs: false,
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
      textNew: 'new',
      jsonResumeNameSelected: null,
      btnSaveEnable: false,
      lang: 'python',
      textPlugin: 'test',
      stepDescription: null,
      stepNameFile: null,
      showEditor: false,
      showEditorResume: false,
      nameNewFile: '',
      descriptionNewFile: '',
      titleModal: '',
      pluginSelected: null,
      tabIndex: 0
    }
  },
  options: {},
  created() {
    this.emitter.on('refreshPlugin', (msg) => {
      if (msg == true) this.listPlugin()
      else this.$forceUpdate()
    })
  },
  computed: {},
  watch: {
    $route() {
      this.page = 0
      this.$forceUpdate()
    }
  },
  mounted() {
    this.modalElem = new Modal(document.getElementById('myModal'))
    this.listPlugin()
  },
  methods: {
    importPlugin(value) {
      this.showEditor = false
      console.log(value)
      this.textNew = value
      this.tabIndex = 1
      this.$refs.tab2.click()
      setTimeout(
        function () {
          this.showEditor = true
          this.$wkToast(this.language[this.config.currentLanguage].Plugins.pluginImported)
        }.bind(this),
        100
      )
    },
    isLetter(e) {
      let char = String.fromCharCode(e.keyCode) // Get the character
      if (/^[A-Za-z]+$/.test(char) || char == '_' || char == '-') return true
      // Match with regex
      else e.preventDefault() // If not match, don't add to input text
    },
    newPlugin() {
      this.showEditor = false
      this.textNew = this.config.pluginTemplate
      console.log(this.textNew)
      setTimeout(
        function () {
          this.showEditor = true
        }.bind(this),
        100
      )
    },
    downloadPlugin(index) {
      this.getPlugin(this.listPlugins[index].id, this.listPlugins[index].name, true)
    },
    getPlugin(id, name, isDownload = false) {
      //alert(this.config.timeChecksession)
      this.showEditorResume = false
      axios
        .get(
          this.config.serviceBaseUrl +
            this.config.url.plugins +
            '/' +
            localStorage.projectIdSelected +
            '/' +
            id,
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.textPlugin = JSON.parse(response.data.code)[0]
          this.titleModal = name
          if (isDownload == false) {
            this.pluginSelected = id
            this.modalElem.show()
            setTimeout(
              function () {
                this.showEditorResume = true
              }.bind(this),
              100
            )
          } else {
            download.file(name + '.py', this.textPlugin, 'text/plain')
          }
        })
        .catch((e) => {
          this.error = e
        })
    },
    deletePlugin(index) {
      this.$confirm(
        this.language[this.config.currentLanguage].Plugins.confirmationDelete +
          this.listPlugins[index].name +
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
            this.config.url.plugins +
            '/' +
            localStorage.projectIdSelected +
            '/' +
            this.listPlugins[index].id,
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.listPlugins = response.data
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    savePlugin(filename, code, description) {
      this.emitter.emit('showLoader', true)
      axios
        .post(
          this.config.serviceBaseUrl + this.config.url.plugins,
          {
            name: filename,
            code: [code],
            description: description,
            idProject: localStorage.projectIdSelected
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.listPlugins = response.data
          this.descriptionNewFile = ''
          this.nameNewFile = ''
        })
        .catch((e) => {
          //this.Logout(this)
          this.error = e
        })
    },
    updatePlugin(code) {
      this.emitter.emit('showLoader', true)
      axios
        .put(
          this.config.serviceBaseUrl +
            this.config.url.plugins +
            '/' +
            localStorage.projectIdSelected +
            '/' +
            this.pluginSelected,
          {
            code: [code]
          },
          {
            headers: this.setHeaders()
          }
        )
        .then(
          (response) => {
            this.emitter.emit('showLoader', false)
            this.listPlugins = response.data
            this.jsoneditorModal = false
            this.descriptionNewFile = ''
            this.nameNewFile = ''
          },
          {
            headers: {
              Authorization: 'Bearer ' + localStorage.token
            }
          }
        )
        .catch((e) => {
          //this.Logout(this)
          this.error = e
        })
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
          this.listPlugins = response.data
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    }
  },
  components: {
    VAceEditor,
    importplugin
  }
}
</script>
