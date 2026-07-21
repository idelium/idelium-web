<template>
  <div>
    <router-view v-slot="{ Component, route }">
      <transition name="idelium-auth-page">
        <div :key="route.fullPath" class="idelium-auth-page-frame info">
          <component :is="Component" />
        </div>
      </transition>
    </router-view>
  </div>
</template>
<script>
export default {
  name: 'PagesComponent',
}
</script>
<style scoped>
.idelium-auth-page-frame {
  min-height: 100vh;
}

.idelium-auth-page-enter-active,
.idelium-auth-page-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.idelium-auth-page-enter-from {
  opacity: 0;
  transform: translateY(0.35rem);
}

.idelium-auth-page-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}

.idelium-auth-page-leave-active {
  inset: 0;
  pointer-events: none;
  position: absolute;
  width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .idelium-auth-page-enter-active,
  .idelium-auth-page-leave-active {
    transition: none;
  }

  .idelium-auth-page-enter-from,
  .idelium-auth-page-leave-to {
    transform: none;
  }
}
</style>
