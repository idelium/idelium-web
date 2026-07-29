const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const MAX_LOCAL_ROWS = 1000;
const REDACTED_VALUE = "••••••••";
export const GRID_PREFERENCES_VERSION = 1;
const SENSITIVE_QUERY_KEY =
  /(authorization|cookie|credential|password|secret|session|token)/i;

/**
 * @typedef {Object} EnterpriseGridColumn
 * @property {string} key Stable field identifier.
 * @property {string} label Localized column label.
 * @property {boolean} [configurable] Whether users may hide or reorder it.
 * @property {boolean} [required] Whether the column must remain visible.
 * @property {boolean} [sensitive] Whether values must always be redacted.
 * @property {boolean} [sortable] Whether the server contract accepts this field.
 * @property {"text"|"status"|"timestamp"|"technical"} [type] Safe display format.
 */

export const GRID_STATES = Object.freeze({
  EMPTY: "empty",
  LOADING: "loading",
  ERROR: "error",
  NO_RESULTS: "no-results",
  PERMISSION: "permission",
  PARTIAL: "partial",
  STALE: "stale",
});

export function buildGridQuery(options = {}) {
  const params = new URLSearchParams();
  const page = positiveInteger(options.page, 1);
  const pageSize = boundedPageSize(options.pageSize);

  params.set("page", String(page));
  params.set("pageSize", String(pageSize));

  const search = safeText(options.search);
  if (search !== "") {
    params.set("search", search);
  }

  const sort = normalizeSort(options.sort, options.allowedSorts ?? []);
  if (sort !== null) {
    params.set("sort", sort.field);
    params.set("direction", sort.direction);
  }

  for (const [key, value] of Object.entries(options.filters ?? {})) {
    if (!isSafeFilterKey(key)) {
      continue;
    }
    const normalized = safeFilterValue(value);
    if (normalized !== null) {
      params.append(`filter[${key}]`, normalized);
    }
  }

  return params;
}

export function parseGridResponse(response) {
  const payload = response?.data ?? {};
  if (Array.isArray(payload)) {
    return {
      rows: payload,
      meta: {
        page: 1,
        pageSize: Math.min(Math.max(payload.length, 1), MAX_PAGE_SIZE),
        total: payload.length,
        lastPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
        stale: false,
        partial: false,
      },
    };
  }
  const rows = Array.isArray(payload.data) ? payload.data : [];
  const meta = payload.meta ?? {};

  return {
    rows,
    meta: {
      page: positiveInteger(meta.page, 1),
      pageSize: boundedPageSize(meta.pageSize ?? meta.perPage),
      total: nonNegativeInteger(meta.total, rows.length),
      lastPage: positiveInteger(meta.lastPage, 1),
      hasNextPage: Boolean(meta.hasNextPage ?? false),
      hasPreviousPage: Boolean(meta.hasPreviousPage ?? false),
      stale: Boolean(meta.stale ?? false),
      partial: Boolean(meta.partial ?? false),
    },
  };
}

export function gridStateFromResult({
  loading,
  error,
  permissionDenied,
  rows,
  meta,
  hasActiveFilters,
}) {
  if (loading) {
    return GRID_STATES.LOADING;
  }
  if (permissionDenied) {
    return GRID_STATES.PERMISSION;
  }
  if (error) {
    return GRID_STATES.ERROR;
  }
  if (meta?.stale) {
    return GRID_STATES.STALE;
  }
  if (meta?.partial) {
    return GRID_STATES.PARTIAL;
  }
  if (Array.isArray(rows) && rows.length > 0) return null;
  return hasActiveFilters ? GRID_STATES.NO_RESULTS : GRID_STATES.EMPTY;
}

export function storageKeyForGrid({ userId, tenantId, projectId, gridName }) {
  if (!userId || !tenantId || !gridName) {
    throw new TypeError(
      "Grid preferences require user, tenant, and table identifiers.",
    );
  }
  const safeGrid = String(gridName ?? "").replace(/[^a-zA-Z0-9_.-]/g, "-");
  const safeUser = String(userId).replace(/[^a-zA-Z0-9_.-]/g, "-");
  const safeTenant = String(tenantId ?? "tenant").replace(
    /[^a-zA-Z0-9_.-]/g,
    "-",
  );
  const safeProject = String(projectId ?? "global").replace(
    /[^a-zA-Z0-9_.-]/g,
    "-",
  );
  return `idelium:grid:v${GRID_PREFERENCES_VERSION}:${safeUser}:${safeTenant}:${safeProject}:${safeGrid}`;
}

