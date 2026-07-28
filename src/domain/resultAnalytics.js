const DEFAULT_WINDOW = "7d";
const DEFAULT_TIMEZONE = "UTC";
const EXPORT_FORMATS = new Set(["json", "csv", "junit", "markdown", "html"]);
const EXPORT_STATUSES = new Set([
  "queued",
  "running",
  "completed",
  "failed",
  "expired",
]);

export const FAILURE_CLASSES = Object.freeze({
  ASSERTION: "assertion",
  INFRASTRUCTURE: "infrastructure",
  TIMEOUT: "timeout",
  NETWORK: "network",
  UNKNOWN: "unknown",
});

export function summarizeExecutionTrends(executions, options = {}) {
  const normalized = normalizeExecutions(executions);
  const totals = normalized.reduce(
    (summary, execution) => {
      summary.count += 1;
      summary.durationMs += execution.durationMs;
      summary.queueMs += execution.queueMs;
      if (execution.status === "passed") {
        summary.passed += 1;
      }
      if (execution.status === "failed") {
        summary.failed += 1;
      }
      return summary;
    },
    { count: 0, passed: 0, failed: 0, durationMs: 0, queueMs: 0 },
  );

  return {
    window: safeWindow(options.window),
    timezone: safeTimezone(options.timezone),
    count: totals.count,
    passRate: ratio(totals.passed, totals.count),
    failureRate: ratio(totals.failed, totals.count),
    averageDurationMs: average(totals.durationMs, totals.count),
    averageQueueMs: average(totals.queueMs, totals.count),
    failuresByClass: failureTaxonomy(normalized),
    flakyTests: detectFlakyTests(normalized),
  };
}

export function failureTaxonomy(executions) {
  return normalizeExecutions(executions).reduce(
    (summary, execution) => {
      if (execution.status !== "failed") {
        return summary;
      }
      const failureClass = classifyFailure(execution);
      summary[failureClass] += 1;
      return summary;
    },
    {
      [FAILURE_CLASSES.ASSERTION]: 0,
      [FAILURE_CLASSES.INFRASTRUCTURE]: 0,
      [FAILURE_CLASSES.TIMEOUT]: 0,
      [FAILURE_CLASSES.NETWORK]: 0,
      [FAILURE_CLASSES.UNKNOWN]: 0,
    },
  );
}

export function detectFlakyTests(executions) {
  const grouped = new Map();
  for (const execution of normalizeExecutions(executions)) {
    const key = String(execution.testId ?? execution.testName ?? "unknown");
    if (!grouped.has(key)) {
      grouped.set(key, {
        testId: execution.testId,
        testName: execution.testName,
        statuses: new Set(),
      });
    }
    grouped.get(key).statuses.add(execution.status);
  }

  return [...grouped.values()]
    .filter(
      (entry) => entry.statuses.has("passed") && entry.statuses.has("failed"),
    )
    .map((entry) => ({
      testId: entry.testId ?? null,
      testName: entry.testName ?? "unknown",
      states: [...entry.statuses].sort(),
    }));
}

export function buildAnalyticsQuery(options = {}) {
  const params = new URLSearchParams();
  params.set("window", safeWindow(options.window));
  params.set("timezone", safeTimezone(options.timezone));

  const projectId = positiveInteger(options.projectId);
  if (projectId !== null) {
    params.set("projectId", String(projectId));
  }

  const testCycleId = positiveInteger(options.testCycleId);
  if (testCycleId !== null) {
    params.set("testCycleId", String(testCycleId));
  }

  for (const status of safeArray(options.statuses)) {
    if (["passed", "failed", "pending", "cancelled"].includes(status)) {
      params.append("status", status);
    }
  }

  return params;
}

