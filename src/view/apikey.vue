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

        <div v-if="showError == true" class="alert alert-danger apikey-alert">
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
            <font-awesome-icon
              icon="download"
              class="idelium-action-icon--download"
            />
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

    <section class="apikey-card apikey-inventory-card">
      <div class="apikey-card-header">
        <div>
          <p class="apikey-eyebrow">
            {{
              language[config.currentLanguage].Apikey.credentialLifecycleTitle
            }}
          </p>
          <h2 class="apikey-card-title">
            {{ language[config.currentLanguage].Apikey.inventoryTitle }}
          </h2>
          <p class="apikey-cli-copy">
            {{
              language[config.currentLanguage].Apikey
                .credentialLifecycleDescription
            }}
          </p>
        </div>
      </div>
      <EnterpriseDataTable
        :accessible-label="
          language[config.currentLanguage].Apikey.inventoryTitle
        "
        :actions="credentialActions"
        :capabilities="credentialCapabilities"
        :columns="credentialColumns"
        :copy="credentialTableCopy"
        :has-active-filters="hasCredentialFilters"
        :local-limit="100"
        :rows="credentialRows"
        v-on:action="handleCredentialAction"
        v-on:clear-filters="clearCredentialFilters"
        v-on:confirm-action="confirmCredentialAction"
      >
        <template #toolbar>
          <div class="apikey-inventory-toolbar">
            <label>
              <span>{{
                language[config.currentLanguage].Apikey.filterStatus
              }}</span>
              <select
                v-model="credentialFilters.status"
                class="form-control apikey-filter"
              >
                <option value="">
                  {{ language[config.currentLanguage].Apikey.filterAll }}
                </option>
                <option
                  v-for="statusOption in credentialStatusOptions"
                  v-bind:key="statusOption"
                  :value="statusOption"
                >
                  {{ credentialStatusLabel(statusOption) }}
                </option>
              </select>
            </label>
            <label>
              <span>{{
                language[config.currentLanguage].Apikey.filterScope
              }}</span>
              <input
                v-model="credentialFilters.scope"
                class="form-control apikey-filter"
                :placeholder="
                  language[config.currentLanguage].Apikey.filterScope
                "
              />
            </label>
            <label>
              <span>{{
                language[config.currentLanguage].Apikey.filterOwner
              }}</span>
              <input
                v-model="credentialFilters.owner"
                class="form-control apikey-filter"
                :placeholder="
                  language[config.currentLanguage].Apikey.filterOwner
                "
              />
            </label>
            <label>
              <span>{{
                language[config.currentLanguage].Apikey.filterExpiry
              }}</span>
              <select
                v-model="credentialFilters.expiry"
                class="form-control apikey-filter"
              >
                <option value="">
                  {{ language[config.currentLanguage].Apikey.filterAll }}
                </option>
                <option value="expired">
                  {{ language[config.currentLanguage].Apikey.expired }}
                </option>
                <option value="none">
                  {{ language[config.currentLanguage].Apikey.noExpiry }}
                </option>
              </select>
            </label>
          </div>
        </template>
      </EnterpriseDataTable>
      <p class="apikey-security-note">
        {{ language[config.currentLanguage].Apikey.revealOnceNotice }}
      </p>
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
    radial-gradient(
      circle at 0% 0%,
      rgba(255, 122, 24, 0.2),
      transparent 18rem
    ),
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0.025)
    );
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

.apikey-inventory-card {
  display: grid;
  gap: 1rem;
}

.apikey-inventory-toolbar {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: 100%;
}

.apikey-inventory-toolbar label {
  color: rgba(244, 244, 245, 0.7);
  display: grid;
  font-size: 0.68rem;
  font-weight: 850;
  gap: 0.35rem;
  letter-spacing: 0.12rem;
  text-transform: uppercase;
}

.apikey-filter {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #ffffff;
  min-height: 2.5rem;
}

.apikey-security-note {
  background: rgba(32, 201, 151, 0.1);
  border: 1px solid rgba(32, 201, 151, 0.26);
  border-radius: 0.9rem;
  color: #a8f7da;
  font-weight: 700;
  margin: 0;
  padding: 0.85rem;
}

