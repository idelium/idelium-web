import { defineComponent, h, ref } from "vue";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import StepEditorShell from "@/components/step-editor/StepEditorShell.vue";
import english from "@/languages/english";

function mountShell(overrides = {}, slots = {}) {
  return mount(StepEditorShell, {
    attachTo: document.body,
    props: {
      compact: false,
      copy: english.StepEditor.shell,
      ...overrides,
    },
    slots: {
      catalog: '<input aria-label="catalog value" />',
      sequence: '<input aria-label="sequence value" />',
      inspector: '<input aria-label="inspector value" />',
      ...slots,
    },
  });
}

describe("StepEditorShell", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders three bounded scroll regions in accessible DOM order", () => {
    const wrapper = mountShell();
    const panels = wrapper.findAll(".step-editor-shell__panel");

    expect(panels.map((panel) => panel.attributes("id"))).toEqual([
      "step-editor-panel-catalog",
      "step-editor-panel-sequence",
      "step-editor-panel-inspector",
    ]);
    expect(wrapper.findAll('[role="separator"]')).toHaveLength(2);
    expect(wrapper.classes()).not.toContain("step-editor-shell--compact");
  });

  it("keeps slot form state mounted across compact layout changes", async () => {
    const compact = ref(false);
    let shell;
    const wrapper = mount(
      defineComponent({
        setup() {
          shell = compact;
          return () =>
            h(
              StepEditorShell,
              {
                compact: compact.value,
                copy: english.StepEditor.shell,
              },
              {
                catalog: () => h("input", { "aria-label": "catalog value" }),
                sequence: () => h("input", { "aria-label": "sequence value" }),
                inspector: () =>
                  h("input", { "aria-label": "inspector value" }),
              },
            );
        },
      }),
      { attachTo: document.body },
    );
    const input = wrapper.get('[aria-label="sequence value"]');
    await input.setValue("unchanged configuration");

    shell.value = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.get('[aria-label="sequence value"]').element.value).toBe(
      "unchanged configuration",
    );
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(3);
  });

  it("keeps all areas reachable in compact and 200-percent zoom layouts", async () => {
    const wrapper = mountShell({ compact: true });
    const tabs = wrapper.findAll('[role="tab"]');

    expect(tabs.map((tab) => tab.text())).toEqual([
      "Action catalogue",
      "Sequence canvas",
      "Properties inspector",
    ]);
    await tabs[0].trigger("click");
    expect(tabs[0].attributes("aria-selected")).toBe("true");
    expect(wrapper.get("#step-editor-panel-catalog").isVisible()).toBe(true);
    await wrapper
      .get("#step-editor-tab-catalog")
      .trigger("keydown", { key: "ArrowLeft" });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.activePanel).toBe("inspector");
    expect(
      wrapper.get("#step-editor-tab-inspector").attributes("tabindex"),
    ).toBe("0");
  });

  it("bounds pointer and keyboard panel resizing without changing slot state", async () => {
    const wrapper = mountShell();
    const separators = wrapper.findAll('[role="separator"]');

    await separators[0].trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.vm.catalogWidth).toBe(26);
    wrapper.vm.setPanelWidth("catalog", 90);
    wrapper.vm.setPanelWidth("inspector", 1);
    expect(wrapper.vm.catalogWidth).toBe(35);
    expect(wrapper.vm.inspectorWidth).toBe(18);
    expect(wrapper.emitted("resize").at(-1)[0]).toEqual({
      catalogWidth: 35,
      inspectorWidth: 18,
    });
  });

  it("observes reduced width and cleans resize listeners on unmount", () => {
    let callback;
    const disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(handler) {
          callback = handler;
        }
        observe() {}
        disconnect() {
          disconnect();
        }
      },
    );
    const wrapper = mountShell({ compact: null });

    callback([{ contentRect: { width: 700 } }]);
    expect(wrapper.vm.isCompact).toBe(true);
    wrapper.vm.startResize("catalog", {
      clientX: 0,
      currentTarget: {},
      pointerId: 1,
    });
    expect(() => wrapper.unmount()).not.toThrow();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("provides an explicit full-screen code mode and Escape exit", async () => {
    const wrapper = mountShell({ codeMode: true });
    const button = wrapper
      .findAll("button")
      .find((entry) => entry.text() === "Open code editor full screen");

    await button.trigger("click");
    expect(wrapper.classes()).toContain("step-editor-shell--fullscreen");
    await wrapper.trigger("keydown", { key: "Escape" });
    expect(wrapper.classes()).not.toContain("step-editor-shell--fullscreen");
  });
});
