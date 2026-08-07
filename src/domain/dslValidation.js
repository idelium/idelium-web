export const DSL_SOURCE_SCHEMA_VERSION = "dsl.source.v1";
export const DSL_LANGUAGE_VERSION = "1.0";
export const DSL_LINT_SCHEMA_VERSION = "dsl-lint-result.v1";
export const MAX_DSL_SOURCE_BYTES = 500_000;
const MAX_DSL_COMPLETIONS = 200;

const SENSITIVE_PATTERN =
  /\b(api[-_\s]?key|authorization|cookie|password|refresh[-_\s]?token|secret|session|token)\s*[:=]\s*([^&\s,;]+)/gi;
const DSL_IDENTIFIER_PATTERN = "[A-Za-z_][A-Za-z0-9_-]*";
const DSL_STRING_PATTERN = `(?:"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*')`;
const DSL_LOCATOR_PATTERN = `(css|xpath)\\s+${DSL_STRING_PATTERN}`;
const DSL_DURATION_PATTERN = "[1-9][0-9]*(ms|s|m)";
const DSL_CONSTRUCTS = [
  {
    id: "variables",
    statements: ['let name = "value"', 'secret token = "${token}"'],
  },
  {
    id: "interpolation",
    statements: ['open "${baseUrl}/login"'],
  },
  {
    id: "conditions",
    statements: ['if visible css "#ready" { ... }'],
  },
  {
    id: "loops",
    statements: ["repeat 3 times { ... }"],
  },
  {
    id: "reuse",
    statements: ["step login(user, password) { ... }", 'use login("a", "b")'],
  },
  {
    id: "assertions",
    statements: [
      'assert visible css "#dashboard"',
      'assert value css "#email" equals "user@example.invalid"',
      'assert count css ".row" at_least 1',
      'assert url contains "/dashboard"',
    ],
  },
  {
    id: "parameters",
    statements: ['secret password = "${password}"'],
  },
];

function parseJsonConfig(rawConfig) {
  if (rawConfig && typeof rawConfig === "object") return rawConfig;
  if (typeof rawConfig !== "string" || rawConfig.trim() === "") return {};

  let parsedConfig = rawConfig;
  for (let index = 0; index < 3; index += 1) {
    if (typeof parsedConfig !== "string") return parsedConfig;
    parsedConfig = JSON.parse(parsedConfig);
  }

  return parsedConfig;
}

function diagnostic(
  line,
  column,
  code,
  message,
  remediation = "",
  severity = "error",
) {
  return {
    line,
    column,
    code,
    severity,
    message: redactSensitiveText(message),
    remediation: redactSensitiveText(remediation),
  };
}

