<template>
  <div>
    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-sm-1" />
          <div class="col">
            <div class="row" style="margin-top: 10px">
              <div class="col">
                <input
                  class="form-control"
                  id="input-none"
                  :placeholder="language[config.currentLanguage].Platforms.Brand.name"
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
              <th scope="col">{{ language[config.currentLanguage].Platforms.Brand.id }}</th>
              <th scope="col">{{ language[config.currentLanguage].Platforms.Brand.colBrand }}</th>
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
                  >{{ element.brand }}</span
                >
                <input
                  class="form-control"
                  id="input-none"
                  :placeholder="language[config.currentLanguage].Platforms.Brand.name"
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
  name: 'brand',
  data() {
    return {
      typeSelected: null,
      name: '',
      arrayElements: [],
      elementIdToEdit: null,
      elementNameToEdit: ''
    }
  },
  created() {
    console.log('brands')
    this.getBrand()
  },
  watch: {},
  methods: {
    tabStart() {
      this.getBrand()
    },
    editThisElement(element) {
      this.elementIdToEdit = element.id
      this.elementNameToEdit = element.brand
    },
    async modify() {
      this.emitter.emit('showLoader', true)
      let response = await commonCalls
        .modifyBrand(this, this.elementNameToEdit, this.elementIdToEdit)
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
      this.arrayElements = response.data
      this.emitter.emit('showLoader', false)
    },
    async save() {
      this.emitter.emit('showLoader', true)
      let response = await commonCalls.saveBrand(this, this.name).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayElements = response.data
      this.name = ''
      this.emitter.emit('showLoader', false)
    }
  }
}
</script>
