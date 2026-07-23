<template>
  <div>
    <div
      class="modal fade"
      ref="mymodal"
      id="myModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              <font-awesome-icon icon="vial" class="iconClass" /> {{ testName }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
              @click="releaseModalFocus"
            ></button>
          </div>
          <div v-if="fullscreen == false">
            <timeline
              ref="timeline"
              :steps="arrayStep"
              :expand-label="language[config.currentLanguage].Actions.expand"
              v-on:showImage="showImage"
            />
            <div class="stepTable">
              <table class="table table-striped costum">
                <thead>
                  <tr>
                    <th scope="col">
                      {{
                        language[config.currentLanguage].TestsPerformed.stepId
                      }}
                    </th>
                    <th scope="col">
                      {{
                        language[config.currentLanguage].TestsPerformed.stepName
                      }}
                    </th>
                    <th scope="col">
                      {{
                        language[config.currentLanguage].TestsPerformed
                          .stepStatus
                      }}
                    </th>
                    <th scope="col">
                      {{
                        language[config.currentLanguage].TestsPerformed
                          .screenshots
                      }}
                    </th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  <template
                    v-for="(step, index) in arrayStep"
                    v-bind:key="index"
                  >
                    <tr>
                      <td>{{ step.id }}</td>
                      <td>
                        {{ step.name }}
                      </td>
                      <td>
                        <button
                          type="button"
                          :class="
                            'btn btn-' + getStepVariant(step) + ' buttonTest'
                          "
                        >
                          {{ getStepStatusText(step) }}
                        </button>
                      </td>
                      <td>
                        <span
                          v-for="screen in safeScreenshots(step)"
                          v-bind:key="screen"
                          v-on:click="fullscreenImage(screen)"
                          style="cursor: pointer"
                        >
                          <img :src="screen" class="img" />
                        </span>
                      </td>
                      <td v-if="step.type == 'postman'">
                        <button
                          type="button"
                          class="btn btn-outline-info buttonTest"
                          v-on:click="showPostmanCollection(index)"
                        >
                          {{
                            postmanLabel(
                              "fullDetails",
                              "Open full Postman details",
                            )
                          }}
                        </button>
                      </td>
                    </tr>
                    <tr
                      v-if="step.type == 'postman'"
                      class="postman-result-row"
                    >
                      <td colspan="6">
                        <section class="postman-result-panel">
                          <div class="postman-result-header">
                            <div>
                              <h6>
                                {{
                                  postmanLabel(
                                    "executionResults",
                                    "Postman execution results",
                                  )
                                }}
                              </h6>
                              <p>
                                {{
                                  postmanLabel(
                                    "executionResultsHelp",
                                    "Review request status, assertions, timing, and response payloads captured by the CLI.",
                                  )
                                }}
                              </p>
                            </div>
                          </div>
                          <PostmanResultTable
                            v-if="postmanResults(step).length > 0"
                            :results="postmanResults(step)"
                            :labels="language[config.currentLanguage].Postman"
                            @show-response="showPostmanResponse"
                          />
                          <div v-else class="postman-empty-state">
                            {{
                              postmanLabel(
                                "emptyResults",
                                "No Postman execution data is available for this step.",
                              )
                            }}
                          </div>
                          <div
                            v-if="postmanResponse != null"
                            class="postman-response-panel"
                          >
                            <div class="postman-response-title">
                              <span>
                                {{
                                  postmanLabel(
                                    "responsePreview",
                                    "Response preview",
                                  )
                                }}
                              </span>
                              <button
                                type="button"
                                class="btn btn-outline-secondary buttonTest"
                                @click="postmanResponse = null"
                              >
                                {{
                                  postmanLabel("hideResponse", "Hide response")
                                }}
                              </button>
                            </div>
                            <pre>{{ postmanResponse }}</pre>
                          </div>
                        </section>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
          <div v-if="fullscreen == true" v-on:click="fullscreenImage(null)">
            <img :src="screenFull" class="imgFull" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.img {
  max-width: 100px;
}
.imgFull {
  max-width: 100%;
}
.buttonTest {
  min-width: 80%;
}
.iconClass {
  font-size: 18px !important;
  margin-right: 5px;
}
.stepTable {
  display: inline-block;
  overflow-y: auto;
  max-height: 50vh;
  min-width: 100%;
}
.postman-result-row td {
  padding: 0;
}
.postman-result-panel {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  margin: 0.75rem;
  padding: 1rem;
  background: rgba(15, 18, 28, 0.72);
}
.postman-result-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}
.postman-result-header h6,
.postman-response-title {
  margin: 0;
  color: #f6f7fb;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.postman-result-header p,
.postman-empty-state {
  margin: 0.35rem 0 0;
  color: rgba(246, 247, 251, 0.72);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
}
.postman-response-panel {
  margin-top: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.24);
  overflow: hidden;
}
.postman-response-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.postman-response-panel pre {
  margin: 0;
  max-height: 22rem;
  padding: 1rem;
  overflow: auto;
  color: #f6f7fb;
  white-space: pre-wrap;
}
</style>

