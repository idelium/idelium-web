<template>
  <div class="titleLogo info costum header">
    <span class="burger" v-on:click="sideBar()"
      ><font-awesome-icon icon="bars" style="font-size: 24px"
    /></span>
    <img
      src="@/assets/idelium.png"
      style="width: 10rem; margin-top: 15px; margin-left: 10px; margin-right: -2px"
    />
    <div class="dropdown" style="float: right; margin-top: 14px">
      <button
        class="btn btn-link dropdown-toggle"
        type="button"
        id="dropdownMenuButton2"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <font-awesome-icon
          icon="user-circle"
          style="margin-left: 0px; font-size: 24px !important"
        />
      </button>
      <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton2">
        <li>
          <a class="dropdown-item active" v-on:click="$router.push({ path: '/profile' })">{{
            language[config.currentLanguage].Header.profile
          }}</a>
        </li>
        <li><hr class="dropdown-divider" /></li>
        <li>
          <a class="dropdown-item" v-on:click="logout()">{{
            language[config.currentLanguage].Header.logOut
          }}</a>
        </li>
      </ul>
    </div>
    <div class="dropdown" style="float: right; margin-top: 18px">
      <button
        class="btn btn-link dropdown-toggle"
        type="button"
        id="dropdownMenuButton2"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <country-flag
          :country="config.currentLanguage"
          style="float: left; margin-top: -12px; margin-right: 0px"
        />
      </button>
      <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton2">
        <li v-for="(lang, index) in Object.keys(language)" :key="index">
          <a class="dropdown-item" href="#" v-on:click="changeLang(lang)">
            <country-flag
              :country="lang"
              size="small"
              style="float: left; margin-top: -12px; margin-right: -10px"
            />
            <span style="float: left"></span
            >{{ language[config.currentLanguage].Header.languages[lang] }}</a
          >
        </li>
      </ul>
    </div>

    <div class="project" v-if="arrayProjects.length != 0">
      {{ language[config.currentLanguage].Header.project }}:
      <select v-model="projectSelected" style="font-size: 14px !important">
        <option v-for="(project, index) in arrayProjects" v-bind:key="index" :value="project.id">
          {{ project.name }}
        </option>
      </select>
    </div>
    <div class="project" v-if="arrayCostumers.length != 0">
      {{ language[config.currentLanguage].Header.costumer }}:
      <select v-model="costumerSelected" style="font-size: 14px !important">
        <option v-for="(costumer, index) in arrayCostumers" v-bind:key="index" :value="costumer.id">
          {{ costumer.costumer }}
        </option>
      </select>
      <button
        type="button"
        v-on:click="changeCostumer(costumerSelected)"
        class="btn btn-success btn-sm"
        style="margin-right: 10px; margin-left: 10px"
      >
        {{ language[config.currentLanguage].Header.btnChangeCostumer }}
      </button>
    </div>
    <br />
    <hr style="margin-top: 25px" />
  </div>
</template>
<style scoped>
.header {
  background-color: rgb(14, 14, 14);
}

.sub-menu {
  position: absolute;
  min-width: 10rem;
  left: -6rem;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  font-size: 1rem;
  color: rgba(244, 244, 245, 0.6);
  text-align: left;
  list-style: none;
  background-color: rgb(3, 11, 54);
  background-clip: padding-box;
  border: 1px solid white;
  border-radius: 0.25rem;
}
.burger {
  margin-top: 19px;
  margin-left: 5px;
  float: left;
  cursor: pointer;
}
.titleLogo {
  border-bottom: 5px red;
}
@media only screen and (max-width: 600px) {
  .info {
    visibility: collapse;
  }
}
.logout {
  margin-top: 18px;
  margin-left: 5px;
  margin-right: 5px;
  margin-bottom: 5px;
  float: right;
}

.project {
  margin-top: 22px;
  margin-left: 5px;
  margin-right: 5px;
  float: right;
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
}
</style>

<script>
import axios from 'axios'
import CountryFlag from 'vue-country-flag-next'

