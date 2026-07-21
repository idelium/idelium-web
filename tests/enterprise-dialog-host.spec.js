import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import EnterpriseDialogHost from "@/components/shared/EnterpriseDialogHost.vue";

describe("enterprise dialog host", () => {
  function mountDialogHost() {
    const handlers = {};
    const emitter = {
      off: vi.fn((event) => {
        delete handlers[event];
      }),
      on: vi.fn((event, handler) => {
        handlers[event] = handler;
      }),
    };

    const wrapper = mount(EnterpriseDialogHost, {
      global: {
        mocks: { emitter },
        stubs: {
          teleport: true,
          FontAwesomeIcon: { template: "<span />" },
        },
      },
    });

    return { handlers, wrapper };
  }

  it("resolves confirmation dialogs with true only after confirm", async () => {
    const { handlers, wrapper } = mountDialogHost();
    const resolver = vi.fn();

    handlers["enterprise-dialog:show"]({
      cancelLabel: "Cancel",
      confirmLabel: "Confirm",
      message: "Delete this item?",
      resolver,
      title: "Confirm action",
      type: "confirm",
      variant: "warning",
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Delete this item?");

    await wrapper.find(".enterprise-dialog-confirm").trigger("click");

    expect(resolver).toHaveBeenCalledWith(true);
    expect(wrapper.find(".enterprise-dialog").exists()).toBe(false);
  });

  it("resolves alert dialogs with true from the primary action", async () => {
    const { handlers, wrapper } = mountDialogHost();
    const resolver = vi.fn();

    handlers["enterprise-dialog:show"]({
      confirmLabel: "OK",
      message: "Operation complete",
      resolver,
      title: "Attention",
      type: "alert",
      variant: "info",
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".btn-outline-light").exists()).toBe(false);

    await wrapper.find(".enterprise-dialog-confirm").trigger("click");

    expect(resolver).toHaveBeenCalledWith(true);
  });
});
