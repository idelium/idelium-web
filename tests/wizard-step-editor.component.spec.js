import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import WizardStepEditor from "@/components/step-editor/WizardStepEditor.vue";
import english from "@/languages/english";
import italian from "@/languages/italian";

const actions = [
  {
    identity: "action:open",
    entityId: "open",
    entityType: "action",
    name: "Open browser",
    summary: "Starts a browser session.",
    metadata: {
      runtime: "selenium",
      failureBehavior: "Stop sequence",
      screenshotPolicy: "On failure",
    },
  },
  {
    identity: "action:click",
    entityId: "click",
    entityType: "action",
    name: "Click",
    summary: "Activates an element.",
    metadata: {
      runtime: "selenium",
      failureBehavior: "Continue",
      screenshotPolicy: "Never",
    },
  },
];

function copy(language = english) {
  return {
    ...language.StepEditor.wizard,
    sequence: language.SequenceBuilder,
    saveBar: language.SequenceBuilder.saveBar,
  };
}

function mountWizard(props = {}) {
  return mount(WizardStepEditor, {
    props: {
      availableActions: actions,
      copy: copy(),
      modelValue: actions,
      validation: { canSave: true, diagnostics: [] },
      ...props,
    },
  });
}

describe("WizardStepEditor", () => {
  it("keeps active configuration stable after accessible reorder", async () => {
    const wrapper = mountWizard();
    const configure = wrapper
      .findAll("button")
      .find((button) => button.text() === "Configure Open browser");
    await configure.trigger("click");
    expect(wrapper.text()).toContain("Starts a browser session.");

    wrapper.vm.recordChange([actions[1], actions[0]]);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.activeIdentity).toBe("action:open");
    expect(wrapper.vm.activePosition).toBe(2);
    expect(wrapper.text()).toContain("Action 2");
  });

  it("supports duplicate, removal, multi-select, undo, and redo without drag", async () => {
    const wrapper = mountWizard();
    const duplicate = wrapper
      .findAll("button")
      .find(
        (button) =>
          button.attributes("aria-label") === "Duplicate Open browser",
      );
    await duplicate.trigger("click");

    expect(wrapper.vm.draft).toHaveLength(3);
    expect(new Set(wrapper.vm.draft.map((item) => item.identity)).size).toBe(3);
    expect(wrapper.vm.dirty).toBe(true);
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Undo")
      .trigger("click");
    expect(wrapper.vm.draft).toHaveLength(2);
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Redo")
      .trigger("click");
    expect(wrapper.vm.draft).toHaveLength(3);

    const checkboxes = wrapper.findAll(
      '.sequence-builder__item input[type="checkbox"]',
    );
    await checkboxes[0].setValue(true);
    await checkboxes[1].setValue(true);
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Remove selected")
      .trigger("click");
    expect(wrapper.vm.draft).toHaveLength(1);
  });

  it("identifies action number and property and blocks an invalid save", async () => {
    const validation = {
      canSave: false,
      diagnostics: [
        {
          code: "stepEditor.form.required",
          identity: "action:click",
          path: "actions[1].properties.selector",
          severity: "error",
        },
      ],
    };
    const wrapper = mountWizard({ validation });
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Configure Click")
      .trigger("click");
    wrapper.vm.recordChange([
      ...wrapper.vm.draft,
      { ...actions[1], identity: "action:extra" },
    ]);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Action 2, property actions[1].properties.selector requires attention.",
    );
    const save = wrapper
      .findAll("button")
      .find((button) => button.text() === "Save sequence");
    expect(save.attributes("disabled")).toBeDefined();
  });

  it("protects dirty work and removes the global listener on unmount", () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const wrapper = mountWizard();
    wrapper.vm.recordChange([actions[0]]);
    const event = new Event("beforeunload", { cancelable: true });

    wrapper.vm.protectUnsavedChanges(event);
    expect(event.defaultPrevented).toBe(true);
    expect(add).toHaveBeenCalledWith(
      "beforeunload",
      wrapper.vm.protectUnsavedChanges,
    );
    wrapper.unmount();
    expect(remove).toHaveBeenCalledWith(
      "beforeunload",
      wrapper.vm.protectUnsavedChanges,
    );
  });

  it("provides complete English and Italian wizard copy", () => {
    for (const key of [
      "accessibleLabel",
      "inspector",
      "actionNumber",
      "failureBehavior",
      "screenshotPolicy",
      "validationDiagnostic",
    ]) {
      expect(english.StepEditor.wizard[key]).toBeTruthy();
      expect(italian.StepEditor.wizard[key]).toBeTruthy();
    }
  });
});
