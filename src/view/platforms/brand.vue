<template>
  <div>
    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-sm-1" />
          <div class="col">
            <div class="row" style="margin-top: 10px">
              <div class="col">
                <input
                  v-if="elementIdToEdit == null"
                  class="form-control"
                  id="input-none"
                  :placeholder="
                    language[config.currentLanguage].Platforms.Brand.name
                  "
                  v-model="name"
                />
                <input
                  v-else
                  v-model="elementNameToEdit"
                  class="form-control"
                  :placeholder="
                    language[config.currentLanguage].Platforms.Brand.name
                  "
                  v-on:keyup.enter="modify()"
                  v-on:keyup.escape="cancelEdit"
                />
              </div>
              <div class="col">
                <button
                  type="button"
                  class="btn btn-success"
                  size="sm"
                  v-on:click="elementIdToEdit == null ? save() : modify()"
                  :disabled="
                    elementIdToEdit == null
                      ? name.length == 0
                      : elementNameToEdit.length == 0
                  "
                >
                  {{
                    elementIdToEdit == null
                      ? language[config.currentLanguage].Platforms.btnSave
                      : language[config.currentLanguage].Platforms.btnModify
                  }}
                </button>
                <button
                  v-if="elementIdToEdit != null"
                  type="button"
                  class="btn btn-secondary"
                  v-on:click="cancelEdit"
                >
                  {{ language[config.currentLanguage].Platforms.btnCancel }}
                </button>
              </div>
            </div>
          </div>
          <div class="col-sm-1" />
        </div>
      </div>
    </div>
    <PlatformReferenceGrid
      v-model:search="platformGridSearch"
      :accessible-label="
        language[config.currentLanguage].Platforms.Brand.colBrand
      "
      :actions="platformActions"
      :columns="platformColumns"
      :copy="platformGridCopy"
      :error="platformGridError"
      :loading="platformGridLoading"
      :meta="platformGridMeta"
      :query="platformGridQuery"
      :rows="arrayElements"
      :sort="platformGridSort"
      :table-copy="platformGridTableCopy"
      v-on:action="handlePlatformAction"
      v-on:clear-filters="clearPlatformGridSearch"
      v-on:page-change="changePlatformGridPage"
      v-on:retry="getBrand"
      v-on:row-activate="editThisElement"
      v-on:search="schedulePlatformGridSearch"
      v-on:sort="sortPlatformGrid"
    />
  </div>
</template>
<script>
import PlatformReferenceGrid from "@/components/grid/PlatformReferenceGrid.vue";
import { platformGrid } from "@/mixins/platformGrid";
import commonCalls from "./commonCalls";
export default {
  name: "BrandComponent",
  mixins: [platformGrid],
  components: { PlatformReferenceGrid },
  data() {
    return {
      typeSelected: null,
      name: "",
      arrayElements: [],
      elementIdToEdit: null,
      elementNameToEdit: "",
    };
  },
  computed: {
    platformColumns() {
      const copy = this.language[this.config.currentLanguage].Platforms.Brand;
      return [
        { key: "id", label: copy.id, required: true, sortable: true },
        { key: "brand", label: copy.colBrand, required: true, sortable: true },
      ];
    },
    platformActions() {
      return [
        {
          id: "edit",
          label: this.language[this.config.currentLanguage].Actions.edit,
        },
      ];
    },
  },
  created() {
    this.getBrand();
  },
  watch: {},
  methods: {
    tabStart() {
      this.getBrand();
    },
    reloadPlatformGrid() {
      return this.getBrand();
    },
    handlePlatformAction({ action, row }) {
      if (action === "edit") this.editThisElement(row);
    },
    cancelEdit() {
      this.elementIdToEdit = null;
      this.elementNameToEdit = "";
    },
    editThisElement(element) {
      this.elementIdToEdit = element.id;
      this.elementNameToEdit = element.brand;
    },
    async modify() {
      this.emitter.emit("showLoader", true);
      let response = await commonCalls
        .modifyBrand(this, this.elementNameToEdit, this.elementIdToEdit)
        .catch((e) => {
          this.Logout(this, e);
        });
      if (response) await this.getBrand();
      this.emitter.emit("showLoader", false);
      this.elementIdToEdit = null;
      this.elementNameToEdit = "";
    },
    async getBrand() {
      this.emitter.emit("showLoader", true);
      this.platformGridLoading = true;
      let response = await commonCalls.getBrand(this).catch((e) => {
        this.platformGridError = e;
        this.Logout(this, e);
      });
      if (response)
        this.arrayElements = this.applyPlatformGridResponse(response);
      this.platformGridLoading = false;
      this.emitter.emit("showLoader", false);
    },
    async save() {
      this.emitter.emit("showLoader", true);
      let response = await commonCalls.saveBrand(this, this.name).catch((e) => {
        this.Logout(this, e);
      });
      if (response) await this.getBrand();
      this.name = "";
      this.emitter.emit("showLoader", false);
    },
  },
};
</script>
