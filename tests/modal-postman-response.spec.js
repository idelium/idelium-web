import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const modalShow = vi.fn();
const modalDispose = vi.fn();

vi.mock("bootstrap", () => ({
  Modal: vi.fn(function Modal() {
    return {
      show: modalShow,
      dispose: modalDispose,
    };
  }),
}));

import ModalPostmanResponse from "@/view/testperformed/modalPostmanResponse.vue";

describe("Postman response modal", () => {
  it("shows request payload and response payload details", async () => {
    const wrapper = shallowMount(ModalPostmanResponse, {
      global: {
        stubs: {
          FontAwesomeIcon: { template: "<i />" },
        },
      },
    });

    wrapper.vm.showModal({
      name: "Echo POST",
      method: "POST",
      status: 200,
      time: 123,
      url: "https://postman-echo.com/post",
      requestPayload: '{"product":"idelium"}',
      response: '{"json":{"product":"idelium"}}',
      assertions: [{ name: "status", passed: true }],
      passed: true,
    });
    await wrapper.vm.$nextTick();

    expect(modalShow).toHaveBeenCalled();
    expect(wrapper.text()).toContain("Request payload");
    expect(wrapper.text()).toContain("Response payload");
    expect(wrapper.text()).toContain('"product": "idelium"');
    expect(wrapper.text()).toContain('"json"');
  });

  it("can be elevated above an already open Postman details modal", () => {
    const wrapper = shallowMount(ModalPostmanResponse, {
      props: { elevated: true },
      global: {
        stubs: {
          FontAwesomeIcon: { template: "<i />" },
        },
      },
    });

    expect(wrapper.get(".postman-response-modal").classes()).toContain(
      "postman-response-modal--elevated",
    );
  });
});
