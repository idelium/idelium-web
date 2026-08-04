<template>
  <div class="idelium-step-wizard">
    <div class="wizard-summary-card card">
      <div class="card-body">
        <div class="wizard-summary-grid">
          <div class="wizard-field wizard-field--wide">
            <label class="form-check-label" :for="fieldId('name')">
              {{ language[config.currentLanguage].Steps.wizard.name }}
            </label>
            <input
              class="form-control form-control-sm"
              :id="fieldId('name')"
              :name="fieldId('name')"
              v-model="name"
            />
          </div>
          <label class="wizard-toggle" :for="fieldId('failed-exit')">
            <font-awesome-icon icon="door-open" aria-hidden="true" />
            <span>
              {{ language[config.currentLanguage].Steps.wizard.failedExit }}
            </span>
            <input
              type="checkbox"
              class="form-check-input"
              :id="fieldId('failed-exit')"
              :name="fieldId('failed-exit')"
              v-model="failedExit"
            />
          </label>
          <label class="wizard-toggle" :for="fieldId('attach-screenshot')">
            <font-awesome-icon icon="camera" aria-hidden="true" />
            <span>
              {{
                language[config.currentLanguage].Steps.wizard.attachScreenshot
              }}
            </span>
            <input
              type="checkbox"
              class="form-check-input"
              :id="fieldId('attach-screenshot')"
              :name="fieldId('attach-screenshot')"
              v-model="attachScreenshot"
            />
          </label>
          <button
            type="button"
            class="btn btn-success btn-sm wizard-plugin-button"
            v-on:click="listPlugin()"
            :title="language[config.currentLanguage].Actions.refresh"
          >
            <font-awesome-icon
              icon="plus"
              class="idelium-action-icon idelium-action-icon--refresh"
              aria-hidden="true"
            />
            {{ language[config.currentLanguage].Steps.wizard.addStep }}
          </button>
        </div>
      </div>
    </div>
    <div class="row wizard-builder-row">
      <div class="col">
        <div :class="displayCard">
          <div class="card wizard-builder-card" :style="'min-height:' + minheight">
            <div class="card-body">
              <h5 class="card-title wizard-section-title">
                {{
                  language[config.currentLanguage].Steps.wizard.typeStepTitle
                }}
              </h5>
              <div class="row wizard-builder-grid">
                <div class="col-sm-8 wizard-form-column">
                  <div class="row wizard-toolbar-row">
                    <div class="col-sm-3">
                      <select
                        class="form-select form-select-sm form-control"
                        v-model="typeOfWrapperSelected"
                        :disabled="isSelectWrapperDisabled"
                      >
                        <option
                          v-for="item in arrayTypeOfWrapper"
                          v-bind:key="item"
                          :value="item.value"
                        >
                          {{ item.text }}
                        </option>
                      </select>
                    </div>
                    <div class="col">
                      <v-select
                        :options="stepsType"
                        v-model="stepTypeSelected"
                        class="costum idelium-step-type-select"
                        :get-option-label="stepOptionLabel"
                      >
                        <template #option="option">
                          <div
                            class="step-option-group"
                            v-if="showStepOptionGroup(option)"
                          >
                            {{ stepOptionGroupLabel(option) }}
                          </div>
                          <div class="step-option-row">
                            <span class="step-option-label">
                              {{ stepOptionLabel(option) }}
                            </span>
                            <span class="step-option-technical">
                              {{ option.name }}
                            </span>
                          </div>
                        </template>
                        <template #selected-option="option">
                          <span class="step-option-label">
                            {{ stepOptionLabel(option) }}
                          </span>
                        </template>
                      </v-select>
                    </div>
                    <div class="col-sm-auto wizard-action-group">
                      <button
                        type="button"
                        class="btn btn-success btn-sm idelium-icon-button"
                        v-on:click="addEditTypeStep(true)"
                        :disabled="isBtnAddStepTypeDisabled"
                        :title="
                          language[config.currentLanguage].Steps.wizard.step
                            .addStepType
                        "
                      >
                        <font-awesome-icon
                          icon="plus"
                          class="idelium-action-icon idelium-action-icon--duplicate"
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        type="button"
                        class="btn btn-warning btn-sm idelium-icon-button"
                        :class="showBtnEditTestType"
                        v-on:click="addEditTypeStep(false)"
                        :disabled="isBtnAddStepTypeDisabled"
                        :title="
                          language[config.currentLanguage].Steps.wizard.step
                            .editStepType
                        "
                      >
                        <font-awesome-icon
                          icon="check-circle"
                          class="idelium-action-icon idelium-action-icon--save"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                  <div class="wizard-fields-panel" v-if="stepTypeSelected != null">
                    <div class="wizard-field">
                      <label class="form-check-label" :for="fieldId('note')">
                        {{
                          language[config.currentLanguage].Steps.wizard.step
                            .note
                        }}
                      </label>
                      <input
                        class="form-control form-control-sm"
                        :id="fieldId('note')"
                        :name="fieldId('note')"
                        :state="isNoteOk"
                        v-model="note"
                      />
                    </div>
                    <div
                      class="catalog-compatibility-note"
                      v-if="stepCompatibilityNote().length > 0"
                    >
                      <strong>
                        {{
                          language[config.currentLanguage].Steps.catalog
                            .compatibilityTitle
                        }}:
                      </strong>
                      {{ stepCompatibilityNote() }}
                    </div>
                    <div class="fieldMaker">
                      <div
                        v-for="(syntax, index) in arraySyntax"
                        v-bind:key="index"
                        class="wizard-field"
                      >
                        <label
                          class="form-check-label"
                          :for="fieldId('syntax-' + index)"
                        >
                          {{ syntaxLabel(syntax) }}
                        </label>
                        <input
                          class="form-control form-control-sm"
                          v-if="
                            syntax.type == 'string' || syntax.type == 'integer'
                          "
                          :id="fieldId('syntax-' + index)"
                          :name="fieldId('syntax-' + index)"
                          :state="stateInput[index]"
                          :placeholder="syntaxPlaceholder(syntax)"
                          @input="checkInput(syntax.type, index)"
                          v-model="responseTypeSelect[index]"
                        />
                        <select
                          class="form-select form-select-sm form-control"
                          :id="fieldId('syntax-' + index)"
                          :name="fieldId('syntax-' + index)"
                          v-model="responseTypeSelect[index]"
                          v-if="syntax.type == 'options'"
                        >
                          <option
                            v-for="item in syntax.options"
                            v-bind:key="item"
                            :value="item"
                          >
                            {{ optionLabel(syntax, item) }}
                          </option>
                        </select>
                        <json-editor
                          v-if="syntax.type == 'json'"
                          :ref="'editor_' + index"
                          class="wizard-json-field"
                          :onChange="changeJson"
                          :options="options"
                          :json="responseTypeSelect[index]"
                          :refName="index"
                        />
                        <div
                          class="catalog-field-hint"
                          v-if="syntaxHint(syntax).length > 0"
                        >
                          {{ syntaxHint(syntax) }}
                        </div>
                        <file-upload
                          v-if="syntax.type == 'postman_collection'"
                          ref="upload"
                          v-model="files"
                          class="upload"
                          :extensions="extensions"
                          :accept="accept"
                          @input-filter="inputFilter"
                          :drop="true"
                          :multiple="true"
                        >
                          <div class="upload-text">
                            <div>
                              {{
                                language[config.currentLanguage].Steps.wizard
                                  .uploadPostmanCollection
                              }}
                            </div>
                            <div>
                              {{
                                language[config.currentLanguage].Steps.wizard
                                  .uploadPostmanEnvironment
                              }}
                              <span v-if="showOverriteLabel == true">
                                {{
                                  language[config.currentLanguage].Steps.wizard
                                    .uploadPostmanEnvironmentOverrite
                                }}</span
                              >
                            </div>
                          </div>
                          <div class="upload-text error">
                            {{ errortext }}
                          </div>
                        </file-upload>
                      </div>
                    </div>
                  </div>
                  <div class="wizard-empty-state" v-else>
                    {{
                      language[config.currentLanguage].Steps.wizard
                        .emptyActionState
                    }}
                  </div>
                </div>
                <div class="col wizard-list-column">
                  <div class="card wizard-step-list-card" :style="'min-height:' + minheight">
                    <div class="card-body">
                      <div class="wizard-manage-header">
                        <div>
                          <h5 class="card-title wizard-section-title">
                            {{
                              language[config.currentLanguage].Steps.wizard
                                .typeStepOrderTitle
                            }}
                          </h5>
                          <p class="wizard-manage-description">
                            {{
                              language[config.currentLanguage].Steps.wizard
                                .typeStepOrderDescription
                            }}
                          </p>
                        </div>
                        <span class="wizard-step-count">
                          {{ arrayStepTypeToAdd.length }}
                        </span>
                      </div>
                      <div class="draggableBlock">
                        <draggable
                          v-model="arrayStepTypeToAdd"
                          item-key="__key"
                        >
                          <template #item="{ element, index }">
                            <div
                              :class="managedStepClass(element)"
                              :key="element.__key"
                              :aria-current="
                                isManagedStepSelected(element) ? 'step' : null
                              "
                              v-on:click="editStepType(element)"
                            >
                              <span class="wizard-step-item-index">
                                {{ index + 1 }}
                              </span>
                              <span class="wizard-step-item-copy">
                                <span class="wizard-step-item-title">
                                  {{ element.note }}
                                </span>
                                <span class="wizard-step-item-meta">
                                  {{ element.stepType }}
                                </span>
                              </span>
                              <span
                                v-if="isManagedStepSelected(element)"
                                class="wizard-selected-badge"
                              >
                                {{
                                  language[config.currentLanguage].Steps.wizard
                                    .selectedAction
                                }}
                              </span>
                              <button
                                type="button"
                                class="step-delete-button"
                                v-on:click.stop="deleteStepType(index)"
                                :aria-label="'Delete step type ' + element.note"
                                :title="
                                  language[config.currentLanguage].Actions
                                    .remove
                                "
                              >
                                <font-awesome-icon
                                  icon="times-circle"
                                  class="deleteIcon idelium-action-icon--remove"
                                />
                              </button>
                            </div>
                          </template>
                        </draggable>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.idelium-step-wizard {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
.wizard-summary-card,
.wizard-builder-card,
.wizard-step-list-card {
  background: var(--idelium-surface-panel, rgba(31, 34, 47, 0.92));
  border: 1px solid var(--idelium-border, rgba(255, 255, 255, 0.12));
  border-radius: 1rem;
  box-shadow: none;
}
.wizard-summary-card .card-body,
.wizard-builder-card > .card-body,
.wizard-step-list-card .card-body {
  padding: 0.85rem;
}
.wizard-summary-grid {
  align-items: end;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(16rem, 1fr) repeat(2, minmax(9rem, auto)) auto;
}
.wizard-builder-row {
  margin-top: 0;
}
.wizard-builder-grid {
  --bs-gutter-x: 0.75rem;
}
.wizard-toolbar-row {
  --bs-gutter-x: 0.5rem;
  align-items: center;
}
.wizard-field {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  min-width: 0;
}
.wizard-field--wide {
  min-width: 18rem;
}
.wizard-fields-panel {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-top: 0.75rem;
}
.wizard-toggle {
  align-items: center;
  background: var(--idelium-surface-subtle, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--idelium-border, rgba(255, 255, 255, 0.12));
  border-radius: 0.75rem;
  color: var(--idelium-text, #f8fafc);
  display: grid;
  gap: 0.45rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
  margin: 0;
  min-height: 2.35rem;
  padding: 0.35rem 0.65rem;
}
.wizard-toggle svg {
  color: var(--idelium-primary, #ff6b1a);
  font-size: 0.85rem;
}
.wizard-toggle span {
  font-size: 0.63rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  line-height: 1.1;
  text-transform: uppercase;
}
.wizard-plugin-button {
  min-height: 2.35rem;
  white-space: nowrap;
}
.wizard-section-title {
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  margin-bottom: 0.2rem;
  text-transform: uppercase;
}
.wizard-manage-header {
  align-items: flex-start;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.wizard-manage-description {
  color: var(--idelium-text-muted, #b9bdc8);
  font-size: 0.68rem;
  letter-spacing: 0.07em;
  line-height: 1.35;
  margin: 0;
}
.wizard-step-count,
.wizard-selected-badge {
  align-items: center;
  background: rgba(255, 107, 26, 0.14);
  border: 1px solid rgba(255, 107, 26, 0.55);
  border-radius: 999px;
  color: var(--idelium-primary, #ff6b1a);
  display: inline-flex;
  font-size: 0.62rem;
  font-weight: 900;
  justify-content: center;
  letter-spacing: 0.12em;
  min-height: 1.5rem;
  min-width: 1.5rem;
  padding: 0.2rem 0.5rem;
  text-transform: uppercase;
}
.wizard-action-group {
  display: flex;
  gap: 0.4rem;
}
.wizard-action-group .btn,
.idelium-icon-button {
  align-items: center;
  display: inline-flex;
  justify-content: center;
  min-height: 2rem;
  min-width: 2rem;
  padding: 0.35rem 0.55rem;
}
.wizard-empty-state {
  align-items: center;
  border: 1px dashed var(--idelium-border, rgba(255, 255, 255, 0.14));
  border-radius: 0.85rem;
  color: var(--idelium-text-muted, #b9bdc8);
  display: flex;
  font-size: 0.72rem;
  justify-content: center;
  letter-spacing: 0.08em;
  margin-top: 0.75rem;
  min-height: 8rem;
  padding: 1rem;
  text-align: center;
}
.wizard-json-field {
  height: 14rem;
  width: 100%;
}
.idelium-step-wizard :deep(.form-control),
.idelium-step-wizard :deep(.form-select),
.idelium-step-wizard :deep(.vs__dropdown-toggle) {
  min-height: 2.25rem;
}
.idelium-step-wizard :deep(.vs__dropdown-toggle) {
  border-radius: 0.75rem;
}
.upload {
  border-style: dashed;
  border-color: white;
  text-align: center;
  height: 9rem;
  width: 99%;
  position: relative;
}
.uploadLoaded {
  border-style: dashed;
  border-color: green;
  text-align: center;
  height: 9rem;
  width: 99%;
  position: relative;
}
.upload-text {
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: 0.85rem;
  width: 100%;
}
.upload-text-environment {
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: 0.85rem;
  width: 100%;
}

.error {
  color: orangered;
  top: 70% !important;
  font-size: 1rem;
  text-transform: uppercase;
}

.fieldMaker {
  display: grid;
  gap: 0.65rem;
  max-height: 17rem;
  overflow: auto;
  padding-right: 0.25rem;
  width: 100%;
}
.catalog-compatibility-note,
.catalog-field-hint {
  color: var(--idelium-text-muted, #b9bdc8);
  font-size: 0.75rem;
  margin-top: 0.35rem;
}
.catalog-compatibility-note {
  background: rgba(33, 150, 243, 0.08);
  border: 1px solid rgba(33, 150, 243, 0.22);
  border-radius: 0.5rem;
  padding: 0.5rem 0.65rem;
}
.step-option-group {
  color: var(--idelium-primary, #ff6b1a);
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  margin: 0.25rem 0 0.4rem;
  text-transform: uppercase;
}
.step-option-row {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.step-option-label {
  color: #f8fafc;
  font-weight: 700;
}
.step-option-technical {
  color: var(--idelium-text-muted, #b9bdc8);
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
}
.form-check-label {
  font-size: 10px !important;
}
.iconClass {
  font-size: 10px !important;
}
.hide-element {
  opacity: 0;
}
.draggableBlock {
  min-width: 100%;
  max-height: 19rem;
  overflow: auto;
  overflow-x: hidden;
}
.list-group-item {
  align-items: center;
  background: var(--idelium-surface-subtle, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--idelium-border, rgba(255, 255, 255, 0.12));
  border-radius: 0.75rem;
  color: var(--idelium-text, #f8fafc);
  cursor: pointer;
  display: grid;
  font-size: 0.68rem;
  font-weight: 800;
  gap: 0.65rem;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  letter-spacing: 0.08em;
  margin-bottom: 0.45rem;
  max-width: 100%;
  min-width: 100%;
  padding: 0.55rem 2rem 0.55rem 0.75rem;
  text-transform: uppercase;
}
.list-group-item.is-selected {
  background:
    linear-gradient(90deg, rgba(255, 107, 26, 0.2), rgba(255, 107, 26, 0.04)),
    var(--idelium-surface-subtle, rgba(255, 255, 255, 0.04));
  border-color: rgba(255, 107, 26, 0.78);
  box-shadow:
    inset 0.25rem 0 0 var(--idelium-primary, #ff6b1a),
    0 0.8rem 1.8rem rgba(255, 107, 26, 0.14);
}
.wizard-step-item-index {
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 0.5rem;
  color: var(--idelium-text-muted, #b9bdc8);
  display: inline-flex;
  height: 1.55rem;
  justify-content: center;
  min-width: 1.55rem;
}
.list-group-item.is-selected .wizard-step-item-index {
  background: var(--idelium-primary, #ff6b1a);
  color: #111827;
}
.wizard-step-item-copy {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
  min-width: 0;
}
.wizard-step-item-title,
.wizard-step-item-meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wizard-step-item-meta {
  color: var(--idelium-text-muted, #b9bdc8);
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  text-transform: none;
}
.wizard-selected-badge {
  background: var(--idelium-primary, #ff6b1a);
  border-color: var(--idelium-primary, #ff6b1a);
  color: #111827;
}
.deleteIcon {
  position: absolute !important;
  color: red !important;
  font-size: 12px;
  margin-top: 0;
  margin-bottom: 10px;
  right: 0.65rem !important;
  top: 50%;
  transform: translateY(-50%);
}
.step-delete-button {
  background: transparent;
  border: 0;
  padding: 0;
}
@media (max-width: 992px) {
  .wizard-summary-grid {
    grid-template-columns: 1fr;
  }
  .wizard-builder-grid,
  .wizard-toolbar-row {
    row-gap: 0.65rem;
  }
}
.fade-in {
  animation: fadeIn ease 1s;
  -webkit-animation: fadeIn ease 1s;
  -moz-animation: fadeIn ease 1s;
  -o-animation: fadeIn ease 1s;
  -ms-animation: fadeIn ease 1s;
}
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-moz-keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-webkit-keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-o-keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-ms-keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.fade-out {
  animation: fadeOut ease 2s;
  -webkit-animation: fadeOut ease 2s;
  -moz-animation: fadeOut ease 2s;
  -o-animation: fadeOut ease 2s;
  -ms-animation: fadeOut ease 2s;
}
@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-moz-keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-webkit-keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-o-keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-ms-keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>

<script>
import apiClient from "@/services/apiClient";
import { getSelectedProjectId } from "@/stores/session";
import { classifyPostmanDocument } from "@/domain/postmanResults";
import {
  STEP_CATALOG_VERSION,
  findCatalogEntry,
  getStepCatalog,
} from "@/domain/stepCatalog";

import JsonEditor from "../../components/JsonEditor.vue";
import FileUpload from "vue-upload-component";
import draggable from "vuedraggable";
import { markRaw } from "vue";

export default {
  name: "WizardTool",
  components: {
    JsonEditor,
    draggable,
    FileUpload,
  },
  props: {
    jsonFromEditor_prop: Object,
    minheight: String,
    idPrefix: {
      type: String,
      default: "step-wizard",
    },
  },
  created() {
    if (localStorage.wrapperSelected)
      this.typeOfWrapperSelected = localStorage.wrapperSelected;
    this.initWrapperArray();
  },
  watch: {
    jsonFromEditor_prop: {
      handler() {
        this.changeJsonEditor();
      },
      deep: true,
      immediate: true,
    },
    stepTypeSelected() {
      if (this.stepTypeSelected == null) return false;
      this.arraySyntax = [];
      this.arraySyntax = this.stepTypeSelected.syntax;
      this.responseTypeSelect = [];
      this.stateInput = [];
      this.note = "";
      for (let i = 0; i < this.arraySyntax.length; i++) {
        this.stateInput.push(false);
        if (this.arraySyntax[i].type == "string") {
          this.responseTypeSelect.push("");
        } else if (this.arraySyntax[i].type == "integer") {
          this.responseTypeSelect.push(1);
        } else if (this.arraySyntax[i].type == "json") {
          this.responseTypeSelect.push({});
        }
      }
    },
    typeOfWrapperSelected() {
      localStorage.wrapperSelected = this.typeOfWrapperSelected;
      this.initWrapperArray();
      if (!this.isHydratingFromEditor) {
        this.arrayStepTypeToAdd = [];
      }
      if (this.typeOfWrapperSelected == "plugin") {
        this.listPlugin();
      }
    },
    textBdd() {
      this.checkPossibleAddType();
      this.buildJson();
    },
    note() {
      if (this.note.length > 0) this.isNoteOk = true;
      else this.isNoteOk = false;
      this.checkPossibleAddType();
      this.buildJson();
    },
    arrayStepTypeToAdd: {
      handler() {
        this.buildJson();
      },
      deep: true,
    },
    name() {
      this.$emit("setStepDescription", this.name);
      this.buildJson();
    },
    $route() {
      if (localStorage.wrapperSelected)
        this.typeOfWrapperSelected = localStorage.wrapperSelected;
    },
  },
  data() {
    return {
      //upload vars
      files: [],
      extensions: "json",
      accept: "application/json",
      errortext: "",

      jsonFromEditor: null,
      name: "",
      textBdd: "",
      failedExit: true,
      attachScreenshot: true,
      displayCard: "hide-element",
      stepsType: [],
      stepTypeSelected: null,
      responseTypeSelect: [],
      isSelectWrapperDisabled: false,
      arrayTypeOfWrapper: [
        { value: "selenium", text: "selenium" },
        { value: "appium", text: "appium" },
        { value: "plugin", text: "plugin" },
        { value: "webservice", text: "webservice" },
        { value: "postman", text: "postman" },
      ],
      typeOfWrapperSelected: "selenium",
      arraySyntax: [],
      stateInput: [],
      arrayPlugins: [],
      jsonObject: {},
      options: {
        mode: "code",
        modes: ["tree", "code"],
      },
      arrayStepTypeToAdd: [],
      note: "",
      isNoteOk: false,
      isBtnAddStepTypeDisabled: true,
      objectJsonToSend: {},
      showBtnEditTestType: "hide-element",
      indexForEdit: -1,
      nextStepKey: 1,
      postmanJson: { environment: null, collection: null },
      showOverriteLabel: false,
      isHydratingFromEditor: false,
    };
  },
  methods: {
    fieldId(name) {
      return this.idPrefix + "-" + name;
    },
    isManagedStepSelected(step) {
      if (step?.__key == null || this.indexForEdit < 0) return false;
      return this.arrayStepTypeToAdd[this.indexForEdit]?.__key === step.__key;
    },
    managedStepClass(step) {
      return [
        "list-group-item",
        "costum",
        "wizard-step-item",
        {
          "is-selected": this.isManagedStepSelected(step),
        },
      ];
    },
    catalogTranslations() {
      return this.language?.[this.config.currentLanguage]?.Steps?.catalog || {};
    },
    stepCompatibilityNote() {
      if (this.stepTypeSelected == null) return "";
      return (
        this.catalogTranslations().steps?.[this.stepTypeSelected.name]?.note ||
        ""
      );
    },
    stepOptionLabel(option) {
      if (option == null) return "";
      return (
        this.catalogTranslations().steps?.[option.name]?.label || option.name
      );
    },
    stepOptionGroup(option) {
      return this.catalogTranslations().steps?.[option.name]?.group || "basic";
    },
    stepOptionGroupLabel(option) {
      const group = this.stepOptionGroup(option);
      return this.catalogTranslations().groups?.[group] || group;
    },
    showStepOptionGroup(option) {
      const index = this.stepsType.findIndex(
        (step) => step.name == option.name,
      );
      if (index <= 0) return index == 0;
      return (
        this.stepOptionGroup(this.stepsType[index - 1]) !=
        this.stepOptionGroup(option)
      );
    },
    syntaxLabel(syntax) {
      return (
        this.catalogTranslations().fields?.[syntax.typeName]?.label ||
        syntax.typeName
      );
    },
    syntaxPlaceholder(syntax) {
      return (
        this.catalogTranslations().fields?.[syntax.typeName]?.placeholder || ""
      );
    },
    syntaxHint(syntax) {
      return this.catalogTranslations().fields?.[syntax.typeName]?.hint || "";
    },
    optionLabel(syntax, option) {
      return (
        this.catalogTranslations().options?.[syntax.typeName]?.[option] ||
        option
      );
    },
    async inputFilter(newFile) {
      this.errortext = "";
      var fileExt = newFile.name.split(".").pop();
      if (fileExt != "json") {
        this.errortext =
          this.language[
            this.config.currentLanguage
          ].Plugins.importPlugin.extensionIsWrong;
        return false;
      }
      try {
        const postman = classifyPostmanDocument(await newFile.file.text());
        if (postman.type === "environment") {
          this.postmanJson.environment = markRaw(postman.document);
          this.showOverriteLabel = true;
        } else {
          this.postmanJson.collection = markRaw(postman.document);
          this.note = postman.document.info.name;
          this.addEditTypeStep(true, this.postmanJson);
          this.files = [];
        }
      } catch {
        this.errortext =
          this.language[
            this.config.currentLanguage
          ].Steps.wizard.importPostman.isNotCollectionFile;
        return false;
      }
      return true;
    },
    changeJsonEditor() {
      if (
        this.jsonFromEditor_prop == null ||
        Object.keys(this.jsonFromEditor_prop).length === 0
      ) {
        return false;
      }

      this.isHydratingFromEditor = true;
      try {
        this.jsonFromEditor = JSON.parse(
          JSON.stringify(this.jsonFromEditor_prop),
        );
        if (this.jsonFromEditor.editorType) {
          this.typeOfWrapperSelected = this.jsonFromEditor.editorType;
        }
        this.initWrapperArray();
        this.name = this.jsonFromEditor.name || "";
        this.attachScreenshot = this.jsonFromEditor.attachScreenshot !== false;
        this.failedExit = this.jsonFromEditor.failedExit !== false;
        const steps = Array.isArray(this.jsonFromEditor.steps)
          ? this.jsonFromEditor.steps
          : [];
        this.arrayStepTypeToAdd = steps.map((step) => ({
          ...step,
          __key: step.__key || this.createStepKey(),
        }));
        this.displayCard =
          this.arrayStepTypeToAdd.length > 0 ? "fade-in" : "hide-element";
        if (this.arrayStepTypeToAdd.length > 0) {
          this.$nextTick(() => {
            this.editStepType(this.arrayStepTypeToAdd[0]);
          });
        }
        this.buildJson();
        return true;
      } finally {
        this.$nextTick(() => {
          this.isHydratingFromEditor = false;
        });
      }
    },
    buildJson() {
      this.buildJson;
      const steps = this.arrayStepTypeToAdd.map((step) => {
        const { __key, ...stepToSend } = step;
        return stepToSend;
      });
      this.objectJsonToSend = {
        name: this.name,
        editorType: this.typeOfWrapperSelected,
        failedExit: this.failedExit,
        attachScreenshot: this.attachScreenshot,
        steps: steps,
      };
      this.$emit("syncJson", this.objectJsonToSend);
    },
    checkPossibleAddType() {
      let checkField = true;
      for (let i = 0; i < this.arraySyntax.length; i++) {
        this.stateInput.push(false);
        if (
          (this.arraySyntax[i].type == "string" &&
            this.responseTypeSelect[i] == "") ||
          (this.arraySyntax[i].type == "integer" &&
            this.stateInput[i] === false)
        ) {
          checkField = false;
        }
      }
      if (this.isNoteOk == true && checkField == true)
        this.isBtnAddStepTypeDisabled = false;
      else this.isBtnAddStepTypeDisabled = true;
    },
    searchFindTypeStep(typeStepName) {
      let found = false;
      const catalogEntry = findCatalogEntry(typeStepName);
      if (catalogEntry != null) {
        this.typeOfWrapperSelected = catalogEntry.runtime;
        this.fillStepsFileArray(this.typeOfWrapperSelected);
        return true;
      }
      let index = this.arrayPlugins.findIndex((x) => x.name === typeStepName);
      if (index != -1) {
        this.typeOfWrapperSelected = "plugin";
        this.fillStepsFileArray(this.typeOfWrapperSelected);
        found = true;
      }

      return found;
    },
    editStepType(typeStep, repeat = false) {
      let index = this.arrayStepTypeToAdd.findIndex(
        (x) => x.__key === typeStep.__key,
      );

      let found = false;
      if (repeat == false) found = this.searchFindTypeStep(typeStep.stepType);
      let objectFound = this.stepsType.find((d) => d.name == typeStep.stepType);
      this.indexForEdit = index;
      this.stepTypeSelected = objectFound;
      setTimeout(
        function () {
          this.fillField(typeStep, found);
          this.showBtnEditTestType = "fade-in";
        }.bind(this),
        100,
      );
    },
    fillField(typeStep, found) {
      let arrayKey = Object.keys(typeStep);
      this.responseTypeSelect = [];
      this.note = typeStep.note;
      let objectFound = this.stepsType.find((d) => d.name == typeStep.stepType);
      if (objectFound == null) {
        return false;
      }
      for (let i = 0; i < objectFound.syntax.length; i++) {
        this.responseTypeSelect.push(null);
      }
      for (const element of arrayKey) {
        for (let i = 0; i < objectFound.syntax.length; i++) {
          if (objectFound.syntax[i].typeName == element) {
            this.responseTypeSelect[i] = typeStep[element];
            this.checkInput(objectFound.syntax[i].type, i);
          }
        }
      }

      if (found == true) {
        setTimeout(
          function () {
            this.editStepType(typeStep, true);
          }.bind(this),
          100,
        );
      }
    },
    addEditTypeStep(isAdd = true, upload = null) {
      let objectToStore = {};
      objectToStore["stepType"] = this.stepTypeSelected.name;
      objectToStore["runtime"] = this.typeOfWrapperSelected;
      objectToStore["catalogVersion"] = STEP_CATALOG_VERSION;
      for (let i = 0; i < this.arraySyntax.length; i++) {
        if (
          this.arraySyntax[i].type == "string" ||
          this.arraySyntax[i].type == "options" ||
          this.arraySyntax[i].type == "json"
        ) {
          objectToStore[this.arraySyntax[i].typeName] =
            this.responseTypeSelect[i];
        } else if (this.arraySyntax[i].type == "integer") {
          objectToStore[this.arraySyntax[i].typeName] = parseInt(
            this.responseTypeSelect[i],
          );
        } else if (
          this.arraySyntax[i].type == "postman_collection" ||
          this.arraySyntax[i].type == "postman_environment"
        ) {
          objectToStore[this.arraySyntax[i].typeName] = markRaw({
            environment: upload?.environment || null,
            collection: upload?.collection || null,
          });
          this.postmanJson = { environment: null, collection: null };
          this.showOverriteLabel = false;
        }
      }
      objectToStore["note"] = this.note;
      if (isAdd == true) {
        objectToStore["__key"] = this.createStepKey();
        this.arrayStepTypeToAdd.push(objectToStore);
      } else {
        objectToStore["__key"] =
          this.arrayStepTypeToAdd[this.indexForEdit].__key;
        this.arrayStepTypeToAdd[this.indexForEdit] = objectToStore;
        this.showBtnEditTestType = "hide-element";
      }
      this.initWrapperArray();
      this.buildJson();
    },
    createStepKey() {
      const key = "step-" + Date.now() + "-" + this.nextStepKey;
      this.nextStepKey += 1;
      return key;
    },
    deleteStepType(index) {
      this.arrayStepTypeToAdd.splice(index, 1);
      this.buildJson();
    },
    initWrapperArray() {
      this.arraySyntax = [];
      this.responseTypeSelect = [];
      this.stepTypeSelected = null;
      this.textBdd = "";
      this.note = "";
      this.isBtnAddStepTypeDisabled = true;
      this.fillStepsFileArray(this.typeOfWrapperSelected);
    },
    fillStepsFileArray(wrapperName) {
      this.stepsType = [];
      if (wrapperName == "plugin") {
        this.stepsType = this.arrayPlugins;
      } else {
        for (const element of getStepCatalog(wrapperName))
          this.stepsType.push(element);
      }
    },
    isNumber(n) {
      return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
    },
    checkInput(typeStep, index) {
      if (typeStep == "integer") {
        this.stateInput[index] = this.isNumber(this.responseTypeSelect[index]);
      }
      if (typeStep == "string") {
        if (this.responseTypeSelect[index].length == "")
          this.stateInput[index] = false;
        else this.stateInput[index] = true;
      }
      this.checkPossibleAddType();
    },
    changeJson(objectReturn, refName) {
      this.responseTypeSelect[parseInt(refName)] = objectReturn;
    },
    listPlugin() {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.plugins +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.arrayPlugins = [];
          for (const element of response.data) {
            let objectToPush = element;
            objectToPush["syntax"] = [
              {
                typeName: "params",
                type: "json",
              },
            ];
            this.arrayPlugins.push(objectToPush);
          }
          this.initWrapperArray();
          this.displayCard = "fade-in";
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
  },
};
</script>
