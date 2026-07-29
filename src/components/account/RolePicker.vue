<template>
  <section class="role-picker" :aria-labelledby="`${pickerId}-title`">
    <div class="role-picker__header">
      <div>
        <h3 :id="`${pickerId}-title`">{{ copy.title }}</h3>
        <p>{{ copy.description }}</p>
      </div>
      <p class="role-picker__status" aria-live="polite">
        {{ selectedRole ? selectedRole.displayName : copy.noRoleSelected }}
      </p>
    </div>

    <div class="role-picker__options" role="radiogroup" :aria-label="copy.title">
      <button
        v-for="role in pickerOptions"
        v-bind:key="role.stableId"
        type="button"
        class="role-picker__option"
        :class="{
          'role-picker__option--selected': role.stableId === modelValue,
          'role-picker__option--disabled': !role.allowed,
        }"
        role="radio"
        :aria-checked="role.stableId === modelValue"
        :aria-describedby="`${pickerId}-${role.stableId}-details`"
        :disabled="!role.allowed"
        v-on:click="selectRole(role)"
      >
        <span>
          <strong>{{ role.displayName }}</strong>
          <small>{{ role.purpose }}</small>
        </span>
        <span class="role-picker__risk" :data-risk="role.riskLevel">
          {{ riskLabel(role.riskLevel) }}
        </span>
        <span
          :id="`${pickerId}-${role.stableId}-details`"
          class="role-picker__details"
        >
          {{ role.permissionsSummary }}
          <template v-if="!role.allowed"> — {{ role.disabledReason }}</template>
        </span>
      </button>
    </div>

    <p v-if="reductionWarning" class="role-picker__warning" role="alert">
      {{ reductionWarningLabel }}
    </p>

    <div class="role-picker__matrix" :aria-label="copy.matrixTitle">
      <h4>{{ copy.matrixTitle }}</h4>
      <div
        v-for="group in matrix"
        v-bind:key="group.group"
        class="role-picker__matrix-group"
      >
        <h5>{{ groupLabel(group.group) }}</h5>
        <div class="role-picker__matrix-table" role="table">
          <div class="role-picker__matrix-row" role="row">
            <span role="columnheader">{{ copy.permission }}</span>
            <span
              v-for="role in pickerOptions"
              v-bind:key="role.stableId"
              role="columnheader"
            >
              {{ role.displayName }}
            </span>
          </div>
          <div
            v-for="permission in group.permissions"
            v-bind:key="permission.permission"
            class="role-picker__matrix-row"
            role="row"
          >
            <span role="rowheader">{{ permissionLabel(permission.permission) }}</span>
            <span
              v-for="role in pickerOptions"
              v-bind:key="role.stableId"
              role="cell"
            >
              <span
                :aria-label="
                  permission.roles[role.stableId]
                    ? copy.permissionAllowed
                    : copy.permissionDenied
                "
              >
                {{ permission.roles[role.stableId] ? "✓" : "—" }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import {
  buildRolePickerOptions,
  permissionMatrixForRoles,
  roleReductionWarning,
} from "@/domain/accountGovernance";

let rolePickerSequence = 0;

export default {
  name: "RolePicker",
  emits: ["update:modelValue"],
  props: {
    assignableRoleIds: { type: Array, default: () => [] },
    copy: { type: Object, required: true },
    currentRole: { type: [Object, String, Number], default: null },
    languageCode: { type: String, default: "gb" },
    modelValue: { type: [String, Number], default: null },
    roles: { type: Array, default: () => [] },
  },
  data() {
    rolePickerSequence += 1;
    return { pickerId: `role-picker-${rolePickerSequence}` };
  },
  computed: {
    pickerOptions() {
      return buildRolePickerOptions(this.roles, {
        assignableRoleIds: this.assignableRoleIds,
        copy: { unavailableRole: this.copy.unavailableRole },
        language: this.languageCode,
      });
    },
    matrix() {
      return permissionMatrixForRoles(this.roles, {
        assignableRoleIds: this.assignableRoleIds,
        copy: { unavailableRole: this.copy.unavailableRole },
        language: this.languageCode,
      });
    },
    selectedRole() {
      return this.pickerOptions.find((role) => role.stableId === String(this.modelValue));
    },
    reductionWarning() {
      if (!this.currentRole || !this.selectedRole) return "";
      return roleReductionWarning(this.currentRole, this.selectedRole, {
        language: this.languageCode,
      });
    },
    reductionWarningLabel() {
      return this.copy.reductionWarnings[this.reductionWarning] || "";
    },
  },
  methods: {
    groupLabel(group) {
      return this.copy.groups[group] || group;
    },
    permissionLabel(permission) {
      return this.copy.permissions[permission] || permission;
    },
    riskLabel(risk) {
      return this.copy.riskLevels[risk] || risk;
    },
    selectRole(role) {
      if (!role.allowed) return;
      this.$emit("update:modelValue", role.stableId);
    },
  },
};
</script>

<style scoped>
.role-picker {
  display: grid;
  gap: var(--id-space-4);
  min-width: 0;
}

.role-picker__header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
  align-items: flex-start;
  justify-content: space-between;
}

