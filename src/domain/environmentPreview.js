export const ENVIRONMENT_PREVIEW_CONTRACT_VERSION = "environment.preview.v1";

const MAX_FIELDS = 1_000;
const MAX_DEPTH = 8;
const MAX_TEXT = 100_000;
const ALLOWED_SOURCES = new Set([
  "default",
  "project",
  "environment",
  "launch",
]);
const SENSITIVE_KEY =
  /(authorization|cookie|credential|password|private.?key|secret|session|token)/i;
const PROTECTED_TEXT =
  /(?:\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+/-]+=*|-----BEGIN [A-Z ]*PRIVATE KEY-----|https?:\/\/[^/\s:@]+:[^/\s@]+@)/i;

export function buildResolvedEnvironmentPreview(input = {}) {
  const schemaVersion = safeVersion(input.schemaVersion);
  const catalogVersion = safeVersion(input.catalogVersion);
  if (schemaVersion == null || catalogVersion == null) {
    throw new Error("Environment preview versions are required.");
  }
  const fields = (Array.isArray(input.fields) ? input.fields : [])
    .slice(0, MAX_FIELDS)
    .map(normalizeField)
    .filter((field) => field != null)
    .sort((left, right) => left.path.localeCompare(right.path));
  return {
    catalogVersion,
    contractVersion: ENVIRONMENT_PREVIEW_CONTRACT_VERSION,
    fields,
    launchMutable: input.launchMutable === true,
    schemaVersion,
  };
}

export function serializeResolvedEnvironmentPreview(preview) {
  const normalized = buildResolvedEnvironmentPreview(preview);
  return `${stableStringify(normalized, 0)}\n`;
}

function normalizeField(raw) {
  const path = String(raw?.path ?? "").trim();
  const source = ALLOWED_SOURCES.has(raw?.source) ? raw.source : null;
  if (!/^[A-Za-z0-9_.[\]-]{1,240}$/.test(path) || source == null) return null;
  const secretReference = safeReference(raw?.secretReference);
  return {
    overridden: raw?.overridden === true,
    path,
    source,
    valid: raw?.valid !== false,
    value:
      secretReference == null
        ? (normalizeRedaction(raw?.value) ?? redactValue(raw?.value, path, 0))
        : redaction("secret-reference", secretReference),
  };
}

function normalizeRedaction(value) {
  if (value?.redacted !== true) return null;
  const descriptors = new Set([
    "depth-limit",
    "protected-field",
    "protected-text",
    "secret-reference",
  ]);
  const descriptor = descriptors.has(value.descriptor)
    ? value.descriptor
    : "protected-field";
  return redaction(descriptor, safeReference(value.reference));
}

function redactValue(value, key, depth) {
  if (SENSITIVE_KEY.test(String(key))) return redaction("protected-field");
  if (depth >= MAX_DEPTH) return redaction("depth-limit");
  if (typeof value === "string") {
    if (PROTECTED_TEXT.test(value)) return redaction("protected-text");
    return value.slice(0, MAX_TEXT);
  }
  if (
    value == null ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_FIELDS)
      .map((item, index) => redactValue(item, String(index), depth + 1));
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .slice(0, MAX_FIELDS)
        .map((nestedKey) => [
          nestedKey,
          redactValue(value[nestedKey], nestedKey, depth + 1),
        ]),
    );
  }
  return String(value).slice(0, MAX_TEXT);
}

function redaction(descriptor, reference = null) {
  return {
    descriptor,
    redacted: true,
    reference,
  };
}

function safeReference(value) {
  const normalized = String(value ?? "").trim();
  return /^[A-Za-z0-9_./:-]{1,200}$/.test(normalized) ? normalized : null;
}

function safeVersion(value) {
  const normalized = String(value ?? "").trim();
  return /^[A-Za-z0-9_.-]{1,80}$/.test(normalized) ? normalized : null;
}

function stableStringify(value, depth) {
  if (depth > MAX_DEPTH + 4) return JSON.stringify(redaction("depth-limit"));
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item, depth + 1)).join(",")}]`;
  }
  if (value != null && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stableStringify(value[key], depth + 1)}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value);
}
