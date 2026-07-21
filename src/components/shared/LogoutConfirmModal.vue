<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="logout-modal-backdrop"
      role="presentation"
      v-on:click.self="cancel"
      v-on:keydown.esc="cancel"
      tabindex="-1"
    >
      <section
        class="logout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        aria-describedby="logout-modal-description"
      >
        <div class="logout-modal-icon" aria-hidden="true">
          <font-awesome-icon icon="door-open" />
        </div>
        <div class="logout-modal-content">
          <p class="logout-modal-eyebrow">Idelium session</p>
          <h2 id="logout-modal-title">{{ title }}</h2>
          <p id="logout-modal-description">{{ message }}</p>
        </div>
        <div class="logout-modal-actions">
          <button
            type="button"
            class="btn btn-outline-light logout-modal-button"
            v-on:click="cancel"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="btn logout-modal-confirm"
            v-on:click="confirm"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "LogoutConfirmModal",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    cancelLabel: {
      type: String,
      required: true,
    },
    confirmLabel: {
      type: String,
      required: true,
    },
  },
  emits: ["cancel", "confirm"],
  methods: {
    cancel() {
      this.$emit("cancel");
    },
    confirm() {
      this.$emit("confirm");
    },
  },
};
</script>

<style scoped>
.logout-modal-backdrop {
  align-items: center;
  background:
    radial-gradient(circle at top, rgba(255, 122, 24, 0.16), transparent 34rem),
    rgba(4, 6, 12, 0.84);
  backdrop-filter: blur(8px);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 1.5rem;
  position: fixed;
  z-index: 2000;
}

.logout-modal {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.08), transparent),
    #242631;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 1.2rem;
  box-shadow: 0 2rem 5rem rgba(0, 0, 0, 0.45);
  color: #f8fafc;
  display: grid;
  gap: 1rem;
  grid-template-columns: auto 1fr;
  max-width: 34rem;
  padding: 1.35rem;
  width: min(100%, 34rem);
}

.logout-modal-icon {
  align-items: center;
  background: linear-gradient(135deg, #ff7a18, #ff4b2b);
  border-radius: 1rem;
  box-shadow: 0 1rem 2rem rgba(255, 107, 30, 0.24);
  color: #11131a;
  display: inline-flex;
  height: 3rem;
  justify-content: center;
  width: 3rem;
}

.logout-modal-content {
  min-width: 0;
}

.logout-modal-eyebrow {
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  margin: 0 0 0.35rem;
  text-transform: uppercase;
}

.logout-modal h2 {
  color: #ffffff;
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0;
}

.logout-modal p {
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.55;
  margin: 0.55rem 0 0;
}

.logout-modal-actions {
  display: flex;
  gap: 0.75rem;
  grid-column: 1 / -1;
  justify-content: flex-end;
  margin-top: 0.4rem;
}

.logout-modal-button,
.logout-modal-confirm {
  border-radius: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 0.75rem 1rem;
  text-transform: uppercase;
}

.logout-modal-confirm {
  background: linear-gradient(135deg, #ff7a18, #ff4b2b);
  border: 0;
  color: #11131a;
}

.logout-modal-confirm:hover {
  color: #11131a;
  filter: brightness(1.04);
}

@media (max-width: 520px) {
  .logout-modal {
    grid-template-columns: 1fr;
  }

  .logout-modal-actions {
    flex-direction: column-reverse;
  }
}
</style>
