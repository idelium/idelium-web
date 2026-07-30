export const EXECUTION_CONTRACT_VERSION = "2026-07-29.execution.v1";

export const EXECUTION_STATUSES = Object.freeze({
  QUEUED: "queued",
  RUNNING: "running",
  CANCELLING: "cancelling",
  PASSED: "passed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  SKIPPED: "skipped",
  BLOCKED: "blocked",
  UNKNOWN: "unknown",
});

const TERMINAL_STATUSES = new Set([
  EXECUTION_STATUSES.PASSED,
  EXECUTION_STATUSES.FAILED,
  EXECUTION_STATUSES.CANCELLED,
  EXECUTION_STATUSES.SKIPPED,
  EXECUTION_STATUSES.BLOCKED,
]);

const TRANSITIONAL_STATUSES = new Set([
  EXECUTION_STATUSES.QUEUED,
  EXECUTION_STATUSES.RUNNING,
  EXECUTION_STATUSES.CANCELLING,
]);

const SENSITIVE_MARKERS = [
  "authorization",
  "bearer ",
  "cookie",
  "password",
  "secret",
  "token",
  "x-api-key",
];

export function normalizeExecutionStatus(value) {
  if (value === 0) {
    return EXECUTION_STATUSES.QUEUED;
  }
  if (value === 1 || String(value).toLowerCase() === "success") {
    return EXECUTION_STATUSES.PASSED;
  }
  if (value === 2 || String(value).toLowerCase() === "error") {
    return EXECUTION_STATUSES.FAILED;
  }
  const status = String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z_ -]/g, "");
  const normalized = status.replaceAll(" ", "_").replaceAll("-", "_");
  if (["ok", "pass", "passed", "completed"].includes(normalized)) {
    return EXECUTION_STATUSES.PASSED;
  }
  if (["fail", "failed", "failure", "interrupted"].includes(normalized)) {
    return EXECUTION_STATUSES.FAILED;
  }
  if (["cancelled", "canceled"].includes(normalized)) {
    return EXECUTION_STATUSES.CANCELLED;
  }
  if (["blocked", "required_step_failed"].includes(normalized)) {
    return EXECUTION_STATUSES.BLOCKED;
  }
  if (["skipped", "ignored"].includes(normalized)) {
    return EXECUTION_STATUSES.SKIPPED;
  }
  if (["queued", "pending"].includes(normalized)) {
    return EXECUTION_STATUSES.QUEUED;
  }
  if (["running", "active", "in_progress"].includes(normalized)) {
    return EXECUTION_STATUSES.RUNNING;
  }
  if (["cancelling", "canceling"].includes(normalized)) {
    return EXECUTION_STATUSES.CANCELLING;
  }
  return EXECUTION_STATUSES.UNKNOWN;
}

export function isTerminalExecutionStatus(status) {
  return TERMINAL_STATUSES.has(normalizeExecutionStatus(status));
}

export function isTransitionalExecutionStatus(status) {
  return TRANSITIONAL_STATUSES.has(normalizeExecutionStatus(status));
}

export function normalizeExecutionSummary(payload = {}, context = {}) {
  const projectId = safeIdentifier(
    payload.projectId ?? payload.idProject ?? context.projectId,
  );
  const runId = safeIdentifier(
    payload.runId ?? payload.idRun ?? payload.executionId ?? payload.id,
  );
  const tests = normalizeExecutionTests(
    payload.tests ?? payload.testResults ?? payload.results,
  );
  const status = deriveRunStatus(payload, tests);
  const artifacts = normalizeArtifacts(payload.artifacts);
  const reports = normalizeReports(payload.reports ?? payload.report);

  return {
    contractVersion: EXECUTION_CONTRACT_VERSION,
    id: runId,
    projectId,
    tenantId: safeIdentifier(payload.tenantId ?? context.tenantId),
    status,
    terminal: isTerminalExecutionStatus(status),
    progress: normalizeProgress(payload.progress, tests),
    timings: normalizeTimings(payload),
    worker: normalizeWorker(payload.worker ?? payload.runner ?? payload.node),
    tests,
    counts: summarizeCounts(tests, artifacts, reports),
    failures: collectFailures(tests),
    artifacts,
    reports,
    cancellation: normalizeCancellation(payload.cancellation ?? payload.cancel),
    retry: normalizeRetry(payload.retry ?? payload.rerun),
    redaction: normalizeRedactionMetadata(payload.redaction),
    retention: normalizeRetentionMetadata(payload.retention),
    legacy: detectLegacyShape(payload),
  };
}