.role-picker h3,
.role-picker h4,
.role-picker h5,
.role-picker p {
  margin: 0;
}

.role-picker__header p {
  color: var(--id-color-text-muted);
}

.role-picker__status {
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-pill);
  padding: var(--id-space-2) var(--id-space-3);
  color: var(--id-color-text);
  background: var(--id-color-surface-raised);
  font-weight: var(--id-font-weight-bold);
}

.role-picker__options {
  display: grid;
  gap: var(--id-space-3);
}

.role-picker__option {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--id-space-3);
  width: 100%;
  padding: var(--id-space-4);
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  color: var(--id-color-text);
  background: var(--id-color-surface-raised);
  text-align: left;
}

.role-picker__option--selected {
  border-color: var(--id-color-accent);
  box-shadow: 0 0 0 0.15rem var(--id-color-focus-ring);
}

.role-picker__option--disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.role-picker__option strong,
.role-picker__option small,
.role-picker__details {
  display: block;
}

.role-picker__option small,
.role-picker__details {
  color: var(--id-color-text-muted);
}

.role-picker__risk {
  align-self: start;
  border-radius: var(--id-radius-pill);
  padding: var(--id-space-1) var(--id-space-2);
  font-size: var(--id-font-size-caption);
  font-weight: var(--id-font-weight-bold);
}

.role-picker__risk[data-risk="low"] {
  color: var(--id-color-success);
  background: var(--id-color-success-subtle);
}

.role-picker__risk[data-risk="medium"] {
  color: var(--id-color-info);
  background: var(--id-color-info-subtle);
}

.role-picker__risk[data-risk="high"],
.role-picker__risk[data-risk="critical"] {
  color: var(--id-color-warning);
  background: var(--id-color-warning-subtle);
}

.role-picker__details {
  grid-column: 1 / -1;
}

.role-picker__warning {
  border: 1px solid var(--id-color-warning);
  border-radius: var(--id-radius-medium);
  padding: var(--id-space-3);
  color: var(--id-color-warning);
  background: var(--id-color-warning-subtle);
}

.role-picker__matrix {
  display: grid;
  gap: var(--id-space-3);
}

.role-picker__matrix-group {
  display: grid;
  gap: var(--id-space-2);
}

.role-picker__matrix-table {
  overflow: auto;
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
}

.role-picker__matrix-row {
  display: grid;
  grid-template-columns: minmax(9rem, 1fr) repeat(
      var(--role-picker-columns, 4),
      minmax(6rem, 0.6fr)
    );
  min-width: max-content;
}

.role-picker__matrix-row > span {
  padding: var(--id-space-2) var(--id-space-3);
  border-bottom: 1px solid var(--id-color-border);
}

.role-picker__matrix-row:last-child > span {
  border-bottom: 0;
}

.role-picker__matrix-row:first-child {
  color: var(--id-color-text);
  background: var(--id-color-surface);
  font-weight: var(--id-font-weight-bold);
}
</style>
