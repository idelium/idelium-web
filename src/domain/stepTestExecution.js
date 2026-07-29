const MAX_LOG_LINES = 100;
const MAX_LOG_LENGTH = 500;
const MAX_ARTIFACTS = 20;
const MAX_ARTIFACT_BYTES = 10_000_000;
const MAX_IMPACT_PAGE_SIZE = 50;
const SENSITIVE_VALUE =
  /\b(authorization|cookie|credential|password|secret|session|token)\s*[:=]\s*([^\s,;]+)/gi;
const SAFE_ID = /^[a-zA-Z0-9_.:-]{1,200}$/;
const RESULT_STATUSES = new Set([
  "passed",
  "failed",
  "timeout",
  "cancelled",
  "unavailable",
]);

export function createStepTestRequest(input, context = {}) {
  const runtime = safeId(input?.runtime);
  const environment = eligibleResource(
    context.environments,
    input?.environmentId,
    context.tenantId,
    runtime,
  );
  const target = eligibleResource(
    context.targets,
    input?.targetId,
    context.tenantId,
    runtime,
  );
  const stepId = safeId(input?.stepId);
  if (stepId == null || environment == null || target == null) {
    return {
      diagnostics: [
        {
          code: "stepTest.selectionUnavailable",
          severity: "error",
        },
      ],
      request: null,
    };
  }
  return {
    diagnostics: [],
    request: {
      environmentId: environment.id,
      runtime,
      stepId,
      targetId: target.id,
      timeoutMs: boundedInteger(input?.timeoutMs, 30_000, 1_000, 120_000),
    },
  };
}

export function normalizeStepTestResult(rawResult = {}) {
  const status = RESULT_STATUSES.has(rawResult.status)
    ? rawResult.status
    : "failed";
  return {
    artifacts: (Array.isArray(rawResult.artifacts) ? rawResult.artifacts : [])
      .slice(0, MAX_ARTIFACTS)
      .map((artifact) => ({
        id: safeId(artifact?.id) ?? "unavailable",
        mediaType: String(
          artifact?.mediaType ?? "application/octet-stream",
        ).slice(0, 100),
        name: redact(String(artifact?.name ?? "artifact").slice(0, 200)),
        size: boundedInteger(artifact?.size, 0, 0, MAX_ARTIFACT_BYTES),
      })),
    durationMs: boundedInteger(rawResult.durationMs, 0, 0, 3_600_000),
    logs: (Array.isArray(rawResult.logs) ? rawResult.logs : [])
      .slice(0, MAX_LOG_LINES)
      .map((line) => redact(String(line).slice(0, MAX_LOG_LENGTH))),
    remediationCode: safeId(rawResult.remediationCode),
    status,
  };
}

export function normalizeStepImpact(rawImpact = {}, context = {}) {
  const tenantId = safeId(context.tenantId);
  const page = boundedInteger(rawImpact.page, 1, 1, 1_000_000);
  const pageSize = boundedInteger(
    rawImpact.pageSize,
    25,
    1,
    MAX_IMPACT_PAGE_SIZE,
  );
  const items = (Array.isArray(rawImpact.items) ? rawImpact.items : [])
    .filter(
      (item) =>
        tenantId != null &&
        safeId(item?.tenantId) === tenantId &&
        ["test", "cycle", "schedule"].includes(item?.type),
    )
    .slice(0, pageSize)
    .map((item) => ({
      id: safeId(item.id),
      name: redact(String(item.name ?? "Unavailable consumer").slice(0, 200)),
      pinnedVersion: safeId(item.pinnedVersion),
      type: item.type,
    }))
    .filter((item) => item.id != null);
  return {
    items,
    page,
    pageSize,
    total: boundedInteger(
      rawImpact.total,
      items.length,
      items.length,
      1_000_000,
    ),
  };
}

export function normalizeStepGovernancePolicy(rawPolicy = {}) {
  const allowed = new Set(
    Array.isArray(rawPolicy.allowedActions) ? rawPolicy.allowedActions : [],
  );
  return {
    defaultAction: allowed.has(rawPolicy.defaultAction)
      ? rawPolicy.defaultAction
      : allowed.has("publish-version")
        ? "publish-version"
        : "update-draft",
    publishVersion: allowed.has("publish-version"),
    updateDraft: allowed.has("update-draft"),
  };
}

function eligibleResource(resources, requestedId, tenantId, runtime) {
  const id = safeId(requestedId);
  const tenant = safeId(tenantId);
  return (
    (Array.isArray(resources) ? resources : []).find(
      (resource) =>
        safeId(resource?.id) === id &&
        resource?.authorized === true &&
        safeId(resource?.tenantId) === tenant &&
        (resource?.runtimes ?? []).includes(runtime),
    ) ?? null
  );
}

function redact(value) {
  return value.replace(SENSITIVE_VALUE, (_, key) => `${key}=[REDACTED]`);
}

function safeId(value) {
  const normalized = String(value ?? "").trim();
  return SAFE_ID.test(normalized) ? normalized : null;
}

function boundedInteger(value, fallback, minimum, maximum) {
  const number = Number(value);
  return Number.isInteger(number)
    ? Math.min(Math.max(number, minimum), maximum)
    : fallback;
}
