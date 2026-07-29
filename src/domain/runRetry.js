import { normalizeExecutionStatus } from "@/domain/executionContracts";
import { runDetailRoute } from "@/domain/runDetailOverview";

const SUPPORTED_SCOPES = new Set(["full", "failed"]);
const RETRYABLE_RUNTIMES = new Set(["postman", "selenium", "appium", "api"]);

export function retryEligibility(run = {}, scope = "failed") {
  const normalizedScope = SUPPORTED_SCOPES.has(scope) ? scope : "failed";
  const runtime = String(run.runtime ?? run.runner ?? "unknown").toLowerCase();
  const status = normalizeExecutionStatus(run.status);
  const retryableRuntime = RETRYABLE_RUNTIMES.has(runtime);
  const hasFailures =
    safeArray(run.failures).length > 0 ||
    safeArray(run.tests).some(
      (test) => normalizeExecutionStatus(test.status) === "failed",
    );
  const unavailableAssets = safeArray(run.assets ?? run.relatedAssets).filter(
    (asset) => asset?.available === false || asset?.snapshot === true,
  );
  const allowed =
    retryableRuntime &&
    (normalizedScope === "full" || hasFailures) &&
    run.authorized !== false;

  return {
    allowed,
    reason: allowed
      ? unavailableAssets.length > 0
        ? "preflight-required"
        : "eligible"
      : !retryableRuntime
        ? "unsupported-runtime"
        : run.authorized === false
          ? "unauthorized"
          : "no-failed-scope",
    requiresPreflight: unavailableAssets.length > 0,
    runtime,
    scope: normalizedScope,
    sourceRunId: safeIdentifier(run.id ?? run.runId),
    unavailableAssets: unavailableAssets.map((asset) => ({
      id: safeIdentifier(asset.id),
      name: safeText(asset.name ?? "Unavailable asset"),
      version: safeText(asset.version ?? "snapshot"),
    })),
  };
}

export function createRetryRunRequest(run = {}, options = {}) {
  const eligibility = retryEligibility(run, options.scope);
  if (!eligibility.allowed) {
    return { allowed: false, eligibility, status: "rejected" };
  }
  const idempotencyKey =
    options.idempotencyKey ??
    `retry:${eligibility.sourceRunId}:${eligibility.scope}:${safeIdentifier(options.actor ?? "actor")}`;
  return {
    allowed: true,
    body: {
      actor: safeText(options.actor ?? "unknown"),
      configurationSnapshot: redactConfiguration(
        run.configuration ?? run.config ?? {},
      ),
      reason: safeText(options.reason ?? ""),
      requiresPreflight: eligibility.requiresPreflight,
      scope: eligibility.scope,
      selectedFailedScope: normalizeFailedScope(run, eligibility.scope),
      sourceRunId: eligibility.sourceRunId,
      sourceVersion: safeText(run.version ?? run.revision ?? "snapshot"),
    },
    headers: { "Idempotency-Key": idempotencyKey },
    idempotencyKey,
    status: eligibility.requiresPreflight ? "preflight-required" : "ready",
  };
}

export function normalizeRetryRunResponse(response = {}, context = {}) {
  const data = response.data ?? response;
  const runId = safeIdentifier(data.runId ?? data.idRun ?? data.id);
  return {
    derivedRunId: runId,
    sourceRunId: safeIdentifier(data.sourceRunId ?? context.sourceRunId),
    trace: {
      derivedRunId: runId,
      sourceRunId: safeIdentifier(data.sourceRunId ?? context.sourceRunId),
    },
    route: runDetailRoute({
      projectId: data.projectId ?? context.projectId,
      runId,
      tab: "overview",
    }),
  };
}

function normalizeFailedScope(run, scope) {
  if (scope === "full") return [];
  return safeArray(run.failures)
    .map((failure) =>
      safeIdentifier(failure.id ?? failure.stepId ?? failure.testId),
    )
    .filter(Boolean);
}

function redactConfiguration(value) {
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      /authorization|bearer |cookie|password|secret|token|x-api-key/i.test(
        JSON.stringify({ [key]: entry }),
      )
        ? "[REDACTED]"
        : entry,
    ]),
  );
}

function safeIdentifier(value) {
  return String(value ?? "")
    .replace(/[^a-zA-Z0-9_.:@-]/g, "-")
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
