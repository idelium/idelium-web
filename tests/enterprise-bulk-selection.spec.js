import { describe, expect, it } from "vitest";

import { useEnterpriseBulkSelection } from "@/composables/useEnterpriseBulkSelection";
import {
  createGridSelectionScope,
  normalizeGridBulkActions,
} from "@/domain/enterpriseGrid";

describe("enterprise bulk selection", () => {
  it("clears selection whenever tenant, project, table, or query scope changes", () => {
    const selection = useEnterpriseBulkSelection("scope-a");
    selection.setPageSelection([1, 2]);

    selection.updateScope("scope-b");

    expect(selection.selectedIds.value).toEqual([]);
    expect(selection.allResultsSelected.value).toBe(false);
    expect(selection.querySnapshotId.value).toBeNull();
  });

  it("requires a validated server snapshot for all-results selection", () => {
    const selection = useEnterpriseBulkSelection("scope-a");

    expect(() => selection.selectAllResults({ total: 200 })).toThrow(
      "validated server query snapshot",
    );
    selection.selectAllResults({ id: "snapshot-1", total: 200 });
    expect(selection.allResultsSelected.value).toBe(true);
    expect(selection.querySnapshotId.value).toBe("snapshot-1");
  });

  it("creates a deterministic tenant-scoped query identity", () => {
    const scope = createGridSelectionScope({
      tenantId: 7,
      projectId: 42,
      gridName: "steps",
      query: {
        page: 3,
        search: "checkout",
        sort: { field: "name", direction: "asc" },
        filters: { status: "active" },
      },
      allowedFilters: ["status"],
      allowedSorts: ["name"],
    });

    expect(JSON.parse(scope)).toEqual({
      tenantId: "7",
      projectId: "42",
      gridName: "steps",
      query: {
        page: "3",
        q: "checkout",
        sort: "name",
        direction: "asc",
        "f.status": "active",
      },
    });
  });

  it("exposes only actions valid for every selected authorized entity", () => {
    const actions = normalizeGridBulkActions(
      [
        { id: "export", label: "Export", capability: "resources.read" },
        {
          id: "archive",
          label: "Archive",
          capability: "resources.manage",
          availableFor: (row) => row.archivable,
        },
      ],
      ["resources.read", "resources.manage"],
      [
        { id: 1, archivable: true },
        { id: 2, archivable: false },
      ],
    );

    expect(actions.map((action) => action.id)).toEqual(["export"]);
  });
});
