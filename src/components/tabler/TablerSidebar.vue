<template>
  <aside class="idelium-tabler-sidebar" :class="{ 'is-collapsed': collapsed }">
    <div class="idelium-sidebar-brand">
      <img class="idelium-sidebar-logo" src="/idelium-icon.svg" alt="" />
      <span class="idelium-sidebar-brand-copy">
        <span class="idelium-sidebar-title">Idelium</span>
        <span class="idelium-sidebar-subtitle">Enterprise Console</span>
      </span>
    </div>

    <nav class="idelium-sidebar-nav" aria-label="Main navigation">
      <section
        v-for="group in menuGroups"
        :key="group.key"
        class="idelium-sidebar-group"
      >
        <h2 v-if="group.items.length" class="idelium-sidebar-group__title">
          {{ group.label }}
        </h2>
        <button
          v-for="item in group.items"
          :key="item.link"
          type="button"
          :aria-current="isActiveMenuItem(item.link) ? 'page' : undefined"
          :class="[
            'idelium-sidebar-link',
            { active: isActiveMenuItem(item.link) },
          ]"
          v-on:click="go(item.link, item.isActiveEmptyDb)"
          :title="language[config.currentLanguage].Sidebar[item.name]"
        >
          <span class="idelium-sidebar-icon">
            <font-awesome-icon
              :icon="item.icon"
              :class="'idelium-action-icon--navigation ' + item.class"
            />
          </span>
          <span class="idelium-sidebar-text">
            {{ language[config.currentLanguage].Sidebar[item.name] }}
          </span>
        </button>
      </section>
    </nav>
  </aside>
</template>

<script>
import apiClient from "@/services/apiClient";
import { getSelectedProjectId } from "@/stores/session";
import {
  projectRouteSection,
  selectedProjectRoute,
} from "@/router/projectRoutes";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

const MENU_GROUPS = [
  {
    key: "execution",
    links: ["testsperformed", "testlauncher"],
  },
  {
    key: "authoring",
    links: ["testcycles", "tests", "steps"],
  },
  {
    key: "resources",
    links: ["plugins", "environments", "platforms"],
  },
  {
    key: "administration",
    links: ["projects", "costumers", "accounts", "account", "apikey"],
  },
];

export default {
  name: "TablerSidebar",
  props: {
    collapsed: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
      session: useSessionStore(pinia),
    };
  },
  computed: {
    menuGroups() {
      const availableMenu = this.menu.filter((item) =>
        this.session.hasCapability(item.capability),
      );
      const groupedLinks = new Set(MENU_GROUPS.flatMap((group) => group.links));
      const copy = this.language[this.config.currentLanguage].Navigation
        ?.groups || {
        administration: "Administration",
        authoring: "Authoring",
        execution: "Execution",
        other: "Other",
        resources: "Resources",
      };
      const groups = MENU_GROUPS.map((group) => ({
        key: group.key,
        label: copy[group.key],
        items: availableMenu.filter((item) => group.links.includes(item.link)),
      }));
      const remaining = availableMenu.filter(
        (item) => !groupedLinks.has(item.link),
      );
      if (remaining.length) {
        groups.push({
          key: "other",
          label: copy.other,
          items: remaining,
        });
      }
      return groups;
    },
  },
  watch: {
    $route() {
      this.$forceUpdate();
    },
  },
  created() {
    this.getSidebar();
    this.emitter.on("refreshSideBar", () => {
      this.$forceUpdate();
    });
  },
  methods: {
    isActiveMenuItem(link) {
      const currentRoute = this.$router.currentRoute.value;
      const routeName = link === "account" ? "accounts" : link;
      return projectRouteSection(currentRoute.name) === routeName;
    },
    go(link, active) {
      const projectId = getSelectedProjectId();
      if (projectId != undefined || active == true) {
        this.$router.push(selectedProjectRoute(link, projectId));
        return;
      }

      this.$showAlert({
        message:
          this.language[this.config.currentLanguage].Dialog
            .firstProjectRequired,
        variant: "warning",
      });
      this.$router.push({ path: "/projects" });
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
      error: null,
      menu: [],
    };
  },
};
</script>

