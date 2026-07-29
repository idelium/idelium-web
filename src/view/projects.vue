<template>
  <section class="enterprise-listing">
    <header class="enterprise-listing__header">
      <div>
        <p class="enterprise-listing__eyebrow">
          {{ projectCopy.listEyebrow }}
        </p>
        <h1>{{ projectCopy.listTitle }}</h1>
        <p>{{ projectCopy.listDescription }}</p>
      </div>
      <IdButton variant="primary" v-on:click="showModal(null, 'new')">
        {{ projectCopy.btnNewProject }}
      </IdButton>
    </header>

    <div class="enterprise-listing__panel">
      <EnterpriseDataTable
        :accessible-label="projectCopy.listTitle"
        :actions="projectActions"
        :columns="projectColumns"
        :copy="dataTableCopy"
        :error="projectsError"
        :has-active-filters="projectsGridQuery.search !== ''"
        :loading="projectsLoading"
        :meta="projectsGridMeta"
        :rows="arrayProjects"
        :sort="projectSort"
        v-on:action="handleProjectAction"
        v-on:clear-filters="clearProjectSearch"
        v-on:create="showModal(null, 'new')"
        v-on:retry="getProjects"
        v-on:row-activate="showProjectModal"
        v-on:sort="sortProjects"
      >
        <template #toolbar>
          <label class="enterprise-listing__search">
            <span>{{ projectCopy.searchLabel }}</span>
            <input
              v-model.trim="projectSearch"
              type="search"
              :placeholder="projectCopy.searchPlaceholder"
              v-on:input="scheduleProjectSearch"
            />
          </label>
        </template>
      </EnterpriseDataTable>

      <nav
        class="enterprise-listing__pagination"
        :aria-label="projectCopy.paginationLabel"
      >
        <IdButton
          variant="secondary"
          :disabled="projectsLoading || !projectsGridMeta.hasPreviousPage"
          v-on:click="changeProjectPage(projectsGridMeta.page - 1)"
        >
          {{ projectCopy.previousPage }}
        </IdButton>
        <span>
          {{
            projectCopy.pageStatus
              .replace("{page}", String(projectsGridMeta.page))
              .replace("{pages}", String(projectsGridMeta.lastPage))
          }}
        </span>
        <IdButton
          variant="secondary"
          :disabled="projectsLoading || !projectsGridMeta.hasNextPage"
          v-on:click="changeProjectPage(projectsGridMeta.page + 1)"
        >
          {{ projectCopy.nextPage }}
        </IdButton>
      </nav>
    </div>

    <modalModifyProject
      ref="modifyModal"
      :arrayProjects="arrayProjects"
      v-on:updateData="updateData"
    />
  </section>
</template>
<script>
import EnterpriseDataTable from "@/components/grid/EnterpriseDataTable.vue";
import IdButton from "@/components/ui/IdButton.vue";
import {
  parseGridResponse,
  parseGridRouteQuery,
  serializeGridRouteQuery,
} from "@/domain/enterpriseGrid";
import apiClient from "@/services/apiClient";
import modalModifyProject from "./project/modalModifyProject.vue";

