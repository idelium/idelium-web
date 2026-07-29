import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import EntityPicker from "@/components/sequence/EntityPicker.vue";
import SequenceBuilder from "@/components/sequence/SequenceBuilder.vue";
import { useCancelableSequenceValidation } from "@/composables/useCancelableSequenceValidation";
import english from "@/languages/english";

const states = {
  empty: { title: "Empty", description: "No items." },
  error: { title: "Error", description: "Try again." },
  loading: { title: "Loading", description: "Loading." },
  "no-results": { title: "No results", description: "Clear filters." },
  permission: { title: "Forbidden", description: "Not allowed." },
  stale: { title: "Stale", description: "Refresh." },
};

function item(index) {
  return {
    identity: `step:${index}`,
    id: index,
    name: `Step ${index}`,
    status: "active",
    metadata: { runtime: "selenium", owner: "QA" },
  };
}

function pickerProps(items, overrides = {}) {
  return {
    accessibleLabel: "Available steps",
    copy: { ...english.SequenceBuilder.picker, states },
    items,
    meta: { page: 1, lastPage: 1, total: items.length },
    metadataLabels: english.SequenceBuilder.metadata,
    query: { page: 1, search: "", filters: {} },
    selectedIds: [],
    ...overrides,
  };
}

describe("sequence builder performance budgets", () => {
  it("bounds a 500-item source window without losing identity or focus", async () => {
    const items = Array.from({ length: 500 }, (_, index) => item(index + 1));
    const wrapper = mount(EntityPicker, {
      attachTo: document.body,
      props: pickerProps(items, {
        selectedIds: ["step:451"],
        virtualWindowSize: 50,
      }),
      global: { stubs: { fontAwesomeIcon: true } },
    });
    const source = wrapper.get(".entity-picker__items");

    expect(wrapper.findAll(".entity-picker__item")).toHaveLength(50);
    const focused = wrapper
      .findAll(".entity-picker__item")[0]
      .get('input[type="checkbox"]');
    focused.element.focus();
    source.element.scrollTop = 40_000;
    await source.trigger("scroll");
    expect(document.activeElement).toBe(focused.element);
    expect(wrapper.vm.virtualStart).toBe(0);

    focused.element.blur();
    await source.trigger("scroll");
    expect(wrapper.vm.virtualStart).toBe(450);
    expect(wrapper.findAll(".entity-picker__item")).toHaveLength(50);
    expect(
      wrapper.find('[data-identity="step:451"] input[type="checkbox"]').element
        .checked,
    ).toBe(true);
  });

  it("renders and reorders the supported 100-item selected fixture", async () => {
    const sequence = Array.from({ length: 100 }, (_, index) => item(index + 1));
    const wrapper = mount(SequenceBuilder, {
      props: {
        accessibleLabel: english.SequenceBuilder.accessibleLabel,
        availableItems: [],
        copy: {
          ...english.SequenceBuilder,
          picker: { ...english.SequenceBuilder.picker, states },
        },
        pickerMeta: { page: 1, lastPage: 1, total: 0 },
        sequence,
      },
      global: { stubs: { fontAwesomeIcon: true } },
    });

    expect(wrapper.findAll(".sequence-builder__item")).toHaveLength(100);
    wrapper.vm.moveItem("step:100", 0);
    const next = wrapper.emitted("update:sequence")[0][0];
    expect(next).toHaveLength(100);
    expect(next[0].identity).toBe("step:100");
    expect(new Set(next.map((entry) => entry.identity)).size).toBe(100);
  });

  it("aborts obsolete validation and ignores its late response", async () => {
    const requests = [];
    const validate = vi.fn(
      (_sequence, _policy, { signal }) =>
        new Promise((resolve) => requests.push({ resolve, signal })),
    );
    let validation;
    const wrapper = mount(
      defineComponent({
        setup() {
          validation = useCancelableSequenceValidation(validate);
          return () => h("div");
        },
      }),
    );

    const first = validation.run([{ id: 1 }]);
    const second = validation.run([{ id: 2 }]);
    expect(requests[0].signal.aborted).toBe(true);
    requests[1].resolve({ canSave: true, diagnostics: [] });
    await expect(second).resolves.toEqual({
      canSave: true,
      diagnostics: [],
    });
    requests[0].resolve({ canSave: false, diagnostics: [{ code: "late" }] });
    await expect(first).resolves.toBeNull();
    expect(validation.result.value).toEqual({
      canSave: true,
      diagnostics: [],
    });

    expect(() => wrapper.unmount()).not.toThrow();
  });
});