export function normalizeExportDescriptor(descriptor) {
  const format = String(descriptor?.format ?? "").toLowerCase();
  const status = String(descriptor?.status ?? "queued").toLowerCase();

  return {
    id: safeIdentifier(descriptor?.id),
    format: EXPORT_FORMATS.has(format) ? format : "json",
    status: EXPORT_STATUSES.has(status) ? status : "queued",
    url: isSafeDownloadUrl(descriptor?.url) ? descriptor.url : null,
    expiresAt: safeIsoTimestamp(descriptor?.expiresAt),
    authorized: Boolean(descriptor?.authorized),
  };
}

export function canDownloadExport(descriptor, now = new Date()) {
  const normalized = normalizeExportDescriptor(descriptor);
  if (
    !normalized.authorized ||
    normalized.status !== "completed" ||
    normalized.url === null
  ) {
    return false;
  }
  if (normalized.expiresAt === null) {
    return true;
  }
  return new Date(normalized.expiresAt).getTime() > now.getTime();
}

function normalizeExecutions(executions) {
  return safeArray(executions).map((execution) => ({
    testId: execution?.testId ?? execution?.idTest ?? execution?.id ?? null,
    testName: String(execution?.testName ?? execution?.name ?? "unknown"),
    status: normalizeStatus(execution?.status),
    durationMs: nonNegativeNumber(
      execution?.durationMs ?? execution?.duration ?? execution?.time,
    ),
    queueMs: nonNegativeNumber(execution?.queueMs ?? execution?.queueTime),
    errorClass: String(
      execution?.errorClass ?? execution?.failureClass ?? "",
    ).toLowerCase(),
    diagnostic: String(
      execution?.diagnostic ?? execution?.message ?? execution?.error ?? "",
    ),
  }));
}

function classifyFailure(execution) {
  if (Object.values(FAILURE_CLASSES).includes(execution.errorClass)) {
    return execution.errorClass;
  }
  const diagnostic = execution.diagnostic.toLowerCase();
  if (diagnostic.includes("timeout") || diagnostic.includes("timed out")) {
    return FAILURE_CLASSES.TIMEOUT;
  }
  if (
    diagnostic.includes("network") ||
    diagnostic.includes("connection") ||
    diagnostic.includes("dns")
  ) {
    return FAILURE_CLASSES.NETWORK;
  }
  if (
    diagnostic.includes("worker") ||
    diagnostic.includes("container") ||
    diagnostic.includes("selenium grid")
  ) {
    return FAILURE_CLASSES.INFRASTRUCTURE;
  }
  if (diagnostic.includes("assert") || diagnostic.includes("expected")) {
    return FAILURE_CLASSES.ASSERTION;
  }
  return FAILURE_CLASSES.UNKNOWN;
}

function normalizeStatus(status) {
  if (
    status === 1 ||
    String(status).toLowerCase() === "passed" ||
    String(status).toLowerCase() === "success"
  ) {
    return "passed";
  }
  if (
    status === 2 ||
    String(status).toLowerCase() === "failed" ||
    String(status).toLowerCase() === "error"
  ) {
    return "failed";
  }
  if (String(status).toLowerCase() === "cancelled") {
    return "cancelled";
  }
  return "pending";
}

function ratio(value, total) {
  return total > 0 ? Number((value / total).toFixed(4)) : 0;
}

function average(value, total) {
  return total > 0 ? Math.round(value / total) : 0;
}

function safeWindow(value) {
  const window = String(value ?? DEFAULT_WINDOW);
  return /^\d+[hdwmy]$/.test(window) ? window : DEFAULT_WINDOW;
}

function safeTimezone(value) {
  const timezone = String(value ?? DEFAULT_TIMEZONE);
  return /^[A-Za-z0-9_/+.-]{1,64}$/.test(timezone)
    ? timezone
    : DEFAULT_TIMEZONE;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function positiveInteger(value) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function nonNegativeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function safeIdentifier(value) {
  return String(value ?? "")
    .replace(/[^a-zA-Z0-9_.:-]/g, "-")
    .slice(0, 120);
}

function safeIsoTimestamp(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function isSafeDownloadUrl(value) {
  const url = String(value ?? "");
  return url.startsWith("/") || url.startsWith("https://github.com/");
}
