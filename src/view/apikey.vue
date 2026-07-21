<template>
  <div class="apikey-page">
    <section class="apikey-hero">
      <div class="apikey-hero-icon" aria-hidden="true">
        <font-awesome-icon icon="key" />
      </div>
      <div>
        <p class="apikey-eyebrow">
          {{ language[config.currentLanguage].Apikey.cliEyebrow }}
        </p>
        <h1 class="apikey-title">
          {{ language[config.currentLanguage].Apikey.title }}
        </h1>
        <p class="apikey-subtitle">
          {{ language[config.currentLanguage].Apikey.info }}
        </p>
      </div>
    </section>

    <section class="apikey-grid">
      <article class="apikey-card apikey-card-main">
        <div class="apikey-card-header">
          <div>
            <p class="apikey-eyebrow">
              {{ language[config.currentLanguage].Apikey.credentialEyebrow }}
            </p>
            <h2 class="apikey-card-title">
              {{ language[config.currentLanguage].Apikey.title }}
            </h2>
          </div>
          <span class="apikey-status">
            {{ language[config.currentLanguage].Apikey.statusActive }}
          </span>
        </div>

        <div
          v-if="showError == true"
          class="alert alert-danger apikey-alert"
        >
          {{ error }}
        </div>

        <div class="apikey-value-panel">
          <code class="apikey-value">{{ apikey }}</code>
        </div>

        <div class="apikey-actions">
          <button
            type="button"
            class="btn btn-outline-success apikey-secondary-action"
            v-on:click="copyClipboard(apikey)"
            :disabled="!apikey"
            :title="language[config.currentLanguage].Actions.copy"
          >
            <font-awesome-icon icon="copy" class="idelium-action-icon--copy" />
            {{ language[config.currentLanguage].Apikey.btnCopyKey }}
          </button>
          <button
            type="button"
            class="btn btn-outline-primary apikey-secondary-action"
            v-on:click="downloadKey()"
            :disabled="!apikey"
            :title="language[config.currentLanguage].Actions.download"
          >
            <font-awesome-icon icon="download" class="idelium-action-icon--download" />
            {{ language[config.currentLanguage].Apikey.btnDownloadConfig }}
          </button>
          <button
            type="button"
            class="btn btn-primary apikey-primary-action"
            v-on:click="generateKey()"
            size="sm"
          >
            {{ language[config.currentLanguage].Apikey.btnGenerateKey }}
          </button>
        </div>
      </article>

      <aside class="apikey-card apikey-cli-card">
        <p class="apikey-eyebrow">
          {{ language[config.currentLanguage].Apikey.packageEyebrow }}
        </p>
        <h2 class="apikey-card-title">
          {{ language[config.currentLanguage].Apikey.cliTitle }}
        </h2>
        <p class="apikey-cli-copy">
          {{ language[config.currentLanguage].Apikey.cliInfo }}
        </p>
        <div class="apikey-command">pip install idelium</div>
        <div class="apikey-command">idelium --help</div>
        <div class="apikey-cli-actions">
          <button
            type="button"
            class="btn btn-success apikey-pypi-button"
            v-on:click="goGithub()"
            size="sm"
          >
            {{ language[config.currentLanguage].Apikey.btnDownloadKey }}
          </button>
        </div>
      </aside>
    </section>
  </div>
</template>
<style scoped>
.apikey-page {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  margin: 0 auto;
  max-width: 1180px;
  width: 100%;
}

.apikey-hero {
  align-items: center;
  background:
    radial-gradient(circle at 0% 0%, rgba(255, 122, 24, 0.2), transparent 18rem),
    linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.025));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.1rem;
  box-shadow: 0 1.25rem 3.4rem rgba(0, 0, 0, 0.24);
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
}