export function normalizeExecutionDetail(payload = {}, context = {}) {
  const summary = normalizeExecutionSummary(payload, context);
  return {
    ...summary,
    live: normalizeLiveEventState(payload.live ?? payload.events),
    tests: summary.tests.map((test) => ({
      ...test,
      steps: test.steps.map((step) => ({
        ...step,
        assertions: step.assertions,
        artifacts: step.artifacts,
      })),
    })),
  };
}

export function normalizeExecutionTests(value) {
  return safeArray(value).map((test, index) => {
    const steps = normalizeExecutionSteps(test?.steps ?? test?.children);
    const assertions = normalizeAssertions(test?.assertions);
    const status = deriveStatusWithChildren(test, [...steps, ...assertions]);
    return {
      id: safeIdentifier(test?.id ?? test?.testId ?? test?.idTest ?? index + 1),
      name: safeText(test?.name ?? test?.testName ?? `Test ${index + 1}`),
      runtime: normalizeRuntime(test?.runtime ?? test?.type ?? test?.runner),
      status,
      required: test?.required !== false,
      durationMs: nonNegativeNumber(test?.durationMs ?? test?.duration),
      steps,
      assertions,
      artifacts: normalizeArtifacts(test?.artifacts),
      failures: collectFailures([...steps, ...assertions]),
    };
  });
}

export function normalizeExecutionSteps(value) {
  return safeArray(value).map((step, index) => {
    const assertions = normalizeAssertions(step?.assertions ?? step?.tests);
    const status = deriveStatusWithChildren(step, assertions);
    return {
      id: safeIdentifier(step?.id ?? step?.stepId ?? step?.idStep ?? index + 1),
      name: safeText(step?.name ?? step?.stepName ?? `Step ${index + 1}`),
      status,
      required: step?.required !== false && step?.optional !== true,
      durationMs: nonNegativeNumber(
        step?.durationMs ?? step?.duration ?? step?.time,
      ),
      sequenceId: nonNegativeInteger(step?.sequenceId ?? step?.order ?? index),
      assertions,
      artifacts: normalizeArtifacts(step?.artifacts),
      failure: normalizeFailure(step?.failure ?? step?.error ?? step?.message),
    };
  });
}

export function normalizeAssertions(value) {
  return safeArray(value).map((assertion, index) => {
    const status = normalizeExecutionStatus(
      assertion?.status ?? assertion?.state ?? assertion?.passed,
    );
    return {
      id: safeIdentifier(assertion?.id ?? assertion?.name ?? index + 1),
      name: safeText(
        assertion?.name ?? assertion?.assertion ?? `Assertion ${index + 1}`,
      ),
      status:
        typeof assertion?.passed === "boolean"
          ? assertion.passed
            ? EXECUTION_STATUSES.PASSED
            : EXECUTION_STATUSES.FAILED
          : status,
      required: assertion?.required !== false,
      failure: normalizeFailure(
        assertion?.failure ?? assertion?.error ?? assertion?.message,
      ),
    };
  });
}

export function normalizeLiveEventBatch(events, options = {}) {
  const expectedNextSequence = nonNegativeInteger(options.afterSequence) + 1;
  const normalized = safeArray(events)
    .map((event, index) => ({
      contractVersion: EXECUTION_CONTRACT_VERSION,
      id: safeIdentifier(event?.id ?? `event-${index + 1}`),
      runId: safeIdentifier(event?.runId ?? event?.idRun ?? options.runId),
      sequenceId: positiveInteger(event?.sequenceId ?? event?.seq),
      type: safeEventType(event?.type),
      status: normalizeExecutionStatus(event?.status),
      occurredAt: safeIsoTimestamp(event?.occurredAt ?? event?.timestamp),
      replay: Boolean(event?.replay),
      payload: redactObject(event?.payload ?? event?.data),
    }))
    .filter((event) => event.sequenceId !== null)
    .sort((left, right) => left.sequenceId - right.sequenceId);
  const firstSequence = normalized[0]?.sequenceId ?? expectedNextSequence;
  return {
    events: normalized,
    gapDetected: normalized.length > 0 && firstSequence > expectedNextSequence,
    nextReplayCursor:
      normalized.at(-1)?.sequenceId ?? options.afterSequence ?? 0,
  };
}

