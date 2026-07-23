<template>
  <div>
    <div class="nav nav-tabs" id="nav-tab" role="tablist">
      <button
        :class="tabButtonClass('platforms')"
        id="nav-platforms-tab"
        type="button"
        role="tab"
        aria-controls="nav-platforms"
        :aria-selected="isActiveTab('platforms')"
        v-on:click="openTab('platforms')"
      >
        {{ language[config.currentLanguage].Platforms.platforms }}
      </button>
      <button
        :class="tabButtonClass('os')"
        id="nav-os-tab"
        ref="tab2"
        type="button"
        role="tab"
        aria-controls="nav-os"
        :aria-selected="isActiveTab('os')"
        v-on:click="openTab('os')"
      >
        {{ language[config.currentLanguage].Platforms.os }}
      </button>
      <button
        :class="tabButtonClass('os-version')"
        id="nav-osVersion-tab"
        ref="tab2"
        type="button"
        role="tab"
        aria-controls="nav-osVersion"
        :aria-selected="isActiveTab('os-version')"
        v-on:click="openTab('os-version')"
      >
        {{ language[config.currentLanguage].Platforms.osVersion }}
      </button>
      <button
        :class="tabButtonClass('browsers')"
        id="nav-browsers-tab"
        ref="tab2"
        type="button"
        role="tab"
        aria-controls="nav-browsers"
        :aria-selected="isActiveTab('browsers')"
        v-on:click="openTab('browsers')"
      >
        {{ language[config.currentLanguage].Platforms.browsers }}
      </button>
      <button
        :class="tabButtonClass('browser-version')"
        id="nav-browserVersion-tab"
        ref="tab2"
        type="button"
        role="tab"
        aria-controls="nav-browserVersion"
        :aria-selected="isActiveTab('browser-version')"
        v-on:click="openTab('browser-version')"
      >
        {{ language[config.currentLanguage].Platforms.browserVersion }}
      </button>
      <button
        :class="tabButtonClass('brands')"
        id="nav-brands-tab"
        ref="tab2"
        type="button"
        role="tab"
        aria-controls="nav-brands"
        :aria-selected="isActiveTab('brands')"
        v-on:click="openTab('brands')"
      >
        {{ language[config.currentLanguage].Platforms.brands }}
      </button>
      <button
        :class="tabButtonClass('models')"
        id="nav-models-tab"
        ref="tab2"
        type="button"
        role="tab"
        aria-controls="nav-models"
        :aria-selected="isActiveTab('models')"
        v-on:click="openTab('models')"
      >
        {{ language[config.currentLanguage].Platforms.models }}
      </button>
      <button
        :class="tabButtonClass('locations')"
        id="nav-locations-tab"
        ref="tab2"
        type="button"
        role="tab"
        aria-controls="nav-locations"
        :aria-selected="isActiveTab('locations')"
        v-on:click="openTab('locations')"
      >
        {{ language[config.currentLanguage].Platforms.locations }}
      </button>
    </div>
    <div class="tab-content" id="pills-tabContent">
      <div
        :class="tabPaneClass('platforms')"
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
      <div
        :class="tabPaneClass('os')"
        id="nav-os"
        role="tabpanel"
        aria-labelledby="os-tab"
      >
        <!-- start os tab -->
        <os ref="os" :arrayTypes="arrayTypes" />
        <!-- end os tab -->
      </div>
      <div
        :class="tabPaneClass('os-version')"
        id="nav-osVersion"
        role="tabpanel"
        aria-labelledby="osVersion-tab"
      >
        <!-- start osVersion tab -->
        <osVersion ref="osVersion" :arrayTypes="arrayTypes" />
        <!-- end osVersion tab -->
      </div>
      <div
        :class="tabPaneClass('browsers')"
        id="nav-browsers"
        role="tabpanel"
        aria-labelledby="browsers-tab"
      >
        <!-- start browsers tab -->
        <browsers ref="browsers" :arrayTypes="arrayTypes" />
        <!-- end browsers tab -->
      </div>
      <div
        :class="tabPaneClass('browser-version')"
        id="nav-browserVersion"
        role="tabpanel"
        aria-labelledby="browserVersion-tab"
      >
        <!-- start browserVersion tab -->
        <browserVersion ref="browserVersion" :arrayTypes="arrayTypes" />
        <!-- end browserVersion tab -->
      </div>
      <div
        :class="tabPaneClass('brands')"
        id="nav-brands"
        role="tabpanel"
        aria-labelledby="brands-tab"
      >
        <!-- start brands tab -->
        <brand ref="brand" />
        <!-- end brands tab -->
      </div>
      <div
        :class="tabPaneClass('models')"
        id="nav-models"
        role="tabpanel"
        aria-labelledby="models-tab"
      >
        <!-- start models tab -->
        <modelDevice ref="modelDevice" />
        <!-- end models tab -->
      </div>
      <div
        :class="tabPaneClass('locations')"
        id="nav-locations"
        role="tabpanel"
        aria-labelledby="locations-tab"
      >
        <!-- start models tab -->
        <location ref="location" />
        <!-- end models tab -->
      </div>
    </div>
  </div>