function isRecognizedDslStatement(trimmed) {
  if (trimmed === "" || trimmed.startsWith("#")) return true;
  if (/^}\s*;?$/.test(trimmed)) return true;
  if (new RegExp(`^idelium\\s+\\S+$`).test(trimmed)) return true;
  if (/^test\s+["'][^"']+["']\s*\{(?:.*\})?$/.test(trimmed)) return true;
  if (
    new RegExp(
      `^step\\s+${DSL_IDENTIFIER_PATTERN}(?:\\([^)]*\\))?\\s*\\{(?:.*\\})?$`,
    ).test(trimmed)
  ) {
    return true;
  }
  if (
    new RegExp(
      `^if\\s+(visible|hidden)\\s+${DSL_LOCATOR_PATTERN}\\s*\\{(?:.*\\})?$`,
    ).test(trimmed)
  ) {
    return true;
  }
  if (/^repeat\s+[1-9][0-9]*\s+times\s*\{(?:.*\})?$/.test(trimmed)) {
    return true;
  }
  if (
    new RegExp(
      `^(let|secret)\\s+${DSL_IDENTIFIER_PATTERN}\\s*=\\s*${DSL_STRING_PATTERN}\\s*;?$`,
    ).test(trimmed)
  ) {
    return true;
  }
  if (new RegExp(`^open\\s+${DSL_STRING_PATTERN}\\s*;?$`).test(trimmed)) {
    return true;
  }
  if (new RegExp(`^click\\s+${DSL_LOCATOR_PATTERN}\\s*;?$`).test(trimmed)) {
    return true;
  }
  if (
    new RegExp(
      `^write\\s+${DSL_LOCATOR_PATTERN}\\s+value\\s+${DSL_STRING_PATTERN}\\s*;?$`,
    ).test(trimmed)
  ) {
    return true;
  }
  if (
    new RegExp(
      `^wait\\s+${DSL_LOCATOR_PATTERN}\\s+(present|visible|hidden|clickable)(?:\\s+timeout\\s+${DSL_DURATION_PATTERN})?\\s*;?$`,
    ).test(trimmed)
  ) {
    return true;
  }
  if (
    new RegExp(
      `^assert\\s+(visible|hidden)\\s+${DSL_LOCATOR_PATTERN}\\s*;?$`,
    ).test(trimmed)
  ) {
    return true;
  }
  if (
    new RegExp(
      `^assert\\s+(text|value)\\s+${DSL_LOCATOR_PATTERN}\\s+(equals|contains)\\s+${DSL_STRING_PATTERN}\\s*;?$`,
    ).test(trimmed)
  ) {
    return true;
  }
  if (
    new RegExp(
      `^assert\\s+count\\s+${DSL_LOCATOR_PATTERN}\\s+(equals|greater_than|less_than|at_least|at_most)\\s+[0-9]+\\s*;?$`,
    ).test(trimmed)
  ) {
    return true;
  }
  if (
    new RegExp(
      `^assert\\s+(url|title)\\s+(equals|contains)\\s+${DSL_STRING_PATTERN}\\s*;?$`,
    ).test(trimmed)
  ) {
    return true;
  }
  if (new RegExp(`^screenshot\\s+${DSL_STRING_PATTERN}\\s*;?$`).test(trimmed)) {
    return true;
  }
  if (/^(back|forward)\s*;?$/.test(trimmed)) return true;
  if (
    new RegExp(`^use\\s+${DSL_IDENTIFIER_PATTERN}\\([^)]*\\)\\s*;?$`).test(
      trimmed,
    )
  ) {
    return true;
  }
  if (new RegExp(`^action\\s+[A-Za-z0-9_.:-]+\\s*;?$`).test(trimmed)) {
    return true;
  }
  return false;
}

export function buildDslSourcePayload(source) {
  return {
    stepType: "dsl",
    runtime: "dsl",
    schemaVersion: DSL_SOURCE_SCHEMA_VERSION,
    languageVersion: DSL_LANGUAGE_VERSION,
    source,
  };
}

function findDslSourcePayload(config) {
  if (!config) return null;
  if (Array.isArray(config)) {
    for (const item of config) {
      const payload = findDslSourcePayload(item);
      if (payload) return payload;
    }
    return null;
  }
  if (typeof config !== "object") return null;

  if (
    (config.runtime === "dsl" || config.stepType === "dsl") &&
    config.schemaVersion === DSL_SOURCE_SCHEMA_VERSION &&
    typeof config.source === "string"
  ) {
    return config;
  }

  return findDslSourcePayload(config.steps);
}

export function isDslSourcePayload(rawConfig) {
  try {
    const config = parseJsonConfig(rawConfig);
    return Boolean(findDslSourcePayload(config));
  } catch {
    return false;
  }
}

export function extractDslSource(rawConfig) {
  try {
    const config = parseJsonConfig(rawConfig);
    const payload = findDslSourcePayload(config);
    return typeof payload?.source === "string" ? payload.source : "";
  } catch {
    return "";
  }
}

