<template>
  <div>
    <div
      class="modal fade"
      ref="mymodal"
      id="myModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              {{ language[config.currentLanguage].TestLauncher.ModalListPlatform.modalTitle }}
            </h5>
          </div>
          <div class="row" style="margin-top: 10px">
            <div class="col-sm-3"></div>
            <div class="col-sm-3 labelFilter" v-if="showBrandCol == true">
              <span>{{
                language[config.currentLanguage].TestLauncher.ModalListPlatform.colBrand
              }}</span>
            </div>
            <div class="col-sm-3 labelFilter">
              <span>{{
                language[config.currentLanguage].TestLauncher.ModalListPlatform.colOs
              }}</span>
            </div>
            <div class="col-sm-3 labelFilter">
              <span v-if="arrayBrowser.length > 0">{{
                language[config.currentLanguage].TestLauncher.ModalListPlatform.colBrowser
              }}</span>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-3">
              <select
                class="form-select form-control"
                v-model="typeSelected"
                v-on:change="getPlatforms()"
              >
                <option v-for="(type, index) in arrayTypes" v-bind:key="index" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>
            <div class="col-sm-3" v-if="showBrandCol == true">
              <select
                class="form-select form-control"
                v-model="brandSelected"
                v-on:change="getBrand()"
              >
                <option :value="'all'">
                  {{ language[config.currentLanguage].TestLauncher.ModalListPlatform.all }}
                </option>
                <option v-for="(type, index) in arrayBrands" v-bind:key="index" :value="type.id">
                  {{ type.brand }}
                </option>
              </select>
            </div>
            <div class="col-sm-3">
              <select class="form-select form-control" v-model="osSelected" v-on:change="getOs()">
                <option value="all" selected>
                  {{ language[config.currentLanguage].TestLauncher.ModalListPlatform.all }}
                </option>
                <option v-for="(type, index) in arrayOs" v-bind:key="index" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>

            <div class="col-sm-3">
              <select
                class="form-select form-control"
                v-model="browserSelected"
                v-if="arrayBrowser.length > 0"
                v-on:change="filterPlatform()"
              >
                <option value="all">
                  {{ language[config.currentLanguage].TestLauncher.ModalListPlatform.all }}
                </option>
                <option v-for="(type, index) in arrayBrowser" v-bind:key="index" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>
            <div class="col-sm-1" />
          </div>
          <div class="row">
            <div class="col">
              <table
                class="table table-striped costum"
                style="margin-left: 10px; margin-right: 10px; margin-top: 10px"
              >
                <thead>
                  <tr>
                    <th scope="col">
                      {{
                        language[config.currentLanguage].TestLauncher.ModalListPlatform.colLocation
                      }}
                    </th>
                    <th scope="col" v-if="showBrandCol == true">
                      {{ language[config.currentLanguage].TestLauncher.ModalListPlatform.colBrand }}
                    </th>
                    <th scope="col">
                      {{ language[config.currentLanguage].TestLauncher.ModalListPlatform.colOs }}
                    </th>
                    <th scope="col">
                      {{
                        language[config.currentLanguage].TestLauncher.ModalListPlatform.colBrowser
                      }}
                    </th>
                    <th scope="col">
                      {{
                        language[config.currentLanguage].TestLauncher.ModalListPlatform.colStatus
                      }}
                    </th>
                  </tr>
                </thead>
                <tr v-for="(item, index) in arrayPlatformsToShow" v-bind:key="index">
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
                    <button
                      type="button"
                      class="btn btn-success"
                      v-if="getStatusName(item.status) == 'free'"
                      v-on:click="launchTest(item.id)"
                      style="width=100"
                    >
                      {{
                        language[config.currentLanguage].TestLauncher.ModalListPlatform.launchtest
                      }}
                    </button>
                    <span
                      v-on:dblclick="editThisElement(item)"
                      class="btn btn-link"
                      style="cursor: pointer;width=100%"
                      v-if="getStatusName(item.status) != 'free'"
                      >{{ getStatusName(item.status) }}</span
                    >
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.btn {
  margin: 10px;
}
.btn-success {
  color: #fff;
  background-color: #2d8515;
  border-color: #2d8515;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 15%), 0 1px 1px rgb(0 0 0 / 8%);
  margin: 10px;
}
</style>

<script>
import commonCalls from '../platforms/commonCalls'
import axios from 'axios'
import { Modal } from 'bootstrap'

export default {
  name: 'platformLauncher',
  created() {
    console.log('modalListPlatform')
  },
  mounted() {
    this.modalElem = new Modal(document.getElementById('myModal'))
  },
  data() {
    return {
      typeSelected: null,
      brandSelected: 'all',
      browserSelected: 'all',
      osSelected: 'all',
      arrayTypes: [],
      arrayPlatforms: [],
      arrayPlatformsToShow: [],
      arrayBrowser: [],
      arrayOs: [],
      arrayBrands: [],
      elementIdToEdit: null,
      elementToEdit: null,
      showBrandCol: true,
      idTest: null,
      environment: null
    }
  },
  methods: {
    showModal(id, environment) {
      this.modalElem.show()
      this.getLocations()
      this.idTest = id
      this.environment = environment
    },
    launchTest(idPlatform) {
      this.modalElem.hide()
      this.emitter.emit('showLoader', true)
      axios
        .post(
          this.config.serviceBaseUrl + this.config.url.launchtest,
          {
            idTestCycle: this.idTest.toString(),
            environment: this.environment,
            idProject: localStorage.projectIdSelected,
            idPlatform: idPlatform
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          console.log(response)
          this.emitter.emit('showLoader', false)
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    async getLocations() {
      this.emitter.emit('showLoader', true)
      let response = await commonCalls.getLocation(this).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayLocations = response.data
      this.getStatus()
      this.getTypes()
    },
    async getStatus() {
      let response = await commonCalls.getStatus(this).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayStatus = response.data
    },
    async getTypes() {
      let response = await commonCalls.getTypes(this).catch((e) => {
        this.Logout(this, e)
      })
      this.arrayTypes = response.data
      if (this.arrayTypes.length > 0) this.typeSelected = this.arrayTypes[0].id

      this.show = true
      this.getPlatforms()
      this.getBrand()
      this.emitter.emit('showLoader', false)
    },
    async getBrand() {
      console.log('getBrand' + this.typeSelected)
      this.emitter.emit('showLoader', true)
      this.arrayBrands = []
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
      let response = await commonCalls.getPlatforms(this, this.typeSelected).catch((e) => {
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
      this.emitter.emit('showLoader', false)
    }
  }
}
</script>
