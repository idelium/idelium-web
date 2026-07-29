import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import EnterpriseDataTable from "@/components/grid/EnterpriseDataTable.vue";

const copy = {
  actions: "Actions",
  clearFilters: "Clear filters",
  create: "Create record",
  moreActions: "More actions",
  refreshComplete: "Results refreshed.",
  retry: "Retry",
  preferences: {
    title: "Table preferences",
    density: "Density",
    columns: "Columns",
    comfortable: "Comfortable",
    compact: "Compact",
    spacious: "Spacious",
    moveUp: "Move up",
    moveDown: "Move down",
    reset: "Reset",
  },
  resultCount: "{count} results",
  scrollRegion: "Scrollable results table",
  selectPage: "Select this page",
  selectRow: "Select",
  states: {
    empty: { title: "No records", description: "Create one." },
    error: { title: "Unavailable", description: "Try again." },
    loading: { title: "Loading", description: "Please wait." },
    "no-results": {
      title: "No matching results",
      description: "Clear filters.",
    },
    permission: { title: "Permission required", description: "Contact admin." },
    stale: { title: "Stale results", description: "Refreshing." },
  },
};

const columns = [
  { key: "id", label: "ID", type: "technical" },
  { key: "name", label: "Name", sortable: true },
  { key: "token", label: "Token", sensitive: true },
];

function mountTable(props = {}) {
  return mount(EnterpriseDataTable, {
    props: {
      accessibleLabel: "Projects",
      columns,
      copy,
      rows: [
        { id: 10, name: "Checkout", token: "must-not-render" },
        { id: 11, name: "Search", token: "must-not-render" },
      ],
      ...props,
    },
    global: {
      stubs: {
        FontAwesomeIcon: { template: "<i />" },
      },
    },
  });
}

describe("EnterpriseDataTable", () => {
  it("uses stable row IDs and redacts protected cells", () => {
    const wrapper = mountTable();

    expect(wrapper.findAll("tbody tr")).toHaveLength(2);
    expect(wrapper.text()).not.toContain("must-not-render");
    expect(wrapper.text()).toContain("••••••••");
    expect(wrapper.attributes("aria-label")).toBe("Projects");
  });

  it("supports keyboard row activation and deterministic sorting", async () => {
    const wrapper = mountTable({
      sort: { field: "name", direction: "asc" },
    });

    await wrapper.find("tbody tr").trigger("keydown", { key: "Enter" });
    await wrapper.find(".enterprise-data-table__sort").trigger("click");

    expect(wrapper.emitted("row-activate")[0][0]).toMatchObject({ id: 10 });
    expect(wrapper.emitted("sort")[0][0]).toEqual({
      field: "name",
      direction: "desc",
    });
    expect(wrapper.find('th[aria-sort="ascending"]').exists()).toBe(true);
  });

  it("filters unauthorized actions and exposes accessible row labels", () => {
    const wrapper = mountTable({
      actions: [
        { id: "view", label: "View" },
        {
          id: "delete",
          label: "Delete",
          capability: "projects.delete",
          variant: "danger",
        },
      ],
      capabilities: [],
    });

    const buttons = wrapper.findAll(".enterprise-data-table__actions button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0].attributes("aria-label")).toBeUndefined();
    expect(wrapper.text()).not.toContain("Delete");
  });

  it("separates overflow actions and requests confirmation for high impact actions", async () => {
    const wrapper = mountTable({
      actions: [
        { id: "view", label: "View" },
        {
          id: "archive",
          label: "Archive",
          placement: "overflow",
          requiresConfirmation: true,
          variant: "danger",
        },
      ],
    });

    expect(
      wrapper.findAll(".enterprise-data-table__actions > button"),
    ).toHaveLength(2);
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(2);

    await wrapper.find('[role="menuitem"]').trigger("click");
    expect(wrapper.emitted("confirm-action")[0][0]).toMatchObject({
      action: "archive",
      row: { id: 10 },
    });
  });

  it("emits bounded page selection and renders empty feedback", async () => {
    const wrapper = mountTable({ selectable: true });
    await wrapper.find("thead input").setValue(true);

    expect(wrapper.emitted("selection-change")[0][0]).toEqual(["10", "11"]);

    await wrapper.setProps({ rows: [] });
    expect(wrapper.text()).toContain("No records");
    expect(wrapper.find("table").exists()).toBe(false);
  });

  it("distinguishes filtered no-results and exposes recovery actions", async () => {
    const wrapper = mountTable({
      rows: [],
      hasActiveFilters: true,
    });

    expect(wrapper.text()).toContain("No matching results");
    await wrapper.find(".enterprise-grid-state button").trigger("click");
    expect(wrapper.emitted("clear-filters")).toHaveLength(1);
  });

  it("keeps stale authorized rows visible after a refresh failure", async () => {
    const wrapper = mountTable({
      error: new Error("Network unavailable"),
      stale: true,
    });

    expect(wrapper.findAll("tbody tr")).toHaveLength(2);
    expect(wrapper.text()).toContain("Unavailable");
    await wrapper.find(".enterprise-grid-state button").trigger("click");
    expect(wrapper.emitted("retry")).toHaveLength(1);
  });

  it("applies and emits versioned column and density preferences", async () => {
    const wrapper = mountTable({
      preferencesEnabled: true,
      preferences: {
        visibleColumns: ["id", "name"],
        columnOrder: ["name", "id", "token"],
        density: "compact",
      },
    });

    expect(wrapper.classes()).toContain("enterprise-data-table--compact");
    expect(wrapper.findAll("thead th")[0].text()).toContain("Name");

    const radios = wrapper.findAll('input[type="radio"]');
    await radios[2].setValue(true);

    expect(wrapper.emitted("preferences-change")[0][0]).toMatchObject({
      schemaVersion: 1,
      density: "spacious",
      columnOrder: ["name", "id", "token"],
    });
  });
});
