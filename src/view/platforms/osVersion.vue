<template>
  <div>
    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-sm-1" />
          <div class="col">
            <div class="row" style="margin-top: 10px">
              <div class="col-sm-2">
                <select class="form-control" v-model="typeSelected" v-on:change="getOs()">
                  <option v-for="(type, index) in arrayTypes" v-bind:key="index" :value="type.id">
                    {{ type.name }}
                  </option>
                </select>
              </div>
              <div class="col-sm-2">
                <select
                  class="form-control"
                  v-model="osSelected"
                  v-on:change="getOsVersion()"
                  v-if="typeSelected != null"
                >
                  <option v-for="(os, index) in arrayOs" v-bind:key="index" :value="os.id">
                    {{ os.name }}
                  </option>
                </select>
              </div>
              <div class="col">
                <input
                  class="form-control"
                  id="input-none"
                  :placeholder="language[config.currentLanguage].Platforms.OsVersion.name"
                  v-model="name"
                  v-if="osSelected != null"
                />
              </div>
              <div class="col">
                <button
                  type="button"
                  class="btn btn-success"
                  size="sm"
                  v-on:click="save()"
                  :disabled="name.length == 0"
                  v-if="osSelected != null"
                >
                  {{ language[config.currentLanguage].Platforms.btnSave }}
                </button>
              </div>
            </div>
          </div>
          <div class="col-sm-1" />
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-1" />
      <div class="col">
        <table class="table table-striped costum">
          <thead>
            <tr>
              <th scope="col">{{ language[config.currentLanguage].Platforms.OsVersion.id }}</th>
              <th scope="col">{{ language[config.currentLanguage].Platforms.OsVersion.colOs }}</th>
              <th scope="col">
                {{ language[config.currentLanguage].Platforms.OsVersion.colVersion }}
              </th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(element, index) in arrayElements" v-bind:key="index">
              <td>
                {{ element.id }}
              </td>
              <td>
                {{ osToShow }}
              </td>
              <td>
                <span
                  v-on:dblclick="editThisElement(element)"
                  v-if="elementIdToEdit != element.id"
                  style="cursor: pointer"
                  >{{ element.version }}</span
                >
                <input
                  class="form-control"
                  id="input-none"
                  :placeholder="language[config.currentLanguage].Platforms.OsVersion.name"
                  v-model="elementNameToEdit"
                  v-if="elementIdToEdit == element.id"
                  v-on:keyup.enter="modify()"
                  v-on:keyup.escape="elementIdToEdit = null"
                />
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-sm-1" />
    </div>
  </div>
</template>
<script>
import commonCalls from './commonCalls'
export default {
  name: 'os_version',
  props: {
    arrayTypes: Array
  },
  data() {
    return {
      typeSelected: null,
      osSelected: null,
      name: '',
      osToShow: '',
      arrayElements: [],
      elementIdToEdit: null,
      elementNameToEdit: '',
      arrayOs: []
    }
  },
  created() {},
  watch: {},
  methods: {
    tabStart() {
      if (this.arrayTypes.length > 0) this.typeSelected = this.arrayTypes[0].id
      this.getOs()
    },
    async getOs() {
      console.log('getOs')
      this.emitter.emit('showLoader', true)
      let response = await commonCalls.getOs(this, this.typeSelected).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayOs = response.data

      if (this.arrayOs.length > 0) {
        this.osSelected = this.arrayOs[0].id
        this.osToShow = this.arrayOs[0].name
      }
      this.getOsVersion()
      this.emitter.emit('showLoader', false)
    },
    async getOsVersion() {
      console.log('getOs')
      this.emitter.emit('showLoader', true)
      let response = await commonCalls.getOsVersion(this, this.osSelected).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayElements = response.data
      let obj = this.arrayOs.find(({ id }) => id === this.osSelected)
      if (obj != undefined) this.osToShow = obj.name
      else this.osToShow = ''

      this.emitter.emit('showLoader', false)
    },
    editThisElement(element) {
      this.elementIdToEdit = element.id
      this.elementNameToEdit = element.version
    },
    async modify() {
      this.emitter.emit('showLoader', true)
      let response = await commonCalls
        .modifyOsVersion(this, this.elementNameToEdit, this.elementIdToEdit, this.osSelected)
        .catch((e) => {
          this.Logout(this, e)
        })
      this.arrayElements = response.data
      this.emitter.emit('showLoader', false)
      this.elementIdToEdit = null
      this.elementNameToEdit = ''
    },
    async save() {
      this.emitter.emit('showLoader', true)
      let response = await commonCalls
        .saveOsVersion(this, this.name, this.osSelected)
        .catch((e) => {
          this.Logout(this, e)
        })
      this.arrayElements = response.data
      this.name = ''
      this.emitter.emit('showLoader', false)
    }
  }
}
</script>
