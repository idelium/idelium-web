<template>
  <section class="launch-review" :aria-label="copy.accessibleLabel">
    <header class="launch-review__header">
      <div>
        <p>{{ copy.eyebrow }}</p>
        <h2>{{ copy.title }}</h2>
        <span>{{ copy.description }}</span>
      </div>
      <div class="launch-review__actions">
        <button
          class="btn btn-outline-light btn-sm"
          type="button"
          v-on:click="copyCommand"
        >
          {{ copied ? copy.copied : copy.copyCommand }}
        </button>
        <button
          class="btn btn-outline-light btn-sm"
          type="button"
          v-on:click="downloadSummary"
        >
          {{ copy.download }}
        </button>
      </div>
    </header>

    <dl class="launch-review__grid">
      <div v-for="row in summary.rows" v-bind:key="row.key">
        <dt>{{ label(row.key) }}</dt>
        <dd>{{ row.value }}</dd>
      </div>
    </dl>

    <div class="launch-review__command">
      <label :for="commandId">{{ copy.cliCommand }}</label>
      <textarea :id="commandId" readonly :value="summary.cliCommand"></textarea>
    </div>

    <div v-if="summary.warnings.length > 0" class="launch-review__warnings">
      <h3>{{ copy.warnings }}</h3>
      <ul>
        <li v-for="warning in summary.warnings" v-bind:key="warning.code">
          {{ warning.message }}
        </li>
      </ul>
    </div>

    <p class="launch-review__feedback" aria-live="polite">
      {{ copied ? copy.copiedFeedback : "" }}
    </p>
  </section>
</template>

<script>
import copy from "copy-to-clipboard";

import { serializeLaunchReview } from "@/domain/launchReview";

let reviewSequence = 0;

export default {
  name: "LaunchReviewSummary",
  props: {
    copy: { type: Object, required: true },
    summary: { type: Object, required: true },
  },
  data() {
    reviewSequence += 1;
    return {
      commandId: `launch-review-command-${reviewSequence}`,
      copied: false,
    };
  },
  methods: {
    copyCommand() {
      this.copied = copy(this.summary.cliCommand);
    },
    downloadSummary() {
      const blob = new Blob([serializeLaunchReview(this.summary)], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "idelium-launch-review.json";
      link.click();
      URL.revokeObjectURL(link.href);
    },
    label(key) {
      return this.copy.labels?.[key] ?? key;
    },
  },
};
</script>

<style scoped>
.launch-review {
  display: grid;
  gap: var(--id-space-4);
  min-width: 0;
}

.launch-review__header {
  align-items: flex-start;
  display: flex;
  gap: var(--id-space-4);
  justify-content: space-between;
}

.launch-review__header p,
.launch-review__header h2,
.launch-review__header span {
  margin: 0;
}

.launch-review__header p,
.launch-review dt {
  color: var(--id-color-text-muted);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.launch-review__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-2);
}

.launch-review__grid {
  display: grid;
  gap: var(--id-space-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
}

.launch-review dd {
  color: var(--id-color-text);
  font-weight: 700;
  margin: var(--id-space-1) 0 0;
}

.launch-review__command {
  display: grid;
  gap: var(--id-space-2);
}

.launch-review__command textarea {
  background: var(--id-color-surface);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-medium);
  color: var(--id-color-text);
  min-height: 5rem;
  padding: var(--id-space-3);
  resize: vertical;
}

.launch-review__warnings {
  border: 1px solid var(--id-color-warning);
  border-radius: var(--id-radius-medium);
  padding: var(--id-space-3);
}

.launch-review__warnings h3 {
  margin-top: 0;
}

.launch-review__feedback {
  min-height: 1.25rem;
}

@media (max-width: 64rem) {
  .launch-review__header {
    flex-direction: column;
  }

  .launch-review__grid {
    grid-template-columns: 1fr;
  }
}
</style>
