<template>
  <div>
    <div class="row">
      <div class="col-sm-1" />
      <div class="col">
        <div style="float: right">
          {{ language[config.currentLanguage].TestLauncher.environment }}
          <select v-model="environment">
            <option v-for="(env, index) in listEnvironments" v-bind:key="index">
              {{ env.code }}
            </option>
          </select>
        </div>
      </div>
      <div class="col-sm-1" />
    </div>
    <div class="row">
      <div class="col-sm-1" />
      <div class="col">
        <table class="table table-striped costum">
          <thead>
            <tr>
              <th scope="col">{{ language[config.currentLanguage].TestLauncher.id }}</th>
              <th scope="col">{{ language[config.currentLanguage].TestLauncher.testcycle }}</th>
              <th scope="col">{{ language[config.currentLanguage].TestLauncher.description }}</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(test, index) in arrayTestCycles" v-bind:key="index">
              <td>
                {{ test.id }}
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-link btn-sm"
                  v-on:click="showModal(index, 'modify')"
                >
                  {{ test.name }}
                </button>
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-link btn-sm"
                  v-on:click="showModal(index, 'modify')"
                >
                  {{ test.description }}
                </button>
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-success btn-sm"
                  v-on:click="launchTest(test.id)"
                  :title="language[config.currentLanguage].Actions.launch"
                >
                  <font-awesome-icon
                    icon="rocket"
                    class="idelium-action-icon idelium-action-icon--launch"
                  />{{
                    language[config.currentLanguage].TestLauncher.launchtest
                  }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-sm-1" />
    </div>
    <platformLauncher ref="platformLauncher" />
  </div>
</template>
<script>
import apiClient from '@/services/apiClient'
import { getSelectedProjectId } from '@/stores/session'

import platformLauncher from './platformlauncher/modalListPlatform.vue'

export default {
  name: 'TestLauncherComponent',
  components: {
    platformLauncher
  },
  data() {
    return {
      arrayTestCycles: [],
      listEnvironments: [],
      environment: null
    }
  },
  created() {
    this.getTestCycles()
    this.emitter.on('refreshTestLauncher', () => {
      this.getTestCycles()
    })
  },
  methods: {
    getTestCycles() {
      this.emitter.emit('showLoader', true)
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.testcycles +
            '/' +
            getSelectedProjectId(),
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.arrayTestCycles = response.data
          this.getEnvironments()
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    getEnvironments() {
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.environments +
            '/' +
            getSelectedProjectId(),
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.listEnvironments = response.data
          if (this.listEnvironments.length > 0) this.environment = this.listEnvironments[0].code
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    launchTest(id) {
      this.$refs.platformLauncher.showModal(id, this.environment)
    }
  }
}
</script>
