const ARTIFACT_TYPES = new Set([
  "log",
  "screenshot",
  "trace",
  "har",
  "postman",
  "json",
  "text",
]);
const TIMELINE_STATES = new Set([
  "passed",
  "failed",
  "skipped",
  "running",
  "pending",
]);

export function normalizeExecutionTimeline(steps) {
  return safeArray(steps).map((step, index) => ({
    id: safeIdentifier(step?.id ?? step?.stepId ?? index + 1),
    name: safeText(step?.name ?? step?.stepName ?? `Step ${index + 1}`),
    state: normalizeTimelineState(step?.state ?? step?.status),
    durationMs: nonNegativeNumber(
      step?.durationMs ?? step?.duration ?? step?.time,
    ),
    diagnostics: normalizeDiagnostics(
      step?.diagnostics ?? step?.errors ?? step?.message,
    ),
    requestCount: nonNegativeInteger(
      step?.requestCount ?? step?.requests?.length,
    ),
    responseCount: nonNegativeInteger(
      step?.responseCount ?? step?.responses?.length,
    ),
    artifactCount: normalizeArtifacts(step?.artifacts).length,
  }));
}

export function normalizeArtifacts(artifacts) {
  return safeArray(artifacts).map((artifact, index) => ({
    id: safeIdentifier(
      artifact?.id ?? artifact?.name ?? `artifact-${index + 1}`,
    ),
    name: safeText(artifact?.name ?? `Artifact ${index + 1}`),
    type: normalizeArtifactType(artifact?.type),
    contentType: safeText(
      artifact?.contentType ?? artifact?.mimeType ?? "application/octet-stream",
    ),
    preview: safePreview(
      artifact?.preview ??
        artifact?.content ??
        artifact?.body ??
        artifact?.text,
    ),
    redacted: Boolean(artifact?.redacted),
    downloadUrl: safeArtifactUrl(artifact?.downloadUrl ?? artifact?.url),
  }));
}

export function executionDetailRoute({
  projectId,
  runId,
  testId,
  stepId,
  artifactId,
}) {
  const query = new URLSearchParams();
  appendIfPresent(query, "runId", runId);
  appendIfPresent(query, "testId", testId);
  appendIfPresent(query, "stepId", stepId);
  appendIfPresent(query, "artifactId", artifactId);

  return {
    path: `/projects/${safeIdentifier(projectId)}/testsperformed`,
    query: Object.fromEntries(query.entries()),
  };
}

export function hasSensitiveValue(value) {
  const text = JSON.stringify(value ?? "").toLowerCase();
  return [
    "authorization:",
    "bearer ",
    "x-api-key",
    "api_key",
    "password",
    "set-cookie",
    "sessionid",
    "token=",
  ].some((marker) => text.includes(marker));
}

export function assertRedactedArtifact(artifact) {
  const normalized = normalizeArtifacts([artifact])[0];
  return Boolean(normalized?.redacted) || !hasSensitiveValue(normalized);
}

function normalizeTimelineState(value) {
  if (value === 1 || String(value).toLowerCase() === "success") {
    return "passed";
  }
  if (value === 2 || String(value).toLowerCase() === "error") {
    return "failed";
  }
  const state = String(value ?? "pending").toLowerCase();
  return TIMELINE_STATES.has(state) ? state : "pending";
}

function normalizeArtifactType(value) {
  const type = String(value ?? "text").toLowerCase();
  return ARTIFACT_TYPES.has(type) ? type : "text";
}

function normalizeDiagnostics(value) {
  return safeArray(Array.isArray(value) ? value : value ? [value] : []).map(
    (entry) => safeText(entry),
  );
}

function safePreview(value) {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "object") {
    return JSON.stringify(value).slice(0, 20_000);
  }
  return String(value).slice(0, 20_000);
}

function safeArtifactUrl(value) {
  const url = String(value ?? "");
  if (url.startsWith("/api/") || url.startsWith("https://github.com/")) {
    return url;
  }
  return null;
}

function appendIfPresent(query, key, value) {
  const safe = safeIdentifier(value);
  if (safe !== "") {
    query.set(key, safe);
  }
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
