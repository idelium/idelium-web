<template>
  <Teleport to="body">
    <div
      v-if="dialog.visible"
      class="enterprise-dialog-backdrop"
      role="presentation"
      tabindex="-1"
      v-on:click.self="cancel"
      v-on:keydown="handleKeydown"
    >
      <section
        ref="dialogElement"
        class="enterprise-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enterprise-dialog-title"
        aria-describedby="enterprise-dialog-message"
        tabindex="-1"
      >
        <div
          :class="['enterprise-dialog-icon', dialog.variant]"
          aria-hidden="true"
        >
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
            ref="cancelButton"
            type="button"
            class="id-button id-button--secondary enterprise-dialog-button"
            v-on:click="cancel"
          >
            {{ dialog.cancelLabel }}
          </button>
          <button
            ref="confirmButton"
            type="button"
            :class="[
              'id-button',
              dialog.variant === 'danger'
                ? 'id-button--danger'
                : 'id-button--primary',
              'enterprise-dialog-confirm',
            ]"
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
      previouslyFocusedElement: null,
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
      this.previouslyFocusedElement = document.activeElement;
      this.dialog = {
        ...DEFAULT_DIALOG,
        ...payload,
        visible: true,
      };
      this.$nextTick(() => {
        const initialFocus =
          this.dialog.type === "confirm"
            ? this.$refs.cancelButton
            : this.$refs.confirmButton;
        initialFocus?.focus();
      });
    },
    close(value) {
      const resolver = this.dialog.resolver;
      this.dialog = { ...DEFAULT_DIALOG };
      this.$nextTick(() => {
        if (
          this.previouslyFocusedElement instanceof HTMLElement &&
          document.contains(this.previouslyFocusedElement)
        ) {
          this.previouslyFocusedElement.focus();
        }
        this.previouslyFocusedElement = null;
      });
      resolver?.(value);
    },
    cancel() {
      this.close(false);
    },
    confirm() {
      this.close(true);
    },
    handleKeydown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        this.cancel();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        this.$refs.dialogElement?.querySelectorAll(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ) || [],
      );
      if (!focusable.length) {
        event.preventDefault();
        this.$refs.dialogElement?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
  },
};
</script>
