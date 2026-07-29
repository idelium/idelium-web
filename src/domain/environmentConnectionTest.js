export const ENVIRONMENT_CONNECTION_TEST_CONTRACT_VERSION =
  "environment.connection-test.v1";

export const CONNECTION_TEST_TYPES = Object.freeze([
  "webdriver",
  "appium",
  "api",
  "provider",
]);

export const CONNECTION_TEST_CODES = Object.freeze([
  "success",
  "timeout",
  "dns",
  "tls",
  "authentication",
  "capabilityMismatch",
  "targetUnavailable",
  "cancelled",
  "unexpected",
]);

const SAFE_ID = /^[A-Za-z0-9_.-]{1,200}$/;
const MAX_TIMEOUT_MS = 30_000;
const MIN_TIMEOUT_MS = 1_000;

export function createConnectionTestRequest(input = {}) {
  const environmentId = safeId(input.environmentId);
  const tenantId = safeId(input.tenantId);
  const type = CONNECTION_TEST_TYPES.includes(input.type) ? input.type : null;
  const targetId = input.targetId == null ? null : safeId(input.targetId);
  if (
    environmentId == null ||
    tenantId == null ||
    type == null ||
    (input.targetId != null && targetId == null)
  ) {
    throw new Error("Invalid environment connection test request.");
  }
  return {
    contractVersion: ENVIRONMENT_CONNECTION_TEST_CONTRACT_VERSION,
    environmentId,
    targetId,
    tenantId,
    timeoutMs: clampTimeout(input.timeoutMs),
    type,
  };
}

export function normalizeConnectionTestResult(raw = {}) {
  const code = CONNECTION_TEST_CODES.includes(raw.code)
    ? raw.code
    : "unexpected";
  return {
    auditEventId: safeId(raw.auditEventId),
    code,
    completedAt: safeTimestamp(raw.completedAt),
    contractVersion: ENVIRONMENT_CONNECTION_TEST_CONTRACT_VERSION,
    diagnosticCode: `environmentConnection.${code}`,
    durationMs: clampDuration(raw.durationMs),
    startedAt: safeTimestamp(raw.startedAt),
    success: code === "success",
    target: sanitizeTarget(raw.target),
  };
}

export function connectionTestRemediationKey(code) {
  return `EnvironmentConnectionTest.remediation.${
    CONNECTION_TEST_CODES.includes(code) ? code : "unexpected"
  }`;
}

function clampDuration(value) {
  const duration = Number(value);
  if (!Number.isFinite(duration) || duration < 0) return 0;
  return Math.min(Math.round(duration), MAX_TIMEOUT_MS + 5_000);
}

function clampTimeout(value) {
  const timeout = Number(value);
  if (!Number.isFinite(timeout)) return 10_000;
  return Math.min(
    MAX_TIMEOUT_MS,
    Math.max(MIN_TIMEOUT_MS, Math.round(timeout)),
  );
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

function sanitizeTarget(value) {
  const target = String(value ?? "")
    .trim()
    .slice(0, 500);
  if (target === "") return null;
  try {
    const url = new URL(target);
    if (!["http:", "https:"].includes(url.protocol)) return "[REDACTED]";
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return /^[A-Za-z0-9_.:-]{1,200}$/.test(target) ? target : "[REDACTED]";
  }
}
