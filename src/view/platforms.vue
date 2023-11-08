<template>
  <div>
    <div class="nav nav-tabs" id="nav-tab" role="tablist">
      <button
        class="nav-link active"
        id="nav-platforms-tab"
        data-bs-toggle="tab"
        data-bs-target="#nav-platforms"
        type="button"
        role="tab"
        aria-controls="nav-platforms"
        :aria-selected="'false'"
        v-on:click="$refs.managePlatform.start(arrayTypes)"
      >
        {{ language[config.currentLanguage].Platforms.platforms }}
      </button>
      <button
        class="nav-link"
        id="nav-os-tab"
        data-bs-toggle="tab"
        data-bs-target="#nav-os"
        ref="tab2"
        type="button"
        role="tab"
        aria-controls="nav-os"
        :aria-selected="'true'"
        v-on:click="$refs.os.tabStart()"
      >
        {{ language[config.currentLanguage].Platforms.os }}
      </button>
      <button
        class="nav-link"
        id="nav-osVersion-tab"
        data-bs-toggle="tab"
        data-bs-target="#nav-osVersion"
        ref="tab2"
        type="button"
        role="tab"
        aria-controls="nav-osVersion"
        :aria-selected="'true'"
        v-on:click="$refs.osVersion.tabStart()"
      >
        {{ language[config.currentLanguage].Platforms.osVersion }}
      </button>
      <button
        class="nav-link"
        id="nav-browsers-tab"
        data-bs-toggle="tab"
        data-bs-target="#nav-browsers"
        ref="tab2"
        type="button"
        role="tab"
        aria-controls="nav-browsers"
        :aria-selected="'true'"
        v-on:click="$refs.browsers.tabStart()"
      >
        {{ language[config.currentLanguage].Platforms.browsers }}
      </button>
      <button
        class="nav-link"
        id="nav-browserVersion-tab"
        data-bs-toggle="tab"
        data-bs-target="#nav-browserVersion"
        ref="tab2"
        type="button"
        role="tab"
        aria-controls="nav-browserVersion"
        :aria-selected="'true'"
        v-on:click="$refs.browserVersion.tabStart()"
      >
        {{ language[config.currentLanguage].Platforms.browserVersion }}
      </button>
      <button
        class="nav-link"
        id="nav-brands-tab"
        data-bs-toggle="tab"
        data-bs-target="#nav-brands"
        ref="tab2"
        type="button"
        role="tab"
        aria-controls="nav-brands"
        :aria-selected="'true'"
        v-on:click="$refs.brand.tabStart()"
      >
        {{ language[config.currentLanguage].Platforms.brands }}
      </button>
      <button
        class="nav-link"
        id="nav-models-tab"
        data-bs-toggle="tab"
        data-bs-target="#nav-models"
        ref="tab2"
        type="button"
        role="tab"
        aria-controls="nav-models"
        :aria-selected="'true'"
        v-on:click="$refs.modelDevice.tabStart()"
      >
        {{ language[config.currentLanguage].Platforms.models }}
      </button>
      <button
        class="nav-link"
        id="nav-locations-tab"
        data-bs-toggle="tab"
        data-bs-target="#nav-locations"
        ref="tab2"
        type="button"
        role="tab"
        aria-controls="nav-locations"
        :aria-selected="'true'"
        v-on:click="$refs.location.tabStart()"
      >
        {{ language[config.currentLanguage].Platforms.locations }}
      </button>
    </div>
    <div class="tab-content" id="pills-tabContent">
      <div
        class="tab-pane fade show active"
        id="nav-platforms"
        role="tabpanel"
        aria-labelledby="platforms-tab"
      >
        <!-- start platforms tab -->
        <managePlatform
          ref="managePlatform"
          :arrayTypes="arrayTypes"
          :arrayLocations="arrayLocations"
          :arrayStatus="arrayStatus"
        />
        <!-- end pltaforms tab -->
      </div>
      <div class="tab-pane fade" id="nav-os" role="tabpanel" aria-labelledby="os-tab">
        <!-- start os tab -->
        <os ref="os" :arrayTypes="arrayTypes" />
        <!-- end os tab -->
      </div>
      <div class="tab-pane fade" id="nav-osVersion" role="tabpanel" aria-labelledby="osVersion-tab">
        <!-- start osVersion tab -->
        <osVersion ref="osVersion" :arrayTypes="arrayTypes" />
        <!-- end osVersion tab -->
      </div>
      <div class="tab-pane fade" id="nav-browsers" role="tabpanel" aria-labelledby="browsers-tab">
        <!-- start browsers tab -->
        <browsers ref="browsers" :arrayTypes="arrayTypes" />
        <!-- end browsers tab -->
      </div>
      <div
        class="tab-pane fade"
        id="nav-browserVersion"
        role="tabpanel"
        aria-labelledby="browserVersion-tab"
      >
        <!-- start browserVersion tab -->
        <browserVersion ref="browserVersion" :arrayTypes="arrayTypes" />
        <!-- end browserVersion tab -->
      </div>
      <div class="tab-pane fade" id="nav-brands" role="tabpanel" aria-labelledby="brands-tab">
        <!-- start brands tab -->
        <brand ref="brand" />
        <!-- end brands tab -->
      </div>
      <div class="tab-pane fade" id="nav-models" role="tabpanel" aria-labelledby="models-tab">
        <!-- start models tab -->
        <modelDevice ref="modelDevice" />
        <!-- end models tab -->
      </div>
      <div class="tab-pane fade" id="nav-locations" role="tabpanel" aria-labelledby="locations-tab">
        <!-- start models tab -->
        <location ref="location" />
        <!-- end models tab -->
      </div>
    </div>
  </div>
</template>
<script>
import os from './platforms/os.vue'
import osVersion from './platforms/osVersion.vue'
import browsers from './platforms/browsers.vue'
import browserVersion from './platforms/browsersVersion.vue'
import brand from './platforms/brand.vue'
import modelDevice from './platforms/modelDevice.vue'
import commonCalls from './platforms/commonCalls'
import location from './platforms/location.vue'
import managePlatform from './platforms/managePlatform.vue'

export default {
  name: 'PlatformsComponent',
  components: {
    os,
    osVersion,
    browsers,
    browserVersion,
    brand,
    modelDevice,
    location,
    managePlatform
  },
  data() {
    return {
      arrayTypes: [],
      arrayLocations: [],
      arrayStatus: [],
      show: false,
      idSelected: null
    }
  },
  created() {
    this.getLocations()
    this.emitter.on('refreshPlatform', (msg) => {
      console.log('refreshPlatform')
      if (msg == true) this.getLocations()
      else {
        this.show = false
        setTimeout(
          function () {
            this.show = true
          }.bind(this),
          100
        )
      }
    })
  },
  methods: {
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

      this.show = true
      this.emitter.emit('showLoader', false)
      setTimeout(
        function () {
          this.$refs.managePlatform.start(this.arrayTypes)
        }.bind(this),
        100
      )
    }
  }
}
</script>
