import { describe, expect, it } from "vitest";

import {
  drilldownSelectionRoute,
  normalizeDrilldownSelection,
  normalizeRunDrilldown,
} from "@/domain/runDrilldown";

describe("run drill-down adapters", () => {
  it("normalizes Postman request, assertion, and response descriptors", () => {
    const drilldown = normalizeRunDrilldown([
      {
        id: 17,
        name: "Postman smoke",
        type: "postman",
        data: [
          {
            assertions: [
              { name: "status is 200", passed: true },
              {
                message: "expected false to be truthy",
                name: "cookie",
                passed: false,
              },
            ],
            method: "POST",
            name: "Create token",
            status: 200,
            time: 130,
            url: "https://postman-echo.com/post",
          },
        ],
      },
    ]);

    expect(drilldown.nodes[0]).toMatchObject({
      id: "test:17",
      level: "test",
      status: "failed",
    });
    expect(drilldown.nodes[1]).toMatchObject({
      level: "step",
      method: "POST",
      name: "Create token",
      responseStatus: 200,
      status: "failed",
      url: "https://postman-echo.com/post",
    });
    expect(drilldown.nodes[3]).toMatchObject({
      level: "assertion",
      status: "failed",
      failure: { message: "expected false to be truthy" },
    });
  });

  it("normalizes Selenium and Appium command variants with diagnostic context", () => {
    const drilldown = normalizeRunDrilldown([
      {
        id: "selenium-1",
        runtime: "selenium",
        steps: [
          {
            assertions: [{ name: "visible", passed: true }],
            durationMs: 40,
            id: "open",
            name: "Open browser",
            status: "completed",
          },
        ],
      },
      {
        id: "appium-1",
        runtime: "appium",
        steps: [
          {
            command: "tap login",
            error: "device is not reachable",
            id: "tap",
            retryable: true,
            status: "failed",
          },
        ],
      },
    ]);

    expect(drilldown.nodes.map((node) => node.runtime)).toContain("selenium");
    expect(drilldown.nodes.map((node) => node.runtime)).toContain("appium");
    expect(
      drilldown.nodes.find((node) => node.id === "test:appium-1").status,
    ).toBe("failed");
    expect(
      drilldown.nodes.find((node) => node.id === "step:appium-1:tap").failure,
    ).toMatchObject({ message: "device is not reachable", retryable: true });
  });

  it("bounds large result sets and persists route-backed selection", () => {
    const drilldown = normalizeRunDrilldown(
      Array.from({ length: 20 }, (_, index) => ({
        id: index + 1,
        steps: [{ id: "step", status: "passed" }],
      })),
      { limit: 5 },
    );

    expect(drilldown.nodes).toHaveLength(5);
    expect(drilldown.truncated).toBe(true);
    expect(normalizeDrilldownSelection("step 17")).toBe("step-17");
    expect(
      drilldownSelectionRoute({
        detailId: "step 17",
        projectId: 9,
        runId: 44,
        tab: "tests",
      }),
    ).toEqual({
      name: "execution-detail",
      params: { projectId: "9", runId: "44" },
      query: { detailId: "step-17", tab: "tests" },
    });
  });

  it("redacts protected diagnostics", () => {
    const drilldown = normalizeRunDrilldown([
      {
        id: 1,
        steps: [
          {
            message: "Authorization: Bearer secret",
            status: "failed",
          },
        ],
      },
    ]);

    expect(JSON.stringify(drilldown)).not.toContain("Bearer secret");
    expect(JSON.stringify(drilldown)).toContain("[REDACTED]");
  });
});
