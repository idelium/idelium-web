const SENSITIVE_TEXT_PATTERN =
  /(authorization|api[_-]?key|session|cookie|password|secret|token)\s*[:= ]\s*\S+(?:\s+\S+)?|(?:bearer|basic)\s+\S+(?:\s+\S+)?|\S*(?:secret|token|password|apikey|api_key)\S*/gi;

function safeText(value) {
  return String(value ?? "").replace(SENSITIVE_TEXT_PATTERN, "[REDACTED]");
}

export function normalizeLaunchError(error = {}) {
  const response = error.response ?? {};
  const data = response.data ?? {};
  const status = Number(response.status ?? error.status ?? 0);
  const code = data.code || error.code || "launch.error.unknown";
  const correlationId =
    data.correlationId ||
    response.headers?.["x-correlation-id"] ||
    response.headers?.["x-request-id"] ||
    null;

  if (status === 401 || status === 403) {
    return {
      clearProtectedDraft: true,
      code: "launch.error.authorization",
      correlationId,
      focusTarget: "selection",
      recoverable: false,
      requiresPreflight: true,
      type: "authorization",
    };
  }
  if (status === 409) {
    return {
      code: "launch.error.conflict",
      correlationId,
      focusTarget: "preflight",
      recoverable: true,
      requiresPreflight: true,
      type: "conflict",
    };
  }
  if (status === 422) {
    return {
      code: "launch.error.field",
      correlationId,
      focusTarget: data.location || "review",
      message: safeText(data.message || code),
      recoverable: false,
      requiresPreflight: true,
      type: "field",
    };
  }
  if (status === 429 || code === "CAPACITY_UNAVAILABLE") {
    return {
      code: "launch.error.capacity",
      correlationId,
      focusTarget: "target",
      recoverable: true,
      requiresPreflight: true,
      type: "capacity",
    };
  }
  if (status === 0 || status === 408 || code === "ECONNABORTED") {
    return {
      code: "launch.error.timeout",
      correlationId,
      focusTarget: "review",
      recoverable: true,
      reconcileByIdempotency: true,
      requiresPreflight: true,
      type: "timeout",
    };
  }
  if (status >= 500) {
    return {
      code: "launch.error.server",
      correlationId,
      focusTarget: "review",
      recoverable: true,
      requiresPreflight: true,
      type: "server",
    };
  }
  return {
    code: "launch.error.unknown",
    correlationId,
    focusTarget: "review",
    message: safeText(data.message || error.message || code),
    recoverable: false,
    requiresPreflight: true,
    type: "unknown",
  };
}
