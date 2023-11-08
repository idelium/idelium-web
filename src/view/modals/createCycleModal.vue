<template>
  <b-modal
    ref="createCycleModal"
    size="sm"
    class="modal-primary modal-fullscreen1"
    hide-footer
    :title="language[config.currentLanguage].TemplateTest.modalTemplate.titleModal"
    v-model="createCycleModal"
    @ok="createCycleModal = false"
  >
    <div class="alert alert-danger" role="alert" v-if="alertMessage != null">
      {{ alertMessage }}
    </div>
    <div class="alert alert-success" role="succes" v-if="successMessage != null">
      {{ successMessage }}
    </div>

    <div v-if="showBtnIssueCreate == false">
      <b-form-select
        v-model="selectedTypeOfVersion"
        :options="typeOfVersion"
        v-on:input="changeTyeOfVersion(selectedTypeOfVersion)"
        class="mb-3"
      >
      </b-form-select>
      <div v-if="showVersion == true">
        <model-select
          :options="listVersion"
          v-model="versionSelected"
          v-on:input="changeVersion(versionSelected)"
          :placeholder="
            language[config.currentLanguage].TemplateTest.modalCreateCycle.selectVersion
          "
        >
        </model-select>
        <br />
      </div>
      <div v-if="showName == true">
        <input
          class="form-control"
          v-model="nameVersion"
          :placeholder="language[config.currentLanguage].TemplateTest.modalCreateCycle.cycleName"
          v-on:input="changeNameVersion(nameVersion)"
        /><br />
        <date-picker
          v-model="rangeDate"
          range
          :lang="config.currentLanguage"
          format="YYYY-MM-DD"
          v-on:input="changeNameVersion(nameVersion)"
          confirm
        ></date-picker>
        <br />
      </div>
    </div>
    <div class="footer-modal">
      <button
        type="button"
        variant="success sm"
        size="sm"
        v-if="showBtnIssueCreate == false"
        style="float: right; margin-right: 5px"
        v-on:click="createCycle()"
        :disabled="enableOkButton"
      >
        {{ language[config.currentLanguage].TemplateTest.modalCreateCycle.btnCreateCycle }}
      </button>
      <button
        type="button"
        variant="secondary sm"
        v-if="showBtnIssueCreate == false"
        size="sm"
        style="float: right; margin-right: 5px"
        v-on:click="createCycleModal = false"
      >
        {{ language[config.currentLanguage].TemplateTest.btnCancel }}
      </button>
      <button
        type="button"
        variant="secondary sm"
        v-if="showBtnIssueCreate == true"
        size="sm"
        style="float: right; margin-right: 5px"
        v-on:click="createCycleModal = false"
      >
        {{ language[config.currentLanguage].TemplateTest.btnOK }}
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
import axios from 'axios'

import idelium from '../../../shared/idelium'
import DatePicker from 'vue2-datepicker'
import { ModelSelect } from 'vue-search-select'

