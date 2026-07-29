import { redactLaunchConfiguration } from "@/domain/launchContracts";

const SENSITIVE_TEXT_PATTERN =
  /(authorization|api[_-]?key|session|cookie|password|secret|token)\s*[:= ]\s*\S+(?:\s+\S+)?|(?:bearer|basic)\s+\S+(?:\s+\S+)?|\S*(?:secret|token|password|apikey|api_key)\S*/gi;

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

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return `launch-${Math.abs(hash).toString(36)}`;
}

function safeText(value) {
  return String(value ?? "").replace(SENSITIVE_TEXT_PATTERN, "[REDACTED]");
}

export function launchConfigurationHash(configuration) {
  return hashString(stableJson(redactLaunchConfiguration(configuration ?? {})));
}

export function normalizePreflightDiagnostic(input = {}, configurationHash) {
  const severity = ["info", "warning", "error"].includes(input.severity)
    ? input.severity
    : input.blocking
      ? "error"
      : "warning";
  return {
    area: input.area || String(input.location || "launch").split(".")[0],
    blocking: Boolean(input.blocking ?? severity === "error"),
    code: input.code || "launch.preflight.unknown",
    configurationHash,
    focusTarget: input.focusTarget || input.location || "launch",
    location: input.location || "launch",
    message: safeText(input.message || input.code || "Preflight diagnostic"),
    remediation: safeText(input.remediation || input.remediationKey || ""),
    severity,
  };
}

export function normalizePreflightResult(input = {}, configurationHash) {
  const diagnostics = (
    Array.isArray(input.diagnostics) ? input.diagnostics : []
  )
    .map((diagnostic) =>
      normalizePreflightDiagnostic(diagnostic, configurationHash),
    )
    .sort((first, second) => {
      const weights = { error: 0, warning: 1, info: 2 };
      return weights[first.severity] - weights[second.severity];
    });

  return {
    configurationHash,
    diagnostics,
    hasBlockingDiagnostics: diagnostics.some(
      (diagnostic) => diagnostic.blocking,
    ),
    issuedAt: input.issuedAt || new Date().toISOString(),
  };
}

export function preflightGroups(result = {}) {
  return (result.diagnostics ?? []).reduce((groups, diagnostic) => {
    const area = diagnostic.area || "launch";
    if (!groups[area]) groups[area] = [];
    groups[area].push(diagnostic);
    return groups;
  }, {});
}

export function isPreflightStale(result, configurationHash) {
  return !result || result.configurationHash !== configurationHash;
}

export function localPreflightResult(diagnostics, configurationHash) {
  return normalizePreflightResult({ diagnostics }, configurationHash);
}
