<template>
  <header class="idelium-tabler-header">
    <div class="idelium-header-left">
      <button
        type="button"
        class="idelium-icon-button"
        :aria-label="language[config.currentLanguage].Actions.toggleSidebar"
        :title="language[config.currentLanguage].Actions.toggleSidebar"
        v-on:click="sideBar()"
      >
        <font-awesome-icon
          icon="bars"
          class="idelium-action-icon--navigation"
        />
      </button>
      <img
        src="@/assets/idelium.png"
        class="idelium-header-logo"
        alt="Idelium"
      />
    </div>

    <ContextSwitcher
      class="idelium-header-context"
      :customer-id="costumerSelected"
      :customers="arrayCostumers"
      :disabled="contextChangePending"
      :labels="contextLabels"
      :project-id="projectSelected"
      :projects="arrayProjects"
      v-on:apply-customer="changeCostumer"
      v-on:update:customer-id="costumerSelected = $event"
      v-on:update:project-id="projectSelected = $event"
    />

    <div class="idelium-header-actions">
      <div class="dropdown">
        <button
          class="idelium-icon-button idelium-language-button dropdown-toggle"
          type="button"
          id="tablerLanguageMenuButton"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          :aria-label="language[config.currentLanguage].Header.language"
          :title="language[config.currentLanguage].Header.language"
        >
          <span class="idelium-flag-frame">
            <country-flag
              :country="config.currentLanguage"
              class="language-flag"
            />
          </span>
        </button>
        <ul
          class="dropdown-menu dropdown-menu-end"
          aria-labelledby="tablerLanguageMenuButton"
        >
          <li v-for="(lang, index) in Object.keys(language)" :key="index">
            <a class="dropdown-item" href="#" v-on:click="changeLang(lang)">
              <country-flag
                :country="lang"
                size="small"
                class="language-flag-menu"
              />
              {{ language[config.currentLanguage].Header.languages[lang] }}
            </a>
          </li>
        </ul>
      </div>

      <button
        type="button"
        class="idelium-icon-button"
        :aria-label="themeToggleLabel"
        :title="themeToggleLabel"
        v-on:click="toggleTheme"
      >
        <font-awesome-icon
          :icon="currentTheme === 'dark' ? 'sun' : 'moon'"
          class="idelium-action-icon--navigation"
        />
      </button>

      <div class="dropdown">
        <button
          class="idelium-icon-button dropdown-toggle"
          type="button"
          id="tablerUserMenuButton"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          :aria-label="language[config.currentLanguage].Actions.userMenu"
          :title="language[config.currentLanguage].Actions.userMenu"
        >
          <font-awesome-icon
            icon="user-circle"
            class="idelium-action-icon--user"
          />
        </button>
        <ul
          class="dropdown-menu dropdown-menu-end"
          aria-labelledby="tablerUserMenuButton"
        >
          <li>
            <a
              class="dropdown-item active"
              v-on:click="$router.push({ path: '/profile' })"
            >
              {{ language[config.currentLanguage].Header.profile }}
            </a>
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li>
            <a class="dropdown-item" v-on:click="logout()">
              {{ language[config.currentLanguage].Header.logOut }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </header>
  <LogoutConfirmModal
    :visible="logoutModalVisible"
    :title="language[config.currentLanguage].Header.confirmLogoutTitle"
    :message="language[config.currentLanguage].Header.confirmLogout"
    :cancel-label="language[config.currentLanguage].Header.cancelLogout"
    :confirm-label="language[config.currentLanguage].Header.confirmLogoutAction"
    v-on:cancel="cancelLogout"
    v-on:confirm="confirmLogout"
  />
</template>

<script>
import apiClient from "@/services/apiClient";
import { useSessionStore } from "@/stores/session";
import { pinia } from "@/stores/pinia";
import { useNavigationStore } from "@/stores/navigation";
import { isProjectScopedRouteName } from "@/router/projectRoutes";
import CountryFlag from "vue-country-flag-next";
import LogoutConfirmModal from "@/components/shared/LogoutConfirmModal.vue";
import ContextSwitcher from "@/components/navigation/ContextSwitcher.vue";

export default {
  name: "TablerHeader",
  components: {
    CountryFlag,
    ContextSwitcher,
    LogoutConfirmModal,
  },
  setup() {
    return {
      navigation: useNavigationStore(pinia),
      session: useSessionStore(),
    };
  },
  data() {
    return {
      arrayProjects: [],
      arrayCostumers: [],
      projectSelected: null,
      costumerSelected: null,
      contextChangePending: false,
      logoutModalVisible: false,
      restoringProjectSelection: false,
      currentTheme: "light",
    };
  },
  created() {
    this.getHeaders();
    this.emitter.on("updateListProject", (msg) => {
      this.arrayProjects = msg;
      if (this.projectSelected == null && this.arrayProjects.length > 0)
        this.projectSelected = this.arrayProjects[0].id;
    });
  },
  watch: {
    async projectSelected(projectId, previousProjectId) {
      if (this.restoringProjectSelection || projectId == null) return;
      if (
        previousProjectId != null &&
        String(projectId) !== String(previousProjectId) &&
        this.navigation.hasUnsavedChanges
      ) {
        const shouldDiscard = await this.navigation.confirmDiscard();
        if (!shouldDiscard) {
          this.restoringProjectSelection = true;
          this.projectSelected = previousProjectId;
          await this.$nextTick();
          this.restoringProjectSelection = false;
          return;
        }
        this.navigation.clearAll();
      }
      this.session.selectProject(projectId);
      await this.syncProjectRouteFromSelection();
      this.refreshComponents(true);
    },
    "$route.params.projectId"() {
      this.syncProjectSelectionFromRoute();
    },
  },
  computed: {
    contextLabels() {
      const copy = this.language[this.config.currentLanguage].Header;
      return {
        activeContext: copy.activeContext,
        customer: copy.costumer,
        project: copy.project,
        switchCustomer: copy.btnChangeCostumer,
      };
    },
    themeToggleLabel() {
      const copy = this.language[this.config.currentLanguage].Header;
      return this.currentTheme === "dark"
        ? copy.switchToLightTheme
        : copy.switchToDarkTheme;
    },
  },
  mounted() {
    this.currentTheme = localStorage.ideliumTheme || "light";
    this.applyTheme(this.currentTheme);
  },
  methods: {
    applyTheme(theme) {
      const normalizedTheme = theme === "dark" ? "dark" : "light";
      this.currentTheme = normalizedTheme;
      document.documentElement.dataset.theme = normalizedTheme;
      localStorage.ideliumTheme = normalizedTheme;
    },
    toggleTheme() {
      this.applyTheme(this.currentTheme === "dark" ? "light" : "dark");
    },
    syncProjectSelectionFromRoute() {
      const routeProjectId = this.$route.params?.projectId;
      if (!routeProjectId || this.arrayProjects.length === 0) return;

      const routeProject = this.arrayProjects.find(
        (project) => String(project.id) === String(routeProjectId),
      );
      if (!routeProject) {
        this.projectSelected = this.arrayProjects[0].id;
        return;
      }
      if (String(this.projectSelected) === String(routeProject.id)) return;

      this.projectSelected = routeProject.id;
    },
    async syncProjectRouteFromSelection() {
      if (!isProjectScopedRouteName(this.$route.name) || !this.projectSelected)
        return;
      if (
        String(this.$route.params?.projectId) === String(this.projectSelected)
      )
        return;

      await this.$router.replace({
        name: this.$route.name,
        params: {
          ...(this.$route.params || {}),
          projectId: this.projectSelected,
        },
        query: this.$route.query,
      });
    },
    changeLang(lang) {
      this.config.currentLanguage = lang;
      localStorage.langSelected = lang;
      this.emitter.emit("refreshSideBar");
      if (this.$route.name == "plugins")
        this.emitter.emit("refreshPlugin", false);
      if (this.$route.name == "steps") this.emitter.emit("refreshStep", false);
      if (this.$route.name == "environments")
        this.emitter.emit("refreshEnvironment", false);
      if (this.$route.name == "tests") this.emitter.emit("refreshTest", false);
      if (this.$route.name == "testcycles")
        this.emitter.emit("refreshTestCycle", false);
      if (this.$route.name == "testsperformed")
        this.emitter.emit("refreshTestCyclePerformed", false);
      if (this.$route.name == "projects")
        this.emitter.emit("refreshProject", false);
      if (this.$route.name == "apikey")
        this.emitter.emit("refreshApiKey", false);
      if (this.$route.name == "costumers")
        this.emitter.emit("refreshCostumer", false);
      if (this.$route.name == "accounts")
        this.emitter.emit("refreshAccount", false);
      if (this.$route.name == "profile")
        this.emitter.emit("refreshProfile", false);
      if (this.$route.name == "platforms")
        this.emitter.emit("refreshPlatform", false);
      if (this.$route.name == "testlauncher")
        this.emitter.emit("refreshTestLauncher", false);

      this.$forceUpdate();
      this.refreshComponents();
    },
    refreshComponents(isProjectChange = false) {
      if (this.$route.name == "plugins")
        this.emitter.emit("refreshPlugin", true);
      if (this.$route.name == "steps") this.emitter.emit("refreshStep", true);
      if (this.$route.name == "environments")
        this.emitter.emit("refreshEnvironment", true);
      if (this.$route.name == "tests") this.emitter.emit("refreshTest", true);
      if (this.$route.name == "testcycles")
        this.emitter.emit("refreshTestCycle", true);
      if (this.$route.name == "testsperformed")
        this.emitter.emit("refreshTestCyclePerformed", true);
      if (isProjectChange == false || this.$route.name == "projects")
        this.emitter.emit("refreshProject", true);
      if (this.$route.name == "apikey")
        this.emitter.emit("refreshApiKey", true);
      if (this.$route.name == "profile")
        this.emitter.emit("refreshProfile", true);
      if (this.$route.name == "platforms")
        this.emitter.emit("refreshPlatform", true);
      if (this.$route.name == "testlauncher")
        this.emitter.emit("refreshTestLauncher", true);
    },
    async changeCostumer(id) {
      if (this.navigation.hasUnsavedChanges) {
        const shouldDiscard = await this.navigation.confirmDiscard();
        if (!shouldDiscard) return;
        this.navigation.clearAll();
      }
      this.contextChangePending = true;
      apiClient
        .put(
          this.config.serviceBaseUrl + this.config.url.header + "/" + id,
          {},
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.projectSelected = null;
          this.session.selectCustomer(id);
          this.session.updateSessionId?.(response.data.session);
          this.refreshComponents();
          this.getProjects();
        })
        .catch((e) => {
          this.error = e;
        })
        .finally(() => {
          this.contextChangePending = false;
        });
    },
    getProjects() {
      apiClient
        .get(this.config.serviceBaseUrl + this.config.url.projects, {
          headers: this.setHeaders(),
        })
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.arrayProjects = response.data;
          this.session.setProjectAvailability(this.arrayProjects);
          this.session.setAvailableContexts({
            capabilities: this.session.capabilities,
            customers: this.arrayCostumers,
            projects: this.arrayProjects,
          });
          this.syncProjectSelectionFromRoute();
          if (this.projectSelected == null && this.arrayProjects.length > 0)
            this.projectSelected = this.arrayProjects[0].id;
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    getHeaders() {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(this.config.serviceBaseUrl + this.config.url.header, {
          headers: this.setHeaders(),
        })
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.arrayProjects = response.data.projects;
          this.session.setProjectAvailability(this.arrayProjects);
          this.syncProjectSelectionFromRoute();
          if (this.projectSelected == null && this.arrayProjects.length > 0)
            this.projectSelected = this.arrayProjects[0].id;
          if (response.data.costumers)
            this.arrayCostumers = response.data.costumers;
          this.session.setAvailableContexts({
            capabilities: response.data.capabilities || [],
            customers: this.arrayCostumers,
            projects: this.arrayProjects,
          });
          if (this.costumerSelected == null && this.arrayCostumers.length > 0)
            this.costumerSelected = this.arrayCostumers[0].id;
        })
        .catch((e) => {
          this.error = e;
        });
    },
    sideBar() {
      this.emitter.emit("sideBar", "toggled");
    },
    logout() {
      this.logoutModalVisible = true;
    },
    cancelLogout() {
      this.logoutModalVisible = false;
    },
    confirmLogout() {
      this.logoutModalVisible = false;
      this.actionLogout();
    },
    actionLogout() {
      apiClient
        .post(this.config.serviceBaseUrl + this.config.url.logout, null, {
          headers: this.setHeaders(),
        })
        .then(() => {
          this.Logout(this);
        })
        .catch(() => {
          this.Logout(this);
        });
    },
  },
};
</script>

