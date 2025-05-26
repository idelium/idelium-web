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
          <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <label for="input-live">{{
            this.language[this.config.currentLanguage].Accounts.titleModal
          }}</label>
          <div class="d-block text-center">
            <input
              class="form-control"
              :disabled="isModifyType"
              placeholder="email"
              v-model="email"
              style="margin-top: 5px"
              aria-describedby="input-live-help input-live-feedback"
            />
            <div
              class="alert alert-danger d-flex align-items-center"
              role="alert"
              v-if="emailCheck == false"
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
                {{ this.language[this.config.currentLanguage].Accounts.accountExist }}
              </div>
            </div>
            <input
              class="form-control"
              :state="checkName"
              placeholder="name"
              v-model="name"
              style="margin-top: 5px"
            />
            <input
              class="form-control"
              :state="checkPassword"
              placeholder="password"
              v-model="password"
              style="margin-top: 5px"
              type="password"
            />
            <input
              class="form-control"
              :state="password == confirmPassword && confirmPassword != ''"
              :disabled="!checkPassword"
              placeholder="confirm password"
              v-model="confirmPassword"
              style="margin-top: 5px"
              type="password"
            />
            <select
              class="form-select form-select-sm"
              aria-label="Default select example"
              v-model="selectedCostumer"
              :disabled="isModifyType"
              style="margin-top: 5px"
              v-if="isSuperAdmin == true"
            >
              <option v-for="item in costumers" v-bind:key="item" :value="item.id">
                {{ item.costumer }}
              </option>
            </select>
            <select
              class="form-select form-select-sm"
              aria-label="Default select example"
              v-model="selectedRole"
              style="margin-top: 5px"
              :disabled="isModifyType"
            >
              <option v-for="item in roles" v-bind:key="item" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </div>
          <button
            type="button"
            class="btn btn-warning"
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

  <div class="modal" id="my-modal" ref="my-modal" hide-footer tabindex="-1">
    <div class="modal-header">
      <h5 class="modal-title">{{ titleModal }}</h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap'
import validatePassword from '@/shared/validatePassword'
export default {
  props: ['arrayAccounts', 'roles', 'costumers', 'isSuperAdmin'],
  data() {
    return {
      modalElem: null,
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
      checkPassword: false,
      checkName: false,
      selectedRole: null,
      selectedCostumer: null,
      type: '',
      titleModal: '',
      isModifyType: true,
      labelButtonAction: null,
      disableButton: true,
      emailCheck: true,
      dataAccount: {
        id: null,
        email: '',
        name: '',
        role: null,
        idCostumer: null
      }
    }
  },
  mounted() {
    this.modalElem = new Modal(document.getElementById('myModal'))
  },
  watch: {
    password() {
      this.checkPassword = validatePassword.validPassword(this.password)
      this.activateButton()
    },
    confirmPassword() {
      this.activateButton()
    },
    name() {
      this.activateButton()
    },
    email() {
      this.activateButton()
    },
    selectedRole() {
      this.activateButton()
    }
  },
  methods: {
    activateButton() {
      if (this.name == '') this.checkName = false
      else this.checkName = true
      if (this.type == 'modify') {
        if (
          this.checkPassword == false ||
          this.password != this.confirmPassword ||
          this.selectedRole == null ||
          (this.selectedCostumer == null && this.isSuperAdmin == true)
        ) {
          this.disableButton = true
        } else {
          this.disableButton = false
        }
      } else {
        if (
          this.checkPassword == false ||
          this.password != this.confirmPassword ||
          this.selectedRole == null ||
          (this.selectedCostumer == null && this.isSuperAdmin == true) ||
          this.email.length < 3
        ) {
          this.disableButton = true
        } else {
          this.disableButton = false
        }
        let find = this.arrayAccounts.find(({ email }) => email === this.email)
        if (find) {
          this.disableButton = true
          this.emailCheck = false
        } else {
          this.emailCheck = true
        }
      }
    },
    showModal(dataAccount, type) {
      this.type = type
      this.password = ''
      this.confirmPassword = ''
      this.name = ''
      if (type == 'modify') {
        this.isModifyType = true
        this.dataAccount = dataAccount
        this.email = this.dataAccount.email
        this.name = this.dataAccount.name
        this.selectedRole = this.dataAccount.role
        this.selectedCostumer = this.dataAccount.idCostumer
        this.titleModal =
          this.language[this.config.currentLanguage].Accounts.modal.modifyAccount + ' ' + this.email
        this.labelButtonAction =
          this.language[this.config.currentLanguage].Accounts.modal.modifyAccount
      } else {
        this.isModifyType = false
        this.selectedRole = null
        this.isModifyType = false
        this.selectedRole = null
        this.selectedCostumer = null
        this.email = ''
        this.dataAccount = {
          id: null,
          email: '',
          name: ''
        }
        this.titleModal = this.language[this.config.currentLanguage].Accounts.modal.addAccount
        this.labelButtonAction =
          this.language[this.config.currentLanguage].Accounts.modal.addAccount
      }
      console.log(this.$refs.mymodal)
      this.modalElem.show()
    },
    sendData() {
      let sendData = {
        name: this.name,
        email: this.email,
        password: this.password,
        role: this.selectedRole,
        idCostumer: this.selectedCostumer,
        id: this.dataAccount.id,
        type: this.type
      }
      this.$emit('updateData', sendData)
      this.modalElem.hide()
    },
    hideModal() {
      this.modalElem.hide()
    },
    toggleModal() {
      // this.$refs['my-modal'].toggle('#toggle-btn')
    }
  }
}
</script>