<style scoped>
.idelium-tabler-sidebar {
  background:
    linear-gradient(180deg, rgba(15, 17, 26, 0.98), rgba(7, 9, 15, 0.98)),
    radial-gradient(
      circle at top left,
      rgba(255, 122, 24, 0.2),
      transparent 16rem
    );
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 18px 0 42px rgba(0, 0, 0, 0.28);
  display: flex;
  flex: 0 0 280px;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
  transition:
    flex-basis 0.2s ease,
    width 0.2s ease;
  width: 280px;
  z-index: 25;
}

.idelium-tabler-sidebar.is-collapsed {
  flex-basis: 86px;
  width: 86px;
}

.idelium-sidebar-brand {
  align-items: center;
  display: flex;
  gap: 0.8rem;
  min-height: 76px;
  padding: 1.35rem 1.2rem 1rem;
}

.idelium-sidebar-logo {
  border-radius: 1rem;
  box-shadow: 0 12px 28px rgba(255, 91, 38, 0.22);
  flex: 0 0 44px;
  height: 44px;
  width: 44px;
}

.idelium-sidebar-brand-copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.idelium-sidebar-title {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0.2rem;
  text-transform: uppercase;
  white-space: nowrap;
}

.idelium-sidebar-subtitle {
  color: rgba(244, 244, 245, 0.56);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.14rem;
  text-transform: uppercase;
  white-space: nowrap;
}

.idelium-sidebar-nav {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 0.42rem;
  overflow-y: auto;
  padding: 0.8rem;
}

.idelium-sidebar-group {
  display: grid;
  gap: var(--id-space-1);
}

.idelium-sidebar-group + .idelium-sidebar-group {
  margin-top: var(--id-space-3);
}

.idelium-sidebar-group__title {
  color: var(--id-color-text-subtle);
  font-size: var(--id-font-size-caption);
  font-weight: var(--id-font-weight-bold);
  letter-spacing: 0.08em;
  margin: 0;
  padding: var(--id-space-2) var(--id-space-3);
  text-transform: uppercase;
}

.idelium-sidebar-link {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.95rem;
  color: rgba(244, 244, 245, 0.72);
  cursor: pointer;
  display: flex;
  gap: 0.85rem;
  min-height: 2.85rem;
  padding: 0.82rem 0.9rem;
  text-align: left;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
  width: 100%;
}

.idelium-sidebar-link:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  transform: translateX(2px);
}

.idelium-sidebar-link.active {
  background: linear-gradient(135deg, #ff8a00, #ff5a2e);
  border-color: rgba(255, 255, 255, 0.16);
  box-shadow: 0 16px 34px rgba(255, 122, 24, 0.24);
  color: #111318;
}

.idelium-sidebar-icon {
  align-items: center;
  display: inline-flex;
  flex: 0 0 1.25rem;
  justify-content: center;
}

.idelium-sidebar-text {
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.16rem;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.is-collapsed .idelium-sidebar-brand {
  align-items: center;
  justify-content: center;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.is-collapsed .idelium-sidebar-brand-copy,
.is-collapsed .idelium-sidebar-subtitle,
.is-collapsed .idelium-sidebar-group__title,
.is-collapsed .idelium-sidebar-text {
  display: none;
}

.is-collapsed .idelium-sidebar-link {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

@media only screen and (max-width: 900px) {
  .idelium-tabler-sidebar {
    height: 100vh;
    left: 0;
    position: fixed;
    top: 0;
    transform: translateX(0);
    transition: transform var(--id-motion-normal) ease;
    width: min(86vw, 280px);
  }

  .idelium-tabler-sidebar.is-collapsed {
    transform: translateX(-100%);
    width: min(86vw, 280px);
  }
}
</style>
