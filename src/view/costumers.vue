<template>
  <EnterpriseListingPage
    :create-label="copy.btnNewCostumer"
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
      :rows="arrayCostumers"
      :sort="sort"
      :table-copy="tableCopy"
      v-on:action="handleAction"
      v-on:clear-filters="clearSearch"
      v-on:create="showModal(null, 'new')"
      v-on:page-change="changePage"
      v-on:retry="getCostumers"
      v-on:row-activate="showCostumerModal"
      v-on:search="scheduleSearch"
      v-on:sort="changeSort"
    />
    <modalModifyCostumer
      ref="modifyModal"
      :arrayCostumers="arrayCostumers"
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
import modalModifyCostumer from "./costumer/modalModifyCostumer.vue";

const ALLOWED_SORTS = [
  "id",
  "costumer",
  "description",
  "licenseExpiration",
  "created_at",
  "updated_at",
];

export default {
  name: "CostumersComponent",
  components: {
    EnterpriseListingGrid,
    EnterpriseListingPage,
    modalModifyCostumer,
  },
  created() {
    this.restoreQuery();
    this.getCostumers();
    this.$gtag.event("idelium-builder", { method: "costumer" });
    this.emitter.on("refreshCostumer", () => this.getCostumers(true));
  },
  beforeUnmount() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  },
  watch: {
    "$route.query": {
      deep: true,
      handler() {
        if (this.updatingRoute) return;
        if (this.restoreQuery()) this.getCostumers();
      },
    },
  },
  data() {
    return {
      arrayCostumers: [],
      error: null,
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
        sort: "created_at",
        direction: "asc",
      },
      search: "",
      searchTimer: null,
      updatingRoute: false,
    };
  },
  computed: {
    copy() {
      return this.language[this.config.currentLanguage].Costumers;
    },
    tableCopy() {
      return {
        ...this.language[this.config.currentLanguage].DataTable,
        create: this.copy.btnNewCostumer,
      };
    },
    columns() {
      return [
        {
          key: "id",
          label: this.copy.id,
          required: true,
          sortable: true,
          type: "technical",
        },
        {
          key: "costumer",
          label: this.copy.costumer,
          required: true,
          sortable: true,
        },
        {
          key: "description",
          label: this.copy.description,
          sortable: true,
        },
        {
          key: "licenseExpiration",
          label: this.copy.licenseExpiration,
          sortable: true,
          type: "timestamp",
        },
      ];
    },
    actions() {
      return [
        { id: "edit", label: this.copy.btnModify },
        {
          id: "delete",
          label: this.copy.btnDelete,
          variant: "danger",
          disabled: (customer) => customer.usercostumer === "admin",
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
        sort: parsed.sort?.field || "created_at",
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
      return this.getCostumers();
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
    getCostumers(background = false) {
      this.loading = true;
      this.error = null;
      if (!background) this.emitter.emit("showLoader", true);
      return apiClient
        .get(this.config.serviceBaseUrl + this.config.url.costumers, {
          headers: this.setHeaders(),
          params: this.query,
        })
        .then((response) => {
          const result = parseGridResponse(response);
          this.arrayCostumers = result.rows;
          this.meta = {
            ...result.meta,
            lastPage: Math.max(
              Math.ceil(result.meta.total / result.meta.pageSize),
              1,
            ),
          };
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
    handleAction({ action, row }) {
      if (action === "edit") this.showCostumerModal(row);
      if (action === "delete") this.deleteCostumer(row.id);
    },
    showCostumerModal(customer) {
      this.$refs.modifyModal.showModal(customer, "modify");
    },
    showModal(index, type) {
      const customer = index === null ? null : this.arrayCostumers[index];
      this.$refs.modifyModal.showModal(customer, type);
    },
    deleteCostumer(id) {
      return this.$showConfirm({
        message: this.copy.textDelete,
        variant: "warning",
      }).then((confirmed) => {
        if (confirmed) return this.deleteAction(id);
        return null;
      });
    },
    deleteAction(id) {
      this.loading = true;
      return apiClient
        .delete(
          `${this.config.serviceBaseUrl}${this.config.url.costumers}/${id}`,
          { headers: this.setHeaders() },
        )
        .then(() => this.getCostumers())
        .catch((error) => {
          this.error = error;
          this.Logout(this, error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    saveCostumer(method, path, data) {
      this.loading = true;
      return apiClient[method](
        `${this.config.serviceBaseUrl}${this.config.url.costumers}${path}`,
        {
          costumer: data.costumer,
          description: data.description,
        },
        { headers: this.setHeaders() },
      )
        .then(() => {
          this.emitter.emit("updateListCostumer", this.arrayCostumers);
          return this.getCostumers();
        })
        .catch((error) => {
          this.error = error;
          this.Logout(this, error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    insertCostumer(data) {
      return this.saveCostumer("post", "", data);
    },
    updateCostumer(data) {
      return this.saveCostumer("put", `/${data.id}`, data);
    },
    updateData(data) {
      return data.type === "new"
        ? this.insertCostumer(data)
        : this.updateCostumer(data);
    },
  },
};
</script>