export function validateDslSource(source) {
  const diagnostics = [];
  const normalizedSource = typeof source === "string" ? source : "";
  if (
    new TextEncoder().encode(normalizedSource).length > MAX_DSL_SOURCE_BYTES
  ) {
    diagnostics.push(
      diagnostic(
        1,
        1,
        "DSL_SOURCE_TOO_LARGE",
        "DSL source exceeds the supported size.",
        "Reduce the DSL source below 500,000 bytes.",
      ),
    );
    return {
      schemaVersion: DSL_LINT_SCHEMA_VERSION,
      valid: false,
      diagnostics,
    };
  }
  const lines = normalizedSource.split(/\r?\n/);
  const firstContentLineIndex = lines.findIndex((line) => line.trim() !== "");
  const firstContentLine =
    firstContentLineIndex >= 0 ? lines[firstContentLineIndex].trim() : "";

  if (normalizedSource.trim() === "") {
    diagnostics.push(
      diagnostic(
        1,
        1,
        "DSL_SOURCE_EMPTY",
        "DSL source cannot be empty.",
        "Add an Idelium DSL document that starts with `idelium 1.0`.",
      ),
    );
    return { valid: false, diagnostics };
  }

  if (!firstContentLine.startsWith("idelium ")) {
    diagnostics.push(
      diagnostic(
        firstContentLineIndex + 1,
        1,
        "DSL_VERSION_MISSING",
        "DSL source must declare the language version.",
        "Start the document with `idelium 1.0`.",
      ),
    );
  } else if (firstContentLine !== `idelium ${DSL_LANGUAGE_VERSION}`) {
    diagnostics.push(
      diagnostic(
        firstContentLineIndex + 1,
        1,
        "DSL_VERSION_UNSUPPORTED",
        `Only Idelium DSL ${DSL_LANGUAGE_VERSION} is supported.`,
        "Update the first line to `idelium 1.0` or migrate the document before saving.",
      ),
    );
  }

  const testBlockLineIndex = lines.findIndex((line) =>
    /^\s*test\s+["'][^"']+["']\s*\{/.test(line),
  );
  if (testBlockLineIndex < 0) {
    diagnostics.push(
      diagnostic(
        Math.max(firstContentLineIndex + 1, 1),
        1,
        "DSL_TEST_BLOCK_MISSING",
        "DSL source must contain at least one test block.",
        'Add a block such as `test "smoke" { ... }`.',
      ),
    );
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) return;
    if (!isRecognizedDslStatement(trimmed)) {
      diagnostics.push(
        diagnostic(
          index + 1,
          Math.max(line.search(/\S/) + 1, 1),
          "DSL_STATEMENT_UNKNOWN",
          `DSL statement is not recognized: ${trimmed}.`,
          "Use a supported DSL v1 statement such as open, click, write, wait, assert, if, repeat, step, use, screenshot, back, or forward.",
        ),
      );
      return;
    }
    if (/^open\s+["']http:\/\//.test(trimmed)) {
      diagnostics.push(
        diagnostic(
          index + 1,
          Math.max(line.indexOf("open") + 1, 1),
          "DSL_OPEN_HTTP_URL",
          "Open statement uses an insecure HTTP URL.",
          "Use HTTPS for shared and enterprise environments.",
          "warning",
        ),
      );
    }
    if (
      /^wait\s+/.test(trimmed) &&
      !/\s+timeout\s+[1-9][0-9]*(ms|s|m)\s*;?$/.test(trimmed)
    ) {
      diagnostics.push(
        diagnostic(
          index + 1,
          Math.max(line.indexOf("wait") + 1, 1),
          "DSL_WAIT_TIMEOUT_IMPLICIT",
          "Wait statement relies on the runtime default timeout.",
          "Add an explicit timeout such as `timeout 10s`.",
          "warning",
        ),
      );
    }
    if (/^write\s+/.test(trimmed) && SENSITIVE_PATTERN.test(trimmed)) {
      diagnostics.push(
        diagnostic(
          index + 1,
          Math.max(line.indexOf("write") + 1, 1),
          "DSL_SECRET_LITERAL",
          `A sensitive-looking literal is present in the DSL source: ${trimmed}.`,
          "Use `secret` variables or runtime parameters instead of inline values.",
          "error",
        ),
      );
    }
    SENSITIVE_PATTERN.lastIndex = 0;
  });

  let balance = 0;
  lines.forEach((line, index) => {
    for (const character of line) {
      if (character === "{") balance += 1;
      if (character === "}") balance -= 1;
      if (balance < 0) {
        diagnostics.push(
          diagnostic(
            index + 1,
            Math.max(line.indexOf("}") + 1, 1),
            "DSL_BRACE_UNEXPECTED",
            "DSL source contains a closing brace without a matching opening brace.",
            "Remove the extra closing brace or add the missing opening block.",
          ),
        );
        balance = 0;
      }
    }
  });

  if (balance > 0) {
    diagnostics.push(
      diagnostic(
        lines.length,
        Math.max(lines[lines.length - 1].length, 1),
        "DSL_BRACE_MISSING",
        "DSL source contains an unclosed block.",
        "Add the missing closing brace before saving.",
      ),
    );
  }

  const errors = diagnostics.filter((item) => item.severity !== "warning");
  return {
    schemaVersion: DSL_LINT_SCHEMA_VERSION,
    valid: errors.length === 0,
    diagnostics,
  };
}

