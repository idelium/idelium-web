import { STEP_EDITOR_MODES } from "@/domain/stepEditor";

const MAX_CONVERSION_ACTIONS = 500;

export function planStepModeConversion(model, targetMode, options = {}) {
  const sourceMode = normalizeMode(model?.mode);
  const target = normalizeMode(targetMode);
  const actions = (Array.isArray(model?.actions) ? model.actions : []).slice(
    0,
    MAX_CONVERSION_ACTIONS,
  );
  const constructs = [];

  if (sourceMode === target) {
    constructs.push(construct("preserved", "mode", "$", { mode: target }));
  }
  actions.forEach((action, index) => {
    const capability = action?.contract?.capabilities?.[target];
    constructs.push(
      capability === true
        ? construct("preserved", "action", `actions[${index}]`, {
            actionType:
              action?.contract?.actionType ??
              action?.config?.stepType ??
              "unknown_action",
          })
        : construct("unsupported", "action", `actions[${index}]`, {
            actionType:
              action?.contract?.actionType ??
              action?.config?.stepType ??
              "unknown_action",
          }),
    );
  });

  if (sourceMode === STEP_EDITOR_MODES.DSL && target !== sourceMode) {
    const source = String(options.source ?? "");
    const commentLines = source
      .split(/\r?\n/)
      .map((line, index) => ({ line, number: index + 1 }))
      .filter(({ line }) => line.trim().startsWith("#"));
    for (const comment of commentLines.slice(0, 500)) {
      constructs.push(
        construct("lossy", "comment", `source:${comment.number}:1`, {
          line: comment.number,
        }),
      );
    }
    if (source !== "") {
      constructs.push(
        construct("normalized", "formatting", "source:1:1", {
          target,
        }),
      );
    }
    if (actions.length === 0) {
      constructs.push(
        construct("unsupported", "dslAst", "source:1:1", { target }),
      );
    }
  } else if (
    sourceMode === STEP_EDITOR_MODES.JSON &&
    target === STEP_EDITOR_MODES.WIZARD
  ) {
    constructs.push(
      construct("normalized", "formatting", "source:1:1", { target }),
    );
  }

  const unsupported = constructs.filter(
    (entry) => entry.disposition === "unsupported",
  );
  const lossy = constructs.filter((entry) => entry.disposition === "lossy");
  return {
    blocked: unsupported.length > 0,
    constructs,
    lossy,
    requiresAcknowledgement: lossy.length > 0,
    sourceMode,
    targetMode: target,
    unsupported,
  };
}

export function executeStepModeConversion(model, plan, options = {}) {
  if (plan?.blocked === true) {
    return { converted: null, reason: "unsupported", snapshot: null };
  }
  if (plan?.requiresAcknowledgement === true && options.acknowledged !== true) {
    return { converted: null, reason: "acknowledgement", snapshot: null };
  }
  const snapshot = {
    content: clone(options.source ?? model?.persisted ?? model),
    mode: plan.sourceMode,
  };
  return {
    converted: {
      ...clone(model),
      mode: plan.targetMode,
      recoverySnapshot: snapshot,
    },
    reason: null,
    snapshot,
  };
}

function construct(disposition, type, path, context) {
  return {
    code: `stepEditor.conversion.${disposition}.${type}`,
    context,
    disposition,
    path,
    severity:
      disposition === "unsupported"
        ? "error"
        : disposition === "lossy"
          ? "warning"
          : "info",
  };
}

function normalizeMode(mode) {
  return Object.values(STEP_EDITOR_MODES).includes(mode)
    ? mode
    : STEP_EDITOR_MODES.JSON;
}

function clone(value) {
  if (typeof value === "string") return value;
  return JSON.parse(JSON.stringify(value ?? {}));
}
