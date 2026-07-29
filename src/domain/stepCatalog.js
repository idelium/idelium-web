import appium from "@/view/steps/appium";
import postman from "@/view/steps/postman";
import selenium from "@/view/steps/selenium";
import webservices from "@/view/steps/webservices";

export const STEP_CATALOG_VERSION = "2026.07";
export const STEP_CATALOG_MINIMUM_READABLE_VERSION = "2026.01";
const SAFE_IDENTIFIER = /^[a-zA-Z0-9_.:-]+$/;
const MAX_PLUGIN_ACTIONS = 500;
const MAX_CATALOG_QUERY_LENGTH = 200;
const ACTION_GROUPS = new Set([
  "selenium",
  "appium",
  "postman",
  "webservice",
  "plugin",
  "control-flow",
  "shared",
]);

export const STEP_RUNTIMES = {
  appium: {
    label: "appium",
    stepsFile: appium.stepsFile,
  },
  postman: {
    label: "postman",
    stepsFile: postman.stepsFile,
  },
  selenium: {
    label: "selenium",
    stepsFile: selenium.stepsFile,
  },
  webservice: {
    label: "webservice",
    stepsFile: webservices.stepsFile,
  },
};

export function getStepCatalog(runtime) {
  return STEP_RUNTIMES[runtime]?.stepsFile || [];
}

export function findCatalogEntry(stepType) {
  for (const [runtime, catalog] of Object.entries(STEP_RUNTIMES)) {
    const entry = catalog.stepsFile.find((step) => step.name === stepType);
    if (entry) {
      return {
        catalogVersion: STEP_CATALOG_VERSION,
        runtime,
        entry,
      };
    }
  }
  return null;
}

export function createActionCatalog(options = {}) {
  const coreActions = Object.entries(STEP_RUNTIMES).flatMap(
    ([runtime, catalog]) =>
      catalog.stepsFile.map((entry) => actionContract(runtime, entry)),
  );
  const pluginActions = normalizePluginActions(options.pluginActions);
  const actions = [...coreActions, ...pluginActions];
  return {
    version: STEP_CATALOG_VERSION,
    groups: groupActions(actions),
    actions,
  };
}

export function resolveActionCatalogEntry(reference, options = {}) {
  const catalog = createActionCatalog(options);
  const actionType = safeIdentifier(
    reference?.actionType ?? reference?.stepType ?? reference?.name,
  );
  const requestedVersion = normalizeCatalogVersion(reference?.catalogVersion);
  const versionDiagnostic = catalogVersionDiagnostic(requestedVersion);
  if (versionDiagnostic != null) {
    return { action: null, diagnostics: [versionDiagnostic] };
  }

  const candidates = catalog.actions.filter(
    (action) => action.actionType === actionType,
  );
  const requestedRuntime = safeIdentifier(reference?.runtime);
  const action =
    candidates.find(
      (candidate) =>
        requestedRuntime == null || candidate.runtime === requestedRuntime,
    ) ?? null;
  if (action == null) {
    return {
      action: null,
      diagnostics: [
        catalogDiagnostic("stepEditor.unknownAction", {
          actionType: actionType ?? "unknown",
        }),
      ],
    };
  }

  const diagnostics = [];
  if (requestedVersion == null) {
    diagnostics.push(
      catalogDiagnostic(
        "stepEditor.legacyCatalogVersion",
        {
          targetVersion: STEP_CATALOG_VERSION,
        },
        "warning",
      ),
    );
  }
  if (action.deprecation.deprecated) {
    diagnostics.push(
      catalogDiagnostic(
        "stepEditor.deprecatedAction",
        {
          actionType: action.actionType,
          replacement: action.deprecation.replacement,
        },
        "warning",
      ),
    );
  }
  return { action, diagnostics };
}

