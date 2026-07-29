import { describe, expect, it } from "vitest";

import {
  boundedLiveRunAnnouncements,
  createLivePollingState,
  filterLiveRuns,
  liveRunStatusVariant,
  mergeLiveRunWindow,
  nextLivePollingDelay,
  nextLivePollingState,
  normalizeLiveRun,
  normalizeTransportDiagnostic,
  shouldContinueLivePolling,
} from "@/domain/liveRuns";

describe("live runs workspace contract", () => {
  const now = new Date("2026-07-29T12:00:00Z");

  it("normalizes operational run metadata with stale telemetry flags", () => {
    const run = normalizeLiveRun(
      {
        activeWorkers: 2,
        cycleName: "Nightly",
        id: 17,
        lastUpdateAt: "2026-07-29T11:58:00Z",
        requestedConcurrency: 4,
        status: "running",
        target: "selenium-grid",
      },
      { now, projectId: 3 },
    );

    expect(run).toMatchObject({
      activeConcurrency: 2,
      canCancel: true,
      canOpenDetails: true,
      cycle: { name: "Nightly" },
      degraded: true,
      projectId: "3",
      requestedConcurrency: 4,
      stale: true,
      status: "running",
      target: "selenium-grid",
    });
  });

  it("does not regress progress when live updates arrive out of order", () => {
    const merged = mergeLiveRunWindow(
      [
        {
          id: "run-1",
          lastUpdateAt: "2026-07-29T11:59:59Z",
          progress: { completed: 7, total: 10 },
          sequenceId: 8,
          status: "running",
        },
      ],
      [
        {
          id: "run-1",
          lastUpdateAt: "2026-07-29T11:59:58Z",
          progress: { completed: 3, total: 10 },
          sequenceId: 9,
          status: "running",
        },
      ],
      { now },
    );

    expect(merged[0].progress).toEqual({
      completed: 7,
      percent: 70,
      total: 10,
    });
  });

  it("filters authorized project/status windows and bounds high-frequency data", () => {
    const runs = mergeLiveRunWindow(
      [],
      Array.from({ length: 60 }, (_, index) => ({
        id: `run-${index}`,
        lastUpdateAt: `2026-07-29T11:59:${String(index % 60).padStart(2, "0")}Z`,
        projectId: index % 2 === 0 ? 3 : 4,
        status: index % 3 === 0 ? "running" : "completed",
      })),
      { now, windowSize: 40 },
    );

    expect(runs).toHaveLength(40);
    expect(
      filterLiveRuns(runs, { projectId: 3, statuses: ["running"] }).every(
        (run) => run.projectId === "3" && run.status === "running",
      ),
    ).toBe(true);
  });

  it("provides accessible bounded announcements and non-color variants", () => {
    const announcements = boundedLiveRunAnnouncements(
      [
        {
          cycleName: "A",
          progress: { completed: 1, total: 2 },
          status: "running",
        },
        {
          cycleName: "B",
          progress: { completed: 2, total: 2 },
          status: "completed",
        },
        {
          cycleName: "C",
          progress: { completed: 0, total: 1 },
          status: "failed",
        },
        {
          cycleName: "D",
          progress: { completed: 0, total: 1 },
          status: "queued",
        },
      ],
      { failed: "Failed", passed: "Passed", running: "Running" },
      2,
    );

    expect(announcements).toEqual(["A: Running, 1/2", "B: Passed, 2/2"]);
    expect(liveRunStatusVariant("failed")).toBe("danger");
    expect(liveRunStatusVariant("mystery")).toBe("secondary");
  });

  it("backs off bounded polling and slows hidden tabs", () => {
    expect(
      nextLivePollingDelay({
        attempt: 2,
        baseDelayMs: 1000,
        hidden: false,
        jitterSeed: 0,
      }),
    ).toBe(4000);
    expect(
      nextLivePollingDelay({
        attempt: 2,
        baseDelayMs: 1000,
        hidden: true,
        jitterSeed: 0,
      }),
    ).toBe(16000);
    expect(
      nextLivePollingDelay({
        attempt: 99,
        baseDelayMs: 5000,
        hidden: true,
        jitterSeed: 1,
      }),
    ).toBe(60000);
  });

  it("resets polling after success and redacts transport diagnostics", () => {
    const failed = nextLivePollingState(createLivePollingState(), {
      baseDelayMs: 1000,
      error: {
        code: "ERR_NETWORK",
        message: "token=abc123 authorization Bearer abc123 failed",
        status: 503,
      },
      jitterSeed: 0,
    });

    expect(failed).toMatchObject({
      attempt: 1,
      degraded: true,
      lastError: {
        code: "ERR_NETWORK",
        message: "token=[REDACTED] authorization Bearer [REDACTED] failed",
        status: 503,
      },
      nextDelayMs: 2000,
      transport: "polling",
    });
    expect(
      nextLivePollingState(failed, { baseDelayMs: 1000, jitterSeed: 0 }),
    ).toMatchObject({
      attempt: 0,
      degraded: false,
      lastError: null,
      nextDelayMs: 1000,
    });
    expect(
      normalizeTransportDiagnostic({ message: "cookie=session123" }).message,
    ).toBe("cookie=[REDACTED]");
  });

  it("stops polling on terminal-only windows or route exit", () => {
    expect(
      shouldContinueLivePolling([{ id: 1, status: "passed" }], {
        routeActive: true,
      }),
    ).toBe(false);
    expect(
      shouldContinueLivePolling([{ id: 1, status: "running" }], {
        routeActive: true,
      }),
    ).toBe(true);
    expect(
      shouldContinueLivePolling([{ id: 1, status: "running" }], {
        routeActive: false,
      }),
    ).toBe(false);
  });
});
