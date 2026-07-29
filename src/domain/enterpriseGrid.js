const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const MAX_LOCAL_ROWS = 1000;
const REDACTED_VALUE = "••••••••";

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
  const rows = Array.isArray(payload.data) ? payload.data : [];
  const meta = payload.meta ?? {};

  return {
    rows,
    meta: {
      page: positiveInteger(meta.page, 1),
      pageSize: boundedPageSize(meta.pageSize ?? meta.perPage),
      total: nonNegativeInteger(meta.total, rows.length),
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
  return Array.isArray(rows) && rows.length > 0 ? null : GRID_STATES.EMPTY;
}

export function storageKeyForGrid({ tenantId, projectId, gridName }) {
  const safeGrid = String(gridName ?? "").replace(/[^a-zA-Z0-9_.-]/g, "-");
  const safeTenant = String(tenantId ?? "tenant").replace(
    /[^a-zA-Z0-9_.-]/g,
    "-",
  );
  const safeProject = String(projectId ?? "global").replace(
    /[^a-zA-Z0-9_.-]/g,
    "-",
  );
  return `idelium:grid:${safeTenant}:${safeProject}:${safeGrid}`;
}

export function sanitizeGridPreferences(preferences, allowedColumns) {
  const allowed = new Set(allowedColumns);
  const visibleColumns = Array.isArray(preferences?.visibleColumns)
    ? preferences.visibleColumns.filter((column) => allowed.has(column))
    : [...allowed];
  const density = ["comfortable", "compact", "spacious"].includes(
    preferences?.density,
  )
    ? preferences.density
    : "comfortable";

  return {
    visibleColumns,
    density,
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

export function boundedLocalRows(rows, limit = MAX_LOCAL_ROWS) {
  const safeLimit = Math.min(
    MAX_LOCAL_ROWS,
    Math.max(1, positiveInteger(limit, MAX_LOCAL_ROWS)),
  );
  return Array.isArray(rows) ? rows.slice(0, safeLimit) : [];
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
