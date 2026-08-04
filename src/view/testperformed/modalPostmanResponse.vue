<template>
  <div>
    <div
      :class="[
        'modal fade postman-response-modal',
        { 'postman-response-modal--elevated': elevated },
      ]"
      ref="mymodal"
      tabindex="-1"
      aria-labelledby="postman-response-title"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-fullscreen-lg-down modal-xl modal-dialog-centered">
        <div class="modal-content postman-response-modal__content">
          <div class="modal-header postman-response-modal__header">
            <div>
              <span class="postman-response-modal__eyebrow">
                {{ postmanLabel("requestDetail", "Postman request detail") }}
              </span>
              <h5 id="postman-response-title" class="modal-title">
                <font-awesome-icon icon="vial" class="iconClass" />
                {{ requestTitle }}
              </h5>
            </div>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              :aria-label="postmanLabel('close', 'Close')"
            ></button>
          </div>

          <div class="modal-body postman-response-modal__body">
            <section class="postman-response-modal__summary">
              <article>
                <span>{{ postmanLabel("method", "method") }}</span>
                <strong>{{ requestMethod || "—" }}</strong>
              </article>
              <article>
                <span>{{ postmanLabel("status", "status") }}</span>
                <strong :class="statusClass">{{ requestStatus || "—" }}</strong>
              </article>
              <article>
                <span>{{ postmanLabel("time", "time") }}</span>
                <strong>{{ requestTime }}</strong>
              </article>
              <article>
                <span>{{ postmanLabel("assertions", "assertions") }}</span>
                <strong>{{ assertionSummary }}</strong>
              </article>
            </section>

            <section class="postman-response-modal__url" v-if="requestUrl">
              <span>{{ postmanLabel("url", "url") }}</span>
              <code>{{ requestUrl }}</code>
            </section>

            <section
              v-if="failedAssertions.length > 0"
              class="postman-response-modal__diagnostics"
            >
              <span>{{ postmanLabel("diagnostic", "diagnostic") }}</span>
              <ul>
                <li v-for="assertion in failedAssertions" :key="assertion.name">
                  <strong>{{ assertion.name }}</strong>
                  <small>
                    {{
                      assertion.message ||
                      postmanLabel("assertionFailed", "Assertion failed.")
                    }}
                  </small>
                </li>
              </ul>
            </section>

            <section class="postman-response-modal__payload-grid">
              <article class="postman-response-modal__payload">
                <div class="postman-response-modal__payload-header">
                  <span>
                    {{ postmanLabel("requestPayload", "Request payload") }}
                  </span>
                  <small>{{ requestPayloadHint }}</small>
                </div>
                <pre>{{ dataRequestPayload }}</pre>
              </article>

              <article class="postman-response-modal__payload">
                <div class="postman-response-modal__payload-header">
                  <span>
                    {{ postmanLabel("responsePayload", "Response payload") }}
                  </span>
                  <small>{{ responsePayloadHint }}</small>
                </div>
                <pre>{{ dataResponse }}</pre>
              </article>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.postman-response-modal--elevated {
  z-index: 1125;
}

.postman-response-modal__content {
  background:
    radial-gradient(
      circle at top right,
      rgba(255, 108, 32, 0.18),
      transparent 32rem
    ),
    #222632;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.25rem;
  box-shadow: 0 2rem 5rem rgba(0, 0, 0, 0.45);
  color: #f7f8fb;
  max-height: 92vh;
  overflow: hidden;
}

.postman-response-modal__header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.2rem 1.4rem;
}

