<template>
  <section
    class="environment-variables"
    :aria-labelledby="`${tableId}-title`"
  >
    <header class="environment-variables__header">
      <div>
        <h2 :id="`${tableId}-title`">{{ copy.title }}</h2>
        <p>{{ copy.description }}</p>
      </div>
      <span
        class="environment-variables__status"
        :class="{ 'environment-variables__status--error': executionBlocked }"
        role="status"
      >
        {{ executionBlocked ? copy.blocked : copy.ready }}
      </span>
    </header>

    <div class="environment-variables__table-wrap">
      <table>
        <caption class="visually-hidden">
          {{ copy.caption }}
        </caption>
        <thead>
          <tr>
            <th scope="col">{{ copy.columns.name }}</th>
            <th scope="col">{{ copy.columns.source }}</th>
            <th scope="col">{{ copy.columns.type }}</th>
            <th scope="col">{{ copy.columns.override }}</th>
            <th scope="col">{{ copy.columns.validation }}</th>
            <th scope="col">{{ copy.columns.value }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="rows.length === 0">
            <td colspan="6">{{ copy.empty }}</td>
          </tr>
          <tr v-for="row in rows" v-bind:key="row.name">
            <th scope="row">{{ row.name }}</th>
            <td>{{ sourceLabel(row.source) }}</td>
            <td>{{ typeLabel(row.type) }}</td>
            <td>
              {{
                row.overriddenSources.length > 0
                  ? format(copy.overrides, {
                      sources: row.overriddenSources
                        .map(sourceLabel)
                        .join(", "),
                    })
                  : copy.notOverridden
              }}
            </td>
            <td>
              <span :class="{ 'environment-variables__invalid': !row.valid }">
                {{ row.valid ? copy.valid : copy.invalid }}
              </span>
            </td>
            <td>
              <code v-if="row.reference != null">
                {{ format(copy.secretReference, { reference: row.reference }) }}
              </code>
              <code v-else>{{ row.displayValue }}</code>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ul
      v-if="diagnostics.length > 0"
      class="environment-variables__diagnostics"
      :aria-label="copy.diagnostics"
    >
      <li
        v-for="(diagnostic, index) in diagnostics"
        v-bind:key="`${diagnostic.code}-${diagnostic.source}-${diagnostic.name}-${index}`"
      >
        {{ diagnosticMessage(diagnostic) }}
      </li>
    </ul>
  </section>
</template>

<script>
let tableSequence = 0;

export default {
  name: "EnvironmentVariablesTable",
  props: {
    copy: { type: Object, required: true },
    resolution: { type: Object, required: true },
  },
  data() {
    tableSequence += 1;
    return { tableId: `environment-variables-${tableSequence}` };
  },
  computed: {
    diagnostics() {
      return Array.isArray(this.resolution.diagnostics)
        ? this.resolution.diagnostics
        : [];
    },
    executionBlocked() {
      return this.resolution.executionBlocked === true;
    },
    rows() {
      return Array.isArray(this.resolution.rows) ? this.resolution.rows : [];
    },
  },
  methods: {
    diagnosticMessage(diagnostic) {
      const key = diagnostic.code.replace("environmentVariable.", "");
      const template = this.copy.validation[key] || diagnostic.code;
      return this.format(template, {
        members: diagnostic.context?.members?.join(" → ") || "",
        name: diagnostic.name || this.copy.unknown,
        reference: diagnostic.context?.reference || "",
        source: this.sourceLabel(diagnostic.source),
      });
    },
    format(template, values) {
      return Object.entries(values).reduce(
        (message, [key, value]) =>
          message.replaceAll(`{${key}}`, String(value)),
        template,
      );
    },
    sourceLabel(source) {
      return this.copy.sources[source] || source || this.copy.unknown;
    },
    typeLabel(type) {
      return this.copy.types[type] || type;
    },
  },
};
</script>

<style scoped>
.environment-variables {
  display: grid;
  gap: var(--id-space-4);
  min-width: 0;
}

.environment-variables__header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
  align-items: flex-start;
  justify-content: space-between;
}

.environment-variables__header h2,
.environment-variables__header p {
  margin: 0;
}

.environment-variables__status {
  padding: var(--id-space-2) var(--id-space-3);
  border-radius: var(--id-radius-pill);
  color: var(--id-color-success);
  background: color-mix(in srgb, var(--id-color-success) 14%, transparent);
}

.environment-variables__status--error,
.environment-variables__invalid {
  color: var(--id-color-danger);
}

.environment-variables__status--error {
  background: color-mix(in srgb, var(--id-color-danger) 14%, transparent);
}

.environment-variables__table-wrap {
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
}

.environment-variables table {
  width: 100%;
  min-width: 52rem;
  border-collapse: collapse;
}

.environment-variables th,
.environment-variables td {
  padding: var(--id-space-3);
  border-bottom: 1px solid var(--id-color-border);
  text-align: left;
  vertical-align: top;
}

.environment-variables tbody tr:last-child > * {
  border-bottom: 0;
}

.environment-variables code {
  overflow-wrap: anywhere;
}

.environment-variables__diagnostics {
  display: grid;
  gap: var(--id-space-2);
  margin: 0;
  padding: var(--id-space-3) var(--id-space-3) var(--id-space-3)
    calc(var(--id-space-3) + 1rem);
  border: 1px solid var(--id-color-danger);
  border-radius: var(--id-radius-medium);
  color: var(--id-color-danger);
  background: color-mix(in srgb, var(--id-color-danger) 10%, transparent);
}
</style>
