const SENSITIVE_KEY =
  /(authorization|cookie|credential|password|secret|session|token)/i;

export function validateEnvironmentForm(model, schema) {
  const diagnostics = [];
  if (String(model?.identity?.name ?? "").trim() === "") {
    diagnostics.push(formDiagnostic("required", "identity", "identity.name"));
  }
  for (const section of schema?.sections ?? []) {
    for (const field of section.fields ?? []) {
      const value = model?.config?.[field.name];
      const path = `config.${field.name}`;
      if (field.required && isEmpty(value)) {
        diagnostics.push(formDiagnostic("required", section.id, path));
        continue;
      }
      if (isEmpty(value)) continue;
      if (
        field.control === "url" &&
        !/^(https?|wss?):\/\/[^\s]+$/i.test(String(value))
      ) {
        diagnostics.push(formDiagnostic("url", section.id, path));
      }
      if (
        field.control === "integer" &&
        (!Number.isInteger(Number(value)) ||
          (field.minimum != null && Number(value) < field.minimum) ||
          (field.maximum != null && Number(value) > field.maximum))
      ) {
        diagnostics.push(formDiagnostic("range", section.id, path));
      }
      if (field.enum?.length > 0 && !field.enum.includes(String(value))) {
        diagnostics.push(formDiagnostic("enum", section.id, path));
      }
    }
  }
  for (const key of Object.keys(model?.config ?? {})) {
    if (SENSITIVE_KEY.test(key) && !key.toLowerCase().endsWith("ref")) {
      diagnostics.push(
        formDiagnostic("inlineSecret", "advanced", `config.${key}`),
      );
    }
  }
  return diagnostics;
}

export function environmentTypeChangePlan(currentConfig, targetSchema) {
  const supported = new Set(
    (targetSchema?.sections ?? []).flatMap((section) =>
      (section.fields ?? []).map((field) => field.name),
    ),
  );
  const incompatible = Object.keys(currentConfig ?? {})
    .filter((key) => !supported.has(key))
    .slice(0, 200)
    .map((key) => ({
      code: "environmentForm.incompatibleField",
      path: `config.${key}`,
      severity: "warning",
    }));
  return {
    incompatible,
    requiresConfirmation: incompatible.length > 0,
  };
}

export function applyEnvironmentTypeChange(currentConfig, targetSchema) {
  const plan = environmentTypeChangePlan(currentConfig, targetSchema);
  const removed = new Set(
    plan.incompatible.map((diagnostic) =>
      diagnostic.path.replace("config.", ""),
    ),
  );
  const config = Object.fromEntries(
    Object.entries(currentConfig ?? {}).filter(([key]) => !removed.has(key)),
  );
  for (const section of targetSchema?.sections ?? []) {
    for (const field of section.fields ?? []) {
      if (config[field.name] === undefined && field.default !== undefined) {
        config[field.name] = clone(field.default);
      }
    }
  }
  return { config, plan };
}

function formDiagnostic(code, section, path) {
  return {
    code: `environmentForm.${code}`,
    messageKey: `EnvironmentForm.validation.${code}`,
    path,
    section,
    severity: "error",
  };
}

function isEmpty(value) {
  return value == null || (typeof value === "string" && value.trim() === "");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
