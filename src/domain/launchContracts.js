export const LAUNCH_CONTRACT_VERSION = "2026.07";
export const LAUNCH_PREFLIGHT_CONTRACT_VERSION = "2026.07";
export const LEGACY_LAUNCH_ENDPOINT = "admin/launchtest";
export const CANONICAL_PREFLIGHT_ENDPOINT = "admin/launch/preflight";
export const CANONICAL_LAUNCH_ENDPOINT = "admin/launch";

const SUPPORTED_TARGET_TYPES = new Set([
  "local",
  "platform",
  "selenium-grid",
  "appium-device",
  "api-runner",
]);

const SUPPORTED_OPTION_KEYS = new Set([
  "browser",
  "debug",
  "device",
  "headless",
  "retries",
  "scheduleId",
  "tags",
  "timeoutSeconds",
  "variables",
]);

const SENSITIVE_KEY_PATTERN =
  /(authorization|password|passwd|pwd|secret|token|apikey|api_key|session|cookie|privatekey|private_key)/i;
const SENSITIVE_VALUE_PATTERN =
  /(bearer|basic|token|secret|password)\s+[a-z0-9._~+/=-]+/i;

function stableDiagnostic({
  blocking = true,
  code,
  correlationId,
  location,
  message,
  remediationKey,
  severity = "error",
}) {
  return {
    blocking: Boolean(blocking),
    code,
    correlationId: correlationId || null,
    location,
    message,
    remediationKey,
    severity,
  };
}

