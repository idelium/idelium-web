<template>
  <div>
    <div style="max-width: 40rem" class="card mb-1 center">
      <div class="card-header">
        <h4 class="titleLogin">
          {{ language[config.currentLanguage].Apikey.title }}
        </h4>
      </div>
      <div class="card-text">
        <div class="apiKeyCard">
          <p class="infoLogin">
            {{ language[config.currentLanguage].Apikey.info }}
          </p>
          <div
            v-if="showError == true"
            class="alert alert-danger btn btn-danger"
            style="text-transform: uppercase; text-align: center"
          >
            {{ error }}
          </div>
          <span class="apiKey"> {{ apikey }} </span><br />
          <span
            class="text-success"
            variant="link"
            size="sm"
            v-on:click="copyClipboard(apikey)"
            style="min-width: 100%; text-transform: unset !important; cursor: pointer"
          >
            <font-awesome-icon icon="copy" style="margin-left: 5px" />
          </span>
          <span
            class="text-primary"
            v-on:click="downloadKey()"
            style="cursor: pointer; margin-left: 10px"
            ><font-awesome-icon icon="download" style="font-size: 1rem"
          /></span>
          <button
            type="button"
            class="btn btn-primary btnKey"
            v-on:click="generateKey()"
            size="sm"
            style="min-width: 100%; margin-top: 20px"
          >
            {{ language[config.currentLanguage].Apikey.btnGenerateKey }}
          </button>
          <button
            type="button"
            class="btn btn-success btnKey"
            v-on:click="goGithub()"
            size="sm"
            style="min-width: 100%; margin-top: 20px"
          >
            {{ language[config.currentLanguage].Apikey.btnDownloadKey }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.center {
  margin: auto;
  padding: 10px;
  top: 10vh;
  max-width: 30rem !important;
}
.apiKey {
  display: inline-block;
  width: 350px;
  overflow-wrap: break-word;
}
.apiKeyCard {
  text-align: center;
}

.btnKey {
  align-content: right;
}
.infoLogin {
  text-align: center;
  font-size: 13px;
}
.titleLogin {
  text-align: center;
  font-size: 23px;
}
</style>
<script>
import axios from 'axios'

import copy from 'copy-to-clipboard'
import download from '@/shared/download'

export default {
  name: 'ApikeyComponent',
  data() {
    return {
      status: 'not_accepted',
      error: null,
      showError: false,
      apikey: null
    }
  },
  watch: {
    $route() {
      this.getApiKey()
      this.$forceUpdate()
    }
  },
  created() {
    this.emitter.on('refreshApiKey', (msg) => {
      if (msg == true) this.getApiKey()
      else this.$forceUpdate()
    })
    console.log('header')
    this.getApiKey()
  },
  methods: {
    makeToast(text) {
      this.$wkToast(text)
    },
    copyClipboard(text) {
      copy(text)
      this.makeToast(this.language[this.config.currentLanguage].Apikey.keyCopy)
    },
    getApiKey() {
      this.emitter.emit('showLoader', true)
      axios
        .get(this.config.serviceBaseUrl + this.config.url.apikey, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.emitter.emit('showLoader', false)
          console.log(response.data)
          this.apikey = response.data.apiKey
        })
        .catch((e) => {
          this.emitter.emit('showLoader', false)
          this.Logout(this, e)
          this.error = e
        })
    },
    generateKey() {
      this.$confirm(
        this.language[this.config.currentLanguage].Apikey.confirmGenerateMessage,
        '',
        'warning'
      ).then(() => this.generateAction())
    },
    generateAction() {
      axios
        .put(
          this.config.serviceBaseUrl + this.config.url.apikey,
          {},
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          console.log(response.data)
          this.apikey = response.data.apiKey
        })
        .catch((e) => {
          this.emitter.emit('showLoader', false)
          this.Logout(this, e)
          this.error = e
        })
    },
    goGithub() {
      window.open('https://github.com/idelium/idelium-cli', '_blank')
    },
    downloadKey() {
      download.file('idelium', this.apikey, 'plain/text')
    }
  }
}
</script>
