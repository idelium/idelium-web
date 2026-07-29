<template>
  <nav
    v-if="breadcrumbs.length"
    class="id-breadcrumbs"
    :aria-label="copy.breadcrumbsLabel"
  >
    <ol>
      <li v-for="(item, index) in breadcrumbs" :key="item.key">
        <router-link v-if="index < breadcrumbs.length - 1" :to="item.to">
          {{ item.label }}
        </router-link>
        <span v-else aria-current="page">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<script>
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

const ROUTE_TO_SIDEBAR_KEY = {
  accounts: "account",
  apikey: "apikey",
  costumers: "costumers",
  environments: "environments",
  platforms: "platforms",
  plugins: "plugins",
  postman: "testsperformed",
  profile: "profile",
  projects: "projects",
  steps: "steps",
  testcycles: "testcycles",
  testlauncher: "testlauncher",
  tests: "tests",
  testsperformed: "testsperformed",
};

export default {
  name: "AppBreadcrumbs",
  setup() {
    return {
      session: useSessionStore(pinia),
    };
  },
  computed: {
    copy() {
      return this.language[this.config.currentLanguage].Navigation;
    },
    breadcrumbs() {
      const routeName = this.$route.name;
      const routeKey = ROUTE_TO_SIDEBAR_KEY[routeName];
      if (!routeKey) return [];

      const sidebarCopy = this.language[this.config.currentLanguage].Sidebar;
      const items = [];
      if (this.$route.meta.projectScoped) {
        items.push({
          key: "projects",
          label: sidebarCopy.projects,
          to: { name: "projects" },
        });
        const project = this.session.availableProjects.find(
          (candidate) =>
            String(candidate.id) === String(this.$route.params.projectId),
        );
        items.push({
          key: "project-context",
          label:
            project?.name ||
            `${this.copy.project} ${this.$route.params.projectId}`,
          to: {
            name: routeName,
            params: { ...this.$route.params, tab: undefined },
          },
        });
      }
      items.push({
        key: String(routeName),
        label: sidebarCopy[routeKey] || String(routeName),
        to: this.$route,
      });
      return items.filter(
        (item, index, allItems) =>
          index === 0 || item.label !== allItems[index - 1].label,
      );
    },
  },
};
</script>

<style scoped>
.id-breadcrumbs {
  margin: 0 auto var(--id-space-4);
  max-width: 1480px;
  width: 100%;
}

.id-breadcrumbs ol {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-2);
  margin: 0;
}

.id-breadcrumbs li {
  align-items: center;
  color: var(--id-color-text-subtle);
  display: inline-flex;
  font-size: var(--id-font-size-small);
  gap: var(--id-space-2);
}

.id-breadcrumbs li:not(:last-child)::after {
  color: var(--id-color-border-strong);
  content: "/";
}

.id-breadcrumbs a {
  color: var(--id-color-text-muted);
}

.id-breadcrumbs [aria-current="page"] {
  color: var(--id-color-text);
  font-weight: var(--id-font-weight-medium);
}
</style>
