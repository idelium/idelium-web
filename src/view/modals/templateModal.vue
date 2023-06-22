<template>
  <b-modal
    ref="templateModal"
    size="sm"
    class="modal-primary modal-fullscreen1"
    hide-footer
    :title="language[config.currentLanguage].TemplateTest.modalTemplate.titleModal"
    v-model="templateModal"
    @ok="templateModal = false"
  >
    <div class="alert alert-danger" role="alert" v-if="alertMessage != null">
      {{ alertMessage }}
    </div>
    <input
      type="text"
      size="sm"
      v-model="nameTemplate"
      v-on:input="checkNameTemplate()"
      :placeholder="
        language[config.currentLanguage].TemplateTest.modalTemplate.placeholderNameTemplate
      "
    />
    <br />
    <br />
    <div class="input-group">
      <input
        type="text"
        v-model.lazy="term"
        v-debounce="delay"
        size="sm"
        :placeholder="
          language[config.currentLanguage].TemplateTest.modalTemplate.placeholderAddIssue
        "
      />
      <span size="sm" class="input-group-btn">
        <button
          type="button"
          variant="primary sm"
          style="float: right"
          v-on:click="addIssue()"
          :disabled="enableAddButton == false"
        >
          {{ language[config.currentLanguage].TemplateTest.modalTemplate.btnAdd }}
        </button>
      </span>
    </div>
    {{ this.textSearch }}
    <div v-if="showListMode == true">
      <select v-model="modelSelected" v-on:input="term = modelSelected">
        <option v-for="(issue, index) in searchModeResult" v-bind:key="index" :value="issue.key">
          {{ issue.key }} | <span v-html="issue.summary"></span>
        </option>
      </select>
    </div>
    <!--button class="btn btn-primary mt-5" style="width:100%;" type="button" v-on:click="testIssue()" :disabled="checkJira == true">
                <span class="spinner-border spinner-border-sm" role="status" v-if="checkJira == true"></span>
                    {{language[config.currentLanguage].TemplateTest.modalTemplate.btnTest}}
                </button-->
    <div>
      <br />
      <div class="table-responsive">
        <table class="table">
          <tr v-for="(issue, index) in issues" v-bind:key="index" class="d-flex">
            <td valign="top" class="col-sm-3">
              <b-link variant="default sm" v-on:click="issues.splice(index, 1)">
                <i class="cui-trash icons font-2xl d-block"></i>
              </b-link>
            </td>
            <td class="col-sm-3">
              <a :href="'https://jira.g2-networks.net/browse/' + issue.key" target="_new">
                {{ issue.key }}
              </a>
            </td>
            <td align="left" class="col-sm-6">
              {{ issue.summary }}
            </td>
          </tr>
        </table>
      </div>
    </div>
    <div class="footer-modal">
      <button
        type="button"
        variant="primary sm"
        size="sm"
        style="float: right"
        v-on:click="actionInserUpdate()"
        :disabled="this.enableUpdateButton == false"
      >
        {{ insertUpdateLabel }}
      </button>
      <button
        type="button"
        variant="secondary sm"
        size="sm"
        style="float: right; margin-right: 5px"
        v-on:click="templateModal = false"
      >
        {{ language[config.currentLanguage].TemplateTest.btnCancel }}
      </button>
    </div>
  </b-modal>
</template>
<style>
.modal-fullscreen1 .modal {
  padding: 0 !important;
}
.modal-fullscreen1 .modal-dialog {
  max-width: 100%;
  height: 100%;
  margin: 0;
}
.modal-fullscreen1 .modal-content {
  border-radius: 0;
  min-height: 100%;
  float: left;
  left: 25%;
  top: 20%;
  width: 50%;
  height: 100%;
}
</style>
<script>
import { ModelSelect } from 'vue-search-select'
import idelium from '../../../shared/idelium'
import debounce from 'v-debounce'

