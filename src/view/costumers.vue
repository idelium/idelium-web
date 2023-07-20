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
          {{ language[config.currentLanguage].Costumers.btnNewCostumer }}
        </button>
      </div>
      <div class="col-sm-1" />
    </div>
    <div class="row">
      <div class="col-sm-1" />
      <div class="col">
        <table class="table table-striped costum">
            <caption>{{language[config.currentLanguage].Costumers.costumer}}</caption>
          <thead>
            <tr>
              <th>{{ language[config.currentLanguage].Costumers.id }}</th>
              <th>{{ language[config.currentLanguage].Costumers.costumer }}</th>
              <th>{{ language[config.currentLanguage].Costumers.description }}</th>
              <th>{{ language[config.currentLanguage].Costumers.apiKey }}</th>
              <th>
                {{ language[config.currentLanguage].Costumers.licenseExpiration }}
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(costumer, index) in arrayCostumers" v-bind:key="index">
              <td>
                {{ costumer.id }}
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-link btn-sm"
                  v-on:click="showModal(index, 'modify')"
                >
                  {{ costumer.costumer }}
                </button>
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-link btn-sm"
                  v-on:click="showModal(index, 'modify')"
                >
                  {{ costumer.description }}
                </button>
              </td>
              <td>
                <button v-on:click="copyClipboard(costumer.apiKey, costumer.costumer)" class="btn btn-link btn-sm">
                  {{ costumer.apiKey.substring(0, 10) + '..' }}
                  <font-awesome-icon
                    class="text-success"
                    icon="copy"
                    style="margin-left: 5px; font-size: 20px; float: right"
                  />
                </button>
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-link btn-sm"
                  v-on:click="showModal(index, 'modify')"
                >
                  {{ costumer.licenseExpiration }}
                </button>
              </td>
              <td>
                <button
                  type="button"
                  size="sm"
                  class="btn btn-danger"
                  :disabled="costumer.usercostumer == 'admin'"
                  v-on:click="deleteCostumer(costumer.id)"
                >
                  {{ language[config.currentLanguage].Costumers.btnDelete }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-sm-1" />
    </div>
    <modalModifyCostumer
      ref="modifyModal"
      :arrayCostumers="arrayCostumers"
      v-on:updateData="updateData"
    />
  </div>
</template>
<style scoped>
.key {
  cursor: pointer;
  text-overflow: 12px;
  white-space: nowrap;
  overflow: hidden;
  max-width: 1rem;
}
</style>
<script>
import axios from 'axios'
import modalModifyCostumer from './costumer/modalModifyCostumer.vue'

import copy from 'copy-to-clipboard'

export default {
  created() {
    this.getCostumers()
    this.$gtag.event('idelium-builder', { method: 'costumer' })
    console.log('costumers')
    this.emitter.on('refreshCostumer', () => {
      this.$forceUpdate()
    })
  },
  watch: {
    $route() {
      this.$gtag.event('idelium-builder', { method: 'costumer' })
      this.$forceUpdate()
    }
  },
  data() {
    return {
      newcostumer: null,
      arrayCostumers: [],
      idSelected: null,
      costumerToModify: null
    }
  },
  methods: {
    copyClipboard(text, costumer) {
      copy(text)
      this.$wkToast(
        this.language[this.config.currentLanguage].Costumers.textCopy + ' (' + costumer + ')'
      )
    },
    modify(id, costumer) {
      this.idSelected = id
      this.costumerToModify = costumer
    },

    deleteCostumer(id) {
      this.$confirm(
        this.language[this.config.currentLanguage].Costumers.textDelete,
        '',
        'warning'
      ).then(() => this.deleteAction(id))
    },
    deleteAction(id) {
      this.emitter.emit('showLoader', true)
      axios
        .delete(this.config.serviceBaseUrl + this.config.url.costumers + '/' + id, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.arrayCostumers = response.data
          this.emitter.emit('showLoader', false)
        })
        .catch((e) => {
          this.emitter.emit('showLoader', false)
          this.Logout(this, e)
          this.error = e
        })
    },
    getCostumers() {
      this.emitter.emit('showLoader', true)
      axios
        .get(this.config.serviceBaseUrl + this.config.url.costumers, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.emitter.emit('showLoader', false)

          this.arrayCostumers = response.data
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    insertCostumer(data) {
      axios
        .post(
          this.config.serviceBaseUrl + this.config.url.costumers,
          {
            costumer: data.costumer,
            description: data.description
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayCostumers = response.data
          this.emitter.emit('updateListCostumer', this.arrayCostumers)
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    updateCostumer(data) {
      this.emitter.emit('showLoader', true)
      axios
        .put(
          this.config.serviceBaseUrl + this.config.url.costumers + '/' + data.id,
          {
            costumer: data.costumer,
            description: data.description
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayCostumers = response.data
          this.emitter.emit('updateListCostumer', this.arrayCostumers)
        })
        .catch((e) => {
          this.emitter.emit('showLoader', false)
          this.Logout(this, e)
          this.error = e
        })
    },
    showModal(index, type) {
      if (type == 'new') {
        this.$refs.modifyModal.showModal(null, type)
      } else {
        this.$refs.modifyModal.showModal(this.arrayCostumers[index], type)
      }
    },
    updateData(data) {
      console.log('updateData:')
      console.log(data)
      if (data.type == 'new') {
        this.insertCostumer(data)
      } else {
        this.updateCostumer(data)
      }
    }
  },
  components: {
    modalModifyCostumer
  }
}
</script>