export function sanitizeGridPreferences(preferences, columns) {
  const definitions = (columns ?? []).map((column) =>
    typeof column === "string"
      ? { key: column, configurable: true, required: false }
      : column,
  );
  const allowed = new Set(definitions.map((column) => column.key));
  const aliases = new Map();
  for (const column of definitions) {
    for (const legacyKey of column.legacyKeys ?? []) {
      aliases.set(legacyKey, column.key);
    }
  }
  const normalizePreferenceColumn = (column) => aliases.get(column) ?? column;
  const required = definitions
    .filter((column) => column.required === true)
    .map((column) => column.key);
  const configurable = new Set(
    definitions
      .filter((column) => column.configurable !== false)
      .map((column) => column.key),
  );
  const visibleColumns = Array.isArray(preferences?.visibleColumns)
    ? [
        ...new Set(
          preferences.visibleColumns
            .map(normalizePreferenceColumn)
            .filter((column) => allowed.has(column)),
        ),
      ]
    : [...allowed];
  for (const requiredColumn of required) {
    if (!visibleColumns.includes(requiredColumn)) {
      visibleColumns.push(requiredColumn);
    }
  }
  const requestedOrder = Array.isArray(preferences?.columnOrder)
    ? [
        ...new Set(
          preferences.columnOrder
            .map(normalizePreferenceColumn)
            .filter((column) => allowed.has(column)),
        ),
      ]
    : [];
  const columnOrder = [
    ...requestedOrder,
    ...[...allowed].filter((column) => !requestedOrder.includes(column)),
  ];
  const density = ["comfortable", "compact", "spacious"].includes(
    preferences?.density,
  )
    ? preferences.density
    : "comfortable";

  return {
    schemaVersion: GRID_PREFERENCES_VERSION,
    visibleColumns,
    columnOrder,
    density,
    configurableColumns: [...configurable],
  };
}

export function requiresBulkConfirmation(action) {
  return ["archive", "delete", "export", "tag"].includes(action);
}

export function validateGridColumns(columns) {
  if (!Array.isArray(columns) || columns.length === 0) {
    throw new TypeError("Enterprise DataTable requires at least one column.");
  }

  const keys = new Set();
  return columns.map((column) => {
    const key = String(column?.key ?? "").trim();
    const label = String(column?.label ?? "").trim();
    if (!/^[a-zA-Z0-9_.-]+$/.test(key) || label === "") {
      throw new TypeError(
        "Enterprise DataTable columns require a safe key and a localized label.",
      );
    }
    if (keys.has(key)) {
      throw new TypeError(`Duplicate Enterprise DataTable column: ${key}.`);
    }
    keys.add(key);
    return Object.freeze({
      configurable: true,
      required: false,
      sensitive: false,
      sortable: false,
      type: "text",
      ...column,
      key,
      label,
    });
  });
}

export function getGridRowIdentity(row, rowKey = "id") {
  const identity =
    typeof rowKey === "function" ? rowKey(row) : row?.[String(rowKey)];
  if (identity === null || identity === undefined || identity === "") {
    throw new TypeError("Enterprise DataTable rows require a stable identity.");
  }
  return String(identity);
}

export function formatGridCellValue(value, column) {
  if (column?.sensitive === true) {
    return REDACTED_VALUE;
  }
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (column?.type === "timestamp") {
    const timestamp = new Date(value);
    return Number.isNaN(timestamp.getTime()) ? "—" : timestamp.toLocaleString();
  }
  if (typeof value === "object") {
    return "—";
  }
  return String(value).slice(0, 500);
}

export function normalizeGridActions(actions, capabilities = []) {
  const allowedCapabilities = new Set(capabilities);
  return (Array.isArray(actions) ? actions : []).filter((action) => {
    if (!action?.id || !action?.label) return false;
    return (
      !action.capability || allowedCapabilities.has(String(action.capability))
    );
  });
}

export function normalizeGridBulkActions(
  actions,
  capabilities = [],
  selectedRows = [],
) {
  return normalizeGridActions(actions, capabilities).filter((action) => {
    if (typeof action.availableFor !== "function") return true;
    return selectedRows.every((row) => action.availableFor(row));
  });
}