export function searchActionCatalog(catalog, options = {}) {
  const query = normalizeSearchText(options.query).slice(
    0,
    MAX_CATALOG_QUERY_LENGTH,
  );
  const localizedActions = options.localizedActions ?? {};
  const runtimeVersions = options.runtimeVersions ?? {};
  const activeRuntime = safeIdentifier(options.activeRuntime);
  const results = (Array.isArray(catalog?.actions) ? catalog.actions : [])
    .slice(0, MAX_PLUGIN_ACTIONS + 2_000)
    .map((action) => {
      const localized = localizedActions[action.id] ?? {};
      const compatibility = actionCompatibility(action, {
        activeRuntime,
        runtimeVersions,
      });
      const searchDocument = [
        action.actionType,
        action.runtime,
        action.group,
        localized.label,
        localized.description,
        ...(action.tags ?? []),
        ...(localized.tags ?? []),
      ]
        .map(normalizeSearchText)
        .join(" ");
      return { action, compatibility, localized, searchDocument };
    })
    .filter((result) => query === "" || result.searchDocument.includes(query));

  const groups = groupActions(results.map((result) => result.action))
    .map((group) => ({
      ...group,
      results: results.filter((result) => result.action.group === group.id),
    }))
    .filter((group) => group.results.length > 0);
  return { groups, query, total: results.length };
}

function actionContract(runtime, entry, pluginId = null) {
  const actionType = safeIdentifier(entry?.name) ?? "unknown_action";
  const fields = (Array.isArray(entry?.syntax) ? entry.syntax : [])
    .slice(0, 100)
    .map(fieldContract);
  return {
    id:
      pluginId == null
        ? `${runtime}:${actionType}`
        : `${pluginId}:${actionType}`,
    actionType,
    catalogVersion: STEP_CATALOG_VERSION,
    runtime,
    group: normalizeActionGroup(entry?.category, runtime),
    pluginId,
    schemaVersion: normalizeCatalogVersion(entry?.schemaVersion) ?? "1",
    schema: {
      type: "object",
      properties: Object.fromEntries(
        fields.map((field) => [field.name, field.schema]),
      ),
      required: fields
        .filter((field) => field.required)
        .map((field) => field.name),
    },
    fields,
    defaults: Object.fromEntries(
      fields
        .filter((field) => field.defaultValue !== undefined)
        .map((field) => [field.name, field.defaultValue]),
    ),
    documentation: {
      key: `StepEditor.actions.${runtime}.${actionType}`,
      url:
        safeDocumentationUrl(entry?.documentationUrl) ??
        `https://github.com/idelium/idelium-docker/wiki/Step-Editor#${actionType}`,
    },
    deprecation: {
      deprecated: entry?.deprecated === true,
      since: normalizeCatalogVersion(entry?.deprecatedSince),
      replacement: safeIdentifier(entry?.replacement),
    },
    capabilities: actionCapabilities(runtime, entry),
    tags: normalizeTags(entry?.tags),
    lifecycle: {
      experimental: entry?.experimental === true,
      unsupported: entry?.unsupported === true,
    },
    runtimeConstraint: {
      minimum: normalizeCatalogVersion(entry?.minimumRuntimeVersion),
      maximum: normalizeCatalogVersion(entry?.maximumRuntimeVersion),
    },
  };
}

function fieldContract(field) {
  const name = safeIdentifier(field?.typeName) ?? "value";
  const type =
    field?.type === "integer"
      ? "integer"
      : field?.type === "json"
        ? "object"
        : "string";
  const schema = { type };
  if (Array.isArray(field?.options)) {
    schema.enum = field.options
      .map((value) => String(value).slice(0, 200))
      .slice(0, 100);
  }
  if (Number.isFinite(field?.minimum)) schema.minimum = Number(field.minimum);
  if (Number.isFinite(field?.maximum)) schema.maximum = Number(field.maximum);
  if (Number.isFinite(field?.maxLength)) {
    schema.maxLength = Math.min(Math.max(Number(field.maxLength), 1), 100_000);
  }
  return {
    name,
    labelKey: `StepEditor.fields.${name}`,
    input: field?.type === "options" ? "select" : type,
    required: field?.required === true,
    defaultValue: safeDefault(field?.default),
    schema,
  };
}

function actionCapabilities(runtime, entry) {
  const defaults = {
    wizard: true,
    json: true,
    dsl: runtime !== "postman" && runtime !== "plugin",
    testExecution: true,
    conversion: runtime !== "plugin",
  };
  return Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => [
      key,
      typeof entry?.capabilities?.[key] === "boolean"
        ? entry.capabilities[key]
        : value,
    ]),
  );
}

