import { describe, expect, it } from "vitest";

import {
  normalizeRunDetailOverview,
  normalizeRunDetailTab,
  runDetailRoute,
} from "@/domain/runDetailOverview";

describe("canonical run detail overview", () => {
  it("normalizes durable identity, outcome, ownership, timings, and redacted config", () => {
    const overview = normalizeRunDetailOverview(
      {
        activeConcurrency: 1,
        configuration: {
          browser: "chrome",
          token: "secret",
        },
        correlationId: "corr-1",
        cycle: { id: 7, name: "release", version: "v2" },
        environment: { code: "demo", id: 3, version: "2026.07" },
        id: 44,
        initiator: "qa@example.org",
        projectId: 9,
        requestedConcurrency: 2,
        startedAt: "2026-07-29T12:00:00Z",
        status: "completed",
        target: { id: "grid", name: "Selenium Grid", version: "4.46" },
      },
      { projectId: 9 },
    );

    expect(overview).toMatchObject({
      authorized: true,
      correlationId: "corr-1",
      cycle: { name: "release", snapshot: false, version: "v2" },
      environment: { name: "demo", version: "2026.07" },
      id: "44",
      initiator: "qa@example.org",
      projectId: "9",
      status: "passed",
      target: { name: "Selenium Grid" },
    });
    expect(overview.concurrency).toEqual({ active: 1, requested: 2 });
    expect(overview.configuration).toEqual({
      browser: "chrome",
      token: "[REDACTED]",
    });
    expect(overview.reproducibilityCommand).toBe(
      "idelium --idCycle=7 --idProject=9 --environment=demo",
    );
  });

  it("keeps deleted assets visible through snapshots and degrades partial fields", () => {
    const overview = normalizeRunDetailOverview(
      {
        cycleSnapshot: { id: 7, name: "old cycle", revision: "archived" },
        status: "mystery",
      },
      { projectId: 9, runId: 44 },
    );

    expect(overview.id).toBe("44");
    expect(overview.cycle).toEqual({
      id: "7",
      name: "old cycle",
      snapshot: true,
      version: "archived",
    });
    expect(overview.status).toBe("unknown");
    expect(overview.partial).toBe(true);
  });

  it("persists active tab and selected detail on a reload-safe route", () => {
    expect(normalizeRunDetailTab("logs")).toBe("logs");
    expect(normalizeRunDetailTab("unsafe")).toBe("overview");
    expect(
      runDetailRoute({
        detailId: "step 17",
        projectId: 9,
        runId: 44,
        tab: "artifacts",
      }),
    ).toEqual({
      name: "execution-detail",
      params: { projectId: "9", runId: "44" },
      query: { detailId: "step-17", tab: "artifacts" },
    });
  });

  it("does not disclose unauthorized detail content", () => {
    const overview = normalizeRunDetailOverview(
      { authorized: false, id: 44, status: "failed" },
      { authorized: false, projectId: 9 },
    );

    expect(overview.authorized).toBe(false);
    expect(JSON.stringify(overview)).not.toContain("secret");
  });
});
