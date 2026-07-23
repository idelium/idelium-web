<template>
  <div class="postman-details-page">
    <section class="card postman-details-hero">
      <div>
        <span class="postman-details-eyebrow">
          {{ postmanLabel("detailsEyebrow", "Execution detail") }}
        </span>
        <h1 class="postman-details-title">
          {{ nameTest || postmanLabel("detailsTitle", "Postman details") }}
        </h1>
        <p class="postman-details-description">
          {{
            postmanLabel(
              "detailsDescription",
              "Inspect every request executed by the Postman runtime, including status, assertions, duration, and response payload.",
            )
          }}
        </p>
      </div>
      <div class="postman-details-actions">
        <button
          type="button"
          class="btn btn-outline-light postman-details-back"
          @click="goBackToTestsPerformed"
        >
          <font-awesome-icon icon="arrow-left" />
          {{ postmanLabel("backToTestsPerformed", "Back to tests performed") }}
        </button>
        <span class="postman-details-counter">
          {{ dataTest.length }}
          {{ postmanLabel("requests", "requests") }}
        </span>
      </div>
    </section>

    <section class="card postman-details-card">
      <div class="postman-details-card-header">
        <div>
          <span class="postman-details-section-title">
            {{ postmanLabel("executionResults", "Postman execution results") }}
          </span>
          <p class="postman-details-description">
            {{
              postmanLabel(
                "executionResultsHelp",
                "Review request status, assertions, timing, and response payloads captured by the CLI.",
              )
            }}
          </p>
        </div>
      </div>
      <div v-if="dataTest.length > 0" class="postman-details-table">
        <PostmanResultTable
          :results="dataTest"
          :labels="language[config.currentLanguage].Postman"
          @show-response="showModal"
        />
      </div>
      <div v-else class="postman-details-empty">
        {{
          postmanLabel(
            "emptyResults",
            "No Postman execution data is available for this step.",
          )
        }}
      </div>
      <modalPostmanResponse ref="modalPostmanResponseShow" />
    </section>
  </div>
</template>
<style scoped>
.postman-details-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: calc(100vh - 76px - 3rem);
  height: calc(100dvh - 76px - 3rem);
  margin: 0 auto;
  max-width: 100%;
  min-height: 0;
  overflow: hidden;
  width: 100%;
}

.postman-details-hero {
  align-items: center;
  background:
    radial-gradient(
      circle at top left,
      rgba(255, 107, 30, 0.18),
      transparent 32rem
    ),
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.075),
      rgba(255, 255, 255, 0.025)
    );
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex: 0 0 auto;
  justify-content: space-between;
  padding: 1.35rem;
}

.postman-details-eyebrow,
.postman-details-section-title {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.postman-details-title {
  color: #ffffff;
  font-size: clamp(1.6rem, 2.5vw, 2.4rem);
  margin: 0.35rem 0;
}

.postman-details-description {
  color: rgba(255, 255, 255, 0.66);
  margin: 0;
}

.postman-details-counter {
  align-items: center;
  background: rgba(255, 107, 30, 0.16);
  border: 1px solid rgba(255, 107, 30, 0.5);
  border-radius: 999px;
  color: #ffd1b8;
  display: inline-flex;
  font-weight: 800;
  justify-content: center;
  padding: 0.45rem 0.85rem;
  white-space: nowrap;
}

.postman-details-actions {
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  gap: 0.75rem;
}

.postman-details-back {
  align-items: center;
  border-color: rgba(255, 255, 255, 0.18);
  display: inline-flex;
  gap: 0.45rem;
  white-space: nowrap;
}

.postman-details-card {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 1rem;
  width: 100%;
}

.postman-details-card-header {
  align-items: flex-start;
  display: flex;
  flex: 0 0 auto;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.postman-details-table {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  width: 100%;
}

.postman-details-table :deep(.table) {
  min-width: 100%;
  width: 100%;
}

.postman-details-empty {
  align-items: center;
  border: 1px dashed rgba(255, 255, 255, 0.16);
  border-radius: 0.9rem;
  color: rgba(255, 255, 255, 0.58);
  display: flex;
  flex: 1 1 auto;
  justify-content: center;
  min-height: 18rem;
  padding: 1.25rem;
  text-align: center;
}

@media (max-width: 760px) {
  .postman-details-page {
    height: auto;
    min-height: calc(100vh - 76px - 3rem);
    min-height: calc(100dvh - 76px - 3rem);
    overflow: visible;
  }

  .postman-details-hero {
    align-items: flex-start;
    flex-direction: column;
    gap: 1rem;
  }

  .postman-details-actions {
    align-items: stretch;
    flex-direction: column;
    width: 100%;
  }

  .postman-details-back,
  .postman-details-counter {
    justify-content: center;
    width: 100%;
  }

  .postman-details-card {
    min-height: 28rem;
  }
}
</style>
<script>
import modalPostmanResponse from "./modalPostmanResponse.vue";
import PostmanResultTable from "./PostmanResultTable.vue";
import apiClient from "@/services/apiClient";
import { parsePostmanResults } from "@/domain/postmanResults";
export default {
  components: {
    modalPostmanResponse,
    PostmanResultTable,
  },
  data() {
    return {
      postmanCollection: null,
      keyCollections: [],
      dataTest: [],
      nameTest: null,
      arrayAttributes: [
        "url",
        "apparent_encoding",
        //'content',
        "cookies",
        "elapsed",
        "encoding",
        "headers",
        "history",
        "is_permanent_redirect",
        "is_redirect",
        "links",
        "next",
        "ok",
        //"raw",
        "reason",
        "request",
        "status_code",
        "text",
      ],
    };
  },
  created() {
    this.getStep(this.$route.params.id);
  },
  methods: {
    getStep(id) {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.getStepPerformed +
            "/" +
            id,
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          const performedStep = Array.isArray(response.data)
            ? response.data[0]
            : null;
          this.dataTest = parsePostmanResults(performedStep?.data || []);
          this.nameTest = performedStep?.name || null;
        })
        .catch((e) => {
          this.emitter.emit("showLoader", false);
          this.error = e;
          this.Logout(this, e);
        });
    },
    getCollections(collections) {
      this.postmanCollection = JSON.parse(collections);
      this.keyCollections = Object.keys(this.postmanCollection);
    },
    showModal(result) {
      this.$refs.modalPostmanResponseShow.showModal(result.response);
    },
    goBackToTestsPerformed() {
      const projectId = this.$route.params.projectId;
      if (projectId) {
        this.$router.push({
          name: "testsperformed",
          params: { projectId },
        });
        return;
      }
      this.$router.push({ name: "testsperformed" });
    },
    postmanLabel(key, fallback) {
      return (
        this.language?.[this.config.currentLanguage]?.Postman?.[key] || fallback
      );
    },
  },
};
</script>
