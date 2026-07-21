<template>
  <div class="costum testcycles-page">
    <section class="card testcycles-setup-card">
      <div class="card-header testcycles-tabs-header">
        <ul
          class="nav nav-tabs card-header-tabs testcycles-tabs"
          id="nav-tab"
          role="tablist"
        >
          <li class="nav-item" role="presentation">
            <button
              :class="[tabButtonClass('modify'), 'testcycles-tab']"
              id="nav-tabTitleModify-tab"
              type="button"
              role="tab"
              aria-controls="nav-tabTitleModify"
              :aria-selected="isActiveTab('modify')"
              ref="home"
              :disabled="isTestCycleModifyTabDisabled"
              v-on:click="
                openTab('modify');
                getTestCycles(1);
              "
            >
              {{ language[config.currentLanguage].TestCycles.tabTitleModify }}
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              :class="[tabButtonClass('new'), 'testcycles-tab']"
              id="nav-tabTitleNewTestCycle-tab"
              type="button"
              role="tab"
              ref="tabTitleNewTestCycle"
              aria-controls="nav-tabTitleNewTestCycle"
              :aria-selected="isActiveTab('new')"
              v-on:click="openTab('new')"
            >
              {{
                language[config.currentLanguage].TestCycles.tabTitleNewTestCycle
              }}
            </button>
          </li>
        </ul>
      </div>

      <div class="tab-content testcycles-tab-content" id="pills-tabContent">
        <div
          :class="tabPaneClass('modify')"
          id="nav-tabTitleModify"
          role="tabpanel"
          aria-labelledby="tabTitleModify-tab"
        >
          <div v-if="arrayTestCycles.length > 0" class="testcycles-form-grid">
            <div class="testcycles-field">
              <v-select
                label="name"
                :options="arrayTestCycles"
                v-model="testCycleSelected"
                class="costum"
              ></v-select>
            </div>
            <input
              class="form-control testcycles-field"
              v-if="testCycleSelected != null"
              :placeholder="
                language[config.currentLanguage].TestCycles
                  .placeholderDescriptionTestCycle
              "
              v-model="modifyDescriptionTestCycle"
              :disabled="testCycleSelected == null"
            />
            <button
              type="button"
              v-if="testCycleSelected != null"
              class="btn btn-success testcycles-primary-action"
              size="sm"
              :disabled="testCycleSelected == null"
              v-on:click="modifyTestCycle()"
            >
              {{
                language[config.currentLanguage].TestCycles.btnModifyTestCycle
              }}
            </button>
          </div>

          <div class="card testcycles-command-card" v-if="commandLine">
            <div class="testcycles-command-copy">
              <span class="testcycles-section-title">
                {{
                  language[config.currentLanguage].TestCycles.commandLineInfo
                }}
              </span>
              <button
                type="button"
                class="btn btn-link testcycles-copy-button"
                v-on:click="copyClipboard(commandLine)"
                :title="language[config.currentLanguage].Actions.copy"
              >
                <font-awesome-icon
                  icon="copy"
                  class="idelium-action-icon--copy"
                  alt="copy clipboard"
                />
              </button>
            </div>
            <code class="commandLine">{{ commandLine }}</code>
          </div>
        </div>

        <div
          :class="tabPaneClass('new')"
          id="nav-tabTitleNewTestCycle"
          role="tabpanel"
          aria-labelledby="tabTitleNewTestCycle-tab"
        >
          <div class="testcycles-form-grid">
            <input
              class="form-control testcycles-field"
              :placeholder="
                language[config.currentLanguage].TestCycles
                  .placeholderNameTestCycle
              "
              v-model="newNameTestCycle"
              :disabled="disableNameTestCycle"
            />
            <input
              class="form-control testcycles-field"
              :placeholder="
                language[config.currentLanguage].TestCycles
                  .placeholderDescriptionTestCycle
              "
              v-model="newDescriptionTestCycle"
              :disabled="disableTestCycleDescription"
            />
            <button
              type="button"
              class="btn btn-success testcycles-primary-action"
              size="sm"
              :disabled="disableBtnCreateTestCycle"
              v-on:click="saveTestCycle()"
            >
              {{
                language[config.currentLanguage].TestCycles.btnCreateTestCycle
              }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="testcycles-workspace">
      <article class="card testcycles-panel">
        <div class="testcycles-panel-header">
          <span class="testcycles-section-title">
            {{ language[config.currentLanguage].TestCycles.tests }}
          </span>
          <span class="testcycles-counter">{{ arrayTests.length }}</span>
        </div>
        <input
          class="form-control testcycles-search"
          type="text"
          v-model.lazy="testFilter"
          :placeholder="
            language[config.currentLanguage].TestCycles.placeholderFilterTest
          "
        />
        <draggable
          class="dragArea list-group testcycles-list"
          :list="arrayTests"
          :group="{ name: 'people', pull: 'clone', put: false }"
          @change="log"
          item-key="id"
        >
          <template #item="{ element }">
            <div class="list-group-item testcycles-test-item">
              <span>{{ element.name }}</span>
            </div>
          </template>
        </draggable>
      </article>

      <article class="card testcycles-panel testcycles-drop-panel">
        <div class="testcycles-panel-header">
          <span class="testcycles-section-title">
            {{ language[config.currentLanguage].TestCycles.testsToDo }}
          </span>
          <span class="testcycles-counter">{{
            arrayTestsSelectedDragged.length
          }}</span>
        </div>
        <draggable
          class="dragArea list-group testcycles-list testcycles-selected-list"
          :class="{ empty: arrayTestsSelectedDragged.length === 0 }"
          :list="arrayTestsSelectedDragged"
          group="people"
          item-key="id"
          @change="log"
        >
          <template #item="{ element, index }">
            <div class="list-group-item testcycles-test-item selected">
              <span>{{ element.name }}</span>
              <button
                type="button"
                class="testcycles-remove"
                v-on:click="deleteItem(index)"
                :title="language[config.currentLanguage].Actions.remove"
              >
                <font-awesome-icon
                  icon="times-circle"
                  class="iconClass idelium-action-icon--remove"
                />
              </button>
            </div>
          </template>
        </draggable>
      </article>
    </section>
  </div>
</template>
<!--style src="vue-multiselect/dist/vue-multiselect.min.css"></style-->
<style scoped>
.testcycles-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin: 0 auto;
  max-width: 1280px;
  width: 100%;
}

