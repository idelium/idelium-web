<template>
  <!-- Modal -->
  <div
    class="modal fade"
    ref="mymodal"
    id="myModal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
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
          <div class="d-block text-center">
            <input
              class="form-control"
              id="input-none"
              placeholder="costumer"
              v-model="costumer"
              style="margin-top: 5px"
              aria-describedby="input-live-help input-live-feedback"
            />
            <div
              class="alert alert-danger d-flex align-items-center"
              role="alert"
              v-if="costumerCheck == false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"
                viewBox="0 0 16 16"
                role="img"
                aria-label="Warning:"
              >
                <path
                  d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
                />
              </svg>
              <div>
                {{ this.language[this.config.currentLanguage].Costumers.costumerIsDuplicated }}
              </div>
            </div>
            <input
              class="form-control"
              id="input-none"
              placeholder="description"
              v-model="costumerDescription"
              style="margin-top: 5px"
            />
          </div>
          <button
            type="button"
            size="sm"
            class="btn btn-warning"
            block
            @click="sendData()"
            :disabled="disableButton"
            style="flow: right; margin-top: 5px"
          >
            {{ labelButtonAction }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap'
export default {
  props: ['arrayCostumers'],

  data() {
    return {
      modalElem: null,
      costumer: '',
      costumerDescription: '',
      labelButtonAction: '',
      disableButton: true,
      costumerCheck: true,
      isModifyType: true,
      titleModal: this.language[this.config.currentLanguage].Costumers.titleAddModal,
      type: '',
      dataCostumer: {
        id: null,
        costumer: '',
        description: ''
      }
    }
  },
  mounted() {
    this.modalElem = new Modal(document.getElementById('myModal'))
  },
  watch: {
    costumerDescription() {
      this.activateButton()
    },
    costumer() {
      this.activateButton()
    }
  },
  methods: {
    activateButton() {
      if (this.costumer.length == 0 || this.costumerDescription.length == 0) {
        this.disableButton = true
      } else {
        this.disableButton = false
      }
      let find = this.arrayCostumers.find(({ costumer }) => costumer === this.costumer)
      if (this.type == 'new') {
        if (find) {
          this.disableButton = true
          this.costumerCheck = false
        } else {
          this.costumerCheck = true
        }
      }
    },
    showModal(dataCostumer, type) {
      console.log('show Modal:' + type)
      this.type = type
      this.costumerDescription = ''
      this.confirmPassword = ''
      this.costumer = ''

      if (type == 'modify') {
        this.isModifyType = true
        this.dataCostumer = dataCostumer
        this.titleModal = this.language[this.config.currentLanguage].Costumers.titleModifyModal
        this.costumer = this.dataCostumer.costumer
        this.costumerDescription = this.dataCostumer.description
        this.labelButtonAction =
          this.language[this.config.currentLanguage].Costumers.btnModalModifyCostumer
      } else {
        this.isModifyType = false
        this.selectedRole = null
        this.isModifyType = false
        this.costumer = ''
        this.dataCostumer = {
          id: null,
          costumer: ''
        }
        this.labelButtonAction = this.language[this.config.currentLanguage].Costumers.btnAddCostumer
      }
      this.modalElem.show()
    },
    sendData() {
      let sendData = {
        costumer: this.costumer,
        description: this.costumerDescription,
        id: this.dataCostumer.id,
        type: this.type
      }
      this.$emit('updateData', sendData)
      this.modalElem.hide()
    },
    hideModal() {
      this.modalElem.hide()
    },
    toggleModal() {
      // We pass the ID of the button that we want to return focus to
      // when the modal has hidden
      this.$refs['my-modal'].toggle('#toggle-btn')
    }
  }
}
</script>