<style scoped>
.idelium-tabler-header {
  align-items: center;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94)),
    radial-gradient(
      circle at 12% 0%,
      rgba(255, 122, 24, 0.08),
      transparent 18rem
    );
  backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--id-color-border);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
  display: flex;
  gap: 1.15rem;
  min-height: 76px;
  padding: 0 1rem 0 1.25rem;
  position: sticky;
  top: 0;
  z-index: 20;
}

:global(:root[data-theme="dark"]) .idelium-tabler-header {
  background:
    linear-gradient(180deg, rgba(15, 17, 26, 0.98), rgba(10, 12, 20, 0.96)),
    radial-gradient(
      circle at 12% 0%,
      rgba(255, 122, 24, 0.08),
      transparent 18rem
    );
  border-bottom-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
}

.idelium-header-left,
.idelium-header-actions,
.idelium-header-context,
.idelium-context-field {
  align-items: center;
  display: flex;
}

.idelium-header-left {
  flex: 0 0 auto;
  gap: 0.9rem;
  min-width: 0;
  position: relative;
}

.idelium-header-left::after {
  background: var(--id-color-border);
  content: "";
  height: 2.15rem;
  margin-left: 0.1rem;
  width: 1px;
}

:global(:root[data-theme="dark"]) .idelium-header-left::after {
  background: rgba(255, 255, 255, 0.08);
}

