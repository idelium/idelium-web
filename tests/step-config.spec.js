import { describe, expect, it } from "vitest";

import { normalizeEditableStepConfig } from "@/domain/stepConfig";

describe("editable step configuration", () => {
  it("keeps legacy wizard step configurations editable", () => {
    const normalized = normalizeEditableStepConfig(
      JSON.stringify({
        name: "Legacy step",
        failedExit: false,
        attachScreenshot: true,
        steps: [{ stepType: "open_browser", note: "Open browser" }],
      }),
    );

    expect(normalized.name).toBe("Legacy step");
    expect(normalized.failedExit).toBe(false);
    expect(normalized.attachScreenshot).toBe(true);
    expect(normalized.steps).toEqual([
      {
        stepType: "open_browser",
        note: "Open browser",
        runtime: "selenium",
      },
    ]);
  });

  it("wraps schema-driven Selenium steps for the wizard editor", () => {
    const normalized = normalizeEditableStepConfig(
      JSON.stringify({
        runtime: "selenium",
        schemaVersion: "selenium.webdriver.v2",
        command: "click",
        target: "#submit",
      }),
      "Submit button",
    );

    expect(normalized.name).toBe("Submit button");
    expect(normalized.editorType).toBe("selenium");
    expect(normalized.steps).toEqual([
      expect.objectContaining({
        stepType: "selenium_command",
        runtime: "selenium",
        operation: "click",
        target: "#submit",
      }),
    ]);
  });

  it("wraps schema-driven Postman payloads for the wizard editor", () => {
    const normalized = normalizeEditableStepConfig({
      runtime: "postman",
      schemaVersion: "postman.safe.v1",
      info: { name: "Echo collection" },
      item: [],
    });

    expect(normalized.editorType).toBe("postman");
    expect(normalized.steps[0]).toEqual(
      expect.objectContaining({
        stepType: "postman_collection",
        runtime: "postman",
        collection: expect.objectContaining({
          collection: expect.objectContaining({
            info: { name: "Echo collection" },
          }),
        }),
      }),
    );
  });
});
