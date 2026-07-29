import { describe, expect, it } from "vitest";

import {
  buildRunHistoryQuery,
  createRunHistorySavedView,
  hasProtectedRunHistoryFilterValue,
  migrateRunHistorySavedView,
  normalizeRunHistoryFilters,
  queryToRunHistoryFilters,
} from "@/domain/runHistory";

describe("run history filters and saved views", () => {
  it("builds bounded tenant-scoped shareable queries without protected values", () => {
    const query = buildRunHistoryQuery(
      {
        author: "qa.owner@example.org",
        page: 2,
        pageSize: 500,
        sort: "startedAt",
        status: "running,failed,not-real",
        tag: "release-smoke",
        target: "selenium-grid",
      },
      { projectId: 9 },
    );

    expect(query.get("projectId")).toBe("9");
    expect(query.get("pageSize")).toBe("100");
    expect(query.get("sort")).toBe("startedAt");
    expect(query.getAll("status")).toEqual(["running", "failed"]);
    expect(query.toString()).not.toContain("token");
  });

  it("documents timezone boundaries as inclusive UTC instants plus source zone", () => {
    const filters = normalizeRunHistoryFilters({
      fromInclusive: "2026-07-01",
      timezone: "Europe/Rome",
      toInclusive: "2026-07-29",
    });

    expect(filters.fromInclusive).toBe("2026-07-01T00:00:00.000Z[Europe/Rome]");
    expect(filters.toInclusive).toBe("2026-07-29T23:59:59.999Z[Europe/Rome]");
  });

  it("round-trips canonical URL query filters", () => {
    const filters = queryToRunHistoryFilters(
      {
        cycleId: "12",
        direction: "asc",
        failureClass: "network",
        page: "3",
        status: ["failed", "blocked"],
      },
      { projectId: 9 },
    );

    expect(filters).toMatchObject({
      cycleId: 12,
      failureClass: "network",
      page: 3,
      projectId: 9,
      statuses: ["failed", "blocked"],
      sort: { direction: "asc", field: "updatedAt" },
    });
  });

  it("migrates saved views after filter renames", () => {
    const view = migrateRunHistorySavedView(
      {
        filters: {
          cycle: "7",
          env: "4",
          from: "2026-07-01",
          status: "failed",
          user: "qa@example.org",
        },
        name: "Failures",
      },
      { owner: "admin@idelium.org", projectId: 9 },
    );

    expect(view).toMatchObject({
      name: "Failures",
      owner: "admin@idelium.org",
      filters: {
        author: "qa@example.org",
        cycleId: 7,
        environmentId: 4,
        projectId: 9,
        statuses: ["failed"],
      },
    });
    expect(view.filters.fromInclusive).toBe("2026-07-01T00:00:00.000Z[UTC]");
  });

  it("rejects protected saved-view content", () => {
    expect(hasProtectedRunHistoryFilterValue({ tag: "token=abc" })).toBe(true);
    expect(() =>
      createRunHistorySavedView({
        filters: { tag: "token=abc" },
        name: "Bad view",
      }),
    ).not.toThrow();
    expect(
      createRunHistorySavedView({
        filters: { tag: "release" },
        name: "Release",
      }).filters.tag,
    ).toBe("release");
  });
});
