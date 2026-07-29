import {
  STEP_CATALOG_VERSION,
  resolveActionCatalogEntry,
} from "@/domain/stepCatalog";
import { normalizeEditableStepConfig } from "@/domain/stepConfig";

export const STEP_EDITOR_MODES = Object.freeze({
  DSL: "dsl",
  JSON: "json",
  WIZARD: "wizard",
});

export function loadStepEditorModel(rawConfig, options = {}) {
  let normalized;
  try {
    normalized = normalizeEditableStepConfig(rawConfig, options.fallbackName);
  } catch {
    return invalidModel(rawConfig, "stepEditor.malformedConfig");
  }
  const diagnostics = [];
  const actions = normalized.steps.map((step, index) => {
    const resolution = resolveActionCatalogEntry(
      {
        actionType: step.stepType,
        catalogVersion: step.catalogVersion ?? normalized.catalogVersion,
        runtime: step.runtime ?? normalized.editorType,
      },
      { pluginActions: options.pluginActions },
    );
    diagnostics.push(
      ...resolution.diagnostics.map((diagnostic) => ({
        ...diagnostic,
        path: `steps[${index}]`,
      })),
    );
    return {
      config: clone(step),
      contract: resolution.action,
      identity: `action:${index + 1}`,
    };
  });
  const capabilities = intersectCapabilities(
    actions.map((action) => action.contract?.capabilities),
  );
  return {
    actions,
    capabilities,
    catalogVersion: STEP_CATALOG_VERSION,
    diagnostics,
    dirty: false,
    legacy: normalized.catalogVersion == null,
    mode: normalizeMode(options.mode ?? normalized.mode, capabilities),
    normalized,
    persisted: cloneJsonCompatible(rawConfig),
    valid: !diagnostics.some((entry) => entry.severity === "error"),
  };
}

export function serializeStepEditorModel(model, options = {}) {
  if (options.preserveLegacy !== false && model?.dirty !== true) {
    return clone(model?.persisted);
  }
  return {
    ...clone(model?.normalized ?? {}),
    catalogVersion: STEP_CATALOG_VERSION,
    steps: (model?.actions ?? []).map((action) => ({
      ...clone(action.config),
      catalogVersion: STEP_CATALOG_VERSION,
    })),
  };
}

function invalidModel(rawConfig, code) {
  return {
    actions: [],
    capabilities: defaultCapabilities(false),
    catalogVersion: STEP_CATALOG_VERSION,
    diagnostics: [{ code, context: {}, path: "$", severity: "error" }],
    dirty: false,
    legacy: true,
    mode: STEP_EDITOR_MODES.JSON,
    normalized: {},
    persisted: cloneJsonCompatible(rawConfig),
    valid: false,
  };
}

function intersectCapabilities(capabilities) {
  const supported = capabilities.filter(Boolean);
  if (supported.length === 0) return defaultCapabilities(false);
  return Object.fromEntries(
    Object.keys(defaultCapabilities(true)).map((key) => [
      key,
      supported.every((entry) => entry[key] === true),
    ]),
  );
}

function defaultCapabilities(value) {
  return {
    wizard: value,
    json: true,
    dsl: value,
    testExecution: value,
    conversion: value,
  };
}

function normalizeMode(mode, capabilities) {
  const requested = Object.values(STEP_EDITOR_MODES).includes(mode)
    ? mode
    : STEP_EDITOR_MODES.WIZARD;
  return capabilities[requested] ? requested : STEP_EDITOR_MODES.JSON;
}

function cloneJsonCompatible(value) {
  if (typeof value === "string") return value;
  return clone(value ?? {});
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
