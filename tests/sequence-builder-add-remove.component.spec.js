import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import SequenceBuilder from "@/components/sequence/SequenceBuilder.vue";
import english from "@/languages/english";

const availableItems = [
  {
    identity: "step:1",
    entityId: "1",
    entityType: "step",
    id: 1,
    name: "Open browser",
    status: "active",
    metadata: { runtime: "selenium" },
  },
  {
    identity: "step:2",
    entityId: "2",
    entityType: "step",
    id: 2,
    name: "Submit form",
    status: "active",
    metadata: { runtime: "selenium" },
  },
  {
    identity: "step:3",
    entityId: "3",
    entityType: "step",
    id: 3,
    name: "Verify result",
    status: "active",
    metadata: { runtime: "selenium" },
  },
];

function mountBuilder(sequence = [], overrides = {}) {
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
      ...overrides,
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

  it("allows the same available step to be added as a distinct occurrence", async () => {
    const wrapper = mountBuilder([availableItems[0]], { allowDuplicates: true });
    const dataTransfer = {
      getData(type) {
        return type === "application/x-idelium-sequence-item" ? "step:1" : "";
      },
    };

    await wrapper
      .get(".sequence-builder__selected")
      .trigger("drop", { dataTransfer });

    const sequence = await applyLastSequence(wrapper);
    expect(sequence).toHaveLength(2);
    expect(sequence.map((item) => item.id ?? item.entityId)).toEqual([1, 1]);
    expect(sequence[1]).toMatchObject({
      identity: "step:1:occurrence:2",
      persisted: {
        id: 1,
        sequenceIdentity: "step:1:occurrence:2",
      },
    });
  });

  it("renders duplicate as an accessible icon action", async () => {
    const wrapper = mountBuilder([availableItems[0]], { allowDuplicates: true });
    const duplicateButton = wrapper.get(".sequence-builder__duplicate-action");

    expect(duplicateButton.attributes("aria-label")).toBe(
      "Duplicate Open browser",
    );
    expect(duplicateButton.attributes("title")).toBe("Duplicate Open browser");
    expect(duplicateButton.text()).not.toContain("Duplicate Open browser");

    await duplicateButton.trigger("click");

    const sequence = await applyLastSequence(wrapper);
    expect(sequence.map((item) => item.identity)).toEqual([
      "step:1",
      "step:1:occurrence:2",
    ]);
  });

  it("adds a dragged available item at the dropped sequence row", async () => {
    const wrapper = mountBuilder([availableItems[0], availableItems[2]]);
    const dataTransfer = {
      dropEffect: "",
      effectAllowed: "",
      value: "",
      setData(_type, value) {
        this.value = value;
      },
      getData() {
        return this.value;
      },
    };

    await wrapper
      .getComponent({ name: "EntityPicker" })
      .find("[data-identity='step:2']")
      .trigger("dragstart", { dataTransfer });
    await wrapper
      .findAll(".sequence-builder__item")[1]
      .trigger("dragover", { dataTransfer });
    await wrapper
      .findAll(".sequence-builder__item")[1]
      .trigger("drop", { dataTransfer });

    const sequence = await applyLastSequence(wrapper);
    expect(dataTransfer.effectAllowed).toBe("copyMove");
    expect(dataTransfer.dropEffect).toBe("copy");
    expect(sequence.map((item) => item.identity)).toEqual([
      "step:1",
      "step:2",
      "step:3",
    ]);
  });

  it("keeps drop addition working when the browser drops the transfer payload", async () => {
    const wrapper = mountBuilder([availableItems[0]]);
    const picker = wrapper.getComponent({ name: "EntityPicker" });

    picker.vm.$emit("drag-start", availableItems[1]);
    await wrapper.vm.$nextTick();
    await wrapper.get(".sequence-builder__selected").trigger("drop", {
      dataTransfer: {
        getData() {
          return "";
        },
      },
    });

    const sequence = await applyLastSequence(wrapper);
    expect(sequence.map((item) => item.identity)).toEqual(["step:1", "step:2"]);
  });

  it("primes the available item drag from pointer interaction before native drag starts", async () => {
    const wrapper = mountBuilder([availableItems[0]]);
    const picker = wrapper.getComponent({ name: "EntityPicker" });

    await picker.find("[data-identity='step:2']").trigger("pointerdown");
    await wrapper.get(".sequence-builder__selected").trigger("drop", {
      dataTransfer: {
        getData() {
          return "";
        },
      },
    });

    const sequence = await applyLastSequence(wrapper);
    expect(sequence.map((item) => item.identity)).toEqual(["step:1", "step:2"]);
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

  it("renders item removal as an accessible trash icon action", () => {
    const wrapper = mountBuilder([availableItems[0]]);
    const removeButton = wrapper.get(".sequence-builder__remove-action");

    expect(removeButton.attributes("aria-label")).toBe("Remove Open browser");
    expect(removeButton.attributes("title")).toBe("Remove Open browser");
    expect(removeButton.text()).not.toContain("Remove Open browser");
  });
});
