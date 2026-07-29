<template>
  <EnterpriseListingPage
    :create-label="copy.newAccount"
    :description="copy.listDescription"
    :eyebrow="copy.listEyebrow"
    :title="copy.listTitle"
    v-on:create="showModal(null, 'new')"
  >
    <EnterpriseListingGrid
      v-model:search="search"
      :accessible-label="copy.listTitle"
      :actions="actions"
      :capabilities="accountCapabilities"
      :columns="columns"
      :error="error"
      :has-active-filters="hasActiveFilters"
      :listing-copy="copy"
      :loading="loading"
      :meta="meta"
      :rows="accountRows"
      :sort="sort"
      :table-copy="tableCopy"
      v-on:action="handleAction"
      v-on:clear-filters="clearSearch"
      v-on:create="showModal(null, 'new')"
      v-on:page-change="changePage"
      v-on:retry="getAccounts"
      v-on:row-activate="showAccountModal"
      v-on:search="scheduleSearch"
      v-on:sort="changeSort"
    >
      <template #toolbar>
        <div class="accounts-governance-filters">
          <label>
            <span>{{ copy.filterRole }}</span>
            <select
              :value="query.filters.role"
              v-on:change="changeFilter('role', $event.target.value)"
            >
              <option value="">{{ copy.filterAll }}</option>
              <option
                v-for="role in arrayRoles"
                v-bind:key="role.id"
                :value="role.id"
              >
                {{ role.name }}
              </option>
            </select>
          </label>
          <label>
            <span>{{ copy.filterStatus }}</span>
            <select
              :value="query.filters.status"
              v-on:change="changeFilter('status', $event.target.value)"
            >
              <option value="">{{ copy.filterAll }}</option>
              <option value="invited">{{ copy.accountStatuses.invited }}</option>
              <option value="active">{{ copy.accountStatuses.active }}</option>
              <option value="suspended">
                {{ copy.accountStatuses.suspended }}
              </option>
              <option value="expired-invitation">
                {{ copy.accountStatuses["expired-invitation"] }}
              </option>
              <option value="archived">{{ copy.accountStatuses.archived }}</option>
            </select>
          </label>
          <label>
            <span>{{ copy.filterTeam }}</span>
            <input
              :value="query.filters.team"
              :placeholder="copy.filterTeam"
              v-on:input="changeFilter('team', $event.target.value)"
            />
          </label>
          <label>
            <span>{{ copy.filterInvitation }}</span>
            <select
              :value="query.filters.invitation"
              v-on:change="changeFilter('invitation', $event.target.value)"
            >
              <option value="">{{ copy.filterAll }}</option>
              <option value="pending">{{ copy.invitationStates.pending }}</option>
              <option value="expired">{{ copy.invitationStates.expired }}</option>
              <option value="none">{{ copy.invitationStates.none }}</option>
            </select>
          </label>
        </div>
      </template>
    </EnterpriseListingGrid>
    <modalModifyAccount
      ref="modifyModal"
      :arrayAccounts="arrayAccounts"
      :roles="arrayRoles"
      :costumers="arrayCostumers"
      :isSuperAdmin="isSuperAdmin"
      v-on:updateData="updateData"
    />
  </EnterpriseListingPage>
</template>

<script>
import EnterpriseListingGrid from "@/components/grid/EnterpriseListingGrid.vue";
import EnterpriseListingPage from "@/components/grid/EnterpriseListingPage.vue";
import {
  accountOperationContract,
  createAccountInvitationRequest,
} from "@/domain/accountGovernance";
import {
  buildGridQuery,
  parseGridResponse,
  parseGridRouteQuery,
  serializeGridRouteQuery,
} from "@/domain/enterpriseGrid";
import apiClient from "@/services/apiClient";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";
import modalModifyAccount from "./account/modalModifyAccount.vue";

