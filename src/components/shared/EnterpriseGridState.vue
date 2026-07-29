<template>
  <section
    :class="['enterprise-grid-state', `enterprise-grid-state--${variant}`]"
    role="status"
    aria-live="polite"
  >
    <div class="enterprise-grid-state__icon" aria-hidden="true">
      <font-awesome-icon :icon="iconName" />
    </div>
    <div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
  </section>
</template>

<script>
export default {
  name: "EnterpriseGridState",
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    variant: {
      type: String,
      default: "empty",
      validator(value) {
        return [
          "empty",
          "loading",
          "error",
          "permission",
          "partial",
          "stale",
        ].includes(value);
      },
    },
  },
  computed: {
    iconName() {
      const icons = {
        empty: "table",
        error: "exclamation-triangle",
        loading: "sync",
        permission: "lock",
        partial: "exclamation-circle",
        stale: "history",
      };
      return icons[this.variant] || icons.empty;
    },
  },
};
</script>

<style scoped>
.enterprise-grid-state {
  align-items: center;
  background:
    radial-gradient(
      circle at top left,
      rgba(255, 107, 30, 0.12),
      transparent 18rem
    ),
    rgba(255, 255, 255, 0.035);
  border: 1px dashed rgba(255, 255, 255, 0.16);
  border-radius: 1rem;
  color: rgba(246, 247, 251, 0.72);
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  min-height: 8rem;
  padding: 1.25rem;
}

.enterprise-grid-state__icon {
  align-items: center;
  background: rgba(255, 107, 30, 0.16);
  border: 1px solid rgba(255, 107, 30, 0.42);
  border-radius: 0.9rem;
  color: #ffb37a;
  display: inline-flex;
  flex: 0 0 auto;
  height: 3rem;
  justify-content: center;
  width: 3rem;
}

.enterprise-grid-state h3 {
  color: #f6f7fb;
  font-size: 0.92rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  margin: 0 0 0.4rem;
  text-transform: uppercase;
}

.enterprise-grid-state p {
  margin: 0;
}

.enterprise-grid-state--error .enterprise-grid-state__icon,
.enterprise-grid-state--permission .enterprise-grid-state__icon {
  background: rgba(220, 53, 69, 0.14);
  border-color: rgba(220, 53, 69, 0.42);
  color: #ff9aa6;
}
</style>
