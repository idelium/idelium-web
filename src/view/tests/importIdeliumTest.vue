<template>
  <section class="idelium-import" aria-labelledby="idelium-import-title">
    <header class="idelium-import__header">
      <p class="idelium-import__eyebrow">
        {{ copy.eyebrow }}
      </p>
      <h2 id="idelium-import-title">
        {{ copy.title }}
      </h2>
      <p>
        {{ copy.description }}
      </p>
    </header>

    <div v-if="showUpload" class="idelium-import__dropzone">
      <file-upload
        ref="upload"
        v-model="files"
        class="upload"
        :extensions="extensions"
        :accept="accept"
        :drop="true"
        @input-filter="inputFilter"
      >
        <div class="upload-text">
          {{ copy.importFile }}
        </div>
        <div v-if="errortext" class="upload-text error" role="alert">
          {{ errortext }}
        </div>
      </file-upload>
      <pre class="idelium-import__example">{{ example }}</pre>
    </div>

    <div v-else class="idelium-import__summary">
      <label>
        <span>{{ copy.testName }}</span>
        <input class="form-control" type="text" v-model="testName" />
      </label>
      <label>
        <span>{{ copy.testDescription }}</span>
        <input class="form-control" type="text" v-model="testDescription" />
      </label>
      <p>
        {{ copy.ready.replace("{count}", String(testSteps.length)) }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.idelium-import {
  display: grid;
  gap: var(--id-space-4);
  padding: var(--id-space-4);
}

.idelium-import__header {
  max-width: 56rem;
}

.idelium-import__eyebrow {
  color: var(--id-color-accent);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  margin: 0 0 var(--id-space-2);
  text-transform: uppercase;
}

.idelium-import__header h2 {
  margin: 0 0 var(--id-space-2);
}

.idelium-import__header p {
  color: var(--id-color-text-muted);
  margin: 0;
}

.idelium-import__dropzone {
  display: grid;
  gap: var(--id-space-4);
}

.upload {
  align-items: center;
  border: 1px dashed rgba(255, 122, 24, 0.55);
  border-radius: 1rem;
  cursor: pointer !important;
  display: flex;
  justify-content: center;
  min-height: 12rem;
  text-align: center;
  width: 100%;
}

.upload-text {
  color: var(--id-color-text);
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.error {
  color: var(--id-color-danger);
  font-size: 0.85rem;
  margin-top: var(--id-space-2);
}

.idelium-import__example {
  background: rgba(5, 8, 18, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  color: var(--id-color-text-muted);
  margin: 0;
  max-height: 16rem;
  overflow: auto;
  padding: var(--id-space-4);
  white-space: pre-wrap;
}

.idelium-import__summary {
  display: grid;
  gap: var(--id-space-3);
  max-width: 56rem;
}

.idelium-import__summary label {
  display: grid;
  gap: var(--id-space-2);
}

.idelium-import__summary span {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
</style>

<script>
import FileUpload from "vue-upload-component";
import english from "@/languages/english";

export default {
  name: "ImportIdeliumTest",
  components: {
    FileUpload,
  },
  data() {
    return {
      files: [],
      extensions: "json",
      accept: "application/json,.json",
      errortext: "",
      testName: "",
      testDescription: "",
      testSteps: [],
      showUpload: true,
    };
  },
  computed: {
    copy() {
      const dictionary = this.language?.[this.config.currentLanguage] ?? english;
      return dictionary.Tests.ideliumImport ?? english.Tests.ideliumImport;
    },
    example() {
      return JSON.stringify(
        {
          schema: "idelium.test-import.v1",
          name: "Idelium demo smoke test",
          description: "Open the public Idelium demo page.",
          steps: [
            {
              name: "Open Idelium demo",
              failedExit: true,
              attachScreenshot: true,
              steps: [
                {
                  stepType: "open_browser",
                  url: "https://idelium.org/demo/",
                  xpath: "//*",
                  note: "Open the Idelium demo page",
                },
              ],
            },
          ],
        },
        null,
        2,
      );
    },
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
      const fileExt = newFile?.name?.split(".").pop()?.toLowerCase();
      if (fileExt !== "json") {
        this.errortext = this.copy.extensionIsWrong;
        return false;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          this.loadJson(JSON.parse(String(reader.result ?? "")));
        } catch (_error) {
          this.errortext = this.copy.invalidJson;
        }
      };
      reader.onerror = () => {
        this.errortext = this.copy.readError;
      };
      reader.readAsText(newFile.file);
      return true;
    },
    loadJson(importDefinition) {
      if (
        importDefinition == null ||
        !Array.isArray(importDefinition.steps) ||
        importDefinition.steps.length === 0
      ) {
        this.errortext = this.copy.isNotAnIdeliumFile;
        return;
      }

      const invalidStep = importDefinition.steps.find(
        (step) =>
          typeof step?.name !== "string" ||
          step.name.trim() === "" ||
          !Array.isArray(step.steps) ||
          step.steps.length === 0,
      );
      if (invalidStep) {
        this.errortext = this.copy.invalidStep;
        return;
      }

      this.showUpload = false;
      this.testName = String(importDefinition.name ?? "Imported Idelium test");
      this.testDescription = String(
        importDefinition.description ?? "Imported Idelium test",
      );
      this.testSteps = importDefinition.steps.map((step) =>
        JSON.parse(JSON.stringify(step)),
      );
      this.notifyChange();
    },
    notifyChange() {
      this.$emit("importTest", {
        description: this.testDescription,
        name: this.testName,
        tests: this.testSteps,
      });
    },
    showUploadComponent() {
      this.showUpload = true;
      this.files = [];
      this.errortext = "";
      this.testSteps = [];
      this.notifyChange();
    },
  },
};
</script>
