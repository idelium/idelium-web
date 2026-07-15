<template>
  <div class="">
    <div class="title">{{ nameTest }}</div>
    <div class="contentCollection">
      <PostmanResultTable
        :results="dataTest"
        :labels="language[config.currentLanguage].Postman"
        @show-response="showModal"
      />
      <modalPostmanResponse ref="modalPostmanResponseShow" />
    </div>
  </div>
</template>
<style>
body {
  font-family: Arial;
}

* {
  box-sizing: border-box;
}
.title {
  font-size: 2rem;
  text-align: center;
}

.wrapper {
  max-width: 400px;
  margin: 50px auto;
}
.dot {
  height: 12px;
  width: 12px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
}

.dataWindow {
  border: 3px solid #f1f1f1;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  width: 90vw;
  margin: 10px;
  background-color: rgb(7, 42, 92);
  overflow: auto;
}

.top {
  padding: 10px;
  background: #f1f1f1;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.contentCollection {
  padding: 10px;
  overflow-y: auto;
  max-height: 80vh;
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
      dataTest: {},
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
          this.dataTest = parsePostmanResults(response.data[0].data);
          this.nameTest = response.data[0].name;
        })
        .catch((e) => {
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
  },
};
</script>
