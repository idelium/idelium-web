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
          <router-view class="info" />
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
      showLoader: false,
    };
  },
  mounted() {
    if (localStorage.lang) this.config.currentLanguage = localStorage.lang;
  },
  created() {
    this.emitter.on("showLoader", (msg) => {
      this.showLoader = msg;
    });
    this.emitter.on("sideBar", () => {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    });
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
  width: 100%;
}

@media only screen and (max-width: 600px) {
  .info {
    visibility: collapse;
  }
}
</style>
