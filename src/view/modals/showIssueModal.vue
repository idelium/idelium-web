<template>
  <b-modal
    ref="showIssueModal"
    size="sm"
    class="modal-primary modal-fullscreen1"
    hide-footer
    :title="language[config.currentLanguage].CreateTest.showIssueModal.titleModal"
    v-model="showIssueModal"
    @ok="showIssueModal = false"
    @hide="hideMe()"
  >
    <div>
      <br />
      <br />
      {{ language[config.currentLanguage].CreateTest.showIssueModal.createIssueSentence }}
      <a :href="'https://jira.g2-networks.net/browse/' + issue" target="_new"> {{ issue }} </a>
    </div>
    <div class="footer-modal">
      <button
        type="button"
        variant="primary sm"
        size="sm"
        style="float: right"
        v-on:click="showIssueModal = false"
      >
        {{ language[config.currentLanguage].CreateTest.showIssueModal.btnOK }}
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
import idelium from '../../../shared/idelium'

export default {
  name: 'showIssueModal',
  created() {
    // Using the service bus
    this.emitter.on('openShowIssueModal', (msg) => {
      console.log(msg)
      this.issue = msg
      this.$refs.showIssueModal.show()
    })
  },
  data: () => {
    return {
      showIssueModal: null,
      issue: null
    }
  },
  methods: {
    hideMe() {
      //this.$router.go()
      this.emitter.emit('cleanForm', null)
    }
  }
}
</script>
