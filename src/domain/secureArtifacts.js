export const ARTIFACT_PREVIEW_LIMIT_BYTES = 64 * 1024;
export const ARTIFACT_TEXT_PREVIEW_LIMIT = 20_000;

const VIEWABLE_TYPES = new Set([
  "application/json",
  "application/xml",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "text/csv",
  "text/html",
  "text/markdown",
  "text/plain",
]);

export function normalizeArtifactDescriptor(artifact = {}, context = {}) {
  const contentType = safeContentType(
    artifact.contentType ?? artifact.mimeType ?? artifact.type,
  );
  const sizeBytes = nonNegativeNumber(artifact.sizeBytes ?? artifact.size);
  const state = normalizeAvailability(artifact);
  return {
    id: safeIdentifier(artifact.id ?? artifact.artifactId ?? artifact.name),
    runId: safeIdentifier(artifact.runId ?? context.runId),
    projectId: safeIdentifier(artifact.projectId ?? context.projectId),
    name: safeText(artifact.name ?? "Artifact"),
    kind: safeKind(artifact.kind ?? artifact.type),
    contentType,
    sizeBytes,
    retention: normalizeRetention(artifact.retention),
    redacted: Boolean(artifact.redacted) || containsSensitiveValue(artifact),
    availability: state,
    preview: buildPreview(artifact, contentType, state, sizeBytes),
    download: normalizeDownloadDescriptor(
      artifact.download ?? artifact,
      context,
    ),
  };
}

export function normalizeArtifactCollection(artifacts, context = {}) {
  return safeArray(artifacts).map((artifact) =>
    normalizeArtifactDescriptor(artifact, context),
  );
}

export function canPreviewArtifact(descriptor) {
  return (
    descriptor?.availability === "available" &&
    descriptor?.preview?.available === true
  );
}

export function fullArtifactRoute({ artifactId, projectId, runId }) {
  const query = new URLSearchParams();
  query.set("tab", "artifacts");
  query.set("artifactId", safeIdentifier(artifactId));
  return {
    name: "execution-detail",
    params: {
      projectId: safeIdentifier(projectId),
      runId: safeIdentifier(runId),
    },
    query: Object.fromEntries(query.entries()),
  };
}

export function artifactExplanation(descriptor, copy = {}) {
  if (descriptor.redacted) return copy.redacted ?? "Content was redacted.";
  if (descriptor.availability === "expired")
    return copy.expired ?? "Content has expired.";
  if (descriptor.availability === "oversized")
    return copy.oversized ?? "Content is too large to preview.";
  if (descriptor.availability === "quarantined")
    return copy.quarantined ?? "Content is quarantined.";
  if (descriptor.availability === "unavailable")
    return copy.unavailable ?? "Content is unavailable.";
  return copy.available ?? "Content is available.";
}

function buildPreview(artifact, contentType, availability, sizeBytes) {
  if (availability !== "available") {
    return { available: false, content: "", truncated: false };
  }
  if (
    artifact.redacted ||
    containsSensitiveValue(artifact.preview ?? artifact.body)
  ) {
    return { available: false, content: "[REDACTED]", truncated: false };
  }
  if (sizeBytes > ARTIFACT_PREVIEW_LIMIT_BYTES) {
    return { available: false, content: "", truncated: true };
  }
  if (!VIEWABLE_TYPES.has(contentType)) {
    return { available: false, content: "", truncated: false };
  }
  const raw =
    artifact.preview ?? artifact.body ?? artifact.text ?? artifact.data ?? "";
  const text = typeof raw === "string" ? raw : JSON.stringify(raw, null, 2);
  return {
    available: true,
    content: text.slice(0, ARTIFACT_TEXT_PREVIEW_LIMIT),
    truncated: text.length > ARTIFACT_TEXT_PREVIEW_LIMIT,
  };
}

function normalizeDownloadDescriptor(value = {}, context = {}) {
  const url = String(value.url ?? value.downloadUrl ?? "");
  const expiresAt = safeIsoTimestamp(value.expiresAt);
  const authorized =
    value.authorized !== false &&
    sameScope(value.projectId, context.projectId) &&
    sameScope(value.runId, context.runId);
  return {
    authorized,
    expiresAt,
    method:
      String(value.method ?? "GET").toUpperCase() === "POST" ? "POST" : "GET",
    url: isSafeDownloadUrl(url) ? url : null,
  };
}

function normalizeAvailability(artifact) {
  if (artifact.quarantined) return "quarantined";
  if (artifact.expired) return "expired";
  if (artifact.unavailable) return "unavailable";
  if (
    nonNegativeNumber(artifact.sizeBytes ?? artifact.size) >
    ARTIFACT_PREVIEW_LIMIT_BYTES
  ) {
    return "oversized";
  }
  return "available";
}

function normalizeRetention(value = {}) {
  return {
    policy: safeText(value.policy ?? "default"),
    expiresAt: safeIsoTimestamp(value.expiresAt),
    legalHold: Boolean(value.legalHold),
  };
}

function sameScope(value, expected) {
  if (expected == null || expected === "") return true;
  if (value == null || value === "") return true;
  return String(value) === String(expected);
}

function safeContentType(value) {
  const contentType = String(value ?? "text/plain").toLowerCase();
  return /^[a-z0-9.+-]+\/[a-z0-9.+-]+$/.test(contentType)
    ? contentType
    : "text/plain";
}

function safeKind(value) {
  const kind = String(value ?? "artifact").toLowerCase();
  return ["artifact", "image", "log", "postman", "report", "response"].includes(
    kind,
  )
    ? kind
    : "artifact";
}

function isSafeDownloadUrl(value) {
  return String(value ?? "").startsWith("/api/");
}

function containsSensitiveValue(value) {
  return JSON.stringify(value ?? "")
    .toLowerCase()
    .match(/(authorization|bearer |cookie|password|secret|token|x-api-key)/);
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

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function nonNegativeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}
