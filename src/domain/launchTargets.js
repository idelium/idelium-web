export const LAUNCH_TARGET_PAGE_SIZE = 50;
export const MAX_LAUNCH_CONCURRENCY = 50;

const UNAUTHORIZED_STATUSES = new Set(["unauthorized", "forbidden"]);
const UNHEALTHY_STATUSES = new Set([
  "down",
  "offline",
  "unhealthy",
  "disabled",
]);
const SENSITIVE_KEY_PATTERN =
  /(authorization|password|passwd|pwd|secret|token|apikey|api_key|session|cookie|privatekey|private_key|credential)/i;

function asIdentifier(value) {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function asInteger(
  value,
  fallback,
  { max = MAX_LAUNCH_CONCURRENCY, min = 1 } = {},
) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function runtimeOf(value) {
  return asIdentifier(
    value?.runtime ??
      value?.runtimeType ??
      value?.type ??
      value?.targetRuntime ??
      value?.capabilityRuntime,
  )?.toLowerCase();
}

function isRuntimeCompatible(target, runtime) {
  if (!runtime) return true;
  const targetRuntime = runtimeOf(target);
  if (!targetRuntime) return true;
  if (targetRuntime === runtime) return true;
  if (targetRuntime === "web" && runtime === "selenium") return true;
  if (targetRuntime === "mobile" && runtime === "appium") return true;
  if (targetRuntime === "webservice" && runtime === "api") return true;
  return false;
}

function safeObject(value) {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !SENSITIVE_KEY_PATTERN.test(key))
      .map(([key, entryValue]) => [key, entryValue]),
  );
}

function normalizeHealth(value) {
  const status =
    asIdentifier(value?.status ?? value?.health ?? value) ?? "healthy";
  return status.toLowerCase();
}

function isStaleHealth(value, now = Date.now()) {
  const raw = value?.lastHealthAt ?? value?.updatedAt ?? value?.healthUpdatedAt;
  if (!raw) return true;
  const healthTime = new Date(raw).getTime();
  if (Number.isNaN(healthTime)) return true;
  return now - healthTime > 5 * 60 * 1000;
}

export function normalizeLaunchTargets(rows, { selectedRuntime } = {}) {
  return (Array.isArray(rows) ? rows : [])
    .filter((row) => !UNAUTHORIZED_STATUSES.has(normalizeHealth(row.status)))
    .slice(0, LAUNCH_TARGET_PAGE_SIZE)
    .map((row) => {
      const health = normalizeHealth(row);
      const compatible = isRuntimeCompatible(row, selectedRuntime);
      const capacity = {
        available: asInteger(
          row.capacity?.available ?? row.availableCapacity,
          1,
          {
            max: MAX_LAUNCH_CONCURRENCY,
            min: 0,
          },
        ),
        max: asInteger(row.capacity?.max ?? row.maxConcurrency, 1, {
          max: MAX_LAUNCH_CONCURRENCY,
          min: 1,
        }),
        queued: asInteger(row.capacity?.queued ?? row.queueDepth, 0, {
          max: 10_000,
          min: 0,
        }),
      };
      let disabledReason = null;
      if (UNHEALTHY_STATUSES.has(health)) disabledReason = "health";
      else if (!compatible) disabledReason = "runtime";
      else if (capacity.available < 1) disabledReason = "capacity";

      return {
        capabilities: Array.isArray(row.capabilities) ? row.capabilities : [],
        capacity,
        disabledReason,
        health,
        healthStale: isStaleHealth(row),
        id: asIdentifier(row.id ?? row.code ?? row.name),
        identity: `target:${asIdentifier(row.id ?? row.code ?? row.name)}`,
        metadata: {
          capabilities: Array.isArray(row.capabilities)
            ? row.capabilities.join(", ")
            : "",
          queue: String(capacity.queued),
          region: asIdentifier(row.region ?? row.location) ?? "",
          runtime: runtimeOf(row) ?? "",
        },
        name: asIdentifier(row.name ?? row.description ?? row.code) ?? "Target",
        raw: safeObject(row),
        runtime: runtimeOf(row),
        type: asIdentifier(row.type ?? "platform-pool"),
      };
    });
}

export function defaultLaunchTargetsForRuntime(runtime) {
  return normalizeLaunchTargets(
    [
      {
        capabilities: ["browserOverride", "parallel"],
        capacity: { available: 1, max: 1, queued: 0 },
        health: "healthy",
        id: "platform-pool",
        lastHealthAt: new Date().toISOString(),
        name: "Platform pool",
        region: "project",
        runtime: runtime ?? "selenium",
        type: "platform-pool",
      },
    ],
    { selectedRuntime: runtime },
  );
}

export function validateLaunchTargetConfiguration({
  concurrency = 1,
  overrides = {},
  target,
} = {}) {
  const diagnostics = [];
  if (!target) {
    diagnostics.push({
      blocking: true,
      code: "launchTarget.required",
      location: "target",
      remediationKey: "LaunchTarget.remediation.required",
      severity: "error",
    });
    return diagnostics;
  }

  if (target.disabledReason) {
    diagnostics.push({
      blocking: true,
      code: `launchTarget.${target.disabledReason}`,
      location: "target",
      remediationKey: `LaunchTarget.remediation.${target.disabledReason}`,
      severity: "error",
    });
  }

  const normalizedConcurrency = asInteger(concurrency, 1);
  const allowedConcurrency = Math.min(
    target.capacity?.available ?? 1,
    target.capacity?.max ?? 1,
    MAX_LAUNCH_CONCURRENCY,
  );
  if (normalizedConcurrency > allowedConcurrency) {
    diagnostics.push({
      blocking: true,
      code: "launchTarget.concurrency",
      location: "concurrency",
      remediationKey: "LaunchTarget.remediation.concurrency",
      severity: "error",
    });
  }

  if (target.healthStale) {
    diagnostics.push({
      blocking: false,
      code: "launchTarget.healthStale",
      location: "target.health",
      remediationKey: "LaunchTarget.remediation.healthStale",
      severity: "warning",
    });
  }

  if (overrides.browser && !target.capabilities.includes("browserOverride")) {
    diagnostics.push({
      blocking: true,
      code: "launchTarget.browserOverride",
      location: "overrides.browser",
      remediationKey: "LaunchTarget.remediation.browserOverride",
      severity: "error",
    });
  }

  if (overrides.device && !target.capabilities.includes("deviceOverride")) {
    diagnostics.push({
      blocking: true,
      code: "launchTarget.deviceOverride",
      location: "overrides.device",
      remediationKey: "LaunchTarget.remediation.deviceOverride",
      severity: "error",
    });
  }

  return diagnostics;
}