export default {
  name: "ProjectsComponent",
  created() {
    this.restoreProjectQuery();
    this.getProjects();
    this.$gtag.event("idelium-builder", { method: "project" });
    this.emitter.on("refreshProject", (msg) => {
      if (msg == true) this.getProjects(true);
      else this.$forceUpdate();
    });
  },
  watch: {
    "$route.query": {
      deep: true,
      handler() {
        if (this.updatingProjectRoute) return;
        const changed = this.restoreProjectQuery();
        if (changed) this.getProjects();
      },
    },
    $route() {
      this.$gtag.event("idelium-builder", { method: "project" });
      this.$forceUpdate();
    },
  },
  beforeUnmount() {
    if (this.projectSearchTimer) clearTimeout(this.projectSearchTimer);
  },
  data() {
    return {
      newproject: null,
      arrayProjects: [],
      projectsGridQuery: {
        page: 1,
        pageSize: 25,
        sort: "created_at",
        direction: "asc",
        search: "",
      },
      projectsGridMeta: {
        page: 1,
        pageSize: 25,
        total: null,
        lastPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      idSelected: null,
      projectToModify: null,
      projectSearch: "",
      projectSearchTimer: null,
      projectsError: null,
      projectsLoading: false,
      updatingProjectRoute: false,
    };
  },
  computed: {
    projectCopy() {
      return this.language[this.config.currentLanguage].Projects;
    },
    dataTableCopy() {
      return {
        ...this.language[this.config.currentLanguage].DataTable,
        create: this.projectCopy.btnNewProject,
      };
    },
    projectColumns() {
      return [
        {
          key: "id",
          label: this.projectCopy.id,
          required: true,
          sortable: true,
          type: "technical",
        },
        {
          key: "name",
          label: this.projectCopy.project,
          required: true,
          sortable: true,
        },
        {
          key: "description",
          label: this.projectCopy.description,
          sortable: true,
        },
      ];
    },
    projectActions() {
      return [
        {
          id: "edit",
          label: this.projectCopy.btnModify,
          tooltip: this.projectCopy.btnModalModifyProject,
        },
        {
          id: "delete",
          label: this.projectCopy.btnDelete,
          tooltip: this.language[this.config.currentLanguage].Actions.delete,
          variant: "danger",
        },
      ];
    },
    projectSort() {
      return {
        field: this.projectsGridQuery.sort,
        direction: this.projectsGridQuery.direction,
      };
    },
  },
  methods: {
    modify(id, name) {
      this.idSelected = id;
      this.projectToModify = name;
    },
    normalizeGridResponse(responseData, fallbackMeta) {
      if (Array.isArray(responseData)) {
        return {
          rows: responseData,
          meta: {
            ...fallbackMeta,
            total: null,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }

      const meta = responseData?.meta || {};
      return {
        rows: Array.isArray(responseData?.data) ? responseData.data : [],
        meta: {
          page: Number(meta.page) || fallbackMeta.page,
          pageSize: Number(meta.pageSize) || fallbackMeta.pageSize,
          total: Number.isFinite(Number(meta.total)) ? Number(meta.total) : 0,
          lastPage: Math.max(Number(meta.lastPage) || 1, 1),
          hasNextPage: Boolean(meta.hasNextPage),
          hasPreviousPage: Boolean(meta.hasPreviousPage),
        },
      };
    },
    applyProjectsResponse(responseData) {
      if (!Array.isArray(responseData)) {
        const result = parseGridResponse({ data: responseData });
        this.arrayProjects = result.rows;
        this.projectsGridMeta = {
          ...result.meta,
          lastPage: Math.max(
            Math.ceil(result.meta.total / result.meta.pageSize),
            1,
          ),
        };
        return;
      }
      const result = this.normalizeGridResponse(
        responseData,
        this.projectsGridMeta,
      );
      this.arrayProjects = result.rows;
      this.projectsGridMeta = result.meta;
    },
    restoreProjectQuery() {
      const query = parseGridRouteQuery(this.$route?.query || {}, {
        allowedSorts: ["id", "name", "description", "created_at", "updated_at"],
      });
      const next = {
        page: query.page,
        pageSize: query.pageSize,
        search: query.search,
        sort: query.sort?.field || "created_at",
        direction: query.sort?.direction || "asc",
      };
      const changed =
        JSON.stringify(next) !== JSON.stringify(this.projectsGridQuery);
      this.projectsGridQuery = next;
      this.projectSearch = query.search;
      return changed;
    },
    async updateProjectRoute(changes) {
      const next = { ...this.projectsGridQuery, ...changes };
      if (
        changes.search !== undefined ||
        changes.sort !== undefined ||
        changes.direction !== undefined
      ) {
        next.page = 1;
      }
      this.projectsGridQuery = next;
      if (this.$router && this.$route) {
        this.updatingProjectRoute = true;
        try {
          await this.$router.replace({
            query: serializeGridRouteQuery(
              {
                page: next.page,
                pageSize: next.pageSize,
                search: next.search,
                sort: {
                  field: next.sort,
                  direction: next.direction,
                },
              },
              {
                allowedSorts: [
                  "id",
                  "name",
                  "description",
                  "created_at",
                  "updated_at",
                ],
              },
            ),
          });
        } finally {
          this.updatingProjectRoute = false;
        }
      }
      return this.getProjects();
    },
    scheduleProjectSearch() {
      if (this.projectSearchTimer) clearTimeout(this.projectSearchTimer);
      this.projectSearchTimer = setTimeout(() => {
        this.projectSearchTimer = null;
        this.updateProjectRoute({ search: this.projectSearch });
      }, 250);
    },
    clearProjectSearch() {
      this.projectSearch = "";
      return this.updateProjectRoute({ search: "" });
    },
    sortProjects(sort) {
      return this.updateProjectRoute({
        sort: sort.field,
        direction: sort.direction,
      });
    },
    changeProjectPage(page) {
      return this.updateProjectRoute({ page: Math.max(Number(page) || 1, 1) });
    },
    showProjectModal(project) {
      this.$refs.modifyModal.showModal(project, "modify");
    },
    handleProjectAction({ action, row }) {
      if (action === "edit") this.showProjectModal(row);
      if (action === "delete") this.deleteProject(row.id);
    },

    deleteProject(id) {
      return this.$showConfirm({
        message: this.language[this.config.currentLanguage].Projects.textDelete,
        variant: "warning",
      }).then((confirmed) => {
        if (confirmed) this.deleteAction(id);
      });
    },
    deleteAction(id) {
      apiClient
        .delete(
          this.config.serviceBaseUrl + this.config.url.projects + "/" + id,
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.applyProjectsResponse(response.data);
          if (this.arrayProjects.length == 0) {
            this.showModal(null, "new");
          }
          this.emitter.emit("showLoader", false);
        })
        .catch((e) => {
          this.emitter.emit("showLoader", false);
          this.Logout(this, e);
          this.error = e;
        });
    },
    getCostumers() {
      apiClient
        .get(this.config.serviceBaseUrl + this.config.url.costumers, {
          headers: this.setHeaders(),
        })
        .then((response) => {
          this.emitter.emit("showLoader", false);
          if (response.data.length == 0) {
            this.showModal(null, "new");
          }
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },

    getProjects(isAutomaticLoad = false) {
      this.emitter.emit("showLoader", true);
      this.projectsLoading = true;
      this.projectsError = null;
      apiClient
        .get(this.config.serviceBaseUrl + this.config.url.projects, {
          headers: this.setHeaders(),
          params: this.projectsGridQuery,
        })
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.applyProjectsResponse(response.data);
          if (this.arrayProjects.length == 0) {
            this.getCostumers();
          } else {
            if (isAutomaticLoad == false)
              this.emitter.emit("updateListProject", this.arrayProjects);
          }
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
          this.projectsError = e;
        })
        .finally(() => {
          this.projectsLoading = false;
          this.emitter.emit("showLoader", false);
        });
    },
    insertProject(data) {
      apiClient
        .post(
          this.config.serviceBaseUrl + this.config.url.projects,
          {
            name: data.name,
            description: data.description,
          },
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.applyProjectsResponse(response.data);
          this.emitter.emit("updateListProject", this.arrayProjects);
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    updateProject(data) {
      this.emitter.emit("showLoader", true);
      apiClient
        .put(
          this.config.serviceBaseUrl + this.config.url.projects + "/" + data.id,
          {
            name: data.name,
            description: data.description,
          },
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.applyProjectsResponse(response.data);
          this.emitter.emit("updateListProject", this.arrayProjects);
        })
        .catch((e) => {
          this.emitter.emit("showLoader", false);
          this.Logout(this, e);
          this.error = e;
        });
    },
    showModal(index, type) {
      if (type == "new") {
        this.$refs.modifyModal.showModal(null, type);
      } else {
        this.$refs.modifyModal.showModal(this.arrayProjects[index], type);
      }
    },
    updateData(data) {
      if (data.type == "new") {
        this.insertProject(data);
      } else {
        this.updateProject(data);
      }
    },
  },
  components: {
    EnterpriseDataTable,
    IdButton,
    modalModifyProject,
  },
};
</script>

<style scoped>
.enterprise-listing {
  display: grid;
  gap: var(--id-space-5);
  min-width: 0;
  padding: var(--id-space-5);
}

.enterprise-listing__header,
.enterprise-listing__panel {
  background: var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
}

.enterprise-listing__header {
  align-items: center;
  display: flex;
  gap: var(--id-space-4);
  justify-content: space-between;
  padding: var(--id-space-5);
}

.enterprise-listing__header h1,
.enterprise-listing__header p {
  margin: 0;
}

.enterprise-listing__eyebrow {
  color: var(--id-color-text-muted);
  font-size: var(--id-font-size-small);
  font-weight: var(--id-font-weight-bold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.enterprise-listing__panel {
  display: grid;
  gap: var(--id-space-4);
  padding: var(--id-space-5);
}

.enterprise-listing__search {
  display: grid;
  gap: var(--id-space-2);
  max-width: 30rem;
  width: 100%;
}

.enterprise-listing__search input {
  background: var(--id-color-surface);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  color: var(--id-color-text);
  min-height: var(--id-control-min-size);
  padding: 0 var(--id-space-3);
}

.enterprise-listing__pagination {
  align-items: center;
  display: flex;
  gap: var(--id-space-3);
  justify-content: flex-end;
}

@media (max-width: 48rem) {
  .enterprise-listing {
    padding: var(--id-space-3);
  }

  .enterprise-listing__header {
    align-items: stretch;
    flex-direction: column;
  }

  .enterprise-listing__pagination {
    justify-content: space-between;
  }
}
</style>
