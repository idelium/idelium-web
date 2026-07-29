<template>
  <section
    class="mode-conversion-dialog"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="dialogTitleId"
  >
    <header>
      <div>
        <h2 :id="dialogTitleId">{{ copy.title }}</h2>
        <p>
          {{
            format(copy.description, {
              source: modeLabel(plan.sourceMode),
              target: modeLabel(plan.targetMode),
            })
          }}
        </p>
      </div>
    </header>

    <dl class="mode-conversion-dialog__summary">
      <div v-for="disposition in dispositions" v-bind:key="disposition">
        <dt>{{ copy.dispositions[disposition] }}</dt>
        <dd>{{ dispositionCount(disposition) }}</dd>
      </div>
    </dl>

    <ul class="mode-conversion-dialog__constructs">
      <li
        v-for="construct in plan.constructs"
        v-bind:key="`${construct.code}:${construct.path}`"
        :class="`mode-conversion-dialog__construct--${construct.severity}`"
      >
        <strong>{{ constructMessage(construct) }}</strong>
        <span>{{ format(copy.location, { path: construct.path }) }}</span>
      </li>
    </ul>

    <p v-if="plan.blocked" class="mode-conversion-dialog__blocked" role="alert">
      {{ copy.blocked }}
    </p>
    <label
      v-else-if="plan.requiresAcknowledgement"
      class="mode-conversion-dialog__acknowledgement"
    >
      <input v-model="acknowledged" type="checkbox" />
      {{ copy.acknowledgeLoss }}
    </label>

    <footer>
      <button type="button" v-on:click="$emit('cancel')">
        {{ copy.cancel }}
      </button>
      <button
        type="button"
        :disabled="
          plan.blocked || (plan.requiresAcknowledgement && !acknowledged)
        "
        v-on:click="confirm"
      >
        {{ copy.convert }}
      </button>
    </footer>
  </section>
</template>

<script>
import {
  executeStepModeConversion,
  planStepModeConversion,
} from "@/domain/stepModeConversion";

let dialogSequence = 0;

export default {
  name: "ModeConversionDialog",
  emits: ["cancel", "convert"],
  props: {
    copy: { type: Object, required: true },
    model: { type: Object, required: true },
    source: { type: String, default: "" },
    targetMode: { type: String, required: true },
  },
  data() {
    dialogSequence += 1;
    return {
      acknowledged: false,
      dialogTitleId: `mode-conversion-title-${dialogSequence}`,
    };
  },
  computed: {
    dispositions() {
      return ["preserved", "normalized", "lossy", "unsupported"];
    },
    plan() {
      return planStepModeConversion(this.model, this.targetMode, {
        source: this.source,
      });
    },
  },
  methods: {
    confirm() {
      const result = executeStepModeConversion(this.model, this.plan, {
        acknowledged: this.acknowledged,
        source: this.source,
      });
      if (result.converted != null) this.$emit("convert", result);
    },
    constructMessage(construct) {
      return (
        this.copy.constructs[construct.code] || this.copy.constructs.default
      );
    },
    dispositionCount(disposition) {
      return this.plan.constructs.filter(
        (construct) => construct.disposition === disposition,
      ).length;
    },
    format(template, values) {
      return Object.entries(values).reduce(
        (message, [key, value]) =>
          message.replaceAll(`{${key}}`, String(value)),
        template,
      );
    },
    modeLabel(mode) {
      return this.copy.modes[mode] || mode;
    },
  },
};
</script>

<style scoped>
.mode-conversion-dialog {
  display: grid;
  gap: var(--id-space-4);
  width: min(42rem, calc(100vw - var(--id-space-6)));
  max-height: min(44rem, calc(100dvh - var(--id-space-6)));
  padding: var(--id-space-5);
  overflow: auto;
  border: 1px solid var(--id-color-border);
  border-radius: var(--id-radius-large);
  background: var(--id-color-surface-raised);
  box-shadow: var(--id-shadow-dialog);
}

.mode-conversion-dialog h2,
.mode-conversion-dialog p,
.mode-conversion-dialog dl,
.mode-conversion-dialog dd {
  margin: 0;
}

.mode-conversion-dialog__summary,
.mode-conversion-dialog footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
}

.mode-conversion-dialog__summary div {
  min-width: 7rem;
}

.mode-conversion-dialog__constructs {
  display: grid;
  gap: var(--id-space-2);
  margin: 0;
  padding-inline-start: var(--id-space-5);
}

.mode-conversion-dialog__constructs li {
  display: grid;
  gap: var(--id-space-1);
}

.mode-conversion-dialog__construct--error,
.mode-conversion-dialog__blocked {
  color: var(--id-color-danger-text);
}

.mode-conversion-dialog__construct--warning {
  color: var(--id-color-warning-text);
}

.mode-conversion-dialog__acknowledgement {
  display: flex;
  gap: var(--id-space-2);
  align-items: center;
}

.mode-conversion-dialog footer {
  justify-content: flex-end;
}
</style>
