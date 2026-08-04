<template>
  <div
    class="modal fade"
    ref="mymodal"
    id="platformAddModal"
    tabindex="-1"
    aria-labelledby="platformAddModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="platformAddModalLabel">
            {{ modalCopy.modalTitle }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <label for="platform-add-address" class="form-label">{{ modalCopy.lblAddress }}</label>
          <input
            class="form-control"
            id="platform-add-address"
            :placeholder="modalCopy.placeholderHost"
            v-model.trim="address"
          />

          <label for="platform-add-location" class="form-label">{{ modalCopy.lblLocation }}</label>
          <select id="platform-add-location" class="form-control" v-model="locationSelected">
            <option v-for="location in arrayLocations" :key="location.id" :value="location.id">
              {{ location.name }}
            </option>
          </select>

          <label for="platform-add-type" class="form-label">{{ modalCopy.lblType }}</label>
          <select
            id="platform-add-type"
            class="form-control"
            v-model="typeSelected"
            v-on:change="getBrand()"
          >
            <option :value="null">
              {{ modalCopy.chooseType }}
            </option>
            <option v-for="type in arrayTypes" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>

          <p v-if="loadingReferences" class="platform-add-validation">
            {{ modalCopy.loadingReferences }}
          </p>

          <div v-if="arrayBrands.length > 0">
            <label for="platform-add-brand" class="form-label">{{ modalCopy.lblBrand }}</label>
            <select
              id="platform-add-brand"
              class="form-control"
              v-model="brandSelected"
              v-on:change="getModel()"
            >
              <option v-for="element in arrayBrands" :key="element.id" :value="element.id">
                {{ element.brand }}
              </option>
            </select>

            <label for="platform-add-model" class="form-label">{{ modalCopy.lblModel }}</label>
            <select
              id="platform-add-model"
              class="form-control"
              v-model="modelSelected"
              v-on:change="getSoVersion()"
            >
              <option v-for="element in arrayModels" :key="element.id" :value="element.id">
                {{ element.model }}
              </option>
            </select>
          </div>

          <div v-if="arrayOs.length > 0">
            <label for="platform-add-os" class="form-label">{{ modalCopy.lblOs }}</label>
            <select
              id="platform-add-os"
              class="form-control"
              v-model="osSelected"
              v-on:change="getSoVersion()"
            >
              <option v-for="element in arrayOs" :key="element.id" :value="element.id">
                {{ element.name }}
              </option>
            </select>

            <label for="platform-add-os-version" class="form-label">
              {{ modalCopy.lblOsVersion }}
            </label>
            <select id="platform-add-os-version" class="form-control" v-model="osVersionSelected">
              <option v-for="element in arrayOsVersion" :key="element.id" :value="element.id">
                {{ element.version }}
              </option>
            </select>
          </div>

          <div v-if="arrayBrowser.length > 0">
            <label for="platform-add-browser" class="form-label">{{ modalCopy.lblBrowser }}</label>
            <select
              id="platform-add-browser"
              class="form-control"
              v-model="browserSelected"
              v-on:change="getBrowserVersion()"
            >
              <option v-for="element in arrayBrowser" :key="element.id" :value="element.id">
                {{ element.name }}
              </option>
            </select>

            <label for="platform-add-browser-version" class="form-label">
              {{ modalCopy.lblBrowserVersion }}
            </label>
            <select
              id="platform-add-browser-version"
              class="form-control"
              v-model="browserVersionSelected"
            >
              <option v-for="element in arrayBrowserVersion" :key="element.id" :value="element.id">
                {{ element.version }}
              </option>
            </select>
          </div>

          <p v-if="validationMessage" class="platform-add-validation">
            {{ validationMessage }}
          </p>

          <button
            type="button"
            class="btn btn-success btn-sm"
            style="width: 100%; height: 30px; font-size: 15px !important"
            v-on:click="save()"
            :disabled="!canSave"
            :title="validationMessage"
          >
            {{ modalCopy.btnSaveNewPlatform }}
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
      address: '',
      loadingReferences: false
    }
  },
  computed: {
    modalCopy() {
      return this.language[this.config.currentLanguage].Platforms.ManagePlatform.modalAddPlatform
    },
    selectedTypeName() {
      return (
        this.arrayTypes.find(({ id }) => id === this.typeSelected)?.name?.toLowerCase() || ''
      )
    },
    isMobileType() {
      return this.selectedTypeName === 'mobile devices'
    },
    validationMessage() {
      if (this.address.length === 0) return this.modalCopy.validationAddress
      if (this.locationSelected == null) return this.modalCopy.validationLocation
      if (this.typeSelected == null) return this.modalCopy.validationType
      if (this.osSelected == null) return this.modalCopy.validationOs
      if (this.osVersionSelected == null) return this.modalCopy.validationOsVersion
      if (this.browserSelected == null) return this.modalCopy.validationBrowser
      if (this.browserVersionSelected == null) return this.modalCopy.validationBrowserVersion
      if (this.isMobileType && this.modelSelected == null) return this.modalCopy.validationModel
      return ''
    },
    canSave() {
      return !this.loadingReferences && this.validationMessage.length === 0
    }
  },
  mounted() {
    this.modalElem = new Modal(this.$refs.mymodal)
  },
  methods: {
    async showModal() {
      this.resetForm()
      if (this.arrayLocations.length > 0) this.locationSelected = this.arrayLocations[0].id
      if (this.arrayTypes.length > 0) {
        this.typeSelected = this.arrayTypes[0].id
        await this.getBrand()
      }
      this.modalElem.show()
    },
    resetForm() {
      this.arrayOs = []
      this.osSelected = null
      this.arrayOsVersion = []
      this.osVersionSelected = null
      this.arrayBrowser = []
      this.browserSelected = null
      this.arrayBrowserVersion = []
      this.browserVersionSelected = null
      this.arrayBrands = []
      this.brandSelected = null
      this.arrayModels = []
      this.modelSelected = null
      this.locationSelected = null
      this.typeSelected = null
      this.address = ''
      this.loadingReferences = false
    },
    async getBrand() {
      this.loadingReferences = true
      this.emitter.emit('showLoader', true)
      this.arrayBrands = []
      this.arrayModels = []
      this.brandSelected = null
      this.modelSelected = null
      const objType = this.arrayTypes.find(({ id }) => id === this.typeSelected)
      if (!objType) {
        this.loadingReferences = false
        this.emitter.emit('showLoader', false)
        return
      }
      if (this.isMobileType) {
        const response = await commonCalls.getBrand(this, false).catch((e) => {
          this.Logout(this, e)
          return { data: [] }
        })
        this.arrayBrands = response.data || []
        if (this.arrayBrands.length > 0) {
          this.brandSelected = this.arrayBrands[0].id
          await this.getModel()
        }
      }
      await this.getSo()
      this.loadingReferences = false
      this.emitter.emit('showLoader', false)
    },
    async getModel() {
      if (this.brandSelected == null) {
        this.arrayModels = []
        this.modelSelected = null
        return
      }
      this.emitter.emit('showLoader', true)
      const response = await commonCalls.getModelDevice(this, this.brandSelected, false).catch((e) => {
        this.Logout(this, e)
        return { data: [] }
      })
      this.arrayModels = response.data || []
      this.modelSelected = this.arrayModels.length > 0 ? this.arrayModels[0].id : null
      this.emitter.emit('showLoader', false)
    },
    async getSo() {
      if (this.typeSelected == null) {
        this.arrayOs = []
        this.osSelected = null
        return
      }
      this.emitter.emit('showLoader', true)
      const response = await commonCalls.getOs(this, this.typeSelected, false).catch((e) => {
        this.Logout(this, e)
        return { data: [] }
      })
      this.arrayOs = response.data || []
      this.osSelected = this.arrayOs.length > 0 ? this.arrayOs[0].id : null
      if (this.osSelected != null) await this.getSoVersion()
      this.emitter.emit('showLoader', false)
    },
    async getSoVersion() {
      if (this.osSelected == null) {
        this.arrayOsVersion = []
        this.osVersionSelected = null
        return
      }
      this.emitter.emit('showLoader', true)
      const response = await commonCalls.getOsVersion(this, this.osSelected, false).catch((e) => {
        this.Logout(this, e)
        return { data: [] }
      })
      this.arrayOsVersion = response.data || []
      this.osVersionSelected = this.arrayOsVersion.length > 0 ? this.arrayOsVersion[0].id : null
      await this.getBrowser()
      this.emitter.emit('showLoader', false)
    },
    async getBrowser() {
      if (this.osSelected == null) {
        this.arrayBrowser = []
        this.browserSelected = null
        return
      }
      this.emitter.emit('showLoader', true)
      const response = await commonCalls.getBrowser(this, this.osSelected, false).catch((e) => {
        this.Logout(this, e)
        return { data: [] }
      })
      this.arrayBrowser = response.data || []
      this.browserSelected = this.arrayBrowser.length > 0 ? this.arrayBrowser[0].id : null
      if (this.browserSelected != null) await this.getBrowserVersion()
      this.emitter.emit('showLoader', false)
    },
    async getBrowserVersion() {
      if (this.browserSelected == null) {
        this.arrayBrowserVersion = []
        this.browserVersionSelected = null
        return
      }
      this.emitter.emit('showLoader', true)
      const response = await commonCalls
        .getBrowserVersion(this, this.browserSelected, false)
        .catch((e) => {
          this.Logout(this, e)
          return { data: [] }
        })
      this.arrayBrowserVersion = response.data || []
      this.browserVersionSelected =
        this.arrayBrowserVersion.length > 0 ? this.arrayBrowserVersion[0].id : null
      this.emitter.emit('showLoader', false)
    },
    save() {
      if (!this.canSave) return
      let brand = ''
      let model = ''
      let os = ''
      let osVersion = ''
      let browser = ''
      let browserVersion = ''
      let brandId = -1
      const objBrand = this.arrayBrands.find(({ id }) => id === this.brandSelected)
      if (objBrand != undefined) brand = objBrand.brand
      const objModel = this.arrayModels.find(({ id }) => id === this.modelSelected)
      if (objModel != undefined) model = objModel.model
      const objOs = this.arrayOs.find(({ id }) => id === this.osSelected)
      if (objOs != undefined) os = objOs.name
      const objOsVersion = this.arrayOsVersion.find(({ id }) => id === this.osVersionSelected)
      if (objOsVersion != undefined) osVersion = objOsVersion.version
      const objBrowser = this.arrayBrowser.find(({ id }) => id === this.browserSelected)
      if (objBrowser != undefined) browser = objBrowser.name
      const objBrowserVersion = this.arrayBrowserVersion.find(
        ({ id }) => id === this.browserVersionSelected
      )
      if (objBrowserVersion != undefined) browserVersion = objBrowserVersion.version
      if (this.brandSelected != null) {
        brandId = this.brandSelected
      } else {
        brand = 'NA'
      }
      const objToSave = {
        type: this.typeSelected,
        addressname: this.address,
        location: this.locationSelected,
        os: this.osSelected,
        osversion: this.osVersionSelected,
        browser: this.browserSelected,
        brand: brandId,
        brandDescription: `${brand} ${model}`,
        osDescription: `${os} ${osVersion}`,
        browserDescription: `${browser} ${browserVersion}`,
        status: 1
      }
      this.$emit('savePlatform', objToSave)
      this.modalElem.hide()
    }
  }
}
</script>

<style scoped>
.platform-add-validation {
  color: #f7b955;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  margin: 0.75rem 0;
}
</style>
