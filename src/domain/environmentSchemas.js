export const ENVIRONMENT_SCHEMA_VERSION = "2026.07";
export const ENVIRONMENT_MINIMUM_READABLE_VERSION = "2026.01";

const ENVIRONMENT_TYPES = new Set(["web", "mobile", "api"]);
const SAFE_TEMPLATE_ID = /^[a-z0-9-]{1,80}$/;

const SCHEMAS = {
  web: schema("web", [
    section("connection", [
      field("base_url", "url", {
        default: "https://demo.idelium.org",
        required: true,
      }),
      field("browser", "enum", {
        default: "chrome",
        enum: ["chrome", "firefox", "edge", "safari"],
        required: true,
      }),
      field("seleniumGridUrl", "url"),
    ]),
    section("browser", [
      field("seleniumHeadless", "boolean", { default: true }),
      field("seleniumLocale", "string", { default: "en-US" }),
      field("accept_self_certificate", "boolean", { default: false }),
    ]),
  ]),
  mobile: schema("mobile", [
    section("connection", [
      field("appiumServer", "url", {
        default: "http://localhost:4723",
        required: true,
      }),
      field("platformName", "enum", {
        enum: ["android", "ios"],
        required: true,
      }),
      field("automationName", "enum", {
        enum: ["UiAutomator2", "Espresso", "XCUITest"],
        required: true,
      }),
    ]),
    section("device", [
      field("deviceName", "string", { required: true }),
      field("platformVersion", "string"),
      field("isRealDevice", "boolean", { default: false }),
      field("app", "string"),
      field("appPackage", "string"),
    ]),
  ]),
  api: schema("api", [
    section("connection", [
      field("base_url", "url", {
        default: "https://api.demo.idelium.org",
        required: true,
      }),
      field("timeoutMs", "integer", {
        default: 30_000,
        minimum: 1_000,
        maximum: 120_000,
      }),
    ]),
    section("postman", [
      field("followRedirects", "boolean", { default: true }),
      field("strictTls", "boolean", { default: true }),
    ]),
  ]),
};

const TEMPLATES = [
  template("local-browser", "web", "localBrowser", {
    base_url: "https://demo.idelium.org",
    browser: "chrome",
    seleniumHeadless: true,
    seleniumLocale: "en-US",
  }),
  template("selenium-grid", "web", "seleniumGrid", {
    base_url: "https://demo.idelium.org",
    browser: "chrome",
    seleniumGridUrl: "http://selenium-grid:4444",
    seleniumHeadless: true,
  }),
  template("android", "mobile", "android", {
    appiumServer: "http://localhost:4723",
    automationName: "UiAutomator2",
    deviceName: "Android device",
    isRealDevice: false,
    platformName: "android",
  }),
  template("ios", "mobile", "ios", {
    appiumServer: "http://localhost:4723",
    automationName: "XCUITest",
    deviceName: "iOS device",
    isRealDevice: false,
    platformName: "ios",
  }),
  template("external-appium", "mobile", "externalAppium", {
    appiumServer: "https://appium.example.invalid",
    automationName: "UiAutomator2",
    deviceName: "External mobile target",
    isRealDevice: true,
    platformName: "android",
  }),
  template("api-postman", "api", "apiPostman", {
    base_url: "https://api.demo.idelium.org",
    followRedirects: true,
    strictTls: true,
    timeoutMs: 30_000,
  }),
];

export function environmentSchemas() {
  return structuredCloneSafe(SCHEMAS);
}

export function environmentTemplates() {
  return structuredCloneSafe(TEMPLATES);
}

export function getEnvironmentTemplate(templateId) {
  const id = String(templateId ?? "");
  return structuredCloneSafe(
    TEMPLATES.find((entry) => entry.id === id) ?? null,
  );
}