function asIdentifier(value) {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function asInteger(
  value,
  fallback,
  { max = Number.MAX_SAFE_INTEGER, min = 1 } = {},
) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function stableJson(value) {
  if (Array.isArray(value))
    return `[${value.map((item) => stableJson(item)).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function redactValue(key, value) {
  if (SENSITIVE_KEY_PATTERN.test(String(key))) return "[REDACTED]";
  if (typeof value === "string") {
    if (SENSITIVE_VALUE_PATTERN.test(value)) return "[REDACTED]";
    try {
      const url = new URL(value);
      url.username = "";
      url.password = "";
      url.search = "";
      url.hash = "";
      return url.toString();
    } catch {
      return value;
    }
  }
  if (Array.isArray(value)) return value.map((item) => redactValue(key, item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        redactValue(entryKey, entryValue),
      ]),
    );
  }
  return value;
}

function normalizeEntityReference(value, fallback = {}) {
  if (value && typeof value === "object") {
    return {
      code: asIdentifier(value.code),
      id: asIdentifier(value.id ?? value.value),
      name: asIdentifier(value.name ?? value.label),
      projectId: asIdentifier(value.projectId ?? fallback.projectId),
      tenantId: asIdentifier(value.tenantId ?? fallback.tenantId),
    };
  }
  return {
    code: null,
    id: asIdentifier(value),
    name: null,
    projectId: asIdentifier(fallback.projectId),
    tenantId: asIdentifier(fallback.tenantId),
  };
}

function normalizeTarget(target = {}, fallback = {}) {
  const normalized = target && typeof target === "object" ? target : {};
  return {
    browser: asIdentifier(normalized.browser ?? fallback.browser),
    device: asIdentifier(normalized.device ?? fallback.device),
    gridUrl: asIdentifier(normalized.gridUrl),
    platformId: asIdentifier(
      normalized.platformId ?? normalized.idPlatform ?? fallback.platformId,
    ),
    projectId: asIdentifier(normalized.projectId ?? fallback.projectId),
    tenantId: asIdentifier(normalized.tenantId ?? fallback.tenantId),
    type: asIdentifier(normalized.type ?? fallback.type ?? "platform"),
  };
}

function normalizeOptions(options = {}) {
  const normalized = options && typeof options === "object" ? options : {};
  const variables =
    normalized.variables && typeof normalized.variables === "object"
      ? redactValue("variables", normalized.variables)
      : {};
  const tags = Array.isArray(normalized.tags)
    ? normalized.tags
        .map((tag) => String(tag).trim())
        .filter(Boolean)
        .slice(0, 50)
    : [];

  return {
    browser: asIdentifier(normalized.browser),
    debug: Boolean(normalized.debug),
    device: asIdentifier(normalized.device),
    headless: Boolean(normalized.headless),
    retries: asInteger(normalized.retries, 0, { max: 5, min: 0 }),
    scheduleId: asIdentifier(normalized.scheduleId),
    tags,
    timeoutSeconds: asInteger(normalized.timeoutSeconds, 300, {
      max: 7_200,
      min: 1,
    }),
    variables,
  };
}

function detectUnsupportedOptions(options = {}, correlationId) {
  if (!options || typeof options !== "object") return [];
  return Object.keys(options)
    .filter((key) => !SUPPORTED_OPTION_KEYS.has(key))
    .map((key) =>
      stableDiagnostic({
        code: "launch.validation.unsupportedOption",
        correlationId,
        location: `options.${key}`,
        message: `Unsupported launch option: ${key}`,
        remediationKey: "Launch.remediation.unsupportedOption",
      }),
    );
}

function validateOwnership(configuration, diagnostics, correlationId) {
  const ownedEntities = [
    ["cycle", configuration.cycle],
    ["environment", configuration.environment],
    ["target", configuration.target],
  ];

  for (const [location, entity] of ownedEntities) {
    if (entity.tenantId && entity.tenantId !== configuration.tenantId) {
      diagnostics.push(
        stableDiagnostic({
          code: "launch.security.crossTenantReference",
          correlationId,
          location,
          message: `${location} belongs to a different customer.`,
          remediationKey: "Launch.remediation.crossTenantReference",
        }),
      );
    }
    if (entity.projectId && entity.projectId !== configuration.projectId) {
      diagnostics.push(
        stableDiagnostic({
          code: "launch.security.crossProjectReference",
          correlationId,
          location,
          message: `${location} belongs to a different project.`,
          remediationKey: "Launch.remediation.crossProjectReference",
        }),
      );
    }
  }
}

function validateRequired(configuration, diagnostics, correlationId) {
  const required = [
    ["tenantId", configuration.tenantId],
    ["projectId", configuration.projectId],
    ["cycle.id", configuration.cycle.id],
    [
      "environment.id",
      configuration.environment.id ?? configuration.environment.code,
    ],
    ["target.type", configuration.target.type],
  ];

  for (const [location, value] of required) {
    if (!value) {
      diagnostics.push(
        stableDiagnostic({
          code: "launch.validation.required",
          correlationId,
          location,
          message: `Launch configuration is missing ${location}.`,
          remediationKey: "Launch.remediation.required",
        }),
      );
    }
  }

  if (!SUPPORTED_TARGET_TYPES.has(configuration.target.type)) {
    diagnostics.push(
      stableDiagnostic({
        code: "launch.validation.unsupportedTarget",
        correlationId,
        location: "target.type",
        message: `Unsupported execution target: ${configuration.target.type}`,
        remediationKey: "Launch.remediation.unsupportedTarget",
      }),
    );
  }
}

export function normalizeLaunchDiagnostic(input = {}, defaults = {}) {
  return stableDiagnostic({
    blocking: input.blocking ?? defaults.blocking ?? input.severity === "error",
    code: input.code || defaults.code || "launch.diagnostic.unknown",
    correlationId: input.correlationId || defaults.correlationId || null,
    location: input.location || defaults.location || "launch",
    message: input.message || defaults.message || "Launch diagnostic",
    remediationKey:
      input.remediationKey ||
      defaults.remediationKey ||
      "Launch.remediation.review",
    severity: ["info", "warning", "error"].includes(input.severity)
      ? input.severity
      : defaults.severity || "error",
  });
}

export function normalizeLaunchConfiguration(input = {}, context = {}) {
  const correlationId = asIdentifier(
    input.correlationId ?? context.correlationId,
  );
  const tenantId = asIdentifier(
    input.tenantId ?? input.customerId ?? context.tenantId,
  );
  const projectId = asIdentifier(
    input.projectId ?? input.idProject ?? context.projectId,
  );
  const options = normalizeOptions(input.options ?? input);
  const configuration = {
    concurrency: {
      limit: asInteger(input.concurrency?.limit ?? input.concurrency, 1, {
        max: 50,
        min: 1,
      }),
      mode:
        asInteger(input.concurrency?.limit ?? input.concurrency, 1, {
          max: 50,
          min: 1,
        }) > 1
          ? "parallel"
          : "single",
    },
    contractVersion: LAUNCH_CONTRACT_VERSION,
    correlationId,
    cycle: normalizeEntityReference(input.cycle ?? input.idTestCycle, {
      projectId,
      tenantId,
    }),
    environment: normalizeEntityReference(input.environment, {
      projectId,
      tenantId,
    }),
    options,
    projectId,
    target: normalizeTarget(input.target ?? input, {
      browser: options.browser,
      device: options.device,
      platformId: input.idPlatform,
      projectId,
      tenantId,
      type: input.targetType,
    }),
    tenantId,
  };
  const diagnostics = detectUnsupportedOptions(
    input.options ?? {},
    correlationId,
  );

  validateRequired(configuration, diagnostics, correlationId);
  validateOwnership(configuration, diagnostics, correlationId);

  return {
    configuration,
    diagnostics,
    valid: diagnostics.every((diagnostic) => !diagnostic.blocking),
  };
}

export function redactLaunchConfiguration(configuration) {
  return redactValue("launch", configuration);
}

export function launchIdempotencyScope(configuration, userId = "current-user") {
  const redacted = redactLaunchConfiguration(configuration);
  return [
    "launch",
    LAUNCH_CONTRACT_VERSION,
    configuration.tenantId,
    configuration.projectId,
    userId,
    configuration.cycle.id,
    stableJson(redacted),
  ].join(":");
}

export function createLaunchApiRequest(input, context = {}) {
  const normalized = normalizeLaunchConfiguration(input, context);
  const redactedConfiguration = redactLaunchConfiguration(
    normalized.configuration,
  );
  const idempotencyKey =
    context.idempotencyKey ||
    launchIdempotencyScope(normalized.configuration, context.userId);

  return {
    body: redactedConfiguration,
    diagnostics: normalized.diagnostics,
    endpoint: CANONICAL_LAUNCH_ENDPOINT,
    headers: {
      "Idempotency-Key": idempotencyKey,
      "X-Idelium-Contract-Version": LAUNCH_CONTRACT_VERSION,
    },
    idempotencyKey,
    legacyEndpoint: LEGACY_LAUNCH_ENDPOINT,
    ownershipValidation: [
      "tenant",
      "project",
      "cycle",
      "environment",
      "target",
    ],
    preflightEndpoint: CANONICAL_PREFLIGHT_ENDPOINT,
    preflightVersion: LAUNCH_PREFLIGHT_CONTRACT_VERSION,
    valid: normalized.valid,
  };
}

export function canReplayLaunchRequest(firstRequest, nextRequest) {
  return Boolean(
    firstRequest?.idempotencyKey &&
    firstRequest.idempotencyKey === nextRequest?.idempotencyKey &&
    stableJson(firstRequest?.body) === stableJson(nextRequest?.body),
  );
}
