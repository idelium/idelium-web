import {
  EXECUTION_STATUSES,
  normalizeExecutionDetail,
  normalizeExecutionStatus,
} from "@/domain/executionContracts";

const DETAIL_TABS = new Set([
  "overview",
  "tests",
  "workers",
  "timeline",
  "artifacts",
  "logs",
  "reports",
]);

export function normalizeRunDetailOverview(payload = {}, context = {}) {
  const detail = normalizeExecutionDetail(payload, context);
  const status = normalizeExecutionStatus(detail.status);
  const configuration = redactConfiguration(
    payload.configuration ?? payload.config ?? payload.launchConfiguration,
  );
  return {
    id: detail.id || safeIdentifier(context.runId),
    projectId: detail.projectId || safeIdentifier(context.projectId),
    status,
    authorized: payload.authorized !== false && context.authorized !== false,
    cycle: snapshotDescriptor(
      payload.cycle ?? payload.testCycle,
      payload.cycleSnapshot ?? payload.testCycleSnapshot,
      "Deleted or expired cycle",
    ),
    environment: snapshotDescriptor(
      payload.environment,
      payload.environmentSnapshot,
      "Deleted or expired environment",
    ),
    target: snapshotDescriptor(
      payload.target,
      payload.targetSnapshot,
      "Deleted or expired target",
    ),
    initiator: safeText(payload.initiator ?? payload.author ?? "Unknown"),
    correlationId: safeIdentifier(payload.correlationId),
    timings: detail.timings,
    concurrency: {
      requested: positiveInteger(
        payload.requestedConcurrency ?? payload.concurrency,
        1,
      ),
      active: positiveInteger(payload.activeConcurrency ?? payload.active, 0),
    },
    progress: detail.progress,
    configuration,
    reproducibilityCommand: buildReproducibilityCommand({
      cycleId: payload.cycle?.id ?? payload.idCycle ?? payload.cycleId,
      environment: payload.environment?.code ?? payload.environmentCode,
      projectId: detail.projectId || context.projectId,
    }),
    partial:
      detail.legacy.missingContractVersion || detail.status === "unknown",
    tabs: [...DETAIL_TABS],
  };
}

export function normalizeRunDetailTab(value) {
  const tab = String(value ?? "overview").toLowerCase();
  return DETAIL_TABS.has(tab) ? tab : "overview";
}

export function runDetailRoute({
  projectId,
  runId,
  tab = "overview",
  detailId,
}) {
  const query = new URLSearchParams();
  query.set("tab", normalizeRunDetailTab(tab));
  if (detailId) query.set("detailId", safeIdentifier(detailId));
  return {
    name: "execution-detail",
    params: {
      projectId: safeIdentifier(projectId),
      runId: safeIdentifier(runId),
    },
    query: Object.fromEntries(query.entries()),
  };
}

function snapshotDescriptor(current, snapshot, fallbackName) {
  const source = current ?? snapshot ?? {};
  return {
    id: safeIdentifier(source.id),
    name: safeText(source.name ?? source.code ?? fallbackName),
    version: safeText(source.version ?? source.revision ?? "snapshot"),
    snapshot: current == null,
  };
}

function redactConfiguration(value) {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      isSensitive(key, entry) ? "[REDACTED]" : entry,
    ]),
  );
}

function buildReproducibilityCommand({ cycleId, environment, projectId }) {
  const parts = [
    "idelium",
    `--idCycle=${safeIdentifier(cycleId) || "<cycle>"}`,
    `--idProject=${safeIdentifier(projectId) || "<project>"}`,
    `--environment=${safeIdentifier(environment) || "<environment>"}`,
  ];
  return parts.join(" ");
}

function isSensitive(key, value) {
  return JSON.stringify({ [key]: value })
    .toLowerCase()
    .match(/(authorization|bearer |cookie|password|secret|token|x-api-key)/);
}

function positiveInteger(value, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
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