export function createGridSelectionScope({
  tenantId,
  projectId,
  gridName,
  query,
  allowedFilters = [],
  allowedSorts = [],
}) {
  if (!tenantId || !gridName) {
    throw new TypeError(
      "Grid selection requires tenant and table identifiers.",
    );
  }
  return JSON.stringify({
    tenantId: String(tenantId),
    projectId: projectId ? String(projectId) : null,
    gridName: String(gridName),
    query: serializeGridRouteQuery(query, { allowedFilters, allowedSorts }),
  });
}

export function boundedLocalRows(rows, limit = MAX_LOCAL_ROWS) {
  const safeLimit = Math.min(
    MAX_LOCAL_ROWS,
    Math.max(1, positiveInteger(limit, MAX_LOCAL_ROWS)),
  );
  return Array.isArray(rows) ? rows.slice(0, safeLimit) : [];
}

export function parseGridRouteQuery(query = {}, options = {}) {
  const allowedSorts = new Set(options.allowedSorts ?? []);
  const allowedFilters = new Set(options.allowedFilters ?? []);
  const filters = {};

  for (const filterKey of allowedFilters) {
    if (SENSITIVE_QUERY_KEY.test(filterKey)) continue;
    const canonicalValue = query[`f.${filterKey}`];
    const legacyValue = query[`filter[${filterKey}]`];
    const normalized = safeFilterValue(canonicalValue ?? legacyValue);
    if (normalized !== null) filters[filterKey] = normalized;
  }

  const requestedSort = safeText(query.sort);
  const sort = allowedSorts.has(requestedSort)
    ? {
        field: requestedSort,
        direction: query.direction === "desc" ? "desc" : "asc",
      }
    : null;

  return {
    page: positiveInteger(query.page, 1),
    pageSize: boundedPageSize(query.pageSize),
    search: safeText(query.q ?? query.search),
    sort,
    filters,
  };
}

export function serializeGridRouteQuery(state = {}, options = {}) {
  const normalized = parseGridRouteQuery(
    {
      page: state.page,
      pageSize: state.pageSize,
      q: state.search,
      sort: state.sort?.field,
      direction: state.sort?.direction,
      ...Object.fromEntries(
        Object.entries(state.filters ?? {}).map(([key, value]) => [
          `f.${key}`,
          value,
        ]),
      ),
    },
    options,
  );
  const query = {};

  if (normalized.page > 1) query.page = String(normalized.page);
  if (normalized.pageSize !== DEFAULT_PAGE_SIZE) {
    query.pageSize = String(normalized.pageSize);
  }
  if (normalized.search !== "") query.q = normalized.search;
  if (normalized.sort) {
    query.sort = normalized.sort.field;
    query.direction = normalized.sort.direction;
  }
  for (const [key, value] of Object.entries(normalized.filters)) {
    query[`f.${key}`] = value;
  }
  return query;
}

export function mergeGridRouteState(current, changes, options = {}) {
  const previous = parseGridRouteQuery(current, options);
  const next = {
    ...previous,
    ...changes,
    filters: changes.filters ?? previous.filters,
  };
  const criteriaChanged =
    next.search !== previous.search ||
    next.sort?.field !== previous.sort?.field ||
    next.sort?.direction !== previous.sort?.direction ||
    JSON.stringify(next.filters) !== JSON.stringify(previous.filters);

  if (criteriaChanged && changes.page === undefined) next.page = 1;
  return serializeGridRouteQuery(next, options);
}

export function isGridRouteQueryKey(key) {
  return (
    ["direction", "page", "pageSize", "q", "search", "sort"].includes(key) ||
    key.startsWith("f.") ||
    /^filter\[[a-zA-Z0-9_.-]+\]$/.test(key)
  );
}

function normalizeSort(sort, allowedSorts) {
  if (!sort || typeof sort !== "object") {
    return null;
  }
  const allowed = new Set(allowedSorts);
  if (!allowed.has(sort.field)) {
    return null;
  }
  return {
    field: sort.field,
    direction: sort.direction === "desc" ? "desc" : "asc",
  };
}

function boundedPageSize(value) {
  return Math.min(MAX_PAGE_SIZE, positiveInteger(value, DEFAULT_PAGE_SIZE));
}

function positiveInteger(value, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function nonNegativeInteger(value, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function safeText(value) {
  return String(value ?? "")
    .trim()
    .slice(0, 200);
}

function isSafeFilterKey(key) {
  return /^[a-zA-Z0-9_.-]+$/.test(key);
}

function safeFilterValue(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (Array.isArray(value)) {
    const joined = value
      .map((entry) => safeText(entry))
      .filter(Boolean)
      .join(",");
    return joined === "" ? null : joined;
  }
  return safeText(value);
}
