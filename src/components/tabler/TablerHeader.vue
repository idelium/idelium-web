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
        <font-awesome-icon icon="bars" class="idelium-action-icon--navigation" />
      </button>
      <img
        src="@/assets/idelium.png"
        class="idelium-header-logo"
        alt="Idelium"
      />
    </div>

    <div class="idelium-header-context">
      <label class="idelium-context-field" v-if="arrayProjects.length != 0">
        <span>{{ language[config.currentLanguage].Header.project }}</span>
        <select v-model="projectSelected">
          <option
            v-for="(project, index) in arrayProjects"
            v-bind:key="index"
            :value="project.id"
          >
            {{ project.name }}
          </option>
        </select>
      </label>

      <label class="idelium-context-field" v-if="arrayCostumers.length != 0">
        <span>{{ language[config.currentLanguage].Header.costumer }}</span>
        <select v-model="costumerSelected">
          <option
            v-for="(costumer, index) in arrayCostumers"
            v-bind:key="index"
            :value="costumer.id"
          >
            {{ costumer.costumer }}
          </option>
        </select>
      </label>

      <button
        v-if="arrayCostumers.length != 0"
        type="button"
        v-on:click="changeCostumer(costumerSelected)"
        class="idelium-context-action"
      >
        {{ language[config.currentLanguage].Header.btnChangeCostumer }}
      </button>
    </div>

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
          <font-awesome-icon icon="user-circle" class="idelium-action-icon--user" />
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
import CountryFlag from "vue-country-flag-next";
import LogoutConfirmModal from "@/components/shared/LogoutConfirmModal.vue";

export default {
  name: "TablerHeader",
  components: {
    CountryFlag,
    LogoutConfirmModal,
  },
  setup() {
    return { session: useSessionStore() };
  },
  data() {
    return {
      arrayProjects: [],
      arrayCostumers: [],
      projectSelected: null,
      costumerSelected: null,
      logoutModalVisible: false,
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
    projectSelected() {
      this.session.selectProject(this.projectSelected);
      this.refreshComponents(true);
    },
  },
  methods: {
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
    changeCostumer(id) {
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
          if (this.projectSelected == null && this.arrayProjects.length > 0)
            this.projectSelected = this.arrayProjects[0].id;
          if (response.data.costumers)
            this.arrayCostumers = response.data.costumers;
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
    linear-gradient(180deg, rgba(15, 17, 26, 0.98), rgba(10, 12, 20, 0.96)),
    radial-gradient(circle at 12% 0%, rgba(255, 122, 24, 0.08), transparent 18rem);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
  display: flex;
  gap: 1.15rem;
  min-height: 76px;
  padding: 0 1rem 0 1.25rem;
  position: sticky;
  top: 0;
  z-index: 20;
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
  background: rgba(255, 255, 255, 0.08);
  content: "";
  height: 2.15rem;
  margin-left: 0.1rem;
  width: 1px;
}

.idelium-header-logo {
  display: block;
  flex: 0 0 auto;
  height: 2.35rem;
  object-fit: contain;
  width: 9.65rem;
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
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035));
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.95rem;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 0.75rem 1.8rem rgba(0, 0, 0, 0.22);
  color: #f8fafc;
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

.idelium-icon-button:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}

.idelium-icon-button.dropdown-toggle::after {
  border-top-color: rgba(255, 255, 255, 0.72);
  margin-left: 0.35rem;
  transform: translateY(1px);
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
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.035));
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 0.9rem 2rem rgba(0, 0, 0, 0.18);
  gap: 0.6rem;
  height: 2.75rem;
  min-width: 0;
  padding: 0.22rem 0.28rem 0.22rem 0.9rem;
}

.idelium-context-field span,
.idelium-context-action {
  color: rgba(244, 244, 245, 0.7);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.14rem;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
}

.idelium-context-field select {
  appearance: none;
  background:
    url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23f8fafc' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")
      right 0.75rem center / 0.72rem 0.72rem no-repeat,
    rgba(255, 255, 255, 0.085);
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 999px;
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 700;
  height: 2.15rem;
  line-height: 1;
  min-width: 8.8rem;
  padding: 0 2rem 0 0.9rem;
}

.idelium-context-field option {
  background: #171923;
  color: #ffffff;
}

.idelium-context-action {
  background: rgba(32, 201, 151, 0.14);
  border: 1px solid rgba(32, 201, 151, 0.32);
  border-radius: 999px;
  color: #b7f7df;
  cursor: pointer;
  padding: 0.55rem 0.85rem;
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
