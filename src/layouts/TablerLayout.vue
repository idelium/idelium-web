<template>
  <div
    class="idelium-tabler-layout"
    :class="{ 'is-sidebar-collapsed': isSidebarCollapsed }"
  >
    <TablerSidebar :collapsed="isSidebarCollapsed" />
    <div class="idelium-tabler-page">
      <TablerHeader />
      <main class="idelium-tabler-body">
        <div class="idelium-tabler-container">
          <router-view v-slot="{ Component, route }">
            <transition name="idelium-page">
              <div :key="route.fullPath" class="idelium-page-frame info">
                <component :is="Component" />
              </div>
            </transition>
          </router-view>
        </div>
      </main>
    </div>
    <info />
    <Loader v-if="showLoader == true" />
  </div>
</template>

<script>
import Loader from "../loader/animationLoader.vue";
import info from "../info/info.vue";
import TablerHeader from "@/components/tabler/TablerHeader.vue";
import TablerSidebar from "@/components/tabler/TablerSidebar.vue";

export default {
  name: "TablerLayout",
  components: {
    Loader,
    TablerHeader,
    TablerSidebar,
    info,
  },
  data() {
    return {
      isSidebarCollapsed: false,
      loaderTimer: null,
      showLoader: false,
    };
  },
  mounted() {
    if (localStorage.lang) this.config.currentLanguage = localStorage.lang;
  },
  created() {
    this.emitter.on("showLoader", (msg) => {
      if (msg) {
        window.clearTimeout(this.loaderTimer);
        this.loaderTimer = window.setTimeout(() => {
          this.showLoader = true;
        }, 250);
        return;
      }

      window.clearTimeout(this.loaderTimer);
      this.showLoader = false;
    });
    this.emitter.on("sideBar", () => {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    });
  },
  beforeUnmount() {
    window.clearTimeout(this.loaderTimer);
  },
};
</script>

<style scoped>
.idelium-tabler-layout {
  background:
    radial-gradient(
      circle at 84% 0%,
      rgba(255, 122, 24, 0.14),
      transparent 28rem
    ),
    linear-gradient(135deg, #171923 0%, #232632 48%, #2d303b 100%);
  color: #f4f4f5;
  display: flex;
  min-height: 100vh;
  overflow: hidden;
}

.idelium-tabler-page {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
}

.idelium-tabler-body {
  flex: 1 1 auto;
  height: calc(100vh - 76px);
  overflow: auto;
  padding: 1.5rem;
}

.idelium-tabler-container {
  margin: 0 auto;
  max-width: 1480px;
  min-height: 100%;
  position: relative;
  width: 100%;
}

.idelium-page-frame {
  min-height: 100%;
}

.idelium-page-enter-active,
.idelium-page-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.idelium-page-enter-from {
  opacity: 0;
  transform: translateY(0.25rem);
}

.idelium-page-leave-active {
  inset: 0;
  pointer-events: none;
  position: absolute;
  width: 100%;
}

.idelium-page-leave-to {
  opacity: 0;
  transform: translateY(-0.2rem);
}

@media (prefers-reduced-motion: reduce) {
  .idelium-page-enter-active,
  .idelium-page-leave-active {
    transition: none;
  }

  .idelium-page-enter-from,
  .idelium-page-leave-to {
    transform: none;
  }
}

@media only screen and (max-width: 600px) {
  .info {
    visibility: collapse;
  }
}
</style>
