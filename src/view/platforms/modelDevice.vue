<template>
  <div>
    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-sm-1" />
          <div class="col">
            <div class="row" style="margin-top: 10px">
              <div class="col-sm-2">
                <select class="form-control" v-model="brandSelected" v-on:change="get()">
                  <option v-for="(type, index) in arrayBrands" v-bind:key="index" :value="type.id">
                    {{ type.brand }}
                  </option>
                </select>
              </div>
              <div class="col">
                <input
                  class="form-control"
                  id="input-none"
                  :placeholder="language[config.currentLanguage].Platforms.ModelDevice.name"
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
              <th scope="col">{{ language[config.currentLanguage].Platforms.ModelDevice.id }}</th>
              <th scope="col">
                {{ language[config.currentLanguage].Platforms.ModelDevice.colBrand }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Platforms.ModelDevice.colModel }}
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
                {{ brandToShow }}
              </td>
              <td>
                <span
                  v-on:dblclick="editThisElement(element)"
                  v-if="elementIdToEdit != element.id"
                  style="cursor: pointer"
                  >{{ element.model }}</span
                >
                <input
                  class="form-control"
                  id="input-none"
                  :placeholder="language[config.currentLanguage].Platforms.ModelDevice.name"
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
  name: 'ModelDeviceComponent',
  data() {
    return {
      typeSelected: null,
      name: '',
      arrayElements: [],
      elementIdToEdit: null,
      elementNameToEdit: '',
      brandSelected: null,
      brandToShow: '',
      arrayBrands: []
    }
  },
  created() {
    console.log('brands')
  },
  watch: {},
  methods: {
    tabStart() {
      this.getBrand()
    },
    editThisElement(element) {
      this.elementIdToEdit = element.id
      this.elementNameToEdit = element.model
    },
    async modify() {
      this.emitter.emit('showLoader', true)
      let response = await commonCalls
        .modifyModelDevice(this, this.elementNameToEdit, this.elementIdToEdit, this.brandSelected)
        .catch((e) => {
          this.Logout(this, e)
        })
      this.arrayElements = response.data
      this.emitter.emit('showLoader', false)
      this.elementIdToEdit = null
      this.elementNameToEdit = ''
    },
    async getBrand() {
      this.emitter.emit('showLoader', true)
      let response = await commonCalls.getBrand(this).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayBrands = response.data
      if (this.arrayBrands.length > 0) this.brandSelected = this.arrayBrands[0].id
      this.emitter.emit('showLoader', false)
      this.get()
    },
    async get() {
      this.emitter.emit('showLoader', true)
      let response = await commonCalls.getModelDevice(this, this.brandSelected).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayElements = response.data
      let obj = this.arrayBrands.find(({ id }) => id === this.brandSelected)
      if (obj != undefined) this.brandToShow = obj.brand
      else this.brandToShow = ''
      this.emitter.emit('showLoader', false)
    },
    async save() {
      this.emitter.emit('showLoader', true)
      let response = await commonCalls
        .saveModelDevice(this, this.name, this.brandSelected)
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
