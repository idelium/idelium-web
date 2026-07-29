<template>
  <div class="platform-manager">
    <section class="card platform-manager__toolbar">
      <div class="platform-manager__filters">
        <label>
          <span>{{ copy.modalAddPlatform.lblType }}</span>
          <select
            v-model="typeSelected"
            class="form-control"
            v-on:change="changeType"
          >
            <option
              v-for="type in arrayTypes"
              v-bind:key="type.id"
              :value="type.id"
            >
              {{ type.name }}
            </option>
          </select>
        </label>
        <label v-if="showBrandCol">
          <span>{{ copy.colBrand }}</span>
          <select
            v-model="brandSelected"
            class="form-control"
            v-on:change="applyReferenceFilters"
          >
            <option value="all">{{ copy.all }}</option>
            <option
              v-for="brand in arrayBrands"
              v-bind:key="brand.id"
              :value="brand.id"
            >
              {{ brand.brand }}
            </option>
          </select>
        </label>
        <label>
          <span>{{ copy.colOs }}</span>
          <select
            v-model="osSelected"
            class="form-control"
            v-on:change="changeOs"
          >
            <option value="all">{{ copy.all }}</option>
            <option v-for="os in arrayOs" v-bind:key="os.id" :value="os.id">
              {{ os.name }}
            </option>
          </select>
        </label>
        <label v-if="arrayBrowser.length > 0">
          <span>{{ copy.colBrowser }}</span>
          <select
            v-model="browserSelected"
            class="form-control"
            v-on:change="applyReferenceFilters"
          >
            <option value="all">{{ copy.all }}</option>
            <option
              v-for="browser in arrayBrowser"
              v-bind:key="browser.id"
              :value="browser.id"
            >
              {{ browser.name }}
            </option>
          </select>
        </label>
      </div>
      <button
        type="button"
        class="btn btn-primary"
        v-on:click="$refs.modalAddPlatformForm.showModal()"
      >
        {{ copy.btnAddPlatform }}
      </button>
    </section>

    <section
      v-if="elementIdToEdit != null"
      class="card platform-manager__editor"
      aria-live="polite"
    >
      <label>
        <span>{{ copy.colStatus }}</span>
        <select v-model="elementToEdit" class="form-control">
          <option
            v-for="status in arrayStatus"
            v-bind:key="status.id"
            :value="status.id"
          >
            {{ status.name }}
          </option>
        </select>
      </label>
      <button
        type="button"
        class="btn btn-success"
        v-on:click="setStatusPlatform"
      >
        {{ platformCopy.btnModify }}
      </button>
      <button type="button" class="btn btn-secondary" v-on:click="cancelEdit">
        {{ platformCopy.btnCancel }}
      </button>
    </section>

    <PlatformReferenceGrid
      v-model:search="platformGridSearch"
      :accessible-label="platformCopy.platforms"
      :actions="platformActions"
      :columns="platformColumns"
      :copy="platformGridCopy"
      :error="platformGridError"
      :loading="platformGridLoading"
      :meta="platformGridMeta"
      :query="platformGridQuery"
      :rows="arrayPlatforms"
      :sort="platformGridSort"
      :table-copy="platformGridTableCopy"
      v-on:action="handlePlatformAction"
      v-on:clear-filters="clearPlatformGridSearch"
      v-on:page-change="changePlatformGridPage"
      v-on:retry="getPlatforms"
      v-on:row-activate="editThisElement"
      v-on:search="schedulePlatformGridSearch"
      v-on:sort="sortPlatformGrid"
    />

    <modalAddPlatformForm
      ref="modalAddPlatformForm"
      :arrayTypes="arrayTypes"
      :arrayLocations="arrayLocations"
      v-on:savePlatform="savePlatform"
    />
  </div>
</template>

<script>
import PlatformReferenceGrid from "@/components/grid/PlatformReferenceGrid.vue";
import { platformGrid } from "@/mixins/platformGrid";
import modalAddPlatformForm from "./addPlatformForm/modalAddPlatformForm.vue";
import commonCalls from "./commonCalls";

