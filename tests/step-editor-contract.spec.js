import { describe, expect, it } from "vitest";

import {
  STEP_CATALOG_MINIMUM_READABLE_VERSION,
  STEP_CATALOG_VERSION,
  createActionCatalog,
  resolveActionCatalogEntry,
} from "@/domain/stepCatalog";
import {
  loadStepEditorModel,
  serializeStepEditorModel,
} from "@/domain/stepEditor";
import english from "@/languages/english";
import italian from "@/languages/italian";

describe("versioned step editor contract", () => {
  it("resolves Selenium, Appium, Postman, and plugin actions through one interface", () => {
    const pluginActions = [
      {
        pluginId: "reporting",
        actions: [
          {
            name: "publish_report",
            schemaVersion: "2",
            syntax: [
              { typeName: "format", type: "options", options: ["junit", "md"] },
            ],
          },
        ],
      },
    ];
    const catalog = createActionCatalog({ pluginActions });

    expect(catalog.version).toBe(STEP_CATALOG_VERSION);
    expect(catalog.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionType: "selenium_command",
          runtime: "selenium",
        }),
        expect.objectContaining({
          actionType: "appium_mobile_command",
          runtime: "appium",
        }),
        expect.objectContaining({
          actionType: "postman_collection",
          runtime: "postman",
        }),
        expect.objectContaining({
          actionType: "publish_report",
          runtime: "plugin",
          pluginId: "reporting",
          schemaVersion: "2",
        }),
      ]),
    );
    expect(
      catalog.actions.find((action) => action.actionType === "publish_report")
        .schema,
    ).toEqual({
      type: "object",
      properties: {
        format: { type: "string", enum: ["junit", "md"] },
      },
      required: [],
    });
  });

  it("loads and round-trips a legacy saved step without changing its payload", () => {
    const legacy = {
      name: "Open browser",
      editorType: "selenium",
      failedExit: true,
      steps: [
        {
          stepType: "open_browser",
          runtime: "selenium",
          url: "https://example.invalid",
        },
      ],
    };
    const model = loadStepEditorModel(legacy);

    expect(model.valid).toBe(true);
    expect(model.legacy).toBe(true);
    expect(model.actions[0].contract.actionType).toBe("open_browser");
    expect(model.capabilities).toMatchObject({
      wizard: true,
      json: true,
      dsl: true,
      testExecution: true,
      conversion: true,
    });
    expect(serializeStepEditorModel(model)).toEqual(legacy);
    expect(model.diagnostics[0]).toMatchObject({
      code: "stepEditor.legacyCatalogVersion",
      severity: "warning",
      path: "steps[0]",
    });
  });

  it("fails safely for unknown, newer, and expired catalogue references", () => {
    expect(
      resolveActionCatalogEntry({
        actionType: "not_registered",
        catalogVersion: STEP_CATALOG_VERSION,
        runtime: "selenium",
      }).diagnostics[0].code,
    ).toBe("stepEditor.unknownAction");
    expect(
      resolveActionCatalogEntry({
        actionType: "open_browser",
        catalogVersion: "2099.01",
        runtime: "selenium",
      }).diagnostics[0].code,
    ).toBe("stepEditor.newerCatalogVersion");
    expect(
      resolveActionCatalogEntry({
        actionType: "open_browser",
        catalogVersion: "2025.12",
        runtime: "selenium",
      }).diagnostics[0],
    ).toMatchObject({
      code: "stepEditor.unsupportedCatalogVersion",
      context: {
        minimumVersion: STEP_CATALOG_MINIMUM_READABLE_VERSION,
      },
    });
  });

  it("keeps deprecated plugin actions readable with actionable metadata", () => {
    const result = resolveActionCatalogEntry(
      {
        actionType: "legacy_publish",
        catalogVersion: STEP_CATALOG_VERSION,
        runtime: "plugin",
      },
      {
        pluginActions: [
          {
            pluginId: "reporting",
            actions: [
              {
                name: "legacy_publish",
                deprecated: true,
                deprecatedSince: "2026.03",
                replacement: "publish_report",
                syntax: [],
              },
            ],
          },
        ],
      },
    );

    expect(result.action).toMatchObject({
      actionType: "legacy_publish",
      deprecation: {
        deprecated: true,
        since: "2026.03",
        replacement: "publish_report",
      },
    });
    expect(result.diagnostics[0].code).toBe("stepEditor.deprecatedAction");
  });

  it("returns a repairable JSON model for malformed input", () => {
    const model = loadStepEditorModel("{invalid-json");

    expect(model).toMatchObject({
      valid: false,
      mode: "json",
      diagnostics: [
        {
          code: "stepEditor.malformedConfig",
          path: "$",
          severity: "error",
        },
      ],
    });
  });

  it("localizes every stable diagnostic in English and Italian", () => {
    const keys = [
      "malformedConfig",
      "unknownAction",
      "newerCatalogVersion",
      "unsupportedCatalogVersion",
      "legacyCatalogVersion",
      "deprecatedAction",
    ];
    for (const key of keys) {
      expect(english.StepEditor.diagnostics[key]).toBeTruthy();
      expect(italian.StepEditor.diagnostics[key]).toBeTruthy();
    }
  });
});