<script>
import timeline from "./timeLine.vue";
import PostmanResultTable from "./PostmanResultTable.vue";
import { Modal } from "bootstrap";
import {
  formatPostmanResponse,
  parsePostmanResults,
} from "@/domain/postmanResults";
export default {
  components: {
    timeline,
    PostmanResultTable,
  },
  created() {},
  data() {
    return {
      testName: "",
      arrayStep: [],
      fullscreen: false,
      screenFull: null,
      postmanCollection: null,
      postmanResponse: null,
      showCollectionWindow: false,
      showMe: true,
    };
  },
  mounted() {
    this.modalElem = new Modal(this.$refs.mymodal);
    this.$refs.mymodal.addEventListener(
      "hide.bs.modal",
      this.releaseModalFocus,
    );
  },
  beforeUnmount() {
    this.$refs.mymodal?.removeEventListener(
      "hide.bs.modal",
      this.releaseModalFocus,
    );
    this.modalElem?.dispose?.();
  },
  methods: {
    releaseModalFocus() {
      const activeElement = document.activeElement;
      if (activeElement && this.$refs.mymodal?.contains(activeElement)) {
        activeElement.blur();
      }
    },
    navigateAfterModalHidden(route) {
      const modalElement = this.$refs.mymodal;
      if (!modalElement || !this.modalElem) {
        this.$router.push(route);
        return;
      }

      this.releaseModalFocus();

      if (!modalElement.classList.contains("show")) {
        this.$router.push(route);
        return;
      }

      const navigate = () => {
        modalElement.removeEventListener("hidden.bs.modal", navigate);
        this.$router.push(route);
      };

      modalElement.addEventListener("hidden.bs.modal", navigate, {
        once: true,
      });
      this.modalElem.hide();
    },
    showPostmanCollection(index) {
      this.navigateAfterModalHidden({
        name: "postman",
        params: {
          ...this.$route.params,
          id: this.arrayStep[index].testDoneId,
        },
      });
    },
    getVariant(status) {
      let variant = "success";
      if (status != 1) {
        variant = "danger";
      }
      return variant;
    },
    getStatusText(status) {
      let variant = "success";
      if (status != 1) {
        variant = "failed";
      }
      return variant;
    },
    isPostmanStepFailed(step) {
      const results = this.postmanResults(step);
      return results.some((result) => result.passed === false);
    },
    getStepVariant(step) {
      if (step?.type === "postman" && this.isPostmanStepFailed(step)) {
        return "danger";
      }
      return this.getVariant(step?.status);
    },
    getStepStatusText(step) {
      if (step?.type === "postman" && this.isPostmanStepFailed(step)) {
        return "failed";
      }
      return this.getStatusText(step?.status);
    },
    postmanLabel(key, fallback) {
      return (
        this.language?.[this.config.currentLanguage]?.Postman?.[key] || fallback
      );
    },
    postmanResults(step) {
      return step?.type === "postman" ? parsePostmanResults(step.data) : [];
    },
    showPostmanResponse(result) {
      this.postmanResponse = formatPostmanResponse(result?.response ?? null);
    },
    safeScreenshots(step) {
      const screenshots = step?.screenshots;
      if (Array.isArray(screenshots)) {
        return screenshots;
      }
      if (typeof screenshots !== "string" || screenshots.length === 0) {
        return [];
      }
      try {
        const parsed = JSON.parse(screenshots);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },
    showModal(arrayStep, name) {
      this.arrayStep = arrayStep;
      this.testName = name;
      this.fullscreen = false;
      this.postmanResponse = null;
      this.modalElem.show();
      this.showCollectionWindow = false;
      setTimeout(
        function () {
          this.$refs.timeline?.calc?.();
        }.bind(this),
        100,
      );
    },
    fullscreenImage(screen) {
      this.fullscreen = !this.fullscreen;
      this.screenFull = screen;
      this.showCollectionWindow = false;
      if (this.fullscreen == false) {
        setTimeout(
          function () {
            this.$refs.timeline?.calc?.();
          }.bind(this),
          100,
        );
      }
    },
    showImage(index) {
      this.fullscreenImage(this.safeScreenshots(this.arrayStep[index])[0]);
    },
  },
};
</script>
