<template>
  <div>
    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-sm-1" />
          <div class="col">
            <div class="row" style="margin-top: 10px">
              <div class="col-sm-2">
                <select class="form-control" v-model="typeSelected" v-on:change="get()">
                  <option v-for="(type, index) in arrayTypes" v-bind:key="index" :value="type.id">
                    {{ type.name }}
                  </option>
                </select>
              </div>
              <div class="col">
                <input
                  class="form-control"
                  id="input-none"
                  :placeholder="language[config.currentLanguage].Platforms.Os.name"
                  v-model="name"
                />
              </div>
              <div class="col">
                <button
                  type="button"
                  class="btn btn-success"
                  size="sm"
                  v-on:click="save()"
                  :disabled="name.length == 0"
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
        <table width="50%" class="table table-striped costum">
          <thead>
            <tr>
              <th scope="col">{{ language[config.currentLanguage].Platforms.Os.id }}</th>
              <th scope="col">{{ language[config.currentLanguage].Platforms.Os.colName }}</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(element, index) in arrayElements" v-bind:key="index">
              <td>
                {{ element.id }}
              </td>
              <td>
                <span
                  v-on:dblclick="editThisElement(element)"
                  v-if="elementIdToEdit != element.id"
                  style="cursor: pointer"
                  >{{ element.name }}</span
                >
                <input
                  class="form-control"
                  id="input-none"
                  :placeholder="language[config.currentLanguage].Platforms.Os.name"
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
  name: 'os',
  props: {
    arrayTypes: Array
  },
  data() {
    return {
      typeSelected: null,
      name: '',
      arrayElements: [],
      elementIdToEdit: null,
      elementNameToEdit: ''
    }
  },
  created() {},
  watch: {},
  methods: {
    tabStart() {
      if (this.arrayTypes.length > 0) this.typeSelected = this.arrayTypes[0].id
      this.get()
    },
    editThisElement(element) {
      this.elementIdToEdit = element.id
      this.elementNameToEdit = element.name
    },
    async modify() {
      this.emitter.emit('showLoader', true)
      let response = await commonCalls
        .modifyOs(this, this.elementNameToEdit, this.elementIdToEdit, this.typeSelected)
        .catch((e) => {
          this.Logout(this, e)
        })
      this.arrayElements = response.data
      this.emitter.emit('showLoader', false)
      this.elementIdToEdit = null
      this.elementNameToEdit = ''
    },
    async get() {
      this.emitter.emit('showLoader', true)
      let response = await commonCalls.getOs(this, this.typeSelected).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayElements = response.data
      this.emitter.emit('showLoader', false)
    },
    async save() {
      this.emitter.emit('showLoader', true)
      let response = await commonCalls.saveOs(this, this.name, this.typeSelected).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayElements = response.data
      this.name = ''
      this.emitter.emit('showLoader', false)
    }
  }
}
</script>
