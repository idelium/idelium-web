<template>
  <section
    class="environment-resolved-preview"
    :aria-labelledby="`${previewId}-title`"
  >
    <header>
      <div>
        <h2 :id="`${previewId}-title`">{{ copy.title }}</h2>
        <p>{{ copy.description }}</p>
      </div>
      <div class="environment-resolved-preview__actions">
        <button type="button" v-on:click="copyExport">
          {{ copy.copy }}
        </button>
        <button type="button" v-on:click="downloadExport">
          {{ copy.download }}
        </button>
      </div>
    </header>

    <p
      v-if="preview.launchMutable"
      class="environment-resolved-preview__warning"
      role="status"
    >
      {{ copy.launchWarning }}
    </p>
    <p class="environment-resolved-preview__versions">
      {{
        format(copy.versions, {
          catalog: preview.catalogVersion,
          contract: preview.contractVersion,
          schema: preview.schemaVersion,
        })
      }}
    </p>

    <div class="environment-resolved-preview__table-wrap">
      <table>
        <caption class="visually-hidden">
          {{ copy.caption }}
        </caption>
        <thead>
          <tr>
            <th scope="col">{{ copy.columns.field }}</th>
            <th scope="col">{{ copy.columns.source }}</th>
            <th scope="col">{{ copy.columns.override }}</th>
            <th scope="col">{{ copy.columns.validation }}</th>
            <th scope="col">{{ copy.columns.value }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="field in preview.fields" v-bind:key="field.path">
            <th scope="row">{{ field.path }}</th>
            <td>{{ sourceLabel(field.source) }}</td>
            <td>{{ field.overridden ? copy.overridden : copy.inherited }}</td>
            <td>{{ field.valid ? copy.valid : copy.invalid }}</td>
            <td>
              <code>{{ displayValue(field.value) }}</code>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <span class="visually-hidden" aria-live="polite">{{ actionStatus }}</span>
  </section>
</template>

<script>
import { serializeResolvedEnvironmentPreview } from "@/domain/environmentPreview";

let previewSequence = 0;

export default {
  name: "EnvironmentResolvedPreview",
  emits: ["copied", "downloaded"],
  props: {
    copy: { type: Object, required: true },
    preview: { type: Object, required: true },
  },
  data() {
    previewSequence += 1;
    return {
      actionStatus: "",
      previewId: `environment-resolved-preview-${previewSequence}`,
    };
  },
  computed: {
    exportText() {
      return serializeResolvedEnvironmentPreview(this.preview);
    },
  },
  methods: {
    async copyExport() {
      await navigator.clipboard.writeText(this.exportText);
      this.actionStatus = this.copy.copied;
      this.$emit("copied");
    },
    displayValue(value) {
      if (value?.redacted === true) {
        return value.reference
          ? this.format(this.copy.redactedReference, {
              descriptor: value.descriptor,
              reference: value.reference,
            })
          : this.format(this.copy.redacted, {
              descriptor: value.descriptor,
            });
      }
      if (value != null && typeof value === "object") {
        return JSON.stringify(value);
      }
      return String(value ?? "");
    },
    downloadExport() {
      const url = URL.createObjectURL(
        new Blob([this.exportText], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "idelium-environment-preview.json";
      link.click();
      URL.revokeObjectURL(url);
      this.actionStatus = this.copy.downloaded;
      this.$emit("downloaded");
    },
    format(template, values) {
      return Object.entries(values).reduce(
        (message, [key, value]) =>
          message.replaceAll(`{${key}}`, String(value)),
        template,
      );
    },
    sourceLabel(source) {
      return this.copy.sources[source] || source;
    },
  },
};
</script>

<style scoped>
.environment-resolved-preview {
  display: grid;
  gap: var(--id-space-4);
  min-width: 0;
}

.environment-resolved-preview header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
  align-items: flex-start;
  justify-content: space-between;
}

.environment-resolved-preview h2,
.environment-resolved-preview p {
  margin: 0;
}

.environment-resolved-preview__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-2);
}

.environment-resolved-preview__warning {
  padding: var(--id-space-3);
  border: 1px solid var(--id-color-warning);
  border-radius: var(--id-radius-medium);
  color: var(--id-color-warning);
  background: color-mix(in srgb, var(--id-color-warning) 10%, transparent);
}

.environment-resolved-preview__versions {
  color: var(--id-color-text-muted);
  font-size: var(--id-font-size-small);
}

.environment-resolved-preview__table-wrap {
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
}

.environment-resolved-preview table {
  width: 100%;
  min-width: 48rem;
  border-collapse: collapse;
}

.environment-resolved-preview th,
.environment-resolved-preview td {
  padding: var(--id-space-3);
  border-bottom: 1px solid var(--id-color-border);
  text-align: left;
  vertical-align: top;
}

.environment-resolved-preview tbody tr:last-child > * {
  border-bottom: 0;
}

.environment-resolved-preview code {
  overflow-wrap: anywhere;
}
</style>