export function normalizeLiveEventState(value) {
  const batch = Array.isArray(value)
    ? normalizeLiveEventBatch(value)
    : normalizeLiveEventBatch(value?.events, {
        afterSequence: value?.afterSequence,
        runId: value?.runId,
      });
  return {
    ...batch,
    replayEndpoint: safeRelativeUrl(value?.replayEndpoint),
  };
}

export function requiresLiveEventReplay(batch) {
  return Boolean(batch?.gapDetected);
}

export function normalizeArtifacts(value) {
  return safeArray(value).map((artifact, index) => ({
    id: safeIdentifier(artifact?.id ?? artifact?.artifactId ?? index + 1),
    name: safeText(artifact?.name ?? `Artifact ${index + 1}`),
    type: safeText(artifact?.type ?? "attachment").toLowerCase(),
    sizeBytes: nonNegativeNumber(artifact?.sizeBytes ?? artifact?.size),
    url: safeRelativeUrl(artifact?.url ?? artifact?.downloadUrl),
    redacted: Boolean(artifact?.redacted) || hasSensitiveValue(artifact),
    retention: normalizeRetentionMetadata(artifact?.retention),
  }));
}

export function normalizeReports(value) {
  return safeArray(Array.isArray(value) ? value : value ? [value] : []).map(
    (report, index) => ({
      id: safeIdentifier(report?.id ?? report?.reportId ?? index + 1),
      format: safeText(report?.format ?? report?.type ?? "json").toLowerCase(),
      url: safeRelativeUrl(report?.url ?? report?.downloadUrl),
      generatedAt: safeIsoTimestamp(report?.generatedAt),
      redacted: Boolean(report?.redacted) || hasSensitiveValue(report),
    }),
  );
}

export function normalizeRedactionMetadata(value = {}) {
  return {
    policy: safeText(value.policy ?? "standard"),
    payloadRedacted: value.payloadRedacted !== false,
    credentialFields: safeArray(value.credentialFields).map((field) =>
      safeText(field),
    ),
  };
}

export function normalizeRetentionMetadata(value = {}) {
  return {
    policy: safeText(value.policy ?? "default"),
    expiresAt: safeIsoTimestamp(value.expiresAt),
    legalHold: Boolean(value.legalHold),
  };
}

function deriveRunStatus(payload, tests) {
  const childFailures = collectFailures(tests);
  if (childFailures.some((failure) => failure.required)) {
    return EXECUTION_STATUSES.FAILED;
  }
  return normalizeExecutionStatus(
    payload.status ?? payload.state ?? payload.outcome,
  );
}

function deriveStatusWithChildren(payload, children) {
  const requiredFailure = safeArray(children).some(
    (child) =>
      child.required !== false &&
      [EXECUTION_STATUSES.FAILED, EXECUTION_STATUSES.BLOCKED].includes(
        normalizeExecutionStatus(child.status),
      ),
  );
  if (requiredFailure) {
    return EXECUTION_STATUSES.FAILED;
  }
  const explicitStatus = normalizeExecutionStatus(
    payload?.status ?? payload?.state,
  );
  if (explicitStatus !== EXECUTION_STATUSES.UNKNOWN) {
    return explicitStatus;
  }
  if (
    safeArray(children).length > 0 &&
    safeArray(children).every((child) =>
      isTerminalExecutionStatus(child.status),
    )
  ) {
    return EXECUTION_STATUSES.PASSED;
  }
  return explicitStatus;
}

function collectFailures(entries) {
  return safeArray(entries).flatMap((entry) => {
    const directFailure = [
      EXECUTION_STATUSES.FAILED,
      EXECUTION_STATUSES.BLOCKED,
    ].includes(normalizeExecutionStatus(entry?.status))
      ? [
          {
            id: safeIdentifier(entry?.id),
            name: safeText(entry?.name),
            required: entry?.required !== false,
            message: entry?.failure?.message ?? null,
          },
        ]
      : [];
    return [
      ...directFailure,
      ...collectFailures(entry?.steps),
      ...collectFailures(entry?.assertions),
    ];
  });
}

