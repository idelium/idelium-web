const MAX_FIELDS = 100;
const MAX_STRING_LENGTH = 100_000;
const SENSITIVE_FIELD = /(credential|password|secret|token|authorization)/i;

export function createSchemaFormModel(action, source = {}, actionIndex = 0) {
  const schema = action?.schema?.type === "object" ? action.schema : {};
  const properties = schema.properties ?? {};
  const fieldContracts = new Map(
    (Array.isArray(action?.fields) ? action.fields : []).map((field) => [
      field.name,
      field,
    ]),
  );
  const names = Object.keys(properties).slice(0, MAX_FIELDS);
  const values = isPlainObject(source) ? clone(source) : {};
  const fields = names.map((name) =>
    normalizeField(
      name,
      properties[name],
      fieldContracts.get(name),
      schema.required,
    ),
  );
  for (const field of fields) {
    if (values[field.name] === undefined && field.defaultValue !== undefined) {
      values[field.name] = clone(field.defaultValue);
    }
  }
  return {
    actionIndex,
    actionType: action?.actionType ?? "unknown_action",
    fields,
    unknownFields: Object.fromEntries(
      Object.entries(values).filter(([name]) => !names.includes(name)),
    ),
    values,
  };
}

export function visibleSchemaFields(model) {
  return model.fields.filter((field) => isFieldVisible(field, model.values));
}

export function validateSchemaForm(model) {
  const diagnostics = [];
  for (const field of visibleSchemaFields(model)) {
    const value = model.values[field.name];
    const path = `actions[${model.actionIndex}].properties.${field.name}`;
    if (field.required && isEmpty(value)) {
      diagnostics.push(diagnostic("required", field, path));
      continue;
    }
    if (isEmpty(value)) continue;
    const issue = validateValue(field, value);
    if (issue != null) diagnostics.push(diagnostic(issue, field, path));
  }
  return diagnostics;
}

export function serializeSchemaForm(model) {
  const known = Object.fromEntries(
    model.fields
      .filter((field) => model.values[field.name] !== undefined)
      .map((field) => [field.name, clone(model.values[field.name])]),
  );
  return { ...clone(model.unknownFields), ...known };
}

function normalizeField(name, schema = {}, contract = {}, required = []) {
  const control = normalizeControl(schema, contract);
  return {
    name,
    control,
    labelKey: contract?.labelKey ?? `StepEditor.fields.${name}`,
    helpKey: schema["x-help-key"] ?? `StepEditor.fieldHelp.${name}`,
    required: Array.isArray(required) && required.includes(name),
    defaultValue:
      contract?.defaultValue !== undefined
        ? contract.defaultValue
        : schema.default,
    enum: Array.isArray(schema.enum)
      ? schema.enum.slice(0, 100).map((value) => String(value).slice(0, 200))
      : [],
    minimum: finiteNumber(schema.minimum),
    maximum: finiteNumber(schema.maximum),
    minLength: finiteNumber(schema.minLength),
    maxLength: Math.min(
      finiteNumber(schema.maxLength) ?? MAX_STRING_LENGTH,
      MAX_STRING_LENGTH,
    ),
    pattern: safePattern(schema.pattern),
    itemType: schema.items?.type === "number" ? "number" : "string",
    visibleWhen: normalizeCondition(schema["x-visible-when"]),
    sensitive: control === "secret-reference" || SENSITIVE_FIELD.test(name),
  };
}

function normalizeControl(schema, contract) {
  const explicit = schema["x-control"] ?? contract?.input;
  if (
    [
      "select",
      "secret-reference",
      "locator",
      "json",
      "list",
      "checkbox",
      "number",
      "textarea",
      "text",
    ].includes(explicit)
  ) {
    return explicit;
  }
  if (schema.format === "secret-reference") return "secret-reference";
  if (schema.format === "locator") return "locator";
  if (schema.format === "json" || schema.type === "object") return "json";
  if (Array.isArray(schema.enum)) return "select";
  if (schema.type === "array") return "list";
  if (schema.type === "boolean") return "checkbox";
  if (schema.type === "integer" || schema.type === "number") return "number";
  return "text";
}

function validateValue(field, value) {
  if (field.control === "number" && !Number.isFinite(Number(value))) {
    return "number";
  }
  if (field.minimum != null && Number(value) < field.minimum) return "minimum";
  if (field.maximum != null && Number(value) > field.maximum) return "maximum";
  if (field.enum.length > 0 && !field.enum.includes(String(value))) {
    return "enum";
  }
  if (field.control === "json") {
    try {
      if (typeof value === "string") JSON.parse(value);
    } catch {
      return "json";
    }
  }
  if (field.control === "list" && !Array.isArray(value)) return "list";
  if (typeof value === "string") {
    if (field.minLength != null && value.length < field.minLength) {
      return "minLength";
    }
    if (value.length > field.maxLength) return "maxLength";
    if (field.pattern != null && !field.pattern.test(value)) return "pattern";
  }
  if (
    field.control === "secret-reference" &&
    !/^[a-zA-Z0-9_.:-]{1,200}$/.test(String(value))
  ) {
    return "secretReference";
  }
  return null;
}

function diagnostic(code, field, path) {
  return {
    code: `stepEditor.form.${code}`,
    field: field.name,
    messageKey: `StepEditor.form.validation.${code}`,
    path,
    severity: "error",
  };
}

function isFieldVisible(field, values) {
  if (field.visibleWhen == null) return true;
  return values[field.visibleWhen.field] === field.visibleWhen.equals;
}

function normalizeCondition(value) {
  if (!isPlainObject(value) || typeof value.field !== "string") return null;
  return {
    field: value.field.slice(0, 200),
    equals: value.equals,
  };
}

function safePattern(value) {
  const pattern = String(value ?? "");
  if (
    pattern === "" ||
    pattern.length > 200 ||
    /(\([^)]*[+*][^)]*\))[+*{]/.test(pattern)
  ) {
    return null;
  }
  try {
    return new RegExp(pattern, "u");
  } catch {
    return null;
  }
}

function finiteNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function isEmpty(value) {
  return (
    value == null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}
