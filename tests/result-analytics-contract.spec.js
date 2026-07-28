import { describe, expect, it } from "vitest";

import {
  buildAnalyticsQuery,
  canDownloadExport,
  failureTaxonomy,
  normalizeExportDescriptor,
  summarizeExecutionTrends,
} from "@/domain/resultAnalytics";

describe("result analytics contract", () => {
  it("summarizes pass rate, duration, queue time, taxonomy, and flaky tests", () => {
    const summary = summarizeExecutionTrends(
      [
        { id: 1, name: "login", status: 1, durationMs: 100, queueMs: 10 },
        {
          id: 1,
          name: "login",
          status: 2,
          durationMs: 300,
          queueMs: 30,
          diagnostic: "AssertionError: expected true",
        },
        {
          id: 2,
          name: "checkout",
          status: "failed",
          durationMs: 500,
          queueMs: 50,
          diagnostic: "connection refused",
        },
      ],
      { window: "14d", timezone: "Europe/Rome" },
    );

    expect(summary).toMatchObject({
      window: "14d",
      timezone: "Europe/Rome",
      count: 3,
      passRate: 0.3333,
      failureRate: 0.6667,
      averageDurationMs: 300,
      averageQueueMs: 30,
      failuresByClass: {
        assertion: 1,
        infrastructure: 0,
        timeout: 0,
        network: 1,
        unknown: 0,
      },
    });
    expect(summary.flakyTests).toEqual([
      { testId: 1, testName: "login", states: ["failed", "passed"] },
    ]);
  });

  it("classifies stable failure taxonomy without trusting arbitrary classes", () => {
    expect(
      failureTaxonomy([
        { status: "failed", errorClass: "timeout" },
        { status: "failed", diagnostic: "selenium grid worker crashed" },
        { status: "failed", diagnostic: "unmapped internal value" },
        { status: "passed", diagnostic: "expected ignored" },
      ]),
    ).toEqual({
      assertion: 0,
      infrastructure: 1,
      timeout: 1,
      network: 0,
      unknown: 1,
    });
  });

  it("builds bounded shareable analytics queries", () => {
    const query = buildAnalyticsQuery({
      projectId: "3",
      testCycleId: 2,
      window: "30d",
      timezone: "Europe/Rome",
      statuses: ["passed", "failed", "not-a-state"],
    });

    expect(query.get("projectId")).toBe("3");
    expect(query.get("testCycleId")).toBe("2");
    expect(query.get("window")).toBe("30d");
    expect(query.get("timezone")).toBe("Europe/Rome");
    expect(query.getAll("status")).toEqual(["passed", "failed"]);
  });

  it("normalizes asynchronous export descriptors before download", () => {
    const descriptor = normalizeExportDescriptor({
      id: "run 44",
      format: "JUnit",
      status: "completed",
      url: "/api/reports/44.xml",
      expiresAt: "2026-07-29T00:00:00Z",
      authorized: true,
    });

    expect(descriptor).toEqual({
      id: "run-44",
      format: "junit",
      status: "completed",
      url: "/api/reports/44.xml",
      expiresAt: "2026-07-29T00:00:00.000Z",
      authorized: true,
    });
    expect(
      canDownloadExport(descriptor, new Date("2026-07-28T00:00:00Z")),
    ).toBe(true);
    expect(
      canDownloadExport(descriptor, new Date("2026-07-30T00:00:00Z")),
    ).toBe(false);
  });

  it("blocks unsafe or unauthorized export downloads", () => {
    expect(
      normalizeExportDescriptor({
        status: "completed",
        url: "https://evil.example/report.csv",
        authorized: true,
      }).url,
    ).toBeNull();
    expect(canDownloadExport({ status: "completed", url: "/report.csv" })).toBe(
      false,
    );
  });
});
