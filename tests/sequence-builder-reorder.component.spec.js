import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import SequenceBuilder from "@/components/sequence/SequenceBuilder.vue";
import english from "@/languages/english";

const sequence = [
  { identity: "step:1", id: 1, name: "Open browser", status: "active" },
  { identity: "step:2", id: 2, name: "Submit form", status: "active" },
  { identity: "step:3", id: 3, name: "Verify result", status: "active" },
];

function mountBuilder() {
  return mount(SequenceBuilder, {
    attachTo: document.body,
    props: {
      accessibleLabel: english.SequenceBuilder.accessibleLabel,
      availableItems: [],
      copy: {
        ...english.SequenceBuilder,
        picker: {
          ...english.SequenceBuilder.picker,
          states: {
            empty: { title: "Empty", description: "No items." },
          },
        },
      },
      pickerMeta: { page: 1, lastPage: 1, total: 0 },
      sequence,
    },
    global: {
      stubs: { fontAwesomeIcon: true },
    },
  });
}

async function applyLastSequence(wrapper) {
  const next = wrapper.emitted("update:sequence").at(-1)[0];
  await wrapper.setProps({ sequence: next });
  await wrapper.vm.$nextTick();
  return next;
}

describe("SequenceBuilder accessible reorder", () => {
  it("uses explicit commands, updates positions, and follows the moved item", async () => {
    const wrapper = mountBuilder();
    const rows = wrapper.findAll(".sequence-builder__item");
    const moveDown = rows[0]
      .findAll("button")
      .find((button) => button.text() === "Move down");

    await moveDown.trigger("click");
    const next = await applyLastSequence(wrapper);

    expect(next.map((item) => item.identity)).toEqual([
      "step:2",
      "step:1",
      "step:3",
    ]);
    expect(wrapper.text()).toContain(
      "Open browser moved from position 1 to position 2.",
    );
    expect(document.activeElement.textContent).toContain("Open browser");
    expect(wrapper.text()).toContain("Position 1");
    expect(wrapper.text()).toContain("Position 2");
  });

  it("disables boundary commands with localized reasons", () => {
    const wrapper = mountBuilder();
    const rows = wrapper.findAll(".sequence-builder__item");
    const firstButtons = rows[0].findAll("button");
    const lastButtons = rows.at(-1).findAll("button");

    expect(firstButtons[1].attributes("disabled")).toBe("");
    expect(firstButtons[1].attributes("title")).toBe(
      "This item is already first.",
    );
    expect(firstButtons[2].attributes("disabled")).toBe("");
    expect(lastButtons[3].attributes("disabled")).toBe("");
    expect(lastButtons[4].attributes("disabled")).toBe("");
    expect(lastButtons[4].attributes("title")).toBe(
      "This item is already last.",
    );
  });

  it("makes pointer drop produce the same persisted order", async () => {
    const pointerWrapper = mountBuilder();
    const keyboardWrapper = mountBuilder();
    const dataTransfer = {
      value: "",
      setData(_type, value) {
        this.value = value;
      },
      getData() {
        return this.value;
      },
    };
    const rows = pointerWrapper.findAll(".sequence-builder__item");

    await rows[0]
      .find(".sequence-builder__drag-handle")
      .trigger("dragstart", { dataTransfer });
    await rows[2].trigger("drop", { dataTransfer });
    const pointerSequence = await applyLastSequence(pointerWrapper);
    const moveToEnd = keyboardWrapper
      .findAll(".sequence-builder__item")[0]
      .findAll("button")
      .find((button) => button.text() === "Move to end");
    await moveToEnd.trigger("click");
    const keyboardSequence = await applyLastSequence(keyboardWrapper);

    expect(pointerSequence.map((item) => item.identity)).toEqual([
      "step:2",
      "step:3",
      "step:1",
    ]);
    expect(pointerSequence).toEqual(keyboardSequence);
  });

  it("bounds drag auto-scroll and unmounts without retained state", () => {
    const wrapper = mountBuilder();
    const container = wrapper.get(".sequence-builder__selected").element;
    Object.defineProperties(container, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 300 },
      scrollTop: { configurable: true, value: 190, writable: true },
    });
    container.getBoundingClientRect = () => ({
      bottom: 100,
      height: 100,
      top: 0,
    });

    wrapper.vm.autoScroll({
      preventDefault() {},
      clientY: 99,
      currentTarget: container,
    });
    expect(container.scrollTop).toBe(200);

    wrapper.vm.draggedSequenceIdentity = "step:1";
    wrapper.vm.pendingFocusIdentity = "step:1";
    expect(() => wrapper.unmount()).not.toThrow();
  });
});