</template>
<script>
import os from "./platforms/os.vue";
import osVersion from "./platforms/osVersion.vue";
import browsers from "./platforms/browsers.vue";
import browserVersion from "./platforms/browsersVersion.vue";
import brand from "./platforms/brand.vue";
import modelDevice from "./platforms/modelDevice.vue";
import commonCalls from "./platforms/commonCalls";
import location from "./platforms/location.vue";
import managePlatform from "./platforms/managePlatform.vue";

const DEFAULT_TAB = "platforms";
const PLATFORM_TABS = {
  platforms: {
    refName: "managePlatform",
    start(component) {
      component.start(this.arrayTypes);
    },
  },
  os: {
    refName: "os",
    start(component) {
      component.tabStart();
    },
  },
  "os-version": {
    refName: "osVersion",
    start(component) {
      component.tabStart();
    },
  },
  browsers: {
    refName: "browsers",
    start(component) {
      component.tabStart();
    },
  },
  "browser-version": {
    refName: "browserVersion",
    start(component) {
      component.tabStart();
    },
  },
  brands: {
    refName: "brand",
    start(component) {
      component.tabStart();
    },
  },
  models: {
    refName: "modelDevice",
    start(component) {
      component.tabStart();
    },
  },
  locations: {
    refName: "location",
    start(component) {
      component.tabStart();
    },
  },
};

export default {
  name: "PlatformsComponent",
  components: {
    os,
    osVersion,
    browsers,
    browserVersion,
    brand,
    modelDevice,
    location,
    managePlatform,
  },
  data() {
    return {
      arrayTypes: [],
      arrayLocations: [],
      arrayStatus: [],
      show: false,
      idSelected: null,
      activeTab: DEFAULT_TAB,
    };
  },
  created() {
    this.getLocations();
    this.emitter.on("refreshPlatform", (msg) => {
      if (msg == true) this.getLocations();
      else {
        this.show = false;
        setTimeout(
          function () {
            this.show = true;
          }.bind(this),
          100,
        );
      }
    });
    this.syncTabFromRoute();
  },
  watch: {
    "$route.params.tab"() {
      this.syncTabFromRoute();
    },
  },
  methods: {
    isActiveTab(tab) {
      return this.activeTab === tab;
    },
    tabButtonClass(tab) {
      return ["nav-link", { active: this.isActiveTab(tab) }];
    },
    tabPaneClass(tab) {
      return [
        "tab-pane",
        "fade",
        { show: this.isActiveTab(tab), active: this.isActiveTab(tab) },
      ];
    },
    openTab(tab) {
      if (this.isActiveTab(tab)) {
        this.startActiveTab();
        return;
      }
      this.$router.push({
        name: "platforms",
        params: { ...this.$route.params, tab },
      });
    },
    syncTabFromRoute() {
      const tab = this.$route.params.tab || DEFAULT_TAB;
      if (!PLATFORM_TABS[tab]) {
        this.$router.replace({
          name: "platforms",
          params: { ...this.$route.params, tab: DEFAULT_TAB },
        });
        return;
      }
      this.activeTab = tab;
      this.startActiveTab();
    },
    startActiveTab() {
      if (!this.show) return;
      this.$nextTick(() => {
        const tabConfig = PLATFORM_TABS[this.activeTab];
        const component = this.$refs[tabConfig.refName];
        if (component) tabConfig.start.call(this, component);
      });
    },
    async getLocations() {
      this.emitter.emit("showLoader", true);
      try {
        const response = await commonCalls.getLocation(this);
        this.arrayLocations = response.data;
        await this.getStatus();
        await this.getTypes();
        this.show = true;
        setTimeout(() => this.startActiveTab(), 100);
      } catch (e) {
        this.Logout(this, e);
      } finally {
        this.emitter.emit("showLoader", false);
      }
    },
    async getStatus() {
      const response = await commonCalls.getStatus(this);
      this.arrayStatus = response.data;
    },
    async getTypes() {
      const response = await commonCalls.getTypes(this);
      this.arrayTypes = response.data;
    },
  },
};
</script>
