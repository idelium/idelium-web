export const CREDENTIAL_CONTRACT_VERSION = "2026-07-29.credentials.v1";

export const CREDENTIAL_STATUSES = Object.freeze({
  ACTIVE: "active",
  EXPIRED: "expired",
  LEGACY: "legacy",
  REVOKED: "revoked",
  ROTATED: "rotated",
  UNKNOWN: "unknown",
});

const LIFECYCLE_ACTIONS = new Set([
  "audit",
  "create",
  "list",
  "revoke",
  "rotate",
]);

const ACTION_CAPABILITIES = Object.freeze({
  audit: "credential.audit",
  create: "credential.create",
  list: "credential.list",
  revoke: "credential.revoke",
  rotate: "credential.rotate",
});

const DEFAULT_LEGACY_REMOVAL_DATE = "2026-10-31";

export function normalizeCredentialDescriptor(input = {}, context = {}) {
  const tenantId = safeIdentifier(input.tenantId ?? context.tenantId);
  const status = normalizeCredentialStatus(
    input.status ?? input.state ?? (input.legacy ? "legacy" : "unknown"),
    input.expiresAt,
  );
  return {
    actor: safeText(input.actor ?? input.createdBy ?? "unknown"),
    contractVersion:
      input.contractVersion ??
      context.contractVersion ??
      CREDENTIAL_CONTRACT_VERSION,
    createdAt: safeIsoTimestamp(input.createdAt),
    expiresAt: safeIsoTimestamp(input.expiresAt),
    fingerprint: credentialFingerprint(input),
    id: safeIdentifier(input.id ?? input.credentialId ?? input.keyId),
    lastUsedAt: safeIsoTimestamp(input.lastUsedAt),
    lineage: normalizeLineage(input.lineage ?? input.rotation),
    name: safeText(input.name ?? input.label ?? "Credential"),
    prefix: safeText(input.prefix ?? input.keyPrefix),
    scopes: normalizeScopes(input.scopes ?? input.scope),
    status,
    tenantId,
  };
}

export function normalizeCredentialList(credentials = [], context = {}) {
  return safeArray(credentials).map((credential) =>
    normalizeCredentialDescriptor(credential, context),
  );
}

export function normalizeRevealOnceResult(response = {}, context = {}) {
  const descriptor = normalizeCredentialDescriptor(response, context);
  const secret = safeSecret(response.secret ?? response.apiKey ?? response.key);
  return {
    ...descriptor,
    revealOnce: true,
    secret: secret || null,
  };
}

export function redactCredentialPayload(value) {
  if (Array.isArray(value))
    return value.map((entry) => redactCredentialPayload(entry));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        isSensitiveKey(key) ? "[REDACTED]" : redactCredentialPayload(entry),
      ]),
    );
  }
  if (typeof value === "string" && isSensitiveText(value)) return "[REDACTED]";
  return value;
}

export function createCredentialLifecycleRequest(
  action,
  credential = {},
  options = {},
) {
  const normalizedAction = String(action ?? "").toLowerCase();
  if (!LIFECYCLE_ACTIONS.has(normalizedAction)) {
    return rejectedRequest("unsupported-action", normalizedAction);
  }
  const authorization = credentialAuthorization(
    normalizedAction,
    credential,
    options,
  );
  if (!authorization.allowed) {
    return {
      allowed: false,
      authorization,
      reason: authorization.reason,
      status: "rejected",
    };
  }
  const descriptor = normalizeCredentialDescriptor(credential, options);
  return {
    allowed: true,
    body: {
      action: normalizedAction,
      actor: safeText(options.actor ?? "unknown"),
      credentialId: descriptor.id,
      name: descriptor.name,
      scopes: descriptor.scopes,
      tenantId: descriptor.tenantId,
    },
    headers: {
      "Idempotency-Key": stableIdempotencyKey(
        normalizedAction,
        descriptor,
        options,
      ),
    },
    status: "ready",
  };
}

export function credentialAuthorization(action, credential = {}, options = {}) {
  const normalizedAction = String(action ?? "").toLowerCase();
  const requiredCapability = ACTION_CAPABILITIES[normalizedAction];
  if (!requiredCapability) {
    return { allowed: false, reason: "unsupported-action", requiredCapability };
  }
  const capabilities = new Set(safeArray(options.capabilities));
  if (!capabilities.has(requiredCapability)) {
    return { allowed: false, reason: "missing-capability", requiredCapability };
  }
  const credentialTenant = safeIdentifier(
    credential.tenantId ?? options.tenantId,
  );
  const activeTenant = safeIdentifier(options.tenantId);
  if (credentialTenant && activeTenant && credentialTenant !== activeTenant) {
    return { allowed: false, reason: "tenant-mismatch", requiredCapability };
  }
  return { allowed: true, reason: "authorized", requiredCapability };
}

