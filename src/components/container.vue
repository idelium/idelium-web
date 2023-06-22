<template>
  <div :class="'d-flex' + toggle" id="wrapper" style="overflow: hidden; max-height: 100vh">
    <sidebar />
    <div id="page-content-wrapper">
      <headerComponent />
      <router-view class="info" />
    </div>
    <info />
    <Loader v-if="showLoader == true" />
  </div>
</template>
<!--style lang="scss">
  @import '../styles/app.scss'; 
  @import '../assets/custom-vars.scss';
  @import '~bootstrap/scss/bootstrap.scss'; 
</style-->
<style>
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

import Loader from '../loader/animationLoader.vue'
import info from '../info/info.vue'
import headerComponent from './header.vue'
import sidebar from './sidebar.vue'

export default {
  name: 'Container',
  components: {
    Loader,
    headerComponent,
    sidebar,
    info
  },
  data() {
    return {
      showLoader: false,
      toggle: ''
    }
  },
  mount() {
    if (localStorage.lang) this.config.currentLanguage = localStorage.lang
  },
  created() {
    this.emitter.on('showLoader', (msg) => {
      console.log('showLoader:' + msg)
      this.showLoader = msg
    })
    this.emitter.on('sideBar', (msg) => {
      if (this.toggle == '') this.toggle = ' ' + msg
      else this.toggle = ''
    })
  }
}
</script>
