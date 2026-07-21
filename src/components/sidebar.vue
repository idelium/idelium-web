<template>
  <div
    class="border-right info costum sidebar"
    id="sidebar-wrapper"
    ref="sidebarWrapper"
  >
    <div class="sidebar-heading">
      <span class="sidebar-product">Idelium</span>
      <span class="sidebar-label">Enterprise Console</span>
    </div>
    <div class="list-group sidebar-nav">
      <div
        v-for="(item, index) in menu"
        v-bind:key="index"
        :class="
          'list-group-item sidebar-link ' +
          (isActiveMenuItem(item.link) ? 'active' : '')
        "
        v-on:click="go(item.link, item.isActiveEmptyDb)"
        :title="language[config.currentLanguage].Sidebar[item.name]"
      >
        <font-awesome-icon
          :icon="item.icon"
          :class="'iconClass idelium-action-icon--navigation ' + item.class"
        />
        <span v-if="showLabel" class="itemSidebar">{{
          language[config.currentLanguage].Sidebar[item.name]
        }}</span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.sidebar {
  background:
    linear-gradient(180deg, rgba(18, 20, 29, 0.98), rgba(11, 12, 18, 0.98)),
    radial-gradient(
      circle at top left,
      rgba(249, 128, 8, 0.24),
      transparent 18rem
    );
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 16px 0 36px rgba(0, 0, 0, 0.24);
}

.sidebar-heading {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.25rem 1rem 1rem !important;
  text-align: left !important;
}

.sidebar-product {
  color: #ffffff;
  font-size: 0.95rem !important;
  font-weight: 800;
  letter-spacing: 0.18rem !important;
}

.sidebar-label {
  color: rgba(244, 244, 245, 0.58);
  font-size: 0.58rem !important;
  font-weight: 700;
  letter-spacing: 0.13rem !important;
  text-transform: uppercase;
}

.sidebar-nav {
  gap: 0.35rem;
  padding: 0 0.75rem;
}

.list-group-item {
  border: 1px solid transparent;
  border-radius: 0.85rem;
  background: transparent !important;
  color: rgba(244, 244, 245, 0.74) !important;
}

.sidebar-link {
  align-items: center;
  cursor: pointer;
  display: flex;
  min-height: 2.6rem;
  padding: 0.78rem 0.9rem;
  position: relative;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.sidebar-link:hover {
  background: rgba(255, 255, 255, 0.06) !important;
  border-color: rgba(255, 255, 255, 0.08);
  color: #ffffff !important;
  transform: translateX(2px);
}

.list-group-item.active {
  z-index: 2;
  color: #101218 !important;
  background: linear-gradient(135deg, #ff8a00, #ff5a2e) !important;
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 14px 30px rgba(249, 128, 8, 0.25);
}
.iconClass {
  flex: 0 0 1.2rem;
  margin-right: 0.85rem;
}
@media only screen and (max-width: 600px) {
  .info {
    visibility: collapse;
  }
}
.itemSidebar {
  position: static;
  text-transform: uppercase;
  cursor: pointer;
  font-size: 0.62rem !important;
  font-weight: 800;
  letter-spacing: 0.15rem !important;
}
</style>

<script>
import apiClient from "@/services/apiClient";
import { getSelectedProjectId } from "@/stores/session";

export default {
  name: "SidebarComponent",
  watch: {
    $route() {
      this.$forceUpdate();
    },
  },
  created() {
    this.getSidebar();
    this.emitter.on("showIcon", () => {
      if (this.showLabel == true) {
        this.showLabel = false;
      } else {
        this.showLabel = true;
      }
    });
    this.emitter.on("refreshSideBar", () => {
      this.$forceUpdate();
    });
  },
  methods: {
    isActiveMenuItem(link) {
      const itemPath = "/" + link;
      const currentPath = this.$router.currentRoute.value.path;

      return currentPath === itemPath || currentPath.startsWith(itemPath + "/");
    },
    go(link, active) {
      if (getSelectedProjectId() != undefined || active == true)
        this.$router.push({ path: "/" + link });
      else {
        this.$showAlert({
          message: this.language[this.config.currentLanguage].Dialog.firstProjectRequired,
          variant: "warning",
        });
        this.$router.push({ path: "/projects" });
      }
    },
    getSidebar() {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(this.config.serviceBaseUrl + this.config.url.sidebar, {
          headers: this.setHeaders(),
        })
        .then((response) => {
          this.emitter.emit("showLoader", false);

          this.menu = response.data;
        })
        .catch((e) => {
          this.$router.push({ name: "Login" });
          this.error = e;
        });
    },
  },
  data() {
    return {
      showLabel: true,
      styleIcon: "",
      menu: [],
    };
  },
};
</script>