export function legacyCredentialMigrationPolicy(policy = {}) {
  const removalDate =
    safeDate(policy.removalDate) ?? DEFAULT_LEGACY_REMOVAL_DATE;
  const deprecationDate =
    safeDate(policy.deprecationDate) ?? new Date().toISOString().slice(0, 10);
  return {
    compatibilityMode: policy.compatibilityMode !== false,
    deprecationDate,
    legacyListReturnsSecret: false,
    migrationRequired: true,
    releaseNote:
      safeText(policy.releaseNote) ||
      "Legacy Idelium keys remain usable during the deprecation window, but only named credentials may be created, rotated, revoked, or audited.",
    removalCriterion:
      safeText(policy.removalCriterion) ||
      `Legacy keys can be removed after ${removalDate} when all active customers have at least one named credential and no legacy key has been used for 30 days.`,
    removalDate,
    rollback:
      safeText(policy.rollback) ||
      "Rollback keeps legacy read compatibility but must not re-enable secret material in list, detail, or audit responses.",
  };
}

function rejectedRequest(reason, action) {
  return {
    action: safeText(action),
    allowed: false,
    reason,
    status: "rejected",
  };
}

function stableIdempotencyKey(action, descriptor, options) {
  return [
    "credential",
    action,
    descriptor.tenantId || "tenant",
    descriptor.id || descriptor.name,
    safeIdentifier(options.actor ?? "actor"),
  ].join(":");
}

function normalizeCredentialStatus(value, expiresAt) {
  if (safeIsoTimestamp(expiresAt) && new Date(expiresAt) < new Date()) {
    return CREDENTIAL_STATUSES.EXPIRED;
  }
  const status = String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z_-]/g, "");
  if (["active", "enabled"].includes(status)) return CREDENTIAL_STATUSES.ACTIVE;
  if (["revoked", "disabled"].includes(status))
    return CREDENTIAL_STATUSES.REVOKED;
  if (["rotated", "superseded"].includes(status))
    return CREDENTIAL_STATUSES.ROTATED;
  if (["legacy", "legacykey"].includes(status))
    return CREDENTIAL_STATUSES.LEGACY;
  if (["expired"].includes(status)) return CREDENTIAL_STATUSES.EXPIRED;
  return CREDENTIAL_STATUSES.UNKNOWN;
}

function credentialFingerprint(input) {
  const fingerprint = safeText(input.fingerprint ?? input.sha256 ?? input.hash);
  if (fingerprint) return fingerprint.slice(0, 64);
  const prefix = safeText(input.prefix ?? input.keyPrefix);
  const suffix = safeText(input.suffix ?? input.last4);
  return [prefix, suffix].filter(Boolean).join("…");
}

function normalizeLineage(value = {}) {
  return {
    previousCredentialId: safeIdentifier(
      value.previousCredentialId ?? value.previousId,
    ),
    rotatedAt: safeIsoTimestamp(value.rotatedAt),
    rotatedBy: safeText(value.rotatedBy),
  };
}

function normalizeScopes(value) {
  const values = Array.isArray(value)
    ? value
    : String(value ?? "")
        .split(/[,\s]+/)
        .filter(Boolean);
  return [
    ...new Set(values.map((scope) => safeScope(scope)).filter(Boolean)),
  ].slice(0, 50);
}

function safeScope(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9:._-]/g, "")
    .slice(0, 80);
}

function safeIdentifier(value) {
  return String(value ?? "")
    .replace(/[^a-zA-Z0-9_.:@-]/g, "-")
    .slice(0, 120);
}

function safeSecret(value) {
  const secret = String(value ?? "").trim();
  return secret.length >= 16 ? secret.slice(0, 4096) : "";
}

function safeText(value) {
  return String(value ?? "")
    .trim()
    .slice(0, 500);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeIsoTimestamp(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function safeDate(value) {
  const text = String(value ?? "");
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function isSensitiveKey(key) {
  return /api.?key|authorization|bearer|cookie|password|secret|session|token/i.test(
    String(key),
  );
}

function isSensitiveText(value) {
  return /(authorization|bearer|cookie|password|secret|session|token|x-api-key)[=: ]/i.test(
    value,
  );
}