.postman-response-modal__eyebrow,
.postman-response-modal__summary span,
.postman-response-modal__url span,
.postman-response-modal__diagnostics span,
.postman-response-modal__payload-header span {
  color: rgba(255, 255, 255, 0.62);
  display: block;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.postman-response-modal__body {
  display: grid;
  gap: 1rem;
  max-height: calc(92vh - 5.5rem);
  overflow: auto;
  padding: 1.25rem;
}

.postman-response-modal__summary {
  display: grid;
  gap: 0.8rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.postman-response-modal__summary article,
.postman-response-modal__url,
.postman-response-modal__diagnostics,
.postman-response-modal__payload {
  background: rgba(8, 11, 21, 0.52);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.95rem;
  padding: 0.95rem;
}

.postman-response-modal__summary strong {
  display: block;
  font-size: 1rem;
  margin-top: 0.35rem;
}

.postman-response-modal__status-success {
  color: #6be6a0;
}

.postman-response-modal__status-danger {
  color: #ff8b78;
}

.postman-response-modal__url code {
  color: #9fd3ff;
  display: block;
  margin-top: 0.45rem;
  overflow-wrap: anywhere;
  white-space: normal;
}

.postman-response-modal__diagnostics ul {
  display: grid;
  gap: 0.65rem;
  list-style: none;
  margin: 0.7rem 0 0;
  padding: 0;
}

.postman-response-modal__diagnostics li {
  background: rgba(255, 75, 75, 0.08);
  border: 1px solid rgba(255, 75, 75, 0.22);
  border-radius: 0.75rem;
  padding: 0.65rem;
}

.postman-response-modal__diagnostics small {
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-top: 0.25rem;
}

.postman-response-modal__payload-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.postman-response-modal__payload {
  min-height: 42vh;
}

.postman-response-modal__payload-header {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.postman-response-modal__payload-header small {
  color: rgba(255, 255, 255, 0.48);
  font-size: 0.75rem;
}

.postman-response-modal__payload pre {
  background: rgba(2, 4, 12, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.85rem;
  color: #f7f8fb;
  font-size: 0.82rem;
  line-height: 1.55;
  margin: 0.85rem 0 0;
  min-height: 34vh;
  overflow: auto;
  padding: 1rem;
  white-space: pre-wrap;
}

.iconClass {
  font-size: 18px !important;
  margin-right: 5px;
}

@media (max-width: 900px) {
  .postman-response-modal__summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .postman-response-modal__payload-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<script>
import { Modal } from "bootstrap";
import {
  formatPostmanRequestPayload,
  formatPostmanResponse,
  hasPostmanResponseBody,
} from "@/domain/postmanResults";

export default {
  name: "ModalPostmanResponse",
  props: {
    elevated: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dataRequestPayload: "",
      dataResponse: "",
      selectedResult: null,
      modalElem: null,
    };
  },
  computed: {
    requestTitle() {
      return (
        this.selectedResult?.name ||
        this.postmanLabel("unnamedResponse", "Postman response")
      );
    },
    requestMethod() {
      return this.selectedResult?.method || "";
    },
    requestStatus() {
      return this.selectedResult?.status ?? "";
    },
    requestTime() {
      const time = this.selectedResult?.time;
      return time == null || time === "" ? "—" : `${time} ms`;
    },
    requestUrl() {
      return this.selectedResult?.url || "";
    },
    assertionSummary() {
      const assertions = this.selectedResult?.assertions || [];
      if (assertions.length === 0) return "0/0";
      const passed = assertions.filter(
        (assertion) => assertion?.passed !== false,
      ).length;
      return `${passed}/${assertions.length}`;
    },
    failedAssertions() {
      return (this.selectedResult?.assertions || []).filter(
        (assertion) => assertion?.passed === false,
      );
    },
    requestPayloadHint() {
      return hasPostmanResponseBody(this.selectedResult?.requestPayload)
        ? this.postmanLabel("capturedByCli", "Captured by the CLI")
        : this.postmanLabel(
            "noRequestPayloadCaptured",
            "No request payload captured",
          );
    },
    responsePayloadHint() {
      return hasPostmanResponseBody(this.selectedResult?.response)
        ? this.postmanLabel("capturedByCli", "Captured by the CLI")
        : this.postmanLabel(
            "noResponseBodyCaptured",
            "No response body captured",
          );
    },
    statusClass() {
      return this.selectedResult?.passed === false ||
        Number(this.selectedResult?.status ?? 0) >= 400
        ? "postman-response-modal__status-danger"
        : "postman-response-modal__status-success";
    },
  },
  mounted() {
    this.modalElem = new Modal(this.$refs.mymodal);
  },
  beforeUnmount() {
    this.modalElem?.dispose?.();
  },
  methods: {
    postmanLabel(key, fallback) {
      return (
        this.language?.[this.config?.currentLanguage]?.Postman?.[key] ||
        fallback
      );
    },
    showModal(resultOrResponse) {
      this.selectedResult =
        resultOrResponse != null &&
        typeof resultOrResponse === "object" &&
        ("response" in resultOrResponse ||
          "status" in resultOrResponse ||
          "method" in resultOrResponse)
          ? resultOrResponse
          : { response: resultOrResponse };
      this.dataResponse = formatPostmanResponse(
        this.selectedResult.response ?? null,
        this.selectedResult,
      );
      this.dataRequestPayload = formatPostmanRequestPayload(
        this.selectedResult.requestPayload ?? null,
        this.selectedResult,
      );
      this.modalElem.show();
    },
  },
};
</script>
