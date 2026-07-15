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
    if (window.location.hostname == 'localhost') {
      this.config.serviceBaseUrl = 'https://localhost/api/'
    } else {
      this.config.serviceBaseUrl = 'https://service.idelium.io/api/'
    }
  }
}
</script>

<style></style>
