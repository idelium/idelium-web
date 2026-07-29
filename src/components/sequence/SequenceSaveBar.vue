<template>
  <section class="sequence-save-bar" :aria-label="copy.title">
    <div>
      <strong>{{ dirty ? copy.unsaved : copy.saved }}</strong>
      <span>
        {{ copy.lastSaved }}:
        {{ lastSavedAt ? formatTimestamp(lastSavedAt) : copy.never }}
      </span>
      <span>{{ copy.serverVersion }}: {{ serverVersion || copy.legacy }}</span>
    </div>
    <div class="sequence-save-bar__actions">
      <IdButton
        variant="secondary"
        :disabled="!canUndo"
        v-on:click="$emit('undo')"
      >
        {{ copy.undo }}
      </IdButton>
      <IdButton
        variant="secondary"
        :disabled="!canRedo"
        v-on:click="$emit('redo')"
      >
        {{ copy.redo }}
      </IdButton>
      <IdButton
        variant="secondary"
        :disabled="!dirty"
        v-on:click="$emit('discard')"
      >
        {{ copy.discard }}
      </IdButton>
      <IdButton
        variant="primary"
        :disabled="!dirty || !canSave"
        :loading="saving"
        v-on:click="$emit('save')"
      >
        {{ copy.save }}
      </IdButton>
    </div>

    <aside v-if="conflict" class="sequence-save-bar__conflict" role="alert">
      <div>
        <strong>{{ copy.conflictTitle }}</strong>
        <p>{{ copy.conflictDescription }}</p>
      </div>
      <div class="sequence-save-bar__actions">
        <IdButton
          v-if="conflict.canReload"
          variant="danger"
          v-on:click="$emit('reload')"
        >
          {{ copy.reload }}
        </IdButton>
        <IdButton
          v-if="conflict.canCompare"
          variant="secondary"
          v-on:click="$emit('compare')"
        >
          {{ copy.compare }}
        </IdButton>
        <IdButton
          v-if="conflict.canRetry"
          variant="primary"
          v-on:click="$emit('retry')"
        >
          {{ copy.retry }}
        </IdButton>
      </div>
    </aside>
  </section>
</template>

<script>
import IdButton from "@/components/ui/IdButton.vue";

export default {
  name: "SequenceSaveBar",
  components: { IdButton },
  emits: ["compare", "discard", "redo", "reload", "retry", "save", "undo"],
  props: {
    canRedo: { type: Boolean, default: false },
    canSave: { type: Boolean, default: true },
    canUndo: { type: Boolean, default: false },
    conflict: { type: Object, default: null },
    copy: { type: Object, required: true },
    dirty: { type: Boolean, default: false },
    lastSavedAt: { type: String, default: null },
    locale: { type: String, default: "en" },
    saving: { type: Boolean, default: false },
    serverVersion: { type: [String, Number], default: null },
  },
  methods: {
    formatTimestamp(value) {
      const timestamp = new Date(value);
      if (Number.isNaN(timestamp.getTime())) return this.copy.never;
      return new Intl.DateTimeFormat(this.locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(timestamp);
    },
  },
};
</script>

<style scoped>
.sequence-save-bar {
  background: var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  display: grid;
  gap: var(--id-space-3);
  padding: var(--id-space-4);
}

.sequence-save-bar > div,
.sequence-save-bar__actions,
.sequence-save-bar__conflict {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
}

.sequence-save-bar > div:first-child {
  justify-content: space-between;
}

.sequence-save-bar__actions {
  justify-content: flex-end;
}

.sequence-save-bar__conflict {
  border-top: 1px solid var(--id-color-border);
  justify-content: space-between;
  padding-top: var(--id-space-3);
}

.sequence-save-bar__conflict p {
  margin: 0;
}
</style>
