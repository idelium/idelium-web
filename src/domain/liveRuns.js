import {
  EXECUTION_STATUSES,
  isTerminalExecutionStatus,
  normalizeExecutionStatus,
} from "@/domain/executionContracts";

const DEFAULT_WINDOW_SIZE = 50;
const STALE_AFTER_MS = 30_000;

export function normalizeLiveRun(payload = {}, options = {}) {
  const lastUpdateAt = safeIsoTimestamp(
    payload.lastUpdateAt ??
      payload.updatedAt ??
      payload.timestamp ??
      payload.finishedAt ??
      payload.startedAt,
  );
  const progress = normalizeProgress(payload.progress, payload);
  const status = normalizeExecutionStatus(
    payload.status ?? payload.state ?? payload.outcome,
  );
  const now = options.now instanceof Date ? options.now : new Date();
  const stale = isRunStale(lastUpdateAt, now, options.staleAfterMs);

  return {
    id: safeIdentifier(payload.id ?? payload.runId ?? payload.idRun),
    projectId: safeIdentifier(
      payload.projectId ?? payload.idProject ?? options.projectId,
    ),
    cycle: {
      id: safeIdentifier(
        payload.cycle?.id ?? payload.cycleId ?? payload.idCycle,
      ),
      name: safeText(
        payload.cycle?.name ??
          payload.cycleName ??
          payload.testCycleName ??
          "Run",
      ),
    },
    target: safeText(payload.target ?? payload.targetName ?? payload.runner),
    status,
    terminal: isTerminalExecutionStatus(status),
    progress,
    requestedConcurrency: positiveInteger(
      payload.requestedConcurrency ?? payload.concurrency ?? progress.total,
      1,
    ),
    activeConcurrency: nonNegativeInteger(
      payload.activeConcurrency ?? payload.activeWorkers ?? payload.active,
    ),
    completedWorkers: nonNegativeInteger(
      payload.completedWorkers ?? payload.completed,
    ),
    failedWorkers: nonNegativeInteger(payload.failedWorkers ?? payload.failed),
    cancelledWorkers: nonNegativeInteger(
      payload.cancelledWorkers ?? payload.cancelled,
    ),
    queueTimeMs: nonNegativeNumber(payload.queueTimeMs ?? payload.queueMs),
    elapsedTimeMs: nonNegativeNumber(
      payload.elapsedTimeMs ?? payload.durationMs ?? payload.duration,
    ),
    lastUpdateAt,
    stale,
    updateChannel: normalizeUpdateChannel(payload.updateChannel),
    degraded: Boolean(payload.degraded) || stale,
    canCancel: Boolean(payload.canCancel) || canCancelStatus(status),
    canOpenDetails: payload.canOpenDetails !== false,
    sequenceId: nonNegativeInteger(payload.sequenceId ?? payload.seq),
    workerSummary: normalizeWorkerSummary(
      payload.workerSummary ?? payload.resultSummary ?? payload.workers,
    ),
  };
}

export function mergeLiveRunWindow(previousRuns, incomingRuns, options = {}) {
  const previousById = new Map(
    safeArray(previousRuns).map((run) => [
      String(run.id),
      normalizeLiveRun(run),
    ]),
  );
  const merged = safeArray(incomingRuns).map((run) => {
    const normalized = normalizeLiveRun(run, options);
    const previous = previousById.get(String(normalized.id));
    if (!previous) return normalized;
    if (normalized.sequenceId < previous.sequenceId) {
      return previous;
    }
    return {
      ...normalized,
      progress: maxProgress(previous.progress, normalized.progress),
    };
  });

  return merged
    .sort((left, right) => {
      const rightTime = new Date(right.lastUpdateAt ?? 0).getTime();
      const leftTime = new Date(left.lastUpdateAt ?? 0).getTime();
      return rightTime - leftTime;
    })
    .slice(0, positiveInteger(options.windowSize, DEFAULT_WINDOW_SIZE));
}

export function filterLiveRuns(runs, filters = {}) {
  const statuses = new Set(
    safeArray(filters.statuses).map((status) =>
      normalizeExecutionStatus(status),
    ),
  );
  const projectId = safeIdentifier(filters.projectId);
  return safeArray(runs)
    .map((run) => normalizeLiveRun(run, filters))
    .filter((normalized) => {
      if (
        projectId &&
        normalized.projectId &&
        normalized.projectId !== projectId
      ) {
        return false;
      }
      if (statuses.size > 0 && !statuses.has(normalized.status)) {
        return false;
      }
      return true;
    });
}

export function boundedLiveRunAnnouncements(runs, labels = {}, limit = 3) {
  return safeArray(runs)
    .slice(0, positiveInteger(limit, 3))
    .map((run) => {
      const normalized = normalizeLiveRun(run);
      const statusLabel =
        labels[normalized.status] ?? labels.unknown ?? normalized.status;
      return `${normalized.cycle.name}: ${statusLabel}, ${normalized.progress.completed}/${normalized.progress.total}`;
    });
}

export function liveRunStatusVariant(status) {
  const normalized = normalizeExecutionStatus(status);
  if (normalized === EXECUTION_STATUSES.PASSED) return "success";
  if (
    [
      EXECUTION_STATUSES.FAILED,
      EXECUTION_STATUSES.BLOCKED,
      EXECUTION_STATUSES.CANCELLED,
    ].includes(normalized)
  ) {
    return "danger";
  }
  if (normalized === EXECUTION_STATUSES.RUNNING) return "running";
  if (normalized === EXECUTION_STATUSES.CANCELLING) return "warning";
  return "secondary";
}

function normalizeProgress(value, payload) {
  const total = positiveInteger(
    value?.total ?? payload.requestedConcurrency ?? payload.totalWorkers,
    1,
  );
  const completed = nonNegativeInteger(
    value?.completed ??
      payload.completedWorkers ??
      payload.completed ??
      (isTerminalExecutionStatus(payload.status) ? total : 0),
  );
  return {
    completed: Math.min(completed, total),
    total,
    percent: Math.round((Math.min(completed, total) / total) * 100),
  };
}

function maxProgress(previous, next) {
  const total = Math.max(previous.total, next.total, 1);
  const completed = Math.min(
    Math.max(previous.completed, next.completed),
    total,
  );
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

function normalizeWorkerSummary(value) {
  return safeArray(value)
    .slice(0, 100)
    .map((worker, index) => ({
      workerId: safeIdentifier(worker?.workerId ?? worker?.id ?? index + 1),
      status: normalizeExecutionStatus(worker?.status),
    }));
}

function isRunStale(lastUpdateAt, now, staleAfterMs = STALE_AFTER_MS) {
  if (!lastUpdateAt) return true;
  return now.getTime() - new Date(lastUpdateAt).getTime() > staleAfterMs;
}

function normalizeUpdateChannel(value) {
  const channel = String(value ?? "polling").toLowerCase();
  return ["websocket", "sse", "polling"].includes(channel)
    ? channel
    : "polling";
}

function canCancelStatus(status) {
  return [
    EXECUTION_STATUSES.QUEUED,
    EXECUTION_STATUSES.RUNNING,
    EXECUTION_STATUSES.CANCELLING,
  ].includes(normalizeExecutionStatus(status));
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

function positiveInteger(value, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}
