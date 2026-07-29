import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";

import EnterpriseDetailDrawer from "@/components/grid/EnterpriseDetailDrawer.vue";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("EnterpriseDetailDrawer", () => {
  it("moves focus into the drawer, closes with Escape, and restores origin focus", async () => {
    const origin = document.createElement("button");
    origin.textContent = "Open details";
    document.body.appendChild(origin);
    origin.focus();

    const wrapper = mount(EnterpriseDetailDrawer, {
      attachTo: document.body,
      props: {
        closeLabel: "Close details",
        eyebrow: "Record detail",
        open: true,
        title: "Project 42",
      },
      slots: { default: '<a href="#result">Result</a>' },
    });
    await wrapper.vm.$nextTick();

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(document.activeElement?.getAttribute("aria-label")).toBe(
      "Close details",
    );

    document
      .querySelector(".enterprise-detail-drawer__backdrop")
      .dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }),
      );
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("close")).toHaveLength(1);

    await wrapper.setProps({ open: false });
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toBe(origin);
    wrapper.unmount();
  });
});
