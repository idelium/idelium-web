export const ENVIRONMENT_EDIT_CONTRACT_VERSION = "environment.edit.v1";

const SAFE_ID = /^[A-Za-z0-9_.-]{1,200}$/;
const SENSITIVE_KEY =
  /(authorization|cookie|credential|password|private.?key|secret|session|token)/i;
const REFERENCE_KEY = /(referenceId|secretRef)$/i;
const MAX_DEPTH = 8;
const MAX_ITEMS = 1_000;

export function createEnvironmentEditingSession(durableEnvironment) {
  const durable = sanitizeEnvironment(durableEnvironment);
  return {
    conflict: null,
    contractVersion: ENVIRONMENT_EDIT_CONTRACT_VERSION,
    current: clone(durable),
    dirty: false,
    durable,
    lastSavedAt: safeTimestamp(durableEnvironment?.lastSavedAt),
    status: "idle",
  };
}

export function updateEnvironmentDraft(session, nextEnvironment) {
  const current = sanitizeEnvironment(nextEnvironment);
  return {
    ...session,
    conflict: null,
    current,
    dirty: stableStringify(current) !== stableStringify(session.durable),
    status: "editing",
  };
}

export function createEnvironmentSaveRequest(session, tenantId) {
  const normalizedTenant = safeId(tenantId);
  if (
    normalizedTenant == null ||
    session.current.tenantId !== normalizedTenant
  ) {
    throw new Error("Environment save context is invalid.");
  }
  return {
    contractVersion: ENVIRONMENT_EDIT_CONTRACT_VERSION,
    environment: clone(session.current),
    expectedVersion: session.durable.version,
    tenantId: normalizedTenant,
  };
}

export function applyEnvironmentSaveResult(session, result = {}) {
  if (result.code === "conflict") {
    return {
      ...session,
      conflict: {
        code: "environmentEdit.conflict",
        remoteVersion: safeVersion(result.remoteVersion),
      },
      dirty: true,
      status: "conflict",
    };
  }
  if (result.code !== "saved") {
    return {
      ...session,
      conflict: null,
      dirty: true,
      status: "failed",
    };
  }
  const version = safeVersion(result.version);
  if (version == null) {
    return {
      ...session,
      dirty: true,
      status: "failed",
    };
  }
  const durable = { ...clone(session.current), version };
  return {
    ...session,
    conflict: null,
    current: clone(durable),
    dirty: false,
    durable,
    lastSavedAt: safeTimestamp(result.savedAt),
    status: "saved",
  };
}

export function discardEnvironmentChanges(session) {
  return {
    ...session,
    conflict: null,
    current: clone(session.durable),
    dirty: false,
    status: "idle",
  };
}

export function cloneEnvironmentForTenant(source, destination = {}) {
  const tenantId = safeId(destination.tenantId);
  const name = String(destination.name ?? "")
    .trim()
    .slice(0, 160);
  if (tenantId == null || name === "") {
    throw new Error("Clone destination identity is required.");
  }
  const sanitized = sanitizeForClone(source?.config, 0);
  return {
    cloneWarnings: sanitized.warnings,
    environment: {
      config: sanitized.value,
      description: String(destination.description ?? "")
        .trim()
        .slice(0, 2_000),
      name,
      tenantId,
      type: String(source?.type ?? "")
        .trim()
        .slice(0, 80),
      version: null,
    },
  };
}

export function createEnvironmentArchiveRequest(environment, tenantId) {
  const environmentId = safeId(environment?.id);
  const normalizedTenant = safeId(tenantId);
  const version = safeVersion(environment?.version);
  if (
    environmentId == null ||
    normalizedTenant == null ||
    environment?.tenantId !== normalizedTenant ||
    version == null
  ) {
    throw new Error("Environment archive context is invalid.");
  }
  return {
    contractVersion: ENVIRONMENT_EDIT_CONTRACT_VERSION,
    environmentId,
    expectedVersion: version,
    operation: "archive",
    tenantId: normalizedTenant,
  };
}

export function environmentRouteLeaveDecision(session) {
  return session?.dirty === true ? "confirm" : "allow";
}

function sanitizeEnvironment(environment) {
  return {
    config: clone(environment?.config ?? {}),
    description: String(environment?.description ?? "").slice(0, 2_000),
    id: safeId(environment?.id),
    name: String(environment?.name ?? "").slice(0, 160),
    tenantId: safeId(environment?.tenantId),
    type: String(environment?.type ?? "").slice(0, 80),
    version: safeVersion(environment?.version),
  };
}

function sanitizeForClone(value, depth) {
  if (depth >= MAX_DEPTH) {
    return { value: null, warnings: ["depthLimit"] };
  }
  if (Array.isArray(value)) {
    const warnings = [];
    const cloned = value.slice(0, MAX_ITEMS).map((item) => {
      const nested = sanitizeForClone(item, depth + 1);
      warnings.push(...nested.warnings);
      return nested.value;
    });
    return { value: cloned, warnings };
  }
  if (value != null && typeof value === "object") {
    const result = {};
    const warnings = [];
    for (const key of Object.keys(value).sort().slice(0, MAX_ITEMS)) {
      if (SENSITIVE_KEY.test(key) || REFERENCE_KEY.test(key)) {
        warnings.push("referenceRevalidation");
        continue;
      }
      if (/tenantId|customerId/i.test(key)) {
        warnings.push("ownershipRemoved");
        continue;
      }
      const nested = sanitizeForClone(value[key], depth + 1);
      result[key] = nested.value;
      warnings.push(...nested.warnings);
    }
    return { value: result, warnings: [...new Set(warnings)] };
  }
  if (
    value == null ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return { value, warnings: [] };
  }
  return { value: String(value).slice(0, 100_000), warnings: [] };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeId(value) {
  const normalized = String(value ?? "").trim();
  return SAFE_ID.test(normalized) ? normalized : null;
}

function safeTimestamp(value) {
  if (value == null || value === "") return null;
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
}

function safeVersion(value) {
  const normalized = String(value ?? "").trim();
  return /^[A-Za-z0-9_.:-]{1,120}$/.test(normalized) ? normalized : null;
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value != null && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}
