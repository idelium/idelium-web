import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import EnterpriseDataTable from "@/components/grid/EnterpriseDataTable.vue";
import {
  boundedLocalRows,
  buildGridQuery,
  getGridRowIdentity,
  mergeGridRouteState,
} from "@/domain/enterpriseGrid";
import {
  ENTERPRISE_GRID_FIXTURE_SIZES,
  MALFORMED_ENTERPRISE_GRID_ROWS,
  enterpriseGridRows,
} from "./fixtures/enterpriseGrid";

const CI_THRESHOLDS_MS = Object.freeze({
  contractInteractions: 500,
  renderOneThousand: 3_000,
  selection: 250,
});

const copy = {
  actions: "Actions",
  bulk: {
    title: "Bulk actions",
    selected: "{count} rows selected",
    allSelected: "All {count} rows selected",
    selectAll: "Select all {count} rows",
    clear: "Clear selection",
  },
  clearFilters: "Clear filters",
  create: "Create record",
  moreActions: "More actions",
  refreshComplete: "Results refreshed.",
  retry: "Retry",
  resultCount: "{count} results",
  scrollRegion: "Scrollable results table",
  selectPage: "Select this page",
  selectRow: "Select",
  states: {
    empty: { title: "No records", description: "Create one." },
    error: { title: "Unavailable", description: "Try again." },
    loading: { title: "Loading", description: "Please wait." },
    "no-results": { title: "No results", description: "Clear filters." },
    permission: { title: "Permission required", description: "Contact admin." },
    stale: { title: "Stale results", description: "Refreshing." },
  },
};

const columns = [
  { key: "id", label: "ID", required: true, type: "technical" },
  { key: "name", label: "Name", sortable: true },
  { key: "status", label: "Status", type: "status" },
];

describe("EnterpriseDataTable performance and scale", () => {
  it("provides deterministic fixtures for supported and malformed sizes", () => {
    expect(ENTERPRISE_GRID_FIXTURE_SIZES).toEqual([0, 1, 100, 1_000]);
    for (const size of ENTERPRISE_GRID_FIXTURE_SIZES) {
      expect(enterpriseGridRows(size)).toHaveLength(size);
    }
    expect(() => getGridRowIdentity(MALFORMED_ENTERPRISE_GRID_ROWS[2])).toThrow(
      "stable identity",
    );
  });

  it("keeps route, filter, sort, and pagination interactions within the CI threshold", () => {
    const started = performance.now();
    for (let index = 0; index < 1_000; index += 1) {
      const state = {
        page: index + 1,
        pageSize: 25,
        search: `record ${index}`,
        sort: { field: "name", direction: index % 2 ? "asc" : "desc" },
        filters: { status: index % 2 ? "active" : "inactive" },
      };
      buildGridQuery({ ...state, allowedSorts: ["name"] });
      mergeGridRouteState(
        { page: String(index + 1), q: state.search },
        { filters: state.filters, sort: state.sort },
        { allowedFilters: ["status"], allowedSorts: ["name"] },
      );
    }
    expect(performance.now() - started).toBeLessThan(
      CI_THRESHOLDS_MS.contractInteractions,
    );
  });

  it("renders 1,000 bounded rows without unbounded DOM growth", () => {
    const started = performance.now();
    const wrapper = mount(EnterpriseDataTable, {
      props: {
        accessibleLabel: "Large project list",
        columns,
        copy,
        localLimit: 10_000,
        rows: enterpriseGridRows(1_100),
      },
      global: {
        stubs: { FontAwesomeIcon: { template: "<i />" } },
      },
    });
    const duration = performance.now() - started;

    expect(wrapper.findAll("tbody tr")).toHaveLength(1_000);
    expect(duration).toBeLessThan(CI_THRESHOLDS_MS.renderOneThousand);
    wrapper.unmount();
  });

  it("selects a bounded page within the interaction threshold", () => {
    const rows = enterpriseGridRows(1_000);
    const started = performance.now();
    const selected = new Set();
    for (const row of boundedLocalRows(rows)) {
      selected.add(getGridRowIdentity(row));
    }

    expect(selected.size).toBe(1_000);
    expect(performance.now() - started).toBeLessThan(
      CI_THRESHOLDS_MS.selection,
    );
  });
});