.testcycles-setup-card,
.testcycles-panel {
  overflow: hidden;
}

.testcycles-tabs-header {
  background: rgba(255, 255, 255, 0.035);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.95rem 1rem 0;
}

.testcycles-tabs {
  border-bottom: 0;
  gap: 0.25rem;
}

.testcycles-tab {
  min-width: 11rem;
}

.testcycles-tab-content {
  padding: 1rem;
}

.testcycles-form-grid {
  align-items: center;
  display: grid;
  gap: 0.8rem;
  grid-template-columns: minmax(16rem, 1fr) minmax(16rem, 1fr) auto;
}

.testcycles-field {
  margin: 0;
  text-transform: uppercase;
  width: 100%;
}

.testcycles-primary-action {
  justify-self: end;
  min-width: 9rem;
}

.testcycles-command-card {
  background: rgba(10, 12, 18, 0.52);
  border-radius: 0.9rem;
  box-shadow: none;
  margin-top: 1rem;
  padding: 1rem;
}

.testcycles-command-copy,
.testcycles-panel-header,
.testcycles-test-item {
  align-items: center;
  display: flex;
}

.testcycles-command-copy,
.testcycles-panel-header {
  justify-content: space-between;
}

.testcycles-copy-button {
  color: #b7f7df !important;
  min-width: auto;
  padding: 0.2rem 0.4rem !important;
}

.testcycles-section-title {
  color: #f8fafc;
  font-size: 0.72rem !important;
  font-weight: 800;
  letter-spacing: 0.14rem;
  text-transform: uppercase;
}

