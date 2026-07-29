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
      :columns="columns"
      :error="error"
      :has-active-filters="query.search !== ''"
      :listing-copy="copy"
      :loading="loading"
      :meta="meta"
      :rows="arrayAccounts"
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
    />
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
  "role",
  "idCostumer",
  "costumer",
  "roleName",
];

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
      ];
      if (this.isSuperAdmin) {
        definitions.push({
          key: "costumer",
          label: this.copy.costumer,
          sortable: true,
        });
      }
      definitions.push({
        key: "roleName",
        label: this.copy.role,
        sortable: true,
      });
      return definitions;
    },
    actions() {
      return [
        { id: "edit", label: this.copy.btnModify },
        {
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
  },
  methods: {
    restoreQuery() {
      const parsed = parseGridRouteQuery(this.$route?.query || {}, {
        allowedSorts: ALLOWED_SORTS,
      });
      const next = {
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
                sort: { field: next.sort, direction: next.direction },
              },
              { allowedSorts: ALLOWED_SORTS },
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
      return this.updateRoute({ search: "" });
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
          params: this.query,
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
      if (action === "edit") this.showAccountModal(row);
      if (action === "delete") this.deleteAccount(row.id);
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
      return apiClient
        .post(
          this.config.serviceBaseUrl + this.config.url.accounts,
          {
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
            idCostumer: data.idCostumer,
          },
          { headers: this.setHeaders() },
        )
        .then(() => this.getAccounts())
        .catch((error) => {
          this.error = error;
          this.Logout(this, error);
        });
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
