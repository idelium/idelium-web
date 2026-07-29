import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import {
  executionRunFixtures,
  largePostmanHierarchyFixture,
  largeRunHistoryFixture,
} from "./fixtures/executionObservability";
import EnterpriseDataTable from "@/components/grid/EnterpriseDataTable.vue";
import {
  normalizeExecutionSummary,
  normalizeExecutionTests,
} from "@/domain/executionContracts";
import {
  filterLiveRuns,
  mergeLiveRunWindow,
  normalizeLiveRun,
} from "@/domain/liveRuns";
import { runDetailRoute } from "@/domain/runDetailOverview";
import { normalizeRunDrilldown } from "@/domain/runDrilldown";
import {
  fullArtifactRoute,
  normalizeArtifactDescriptor,
} from "@/domain/secureArtifacts";

describe("execution observability scale, accessibility, and security regressions", () => {
  it("normalizes every operational fixture without rendering failures as passed", () => {
    const statuses = executionRunFixtures.map((fixture) =>
      normalizeLiveRun(fixture),
    );

    expect(statuses.map((run) => run.status)).toEqual([
      "queued",
      "running",
      "cancelling",
      "passed",
      "failed",
      "failed",
      "unknown",
      "unknown",
      "passed",
    ]);
    expect(
      normalizeExecutionSummary({
        tests: [
          {
            assertions: [{ name: "failed assertion", passed: false }],
            name: "Postman",
          },
        ],
      }).status,
    ).toBe("failed");
    expect(normalizeExecutionTests([{ status: "interrupted" }])[0].status).toBe(
      "failed",
    );
  });

  it("keeps large live windows and drill-down hierarchies bounded", () => {
    const startedAt = performance.now();
    const liveWindow = mergeLiveRunWindow([], largeRunHistoryFixture(1_200), {
      projectId: 9,
      windowSize: 75,
    });
    const drilldown = normalizeRunDrilldown(largePostmanHierarchyFixture(700), {
      limit: 500,
    });
    const elapsedMs = performance.now() - startedAt;

    const tenantWindow = filterLiveRuns(liveWindow, {
      projectId: 9,
      statuses: ["running", "failed"],
    });

    expect(liveWindow).toHaveLength(75);
    expect(tenantWindow.every((run) => run.projectId === "9")).toBe(true);
    expect(drilldown.nodes).toHaveLength(500);
    expect(drilldown.truncated).toBe(true);
    expect(elapsedMs).toBeLessThan(250);
  });

  it("rejects forged artifact identifiers and preserves tenant-scoped routes", () => {
    const forgedArtifact = normalizeArtifactDescriptor(
      {
        downloadUrl: "/api/projects/10/runs/44/artifacts/secret",
        id: "../../tenant-10/secret",
        projectId: 10,
        runId: 44,
      },
      { projectId: 9, runId: 44 },
    );

    expect(forgedArtifact.download.authorized).toBe(false);
    expect(forgedArtifact.download.url).toBe(
      "/api/projects/10/runs/44/artifacts/secret",
    );
    expect(
      fullArtifactRoute({
        artifactId: "../../tenant-10/secret",
        projectId: 9,
        runId: 44,
      }),
    ).toEqual({
      name: "execution-detail",
      params: { projectId: "9", runId: "44" },
      query: { artifactId: "..-..-tenant-10-secret", tab: "artifacts" },
    });
    expect(runDetailRoute({ projectId: 9, runId: "../../44" })).toEqual({
      name: "execution-detail",
      params: { projectId: "9", runId: "..-..-44" },
      query: { tab: "overview" },
    });
  });

  it("keeps critical execution table controls keyboard and screen-reader reachable", async () => {
    const wrapper = mount(EnterpriseDataTable, {
      props: {
        actions: [
          {
            id: "details",
            label: "View details",
            variant: "secondary",
          },
        ],
        accessibleLabel: "Execution history",
        columns: [
          { key: "id", label: "ID", sortable: true, type: "text" },
          { key: "status", label: "Status", sortable: true, type: "badge" },
        ],
        copy: {
          actions: "Actions",
          moreActions: "More actions",
          resultCount: "{count} results",
          scrollRegion: "Scrollable execution history",
          selectPage: "Select this page",
          selectRow: "Select",
          states: {
            empty: { description: "No runs.", title: "No runs" },
          },
        },
        rows: [
          { id: "run-1", rowLabel: "Run 1", status: "failed" },
          { id: "run-2", rowLabel: "Run 2", status: "passed" },
        ],
      },
    });

    expect(
      wrapper.get(".enterprise-data-table__viewport").attributes("aria-label"),
    ).toBe("Scrollable execution history");
    expect(wrapper.findAll("button").length).toBeGreaterThanOrEqual(3);
    await wrapper.get("th button").trigger("click");
    await wrapper.get("tbody tr").trigger("keydown.enter");
    await wrapper.get("tbody button").trigger("click");
    expect(wrapper.emitted("sort")).toBeTruthy();
    expect(wrapper.emitted("row-activate")).toBeTruthy();
    expect(wrapper.emitted("action")).toBeTruthy();
  });
});