export function loadEnvironmentConfig(rawConfig, options = {}) {
  const persisted = structuredCloneSafe(rawConfig);
  const source = parseConfig(rawConfig);
  if (source == null) {
    return invalidEnvironment(persisted, "environment.malformed");
  }
  const schemaVersion = normalizeVersion(source.schemaVersion);
  const type = normalizeType(
    source.type ?? options.typeHint ?? legacyTypeHint(source),
  );
  if (type == null) {
    return invalidEnvironment(persisted, "environment.unknownType");
  }
  if (schemaVersion != null) {
    if (compareVersions(schemaVersion, ENVIRONMENT_SCHEMA_VERSION) > 0) {
      return invalidEnvironment(
        persisted,
        "environment.newerSchemaVersion",
        source,
      );
    }
    if (
      compareVersions(schemaVersion, ENVIRONMENT_MINIMUM_READABLE_VERSION) < 0
    ) {
      return invalidEnvironment(
        persisted,
        "environment.expiredSchemaVersion",
        source,
      );
    }
  }
  const config = source.config ?? stripEnvelope(source);
  return {
    capabilities: SCHEMAS[type].capabilities,
    config: structuredCloneSafe(config),
    diagnostics:
      schemaVersion == null
        ? [
            {
              code: "environment.legacySchema",
              path: "$.schemaVersion",
              remediationKey: "EnvironmentSchema.remediation.legacySchema",
              severity: "warning",
            },
          ]
        : [],
    legacy: schemaVersion == null,
    persisted,
    schema: structuredCloneSafe(SCHEMAS[type]),
    schemaVersion: schemaVersion ?? ENVIRONMENT_SCHEMA_VERSION,
    type,
    valid: true,
  };
}

export function serializeEnvironmentConfig(model) {
  if (model?.legacy === true && model?.dirty !== true) {
    return structuredCloneSafe(model.persisted);
  }
  return {
    config: structuredCloneSafe(model?.config ?? {}),
    schemaVersion: ENVIRONMENT_SCHEMA_VERSION,
    type: normalizeType(model?.type) ?? "web",
  };
}

function schema(type, sections) {
  return {
    capabilities: {
      clone: true,
      connectionTest: true,
      inheritance: true,
      resolvedPreview: true,
      secretReferences: true,
      variables: true,
    },
    documentationUrl: `https://github.com/idelium/idelium-docker/wiki/Environment-Configuration#${type}`,
    schemaVersion: ENVIRONMENT_SCHEMA_VERSION,
    sections,
    type,
  };
}

function section(id, fields) {
  return {
    fields,
    id,
    labelKey: `EnvironmentSchema.sections.${id}`,
  };
}

function field(name, control, options = {}) {
  return {
    control,
    default: options.default,
    enum: options.enum ?? [],
    labelKey: `EnvironmentSchema.fields.${name}`,
    maximum: options.maximum ?? null,
    minimum: options.minimum ?? null,
    name,
    required: options.required === true,
  };
}

function template(id, type, labelKey, config) {
  if (!SAFE_TEMPLATE_ID.test(id)) throw new Error("Invalid template ID");
  return {
    config,
    descriptionKey: `EnvironmentSchema.templates.${labelKey}.description`,
    id,
    labelKey: `EnvironmentSchema.templates.${labelKey}.label`,
    schemaVersion: ENVIRONMENT_SCHEMA_VERSION,
    type,
  };
}

function invalidEnvironment(persisted, code, source = {}) {
  return {
    capabilities: {},
    config: structuredCloneSafe(source.config ?? {}),
    diagnostics: [
      {
        code,
        path: "$",
        remediationKey: `EnvironmentSchema.remediation.${code.replace("environment.", "")}`,
        severity: "error",
      },
    ],
    legacy: false,
    persisted,
    schema: null,
    schemaVersion: normalizeVersion(source.schemaVersion),
    type: normalizeType(source.type),
    valid: false,
  };
}

function parseConfig(value) {
  if (value != null && typeof value === "object" && !Array.isArray(value)) {
    return structuredCloneSafe(value);
  }
  if (typeof value !== "string" || value.length > 1_000_000) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed != null &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function stripEnvelope(source) {
  const config = structuredCloneSafe(source);
  delete config.schemaVersion;
  delete config.type;
  return config;
}

function legacyTypeHint(source) {
  if ("appiumServer" in source || "appiumDesiredCaps" in source)
    return "mobile";
  if ("followRedirects" in source || "timeoutMs" in source) return "api";
  return "web";
}

function normalizeType(value) {
  const type = String(value ?? "").toLowerCase();
  const aliases = {
    app: "mobile",
    appium: "mobile",
    selenium: "web",
    webservice: "api",
    postman: "api",
  };
  const normalized = aliases[type] ?? type;
  return ENVIRONMENT_TYPES.has(normalized) ? normalized : null;
}

function normalizeVersion(value) {
  const version = String(value ?? "").trim();
  return version === "" ? null : version.slice(0, 30);
}

function compareVersions(left, right) {
  return String(left).localeCompare(String(right), "en", { numeric: true });
}

function structuredCloneSafe(value) {
  if (value === null) return null;
  return JSON.parse(JSON.stringify(value ?? {}));
}
