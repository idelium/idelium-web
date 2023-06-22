<template>
  <b-modal
    ref="errorModal"
    class="modal-warning"
    hide-footer
    size="lg"
    title=""
    v-model="errorModal"
    @ok="errorModal = false"
  >
    <div>
      {{ titleErrorModal }}
    </div>
    <div>
      {{ messageErrorModal }}
    </div>
    <div class="footer-modal">
      <button
        type="button"
        variant="primary sm"
        style="float: right"
        v-on:click="errorModal = false"
        v-if="showDefaultOK == true"
      >
        {{ language[configDeployer.currentLanguage].ListVersion.btnOK }}
      </button>
      <button
        type="button"
        variant="primary sm"
        style="float: right"
        v-on:click="$router.push({ path: '/pages/login' })"
        v-if="showDefaultOK == false"
      >
        {{ language[configDeployer.currentLanguage].ListVersion.btnOK }}
      </button>
    </div>
  </b-modal>
</template>
<script>
export default {
  name: 'errorModal',
  created() {
    // Using the service bus
    this.emitter.on('openErrorModal', (msg) => {
      console.log(msg)
      this.titleErrorModal = msg.title
      this.messageErrorModal = msg.message
      this.showDefaultOK = msg.showDefaultOK
      this.$refs.errorModal.show()
    })
  },
  data: () => {
    return {
      errorModal: false,
      titleErrorModal: null,
      messageErrorModal: null,
      showDefaultOK: null
    }
  }
}
</script>
