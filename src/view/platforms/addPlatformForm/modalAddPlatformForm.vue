<template>
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
          <h5 class="modal-title" id="exampleModalLabel">
            {{
              language[config.currentLanguage].Platforms.ManagePlatform.modalAddPlatform.modalTitle
            }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <label for="basic-url" class="form-label">{{
            language[config.currentLanguage].Platforms.ManagePlatform.modalAddPlatform.lblAddress
          }}</label>
          <input
            class="form-control"
            id="input-none"
            :placeholder="
              language[config.currentLanguage].Platforms.ManagePlatform.modalAddPlatform
                .placeholderHost
            "
            v-model="address"
          />

          <label for="basic-url" class="form-label">{{
            language[config.currentLanguage].Platforms.ManagePlatform.modalAddPlatform.lblLocation
          }}</label>
          <select class="form-control" v-model="locationSelected">
            <option v-for="(type, index) in arrayLocations" v-bind:key="index" :value="type.id">
              {{ type.name }}
            </option>
          </select>

          <label for="basic-url" class="form-label">{{
            language[config.currentLanguage].Platforms.ManagePlatform.modalAddPlatform.lblType
          }}</label>
          <select class="form-control" v-model="typeSelected" v-on:change="getBrand()">
            <option :value="null">
              {{
                language[config.currentLanguage].Platforms.ManagePlatform.modalAddPlatform
                  .chooseType
              }}
            </option>
            <option v-for="(type, index) in arrayTypes" v-bind:key="index" :value="type.id">
              {{ type.name }}
            </option>
          </select>

          <div v-if="arrayBrands.length > 0">
            <label for="basic-url" class="form-label">{{
              language[config.currentLanguage].Platforms.ManagePlatform.modalAddPlatform.lblModel
            }}</label>
            <select class="form-control" v-model="brandSelected" v-on:change="getModel()">
              <option
                v-for="(element, index) in arrayBrands"
                v-bind:key="index"
                :value="element.id"
              >
                {{ element.brand }}
              </option>
            </select>
            <label for="basic-url" class="form-label">{{
              language[config.currentLanguage].Platforms.ManagePlatform.modalAddPlatform.lblBrane
            }}</label>
            <select class="form-control" v-model="modelSelected" v-on:change="getSoVersion()">
              <option
                v-for="(element, index) in arrayModels"
                v-bind:key="index"
                :value="element.id"
              >
                {{ element.model }}
              </option>
            </select>
          </div>
          <div v-if="arrayOs.length > 0">
            <label for="basic-url" class="form-label">{{
              language[config.currentLanguage].Platforms.ManagePlatform.modalAddPlatform.lblOs
            }}</label>
            <select class="form-control" v-model="osSelected" v-on:change="getSoVersion()">
              <option v-for="(element, index) in arrayOs" v-bind:key="index" :value="element.id">
                {{ element.name }}
              </option>
            </select>
            <label for="basic-url" class="form-label">{{
              language[config.currentLanguage].Platforms.ManagePlatform.modalAddPlatform
                .lblOsVersion
            }}</label>
            <select class="form-control" v-model="osVersionSelected">
              <option
                v-for="(element, index) in arrayOsVersion"
                v-bind:key="index"
                :value="element.id"
              >
                {{ element.version }}
              </option>
            </select>
          </div>
          <div v-if="arrayBrowser.length > 0">
            <label for="basic-url" class="form-label">{{
              language[config.currentLanguage].Platforms.ManagePlatform.modalAddPlatform.lblBrowser
            }}</label>
            <select
              class="form-control"
              v-model="browserSelected"
              v-on:change="getBrowserVersion()"
            >
              <option
                v-for="(element, index) in arrayBrowser"
                v-bind:key="index"
                :value="element.id"
              >
                {{ element.name }}
              </option>
            </select>
            <label for="basic-url" class="form-label">{{
              language[config.currentLanguage].Platforms.ManagePlatform.modalAddPlatform
                .lblBrowserVersion
            }}</label>
            <select class="form-control" v-model="browserVersionSelected">
              <option
                v-for="(element, index) in arrayBrowserVersion"
                v-bind:key="index"
                :value="element.id"
              >
                {{ element.version }}
              </option>
            </select>
          </div>
          <button
            type="button"
            class="btn btn-success btn-sm"
            style="width: 100%; height: 30px; font-size: 15px !important"
            v-on:click="save()"
            v-if="arrayBrowser.length > 0"
            :disabled="address.length == 0"
          >
            {{
              language[config.currentLanguage].Platforms.ManagePlatform.modalAddPlatform
                .btnSaveNewPlatform
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Modal } from 'bootstrap'
import commonCalls from '../commonCalls'
export default {
  props: {
    arrayTypes: Array,
    arrayLocations: Array
  },
  created() {},
  data() {
    return {
      arrayOs: [],
      osSelected: null,
      arrayOsVersion: [],
      osVersionSelected: null,
      arrayBrowser: [],
      browserSelected: null,
      arrayBrowserVersion: [],
      browserVersionSelected: null,
      arrayBrands: [],
      brandSelected: null,
      arrayModels: [],
      modelSelected: null,
      locationSelected: null,
      typeSelected: null,
      address: ''
    }
  },
  mounted() {
    this.modalElem = new Modal(document.getElementById('myModal'))
  },
  methods: {
    showModal() {
      this.modalElem.show()
      if (this.arrayLocations.length > 0) this.locationSelected = this.arrayLocations[0].id
    },
    async getBrand() {
      console.log('getBrand' + this.typeSelected)
      this.emitter.emit('showLoader', true)
      this.arrayBrands = []
      this.arrayModel = []
      let objType = this.arrayTypes.find(({ id }) => id === this.typeSelected)
      if (objType.name == 'mobile devices') {
        let response = await commonCalls.getBrand(this).catch((e) => {
          this.Logout(this, e)
        })
        this.arrayBrands = response.data
        if (this.arrayBrands.length > 0) this.brandSelected = this.arrayBrands[0].id
        this.emitter.emit('showLoader', false)
        this.getModel()
      }
      this.getSo()
    },
    async getModel() {
      this.emitter.emit('showLoader', true)
      let response = await commonCalls.getModelDevice(this, this.brandSelected).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayModels = response.data
      if (this.arrayModels.length > 0) this.modelSelected = this.arrayModels[0].id
      this.emitter.emit('showLoader', false)
    },
    async getSo() {
      this.emitter.emit('showLoader', true)
      let response = await commonCalls.getOs(this, this.typeSelected).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayOs = response.data
      if (this.arrayOs.length > 0) {
        this.osSelected = this.arrayOs[0].id
        this.getSoVersion()
      }
    },
    async getSoVersion() {
      this.emitter.emit('showLoader', true)
      let response = await commonCalls.getOsVersion(this, this.osSelected).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayOsVersion = response.data
      if (this.arrayOsVersion.length > 0) {
        this.osVersionSelected = this.arrayOsVersion[0].id
      }
      this.getBrowser()
      this.emitter.emit('showLoader', false)
    },
    async getBrowser() {
      console.log('getBrowser')
      this.emitter.emit('showLoader', true)
      let response = await commonCalls.getBrowser(this, this.osSelected).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayBrowser = response.data
      if (this.arrayBrowser.length > 0) this.browserSelected = this.arrayBrowser[0].id
      this.getBrowserVersion()
    },
    async getBrowserVersion() {
      console.log('getBrowserVersion')
      this.emitter.emit('showLoader', true)
      let response = await commonCalls.getBrowserVersion(this, this.browserSelected).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayBrowserVersion = response.data
      if (this.arrayBrowserVersion.length > 0)
        this.browserVersionSelected = this.arrayBrowserVersion[0].id

      this.emitter.emit('showLoader', false)
    },
    save() {
      let brand = ''
      let model = ''
      let os = ''
      let osVersion = ''
      let browser = ''
      let browserVersion = ''
      let brandId = -1
      let objBrand = this.arrayBrands.find(({ id }) => id === this.brandSelected)
      if (objBrand != undefined) brand = objBrand.brand
      let objModel = this.arrayModels.find(({ id }) => id === this.modelSelected)
      if (objModel != undefined) model = objModel.model
      let objOs = this.arrayOs.find(({ id }) => id === this.osSelected)
      if (objOs != undefined) os = objOs.name
      let objOsVersion = this.arrayOsVersion.find(({ id }) => id === this.osVersionSelected)
      if (objOsVersion != undefined) osVersion = objOsVersion.version
      let objBrowser = this.arrayBrowser.find(({ id }) => id === this.browserSelected)
      if (objBrowser != undefined) browser = objBrowser.name
      let objBrowserVersion = this.arrayBrowserVersion.find(
        ({ id }) => id === this.browserVersionSelected
      )
      if (objBrowserVersion != undefined) browserVersion = objBrowserVersion.version
      if (this.brandSelected != null) {
        brandId = this.brandSelected
      } else {
        brand = 'NA'
      }
      let objToSave = {
        type: this.typeSelected,
        addressname: this.address,
        location: this.locationSelected,
        os: this.osSelected,
        osversion: this.osVersionSelected,
        browser: this.browserSelected,
        brand: brandId,
        brandDescription: brand + ' ' + model,
        osDescription: os + ' ' + osVersion,
        browserDescription: browser + ' ' + browserVersion,
        status: 1
      }
      this.$emit('savePlatform', objToSave)
      this.modalElem.hide()
    }
  }
}
</script>
