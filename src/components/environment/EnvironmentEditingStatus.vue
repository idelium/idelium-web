<template>
  <section
    class="environment-editing-status"
    :aria-labelledby="`${statusId}-title`"
  >
    <div>
      <h2 :id="`${statusId}-title`">{{ copy.title }}</h2>
      <p aria-live="polite">
        {{ statusMessage }}
      </p>
    </div>
    <div class="environment-editing-status__actions">
      <button
        type="button"
        :disabled="!session.dirty || saving"
        v-on:click="$emit('discard')"
      >
        {{ copy.discard }}
      </button>
      <button
        type="button"
        :disabled="!session.dirty || saving"
        v-on:click="$emit('save')"
      >
        {{ saving ? copy.saving : copy.save }}
      </button>
      <button type="button" v-on:click="$emit('archive')">
        {{ copy.archive }}
      </button>
    </div>

    <div
      v-if="session.status === 'conflict'"
      class="environment-editing-status__conflict"
      role="alert"
    >
      <h3>{{ copy.conflict.title }}</h3>
      <p>{{ copy.conflict.description }}</p>
    </div>

    <div
      v-if="leaveConfirmation"
      class="environment-editing-status__confirmation"
      role="alertdialog"
      :aria-labelledby="`${statusId}-leave-title`"
      aria-modal="true"
    >
      <h3 :id="`${statusId}-leave-title`">{{ copy.leave.title }}</h3>
      <p>{{ copy.leave.description }}</p>
      <div>
        <button type="button" v-on:click="$emit('stay')">
          {{ copy.leave.stay }}
        </button>
        <button type="button" v-on:click="$emit('leave')">
          {{ copy.leave.confirm }}
        </button>
      </div>
    </div>
  </section>
</template>

<script>
let statusSequence = 0;

export default {
  name: "EnvironmentEditingStatus",
  emits: ["archive", "discard", "leave", "save", "stay"],
  props: {
    copy: { type: Object, required: true },
    leaveConfirmation: { type: Boolean, default: false },
    saving: { type: Boolean, default: false },
    session: { type: Object, required: true },
  },
  data() {
    statusSequence += 1;
    return { statusId: `environment-editing-status-${statusSequence}` };
  },
  computed: {
    statusMessage() {
      if (this.session.status === "failed") return this.copy.failed;
      if (this.session.dirty) return this.copy.unsaved;
      if (this.session.lastSavedAt) {
        return this.copy.lastSaved.replace(
          "{timestamp}",
          this.session.lastSavedAt,
        );
      }
      return this.copy.saved;
    },
  },
};
</script>

<style scoped>
.environment-editing-status {
  position: sticky;
  bottom: var(--id-space-3);
  z-index: 3;
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
  align-items: center;
  justify-content: space-between;
  padding: var(--id-space-3);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  background: var(--id-color-surface);
  box-shadow: var(--id-shadow-raised);
}

.environment-editing-status h2,
.environment-editing-status h3,
.environment-editing-status p {
  margin: 0;
}

.environment-editing-status__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-2);
}

.environment-editing-status__conflict {
  flex-basis: 100%;
  padding: var(--id-space-3);
  border: 1px solid var(--id-color-danger);
  border-radius: var(--id-radius-medium);
  color: var(--id-color-danger);
}

.environment-editing-status__confirmation {
  position: fixed;
  z-index: 1100;
  inset: 50% auto auto 50%;
  display: grid;
  width: min(32rem, calc(100vw - 2rem));
  gap: var(--id-space-4);
  padding: var(--id-space-5);
  border: 1px solid var(--id-color-border-strong);
  border-radius: var(--id-radius-large);
  background: var(--id-color-surface-raised);
  box-shadow: var(--id-shadow-dialog);
  transform: translate(-50%, -50%);
}

.environment-editing-status__confirmation > div {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-2);
  justify-content: flex-end;
}
</style>
