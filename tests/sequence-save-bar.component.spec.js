import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import SequenceSaveBar from "@/components/sequence/SequenceSaveBar.vue";
import english from "@/languages/english";

function mountBar(overrides = {}) {
  return mount(SequenceSaveBar, {
    props: {
      canRedo: true,
      canSave: true,
      canUndo: true,
      copy: english.SequenceBuilder.saveBar,
      dirty: true,
      lastSavedAt: "2026-07-29T08:00:00.000Z",
      locale: "en",
      serverVersion: "v7",
      ...overrides,
    },
  });
}

describe("SequenceSaveBar", () => {
  it("shows durable status, version, and accessible persistence actions", async () => {
    const wrapper = mountBar();

    expect(wrapper.text()).toContain("Unsaved changes");
    expect(wrapper.text()).toContain("v7");
    expect(wrapper.text()).toContain("Last saved");
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Save sequence")
      .trigger("click");
    expect(wrapper.emitted("save")).toHaveLength(1);
  });

  it("renders only conflict actions supported by the endpoint", () => {
    const wrapper = mountBar({
      conflict: {
        canCompare: true,
        canReload: false,
        canRetry: true,
      },
    });

    expect(wrapper.text()).toContain("A newer server version is available");
    expect(wrapper.text()).not.toContain("Reload server version");
    expect(wrapper.text()).toContain("Compare changes");
    expect(wrapper.text()).toContain("Retry save");
    expect(wrapper.get('[role="alert"]').exists()).toBe(true);
  });
});