.idelium-header-logo {
  background: #0f111a;
  border-radius: 0.95rem;
  box-shadow: 0 0.75rem 1.8rem rgba(15, 23, 42, 0.12);
  display: block;
  flex: 0 0 auto;
  height: 2.35rem;
  object-fit: contain;
  width: 9.65rem;
}

:global(:root[data-theme="dark"]) .idelium-header-logo {
  background: transparent;
  box-shadow: none;
}

.idelium-header-context {
  flex: 1 1 auto;
  gap: 0.65rem;
  justify-content: flex-start;
  min-width: 0;
}

.idelium-header-actions {
  flex: 0 0 auto;
  gap: 0.6rem;
  margin-left: auto;
}

.idelium-icon-button {
  align-items: center;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.96),
    rgba(241, 245, 249, 0.9)
  );
  border: 1px solid var(--id-color-border);
  border-radius: 0.95rem;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.75),
    0 0.75rem 1.8rem rgba(15, 23, 42, 0.1);
  color: var(--id-color-text);
  cursor: pointer;
  display: inline-flex;
  height: 2.75rem;
  justify-content: center;
  min-width: 2.75rem;
  padding: 0;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;
}

:global(:root[data-theme="dark"]) .idelium-icon-button {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.075),
    rgba(255, 255, 255, 0.035)
  );
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 0.75rem 1.8rem rgba(0, 0, 0, 0.22);
  color: #f8fafc;
}