const ALLOWED_SORTS = [
  "id",
  "email",
  "name",
  "status",
  "teams",
  "lastActivityAt",
  "updatedAt",
  "role",
  "idCostumer",
  "costumer",
  "roleName",
];
const ALLOWED_FILTERS = ["role", "status", "team", "invitation"];

export default {
  name: "AccountsComponent",
  components: {
    EnterpriseListingGrid,
    EnterpriseListingPage,
    modalModifyAccount,
  },
  setup() {
    return { session: useSessionStore(pinia) };
  },
  created() {
    this.restoreQuery();
    this.getAccounts();
    this.$gtag.event("idelium", { method: "account" });
    this.emitter.on("refreshAccount", () => this.getAccounts(true));
  },
  beforeUnmount() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  },
  watch: {
    "$route.query": {
      deep: true,
      handler() {
        if (this.updatingRoute) return;
        if (this.restoreQuery()) this.getAccounts();
      },
    },
  },
  data() {
    return {
      arrayAccounts: [],
      arrayRoles: [],
      arrayCostumers: [],
      error: null,
      isSuperAdmin: false,
      loading: false,
      meta: {
        page: 1,
        pageSize: 25,
        total: 0,
        lastPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      query: {
        filters: {
          invitation: "",
          role: "",
          status: "",
          team: "",
        },
        page: 1,
        pageSize: 25,
        search: "",
        sort: "email",
        direction: "asc",
      },
      search: "",
      searchTimer: null,
      updatingRoute: false,
    };
  },
  computed: {
    copy() {
      return this.language[this.config.currentLanguage].Accounts;
    },
    tableCopy() {
      return {
        ...this.language[this.config.currentLanguage].DataTable,
        create: this.copy.newAccount,
      };
    },
    columns() {
      const definitions = [
        {
          key: "id",
          label: this.copy.id,
          required: true,
          sortable: true,
          type: "technical",
        },
        {
          key: "email",
          label: this.copy.account,
          required: true,
          sortable: true,
        },
        { key: "name", label: this.copy.name, sortable: true },
        {
          key: "statusLabel",
          label: this.copy.status,
          sortable: true,
          type: "status",
        },
      ];
      if (this.isSuperAdmin) {
        definitions.push({
          key: "costumer",
          label: this.copy.costumer,
          sortable: true,
        });
      }
      definitions.push({
        key: "teams",
        label: this.copy.teams,
        sortable: true,
      });
      definitions.push({
        key: "roleName",
        label: this.copy.role,
        sortable: true,
      });
      if (this.canReadAccountActivity) {
        definitions.push({
          key: "lastActivityAt",
          label: this.copy.lastActivity,
          sortable: true,
          type: "timestamp",
        });
      }
      definitions.push({
        key: "updatedAt",
        label: this.copy.updatedAt,
        sortable: true,
        type: "timestamp",
      });
      return definitions;
    },
    actions() {
      return [
        { capability: "account.detail", id: "detail", label: this.copy.btnDetail },
        {
          capability: "account.invite",
          disabled: (account) => account.status !== "invited",
          id: "resend-invite",
          label: this.copy.btnResendInvite,
          variant: "info",
        },
        {
          capability: "account.invite",
          disabled: (account) =>
            !["invited", "expired-invitation"].includes(account.status),
          id: "cancel-invite",
          label: this.copy.btnCancelInvite,
          variant: "warning",
        },
        {
          capability: "account.role.assign",
          id: "edit",
          label: this.copy.btnModify,
        },
        {
          capability: "account.suspend",
          disabled: (account) => account.status !== "active",
          id: "suspend",
          label: this.copy.btnSuspend,
          variant: "warning",
        },
        {
          capability: "account.reactivate",
          disabled: (account) => account.status !== "suspended",
          id: "reactivate",
          label: this.copy.btnReactivate,
          variant: "success",
        },
        {
          capability: "account.audit",
          id: "audit",
          label: this.copy.btnAudit,
        },
        {
          capability: "account.archive",
          id: "delete",
          label: this.copy.btnDelete,
          variant: "danger",
          disabled: (account) => account.email === "admin",
        },
      ];
    },
    sort() {
      return { field: this.query.sort, direction: this.query.direction };
    },
    hasActiveFilters() {
      return (
        this.query.search !== "" ||
        Object.values(this.query.filters).some((value) => value !== "")
      );
    },
    canReadAccountActivity() {
      return this.session.hasCapability("account.activity.read");
    },
    accountCapabilities() {
      return [
        "account.archive",
        "account.audit",
        "account.detail",
        "account.invite",
        "account.reactivate",
        "account.role.assign",
        "account.suspend",
      ].filter(
        (capability) =>
          this.isSuperAdmin ||
          this.session.hasCapability(capability) ||
          this.session.hasCapability("accounts.manage") ||
          this.session.hasCapability("customers.manage"),
      );
    },
    accountRows() {
      return this.arrayAccounts.map((account) => {
        const status = this.accountStatus(account);
        return {
          ...account,
          lastActivityAt: this.canReadAccountActivity
            ? account.lastActivityAt || account.lastLoginAt
            : null,
          status,
          statusLabel: this.copy.accountStatuses[status] || status,
          teams: Array.isArray(account.teams)
            ? account.teams.join(", ")
            : account.team || account.teamName || "—",
          updatedAt: account.updatedAt || account.modifiedAt || null,
        };
      });
    },
  },
  methods: {
    accountStatus(account) {
      if (account.status) return account.status;
      if (account.archivedAt) return "archived";
      if (account.suspendedAt) return "suspended";
      if (account.invitationExpiresAt && new Date(account.invitationExpiresAt) < new Date()) {
        return "expired-invitation";
      }
      if (account.invitedAt) return "invited";
      return "active";
    },
    restoreQuery() {
      const parsed = parseGridRouteQuery(this.$route?.query || {}, {
        allowedFilters: ALLOWED_FILTERS,
        allowedSorts: ALLOWED_SORTS,
      });
      const next = {
        filters: {
          invitation: parsed.filters.invitation || "",
          role: parsed.filters.role || "",
          status: parsed.filters.status || "",
          team: parsed.filters.team || "",
        },
        page: parsed.page,
        pageSize: parsed.pageSize,
        search: parsed.search,
        sort: parsed.sort?.field || "email",
        direction: parsed.sort?.direction || "asc",
      };
      const changed = JSON.stringify(next) !== JSON.stringify(this.query);
      this.query = next;
      this.search = parsed.search;
      return changed;
    },
    async updateRoute(changes) {
      const next = { ...this.query, ...changes };
      if (
        changes.search !== undefined ||
        changes.filters !== undefined ||
        changes.sort !== undefined ||
        changes.direction !== undefined
      ) {
        next.page = 1;
      }
      this.query = next;
      if (this.$router && this.$route) {
        this.updatingRoute = true;
        try {
          await this.$router.replace({
            query: serializeGridRouteQuery(
              {
                ...next,
                filters: next.filters,
                sort: { field: next.sort, direction: next.direction },
              },
              { allowedFilters: ALLOWED_FILTERS, allowedSorts: ALLOWED_SORTS },
            ),
          });
        } finally {
          this.updatingRoute = false;
        }
      }
      return this.getAccounts();
    },
    scheduleSearch(value) {
      if (this.searchTimer) clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.searchTimer = null;
        this.updateRoute({ search: value });
      }, 250);
    },
    clearSearch() {
      this.search = "";
      return this.updateRoute({
        filters: { invitation: "", role: "", status: "", team: "" },
        search: "",
      });
    },
    changeFilter(filter, value) {
      return this.updateRoute({
        filters: { ...this.query.filters, [filter]: value },
      });
    },
    changePage(page) {
      return this.updateRoute({ page: Math.max(Number(page) || 1, 1) });
    },
    changeSort(sort) {
      return this.updateRoute({
        sort: sort.field,
        direction: sort.direction,
      });
    },
    getAccounts(background = false) {
      this.loading = true;
      this.error = null;
      if (!background) this.emitter.emit("showLoader", true);
      return apiClient
        .get(this.config.serviceBaseUrl + this.config.url.accounts, {
          headers: this.setHeaders(),
          params: Object.fromEntries(
            buildGridQuery({
              allowedSorts: ALLOWED_SORTS,
              filters: this.query.filters,
              page: this.query.page,
              pageSize: this.query.pageSize,
              search: this.query.search,
              sort: {
                field: this.query.sort,
                direction: this.query.direction,
              },
            }).entries(),
          ),
        })
        .then((response) => {
          const result = parseGridResponse(response);
          this.arrayAccounts = result.rows;
          this.meta = {
            ...result.meta,
            lastPage: Math.max(
              Math.ceil(result.meta.total / result.meta.pageSize),
              1,
            ),
          };
          this.isSuperAdmin =
            this.session.hasCapability("customers.manage") ||
            this.arrayAccounts.some((account) => Number(account.role) === 1);
          return Promise.all([this.getRoles(), this.getCostumers()]);
        })
        .catch((error) => {
          this.error = error;
          this.Logout(this, error);
        })
        .finally(() => {
          this.loading = false;
          this.emitter.emit("showLoader", false);
        });
    },
    getRoles() {
      return apiClient
        .get(this.config.serviceBaseUrl + this.config.url.roles, {
          headers: this.setHeaders(),
        })
        .then((response) => {
          this.arrayRoles = response.data;
        });
    },
    getCostumers() {
      if (!this.isSuperAdmin) {
        this.arrayCostumers = [];
        return Promise.resolve();
      }
      return apiClient
        .get(this.config.serviceBaseUrl + this.config.url.costumers, {
          headers: this.setHeaders(),
        })
        .then((response) => {
          this.arrayCostumers = Array.isArray(response.data)
            ? response.data
            : response.data.data || [];
        });
    },
    handleAction({ action, row }) {
      if (
        [
          "cancel-invite",
          "reactivate",
          "resend-invite",
          "suspend",
        ].includes(action)
      ) {
        return this.confirmAccountLifecycleAction(action, row);
      }
      if (["audit", "detail"].includes(action)) {
        this.$wkToast?.(`${this.copy.governanceActionQueued}: ${row.email}`);
        return null;
      }
      if (action === "edit") this.showAccountModal(row);
      if (action === "delete") this.deleteAccount(row.id);
      return null;
    },
    confirmAccountLifecycleAction(action, row) {
      return this.$showConfirm({
        message: this.lifecycleConfirmationMessage(action, row),
        variant: ["cancel-invite", "suspend"].includes(action)
          ? "warning"
          : "info",
      }).then((confirmed) => {
        if (!confirmed) return null;
        return this.executeAccountLifecycleAction(action, row);
      });
    },
    lifecycleConfirmationMessage(action, row) {
      return String(this.copy.lifecycleConfirmations[action] || action)
        .replace("{account}", row.email || row.account || row.name)
        .replace("{role}", row.roleName || row.role || "—")
        .replace("{impact}", this.copy.lifecycleImpacts[action] || "");
    },
    executeAccountLifecycleAction(action, row) {
      const request = accountOperationContract(action, row, {
        actor: "current-user",
        actorAccountId: this.session.accountId,
        capabilities: this.accountCapabilities,
        tenantId: row.tenantId || row.idCostumer || "current-tenant",
        timestamp: new Date().toISOString(),
      });
      if (!request.allowed) {
        this.error = {
          safeErrors: [{ code: request.reason }],
          safeFeedback: this.copy.lifecycleSafeFailure,
        };
        return Promise.resolve();
      }
      return apiClient
        .post(this.accountLifecycleEndpoint(row.id, action), {
          ...request.body,
          audit: request.audit,
        }, {
          headers: { ...this.setHeaders(), ...request.headers },
        })
        .then((response) => {
          const durableStatus =
            response.data?.status || request.transition.nextStatus;
          this.arrayAccounts = this.arrayAccounts.map((account) => {
            if (account.id !== row.id) return account;
            return {
              ...account,
              status: durableStatus,
              updatedAt: response.data?.updatedAt || new Date().toISOString(),
            };
          });
          return response;
        })
        .catch((error) => {
          this.error = {
            cause: error,
            safeFeedback: this.copy.lifecycleSafeFailure,
          };
          this.Logout(this, error);
        });
    },
    accountLifecycleEndpoint(id, action) {
      return `${this.config.serviceBaseUrl}${this.config.url.accounts}/${id}/${action}`;
    },
    showAccountModal(account) {
      this.$refs.modifyModal.showModal(account, "modify");
    },
    showModal(index, type) {
      const account = index === null ? null : this.arrayAccounts[index];
      this.$refs.modifyModal.showModal(account, type);
    },
    deleteAccount(id) {
      return this.$showConfirm({
        message: this.copy.confirmDeleteAccount,
        variant: "warning",
      }).then((confirmed) => {
        if (confirmed) return this.deleteAction(id);
        return null;
      });
    },
    deleteAction(id) {
      return apiClient
        .delete(
          `${this.config.serviceBaseUrl}${this.config.url.accounts}/${id}`,
          { headers: this.setHeaders() },
        )
        .then(() => this.getAccounts())
        .catch((error) => {
          this.error = error;
          this.Logout(this, error);
        });
    },
    insertAccount(data) {
      const request = createAccountInvitationRequest(data, {
        actor: "current-user",
        allowedRoleIds: this.arrayRoles.map((role) => role.id),
        capabilities: ["account.invite"],
        existingAccounts: this.arrayAccounts,
        tenantId: data.idCostumer || "current-tenant",
      });
      if (!request.allowed) {
        this.error = {
          safeErrors: request.errors,
          safeFeedback: this.copy.invitationSafeFailure,
        };
        return Promise.resolve();
      }
      return apiClient
        .post(
          this.accountInvitationEndpoint(),
          request.body,
          { headers: { ...this.setHeaders(), ...request.headers } },
        )
        .then(() => this.getAccounts())
        .catch((error) => {
          this.error = error;
          this.Logout(this, error);
        });
    },
    accountInvitationEndpoint() {
      return (
        this.config.serviceBaseUrl +
        (this.config.url.accountInvitations ||
          `${this.config.url.accounts}/invitations`)
      );
    },
    updateAccount(data) {
      return apiClient
        .put(
          `${this.config.serviceBaseUrl}${this.config.url.accounts}/${data.id}`,
          { name: data.name, password: data.password },
          { headers: this.setHeaders() },
        )
        .then(() => this.getAccounts())
        .catch((error) => {
          this.error = error;
          this.Logout(this, error);
        });
    },
    updateData(data) {
      return data.type === "new"
        ? this.insertAccount(data)
        : this.updateAccount(data);
    },
  },
};
</script>

<style scoped>
.accounts-governance-filters {
  display: grid;
  gap: var(--id-space-3);
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: 100%;
}

.accounts-governance-filters label {
  display: grid;
  gap: var(--id-space-2);
  color: var(--id-color-text-muted);
  font-size: var(--id-font-size-caption);
  font-weight: var(--id-font-weight-bold);
}

.accounts-governance-filters input,
.accounts-governance-filters select {
  min-height: var(--id-control-min-size);
  padding: 0 var(--id-space-3);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  color: var(--id-color-text);
  background: var(--id-color-surface);
}

@media (max-width: 64rem) {
  .accounts-governance-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 40rem) {
  .accounts-governance-filters {
    grid-template-columns: 1fr;
  }
}
</style>