@media only screen and (max-width: 960px) {
  .apikey-grid {
    grid-template-columns: 1fr;
  }

  .apikey-inventory-toolbar {
    grid-template-columns: 1fr 1fr;
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

  .apikey-inventory-toolbar {
    grid-template-columns: 1fr;
  }
}
</style>
<script>
import apiClient from "@/services/apiClient";

import copy from "copy-to-clipboard";
import download from "@/shared/download";
import EnterpriseDataTable from "@/components/grid/EnterpriseDataTable.vue";
import {
  credentialInventoryActions,
  credentialInventoryRow,
  normalizeCredentialInventory,
  normalizeCredentialInventoryFilters,
} from "@/domain/credentialLifecycle";

export default {
  name: "ApikeyComponent",
  components: { EnterpriseDataTable },
  data() {
    return {
      status: "not_accepted",
      error: null,
      showError: false,
      apikey: null,
      credentials: [],
      credentialCapabilities: [
        "credential.create",
        "credential.rotate",
        "credential.revoke",
        "credential.audit",
      ],
      credentialFilters: {
        expiry: "",
        owner: "",
        scope: "",
        status: "",
      },
      credentialStatusOptions: [
        "active",
        "expiring",
        "expired",
        "rotated",
        "revoked",
        "legacy",
        "unknown",
      ],
    };
  },
  computed: {
    credentialColumns() {
      const copy = this.language[this.config.currentLanguage].Apikey;
      return [
        { key: "name", label: copy.colName, required: true, sortable: true },
        { key: "fingerprint", label: copy.colFingerprint, required: true },
        { key: "scopes", label: copy.colScopes },
        { key: "status", label: copy.colStatus, type: "badge" },
        { key: "actor", label: copy.colOwner },
        { key: "createdAt", label: copy.colCreated },
        { key: "lastUsedAt", label: copy.colLastUsed },
        { key: "expiresAt", label: copy.colExpiry },
      ];
    },
    credentialRows() {
      const copy = this.language[this.config.currentLanguage].Apikey;
      return normalizeCredentialInventory(this.credentials, {
        filters: {
          expiry: this.credentialFilters.expiry,
          owner: this.credentialFilters.owner,
          scope: this.credentialFilters.scope,
          status: this.credentialFilters.status,
        },
        limit: 100,
      }).map((credential) => credentialInventoryRow(credential, copy));
    },
    credentialActions() {
      const copy = this.language[this.config.currentLanguage].Apikey;
      return credentialInventoryActions(
        {},
        {
          capabilities: this.credentialCapabilities,
          copy: {
            auditTooltip: copy.auditTooltip,
            createTooltip: copy.createTooltip,
            revokeTooltip: copy.revokeTooltip,
            rotateTooltip: copy.rotateTooltip,
          },
        },
      ).map((action) => ({
        ...action,
        label: copy.actions[action.id] || action.label,
      }));
    },
    credentialTableCopy() {
      const copy = this.language[this.config.currentLanguage].Apikey;
      return {
        actions: copy.actionsLabel,
        clearFilters: copy.clearFilters,
        moreActions: copy.moreActions,
        resultCount: copy.resultCount,
        scrollRegion: copy.inventoryScrollRegion,
        selectPage: copy.selectPage,
        selectRow: copy.selectRow,
        states: {
          empty: { title: copy.emptyTitle, description: copy.emptyDescription },
          "no-results": {
            title: copy.noResultsTitle,
            description: copy.noResultsDescription,
          },
        },
      };
    },
    hasCredentialFilters() {
      const filters = normalizeCredentialInventoryFilters({
        expiry: this.credentialFilters.expiry,
        owner: this.credentialFilters.owner,
        scope: this.credentialFilters.scope,
        status: this.credentialFilters.status,
      });
      return (
        filters.statuses.length > 0 ||
        filters.scopes.length > 0 ||
        Boolean(filters.owner) ||
        Boolean(filters.expiry)
      );
    },
  },
  watch: {
    $route() {
      this.getApiKey();
      this.$forceUpdate();
    },
  },
  created() {
    this.emitter.on("refreshApiKey", (msg) => {
      if (msg == true) this.getApiKey();
      else this.$forceUpdate();
    });
    this.getApiKey();
  },
  methods: {
    makeToast(text) {
      this.$wkToast(text);
    },
    copyClipboard(text) {
      copy(text);
      this.makeToast(this.language[this.config.currentLanguage].Apikey.keyCopy);
    },
    getApiKey() {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(this.config.serviceBaseUrl + this.config.url.apikey, {
          headers: this.setHeaders(),
        })
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.apikey = response.data.apiKey;
          this.credentials = this.normalizeCredentialResponse(response.data);
        })
        .catch((e) => {
          this.emitter.emit("showLoader", false);
          this.Logout(this, e);
          this.error = e;
        });
    },
    normalizeCredentialResponse(data) {
      if (Array.isArray(data?.credentials)) return data.credentials;
      if (!data?.apiKey) return [];
      return [
        {
          actor: "legacy",
          id: "legacy-key",
          keyPrefix: String(data.apiKey).slice(0, 12),
          lastUsedUnavailable: true,
          legacy: true,
          name: this.language[this.config.currentLanguage].Apikey.legacyName,
          scopes: ["legacy"],
          status: "legacy",
        },
      ];
    },
    credentialStatusLabel(status) {
      return (
        this.language[this.config.currentLanguage].Apikey.statuses[status] ||
        status
      );
    },
    clearCredentialFilters() {
      this.credentialFilters = { expiry: "", owner: "", scope: "", status: "" };
    },
    handleCredentialAction(event) {
      this.makeToast(
        `${this.language[this.config.currentLanguage].Apikey.actions[event.action]}: ${event.row.name}`,
      );
    },
    confirmCredentialAction(event) {
      this.handleCredentialAction(event);
    },
    generateKey() {
      return this.$showConfirm({
        message:
          this.language[this.config.currentLanguage].Apikey
            .confirmGenerateMessage,
        variant: "warning",
      }).then((confirmed) => {
        if (confirmed) this.generateAction();
      });
    },
    generateAction() {
      apiClient
        .put(
          this.config.serviceBaseUrl + this.config.url.apikey,
          {},
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.apikey = response.data.apiKey;
        })
        .catch((e) => {
          this.emitter.emit("showLoader", false);
          this.Logout(this, e);
          this.error = e;
        });
    },
    goGithub() {
      window.open("https://pypi.org/project/idelium/", "_blank");
    },
    downloadKey() {
      download.file("idelium", this.apikey, "plain/text");
    },
  },
};
</script>
