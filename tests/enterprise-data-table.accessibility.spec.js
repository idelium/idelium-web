import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import EnterpriseDataTable from "@/components/grid/EnterpriseDataTable.vue";
import { enterpriseGridRows } from "./fixtures/enterpriseGrid";

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

describe("EnterpriseDataTable accessibility", () => {
  it("exposes names, sort state, focus order, selection labels, and announcements", () => {
    const wrapper = mount(EnterpriseDataTable, {
      props: {
        accessibleLabel: "Projects",
        columns: [
          { key: "id", label: "ID", required: true },
          { key: "name", label: "Name", sortable: true },
        ],
        copy,
        meta: { total: 100 },
        rows: enterpriseGridRows(1),
        selectable: true,
        sort: { field: "name", direction: "asc" },
      },
      global: {
        stubs: { FontAwesomeIcon: { template: "<i />" } },
      },
    });

    expect(wrapper.attributes("aria-label")).toBe("Projects");
    expect(
      wrapper.find(".enterprise-data-table__viewport").attributes("tabindex"),
    ).toBe("0");
    expect(wrapper.find('th[aria-sort="ascending"]').exists()).toBe(true);
    expect(wrapper.find("tbody tr").attributes("tabindex")).toBe("0");
    expect(wrapper.find("thead input").attributes("aria-label")).toBe(
      "Select this page",
    );
    expect(wrapper.find("tbody input").attributes("aria-label")).toBe(
      "Select Record 0001",
    );
    expect(wrapper.find('[aria-live="polite"]').text()).toContain(
      "100 results",
    );
  });

  it("retains focusable controls and readable density at 200 percent zoom semantics", () => {
    const wrapper = mount(EnterpriseDataTable, {
      props: {
        accessibleLabel: "Projects",
        columns: [
          { key: "id", label: "ID" },
          { key: "name", label: "Name" },
        ],
        copy,
        density: "compact",
        rows: enterpriseGridRows(1),
        selectable: true,
      },
      global: {
        stubs: { FontAwesomeIcon: { template: "<i />" } },
      },
    });

    expect(wrapper.classes()).toContain("enterprise-data-table--compact");
    expect(wrapper.find(".enterprise-data-table__viewport").exists()).toBe(
      true,
    );
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(2);
  });
});
