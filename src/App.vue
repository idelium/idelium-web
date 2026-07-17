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
import { resolveApiBaseUrl } from './services/runtimeConfig'

export default {
  name: 'App',
  components: {
    loader
  },
  created() {
    this.config.serviceBaseUrl = resolveApiBaseUrl()
  }
}
</script>

<style></style>
