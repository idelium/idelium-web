<template>
  <loader v-if="$root.loading"></loader>
  <router-view v-else></router-view>
</template>
<style lang="scss">
//@import '@/assets/custom-vars.scss';
@use '@/assets/custom-vars.scss' as *;
</style>

<script>
import loader from './loader/animationLoader.vue'
export default {
  name: 'App',
  components: {
    loader
  },
  created() {
    console.log('idelium app: v' + this.config.version)
    console.log(window.location.hostname)
    if (window.location.hostname == 'localhost') {
      this.config.serviceBaseUrl = 'https://localhost/api/'
    } else {
      this.config.serviceBaseUrl = 'https://service.idelium.io/api/'
    }
    console.log('BaseUrl is: ' + this.config.serviceBaseUrl)
  }
}
</script>

<style></style>