.testcycles-workspace {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: minmax(0, 1fr) minmax(22rem, 0.8fr);
}

.testcycles-panel {
  display: flex;
  flex-direction: column;
  min-height: 62vh;
  padding: 1rem;
}

.testcycles-panel-header {
  margin-bottom: 0.85rem;
}

.testcycles-counter {
  align-items: center;
  background: rgba(255, 122, 24, 0.16);
  border: 1px solid rgba(255, 122, 24, 0.32);
  border-radius: 999px;
  color: #ffd7bd;
  display: inline-flex;
  font-size: 0.72rem !important;
  font-weight: 800;
  justify-content: center;
  min-width: 2rem;
  padding: 0.18rem 0.55rem;
}

.testcycles-search {
  margin-bottom: 0.85rem;
}

.testcycles-list {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 0.55rem;
  max-height: 62vh;
  min-height: 18rem;
  overflow-y: auto;
  padding-right: 0.2rem;
}

.testcycles-selected-list {
  background:
    linear-gradient(180deg, rgba(255, 122, 24, 0.06), transparent),
    rgba(255, 255, 255, 0.025);
  border: 1px dashed rgba(255, 122, 24, 0.45);
  border-radius: 1rem;
  padding: 0.75rem;
}

.testcycles-selected-list.empty {
  min-height: 62vh;
}

.testcycles-test-item {
  background: rgba(255, 255, 255, 0.045) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 0.85rem !important;
  color: #f4f4f5 !important;
  cursor: grab;
  font-weight: 700;
  justify-content: space-between;
  padding: 0.85rem 0.95rem !important;
  text-transform: uppercase;
}

.testcycles-test-item.selected {
  cursor: move;
}