function summarizeCounts(tests, artifacts, reports) {
  const steps = safeArray(tests).flatMap((test) => test.steps);
  const assertions = steps.flatMap((step) => step.assertions);
  return {
    tests: tests.length,
    steps: steps.length,
    assertions: assertions.length,
    failures: collectFailures(tests).length,
    artifacts:
      artifacts.length + steps.flatMap((step) => step.artifacts).length,
    reports: reports.length,
  };
}

function normalizeProgress(value, tests) {
  const completed = nonNegativeInteger(value?.completed);
  const total = nonNegativeInteger(value?.total);
  if (total > 0) {
    return { completed: Math.min(completed, total), total };
  }
  const inferredTotal = tests.length;
  const inferredCompleted = tests.filter((test) =>
    isTerminalExecutionStatus(test.status),
  ).length;
  return { completed: inferredCompleted, total: inferredTotal };
}

function normalizeTimings(payload) {
  return {
    queuedAt: safeIsoTimestamp(payload.queuedAt),
    startedAt: safeIsoTimestamp(payload.startedAt ?? payload.startTime),
    finishedAt: safeIsoTimestamp(payload.finishedAt ?? payload.endTime),
    durationMs: nonNegativeNumber(payload.durationMs ?? payload.duration),
  };
}

function normalizeWorker(value = {}) {
  return {
    id: safeIdentifier(value.id ?? value.workerId),
    name: safeText(value.name ?? value.hostname ?? "Unassigned worker"),
    runtime: normalizeRuntime(value.runtime ?? value.type),
    status: normalizeExecutionStatus(value.status),
    region: safeText(value.region ?? value.zone),
  };
}

function normalizeCancellation(value = {}) {
  return {
    allowed: Boolean(value.allowed ?? value.canCancel),
    requested: Boolean(value.requested),
    requestedAt: safeIsoTimestamp(value.requestedAt),
    reason: safeText(value.reason),
  };
}

function normalizeRetry(value = {}) {
  return {
    allowed: Boolean(value.allowed ?? value.canRetry),
    reason: safeText(value.reason),
    sourceRunId: safeIdentifier(value.sourceRunId),
  };
}

function normalizeFailure(value) {
  if (!value) return null;
  if (typeof value === "string") {
    return { message: redactText(value), code: "execution.failure" };
  }
  return {
    code: safeIdentifier(value.code ?? "execution.failure"),
    message: redactText(value.message ?? value.detail ?? value.error),
  };
}

function redactObject(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object") return redactText(value);
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      hasSensitiveValue({ [key]: entry }) ? "[REDACTED]" : entry,
    ]),
  );
}

function redactText(value) {
  const text = safeText(value);
  return hasSensitiveValue(text) ? "[REDACTED]" : text;
}

function hasSensitiveValue(value) {
  const text = JSON.stringify(value ?? "").toLowerCase();
  return SENSITIVE_MARKERS.some((marker) => text.includes(marker));
}

function detectLegacyShape(payload) {
  return {
    legacyStatus: payload.status === 1 || payload.status === 2,
    missingProgress: !payload.progress,
    missingContractVersion: !payload.contractVersion,
  };
}

function normalizeRuntime(value) {
  const runtime = String(value ?? "unknown").toLowerCase();
  if (["selenium", "appium", "postman", "api"].includes(runtime)) {
    return runtime;
  }
  return "unknown";
}

function safeEventType(value) {
  const type = String(value ?? "run.updated").toLowerCase();
  return /^[a-z]+(\.[a-z]+){1,4}$/.test(type) ? type : "run.updated";
}

function safeRelativeUrl(value) {
  const url = String(value ?? "");
  return url.startsWith("/api/") ? url : null;
}

function safeIsoTimestamp(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function safeIdentifier(value) {
  return String(value ?? "")
    .replace(/[^a-zA-Z0-9_.:-]/g, "-")
    .slice(0, 120);
}

function safeText(value) {
  return String(value ?? "")
    .trim()
    .slice(0, 500);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function nonNegativeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function nonNegativeInteger(value) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function positiveInteger(value) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : null;
}
