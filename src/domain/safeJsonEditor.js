export const MAX_JSON_SOURCE_BYTES = 1_000_000;
const MAX_JSON_DEPTH = 50;
const MAX_JSON_NODES = 20_000;
const SENSITIVE_KEY =
  /(authorization|cookie|credential|password|secret|session|token)/i;
const SECRET_REFERENCE = /^[a-zA-Z0-9_.:-]{1,200}$/;

export function analyzeJsonSource(source, options = {}) {
  const text = String(source ?? "");
  if (new TextEncoder().encode(text).length > MAX_JSON_SOURCE_BYTES) {
    return failure("size", "$", 1, 1);
  }
  let value;
  try {
    value = JSON.parse(text);
  } catch (error) {
    const location = jsonErrorLocation(text, error);
    return failure("syntax", "$", location.line, location.column);
  }
  const resourceDiagnostic = validateJsonResources(value);
  if (resourceDiagnostic != null)
    return { valid: false, diagnostics: [resourceDiagnostic] };
  const secretDiagnostics =
    options.allowInlineSecrets === true ? [] : findInlineSecrets(value);
  const schemaDiagnostics =
    typeof options.validate === "function"
      ? normalizeSchemaDiagnostics(options.validate(value))
      : [];
  const diagnostics = [...secretDiagnostics, ...schemaDiagnostics];
  return { diagnostics, valid: diagnostics.length === 0, value };
}

export function formatJsonSource(source) {
  const analysis = analyzeJsonSource(source, { allowInlineSecrets: true });
  return analysis.value === undefined
    ? { ...analysis, source: String(source ?? "") }
    : {
        ...analysis,
        source: JSON.stringify(analysis.value, null, 2),
      };
}

function findInlineSecrets(root) {
  const diagnostics = [];
  walkJson(root, (value, path, key) => {
    if (!SENSITIVE_KEY.test(key) || value == null || value === "") return;
    if (
      typeof value === "string" &&
      key.toLowerCase().endsWith("ref") &&
      SECRET_REFERENCE.test(value)
    ) {
      return;
    }
    diagnostics.push(diagnostic("inlineSecret", path, 1, 1));
  });
  return diagnostics;
}

function validateJsonResources(root) {
  let nodes = 0;
  let resourceDiagnostic = null;
  walkJson(root, (_, path, __, depth) => {
    nodes += 1;
    if (resourceDiagnostic != null) return;
    if (depth > MAX_JSON_DEPTH) {
      resourceDiagnostic = diagnostic("depth", path, 1, 1);
    } else if (nodes > MAX_JSON_NODES) {
      resourceDiagnostic = diagnostic("nodes", path, 1, 1);
    }
  });
  return resourceDiagnostic;
}

function walkJson(root, visit) {
  const queue = [{ key: "$", path: "$", value: root, depth: 0 }];
  let cursor = 0;
  while (cursor < queue.length) {
    const current = queue[cursor];
    cursor += 1;
    visit(current.value, current.path, current.key, current.depth);
    if (current.value == null || typeof current.value !== "object") continue;
    const entries = Array.isArray(current.value)
      ? current.value.map((value, index) => [index, value])
      : Object.entries(current.value);
    for (const [key, value] of entries) {
      queue.push({
        key: String(key),
        path: Array.isArray(current.value)
          ? `${current.path}[${key}]`
          : `${current.path}.${key}`,
        value,
        depth: current.depth + 1,
      });
    }
  }
}

function normalizeSchemaDiagnostics(rawDiagnostics) {
  return (Array.isArray(rawDiagnostics) ? rawDiagnostics : [])
    .slice(0, 500)
    .map((entry) => ({
      code: String(entry?.code ?? "stepEditor.json.schema").slice(0, 100),
      column: boundedLocation(entry?.column),
      line: boundedLocation(entry?.line),
      messageKey: String(
        entry?.messageKey ?? "StepEditor.json.validation.schema",
      ).slice(0, 200),
      path: String(entry?.path ?? "$").slice(0, 500),
      remediationKey: String(
        entry?.remediationKey ?? "StepEditor.json.remediation.schema",
      ).slice(0, 200),
      severity: "error",
    }));
}

function failure(code, path, line, column) {
  return { diagnostics: [diagnostic(code, path, line, column)], valid: false };
}

function diagnostic(code, path, line, column) {
  return {
    code: `stepEditor.json.${code}`,
    column,
    line,
    messageKey: `StepEditor.json.validation.${code}`,
    path,
    remediationKey: `StepEditor.json.remediation.${code}`,
    severity: "error",
  };
}

function jsonErrorLocation(source, error) {
  const message = String(error?.message ?? "");
  const explicit = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (explicit != null) {
    return {
      column: boundedLocation(explicit[2]),
      line: boundedLocation(explicit[1]),
    };
  }
  const position = Number(message.match(/position\s+(\d+)/i)?.[1] ?? 0);
  const unexpectedToken = message.match(/Unexpected token '([^']+)'/i)?.[1];
  const inferredPosition =
    position > 0
      ? position
      : unexpectedToken != null
        ? source.lastIndexOf(unexpectedToken)
        : /Unexpected end/i.test(message)
          ? source.length
          : 0;
  const prefix = source.slice(0, Math.max(inferredPosition, 0));
  const lines = prefix.split("\n");
  return { column: lines.at(-1).length + 1, line: lines.length };
}

function boundedLocation(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0
    ? Math.min(number, 1_000_000)
    : 1;
}