.idelium-icon-button:hover {
  background: #ffffff;
  border-color: var(--id-color-border-strong);
  transform: translateY(-1px);
}

:global(:root[data-theme="dark"]) .idelium-icon-button:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.18);
}

.idelium-icon-button.dropdown-toggle::after {
  border-top-color: var(--id-color-text-muted);
  margin-left: 0.35rem;
  transform: translateY(1px);
}

:global(:root[data-theme="dark"]) .idelium-icon-button.dropdown-toggle::after {
  border-top-color: rgba(255, 255, 255, 0.72);
}

.idelium-language-button {
  gap: 0.35rem;
  padding: 0 0.55rem;
  width: auto;
}

.idelium-flag-frame {
  align-items: center;
  border-radius: 0.35rem;
  display: inline-flex;
  height: 1.45rem;
  justify-content: center;
  overflow: hidden;
  width: 1.95rem;
}

.idelium-context-field {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.96),
    rgba(241, 245, 249, 0.9)
  );
  border: 1px solid var(--id-color-border);
  border-radius: 999px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.76),
    0 0.9rem 2rem rgba(15, 23, 42, 0.09);
  gap: 0.6rem;
  height: 2.75rem;
  min-width: 0;
  padding: 0.22rem 0.28rem 0.22rem 0.9rem;
}

