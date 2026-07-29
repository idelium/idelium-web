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
const STATUS_FILTERS = new Set([
  "active",
  "expiring",
  "expired",
  "legacy",
  "revoked",
  "rotated",
  "unknown",
]);
const DEFAULT_SCOPES = ["run:execute"];
const MAX_LIFETIME_DAYS = 365;
const DEFAULT_REVEAL_TTL_MS = 10 * 60 * 1000;
const ROTATION_POLICIES = new Set(["immediate", "overlap-24h", "overlap-7d"]);
const DEFAULT_CLI_VERSION = "1.0.14";

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

export function normalizeCredentialInventory(credentials = [], context = {}) {
  const filters = normalizeCredentialInventoryFilters(context.filters);
  return normalizeCredentialList(credentials, context)
    .filter((credential) => credentialMatchesFilters(credential, filters))
    .slice(0, positiveInteger(context.limit, 100));
}

export function credentialInventoryRow(credential = {}, copy = {}) {
  const descriptor = normalizeCredentialDescriptor(credential);
  return {
    actor: descriptor.actor,
    createdAt: formatDate(descriptor.createdAt),
    expiresAt: formatDate(descriptor.expiresAt),
    fingerprint: descriptor.fingerprint || descriptor.prefix || "—",
    id: descriptor.id,
    lastUsedAt: lastUsedLabel(descriptor.lastUsedAt, credential, copy),
    lineage: credentialLineageLabel(descriptor, copy),
    name: descriptor.name,
    rowLabel: `${descriptor.name} ${descriptor.fingerprint || descriptor.prefix}`,
    scopes: descriptor.scopes.join(", "),
    status: credentialInventoryStatus(descriptor),
    tenantId: descriptor.tenantId,
  };
}

export function normalizeCredentialInventoryFilters(filters = {}) {
  const statusInput = filters.statuses ?? filters.status;
  const statuses = (Array.isArray(statusInput) ? statusInput : [statusInput])
    .flatMap((status) => String(status).split(","))
    .map((status) => String(status).toLowerCase().trim())
    .filter((status) => STATUS_FILTERS.has(status));
  return {
    expiry: safeExpiryFilter(filters.expiry),
    owner: safeText(filters.owner),
    scopes: normalizeScopes(filters.scopes ?? filters.scope),
    statuses,
  };
}

export function buildCredentialInventoryQuery(filters = {}, context = {}) {
  const normalized = normalizeCredentialInventoryFilters(filters);
  const params = new URLSearchParams();
  params.set("tenantId", safeIdentifier(context.tenantId));
  params.set(
    "pageSize",
    String(Math.min(positiveInteger(filters.pageSize, 50), 100)),
  );
  for (const status of normalized.statuses) params.append("status", status);
  for (const scope of normalized.scopes) params.append("scope", scope);
  if (normalized.owner) params.set("owner", normalized.owner);
  if (normalized.expiry) params.set("expiry", normalized.expiry);
  return params;
}

