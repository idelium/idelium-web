import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import EntityPicker from "@/components/sequence/EntityPicker.vue";
import english from "@/languages/english";

const states = {
  empty: { title: "Empty", description: "No items." },
  error: { title: "Error", description: "Try again." },
  loading: { title: "Loading", description: "Loading." },
  "no-results": { title: "No results", description: "Clear filters." },
  permission: { title: "Forbidden", description: "Not allowed." },
  stale: { title: "Stale", description: "Refresh." },
};

function mountPicker(overrides = {}) {
  return mount(EntityPicker, {
    props: {
      accessibleLabel: "Available steps",
      copy: { ...english.SequenceBuilder.picker, states },
      items: [
        {
          identity: "step:1",
          name: "Open browser",
          status: "active",
          disabledReason: null,
          metadata: { runtime: "selenium", owner: "QA" },
        },
        {
          identity: "step:2",
          name: "Archived login",
          status: "archived",
          disabledReason: "sequence.referenceMissing",
          metadata: { runtime: "selenium" },
        },
      ],
      meta: {
        page: 1,
        lastPage: 2,
        total: 2,
        hasPreviousPage: false,
        hasNextPage: true,
      },
      metadataLabels: english.SequenceBuilder.metadata,
      query: { page: 1, search: "", filters: {} },
      selectedIds: [],
      ...overrides,
    },
    global: {
      stubs: { fontAwesomeIcon: true },
    },
  });
}

describe("EntityPicker", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders safe metadata and explains ineligible items", () => {
    const wrapper = mountPicker();

    expect(wrapper.text()).toContain("Runtime: selenium");
    expect(wrapper.text()).toContain("Owner: QA");
    expect(wrapper.text()).toContain("This item is missing or unavailable.");
    expect(
      wrapper.findAll('input[type="checkbox"]')[1].attributes("disabled"),
    ).toBe("");
  });

  it("keeps selection stable by identity across page refreshes", async () => {
    const wrapper = mountPicker({ selectedIds: ["step:1"] });
    expect(wrapper.findAll('input[type="checkbox"]')[0].element.checked).toBe(
      true,
    );

    await wrapper.setProps({
      items: [
        {
          identity: "step:3",
          name: "Submit",
          status: "active",
          metadata: {},
        },
      ],
    });
    await wrapper.setProps({
      items: [
        {
          identity: "step:1",
          name: "Open browser",
          status: "active",
          metadata: {},
        },
      ],
    });

    expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(true);
  });

  it("debounces bounded search and resets the page", async () => {
    vi.useFakeTimers();
    const wrapper = mountPicker();
    const search = wrapper.get('input[type="search"]');

    await search.setValue("login");
    await vi.advanceTimersByTimeAsync(249);
    expect(wrapper.emitted("query-change")).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);

    expect(wrapper.emitted("query-change")[0][0]).toEqual({
      page: 1,
      search: "login",
      filters: {},
    });
  });

  it("emits filter and pagination queries without losing other state", async () => {
    const wrapper = mountPicker({
      filters: [
        {
          key: "runtime",
          label: "Runtime",
          options: [{ value: "selenium", label: "Selenium" }],
        },
      ],
      query: { page: 1, search: "login", filters: {} },
    });

    await wrapper.get("select").setValue("selenium");
    await wrapper.findAll("button").at(-1).trigger("click");

    expect(wrapper.emitted("query-change")[0][0]).toEqual({
      page: 1,
      search: "login",
      filters: { runtime: "selenium" },
    });
    expect(wrapper.emitted("query-change")[1][0]).toEqual({
      page: 2,
      search: "login",
      filters: {},
    });
  });
});
