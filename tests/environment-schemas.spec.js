import { describe, expect, it } from "vitest";

import {
  ENVIRONMENT_MINIMUM_READABLE_VERSION,
  ENVIRONMENT_SCHEMA_VERSION,
  environmentSchemas,
  environmentTemplates,
  getEnvironmentTemplate,
  loadEnvironmentConfig,
  serializeEnvironmentConfig,
} from "@/domain/environmentSchemas";
import english from "@/languages/english";
import italian from "@/languages/italian";

describe("versioned environment schemas and templates", () => {
  it("defines Web, Mobile, and API contracts with stable capabilities", () => {
    const schemas = environmentSchemas();

    expect(Object.keys(schemas)).toEqual(["web", "mobile", "api"]);
    for (const [type, schema] of Object.entries(schemas)) {
      expect(schema).toMatchObject({
        type,
        schemaVersion: ENVIRONMENT_SCHEMA_VERSION,
        capabilities: {
          clone: true,
          connectionTest: true,
          inheritance: true,
          resolvedPreview: true,
          secretReferences: true,
          variables: true,
        },
      });
      expect(schema.documentationUrl).toMatch(
        /^https:\/\/github\.com\/idelium\//,
      );
      expect(schema.sections.length).toBeGreaterThan(0);
    }
  });

  it("provides all six credential-free safe templates", () => {
    const templates = environmentTemplates();
    expect(templates.map((template) => template.id)).toEqual([
      "local-browser",
      "selenium-grid",
      "android",
      "ios",
      "external-appium",
      "api-postman",
    ]);
    const serialized = JSON.stringify(templates);
    expect(serialized).not.toMatch(
      /idelium\.io|authorization|credential|password|secret|token/i,
    );
    expect(serialized).toContain("idelium.org");
    expect(getEnvironmentTemplate("missing")).toBeNull();
  });

  it.each([
    [
      "web",
      {
        base_url: "https://demo.idelium.org",
        browser: "firefox",
        seleniumGridUrl: "http://grid:4444",
      },
    ],
    [
      "mobile",
      {
        appiumServer: "http://localhost:4723",
        appiumDesiredCaps: {
          automationName: "UiAutomator2",
          deviceName: "Android",
          platformName: "android",
        },
      },
    ],
    [
      "api",
      {
        base_url: "https://api.demo.idelium.org",
        followRedirects: true,
        timeoutMs: 30_000,
      },
    ],
  ])(
    "loads and exactly round-trips a valid legacy %s environment",
    (type, config) => {
      const loaded = loadEnvironmentConfig(config, { typeHint: type });

      expect(loaded).toMatchObject({
        type,
        valid: true,
        legacy: true,
        schemaVersion: ENVIRONMENT_SCHEMA_VERSION,
        diagnostics: [
          {
            code: "environment.legacySchema",
            severity: "warning",
          },
        ],
      });
      expect(serializeEnvironmentConfig(loaded)).toEqual(config);
    },
  );

  it("serializes changed legacy data into the current envelope", () => {
    const loaded = loadEnvironmentConfig(
      { base_url: "https://demo.idelium.org", browser: "chrome" },
      { typeHint: "web" },
    );
    loaded.dirty = true;
    loaded.config.browser = "firefox";

    expect(serializeEnvironmentConfig(loaded)).toEqual({
      config: {
        base_url: "https://demo.idelium.org",
        browser: "firefox",
      },
      schemaVersion: ENVIRONMENT_SCHEMA_VERSION,
      type: "web",
    });
  });

  it("fails safely for unknown versions without discarding source data", () => {
    const source = {
      schemaVersion: "2099.01",
      type: "web",
      config: { futureField: { retained: true } },
    };
    const loaded = loadEnvironmentConfig(source);

    expect(loaded).toMatchObject({
      valid: false,
      persisted: source,
      diagnostics: [
        {
          code: "environment.newerSchemaVersion",
          severity: "error",
        },
      ],
    });
    expect(loaded.config).toEqual(source.config);
    expect(ENVIRONMENT_MINIMUM_READABLE_VERSION).toBe("2026.01");
  });

  it("localizes templates, migration diagnostics, and remediation in EN/IT", () => {
    for (const language of [english, italian]) {
      for (const template of [
        "localBrowser",
        "seleniumGrid",
        "android",
        "ios",
        "externalAppium",
        "apiPostman",
      ]) {
        expect(
          language.EnvironmentSchema.templates[template].label,
        ).toBeTruthy();
        expect(
          language.EnvironmentSchema.templates[template].description,
        ).toBeTruthy();
      }
      for (const diagnostic of [
        "malformed",
        "unknownType",
        "newerSchemaVersion",
        "expiredSchemaVersion",
        "legacySchema",
      ]) {
        expect(language.EnvironmentSchema.diagnostics[diagnostic]).toBeTruthy();
        expect(language.EnvironmentSchema.remediation[diagnostic]).toBeTruthy();
      }
    }
  });
});