export function createDslCompletions(catalog, options = {}) {
  const authorizedIds = new Set(
    Array.isArray(options.authorizedActionIds)
      ? options.authorizedActionIds.map(String).slice(0, MAX_DSL_COMPLETIONS)
      : [],
  );
  return (Array.isArray(catalog?.actions) ? catalog.actions : [])
    .filter(
      (action) =>
        action.capabilities?.dsl === true &&
        (authorizedIds.size === 0 || authorizedIds.has(String(action.id))),
    )
    .slice(0, MAX_DSL_COMPLETIONS)
    .map((action) => ({
      actionType: action.actionType,
      documentationUrl: action.documentation?.url ?? null,
      id: action.id,
      insertText: `action ${action.actionType}`,
      runtime: action.runtime,
    }));
}

export function validateDslCatalogCompatibility(source, catalog, options = {}) {
  const actions = new Map(
    (Array.isArray(catalog?.actions) ? catalog.actions : []).map((action) => [
      action.actionType,
      action,
    ]),
  );
  const activeRuntime = String(options.activeRuntime ?? "").trim();
  const diagnostics = [];
  String(source ?? "")
    .split(/\r?\n/)
    .forEach((line, index) => {
      const match = line.match(/^\s*action\s+([a-zA-Z0-9_.:-]+)/);
      if (match == null) return;
      const action = actions.get(match[1]);
      if (action == null || action.capabilities?.dsl !== true) {
        diagnostics.push(
          diagnostic(
            index + 1,
            Math.max(line.indexOf(match[1]) + 1, 1),
            "DSL_ACTION_UNSUPPORTED",
            "The referenced action is unavailable in the authorized DSL catalog.",
            "Choose an action offered by the completion catalog.",
          ),
        );
      } else if (
        activeRuntime !== "" &&
        action.runtime !== "shared" &&
        action.runtime !== activeRuntime
      ) {
        diagnostics.push(
          diagnostic(
            index + 1,
            Math.max(line.indexOf(match[1]) + 1, 1),
            "DSL_ACTION_RUNTIME_INCOMPATIBLE",
            "The referenced action is incompatible with the active runtime.",
            "Switch runtime or choose a compatible action.",
          ),
        );
      }
    });
  return diagnostics;
}

export function dslConstructCatalog() {
  return DSL_CONSTRUCTS.map((construct) => ({ ...construct }));
}

export function localizeDslConstructs(labels = {}) {
  return dslConstructCatalog().map((construct) => ({
    ...construct,
    title: labels.constructs?.[construct.id]?.title || construct.id,
    description: labels.constructs?.[construct.id]?.description || "",
  }));
}

export function redactSensitiveText(value) {
  if (typeof value !== "string") return "";
  return value.replace(SENSITIVE_PATTERN, (match, key) => `${key}=[REDACTED]`);
}
