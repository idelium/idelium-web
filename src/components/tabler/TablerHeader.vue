<template>
  <header class="idelium-tabler-header">
    <div class="idelium-header-left">
      <button
        type="button"
        class="idelium-icon-button"
        aria-label="Toggle sidebar"
        v-on:click="sideBar()"
      >
        <font-awesome-icon icon="bars" />
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
          class="idelium-icon-button dropdown-toggle"
          type="button"
          id="tablerLanguageMenuButton"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <country-flag
            :country="config.currentLanguage"
            class="language-flag"
          />
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
        >
          <font-awesome-icon icon="user-circle" />
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
</template>

<script>
import apiClient from "@/services/apiClient";
import { useSessionStore } from "@/stores/session";
import CountryFlag from "vue-country-flag-next";

export default {
  name: "TablerHeader",
  components: {
    CountryFlag,
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
      this.$confirm(
        this.language[this.config.currentLanguage].Header.confirmLogout,
        "",
        "warning",
      ).then(() => this.actionLogout());
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
  background: rgba(12, 14, 22, 0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.22);
  display: flex;
  gap: 1rem;
  min-height: 76px;
  padding: 0 1.25rem;
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
  gap: 0.85rem;
}

.idelium-header-logo {
  width: 9.75rem;
}

.idelium-header-context {
  flex: 1 1 auto;
  gap: 0.65rem;
  min-width: 0;
}

.idelium-header-actions {
  flex: 0 0 auto;
  gap: 0.55rem;
}

.idelium-icon-button {
  align-items: center;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.85rem;
  color: #f8fafc;
  cursor: pointer;
  display: inline-flex;
  height: 2.55rem;
  justify-content: center;
  min-width: 2.55rem;
  padding: 0 0.75rem;
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

.idelium-context-field {
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 999px;
  gap: 0.55rem;
  min-width: 0;
  padding: 0.38rem 0.48rem 0.38rem 0.85rem;
}

.idelium-context-field span,
.idelium-context-action {
  color: rgba(244, 244, 245, 0.7);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.14rem;
  text-transform: uppercase;
  white-space: nowrap;
}

.idelium-context-field select {
  appearance: none;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  color: #ffffff;
  font-size: 0.78rem;
  min-width: 9rem;
  padding: 0.38rem 0.85rem;
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
  margin-top: -0.7rem;
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
}
</style>
