<template>
  <!-- Modal -->
  <div
    class="modal fade"
    ref="mymodal"
    id="accountModal"
    tabindex="-1"
    aria-labelledby="accountModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="accountModalLabel">
            <font-awesome-icon icon="user" class="iconClass" /> {{ titleModal }}
          </h5>
          <button
            type="button"
            class="btn-close"
            :aria-label="language[config.currentLanguage].Accounts.btnCancel"
            @click="hideModal()"
          ></button>
        </div>
        <div class="modal-body">
          <div class="account-form-intro">
            {{ language[config.currentLanguage].Accounts.formHelp }}
          </div>
          <form @submit.prevent="sendData()">
            <div class="account-form-mode">
              {{
                isModifyType
                  ? language[config.currentLanguage].Accounts.modifyFormHelp
                  : language[config.currentLanguage].Accounts.createFormHelp
              }}
            </div>
            <div class="mb-3" v-if="!isModifyType">
              <label class="form-label" for="account-email">
                {{ language[config.currentLanguage].Profile.email }}
              </label>
              <input
                class="form-control"
                :disabled="isModifyType"
                id="account-email"
                :placeholder="
                  language[config.currentLanguage].Accounts.placeholderEmail
                "
                v-model="email"
                type="email"
                :class="{ 'is-invalid': emailCheck == false }"
                aria-describedby="account-email-feedback"
              />
              <div
                class="invalid-feedback d-block"
                id="account-email-feedback"
                v-if="emailCheck == false"
              >
                {{ language[config.currentLanguage].Accounts.accountExist }}
              </div>
              <div class="form-text" v-else>
                {{ language[config.currentLanguage].Accounts.emailHelp }}
              </div>
            </div>
            <div class="account-readonly-summary" v-else>
              <div>
                <span>{{ language[config.currentLanguage].Profile.email }}</span>
                <strong>{{ email }}</strong>
              </div>
              <div v-if="isSuperAdmin == true">
                <span>{{ language[config.currentLanguage].Accounts.costumer }}</span>
                <strong>{{ currentCustomerLabel }}</strong>
              </div>
              <div>
                <span>{{ language[config.currentLanguage].Accounts.role }}</span>
                <strong>{{ currentRoleLabel }}</strong>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label" for="account-name">
                {{ language[config.currentLanguage].Accounts.name }}
              </label>
              <input
                class="form-control"
                id="account-name"
                :placeholder="
                  language[config.currentLanguage].Accounts.placeholderName
                "
                v-model="name"
                :class="{ 'is-invalid': checkName == false && name.length > 0 }"
              />
              <div class="form-text">
                {{ language[config.currentLanguage].Accounts.nameHelp }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label" for="account-password">
                {{ language[config.currentLanguage].Profile.password }}
              </label>
              <input
                class="form-control"
                id="account-password"
                :placeholder="
                  language[config.currentLanguage].Accounts.placeholderPassword
                "
                v-model="password"
                type="password"
                autocomplete="new-password"
              />
              <div class="form-text">
                {{ language[config.currentLanguage].Accounts.passwordHelp }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label" for="account-confirm-password">
                {{ language[config.currentLanguage].Profile.confirmPassword }}
              </label>
              <input
                class="form-control"
                id="account-confirm-password"
                :disabled="!checkPassword"
                :placeholder="
                  language[config.currentLanguage].Accounts
                    .placeholderConfirmPassword
                "
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
              />
            </div>
            <div class="mb-3" v-if="isSuperAdmin == true && !isModifyType">
              <label class="form-label" for="account-customer">
                {{ language[config.currentLanguage].Accounts.costumer }}
              </label>
              <select
                class="form-select"
                id="account-customer"
                v-model="selectedCostumer"
                :disabled="isModifyType"
              >
                <option :value="null" disabled>
                  {{
                    language[config.currentLanguage].Accounts
                      .placeholderCostumer
                  }}
                </option>
                <option
                  v-for="item in costumers"
                  v-bind:key="item.id"
                  :value="item.id"
                >
                  {{ item.costumer }}
                </option>
              </select>
            </div>
            <div class="mb-3" v-if="!isModifyType">
              <label class="form-label" for="account-role">
                {{ language[config.currentLanguage].Accounts.role }}
              </label>
              <select
                class="form-select"
                id="account-role"
                v-model="selectedRole"
                :disabled="isModifyType"
              >
                <option :value="null" disabled>
                  {{
                    language[config.currentLanguage].Accounts.placeholderRole
                  }}
                </option>
                <option
                  v-for="item in roles"
                  v-bind:key="item.id"
                  :value="item.id"
                >
                  {{ item.name }}
                </option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            @click="hideModal()"
          >
            {{ language[config.currentLanguage].Accounts.btnCancel }}
          </button>
          <button
            type="button"
            class="btn btn-warning btn-sm"
            @click="sendData()"
            :disabled="disableButton"
          >
            {{ labelButtonAction }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from "bootstrap";
import validatePassword from "@/shared/validatePassword";
import { hideModalSafely } from "@/shared/bootstrapModal";
export default {
  props: ["arrayAccounts", "roles", "costumers", "isSuperAdmin"],
  emits: ["updateData"],
  data() {
    return {
      modalElem: null,
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
      checkPassword: false,
      checkName: false,
      selectedRole: null,
      selectedCostumer: null,
      type: "",
      titleModal: "",
      isModifyType: true,
      labelButtonAction: null,
      disableButton: true,
      emailCheck: true,
      dataAccount: {
        id: null,
        email: "",
        name: "",
        role: null,
        idCostumer: null,
      },
    };
  },
  mounted() {
    this.modalElem = new Modal(document.getElementById("accountModal"));
  },
  computed: {
    currentRoleLabel() {
      let role = this.roles.find(({ id }) => id === this.selectedRole);
      return role ? role.name : "-";
    },
    currentCustomerLabel() {
      let customer = this.costumers.find(({ id }) => id === this.selectedCostumer);
      return customer ? customer.costumer : "-";
    },
  },
  watch: {
    password() {
      this.checkPassword = validatePassword.validPassword(this.password);
      this.activateButton();
    },
    confirmPassword() {
      this.activateButton();
    },
    name() {
      this.activateButton();
    },
    email() {
      this.activateButton();
    },
    selectedRole() {
      this.activateButton();
    },
    selectedCostumer() {
      this.activateButton();
    },
  },
  methods: {
    activateButton() {
      if (this.name == "") this.checkName = false;
      else this.checkName = true;
      if (this.type == "modify") {
        if (
          this.checkName == false ||
          this.checkPassword == false ||
          this.password != this.confirmPassword
        ) {
          this.disableButton = true;
        } else {
          this.disableButton = false;
        }
      } else {
        if (
          this.checkPassword == false ||
          this.password != this.confirmPassword ||
          this.selectedRole == null ||
          (this.selectedCostumer == null && this.isSuperAdmin == true) ||
          this.email.length < 3 ||
          this.checkName == false
        ) {
          this.disableButton = true;
        } else {
          this.disableButton = false;
        }
        let find = this.arrayAccounts.find(({ email }) => email === this.email);
        if (find) {
          this.disableButton = true;
          this.emailCheck = false;
        } else {
          this.emailCheck = true;
        }
      }
    },
    showModal(dataAccount, type) {
      this.type = type;
      this.password = "";
      this.confirmPassword = "";
      this.name = "";
      this.checkPassword = false;
      this.checkName = false;
      this.disableButton = true;
      this.emailCheck = true;
      if (type == "modify") {
        this.isModifyType = true;
        this.dataAccount = dataAccount;
        this.email = this.dataAccount.email;
        this.name = this.dataAccount.name;
        this.selectedRole = this.dataAccount.role;
        this.selectedCostumer = this.dataAccount.idCostumer;
        this.titleModal =
          this.language[this.config.currentLanguage].Accounts.modal
            .modifyAccount +
          " " +
          this.email;
        this.labelButtonAction =
          this.language[
            this.config.currentLanguage
          ].Accounts.modal.modifyAccount;
      } else {
        this.isModifyType = false;
        this.selectedRole = null;
        this.selectedCostumer = null;
        this.email = "";
        this.dataAccount = {
          id: null,
          email: "",
          name: "",
        };
        this.titleModal =
          this.language[this.config.currentLanguage].Accounts.modal.addAccount;
        this.labelButtonAction =
          this.language[this.config.currentLanguage].Accounts.modal.addAccount;
      }
      this.activateButton();
      this.modalElem.show();
    },
    sendData() {
      let sendData = {
        name: this.name,
        password: this.password,
        id: this.dataAccount.id,
        type: this.type,
      };
      if (this.type == "new") {
        sendData.email = this.email;
        sendData.role = this.selectedRole;
        sendData.idCostumer = this.selectedCostumer;
      }
      this.$emit("updateData", sendData);
      hideModalSafely(this.$refs.mymodal, this.modalElem);
    },
    hideModal() {
      hideModalSafely(this.$refs.mymodal, this.modalElem);
    },
    toggleModal() {
      // this.$refs['my-modal'].toggle('#toggle-btn')
    },
  },
};
</script>
