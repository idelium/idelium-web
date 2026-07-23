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
      : parsed && typeof parsed === "object"
        ? [parsed]
        : [];

  return entries.map((entry, index) => ({
    id: entry.id || `${entry.method || "request"}-${index}`,
    name: entry.name || entry.requestName || "",
    status: Number(entry.status ?? entry.status_code ?? 0),
    method: String(entry.method || entry.request?.method || "").toUpperCase(),
    url: entry.url || entry.request?.url || "",
    time: entry.time ?? entry.elapsed ?? null,
    passed:
      entry.passed !== false &&
      Number(entry.status ?? entry.status_code ?? 0) < 400,
    assertions: Array.isArray(entry.assertions) ? entry.assertions : [],
    response: entry.response ?? entry.body ?? null,
  }));
}

export function statusVariant(result) {
  if (!result.passed || result.status >= 500) return "danger";
  if (result.status >= 400) return "warning";
  if (result.status >= 200 && result.status < 300) return "success";
  return "secondary";
}

export function formatPostmanResponse(value) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
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
