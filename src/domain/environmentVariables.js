export const ENVIRONMENT_VARIABLE_CONTRACT_VERSION = "environment.variables.v1";
const MAX_VARIABLES_PER_LAYER = 500;
const VARIABLE_NAME = /^[A-Za-z_][A-Za-z0-9_.-]{0,127}$/;
const REFERENCE = /\$\{([A-Za-z_][A-Za-z0-9_.-]{0,127})\}/g;
const LAYERS = ["project", "environment", "launch"];

export function resolveEnvironmentVariables(rawLayers = {}, context = {}) {
  const tenantId = safeId(context.tenantId);
  const diagnostics = [];
  const selected = new Map();
  const overridden = new Map();

  for (const layer of LAYERS) {
    const variables = Array.isArray(rawLayers[layer])
      ? rawLayers[layer].slice(0, MAX_VARIABLES_PER_LAYER)
      : [];
    const names = new Set();
    for (const raw of variables) {
      const variable = normalizeVariable(raw, layer);
      if (variable == null) {
        diagnostics.push(diagnostic("invalid", layer, null));
        continue;
      }
      if (variable.tenantId !== tenantId) {
        diagnostics.push(diagnostic("crossTenant", layer, variable.name));
        continue;
      }
      if (names.has(variable.name)) {
        diagnostics.push(diagnostic("duplicate", layer, variable.name));
        continue;
      }
      names.add(variable.name);
      const previous = selected.get(variable.name);
      if (previous?.allowOverride === false) {
        diagnostics.push(diagnostic("forbiddenOverride", layer, variable.name));
        continue;
      }
      if (previous != null) {
        if (!overridden.has(variable.name)) overridden.set(variable.name, []);
        overridden.get(variable.name).push(previous.source);
      }
      selected.set(variable.name, variable);
    }
  }

  const graph = new Map();
  for (const variable of selected.values()) {
    const references =
      variable.type === "secret"
        ? []
        : [...String(variable.value ?? "").matchAll(REFERENCE)].map(
            (match) => match[1],
          );
    graph.set(variable.name, references);
    for (const reference of references) {
      if (!selected.has(reference)) {
        diagnostics.push(
          diagnostic("unresolved", variable.source, variable.name, {
            reference,
          }),
        );
      }
    }
  }
  for (const cycle of findCycles(graph)) {
    diagnostics.push(
      diagnostic(
        "cycle",
        selected.get(cycle[0])?.source ?? "environment",
        cycle[0],
        {
          members: [...new Set(cycle)],
        },
      ),
    );
  }
  const invalidNames = new Set();
  for (const entry of diagnostics) {
    if (entry.code === "environmentVariable.unresolved") {
      invalidNames.add(entry.name);
    }
    if (entry.code === "environmentVariable.cycle") {
      for (const member of entry.context.members) invalidNames.add(member);
    }
  }
  const rows = [...selected.values()]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((variable) => {
      const resolved = resolveValue(variable, selected, invalidNames);
      return {
        allowOverride: variable.allowOverride,
        displayValue: resolved.secret ? "••••••" : resolved.value,
        name: variable.name,
        overriddenSources: overridden.get(variable.name) ?? [],
        reference: variable.type === "secret" ? variable.secretRef : null,
        source: variable.source,
        type: variable.type,
        valid: !invalidNames.has(variable.name),
      };
    });
  return {
    contractVersion: ENVIRONMENT_VARIABLE_CONTRACT_VERSION,
    diagnostics,
    executionBlocked: diagnostics.some((entry) => entry.severity === "error"),
    precedence: [...LAYERS],
    rows,
  };
}

export function serializeEnvironmentVariables(layers = {}) {
  return Object.fromEntries(
    LAYERS.map((layer) => [
      layer,
      (Array.isArray(layers[layer]) ? layers[layer] : [])
        .slice(0, MAX_VARIABLES_PER_LAYER)
        .map((variable) => {
          const serialized = { ...variable };
          if (serialized.type === "secret") {
            delete serialized.value;
          }
          return serialized;
        }),
    ]),
  );
}

function normalizeVariable(raw, source) {
  const name = String(raw?.name ?? "").trim();
  const tenantId = safeId(raw?.tenantId);
  const type = ["string", "number", "boolean", "json", "secret"].includes(
    raw?.type,
  )
    ? raw.type
    : "string";
  if (!VARIABLE_NAME.test(name) || tenantId == null) return null;
  if (
    type === "secret" &&
    !/^[A-Za-z0-9_./:-]{1,200}$/.test(String(raw?.secretRef ?? ""))
  ) {
    return null;
  }
  return {
    allowOverride: raw?.allowOverride !== false,
    name,
    secretRef: type === "secret" ? String(raw.secretRef) : null,
    source,
    tenantId,
    type,
    value: type === "secret" ? null : normalizeValue(raw?.value, type),
  };
}

function normalizeValue(value, type) {
  if (type === "number")
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  if (type === "boolean") return value === true || value === "true";
  if (type === "json") {
    if (value != null && typeof value === "object")
      return JSON.stringify(value);
    return String(value ?? "").slice(0, 100_000);
  }
  return String(value ?? "").slice(0, 100_000);
}

function resolveValue(variable, selected, invalidNames, stack = new Set()) {
  if (variable.type === "secret") return { secret: true, value: null };
  if (invalidNames.has(variable.name) || stack.has(variable.name)) {
    return { secret: false, value: "" };
  }
  const nextStack = new Set(stack).add(variable.name);
  let secret = false;
  const value = String(variable.value ?? "").replace(
    REFERENCE,
    (_, reference) => {
      const dependency = selected.get(reference);
      if (dependency == null) return "";
      const resolved = resolveValue(
        dependency,
        selected,
        invalidNames,
        nextStack,
      );
      secret ||= resolved.secret;
      return resolved.secret ? "" : resolved.value;
    },
  );
  return { secret, value: secret ? null : value };
}

function findCycles(graph) {
  const cycles = [];
  const visited = new Set();
  const active = [];
  const activeSet = new Set();
  function visit(name) {
    if (activeSet.has(name)) {
      const start = active.indexOf(name);
      cycles.push([...active.slice(start), name]);
      return;
    }
    if (visited.has(name)) return;
    visited.add(name);
    active.push(name);
    activeSet.add(name);
    for (const dependency of graph.get(name) ?? []) {
      if (graph.has(dependency)) visit(dependency);
    }
    active.pop();
    activeSet.delete(name);
  }
  for (const name of graph.keys()) visit(name);
  return cycles;
}

function diagnostic(code, source, name, context = {}) {
  return {
    code: `environmentVariable.${code}`,
    context,
    messageKey: `EnvironmentVariables.validation.${code}`,
    name,
    severity: "error",
    source,
  };
}

function safeId(value) {
  const normalized = String(value ?? "").trim();
  return /^[A-Za-z0-9_.:-]{1,200}$/.test(normalized) ? normalized : null;
}
