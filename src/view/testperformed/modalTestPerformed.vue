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
                    <tr
                      v-else-if="
                        step.type == 'selenium' ||
                        step.type == 'seleniumOrAppium'
                      "
                      class="bidi-result-row"
                    >
                      <td colspan="6">
                        <section class="bidi-result-panel">
                          <div class="bidi-result-header">
                            <div>
                              <h6>
                                {{
                                  bidiLabel(
                                    "executionResults",
                                    "WebDriver BiDi diagnostics",
                                  )
                                }}
                              </h6>
                              <p>
                                {{
                                  bidiLabel(
                                    "executionResultsHelp",
                                    "Review console, network, JavaScript error, and SPA navigation metadata captured by the CLI.",
                                  )
                                }}
                              </p>
                            </div>
                            <span class="bidi-result-counter">
                              {{ bidiEventRows(step).length }}
                            </span>
                          </div>
                          <div
                            v-if="bidiEventRows(step).length > 0"
                            class="bidi-result-table"
                          >
                            <table class="table table-striped costum">
                              <thead>
                                <tr>
                                  <th scope="col">
                                    {{ bidiLabel("artifact", "artifact") }}
                                  </th>
                                  <th scope="col">
                                    {{ bidiLabel("event", "event") }}
                                  </th>
                                  <th scope="col">
                                    {{ bidiLabel("url", "url") }}
                                  </th>
                                  <th scope="col">
                                    {{ bidiLabel("message", "message") }}
                                  </th>
                                  <th scope="col">
                                    {{ bidiLabel("status", "status") }}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr
                                  v-for="(event, eventIndex) in bidiEventRows(
                                    step,
                                  )"
                                  :key="event.artifactName + '-' + eventIndex"
                                >
                                  <td>{{ event.artifactName }}</td>
                                  <td>{{ event.type }}</td>
                                  <td>
                                    <span
                                      :class="{
                                        'bidi-redacted': isRedactedValue(
                                          event.url,
                                        ),
                                      }"
                                    >
                                      {{ formatBidiValue(event.url) }}
                                    </span>
                                  </td>
                                  <td>
                                    <span
                                      :class="{
                                        'bidi-redacted': isRedactedValue(
                                          event.message,
                                        ),
                                      }"
                                    >
                                      {{ formatBidiValue(event.message) }}
                                    </span>
                                  </td>
                                  <td>{{ formatBidiValue(event.status) }}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div v-else class="bidi-empty-state">
                            {{
                              bidiLabel(
                                "emptyResults",
                                "No BiDi diagnostics are available for this step.",
                              )
                            }}
                          </div>
                        </section>
                      </td>
                    </tr>
                    <tr
                      v-if="hasExecutionResultDetails(step)"
                      class="execution-result-row"
                    >
                      <td colspan="6">
                        <section
                          class="execution-result-panel"
                          :aria-label="
                            resultLabel(
                              'executionResults',
                              'Execution result details',
                            )
                          "
                        >
                          <div class="execution-result-header">
                            <div>
                              <h6>
                                {{
                                  resultLabel(
                                    "executionResults",
                                    "Execution result details",
                                  )
                                }}
                              </h6>
                              <p>
                                {{
                                  resultLabel(
                                    "executionResultsHelp",
                                    "Review canonical result metadata, traces, diagnostics, timing, and artifacts.",
                                  )
                                }}
                              </p>
                            </div>
                            <span class="execution-result-counter">
                              {{ stepArtifacts(step).length }}
                            </span>
                          </div>
                          <div class="execution-result-grid">
                            <article class="execution-result-card">
                              <span>{{
                                resultLabel("runtime", "runtime")
                              }}</span>
                              <strong>{{
                                runtimeDetails(step).runtime
                              }}</strong>
                            </article>
                            <article class="execution-result-card">
                              <span>{{ resultLabel("schema", "schema") }}</span>
                              <strong>{{
                                runtimeDetails(step).schemaVersion
                              }}</strong>
                            </article>
                            <article class="execution-result-card">
                              <span>{{
                                resultLabel("duration", "duration")
                              }}</span>
                              <strong>{{
                                formatDuration(stepDuration(step))
                              }}</strong>
                            </article>
                          </div>
                          <div
                            v-if="stepDiagnostics(step).length > 0"
                            class="execution-result-diagnostics"
                          >
                            <h6>
                              {{ resultLabel("diagnostics", "diagnostics") }}
                            </h6>
                            <ul>
                              <li
                                v-for="(
                                  diagnostic, diagnosticIndex
                                ) in stepDiagnostics(step)"
                                :key="diagnosticIndex"
                              >
                                <strong>{{
                                  diagnostic.code ||
                                  diagnostic.level ||
                                  "diagnostic"
                                }}</strong>
                                {{ diagnostic.message || "—" }}
                              </li>
                            </ul>
                          </div>
                          <div
                            v-if="stepArtifacts(step).length > 0"
                            class="execution-result-artifacts"
                          >
                            <h6>{{ resultLabel("artifacts", "artifacts") }}</h6>
                            <ul>
                              <li
                                v-for="(
                                  artifact, artifactIndex
                                ) in stepArtifacts(step)"
                                :key="artifactIndex"
                              >
                                <strong>{{
                                  artifact.name || "artifact"
                                }}</strong>
                                {{ artifact.type || "unknown" }}
                                <span v-if="artifact.path">
                                  · {{ artifact.path }}</span
                                >
                              </li>
                            </ul>
                          </div>
                          <div
                            v-if="stepTrace(step) != null"
                            class="execution-result-trace"
                          >
                            <h6>{{ resultLabel("trace", "trace") }}</h6>
                            <p>
                              {{ stepTrace(step).status || "—" }}
                              ·
                              {{
                                stepTrace(step).identity?.kind ||
                                stepTrace(step).kind ||
                                "step"
                              }}
                            </p>
                            <p v-if="stepTrace(step).page?.url">
                              {{ resultLabel("page", "page") }}:
                              {{ stepTrace(step).page.url }}
                            </p>
                          </div>
                          <div v-else class="execution-result-empty">
                            {{
                              resultLabel(
                                "emptyResults",
                                "No canonical execution result details are available for this step.",
                              )
                            }}
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
.postman-result-panel,
.bidi-result-panel,
.execution-result-panel {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  margin: 0.75rem;
  padding: 1rem;
  background: rgba(15, 18, 28, 0.72);
}
.postman-result-header,
.bidi-result-header,
.execution-result-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}
.postman-result-header h6,
.bidi-result-header h6,
.execution-result-header h6,
.execution-result-diagnostics h6,
.execution-result-artifacts h6,
.execution-result-trace h6,
.postman-response-title {
  margin: 0;
  color: #f6f7fb;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.postman-result-header p,
.bidi-result-header p,
.execution-result-header p,
.postman-empty-state,
.bidi-empty-state,
.execution-result-empty,
.execution-result-trace p {
  margin: 0.35rem 0 0;
  color: rgba(246, 247, 251, 0.72);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
}
.bidi-result-counter,
.execution-result-counter {
  align-items: center;
  background: rgba(255, 109, 31, 0.12);
  border: 1px solid rgba(255, 109, 31, 0.42);
  border-radius: 999px;
  color: #ffb184;
  display: inline-flex;
  font-size: 0.72rem;
  font-weight: 800;
  height: 2rem;
  justify-content: center;
  min-width: 2rem;
  padding: 0 0.65rem;
}
.bidi-result-table {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  max-height: 24rem;
  overflow: auto;
}
.bidi-redacted {
  color: #ffb184;
  font-weight: 800;
}
.execution-result-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  margin-bottom: 1rem;
}
.execution-result-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 0.85rem;
}
.execution-result-card span {
  color: rgba(246, 247, 251, 0.64);
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.execution-result-card strong {
  color: #f6f7fb;
}
.execution-result-diagnostics,
.execution-result-artifacts,
.execution-result-trace {
  margin-top: 0.75rem;
}
.execution-result-diagnostics ul,
.execution-result-artifacts ul {
  margin: 0.5rem 0 0;
  padding-left: 1.25rem;
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
    bidiLabel(key, fallback) {
      return (
        this.language?.[this.config.currentLanguage]?.Bidi?.[key] || fallback
      );
    },
    resultLabel(key, fallback) {
      return (
        this.language?.[this.config.currentLanguage]?.ExecutionResult?.[key] ||
        fallback
      );
    },
    safeStepData(step) {
      if (step?.data && typeof step.data === "object") {
        return step.data;
      }
      if (typeof step?.data !== "string" || step.data.length === 0) {
        return {};
      }
      try {
        const parsed = JSON.parse(step.data);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? parsed
          : {};
      } catch {
        return {};
      }
    },
    bidiArtifacts(step) {
      const payload = this.safeStepData(step);
      return [...(payload.bidiArtifacts || []), ...(payload.artifacts || [])]
        .filter((artifact) =>
          String(artifact?.type || "").startsWith(
            "application/vnd.idelium.bidi.",
          ),
        )
        .slice(0, 50);
    },
    bidiEventRows(step) {
      return this.bidiArtifacts(step)
        .flatMap((artifact) =>
          (artifact?.data?.events || []).slice(0, 100).map((event) => ({
            artifactName: artifact.name || artifact.type,
            type: event?.type || "—",
            url: event?.url || "—",
            message:
              event?.message ||
              event?.text ||
              event?.statusText ||
              event?.requestId ||
              "—",
            status: event?.status ?? event?.level ?? "—",
          })),
        )
        .slice(0, 100);
    },
    hasExecutionResultDetails(step) {
      const payload = this.safeStepData(step);
      return (
        Boolean(payload.schemaVersion || payload.runtime || payload.trace) ||
        this.stepDiagnostics(step).length > 0 ||
        this.stepArtifacts(step).length > 0
      );
    },
    runtimeDetails(step) {
      const payload = this.safeStepData(step);
      return {
        runtime: payload.runtime || step?.type || "legacy",
        schemaVersion: payload.schemaVersion || "legacy",
      };
    },
    stepTrace(step) {
      const payload = this.safeStepData(step);
      return payload.trace || null;
    },
    stepDiagnostics(step) {
      const payload = this.safeStepData(step);
      const diagnostics = [
        ...(Array.isArray(payload.diagnostics) ? payload.diagnostics : []),
        ...(Array.isArray(payload.trace?.diagnostics)
          ? payload.trace.diagnostics
          : []),
      ];
      return diagnostics.slice(0, 25).map((diagnostic) => ({
        code: this.formatBidiValue(diagnostic?.code || diagnostic?.level),
        level: this.formatBidiValue(diagnostic?.level),
        message: this.formatBidiValue(diagnostic?.message),
      }));
    },
    stepArtifacts(step) {
      const payload = this.safeStepData(step);
      const artifacts = Array.isArray(payload.artifacts)
        ? payload.artifacts
        : [];
      return artifacts.slice(0, 25).map((artifact) => ({
        name: this.formatBidiValue(artifact?.name || "artifact"),
        type: this.formatBidiValue(artifact?.type || "unknown"),
        path: this.formatBidiValue(artifact?.path || ""),
      }));
    },
    stepDuration(step) {
      const payload = this.safeStepData(step);
      return (
        payload.durationMilliseconds ||
        payload.trace?.timing?.durationMilliseconds ||
        step?.durationMilliseconds ||
        0
      );
    },
    formatDuration(milliseconds) {
      return `${Number(milliseconds || 0)} ms`;
    },
    formatBidiValue(value) {
      if (value === null || typeof value === "undefined" || value === "") {
        return "—";
      }
      if (typeof value === "object") {
        return JSON.stringify(value);
      }
      return String(value);
    },
    isRedactedValue(value) {
      return this.formatBidiValue(value).includes("[REDACTED]");
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
