<template>
  <div>
    <div
      class="modal fade"
      ref="mymodal"
      id="projectModal"
      tabindex="-1"
      aria-labelledby="projectModalLabel"
      aria-hidden="true"
      :no-close-on-esc="arrayProjects.length == 0"
      :hide-header-close="arrayProjects.length == 0"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="projectModalLabel">
              <font-awesome-icon icon="vial" class="iconClass" />
              {{ titleModal }}
            </h5>
          </div>
          <div class="modal-body">
            <div class="project-form-intro">
              {{ language[config.currentLanguage].Projects.formHelp }}
            </div>
            <div class="mb-3">
              <label class="form-label" for="project-name">
                {{ language[config.currentLanguage].Projects.project }}
              </label>
              <input
                class="form-control"
                id="project-name"
                :disabled="isModifyType"
                :placeholder="
                  language[config.currentLanguage].Projects.placeholderName
                "
                v-model.trim="name"
                :class="{ 'is-invalid': nameCheck == false }"
                aria-describedby="project-name-feedback"
              />
              <div
                class="invalid-feedback d-block"
                id="project-name-feedback"
                v-if="nameCheck == false"
              >
                {{
                  language[config.currentLanguage].Projects.projectIsDuplicated
                }}
              </div>
              <div class="form-text" v-else>
                {{ language[config.currentLanguage].Projects.projectNameHelp }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label" for="project-description">
                {{ language[config.currentLanguage].Projects.description }}
              </label>
              <textarea
                class="form-control"
                id="project-description"
                :placeholder="
                  language[config.currentLanguage].Projects
                    .placeholderDescription
                "
                v-model.trim="projectDescription"
                rows="4"
              />
              <div class="form-text">
                {{
                  language[config.currentLanguage].Projects
                    .projectDescriptionHelp
                }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              v-if="arrayProjects.length > 0"
              @click="closeModal()"
            >
              {{ language[config.currentLanguage].Projects.btnCancel }}
            </button>
            <button
              type="button"
              class="btn btn-warning btn-sm"
              @click="sendData()"
              :disabled="disableButton"
            >
              {{ labelButtonAction }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from "bootstrap";
import { hideModalSafely } from "@/shared/bootstrapModal";
export default {
  props: ["arrayProjects"],
  emits: ["updateData"],

  data() {
    return {
      name: "",
      projectDescription: "",
      labelButtonAction: "",
      disableButton: true,
      nameCheck: true,
      isModifyType: true,
      titleModal:
        this.language[this.config.currentLanguage].Projects.titleAddModal,
      type: "",
      dataProject: {
        id: null,
        name: "",
        description: "",
      },
      modalElem: null,
    };
  },
  mounted() {
    this.modalElem = new Modal(document.getElementById("projectModal"));
  },
  watch: {
    projectDescription() {
      this.activateButton();
    },
    name() {
      this.activateButton();
    },
  },
  methods: {
    activateButton() {
      if (this.name.length == 0 || this.projectDescription.length == 0) {
        this.disableButton = true;
      } else {
        this.disableButton = false;
      }
      let find = this.arrayProjects.find(({ name }) => name === this.name);
      if (this.type == "new") {
        if (find) {
          this.disableButton = true;
          this.nameCheck = false;
        } else {
          this.nameCheck = true;
        }
      }
    },
    showModal(dataProject, type) {
      this.type = type;
      this.projectDescription = "";
      this.nameCheck = true;
      this.disableButton = true;

      if (type == "modify") {
        this.isModifyType = true;
        this.dataProject = dataProject;
        this.titleModal =
          this.language[this.config.currentLanguage].Projects.titleModifyModal;
        this.name = this.dataProject.name;
        this.projectDescription = this.dataProject.description;
        this.labelButtonAction =
          this.language[
            this.config.currentLanguage
          ].Projects.btnModalModifyProject;
      } else {
        this.isModifyType = false;
        if (this.arrayProjects.length == 0)
          this.titleModal =
            this.language[
              this.config.currentLanguage
            ].Projects.titleFirstAddModal;
        else
          this.titleModal =
            this.language[this.config.currentLanguage].Projects.titleAddModal;
        this.name = "";
        this.dataProject = {
          id: null,
          name: "",
        };
        this.labelButtonAction =
          this.language[this.config.currentLanguage].Projects.btnAddProject;
      }
      this.activateButton();
      this.modalElem.show();
    },
    sendData() {
      let sendData = {
        name: this.name,
        description: this.projectDescription,
        id: this.dataProject.id,
        type: this.type,
      };
      this.$emit("updateData", sendData);
      hideModalSafely(this.$refs.mymodal, this.modalElem);
    },
    closeModal() {
      hideModalSafely(this.$refs.mymodal, this.modalElem);
    },
    hideModal() {
      if (this.arrayProjects.length == 0) {
        setTimeout(
          function () {
            this.modalElem.show();
          }.bind(this),
          100,
        );
      }
    },
    toggleModal() {
      // We pass the ID of the button that we want to return focus to
      // when the modal has hidden
      this.modalElem.toggle("#toggle-btn");
    },
  },
};
</script>
