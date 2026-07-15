<template>
  <table
    class="table table-striped costum"
    aria-label="Postman execution results"
  >
    <thead>
      <tr>
        <th scope="col">{{ labels.id }}</th>
        <th scope="col">{{ labels.status }}</th>
        <th scope="col">{{ labels.method }}</th>
        <th scope="col">{{ labels.url }}</th>
        <th scope="col">{{ labels.assertions }}</th>
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
        <td>{{ result.method }}</td>
        <td>{{ result.url }}</td>
        <td>{{ assertionSummary(result) }}</td>
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
