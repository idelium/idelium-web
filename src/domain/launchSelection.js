export const LAUNCH_SELECTION_PAGE_SIZE = 50;

const ARCHIVED_STATUSES = new Set([
  "archived",
  "deleted",
  "inactive",
  "disabled",
]);
const UNAUTHORIZED_STATUSES = new Set(["unauthorized", "forbidden"]);

function asIdentifier(value) {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeStatus(value) {
  return asIdentifier(value)?.toLowerCase() ?? "active";
}

function normalizeDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
}

function runtimeOf(value) {
  return asIdentifier(
    value?.runtime ??
      value?.runtimeType ??
      value?.type ??
      value?.environmentType ??
      value?.targetRuntime,
  )?.toLowerCase();
}

function isRuntimeCompatible(row, selectedRuntime) {
  if (!selectedRuntime) return true;
  const runtime = runtimeOf(row);
  if (!runtime) return true;
  if (runtime === selectedRuntime) return true;
  if (runtime === "webservice" && selectedRuntime === "api") return true;
  if (runtime === "web" && selectedRuntime === "selenium") return true;
  if (runtime === "app" && selectedRuntime === "appium") return true;
  return false;
}

export function normalizeLaunchAssetRows(
  rows,
  { projectId, selectedRuntime, tenantId, type } = {},
) {
  return (Array.isArray(rows) ? rows : [])
    .filter((row) => !UNAUTHORIZED_STATUSES.has(normalizeStatus(row.status)))
    .slice(0, LAUNCH_SELECTION_PAGE_SIZE)
    .map((row) => {
      const status = normalizeStatus(row.status);
      const identity = `${type}:${asIdentifier(row.id ?? row.code ?? row.name)}`;
      const runtime = runtimeOf(row);
      const archived = ARCHIVED_STATUSES.has(status);
      const incompatible = !isRuntimeCompatible(row, selectedRuntime);
      const tenantMismatch =
        asIdentifier(row.tenantId ?? row.customerId) &&
        tenantId &&
        asIdentifier(row.tenantId ?? row.customerId) !== String(tenantId);
      const projectMismatch =
        asIdentifier(row.projectId ?? row.idProject) &&
        projectId &&
        asIdentifier(row.projectId ?? row.idProject) !== String(projectId);

      let disabledReason = null;
      if (tenantMismatch) disabledReason = "crossTenant";
      else if (projectMismatch) disabledReason = "crossProject";
      else if (archived) disabledReason = "archived";
      else if (incompatible) disabledReason = "runtime";

      return {
        code: asIdentifier(row.code),
        disabledReason,
        identity,
        id: asIdentifier(row.id ?? row.code),
        metadata: {
          owner:
            asIdentifier(row.owner ?? row.createdBy ?? row.updatedBy) ?? "",
          runtime: runtime ?? "",
          status,
          updatedAt: normalizeDate(
            row.updatedAt ?? row.updated_at ?? row.dateUpdate,
          ),
          version: asIdentifier(row.version ?? row.schemaVersion) ?? "",
        },
        name: asIdentifier(row.name ?? row.description ?? row.code) ?? identity,
        raw: row,
        runtime,
        status,
      };
    });
}

export function buildLaunchAssetQuery({ page = 1, search = "" } = {}) {
  return {
    page: Math.max(Number.parseInt(page, 10) || 1, 1),
    pageSize: LAUNCH_SELECTION_PAGE_SIZE,
    search: String(search ?? "")
      .trim()
      .slice(0, 120),
  };
}

export function launchSelectionFromRoute(query = {}) {
  return {
    cycleId: asIdentifier(query.cycleId),
    environmentId: asIdentifier(query.environmentId),
  };
}

export function buildLaunchSelectionQuery(routeQuery = {}, selection = {}) {
  return {
    ...routeQuery,
    cycleId: selection.cycleId || undefined,
    environmentId: selection.environmentId || undefined,
  };
}

export function isLaunchSelectionCompatible(cycle, environment) {
  if (!cycle || !environment) return true;
  return isRuntimeCompatible(cycle, environment.runtime);
}
