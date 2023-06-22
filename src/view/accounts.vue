<template>
  <div class="costum">
    <div class="row">
      <div class="col-sm-11">
        <button
          type="button"
          size="sm"
          class="btn btn-primary"
          style="margin-bottom: 5px; float: right"
          v-on:click="showModal(null, 'new')"
        >
          {{ language[config.currentLanguage].Accounts.newAccount }}
        </button>
      </div>
      <div class="col-sm-1" />
    </div>
    <div class="row">
      <div class="col-sm-1" />
      <div class="col">
        <table class="table table-striped costum">
          <thead>
            <tr>
              <th scope="col">
                {{ language[config.currentLanguage].Accounts.id }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Accounts.account }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Accounts.name }}
              </th>
              <th scope="col" v-if="isSuperAdmin == true">
                {{ language[config.currentLanguage].Accounts.costumer }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Accounts.role }}
              </th>
              <th scope="col"></th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(account, index) in arrayAccounts" v-bind:key="index">
              <td>{{ account.id }}</td>
              <td>
                <span v-if="idSelected != account.id" style="min-width: 100%">{{
                  account.email
                }}</span>
              </td>
              <td>
                <span v-if="idSelected != account.id" style="min-width: 100%">{{
                  account.name
                }}</span>
              </td>
              <td v-if="isSuperAdmin == true">
                <span v-if="idSelected != account.id" style="min-width: 100%">{{
                  account.costumer
                }}</span>
              </td>
              <td>
                <span v-if="idSelected != account.id" style="min-width: 100%">{{
                  account.roleName
                }}</span>
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-warning"
                  v-on:click="showModal(index, 'modify')"
                >
                  {{ language[config.currentLanguage].Accounts.btnModify }}
                </button>
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-danger"
                  :disabled="account.email == 'admin'"
                  v-on:click="deleteAccount(account.id)"
                >
                  {{ language[config.currentLanguage].Accounts.btnDelete }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-sm-1" />
    </div>
    <modalModifyAccount
      ref="modifyModal"
      :arrayAccounts="arrayAccounts"
      :roles="arrayRoles"
      :costumers="arrayCostumers"
      :isSuperAdmin="isSuperAdmin"
      v-on:updateData="updateData"
    />
  </div>
</template>
<script>
import axios from 'axios'
import modalModifyAccount from './account/modalModifyAccount.vue'

export default {
  created() {
    console.log('accounts')
    this.getAccounts()
    this.$gtag.event('idelium', { method: 'account' })
    this.emitter.on('refreshAccount', () => {
      this.$forceUpdate()
    })
  },
  watch: {
    $route() {
      this.$gtag.event('idelium', { method: 'account' })
      this.$forceUpdate()
    }
  },
  data() {
    return {
      newaccount: null,
      arrayAccounts: [],
      arrayRoles: [],
      arrayCostumers: [],
      idSelected: null,
      accountToModify: null,
      isSuperAdmin: false
    }
  },
  methods: {
    modify(id, name) {
      this.idSelected = id
      this.accountToModify = name
    },
    modifyRoles(id, name) {
      this.idSelected = id
      this.rolesToModify = name
    },
    deleteAccount(id) {
      if (this.config.demo == true) {
        alert('is a demo')
        return false
      }
      this.$confirm(
        this.language[this.config.currentLanguage].Accounts.confirmDeleteAccount,
        '',
        'warning'
      ).then(() => this.deleteAction(id))
    },
    deleteAction(id) {
      this.emitter.emit('showLoader', true)
      axios
        .delete(this.config.serviceBaseUrl + this.config.url.accounts + '/' + id, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.arrayAccounts = response.data
          this.emitter.emit('showLoader', false)
        })
        .catch((e) => {
          this.emitter.emit('showLoader', false)
          this.Logout(this, e)
          this.error = e
        })
    },
    getRoles() {
      axios
        .get(this.config.serviceBaseUrl + this.config.url.roles, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.arrayRoles = response.data
          this.getCostumers()
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    getCostumers() {
      axios
        .get(this.config.serviceBaseUrl + this.config.url.costumers, {
          headers: this.setHeaders()
        })
        .then((response) => {
          if (response.data != 'ok') {
            this.arrayCostumers = response.data
          }
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    getAccounts() {
      this.emitter.emit('showLoader', true)
      axios
        .get(this.config.serviceBaseUrl + this.config.url.accounts, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayAccounts = response.data
          console.log(this.arrayAccounts)
          let obj = this.arrayAccounts.find(({ role }) => role === 1)
          console.log(obj)
          if (obj != null) {
            this.isSuperAdmin = true
            this.getCostumers()
          }
          this.getRoles()
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    insertAccount(data) {
      if (this.config.demo == true) {
        alert('is a demo')
        return false
      }
      axios
        .post(
          this.config.serviceBaseUrl + this.config.url.accounts,
          {
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
            idCostumer: data.idCostumer
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          //this.emitter.emit('showLoader',false)
          this.arrayAccounts = response.data
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    updateAccount(data) {
      if (this.config.demo == true) {
        alert('is a demo')
        return false
      }
      this.emitter.emit('showLoader', true)
      axios
        .put(
          this.config.serviceBaseUrl + this.config.url.accounts + '/' + data.id,
          {
            name: data.name,
            password: data.password
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayAccounts = response.data
        })
        .catch((e) => {
          this.emitter.emit('showLoader', false)
          this.Logout(this, e)
          this.error = e
        })
    },
    showModal(index, type) {
      this.$refs.modifyModal.showModal(this.arrayAccounts[index], type)
    },
    updateData(data) {
      console.log('updateData:')
      console.log(data)
      if (data.type == 'new') {
        this.insertAccount(data)
      } else {
        this.updateAccount(data)
      }
    }
  },
  components: {
    modalModifyAccount
  }
}
</script>
