import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import SequenceBuilder from "@/components/sequence/SequenceBuilder.vue";
import english from "@/languages/english";

const availableItems = [
  {
    identity: "step:1",
    id: 1,
    name: "Open browser",
    status: "active",
    metadata: { runtime: "selenium" },
  },
  {
    identity: "step:2",
    id: 2,
    name: "Submit form",
    status: "active",
    metadata: { runtime: "selenium" },
  },
  {
    identity: "step:3",
    id: 3,
    name: "Verify result",
    status: "active",
    metadata: { runtime: "selenium" },
  },
];

function mountBuilder(sequence = []) {
  return mount(SequenceBuilder, {
    props: {
      accessibleLabel: english.SequenceBuilder.accessibleLabel,
      availableItems,
      copy: {
        ...english.SequenceBuilder,
        picker: {
          ...english.SequenceBuilder.picker,
          states: {
            empty: { title: "Empty", description: "No items." },
            error: { title: "Error", description: "Try again." },
            loading: { title: "Loading", description: "Loading." },
            "no-results": {
              title: "No results",
              description: "Clear filters.",
            },
            permission: { title: "Forbidden", description: "Not allowed." },
            stale: { title: "Stale", description: "Refresh." },
          },
        },
      },
      pickerMeta: {
        page: 1,
        lastPage: 1,
        total: availableItems.length,
        hasPreviousPage: false,
        hasNextPage: false,
      },
      sequence,
    },
    global: {
      stubs: { fontAwesomeIcon: true },
    },
  });
}

async function applyLastSequence(wrapper) {
  const updates = wrapper.emitted("update:sequence");
  const sequence = updates.at(-1)[0];
  await wrapper.setProps({ sequence });
  return sequence;
}

describe("SequenceBuilder addition and removal", () => {
  it("adds a multi-selection in authorized picker order", async () => {
    const wrapper = mountBuilder();
    const picker = wrapper.getComponent({ name: "EntityPicker" });

    picker.vm.$emit("update:selectedIds", ["step:2", "step:1"]);
    await wrapper.vm.$nextTick();
    picker.vm.$emit("add-selected", ["step:2", "step:1"]);

    const sequence = await applyLastSequence(wrapper);
    expect(sequence.map((item) => item.identity)).toEqual(["step:1", "step:2"]);
    expect(wrapper.text()).toContain("Position 1");
    expect(wrapper.text()).toContain("Position 2");
  });

  it("uses the same operation for explicit and double-click addition", async () => {
    const wrapper = mountBuilder();
    const picker = wrapper.getComponent({ name: "EntityPicker" });

    picker.vm.$emit("add-item", availableItems[0]);
    let sequence = await applyLastSequence(wrapper);
    expect(sequence.map((item) => item.identity)).toEqual(["step:1"]);

    picker.vm.$emit("add-item", availableItems[1]);
    sequence = await applyLastSequence(wrapper);
    expect(sequence.map((item) => item.identity)).toEqual(["step:1", "step:2"]);
  });

  it("supports drop addition and rejects duplicate identities", async () => {
    const wrapper = mountBuilder([availableItems[0]]);
    const dataTransfer = {
      getData: () => "step:2",
    };

    await wrapper
      .get(".sequence-builder__selected")
      .trigger("drop", { dataTransfer });
    let sequence = await applyLastSequence(wrapper);
    expect(sequence.map((item) => item.identity)).toEqual(["step:1", "step:2"]);

    wrapper
      .getComponent({ name: "EntityPicker" })
      .vm.$emit("add-item", availableItems[0]);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("duplicate")[0][0]).toEqual([availableItems[0]]);
    expect(wrapper.text()).toContain("1 duplicate items were not added.");
  });

  it("removes multiple items and restores their order and selection", async () => {
    const wrapper = mountBuilder(availableItems);
    const checkboxes = wrapper.findAll(
      '.sequence-builder__items input[type="checkbox"]',
    );

    await checkboxes[0].setValue(true);
    await checkboxes[2].setValue(true);
    await wrapper
      .findAll(".sequence-builder__actions button")[0]
      .trigger("click");
    let sequence = await applyLastSequence(wrapper);
    expect(sequence.map((item) => item.identity)).toEqual(["step:2"]);

    await wrapper
      .findAll(".sequence-builder__actions button")[1]
      .trigger("click");
    sequence = await applyLastSequence(wrapper);
    expect(sequence.map((item) => item.identity)).toEqual([
      "step:1",
      "step:2",
      "step:3",
    ]);
    expect(wrapper.vm.selectedSequenceIds).toEqual(["step:1", "step:3"]);
  });
});
