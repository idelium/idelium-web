<template>
  <div>
    <div class="row" style="margin-top: 10px">
      <div class="col-sm-1" />
      <div class="col-sm-2"></div>
      <div class="col labelFilter" v-if="showBrandCol == true">
        <span>{{ language[config.currentLanguage].Platforms.ManagePlatform.colBrand }}</span>
      </div>
      <div class="col-sm-2 labelFilter">
        <span>{{ language[config.currentLanguage].Platforms.ManagePlatform.colOs }}</span>
      </div>
      <div class="col-sm-2 labelFilter">
        <span v-if="arrayBrowser.length > 0">{{
          language[config.currentLanguage].Platforms.ManagePlatform.colBrowser
        }}</span>
      </div>
      <div class="col"></div>
      <div class="col-sm-1" />
    </div>
    <div class="row" style="margin-top: 10px">
      <div class="col-sm-1" />
      <div class="col-sm-2">
        <select class="form-control" v-model="typeSelected" v-on:change="getPlatforms()">
          <option v-for="(type, index) in arrayTypes" v-bind:key="index" :value="type.id">
            {{ type.name }}
          </option>
        </select>
      </div>
      <div class="col-sm-2" v-if="showBrandCol == true">
        <select class="form-control" v-model="brandSelected" v-on:change="getBrand()">
          <option :value="'all'">
            {{ language[config.currentLanguage].Platforms.ManagePlatform.all }}
          </option>
          <option v-for="(type, index) in arrayBrands" v-bind:key="index" :value="type.id">
            {{ type.brand }}
          </option>
        </select>
      </div>
      <div class="col-sm-2">
        <select class="form-control" v-model="osSelected" v-on:change="getOs()">
          <option :value="'all'">
            {{ language[config.currentLanguage].Platforms.ManagePlatform.all }}
          </option>
          <option v-for="(type, index) in arrayOs" v-bind:key="index" :value="type.id">
            {{ type.name }}
          </option>
        </select>
      </div>
      <div class="col-sm-2">
        <select
          class="form-control"
          v-model="browserSelected"
          v-if="arrayBrowser.length > 0"
          v-on:change="filterPlatform()"
        >
          <option :value="'all'">
            {{ language[config.currentLanguage].Platforms.ManagePlatform.all }}
          </option>
          <option v-for="(type, index) in arrayBrowser" v-bind:key="index" :value="type.id">
            {{ type.name }}
          </option>
        </select>
      </div>
      <div class="col">
        <button
          type="button"
          class="btn btn-primary"
          size="sm"
          style="float: right"
          v-on:click="$refs.modalAddPlatformForm.showModal()"
        >
          {{ language[config.currentLanguage].Platforms.ManagePlatform.btnAddPlatform }}
        </button>
      </div>
      <div class="col-sm-1" />
    </div>
    <div class="row">
      <div class="col-sm-1" />
      <div class="col">
        <table
          class="table table-striped costum"
          style="margin-left: 10px; margin-right: 10px; margin-top: 10px"
        >
          <thead>
            <tr>
              <th scope="col">
                {{ language[config.currentLanguage].Platforms.ManagePlatform.colId }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Platforms.ManagePlatform.colHost }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Platforms.ManagePlatform.colLocation }}
              </th>
              <th scope="col" v-if="showBrandCol == true">
                {{ language[config.currentLanguage].Platforms.ManagePlatform.colBrand }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Platforms.ManagePlatform.colOs }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Platforms.ManagePlatform.colBrowser }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Platforms.ManagePlatform.colStatus }}
              </th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tr v-for="(item, index) in arrayPlatformsToShow" v-bind:key="index">
            <td>
              {{ item.id }}
            </td>
            <td>
              {{ item.hostname }}
            </td>
            <td>
              {{ getLocationName(item.location) }}
            </td>
            <td v-if="showBrandCol == true">
              {{ item.brandDescription }}
            </td>
            <td>
              {{ item.osDescription }}
            </td>
            <td>
              {{ item.browserDescription }}
            </td>
            <td width="150px">
              <span
                v-on:dblclick="editThisElement(item)"
                v-if="elementIdToEdit != item.id"
                style="cursor: pointer"
                >{{ getStatusName(item.status) }}</span
              >
              <select
                v-if="elementIdToEdit == item.id"
                class="form-control"
                size="sm"
                v-model="elementToEdit"
                v-on:change="setStatusPlatform(item.id)"
              >
                <option v-for="(type, index) in arrayStatus" v-bind:key="index" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </td>
            <td>
              <span class="text-danger" v-on:click="deletePlatform(item.id)" style="cursor: pointer"
                ><font-awesome-icon icon="trash" style="font-size: 1rem"
              /></span>
            </td>
          </tr>
        </table>
      </div>
      <div class="col-sm-1" />
    </div>
    <modalAddPlatformForm
      ref="modalAddPlatformForm"
      :arrayTypes="arrayTypes"
      :arrayLocations="arrayLocations"
      v-on:savePlatform="savePlatform"
    />
  </div>
</template>
<style scoped>
.labelFilter {
  font-size: 10px;
  text-align: center !important;
  text-transform: uppercase;
}
</style>

<script>
import modalAddPlatformForm from './addPlatformForm/modalAddPlatformForm.vue'
import commonCalls from './commonCalls'

