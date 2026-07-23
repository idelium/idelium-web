import { findCatalogEntry } from "@/domain/stepCatalog";

function parseJsonConfig(rawConfig) {
  let parsedConfig = rawConfig;

  for (let index = 0; index < 3; index += 1) {
    if (typeof parsedConfig !== "string") return parsedConfig;
    const trimmedConfig = parsedConfig.trim();
    if (trimmedConfig === "") return {};

    parsedConfig = JSON.parse(trimmedConfig);
  }

  return parsedConfig;
}

function inferRuntime(config) {
  if (typeof config.editorType === "string" && config.editorType !== "") {
    return config.editorType;
  }
  if (typeof config.runtime === "string" && config.runtime !== "") {
    return config.runtime;
  }

  const firstStep = Array.isArray(config.steps) ? config.steps[0] : null;
  if (firstStep?.runtime) return firstStep.runtime;
  if (firstStep?.stepType) return findCatalogEntry(firstStep.stepType)?.runtime;

  return null;
}

function defaultStepTypeForRuntime(runtime, config) {
  if (config.stepType) return config.stepType;
  if (runtime === "postman") return "postman_collection";
  if (runtime === "appium") return "appium_mobile_command";
  if (runtime === "selenium") return "selenium_command";
  if (runtime === "webservice" && typeof config.method === "string") {
    return config.method.toLowerCase();
  }
  return config.command || "unknown_step";
}

function normalizeStepEntry(stepConfig, runtime) {
  const normalizedStep = {
    ...stepConfig,
    stepType: defaultStepTypeForRuntime(runtime, stepConfig),
  };

  if (
    runtime === "selenium" &&
    stepConfig.command &&
    !normalizedStep.operation
  ) {
    normalizedStep.operation = stepConfig.command;
  }
  if (
    runtime === "appium" &&
    stepConfig.command &&
    !normalizedStep.mobileCommand
  ) {
    normalizedStep.mobileCommand = stepConfig.command;
  }
  if (runtime === "postman" && !normalizedStep.collection) {
    normalizedStep.collection = {
      collection: stepConfig.collection || stepConfig,
      environment: stepConfig.environment || null,
    };
  }

  normalizedStep.runtime = normalizedStep.runtime || runtime || null;
  normalizedStep.note =
    normalizedStep.note || normalizedStep.name || normalizedStep.stepType;

  return normalizedStep;
}

export function normalizeEditableStepConfig(rawConfig, fallbackName = "") {
  const parsedConfig = parseJsonConfig(rawConfig);
  const config =
    parsedConfig && typeof parsedConfig === "object" ? parsedConfig : {};
  const runtime = inferRuntime(config);
  const sourceSteps = Array.isArray(config.steps) ? config.steps : [config];

  return {
    ...config,
    name: config.name || fallbackName,
    editorType: runtime || config.editorType || "selenium",
    failedExit: config.failedExit !== false,
    attachScreenshot: config.attachScreenshot !== false,
    steps: sourceSteps
      .filter((step) => step && typeof step === "object")
      .map((step) => normalizeStepEntry(step, runtime)),
  };
}