.testcycles-remove {
  align-items: center;
  background: rgba(220, 53, 69, 0.14);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 999px;
  color: #ffb8c1;
  cursor: pointer;
  display: inline-flex;
  height: 1.65rem;
  justify-content: center;
  width: 1.65rem;
}
.commandLine {
  color: #f8fafc;
  display: block;
  font-family:
    "SFMono-Regular", Consolas, "Liberation Mono", monospace !important;
  font-size: 12px !important;
  line-height: 1.7;
  margin-top: 0.75rem;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

@media only screen and (max-width: 980px) {
  .testcycles-form-grid,
  .testcycles-workspace {
    grid-template-columns: 1fr;
  }

  .testcycles-primary-action {
    justify-self: stretch;
  }
}
</style>

<script>
import apiClient from "@/services/apiClient";
import { getSelectedProjectId } from "@/stores/session";
import { buildTestCyclePayload } from "@/domain/workflowPayloads";

import draggable from "vuedraggable";
import copy from "copy-to-clipboard";
import { routableTabs } from "@/shared/routableTabs";

export default {
  name: "TestCyclesComponent",
  components: {
    draggable,
  },
  mixins: [routableTabs("modify", ["modify", "new"])],
  data() {
    return {
      delay: 1000,
      arrayTests: [],
      arrayTestsSelectedDragged: [],
      listOriginalTests: [],
      arrayTestCycles: [],
      testCyclesLoaded: false,
      testCycleSelected: null,
      testFilter: "",
      disableNameTestCycle: true,
      disableTestCycleDescription: true,
      disableBtnCreateTestCycle: true,
      newNameTestCycle: "",
      newDescriptionTestCycle: "",
      modifyDescriptionTestCycle: "",
      commandLine: "",
    };
  },
  created() {
    this.getTests(1);
    if (this.commandLine != "") this.setCommandLine();
    this.emitter.on("refreshTestCycle", (msg) => {
      this.commandLine = "";
      this.testCycleSelected = null;
      if (msg == true) this.getTests(2);
      else this.$forceUpdate();
    });
  },
  watch: {
    testFilter() {
      // Do something with search nameIssue after it debounced
      let filter = this.testFilter;
      this.searchTextTests(filter);
    },
    arrayTestsSelectedDragged() {
      this.disableNameTestCycle = this.arrayTestsSelectedDragged.length == 0;
    },
    newNameTestCycle() {
      this.disableTestCycleDescription = this.newNameTestCycle.length == 0;
    },
    newDescriptionTestCycle() {
      this.disableBtnCreateTestCycle = this.newDescriptionTestCycle.length == 0;
    },
    testCycleSelected() {
      this.getTestCycle();
    },
  },
  computed: {
    isTestCycleModifyTabDisabled() {
      return this.testCyclesLoaded && this.arrayTestCycles.length === 0;
    },
  },
  methods: {
    copyClipboard(text) {
      copy(text);
      this.$wkToast(
        this.language[this.config.currentLanguage].TestCycles.commandLineCopy,
      );
    },
    searchTextTests(filter) {
      this.arrayTests = this.listOriginalTests.filter((d) =>
        d.name.includes(filter),
      );
    },
    getTests(from) {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.tests +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.arrayTests = this.listOriginalTests = response.data;
          this.getTestCycles(2);
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    getTestCycles(from) {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.testcycles +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.arrayTestCycles = [];
          for (let i = 0; i < response.data.length; i++) {
            let objectTc = response.data[i];
            objectTc.name = objectTc.name + "(" + objectTc.id + ")";
            this.arrayTestCycles.push(objectTc);
          }
          this.testCyclesLoaded = true;
          this.redirectEmptyTestCycles();
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    redirectEmptyTestCycles() {
      if (this.isTestCycleModifyTabDisabled && this.isActiveTab("modify")) {
        this.openTab("new");
      }
    },
    setCommandLine() {
      this.commandLine =
        "idelium --idCycle=" +
        this.testCycleSelected.id +
        " --idProject=" +
        getSelectedProjectId() +
        " --environment=<environment name>";
    },
    getTestCycle() {
      if (this.testCycleSelected == null) {
        this.modifyDescriptionTestCycle = "";
        this.arrayTestsSelectedDragged = [];
        return false;
      }
      this.setCommandLine();
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.testcycles +
            "/" +
            getSelectedProjectId() +
            "/" +
            this.testCycleSelected.id,
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.arrayTestsSelectedDragged = JSON.parse(response.data.config);
          this.modifyDescriptionTestCycle = response.data.description;
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    saveTestCycle() {
      this.emitter.emit("showLoader", true);
      apiClient
        .post(
          this.config.serviceBaseUrl + this.config.url.testcycles,
          buildTestCyclePayload({
            name: this.newNameTestCycle,
            description: this.newDescriptionTestCycle,
            tests: this.arrayTestsSelectedDragged,
            projectId: getSelectedProjectId(),
          }),
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.listPlugins = response.data;
          this.arrayTests = this.listOriginalTests;
          this.arrayTestsSelectedDragged = [];
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    modifyTestCycle() {
      this.emitter.emit("showLoader", true);
      apiClient
        .put(
          this.config.serviceBaseUrl +
            this.config.url.testcycles +
            "/" +
            getSelectedProjectId() +
            "/" +
            this.testCycleSelected.id,
          {
            config: JSON.stringify(this.arrayTestsSelectedDragged),
            description: this.modifyDescriptionTestCycle,
          },
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.listPlugins = response.data;
          this.arrayTests = this.listOriginalTests;
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    log: function () {
      this.copyArray();
      this.disableNameTestCycle = this.arrayTestsSelectedDragged.length == 0;
    },
    deleteItem(index) {
      this.arrayTestsSelectedDragged.splice(index, 1);
      this.copyArray();
      this.disableNameTestCycle = this.arrayTestsSelectedDragged.length == 0;
    },
    copyArray() {
      this.arrayTestsSelected = [];
      for (let i = 0; i < this.arrayTestsSelectedDragged.length; i++) {
        this.arrayTestsSelected.push(this.arrayTestsSelectedDragged[i].name);
      }
    },
  },
};
</script>