.apikey-hero-icon {
  align-items: center;
  background: linear-gradient(135deg, #ff8a00, #ff5a2e);
  border-radius: 1.2rem;
  box-shadow: 0 1rem 2.6rem rgba(255, 122, 24, 0.22);
  color: #111318;
  display: inline-flex;
  flex: 0 0 4.75rem;
  font-size: 2.25rem;
  height: 4.75rem;
  justify-content: center;
  width: 4.75rem;
}

.apikey-eyebrow {
  color: rgba(244, 244, 245, 0.58);
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 0.16rem;
  margin: 0 0 0.35rem;
  text-transform: uppercase;
}

.apikey-title {
  color: #ffffff;
  font-size: clamp(1.6rem, 2vw, 2.15rem);
  font-weight: 850;
  letter-spacing: 0.03rem;
  margin: 0;
}

.apikey-subtitle,
.apikey-cli-copy {
  color: rgba(244, 244, 245, 0.68);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0.35rem 0 0;
}

.apikey-grid {
  display: grid;
  gap: 1.4rem;
  grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.42fr);
}

.apikey-card {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent),
    rgba(35, 38, 50, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.1rem;
  box-shadow: 0 1.25rem 3.4rem rgba(0, 0, 0, 0.2);
  min-width: 0;
  padding: 1.25rem;
}

.apikey-card-header {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.apikey-card-title {
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 850;
  margin: 0;
}

.apikey-status {
  background: rgba(32, 201, 151, 0.14);
  border: 1px solid rgba(32, 201, 151, 0.3);
  border-radius: 999px;
  color: #79f2c9;
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 0.1rem;
  padding: 0.36rem 0.7rem;
  text-transform: uppercase;
}

.apikey-alert {
  font-weight: 800;
  text-transform: uppercase;
}

.apikey-value-panel {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent),
    rgba(12, 14, 22, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  min-height: 12rem;
  padding: 1.15rem;
}

.apikey-value {
  background: transparent;
  color: #f8fafc;
  display: block;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    monospace;
  font-size: 0.92rem;
  line-height: 1.7;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.apikey-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 1rem;
}

.apikey-secondary-action,
.apikey-primary-action {
  align-items: center;
  display: inline-flex;
  gap: 0.45rem;
  justify-content: center;
  min-height: 2.65rem;
}

.apikey-primary-action {
  margin-left: auto;
  min-width: 13rem;
}

.apikey-cli-card {
  display: flex;
  flex-direction: column;
}

.apikey-command {
  background: rgba(12, 14, 22, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.8rem;
  color: #f8fafc;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    monospace;
  font-size: 0.82rem;
  margin-top: 0.85rem;
  padding: 0.8rem 0.9rem;
}

.apikey-cli-actions {
  margin-top: auto;
  padding-top: 1rem;
}

.apikey-pypi-button {
  min-height: 2.65rem;
  width: 100%;
}

@media only screen and (max-width: 960px) {
  .apikey-grid {
    grid-template-columns: 1fr;
  }
}

@media only screen and (max-width: 600px) {
  .apikey-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .apikey-primary-action {
    margin-left: 0;
    width: 100%;
  }

  .apikey-secondary-action {
    flex: 1 1 100%;
  }
}
</style>
<script>
import apiClient from '@/services/apiClient'

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
      apiClient
        .get(this.config.serviceBaseUrl + this.config.url.apikey, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.apikey = response.data.apiKey
        })
        .catch((e) => {
          this.emitter.emit('showLoader', false)
          this.Logout(this, e)
          this.error = e
        })
    },
    generateKey() {
      return this.$showConfirm({
        message: this.language[this.config.currentLanguage].Apikey.confirmGenerateMessage,
        variant: 'warning'
      }).then((confirmed) => {
        if (confirmed) this.generateAction()
      })
    },
    generateAction() {
      apiClient
        .put(
          this.config.serviceBaseUrl + this.config.url.apikey,
          {},
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.apikey = response.data.apiKey
        })
        .catch((e) => {
          this.emitter.emit('showLoader', false)
          this.Logout(this, e)
          this.error = e
        })
    },
    goGithub() {
      window.open('https://pypi.org/project/idelium/', '_blank')
    },
    downloadKey() {
      download.file('idelium', this.apikey, 'plain/text')
    }
  }
}
</script>
