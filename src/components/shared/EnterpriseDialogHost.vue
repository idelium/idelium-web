<template>
  <Teleport to="body">
    <div
      v-if="dialog.visible"
      class="enterprise-dialog-backdrop"
      role="presentation"
      tabindex="-1"
      v-on:click.self="cancel"
      v-on:keydown.esc="cancel"
    >
      <section
        class="enterprise-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enterprise-dialog-title"
        aria-describedby="enterprise-dialog-message"
      >
        <div :class="['enterprise-dialog-icon', dialog.variant]" aria-hidden="true">
          <font-awesome-icon :icon="iconName" />
        </div>
        <div class="enterprise-dialog-content">
          <p class="enterprise-dialog-eyebrow">Idelium console</p>
          <h2 id="enterprise-dialog-title">{{ dialog.title }}</h2>
          <p id="enterprise-dialog-message">{{ dialog.message }}</p>
        </div>
        <div class="enterprise-dialog-actions">
          <button
            v-if="dialog.type === 'confirm'"
            type="button"
            class="btn btn-outline-light enterprise-dialog-button"
            v-on:click="cancel"
          >
            {{ dialog.cancelLabel }}
          </button>
          <button
            type="button"
            class="btn enterprise-dialog-confirm"
            v-on:click="confirm"
          >
            {{ dialog.confirmLabel }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script>
const DEFAULT_DIALOG = {
  cancelLabel: "Cancel",
  confirmLabel: "OK",
  message: "",
  resolver: null,
  title: "Attention",
  type: "alert",
  variant: "info",
  visible: false,
};

export default {
  name: "EnterpriseDialogHost",
  data() {
    return {
      dialog: { ...DEFAULT_DIALOG },
    };
  },
  computed: {
    iconName() {
      if (this.dialog.variant === "danger") return "times-circle";
      if (this.dialog.variant === "warning") return "door-open";
      return "user-circle";
    },
  },
  created() {
    this.emitter.on("enterprise-dialog:show", this.showDialog);
  },
  beforeUnmount() {
    this.emitter.off("enterprise-dialog:show", this.showDialog);
  },
  methods: {
    showDialog(payload) {
      this.dialog = {
        ...DEFAULT_DIALOG,
        ...payload,
        visible: true,
      };
    },
    close(value) {
      const resolver = this.dialog.resolver;
      this.dialog = { ...DEFAULT_DIALOG };
      resolver?.(value);
    },
    cancel() {
      this.close(false);
    },
    confirm() {
      this.close(true);
    },
  },
};
</script>

<style scoped>
.enterprise-dialog-backdrop {
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
  z-index: 2100;
}

.enterprise-dialog {
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

.enterprise-dialog-icon {
  align-items: center;
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  border-radius: 1rem;
  box-shadow: 0 1rem 2rem rgba(56, 189, 248, 0.18);
  color: #0f172a;
  display: inline-flex;
  height: 3rem;
  justify-content: center;
  width: 3rem;
}

.enterprise-dialog-icon.warning {
  background: linear-gradient(135deg, #ff7a18, #ff4b2b);
  box-shadow: 0 1rem 2rem rgba(255, 107, 30, 0.24);
  color: #11131a;
}

.enterprise-dialog-icon.danger {
  background: linear-gradient(135deg, #fb7185, #dc2626);
  box-shadow: 0 1rem 2rem rgba(220, 38, 38, 0.24);
  color: #11131a;
}

.enterprise-dialog-content {
  min-width: 0;
}

.enterprise-dialog-eyebrow {
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  margin: 0 0 0.35rem;
  text-transform: uppercase;
}

.enterprise-dialog h2 {
  color: #ffffff;
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0;
}

.enterprise-dialog p {
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.55;
  margin: 0.55rem 0 0;
}

.enterprise-dialog-actions {
  display: flex;
  gap: 0.75rem;
  grid-column: 1 / -1;
  justify-content: flex-end;
  margin-top: 0.4rem;
}

.enterprise-dialog-button,
.enterprise-dialog-confirm {
  border-radius: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 0.75rem 1rem;
  text-transform: uppercase;
}

.enterprise-dialog-confirm {
  background: linear-gradient(135deg, #ff7a18, #ff4b2b);
  border: 0;
  color: #11131a;
}

.enterprise-dialog-confirm:hover {
  color: #11131a;
  filter: brightness(1.04);
}

@media (max-width: 520px) {
  .enterprise-dialog {
    grid-template-columns: 1fr;
  }

  .enterprise-dialog-actions {
    flex-direction: column-reverse;
  }
}
</style>
