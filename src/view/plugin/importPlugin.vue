<template>
  <div class="plugin-import-card">
    <file-upload
      ref="upload"
      v-model="files"
      class="upload"
      :extensions="extensions"
      :accept="accept"
      @input-filter="inputFilter"
      :drop="true"
    >
      <div class="upload-content">
        <div class="upload-title" :key="languageRefreshKey">
          {{
            language[this.config.currentLanguage].Plugins.importPlugin
              .importPluginFile
          }}
        </div>
        <div class="upload-hint">.py</div>
        <div class="upload-error">
          {{ errortext }}
        </div>
      </div>
    </file-upload>
  </div>
</template>
<style scoped>
.plugin-import-card {
  padding: 0.25rem;
}

.upload {
  align-items: center;
  background:
    linear-gradient(180deg, rgba(255, 122, 24, 0.06), transparent),
    rgba(255, 255, 255, 0.025);
  border: 1px dashed rgba(255, 122, 24, 0.45);
  border-radius: 1rem;
  color: #f4f4f5;
  display: flex;
  justify-content: center;
  min-height: 16rem;
  padding: 2rem;
  position: relative;
  text-align: center;
  width: 99%;
}

.upload-content {
  width: 100%;
}

.upload-title {
  font-size: 1.25rem !important;
  font-weight: 800;
  letter-spacing: 0.14rem;
  text-transform: uppercase;
}

.upload-hint {
  color: rgba(244, 244, 245, 0.62);
  font-size: 0.85rem !important;
  margin-top: 0.6rem;
}

.upload-error {
  color: #ff8a8a;
  font-size: 0.85rem !important;
  margin-top: 1rem;
  min-height: 1.2rem;
  text-transform: uppercase;
}
</style>
<script>
import apiClient from "@/services/apiClient";
import FileUpload from "vue-upload-component";
export default {
  name: "SeleniumComponent",
  props: {},
  components: {
    FileUpload,
  },
  data() {
    return {
      files: [],
      extensions: "py",
      accept: "text/py",
      errortext: "",
      languageRefreshKey: 0,
    };
  },

  created() {
    this.emitter?.on("refreshPlugin", () => {
      this.languageRefreshKey += 1;
    });
  },
  watch: {
    testName() {
      this.notifyChange();
    },
    testDescription() {
      this.notifyChange();
    },
  },
  methods: {
    inputFilter(newFile) {
      this.errortext = "";
      var fileExt = newFile.name.split(".").pop();
      if (fileExt != "py") {
        this.errortext =
          this.language[
            this.config.currentLanguage
          ].Plugins.importPlugin.extensionIsWrong;
        return false;
      }
      let url = URL.createObjectURL(newFile.file);
      apiClient
        .get(url, {
          responseType: "text",
        })
        .then((response) => {
          this.$emit("importPlugin", response.data);
        })
        .catch((e) => {
          this.error = e;
        });
    },
    notifyChange() {},
  },
};
</script>
