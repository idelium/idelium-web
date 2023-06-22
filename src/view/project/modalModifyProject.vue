<template>
  <div>
    <div
      class="modal fade"
      ref="mymodal"
      id="myModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
      :no-close-on-esc="arrayProjects.length == 0"
      :hide-header-close="arrayProjects.length == 0"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              <font-awesome-icon icon="vial" class="iconClass" /> {{ titleModal }}
            </h5>
          </div>
          <div class="d-block text-center">
            <input
              class="form-control"
              id="input-none"
              :disabled="isModifyType"
              placeholder="name"
              v-model="name"
              style="margin-top: 5px"
              :state="nameCheck"
              aria-describedby="input-live-help input-live-feedback"
            />
            <b-form-invalid-feedback id="input-live-feedback">
              name is duplicated
            </b-form-invalid-feedback>
            <input
              class="form-control"
              id="input-none"
              placeholder="description"
              v-model="projectDescription"
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
  props: ['arrayProjects'],

  data() {
    return {
      name: '',
      projectDescription: '',
      labelButtonAction: '',
      disableButton: true,
      nameCheck: true,
      isModifyType: true,
      titleModal: this.language[this.config.currentLanguage].Projects.titleAddModal,
      type: '',
      dataProject: {
        id: null,
        name: '',
        description: ''
      },
      modalElem: null
    }
  },
  mounted() {
    this.modalElem = new Modal(document.getElementById('myModal'))
  },
  watch: {
    projectDescription() {
      this.activateButton()
    },
    name() {
      this.activateButton()
    }
  },
  methods: {
    activateButton() {
      if (this.name.length == 0 || this.projectDescription.length == 0) {
        this.disableButton = true
      } else {
        this.disableButton = false
      }
      let find = this.arrayProjects.find(({ name }) => name === this.name)
      if (this.type == 'new') {
        if (find) {
          this.disableButton = true
          this.nameCheck = false
        } else {
          this.nameCheck = true
        }
      }
    },
    showModal(dataProject, type) {
      console.log('show Modal:' + type)
      this.type = type
      this.projectDescription = ''
      this.confirmPassword = ''

      if (type == 'modify') {
        this.isModifyType = true
        this.dataProject = dataProject
        this.titleModal = this.language[this.config.currentLanguage].Projects.titleModifyModal
        this.name = this.dataProject.name
        this.projectDescription = this.dataProject.description
        this.labelButtonAction =
          this.language[this.config.currentLanguage].Projects.btnModalModifyProject
      } else {
        this.isModifyType = false
        this.selectedRole = null
        this.isModifyType = false
        if (this.arrayProjects.length == 0)
          this.titleModal = this.language[this.config.currentLanguage].Projects.titleFirstAddModal
        else this.titleModal = this.language[this.config.currentLanguage].Projects.titleAddModal
        this.name = ''
        this.dataProject = {
          id: null,
          name: ''
        }
        this.labelButtonAction = this.language[this.config.currentLanguage].Projects.btnAddProject
      }
      this.modalElem.show()
    },
    sendData() {
      let sendData = {
        name: this.name,
        description: this.projectDescription,
        id: this.dataProject.id,
        type: this.type
      }
      this.$emit('updateData', sendData)
      this.modalElem.hide()
    },
    hideModal() {
      if (this.arrayProjects.length == 0) {
        setTimeout(
          function () {
            this.modalElem.show()
          }.bind(this),
          100
        )
      }
    },
    toggleModal() {
      // We pass the ID of the button that we want to return focus to
      // when the modal has hidden
      this.modalElem.toggle('#toggle-btn')
    }
  }
}
</script>