export default {
  props: {
    arrayTypes: Array,
    arrayLocations: Array,
    arrayStatus: Array
  },
  components: {
    modalAddPlatformForm
  },
  data() {
    return {
      typeSelected: null,
      brandSelected: 'all',
      browserSelected: 'all',
      osSelected: 'all',
      arrayPlatforms: [],
      arrayPlatformsToShow: [],
      arrayBrowser: [],
      arrayOs: [],
      arrayBrands: [],
      elementIdToEdit: null,
      elementToEdit: null,
      showBrandCol: true
    }
  },
  created() {},
  watch: {
    arrayPlatforms() {
      this.arrayPlatformsToShow = this.arrayPlatforms
    }
  },
  methods: {
    start() {
      console.log('Start')
      if (this.arrayTypes.length > 0) this.typeSelected = this.arrayTypes[0].id
      console.log(this.arrayTypes)
      this.getPlatforms()
      this.getBrand()
    },
    async getBrand() {
      console.log('getBrand' + this.typeSelected)
      this.arrayBrands = []
      if (this.typeSelected == null) return false
      this.emitter.emit('showLoader', true)
      if (this.getTypeName(this.typeSelected) == 'mobile devices') {
        let response = await commonCalls.getBrand(this).catch((e) => {
          this.Logout(this, e)
        })
        this.arrayBrands = response.data
      }
      this.getOs()
    },
    async getOs() {
      let response = await commonCalls.getOs(this, this.typeSelected).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayOs = response.data
      this.browserSelected = 'all'
      this.getBrowser()
      this.filterPlatform()
    },
    async getBrowser() {
      console.log('getBrowser')
      let response = await commonCalls.getBrowser(this, this.osSelected).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayBrowser = response.data
      this.emitter.emit('showLoader', false)
      this.filterPlatform()
    },
    editThisElement(element) {
      this.elementIdToEdit = element.id
      this.elementToEdit = element.status
    },
    getLocationName(idLocation) {
      let objLocation = this.arrayLocations.find(({ id }) => id === idLocation)
      return objLocation.name
    },
    getStatusName(idStatus) {
      let objStatus = this.arrayStatus.find(({ id }) => id === idStatus)
      return objStatus.name
    },
    getTypeName(idType) {
      let objType = this.arrayTypes.find(({ id }) => id === idType)
      return objType.name
    },
    filterPlatform() {
      this.arrayPlatformsToShow = this.arrayPlatforms
      console.log('filterPlatform')
      if (this.brandSelected != 'all') {
        let dummyArray = []
        for (let i = 0; i < this.arrayPlatformsToShow.length > 0; i++) {
          if (this.arrayPlatformsToShow[i].brand == this.brandSelected)
            dummyArray.push(this.arrayPlatformsToShow[i])
        }
        this.arrayPlatformsToShow = dummyArray
      }
      if (this.osSelected != 'all') {
        let dummyArray = []
        for (let i = 0; i < this.arrayPlatformsToShow.length > 0; i++) {
          if (this.arrayPlatformsToShow[i].os == this.osSelected)
            dummyArray.push(this.arrayPlatformsToShow[i])
        }
        this.arrayPlatformsToShow = dummyArray
      }
      if (this.browserSelected != 'all') {
        let dummyArray = []
        for (let i = 0; i < this.arrayPlatformsToShow.length > 0; i++) {
          if (this.arrayPlatformsToShow[i].browser == this.browserSelected)
            dummyArray.push(this.arrayPlatformsToShow[i])
          console.log(this.arrayPlatformsToShow[i].browser + '=' + this.browserSelected)
        }
        this.arrayPlatformsToShow = dummyArray
      }
    },
    async getPlatforms() {
      let response = {
        data: []
      }
      if (this.typeSelected != null) {
        response = await commonCalls.getPlatforms(this, this.typeSelected).catch((e) => {
          this.Logout(this, e)
        })
        if (this.getTypeName(this.typeSelected) == 'mobile devices') this.showBrandCol = true
        else this.showBrandCol = false
        this.arrayPlatforms = response.data
        this.osSelected = 'all'
        this.browserSelected = 'all'
        this.brandSelected = 'all'
        this.arrayBrowser = []
        this.getBrand()
      }
      this.emitter.emit('showLoader', false)
    },
    async savePlatform(json) {
      this.emitter.emit('showLoader', true)
      console.log('savePlatform')
      let response = await commonCalls.savePlatform(this, json).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayPlatforms = response.data
      this.emitter.emit('showLoader', false)
    },
    async setStatusPlatform(id) {
      this.emitter.emit('showLoader', true)
      console.log('savePlatform')
      let response = await commonCalls
        .updateStatusPlatform(this, id, this.typeSelected, this.elementToEdit)
        .catch((e) => {
          this.Logout(this, e)
        })
      this.arrayPlatforms = response.data
      this.elementIdToEdit = null
      this.emitter.emit('showLoader', false)
    },
    deletePlatform(id) {
      this.$confirm(
        this.language[this.config.currentLanguage].Platforms.ManagePlatform.confirmationPlatform,
        '',
        'warning'
      ).then(() => this.actionDeletPlatform(id))
    },
    async actionDeletPlatform(id) {
      let response = commonCalls
        .deletePlatform(this, id, this.typeSelected, this.elementToEdit)
        .catch((e) => {
          this.Logout(this, e)
        })
      this.arrayPlatforms = response.data
    }
  }
}
</script>