function normalizePluginActions(rawPluginActions) {
  const source = Array.isArray(rawPluginActions) ? rawPluginActions : [];
  const actions = [];
  for (const plugin of source.slice(0, MAX_PLUGIN_ACTIONS)) {
    const pluginId = safeIdentifier(plugin?.pluginId ?? plugin?.id);
    if (pluginId == null) continue;
    const entries = Array.isArray(plugin?.actions)
      ? plugin.actions
      : plugin?.name
        ? [plugin]
        : [];
    for (const entry of entries.slice(0, MAX_PLUGIN_ACTIONS - actions.length)) {
      if (safeIdentifier(entry?.name) == null) continue;
      actions.push(actionContract("plugin", entry, pluginId));
    }
    if (actions.length >= MAX_PLUGIN_ACTIONS) break;
  }
  return actions;
}

function groupActions(actions) {
  const groups = new Map();
  for (const action of actions) {
    if (!groups.has(action.group)) {
      groups.set(action.group, {
        id: action.group,
        labelKey: `StepEditor.runtimes.${action.group}`,
        actionIds: [],
      });
    }
    groups.get(action.group).actionIds.push(action.id);
  }
  return [...groups.values()].sort(
    (left, right) =>
      [...ACTION_GROUPS].indexOf(left.id) -
      [...ACTION_GROUPS].indexOf(right.id),
  );
}

function actionCompatibility(action, options) {
  if (action.lifecycle?.unsupported) {
    return {
      addable: false,
      code: "unsupported",
      remediation: "StepEditor.catalog.remediation.unsupported",
    };
  }
  if (
    options.activeRuntime != null &&
    action.runtime !== "shared" &&
    action.runtime !== options.activeRuntime
  ) {
    return {
      addable: false,
      code: "runtime",
      remediation: "StepEditor.catalog.remediation.runtime",
    };
  }
  const version = normalizeCatalogVersion(
    options.runtimeVersions[action.runtime],
  );
  if (
    version != null &&
    action.runtimeConstraint?.minimum != null &&
    compareCatalogVersions(version, action.runtimeConstraint.minimum) < 0
  ) {
    return {
      addable: false,
      code: "minimum-version",
      remediation: "StepEditor.catalog.remediation.minimumVersion",
    };
  }
  if (
    version != null &&
    action.runtimeConstraint?.maximum != null &&
    compareCatalogVersions(version, action.runtimeConstraint.maximum) > 0
  ) {
    return {
      addable: false,
      code: "maximum-version",
      remediation: "StepEditor.catalog.remediation.maximumVersion",
    };
  }
  return { addable: true, code: null, remediation: null };
}

function normalizeActionGroup(category, runtime) {
  const normalized = safeIdentifier(category);
  return ACTION_GROUPS.has(normalized) ? normalized : runtime;
}

function normalizeTags(tags) {
  return (Array.isArray(tags) ? tags : [])
    .map((tag) => String(tag).trim().slice(0, 80))
    .filter(Boolean)
    .slice(0, 20);
}

function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .trim();
}

function catalogVersionDiagnostic(version) {
  if (version == null || version === STEP_CATALOG_VERSION) return null;
  if (compareCatalogVersions(version, STEP_CATALOG_VERSION) > 0) {
    return catalogDiagnostic("stepEditor.newerCatalogVersion", {
      requestedVersion: version,
      supportedVersion: STEP_CATALOG_VERSION,
    });
  }
  if (
    compareCatalogVersions(version, STEP_CATALOG_MINIMUM_READABLE_VERSION) < 0
  ) {
    return catalogDiagnostic("stepEditor.unsupportedCatalogVersion", {
      minimumVersion: STEP_CATALOG_MINIMUM_READABLE_VERSION,
      requestedVersion: version,
    });
  }
  return null;
}

function compareCatalogVersions(left, right) {
  return String(left).localeCompare(String(right), "en", { numeric: true });
}

function catalogDiagnostic(code, context, severity = "error") {
  return { code, context, severity };
}

function normalizeCatalogVersion(value) {
  const normalized = String(value ?? "").trim();
  return normalized === "" ? null : normalized.slice(0, 30);
}

function safeIdentifier(value) {
  const normalized = String(value ?? "").trim();
  return normalized !== "" && SAFE_IDENTIFIER.test(normalized)
    ? normalized.slice(0, 200)
    : null;
}

function safeDocumentationUrl(value) {
  const normalized = String(value ?? "").trim();
  return /^https:\/\/github\.com\/idelium\//.test(normalized)
    ? normalized.slice(0, 500)
    : null;
}

function safeDefault(value) {
  if (
    value == null ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    return value;
  }
  if (typeof value === "string") return value.slice(0, 10_000);
  return undefined;
}
