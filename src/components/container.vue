<template>
  <div :class="'d-flex' + toggle" id="wrapper">
    <sidebar />
    <div id="page-content-wrapper" class="enterprise-shell">
      <headerComponent />
      <main class="enterprise-content">
        <router-view class="info" />
      </main>
    </div>
    <info />
    <Loader v-if="showLoader == true" />
  </div>
</template>
<style>
#wrapper {
  max-height: 100vh;
  overflow: hidden;
}

.enterprise-shell {
  background:
    radial-gradient(
      circle at top right,
      rgba(249, 128, 8, 0.14),
      transparent 30rem
    ),
    linear-gradient(135deg, #161821 0%, #252833 45%, #30323d 100%);
  min-height: 100vh;
}

.enterprise-content {
  height: calc(100vh - 72px);
  overflow: auto;
  padding: 1.25rem;
}

@media only screen and (max-width: 600px) {
  .info {
    visibility: collapse;
  }
}

.form-control {
  font-size: 10px !important;
}
</style>

<script>
// @ts-nocheck

import Loader from "../loader/animationLoader.vue";
import info from "../info/info.vue";
import headerComponent from "./header.vue";
import sidebar from "./sidebar.vue";

export default {
  name: "ContainerTemplate",
  components: {
    Loader,
    headerComponent,
    sidebar,
    info,
  },
  data() {
    return {
      showLoader: false,
      toggle: "",
    };
  },
  mount() {
    if (localStorage.lang) this.config.currentLanguage = localStorage.lang;
  },
  created() {
    this.emitter.on("showLoader", (msg) => {
      this.showLoader = msg;
    });
    this.emitter.on("sideBar", (msg) => {
      if (this.toggle == "") this.toggle = " " + msg;
      else this.toggle = "";
    });
  },
};
</script>
