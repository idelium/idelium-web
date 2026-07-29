import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import EnterpriseListingGrid from "@/components/grid/EnterpriseListingGrid.vue";

const listingCopy = {
  nextPage: "Next",
  pageStatus: "Page {page} of {pages}",
  paginationLabel: "Result pages",
  previousPage: "Previous",
  searchLabel: "Search",
  searchPlaceholder: "Search records",
};

const tableCopy = {
  actions: "Actions",
  bulk: {
    allSelected: "All {count}",
    clear: "Clear",
    selectAll: "Select all {count}",
    selected: "{count} selected",
    title: "Bulk actions",
  },
  clearFilters: "Clear filters",
  moreActions: "More actions",
  preferences: {},
  refreshComplete: "Refreshed",
  resultCount: "{count} results",
  retry: "Retry",
  states: {
    empty: { title: "Empty", description: "No records" },
  },
};

describe("EnterpriseListingGrid", () => {
  it("emits bounded navigation and search events", async () => {
    const wrapper = mount(EnterpriseListingGrid, {
      props: {
        accessibleLabel: "Projects",
        columns: [{ key: "name", label: "Name" }],
        listingCopy,
        meta: {
          page: 2,
          lastPage: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
        rows: [{ id: 1, name: "Demo" }],
        tableCopy,
      },
    });

    await wrapper.get('input[type="search"]').setValue("postman");
    expect(wrapper.emitted("update:search")?.[0]).toEqual(["postman"]);
    expect(wrapper.emitted("search")?.[0]).toEqual(["postman"]);

    const buttons = wrapper.findAll("nav button");
    await buttons[0].trigger("click");
    await buttons[1].trigger("click");
    expect(wrapper.emitted("page-change")).toEqual([[1], [3]]);
    expect(wrapper.text()).toContain("Page 2 of 3");
  });
});