export default {
  name: 'templateModal',
  created() {
    // Using the service bus
    this.emitter.on('openTemplateModal', (msg) => {
      this.nameTemplate = ''
      this.nameIssue = null
      this.alertMessage = null
      this.checkJira = false
      this.showListMode = false
      this.enableUpdateButton = false
      this.enableAddButton = false
      this.issues = []
      this.nameIssue = ''
      this.jiraTestOk = []
      if (msg != null) {
        this.isInsert = false
        this.nameTemplate = msg.templateName
        this.issues = msg.jiraIssues
        this.idTemplate = msg._id
        this.insertUpdateLabel =
          this.language[this.config.currentLanguage].TemplateTest.modalTemplate.btnUpdate
      } else {
        this.isInsert = true
        this.insertUpdateLabel =
          this.language[this.config.currentLanguage].TemplateTest.modalTemplate.btnInsert
      }
      this.$refs.templateModal.show()
    })
  },
  data: () => {
    return {
      delay: 1000,
      term: '',
      isInsert: false,
      templateModal: false,
      nameTemplate: '',
      nameIssue: null,
      showDefaultOK: null,
      insertUpdateLabel: null,
      idTemplate: null,
      alertMessage: null,
      checkJira: false,
      showListMode: false,
      searchModeResult: [],
      listVersion: [],
      enableUpdateButton: false,
      enableAddButton: false,
      jiraTestOk: [],
      issues: [],
      closedItems: []
    }
  },
  methods: {
    addIssue() {
      if (this.nameIssue == null) {
        this.alertMessage =
          this.language[this.config.currentLanguage].TemplateTest.modalTemplate.alertIssueEmpty
        return false
      }
      let findSteps = this.searchModeResult.filter((d) => d.key == this.nameIssue)
      console.log(findSteps)
      this.jiraTestOk = []
      //this.issues.push(this.nameIssue.toUpperCase())
      let objectToSave = findSteps[0]
      this.issues.push({
        key: objectToSave.key.toUpperCase(),
        summary: objectToSave.summary
      })
      //this.issues.push(this.nameIssue.toUpperCase())
      this.showListMode = false
      this.textSearch = ''
      this.searchModeResult = []
      this.term = ''
      this.nameIssue = null
      this.alertMessage = null
      this.checkNameTemplate()
      this.enableAddButton = false
    },
    testIssue() {
      this.alertMessage = null
      this.jiraTestOk = []
      this.checkJira = true
      this.enableUpdateButton = true
      for (let i = 0; i < this.issues.length; i++) {
        console.log(this.issues[i])
        let url = this.config.url.wsJiraServiceURL + 'api/latest/issue/' + this.issues[i]
        idelium.jira(this.config.url.jiraProxy, 'get', url).then((returnVal) => {
          if (returnVal.http_code == 200) {
            this.jiraTestOk.push(true)
            this.enableUpdateButton = true
          } else {
            this.alertMessage =
              this.language[
                this.config.currentLanguage
              ].TemplateTest.modalTemplate.alertIssueNotExists
            this.jiraTestOk.push(false)
            this.enableUpdateButton = false
          }
          if (i == this.issues.length - 1) this.checkJira = false
        })
      }
      if (this.issues.length == 0) {
        this.enableUpdateButton = false
      }
      this.alertMessage = null
    },
    actionInserUpdate() {
      if (this.nameTemplate == null) {
        this.alertMessage =
          this.language[
            this.config.currentLanguage
          ].TemplateTest.modalTemplate.alertNameTemplateEmpty
        return false
      }
      if (this.issues.length == 0) {
        this.alertMessage =
          this.language[this.config.currentLanguage].TemplateTest.modalTemplate.alertIssuesEmpty
        return false
      }
      let payload = {
        templateName: this.nameTemplate,
        projectId: this.$route.params.id,
        jiraIssues: this.issues
      }
      if (this.isInsert == true) {
        idelium
          .mongo(this.config.url.mongoProxy, 'post', '/templates', JSON.stringify(payload))
          .then((returnVal) => {
            console.log(returnVal)
            if (returnVal.result == 'ko') {
              this.manageErrorResponse(returnVal)
            } else {
              this.alertMessage = null
              this.emitter.emit('refreshListTemplates', null)
              this.$refs.templateModal.hide()
            }
          })
      } else {
        idelium
          .mongo(
            this.config.url.mongoProxy,
            'put',
            '/templates/' + this.idTemplate,
            JSON.stringify(payload)
          )
          .then((returnVal) => {
            console.log(returnVal)
            if (returnVal.result == 'ko') {
              this.manageErrorResponse(returnVal)
            } else {
              this.alertMessage = null
              this.emitter.emit('refreshListTemplates', null)
              this.$refs.templateModal.hide()
            }
          })
      }
    },
    checkNameTemplate() {
      if (this.nameTemplate.length > 0 && this.issues.length > 0) {
        this.enableUpdateButton = true
      }
    },
    searchTestMode(searchText) {
      if (searchText.length > 3) {
        let url =
          this.config.url.wsJiraServiceURL +
          'zapi/latest/issues?currentJQL=type%3DTest&currentIssueKey=&currentProjectId=' +
          this.$route.params.id +
          '&query=' +
          searchText
        idelium.jira(this.config.url.jiraProxy, 'get', url).then((returnVal) => {
          if (returnVal.http_code == 200) {
            let searchId = returnVal.responseJira.sections.length - 1
            if (typeof returnVal.responseJira.sections[searchId].issues != 'undefined') {
              let searchId = returnVal.responseJira.sections.length - 1
              this.searchModeResult = returnVal.responseJira.sections[searchId].issues
              this.textSearch = returnVal.responseJira.sections[searchId].sub
              this.enableAddButton = true
              this.showListMode = true
              let findSteps = this.searchModeResult.filter((d) => d.key == searchText)
              console.log(findSteps)
              if (findSteps.length == 0) {
                this.enableAddButton = false
              }
            } else {
              this.showListMode = false
              this.textSearch = returnVal.responseJira.sections[searchId].msg
              this.enableAddButton = false
              this.searchModeResult = []
              this.nameIssue = null
            }
          }
        })
      } else {
        this.searchModeResult = []
      }
    }
  },
  watch: {
    term() {
      // Do something with search nameIssue after it debounced
      this.nameIssue = this.term
      this.searchTestMode(this.nameIssue)
    }
  },
  directives: {
    debounce
  },
  components: {
    ModelSelect
  }
}
</script>
