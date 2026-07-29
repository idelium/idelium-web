export const RUN_HISTORY_FILTER_VERSION = "2026-07-29.run-history.v1";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const SAFE_STATUSES = new Set([
  "queued",
  "running",
  "cancelling",
  "passed",
  "failed",
  "cancelled",
  "blocked",
  "unknown",
]);
const SAFE_FAILURE_CLASSES = new Set([
  "assertion",
  "infrastructure",
  "timeout",
  "network",
  "unknown",
]);
const LEGACY_FILTER_RENAMES = Object.freeze({
  cycle: "cycleId",
  env: "environmentId",
  from: "fromInclusive",
  to: "toInclusive",
  user: "author",
});

export function normalizeRunHistoryFilters(input = {}, context = {}) {
  const migrated = migrateFilterKeys(input);
  return {
    schemaVersion: RUN_HISTORY_FILTER_VERSION,
    projectId: positiveInteger(migrated.projectId ?? context.projectId),
    page: positiveInteger(migrated.page, 1),
    pageSize: boundedPageSize(migrated.pageSize ?? migrated.perPage),
    sort: normalizeSort(migrated.sort, migrated.direction),
    statuses: uniqueAllowed(
      migrated.statuses ?? migrated.status,
      SAFE_STATUSES,
    ),
    cycleId: positiveInteger(migrated.cycleId),
    environmentId: positiveInteger(migrated.environmentId),
    target: safeToken(migrated.target),
    author: safeToken(migrated.author),
    tag: safeToken(migrated.tag),
    failureClass: allowedValue(migrated.failureClass, SAFE_FAILURE_CLASSES),
    timezone: safeTimezone(migrated.timezone),
    fromInclusive: safeBoundary(
      migrated.fromInclusive,
      migrated.timezone,
      "start",
    ),
    toInclusive: safeBoundary(migrated.toInclusive, migrated.timezone, "end"),
  };
}

export function buildRunHistoryQuery(filters = {}, context = {}) {
  const normalized = normalizeRunHistoryFilters(filters, context);
  const params = new URLSearchParams();
  append(params, "projectId", normalized.projectId);
  append(params, "page", normalized.page);
  append(params, "pageSize", normalized.pageSize);
  append(params, "sort", normalized.sort.field);
  append(params, "direction", normalized.sort.direction);
  appendList(params, "status", normalized.statuses);
  append(params, "cycleId", normalized.cycleId);
  append(params, "environmentId", normalized.environmentId);
  append(params, "target", normalized.target);
  append(params, "author", normalized.author);
  append(params, "tag", normalized.tag);
  append(params, "failureClass", normalized.failureClass);
  append(params, "timezone", normalized.timezone);
  append(params, "fromInclusive", normalized.fromInclusive);
  append(params, "toInclusive", normalized.toInclusive);
  return params;
}

export function queryToRunHistoryFilters(query = {}, context = {}) {
  return normalizeRunHistoryFilters(
    {
      ...query,
      statuses: query.status,
    },
    context,
  );
}

export function hasProtectedRunHistoryFilterValue(filters = {}) {
  return (
    JSON.stringify(filters)
      .toLowerCase()
      .match(
        /(authorization|bearer |cookie|password|secret|token|x-api-key)/,
      ) != null
  );
}

export function createRunHistorySavedView(view = {}, context = {}) {
  const filters = normalizeRunHistoryFilters(view.filters ?? view, context);
  if (hasProtectedRunHistoryFilterValue(filters)) {
    throw new Error(
      "Run history saved views cannot contain protected payloads.",
    );
  }
  return {
    schemaVersion: RUN_HISTORY_FILTER_VERSION,
    id: safeIdentifier(view.id ?? view.name),
    name: safeText(view.name ?? "Run history view"),
    owner: safeIdentifier(view.owner ?? context.owner),
    filters,
  };
}

export function migrateRunHistorySavedView(view = {}, context = {}) {
  return createRunHistorySavedView(
    {
      ...view,
      filters: migrateFilterKeys(view.filters ?? view),
    },
    context,
  );
}

function migrateFilterKeys(input = {}) {
  return Object.entries(input).reduce((next, [key, value]) => {
    next[LEGACY_FILTER_RENAMES[key] ?? key] = value;
    return next;
  }, {});
}

function normalizeSort(field, direction) {
  const safeField = [
    "updatedAt",
    "startedAt",
    "status",
    "cycle",
    "duration",
  ].includes(field)
    ? field
    : "updatedAt";
  return {
    field: safeField,
    direction: direction === "asc" ? "asc" : "desc",
  };
}

function safeBoundary(value, timezone, edge) {
  if (!value) return null;
  const text = String(value);
  const dateOnly = /^(\d{4}-\d{2}-\d{2})$/.exec(text);
  const date = new Date(
    dateOnly
      ? `${dateOnly[1]}T${edge === "start" ? "00:00:00.000" : "23:59:59.999"}Z`
      : text,
  );
  if (!Number.isFinite(date.getTime())) return null;
  return `${date.toISOString()}[${safeTimezone(timezone)}]`;
}

function append(params, key, value) {
  if (value !== null && value !== "") params.set(key, String(value));
}

function appendList(params, key, values) {
  for (const value of values) params.append(key, value);
}

function uniqueAllowed(value, allowed) {
  const values = Array.isArray(value) ? value : String(value ?? "").split(",");
  return [
    ...new Set(values.map((entry) => String(entry).toLowerCase())),
  ].filter((entry) => allowed.has(entry));
}

function allowedValue(value, allowed) {
  const normalized = String(value ?? "").toLowerCase();
  return allowed.has(normalized) ? normalized : null;
}

function safeToken(value) {
  const text = String(value ?? "").trim();
  if (text === "") return null;
  if (hasProtectedRunHistoryFilterValue(text)) return null;
  return text.replace(/[^\w .:@/-]/g, "").slice(0, 120);
}

function safeTimezone(value) {
  const timezone = String(value ?? "UTC");
  return /^[A-Za-z0-9_/+.-]{1,64}$/.test(timezone) ? timezone : "UTC";
}

function boundedPageSize(value) {
  return Math.min(positiveInteger(value, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
}

function positiveInteger(value, fallback = null) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function safeIdentifier(value) {
  return String(value ?? "")
    .replace(/[^a-zA-Z0-9_.:@-]/g, "-")
    .slice(0, 120);
}

function safeText(value) {
  return String(value ?? "")
    .trim()
    .slice(0, 120);
}
