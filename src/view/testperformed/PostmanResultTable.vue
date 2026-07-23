<template>
  <table
    class="table table-striped costum"
    aria-label="Postman execution results"
  >
    <thead>
      <tr>
        <th scope="col">{{ labels.id }}</th>
        <th scope="col">{{ labels.status }}</th>
        <th scope="col">{{ labels.request }}</th>
        <th scope="col">{{ labels.method }}</th>
        <th scope="col">{{ labels.url }}</th>
        <th scope="col">{{ labels.assertions }}</th>
        <th scope="col">{{ labels.diagnostic }}</th>
        <th scope="col">{{ labels.time }}</th>
        <th scope="col">{{ labels.response }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(result, index) in results" :key="result.id">
        <td>{{ index + 1 }}</td>
        <td>
          <span :class="`badge text-bg-${statusVariant(result)}`">{{
            result.status
          }}</span>
        </td>
        <td class="postman-request-cell">
          <span :title="result.name">{{ result.name || "—" }}</span>
        </td>
        <td>{{ result.method }}</td>
        <td class="postman-url-cell">
          <span :title="result.url">{{ result.url || "—" }}</span>
        </td>
        <td>{{ assertionSummary(result) }}</td>
        <td class="postman-diagnostic-cell">
          <span v-if="result.diagnostic" class="postman-diagnostic-message">
            {{ result.diagnostic }}
          </span>
          <span v-else class="postman-diagnostic-empty">—</span>
        </td>
        <td>{{ result.time }}</td>
        <td>
          <button
            type="button"
            class="btn btn-primary"
            @click="$emit('show-response', result)"
          >
            {{ labels.showResponse }}
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { statusVariant } from "@/domain/postmanResults";

defineProps({
  results: { type: Array, required: true },
  labels: { type: Object, required: true },
});

defineEmits(["show-response"]);

function assertionSummary(result) {
  if (result.assertions.length === 0)
    return result.passed ? "Passed" : "Failed";
  const passed = result.assertions.filter(
    (assertion) => assertion.passed !== false,
  ).length;
  return `${passed}/${result.assertions.length}`;
}
</script>

<style scoped>
.postman-diagnostic-cell {
  max-width: 34rem;
  white-space: normal;
}

.postman-request-cell {
  max-width: 15rem;
}

.postman-url-cell {
  max-width: 25rem;
}

.postman-request-cell span,
.postman-url-cell span {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;
}

.postman-url-cell span {
  color: #9fd3ff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 0.74rem;
  letter-spacing: 0.02em;
  text-transform: none;
}

.postman-diagnostic-message {
  color: #ffb8a3;
  display: inline-block;
  font-size: 0.78rem;
  line-height: 1.45;
}

.postman-diagnostic-empty {
  color: rgba(255, 255, 255, 0.35);
}
</style>