export default {
  name: 'CreateCycleModal',
  created() {
    // Using the service bus
    this.emitter.on('openCreateCycleModal', (msg) => {
      this.nameTemplate = null
      this.nameIssue = null
      this.alertMessage = null
      this.successMessage = null
      this.checkJira = false
      this.enableUpdateButton = false
      this.showVersion = false
      this.showBtnIssueCreate = false
      this.selectedVersion = null
      this.versionSelected = null
      this.showName = false
      //this.lang=this.language[this.config.currentLanguage].langDatePicker
      this.shortcuts = [
        {
          text: this.language[this.config.currentLanguage].todayDatePicker,
          onClick: () => {
            this.time3 = [new Date(), new Date()]
          }
        }
      ]
      this.enableOkButton = true
      this.selectedTypeOfVersion = null
      this.rangeDate = ''
      this.typeOfVersion = [
        {
          text: this.language[this.config.currentLanguage].TemplateTest.modalCreateCycle
            .selectTypeVersion,
          value: null
        },
        { text: 'Released Version', value: 'releasedVersions' },
        { text: 'Unreleased Version', value: 'unreleasedVersions' }
      ]
      if (msg != null) {
        this.isInsert = false
        this.nameTemplate = msg.templateName
        this.nameVersion = msg.templateName
        this.issues = msg.jiraIssues
        this.idTemplate = msg._id
      }
      this.$refs.createCycleModal.show()
      this.getVersionBoard()
    })
  },
  data: () => {
    return {
      isInsert: false,
      createCycleModal: false,
      showVersion: false,
      versionSelected: null,
      nameTemplate: null,
      alertMessage: null,
      successMessage: null,
      enableOkButton: true,
      nameVersion: null,
      typeOfVersion: [],
      selectedVersion: null,
      selectedTypeOfVersion: null,
      versionResponse: null,
      showName: false,
      showBtnIssueCreate: false,
      rangeDate: '',
      timePickerOptions: {
        start: '00:00',
        step: '00:30',
        end: '23:30'
      },
      issues: []
    }
  },
  methods: {
    getVersionBoard() {
      let url =
        this.config.url.wsJiraServiceURL +
        'zapi/latest/util/versionBoard-list?projectId=' +
        this.$route.params.id
      idelium.jira(this.config.url.jiraProxy, 'get', url).then((returnVal) => {
        console.log(returnVal.http_code)
        if (returnVal.http_code == 200) {
          console.log(returnVal)
          this.versionResponse = returnVal.responseJira
        } else {
          this.alertMessage =
            this.language[
              this.config.currentLanguage
            ].TemplateTest.modalTemplate.alertIssueNotExists
          this.enableUpdateButton = false
        }
      })
    },
    changeTyeOfVersion(id) {
      if (id != null) {
        this.listVersion = []
        for (let i = 0; i < this.versionResponse[id].length; i++) {
          let objectOption = {
            text: this.versionResponse[id][i].label,
            value: this.versionResponse[id][i].value
          }
          this.listVersion.push(objectOption)
        }
        console.log(this.listVersion)
        this.showVersion = true
      } else {
        this.showName = false
        this.showVersion = false
        this.enableOkButton = true
      }
    },
    changeVersion(id) {
      console.log(id)
      this.showName = true
      this.enableOkButton = true
    },
    changeNameVersion(name) {
      if (
        name != null &&
        name.length > 0 &&
        this.rangeDate.length > 0 &&
        this.rangeDate[0] != null &&
        this.rangeDate[1] != null
      ) {
        this.enableOkButton = false
      } else {
        this.enableOkButton = true
      }
    },
    createCycle() {
      console.log('CreateCycle')
      this.emitter.emit('showLoader', true)
      this.$refs.createCycleModal.hide()

      let url = this.config.url.wsJiraServiceURL + 'zapi/latest/cycle'
      let payload = {
        name: this.nameVersion,
        startDate: idelium.convertdateDatePicker(this.rangeDate[0]),
        endDate: idelium.convertdateDatePicker(this.rangeDate[1]),
        projectId: this.$route.params.id,
        versionId: this.versionSelected,
        sprintId: null
      }
      console.log(payload)
      idelium.jira(this.config.url.jiraProxy, 'post', url, payload).then((returnVal) => {
        if (returnVal.http_code == 200) {
          this.addTestToCycle(returnVal.responseJira.id)
        } else {
          this.alertMessage =
            this.language[
              this.config.currentLanguage
            ].TemplateTest.modalTemplate.alertIssueNotExists
        }
      })
    },
    updateCycle(id) {
      console.log('CreateCycle')
      let url = this.config.url.wsJiraServiceURL + 'zapi/latest/cycle'
      let payload = {
        id: id,
        name: this.nameVersion + ' [' + this.versionSelected + ',' + id + ']',
        startDate: idelium.convertdateDatePicker(this.rangeDate[0]),
        endDate: idelium.convertdateDatePicker(this.rangeDate[1]),
        projectId: this.$route.params.id,
        versionId: this.versionSelected,
        sprintId: null
      }
      console.log(payload)
      idelium.jira(this.config.url.jiraProxy, 'put', url, payload).then((returnVal) => {
        if (returnVal.http_code == 200) {
          this.successMessage =
            this.language[this.config.currentLanguage].TemplateTest.modalCreateCycle.cycleCreated
          this.showBtnIssueCreate = true
          this.showVersion = false
          this.selectedVersion = null
          this.createJenkinsFile(this.versionSelected, id)
          this.versionSelected = null
          this.showName = false
        } else {
          this.alertMessage =
            this.language[
              this.config.currentLanguage
            ].TemplateTest.modalTemplate.alertIssueNotExists
        }
      })
    },
    createJenkinsFile(versionId, cycleId) {
      axios
        .post(this.config.url.jenkinsFile, {
          projectId: this.$route.params.id,
          versionId: versionId,
          cycleId: cycleId
        })
        .then((response) => {
          console.log(response)
          this.emitter.emit('showLoader', false)
          this.$refs.createCycleModal.show()
        })
        .catch((e) => {
          this.error = e
        })
    },
    addTestToCycle(cycleId) {
      console.log('addTesCycle')
      let issueToSend = []
      for (let i = 0; i < this.issues.length; i++) {
        issueToSend.push(this.issues[i].key)
      }

      let payload = {
        issues: issueToSend,
        versionId: this.versionSelected,
        cycleId: cycleId,
        projectId: this.$route.params.id,
        method: '1'
      }
      console.log(payload)
      let url = this.config.url.wsJiraServiceURL + 'zapi/latest/execution/addTestsToCycle'
      idelium.jira(this.config.url.jiraProxy, 'post', url, payload).then((returnVal) => {
        if (returnVal.http_code == 200) {
          this.updateCycle(cycleId)
        } else {
          this.alertMessage =
            this.language[
              this.config.currentLanguage
            ].TemplateTest.modalTemplate.alertIssueNotExists
        }
      })
    }
  },
  components: {
    ModelSelect,
    DatePicker
  }
}
</script>
