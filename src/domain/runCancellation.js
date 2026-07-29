import {
  EXECUTION_STATUSES,
  isTerminalExecutionStatus,
  normalizeExecutionStatus,
} from "@/domain/executionContracts";

export function cancellationEligibility(run = {}, capabilities = []) {
  const status = normalizeExecutionStatus(run.status);
  const authorized =
    run.canCancel === true ||
    capabilities.includes("run.cancel") ||
    capabilities.includes("execution.cancel");
  const terminal = isTerminalExecutionStatus(status);
  return {
    allowed:
      authorized &&
      !terminal &&
      [
        EXECUTION_STATUSES.QUEUED,
        EXECUTION_STATUSES.RUNNING,
        EXECUTION_STATUSES.CANCELLING,
      ].includes(status),
    reason: terminal ? "terminal" : authorized ? "eligible" : "unauthorized",
    scope: {
      activeConcurrency: nonNegativeInteger(
        run.activeConcurrency ?? run.activeWorkers,
      ),
      runId: safeIdentifier(run.id ?? run.runId),
      target: safeText(run.target ?? run.targetName),
    },
    status,
  };
}

export function createCancellationRequest(run = {}, options = {}) {
  const eligibility = cancellationEligibility(run, options.capabilities);
  if (!eligibility.allowed) {
    return {
      allowed: false,
      eligibility,
      status: "rejected",
    };
  }
  const idempotencyKey =
    options.idempotencyKey ??
    `cancel:${eligibility.scope.runId}:${safeIdentifier(options.actor ?? "actor")}`;
  return {
    allowed: true,
    audit: {
      actor: safeText(options.actor ?? "unknown"),
      reason: safeText(options.reason ?? ""),
      requestedAt: safeIsoTimestamp(options.requestedAt ?? new Date()),
    },
    body: {
      actor: safeText(options.actor ?? "unknown"),
      reason: safeText(options.reason ?? ""),
      runId: eligibility.scope.runId,
    },
    headers: { "Idempotency-Key": idempotencyKey },
    idempotencyKey,
    status: "cancellation-requested",
  };
}

export function normalizeCancellationResponse(response = {}, request = {}) {
  const data = response.data ?? response;
  const status = normalizeExecutionStatus(data.status ?? data.state);
  const durableCancelled = status === EXECUTION_STATUSES.CANCELLED;
  return {
    audit: {
      ...(request.audit ?? {}),
      completedAt: safeIsoTimestamp(data.completedAt ?? data.updatedAt),
      outcome: durableCancelled
        ? "cancelled"
        : status === EXECUTION_STATUSES.CANCELLING
          ? "cancelling"
          : status === EXECUTION_STATUSES.FAILED
            ? "failed"
            : "pending",
    },
    run: {
      ...data,
      status,
    },
    uiState: durableCancelled ? "cancelled" : "cancelling",
  };
}

export function shouldRetryCancellation(error = {}) {
  const status = error?.response?.status ?? error?.status ?? 0;
  return status === 0 || status === 408 || status === 409 || status >= 500;
}

function safeIsoTimestamp(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
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

function nonNegativeInteger(value) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}