:global(:root[data-theme="dark"]) .idelium-context-field {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.07),
    rgba(255, 255, 255, 0.035)
  );
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 0.9rem 2rem rgba(0, 0, 0, 0.18);
}

.idelium-context-field span,
.idelium-context-action {
  color: var(--id-color-text-muted);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.14rem;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
}

:global(:root[data-theme="dark"]) .idelium-context-field span,
:global(:root[data-theme="dark"]) .idelium-context-action {
  color: rgba(244, 244, 245, 0.7);
}

.idelium-context-field select {
  appearance: none;
  background:
    url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23475569' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")
      right 0.75rem center / 0.72rem 0.72rem no-repeat,
    rgba(255, 255, 255, 0.88);
  border: 1px solid var(--id-color-border);
  border-radius: 999px;
  color: var(--id-color-text);
  font-size: 0.82rem;
  font-weight: 700;
  height: 2.15rem;
  line-height: 1;
  min-width: 8.8rem;
  padding: 0 2rem 0 0.9rem;
}

:global(:root[data-theme="dark"]) .idelium-context-field select {
  background:
    url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23f8fafc' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")
      right 0.75rem center / 0.72rem 0.72rem no-repeat,
    rgba(255, 255, 255, 0.085);
  border-color: rgba(255, 255, 255, 0.11);
  color: #ffffff;
}

.idelium-context-field option {
  background: #ffffff;
  color: var(--id-color-text);
}

:global(:root[data-theme="dark"]) .idelium-context-field option {
  background: #171923;
  color: #ffffff;
}

.idelium-context-action {
  background: rgba(5, 150, 105, 0.1);
  border: 1px solid rgba(5, 150, 105, 0.24);
  border-radius: 999px;
  color: #047857;
  cursor: pointer;
  padding: 0.55rem 0.85rem;
}

:global(:root[data-theme="dark"]) .idelium-context-action {
  background: rgba(32, 201, 151, 0.14);
  border-color: rgba(32, 201, 151, 0.32);
  color: #b7f7df;
}

.language-flag {
  display: block;
  line-height: 0;
  margin: 0;
  transform: translateY(-0.18rem) scale(0.72);
  transform-origin: center;
}

.language-flag-menu {
  margin-right: -0.35rem;
  margin-top: -0.7rem;
}

@media only screen and (max-width: 1180px) {
  .idelium-tabler-header {
    align-items: flex-start;
    flex-wrap: wrap;
    padding-bottom: 0.85rem;
    padding-top: 0.85rem;
  }

  .idelium-header-context {
    flex-basis: 100%;
    order: 3;
  }

  .idelium-header-left::after {
    display: none;
  }
}
</style>
