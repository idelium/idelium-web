<template>
  <div
    class="idelium-tabler-layout"
    :class="{ 'is-sidebar-collapsed': isSidebarCollapsed }"
  >
    <a class="idelium-skip-link" href="#idelium-main-content">
      {{ language[config.currentLanguage].Navigation.skipToContent }}
    </a>
    <TablerSidebar :collapsed="isSidebarCollapsed" />
    <button
      v-if="isNarrowViewport && !isSidebarCollapsed"
      type="button"
      class="idelium-sidebar-overlay"
      :aria-label="language[config.currentLanguage].Navigation.closeNavigation"
      v-on:click="isSidebarCollapsed = true"
    ></button>
    <div class="idelium-tabler-page">
      <TablerHeader />
      <main id="idelium-main-content" class="idelium-tabler-body" tabindex="-1">
        <AppBreadcrumbs />
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
import AppBreadcrumbs from "@/components/navigation/AppBreadcrumbs.vue";
import { pinia } from "@/stores/pinia";
import { useNavigationStore } from "@/stores/navigation";

export default {
  name: "TablerLayout",
  components: {
    Loader,
    AppBreadcrumbs,
    TablerHeader,
    TablerSidebar,
    info,
  },
  data() {
    return {
      isSidebarCollapsed: false,
      isNarrowViewport: false,
      loaderTimer: null,
      showLoader: false,
      navigation: useNavigationStore(pinia),
    };
  },
  mounted() {
    if (localStorage.lang) this.config.currentLanguage = localStorage.lang;
    this.updateViewportState();
    window.addEventListener("resize", this.updateViewportState);
    window.addEventListener("beforeunload", this.handleBeforeUnload);
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
    window.removeEventListener("resize", this.updateViewportState);
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
  },
  methods: {
    handleBeforeUnload(event) {
      if (!this.navigation.hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    },
    updateViewportState() {
      const wasNarrow = this.isNarrowViewport;
      this.isNarrowViewport = window.innerWidth <= 900;
      if (!wasNarrow && this.isNarrowViewport) {
        this.isSidebarCollapsed = true;
      }
    },
  },
};
</script>

<style scoped>
.idelium-tabler-layout {
  background:
    radial-gradient(
      circle at 84% 0%,
      rgba(255, 122, 24, 0.12),
      transparent 28rem
    ),
    radial-gradient(circle at 0% 100%, rgba(2, 132, 199, 0.09), transparent 26rem),
    linear-gradient(135deg, #f8fafc 0%, #f1f5f9 48%, #e9eef7 100%);
  color: var(--id-color-text);
  display: flex;
  min-height: 100vh;
  overflow: hidden;
}

:global(:root[data-theme="dark"]) .idelium-tabler-layout {
  background:
    radial-gradient(
      circle at 84% 0%,
      rgba(255, 122, 24, 0.14),
      transparent 28rem
    ),
    linear-gradient(135deg, #171923 0%, #232632 48%, #2d303b 100%);
  color: #f4f4f5;
}

.idelium-skip-link {
  background: var(--id-color-primary);
  border-radius: var(--id-radius-small);
  color: var(--id-color-on-primary);
  font-weight: var(--id-font-weight-bold);
  left: var(--id-space-3);
  padding: var(--id-space-3) var(--id-space-4);
  position: fixed;
  top: var(--id-space-3);
  transform: translateY(-200%);
  z-index: 3000;
}

.idelium-skip-link:focus {
  transform: translateY(0);
}

.idelium-sidebar-overlay {
  background: var(--id-color-overlay);
  border: 0;
  inset: 0;
  position: fixed;
  z-index: 24;
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
  .idelium-tabler-body {
    padding: var(--id-space-3);
  }
}
</style>
