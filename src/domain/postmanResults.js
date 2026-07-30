export function parsePostmanResults(value) {
  let parsed = value;
  try {
    parsed = typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    parsed = [];
  }
  const entries = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.results)
      ? parsed.results
      : Array.isArray(parsed?.postmanResults)
        ? parsed.postmanResults
        : Array.isArray(parsed?.executions)
          ? parsed.executions
          : parsed && typeof parsed === "object"
            ? [parsed]
            : [];

  return entries.map((entry, index) => {
    const response = extractPostmanResponsePayload(entry);
    const requestPayload = extractPostmanRequestPayload(entry);
    return {
      id: entry.id || `${entry.method || "request"}-${index}`,
      name: entry.name || entry.requestName || "",
      status: Number(entry.status ?? entry.status_code ?? 0),
      method: String(entry.method || entry.request?.method || "").toUpperCase(),
      url: normalizePostmanUrl(entry.url || entry.request?.url || ""),
      time: entry.time ?? entry.elapsed ?? null,
      passed:
        entry.passed !== false &&
        Number(entry.status ?? entry.status_code ?? 0) < 400,
      assertions: Array.isArray(entry.assertions) ? entry.assertions : [],
      diagnostic: firstFailedAssertionMessage(entry.assertions),
      response,
      requestPayload,
      hasRequestPayload: hasPostmanResponseBody(requestPayload),
      hasResponseBody: hasPostmanResponseBody(response),
    };
  });
}

export function extractPostmanRequestPayload(entry = {}) {
  const direct =
    entry.requestPayload ??
    entry.requestBody ??
    entry.request?.body?.raw ??
    entry.request?.body?.body ??
    entry.request?.body?.data ??
    entry.request?.body?.formdata ??
    entry.request?.body?.urlencoded;
  if (hasPostmanResponseBody(direct)) {
    return direct;
  }
  return null;
}

export function extractPostmanResponsePayload(entry = {}) {
  const nested =
    entry.response?.body ??
    entry.response?.stream ??
    entry.response?.data ??
    entry.response?.payload;
  if (hasPostmanResponseBody(nested)) {
    return nested;
  }

  const direct =
    entry.response ??
    entry.responseBody ??
    entry.body ??
    entry.stream ??
    entry.payload ??
    entry.data;
  if (hasPostmanResponseBody(direct)) {
    return direct;
  }

  return null;
}

export function hasPostmanResponseBody(value) {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

export function normalizePostmanUrl(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value.raw === "string") return value.raw;
  if (Array.isArray(value.path) && Array.isArray(value.host)) {
    const protocol = value.protocol ? `${value.protocol}://` : "";
    const host = value.host.join(".");
    const path = value.path.join("/");
    const query = Array.isArray(value.query)
      ? value.query
          .filter((entry) => entry?.key)
          .map((entry) => {
            const key = encodeURIComponent(entry.key);
            const itemValue = entry.value == null ? "" : entry.value;
            return `${key}=${encodeURIComponent(itemValue)}`;
          })
          .join("&")
      : "";
    return `${protocol}${host}${path ? `/${path}` : ""}${query ? `?${query}` : ""}`;
  }
  return String(value);
}

export function firstFailedAssertionMessage(assertions) {
  if (!Array.isArray(assertions)) return "";
  const failedAssertion = assertions.find(
    (assertion) => assertion?.passed === false && assertion?.message,
  );
  return failedAssertion?.message || "";
}

export function statusVariant(result) {
  if (!result.passed || result.status >= 500) return "danger";
  if (result.status >= 400) return "warning";
  if (result.status >= 200 && result.status < 300) return "success";
  return "secondary";
}

export function formatPostmanResponse(value, result = null) {
  return formatPostmanPayload(value, result, "response");
}

export function formatPostmanRequestPayload(value, result = null) {
  return formatPostmanPayload(value, result, "request");
}

export function formatPostmanPayload(value, result = null, kind = "response") {
  if (hasPostmanResponseBody(value)) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      try {
        return JSON.stringify(JSON.parse(trimmed), null, 2);
      } catch {
        return value;
      }
    }
    return JSON.stringify(value, null, 2);
  }

  if (result != null) {
    const label = kind === "request" ? "request payload" : "response body";
    return JSON.stringify(
      {
        message: `No ${label} was captured for this Postman request.`,
        request: result.name || "Unnamed request",
        method: result.method || "",
        url: result.url || "",
        status: result.status ?? "",
        time: result.time ?? null,
        assertions: result.assertions || [],
      },
      null,
      2,
    );
  }

  return `No ${kind === "request" ? "request payload" : "response body"} was captured for this Postman request.`;
}

export function classifyPostmanDocument(value) {
  const document = typeof value === "string" ? JSON.parse(value) : value;
  if (document?.info?.name && Array.isArray(document.item)) {
    return { type: "collection", document };
  }
  if (document?.name && Array.isArray(document.values)) {
    return { type: "environment", document };
  }
  throw new Error(
    "The file is not a supported Postman collection or environment",
  );
}