export default {
  name: "ManagePlatform",
  components: {
    PlatformReferenceGrid,
    modalAddPlatformForm,
  },
  mixins: [platformGrid],
  props: {
    arrayTypes: { type: Array, default: () => [] },
    arrayLocations: { type: Array, default: () => [] },
    arrayStatus: { type: Array, default: () => [] },
  },
  data() {
    return {
      typeSelected: null,
      brandSelected: "all",
      browserSelected: "all",
      osSelected: "all",
      arrayPlatforms: [],
      arrayBrowser: [],
      arrayOs: [],
      arrayBrands: [],
      elementIdToEdit: null,
      elementToEdit: null,
      showBrandCol: true,
    };
  },
  computed: {
    platformCopy() {
      return this.language[this.config.currentLanguage].Platforms;
    },
    copy() {
      return this.platformCopy.ManagePlatform;
    },
    platformColumns() {
      const columns = [
        { key: "id", label: this.copy.colId, required: true, sortable: true },
        {
          key: "hostname",
          label: this.copy.colHost,
          required: true,
          sortable: true,
        },
        { key: "locationLabel", label: this.copy.colLocation },
      ];
      if (this.showBrandCol) {
        columns.push({
          key: "brandDescription",
          label: this.copy.colBrand,
          sortable: true,
        });
      }
      columns.push(
        {
          key: "osDescription",
          label: this.copy.colOs,
          sortable: true,
        },
        {
          key: "browserDescription",
          label: this.copy.colBrowser,
          sortable: true,
        },
        { key: "statusLabel", label: this.copy.colStatus },
      );
      return columns;
    },
    platformActions() {
      const actions = this.language[this.config.currentLanguage].Actions;
      return [
        { id: "edit", label: actions.edit },
        {
          id: "delete",
          label: actions.delete,
          variant: "danger",
        },
      ];
    },
  },
  methods: {
    start() {
      this.typeSelected = this.arrayTypes[0]?.id ?? null;
      return this.changeType();
    },
    reloadPlatformGrid() {
      return this.getPlatforms();
    },
    async changeType() {
      this.brandSelected = "all";
      this.osSelected = "all";
      this.browserSelected = "all";
      this.showBrandCol =
        this.getTypeName(this.typeSelected) === "mobile devices";
      await this.loadReferenceFilters();
      return this.filterPlatformGrid({});
    },
    async loadReferenceFilters() {
      const [brandsResponse, osResponse] = await Promise.all([
        this.showBrandCol
          ? commonCalls.getBrand(this, false)
          : Promise.resolve({ data: [] }),
        this.typeSelected == null
          ? Promise.resolve({ data: [] })
          : commonCalls.getOs(this, this.typeSelected, false),
      ]);
      this.arrayBrands = brandsResponse.data;
      this.arrayOs = osResponse.data;
      this.arrayBrowser = [];
    },
    async changeOs() {
      this.browserSelected = "all";
      if (this.osSelected === "all") {
        this.arrayBrowser = [];
      } else {
        const response = await commonCalls.getBrowser(
          this,
          this.osSelected,
          false,
        );
        this.arrayBrowser = response.data;
      }
      return this.applyReferenceFilters();
    },
    applyReferenceFilters() {
      const filters = {};
      if (this.brandSelected !== "all") filters.brand = this.brandSelected;
      if (this.osSelected !== "all") filters.os = this.osSelected;
      if (this.browserSelected !== "all") {
        filters.browser = this.browserSelected;
      }
      return this.filterPlatformGrid(filters);
    },
    getTypeName(idType) {
      return this.arrayTypes.find(({ id }) => id === idType)?.name ?? "";
    },
    getLocationName(idLocation) {
      return (
        this.arrayLocations.find(({ id }) => id === idLocation)?.name ?? "—"
      );
    },
    getStatusName(idStatus) {
      return this.arrayStatus.find(({ id }) => id === idStatus)?.name ?? "—";
    },
    decoratePlatform(platform) {
      return {
        ...platform,
        locationLabel: this.getLocationName(platform.location),
        statusLabel: this.getStatusName(platform.status),
      };
    },
    async getPlatforms() {
      if (this.typeSelected == null) {
        this.arrayPlatforms = [];
        return;
      }
      this.platformGridLoading = true;
      this.platformGridError = null;
      try {
        const response = await commonCalls.getPlatforms(
          this,
          this.typeSelected,
        );
        this.arrayPlatforms = this.applyPlatformGridResponse(response).map(
          this.decoratePlatform,
        );
      } catch (error) {
        this.platformGridError = error;
        this.Logout(this, error);
      } finally {
        this.platformGridLoading = false;
      }
    },
    handlePlatformAction({ action, row }) {
      if (action === "edit") this.editThisElement(row);
      if (action === "delete") this.deletePlatform(row.id);
    },
    editThisElement(element) {
      this.elementIdToEdit = element.id;
      this.elementToEdit = element.status;
    },
    cancelEdit() {
      this.elementIdToEdit = null;
      this.elementToEdit = null;
    },
    async savePlatform(payload) {
      await commonCalls.savePlatform(this, payload);
      await this.getPlatforms();
    },
    async setStatusPlatform() {
      await commonCalls.updateStatusPlatform(
        this,
        this.elementIdToEdit,
        this.typeSelected,
        this.elementToEdit,
      );
      this.cancelEdit();
      await this.getPlatforms();
    },
    deletePlatform(id) {
      return this.$showConfirm({
        message: this.copy.confirmationPlatform,
        variant: "warning",
      }).then(async (confirmed) => {
        if (!confirmed) return;
        await commonCalls.deletePlatform(
          this,
          id,
          this.typeSelected,
          this.elementToEdit,
        );
        await this.getPlatforms();
      });
    },
  },
};
</script>

<style scoped>
.platform-manager {
  display: grid;
  gap: var(--id-space-4);
}

.platform-manager__toolbar,
.platform-manager__editor {
  align-items: end;
  display: flex;
  gap: var(--id-space-3);
  justify-content: space-between;
  padding: var(--id-space-4);
}

.platform-manager__filters {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: var(--id-space-3);
}

.platform-manager__filters label,
.platform-manager__editor label {
  display: grid;
  gap: var(--id-space-2);
  min-width: 12rem;
}

@media (max-width: 48rem) {
  .platform-manager__toolbar,
  .platform-manager__editor {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