export function credentialInventoryActions(credential = {}, options = {}) {
  const actions = [
    { id: "create", label: "Create", requires: "credential.create" },
    { id: "rotate", label: "Rotate", requires: "credential.rotate" },
    {
      id: "revoke",
      label: "Revoke",
      requires: "credential.revoke",
      requiresConfirmation: true,
      variant: "danger",
    },
    { id: "audit", label: "Audit", requires: "credential.audit" },
  ];
  const capabilities = new Set(safeArray(options.capabilities));
  const status = normalizeCredentialDescriptor(credential).status;
  return actions
    .filter((action) => capabilities.has(action.requires))
    .map((action) => ({
      ...action,
      disabled:
        (action.id === "rotate" || action.id === "revoke") &&
        [CREDENTIAL_STATUSES.REVOKED, CREDENTIAL_STATUSES.EXPIRED].includes(
          status,
        ),
      tooltip: safeText(
        options.copy?.[`${action.id}Tooltip`] ??
          `${action.label} credential ${credential.name ?? credential.id ?? ""}`,
      ),
    }));
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

export function createRevealOnceSession(response = {}, context = {}) {
  const revealed = normalizeRevealOnceResult(response, context);
  const now = positiveInteger(context.now, Date.now());
  const ttlMs = Math.min(
    positiveInteger(context.ttlMs, DEFAULT_REVEAL_TTL_MS),
    DEFAULT_REVEAL_TTL_MS,
  );
  return {
    acknowledged: false,
    credential: revealOnceSafeSnapshot(revealed),
    expiresAt: new Date(now + ttlMs).toISOString(),
    secret: revealed.secret,
    sessionId: stableRevealSessionId(revealed, now),
  };
}

export function revealOnceSafeSnapshot(value = {}) {
  const descriptor = normalizeCredentialDescriptor(value);
  return {
    ...descriptor,
    revealOnce: true,
  };
}

export function revealOnceDownloadPayload(session = {}, context = {}) {
  const credential = revealOnceSafeSnapshot(session.credential ?? session);
  const secret = safeSecret(session.secret);
  if (!secret) {
    return { allowed: false, reason: "missing-secret" };
  }
  if (context.acknowledged !== true) {
    return { allowed: false, reason: "acknowledgement-required" };
  }
  return {
    allowed: true,
    filename: `${credential.name || credential.id || "idelium-credential"}.idelium`,
    mimeType: "text/plain",
    text: secret,
  };
}

export function shouldClearRevealOnceRoute(to = {}, from = {}, session = {}) {
  if (!session?.secret) return false;
  if (to.name !== from.name) return true;
  const toProject = to.params?.idProject ?? to.params?.projectId;
  const fromProject = from.params?.idProject ?? from.params?.projectId;
  if (toProject !== fromProject) return true;
  const currentCredentialId = session.credential?.id;
  if (
    to.query?.mode === "reveal-once" &&
    to.query?.credentialId === currentCredentialId
  ) {
    return false;
  }
  return to.fullPath !== from.fullPath;
}

export function credentialInventoryStatus(credential = {}) {
  const descriptor = normalizeCredentialDescriptor(credential);
  if (
    descriptor.status === CREDENTIAL_STATUSES.ACTIVE &&
    descriptor.expiresAt &&
    new Date(descriptor.expiresAt).getTime() - Date.now() <=
      14 * 24 * 60 * 60 * 1000
  ) {
    return "expiring";
  }
  return descriptor.status;
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

export function defaultCredentialCreationModel(options = {}) {
  return {
    constraints: safeText(options.constraints),
    description: safeText(options.description),
    expiresAt: options.expiresAt ?? defaultExpiryDate(90),
    name: safeText(options.name),
    scopes: normalizeScopes(options.scopes ?? DEFAULT_SCOPES),
  };
}

export function validateCredentialCreation(model = {}, options = {}) {
  const normalized = defaultCredentialCreationModel(model);
  const actorScopes = new Set(
    normalizeScopes(options.actorScopes ?? DEFAULT_SCOPES),
  );
  const existingNames = new Set(
    safeArray(options.existingCredentials).map((credential) =>
      safeText(credential.name).toLowerCase(),
    ),
  );
  const errors = [];
  if (!normalized.name) errors.push({ field: "name", code: "required" });
  if (existingNames.has(normalized.name.toLowerCase())) {
    errors.push({ field: "name", code: "duplicate" });
  }
  if (normalized.scopes.length === 0) {
    errors.push({ field: "scopes", code: "required" });
  }
  for (const scope of normalized.scopes) {
    if (!actorScopes.has(scope)) {
      errors.push({ field: "scopes", code: "unauthorized-scope", scope });
    }
  }
  if (!safeIsoTimestamp(normalized.expiresAt)) {
    errors.push({ field: "expiresAt", code: "invalid-date" });
  } else if (daysUntil(normalized.expiresAt) > MAX_LIFETIME_DAYS) {
    errors.push({ field: "expiresAt", code: "maximum-lifetime" });
  }
  if (
    normalized.scopes.includes("credential:admin") &&
    normalized.scopes.includes("artifact:read")
  ) {
    errors.push({ field: "scopes", code: "dangerous-combination" });
  }
  return { errors, model: normalized, valid: errors.length === 0 };
}

export function createCredentialCreationRequest(model = {}, options = {}) {
  const validation = validateCredentialCreation(model, options);
  const authorization = credentialAuthorization("create", {}, options);
  if (!authorization.allowed) {
    return {
      allowed: false,
      authorization,
      errors: [{ field: "capability", code: authorization.reason }],
      status: "rejected",
      validation,
    };
  }
  if (!validation.valid) {
    return {
      allowed: false,
      errors: validation.errors,
      status: "invalid",
      validation,
    };
  }
  const tenantId = safeIdentifier(options.tenantId);
  const actor = safeIdentifier(options.actor ?? "actor");
  return {
    allowed: true,
    body: {
      constraints: validation.model.constraints,
      description: validation.model.description,
      expiresAt: validation.model.expiresAt,
      name: validation.model.name,
      scopes: validation.model.scopes,
      tenantId,
    },
    headers: {
      "Idempotency-Key":
        options.idempotencyKey ??
        `credential:create:${tenantId}:${actor}:${stableCreationHash(validation.model)}`,
    },
    status: "ready",
    validation,
  };
}

export function validateCredentialRotation(model = {}, credential = {}) {
  const descriptor = normalizeCredentialDescriptor(credential);
  const policy = normalizeRotationPolicy(model.policy);
  const errors = [];
  if (!descriptor.id) errors.push({ field: "credentialId", code: "required" });
  if (!ROTATION_POLICIES.has(policy)) {
    errors.push({ field: "policy", code: "unsupported-policy" });
  }
  if (
    [CREDENTIAL_STATUSES.REVOKED, CREDENTIAL_STATUSES.EXPIRED].includes(
      descriptor.status,
    )
  ) {
    errors.push({ field: "status", code: "terminal-state" });
  }
  return {
    credential: descriptor,
    errors,
    model: { policy },
    valid: errors.length === 0,
  };
}

export function createCredentialRotationRequest(
  model = {},
  credential = {},
  options = {},
) {
  const validation = validateCredentialRotation(model, credential);
  const authorization = credentialAuthorization("rotate", credential, options);
  if (!authorization.allowed) {
    return {
      allowed: false,
      authorization,
      errors: [{ field: "capability", code: authorization.reason }],
      status: "rejected",
      validation,
    };
  }
  if (!validation.valid) {
    return {
      allowed: false,
      errors: validation.errors,
      status: "invalid",
      validation,
    };
  }
  const tenantId = safeIdentifier(options.tenantId);
  const actor = safeIdentifier(options.actor ?? "actor");
  return {
    allowed: true,
    body: {
      credentialId: validation.credential.id,
      policy: validation.model.policy,
      tenantId,
    },
    headers: {
      "Idempotency-Key":
        options.idempotencyKey ??
        [
          "credential",
          "rotate",
          tenantId,
          validation.credential.id,
          actor,
          validation.model.policy,
        ].join(":"),
    },
    status: "ready",
    validation,
  };
}

export function validateCredentialRevocation(
  model = {},
  credential = {},
  options = {},
) {
  const descriptor = normalizeCredentialDescriptor(credential, options);
  const confirmName = safeText(model.confirmName);
  const confirmFingerprint = safeText(model.confirmFingerprint);
  const reason = safeText(model.reason);
  const errors = [];
  if (!descriptor.id) errors.push({ field: "credentialId", code: "required" });
  if ([CREDENTIAL_STATUSES.REVOKED].includes(descriptor.status)) {
    errors.push({ field: "status", code: "already-revoked" });
  }
  if ([CREDENTIAL_STATUSES.EXPIRED].includes(descriptor.status)) {
    errors.push({ field: "status", code: "terminal-state" });
  }
  if (confirmName !== descriptor.name) {
    errors.push({ field: "confirmName", code: "confirmation-mismatch" });
  }
  const expectedFingerprint = descriptor.fingerprint || descriptor.prefix;
  if (expectedFingerprint && confirmFingerprint !== expectedFingerprint) {
    errors.push({
      field: "confirmFingerprint",
      code: "confirmation-mismatch",
    });
  }
  if (options.reasonRequired && !reason) {
    errors.push({ field: "reason", code: "reason-required" });
  }
  if (options.requiresElevatedConfirmation && model.elevated !== true) {
    errors.push({
      field: "elevated",
      code: "elevated-confirmation-required",
    });
  }
  return {
    credential: descriptor,
    errors,
    model: {
      confirmFingerprint,
      confirmName,
      elevated: model.elevated === true,
      reason,
    },
    valid: errors.length === 0,
  };
}

export function createCredentialRevocationRequest(
  model = {},
  credential = {},
  options = {},
) {
  const validation = validateCredentialRevocation(model, credential, options);
  const authorization = credentialAuthorization("revoke", credential, options);
  if (!authorization.allowed) {
    return {
      allowed: false,
      authorization,
      errors: [{ field: "capability", code: authorization.reason }],
      status: "rejected",
      validation,
    };
  }
  if (!validation.valid) {
    return {
      allowed: false,
      errors: validation.errors,
      status: "invalid",
      validation,
    };
  }
  const tenantId = safeIdentifier(options.tenantId);
  const actor = safeIdentifier(options.actor ?? "actor");
  return {
    allowed: true,
    body: {
      actor,
      credentialId: validation.credential.id,
      elevated: validation.model.elevated,
      reason: validation.model.reason,
      tenantId,
    },
    headers: {
      "Idempotency-Key":
        options.idempotencyKey ??
        [
          "credential",
          "revoke",
          tenantId,
          validation.credential.id,
          actor,
          stableReasonHash(validation.model.reason),
        ].join(":"),
    },
    status: "ready",
    validation,
  };
}

export function credentialUsageSnippets(options = {}) {
  const cliVersion = safePinnedVersion(
    options.cliVersion ?? DEFAULT_CLI_VERSION,
  );
  const baseUrl = safePublicBaseUrl(options.baseUrl ?? "https://idelium.org");
  const projectId = safeIdentifier(options.projectId ?? "<PROJECT_ID>");
  const cycleId = safeIdentifier(options.cycleId ?? "<CYCLE_ID>");
  const environment = safeIdentifier(options.environment ?? "<ENVIRONMENT>");
  return [
    {
      id: "local-shell",
      title: "Local shell",
      body: [
        `python -m pip install idelium==${cliVersion}`,
        "export IDELIUM_API_KEY='<store in your local password manager, not in source control>'",
        `idelium --idCycle=${cycleId} --idProject=${projectId} --environment=${environment} --ideliumwsBaseurl ${baseUrl} --ideliumKey "$IDELIUM_API_KEY"`,
      ].join("\n"),
      secretFree: true,
    },
    {
      id: "github-actions",
      title: "GitHub Actions",
      body: [
        "name: Idelium",
        "on: [workflow_dispatch]",
        "jobs:",
        "  test:",
        "    runs-on: ubuntu-24.04",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "      - uses: actions/setup-python@v5",
        "        with:",
        "          python-version: '3.13'",
        `      - run: python -m pip install idelium==${cliVersion}`,
        '      - run: idelium --idCycle=${{ vars.IDELIUM_CYCLE_ID }} --idProject=${{ vars.IDELIUM_PROJECT_ID }} --environment=${{ vars.IDELIUM_ENVIRONMENT }} --ideliumwsBaseurl https://idelium.org --ideliumKey "$IDELIUM_API_KEY"',
        "        env:",
        "          IDELIUM_API_KEY: ${{ secrets.IDELIUM_API_KEY }}",
      ].join("\n"),
      secretFree: true,
    },
    {
      id: "generic-ci",
      title: "Generic CI",
      body: [
        `python -m pip install idelium==${cliVersion}`,
        "# Inject IDELIUM_API_KEY from your approved CI secret store at runtime.",
        `idelium --idCycle="$IDELIUM_CYCLE_ID" --idProject="$IDELIUM_PROJECT_ID" --environment="$IDELIUM_ENVIRONMENT" --ideliumwsBaseurl ${baseUrl} --ideliumKey "$IDELIUM_API_KEY"`,
      ].join("\n"),
      secretFree: true,
    },
  ];
}

export function validateCredentialUsageSnippet(snippet = {}) {
  const body = String(snippet.body ?? "");
  return {
    id: safeIdentifier(snippet.id),
    safe:
      !/idelium\.io/i.test(body) &&
      !/(@latest|main|master|HEAD)/.test(body) &&
      !/(idelium_(?:secret|live|rotated|complete)|Bearer\s+\S+)/i.test(body),
  };
}

export function applyCredentialRotationResult(
  credentials = [],
  rotatedCredential = {},
  replacement = {},
  context = {},
) {
  const rotated = normalizeCredentialDescriptor(
    {
      ...rotatedCredential,
      status: context.oldStatus ?? "rotated",
      rotation: {
        rotatedAt: context.rotatedAt ?? new Date().toISOString(),
        rotatedBy: context.actor,
      },
    },
    context,
  );
  const replacementDescriptor = revealOnceSafeSnapshot({
    ...replacement,
    lineage: {
      previousCredentialId: rotated.id,
      rotatedAt: context.rotatedAt ?? new Date().toISOString(),
      rotatedBy: context.actor,
    },
  });
  const remaining = safeArray(credentials).filter(
    (credential) =>
      normalizeCredentialDescriptor(credential, context).id !== rotated.id,
  );
  return [...remaining, rotated, replacementDescriptor];
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

function credentialMatchesFilters(credential, filters) {
  const status = credentialInventoryStatus(credential);
  if (filters.statuses.length > 0 && !filters.statuses.includes(status)) {
    return false;
  }
  if (filters.owner && credential.actor !== filters.owner) return false;
  if (
    filters.scopes.length > 0 &&
    !filters.scopes.every((scope) => credential.scopes.includes(scope))
  ) {
    return false;
  }
  if (filters.expiry === "expired" && credential.status !== "expired")
    return false;
  if (filters.expiry === "none" && credential.expiresAt) return false;
  return true;
}

function lastUsedLabel(lastUsedAt, raw, copy) {
  if (lastUsedAt) return formatDate(lastUsedAt);
  if (raw.lastUsedUnavailable) return copy.lastUsedUnavailable ?? "Unavailable";
  return copy.neverUsed ?? "Never used";
}

function credentialLineageLabel(descriptor, copy) {
  if (descriptor.lineage.previousCredentialId) {
    return `${copy.rotatedFrom ?? "Rotated from"} ${descriptor.lineage.previousCredentialId}`;
  }
  if (descriptor.lineage.rotatedAt) {
    return copy.rotatedCredential ?? "Rotated credential";
  }
  return "—";
}

function normalizeRotationPolicy(value) {
  const policy = safeIdentifier(value || "overlap-24h").toLowerCase();
  return ROTATION_POLICIES.has(policy) ? policy : "";
}

function formatDate(value) {
  if (!value) return "—";
  return value.slice(0, 10);
}

function safeExpiryFilter(value) {
  const text = String(value ?? "").toLowerCase();
  return ["expired", "none"].includes(text) ? text : "";
}

function defaultExpiryDate(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysUntil(value) {
  const expires = new Date(value).getTime();
  return Math.ceil((expires - Date.now()) / (24 * 60 * 60 * 1000));
}

function stableCreationHash(model) {
  return safeIdentifier(
    `${model.name}:${model.expiresAt}:${model.scopes.join(".")}`,
  );
}

function stableReasonHash(reason) {
  return safeIdentifier(reason || "no-reason").slice(0, 80);
}

function stableRevealSessionId(credential, now) {
  return safeIdentifier(
    `reveal:${credential.tenantId || "tenant"}:${credential.id || credential.name}:${now}`,
  );
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

function positiveInteger(value, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function safeIsoTimestamp(value) {
  if (value == null || value === "") return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function safeDate(value) {
  const text = String(value ?? "");
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function safePinnedVersion(value) {
  const text = String(value ?? "");
  return /^\d+\.\d+\.\d+(?:[a-z0-9.-]+)?$/i.test(text)
    ? text
    : DEFAULT_CLI_VERSION;
}

function safePublicBaseUrl(value) {
  const text = String(value ?? "");
  if (/^https:\/\/[a-z0-9.-]*idelium\.org(?:\/.*)?$/i.test(text)) {
    return text.replace(/\/+$/, "");
  }
  return "https://idelium.org";
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