export default {
  components: {
    CountryFlag
  },
  data() {
    return {
      arrayProjects: [],
      arrayCostumers: [],
      projectSelected: null,
      costumerSelected: null,
      showSubMenu: false
    }
  },
  created() {
    console.log('header')
    this.getHeaders()
    this.emitter.on('updateListProject', (msg) => {
      this.arrayProjects = msg
      if (this.projectSelected == null && this.arrayProjects.length > 0)
        this.projectSelected = this.arrayProjects[0].id
    })
  },
  watch: {
    projectSelected() {
      console.log('changeProjectSelected: ' + this.projectSelected)
      localStorage.projectIdSelected = this.projectSelected
      this.refreshComponents(true)
    },
    costumerSelected() {
      //this.changeCostumer(this.costumerSelected)
    }
  },
  methods: {
    changeLang(lang) {
      console.log('Before language: ' + this.config.currentLanguage)
      console.log('Current language: ' + lang)
      this.config.currentLanguage = lang
      localStorage.langSelected = lang
      this.emitter.emit('refreshSideBar')
      if (this.$route.name == 'plugins') this.emitter.emit('refreshPlugin', false)
      if (this.$route.name == 'steps') this.emitter.emit('refreshStep', false)
      if (this.$route.name == 'environments') this.emitter.emit('refreshEnvironment', false)
      if (this.$route.name == 'tests') this.emitter.emit('refreshTest', false)
      if (this.$route.name == 'testcycles') this.emitter.emit('refreshTestCycle', false)
      if (this.$route.name == 'testsperformed')
        this.emitter.emit('refreshTestCyclePerformed', false)
      if (this.$route.name == 'projects') this.emitter.emit('refreshProject', false)
      if (this.$route.name == 'apikey') this.emitter.emit('refreshApiKey', false)
      if (this.$route.name == 'costumers') this.emitter.emit('refreshCostumer', false)
      if (this.$route.name == 'accounts') this.emitter.emit('refreshAccount', false)
      if (this.$route.name == 'profile') this.emitter.emit('refreshProfile', false)
      if (this.$route.name == 'platforms') this.emitter.emit('refreshPlatform', false)
      if (this.$route.name == 'testlauncher') this.emitter.emit('refreshTestLauncher', false)

      this.$forceUpdate()
      this.refreshComponents()
    },
    refreshComponents(isProjectChange = false) {
      console.log('refresh --->' + this.$route.name)
      if (this.$route.name == 'plugins') this.emitter.emit('refreshPlugin', true)
      if (this.$route.name == 'steps') this.emitter.emit('refreshStep', true)
      if (this.$route.name == 'environments') this.emitter.emit('refreshEnvironment', true)
      if (this.$route.name == 'tests') this.emitter.emit('refreshTest', true)
      if (this.$route.name == 'testcycles') this.emitter.emit('refreshTestCycle', true)
      if (this.$route.name == 'testsperformed') this.emitter.emit('refreshTestCyclePerformed', true)
      if (isProjectChange == false || this.$route.name == 'projects')
        this.emitter.emit('refreshProject', true)
      if (this.$route.name == 'apikey') this.emitter.emit('refreshApiKey', true)
      if (this.$route.name == 'profile') this.emitter.emit('refreshProfile', true)
      if (this.$route.name == 'platforms') this.emitter.emit('refreshPlatform', true)
      if (this.$route.name == 'testlauncher') this.emitter.emit('refreshTestLauncher', true)
    },
    changeCostumer(id) {
      axios
        .put(
          this.config.serviceBaseUrl + this.config.url.header + '/' + id,
          {},
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          console.log('change')
          this.emitter.emit('showLoader', false)
          this.projectSelected = null
          localStorage.session = response.data.session
          console.log('changeCostuemerSelected: ' + id)
          this.refreshComponents()
          this.getProjects()
        })
        .catch((e) => {
          //this.Logut(this)
          this.error = e
        })
    },
    getProjects() {
      console.log('----------------------------')
      axios
        .get(this.config.serviceBaseUrl + this.config.url.projects, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayProjects = response.data
          localStorage.isFirstProject = this.arrayProjects.length == 0 ? 'true' : 'false'
          if (this.projectSelected == null && this.arrayProjects.length > 0)
            this.projectSelected = this.arrayProjects[0].id
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },

    getHeaders() {
      this.emitter.emit('showLoader', true)
      axios
        .get(this.config.serviceBaseUrl + this.config.url.header, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayProjects = response.data.projects
          localStorage.isFirstProject = this.arrayProjects.length == 0 ? 'true' : 'false'
          if (this.projectSelected == null && this.arrayProjects.length > 0)
            this.projectSelected = this.arrayProjects[0].id
          if (response.data.costumers) this.arrayCostumers = response.data.costumers
          if (this.costumerSelected == null && this.arrayCostumers.length > 0)
            this.costumerSelected = this.arrayCostumers[0].id
        })
        .catch((e) => {
          //this.Logut(this)
          this.error = e
        })
    },
    sideBar() {
      this.emitter.emit('sideBar', 'toggled')
      this.emitter.emit('showIcon', null)
    },
    logout() {
      this.$confirm(
        this.language[this.config.currentLanguage].Header.confirmLogout,
        '',
        'warning'
      ).then(() => this.actionLogout())
    },
    actionLogout() {
      axios
        .get(this.config.serviceBaseUrl + this.config.url.logout, {
          headers: this.setHeaders()
        })
        .then((response) => {
          console.log(response)
          this.Logout(this)
        })
        .catch((e) => {
          console.log(e)
          this.Logout(this)
        })
    }
  }
}
</script>

<style scoped>
.titoloLogo {
  font-family: ConcertOne;
  font-size: 3rem;
  color: brown;
}
</style>
