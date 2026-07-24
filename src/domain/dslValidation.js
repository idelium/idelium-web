export const DSL_SOURCE_SCHEMA_VERSION = "dsl.source.v1";
export const DSL_LANGUAGE_VERSION = "1.0";

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

function diagnostic(line, column, code, message, remediation = "") {
  return { line, column, code, message, remediation };
}

export function buildDslSourcePayload(source) {
  return {
    runtime: "dsl",
    schemaVersion: DSL_SOURCE_SCHEMA_VERSION,
    languageVersion: DSL_LANGUAGE_VERSION,
    source,
  };
}

export function isDslSourcePayload(rawConfig) {
  try {
    const config = parseJsonConfig(rawConfig);
    return (
      config?.runtime === "dsl" &&
      config?.schemaVersion === DSL_SOURCE_SCHEMA_VERSION &&
      typeof config?.source === "string"
    );
  } catch {
    return false;
  }
}

export function extractDslSource(rawConfig) {
  const config = parseJsonConfig(rawConfig);
  return typeof config?.source === "string" ? config.source : "";
}

export function validateDslSource(source) {
  const diagnostics = [];
  const normalizedSource = typeof source === "string" ? source : "";
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

  return { valid: diagnostics.length === 0, diagnostics };
}
