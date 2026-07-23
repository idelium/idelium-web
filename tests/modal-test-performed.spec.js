import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const modalShow = vi.fn();
const modalHide = vi.fn();
const modalDispose = vi.fn();

vi.mock("bootstrap", () => ({
  Modal: vi.fn(() => ({
    show: modalShow,
    hide: modalHide,
    dispose: modalDispose,
  })),
}));

import ModalTestPerformed from "@/view/testperformed/modalTestPerformed.vue";

function mountModal() {
  const router = { push: vi.fn() };
  return shallowMount(ModalTestPerformed, {
    attachTo: document.body,
    global: {
      stubs: {
        FontAwesomeIcon: { template: "<i />" },
        timeline: {
          template: "<div />",
          methods: { calc: vi.fn() },
        },
        PostmanResultTable: {
          props: ["results", "labels"],
          emits: ["show-response"],
          template:
            '<button class="postman-response" @click="$emit(\'show-response\', results[0])">response</button>',
        },
      },
      mocks: {
        $route: { params: { projectId: 3 } },
        $router: router,
        config: { currentLanguage: "gb" },
        language: {
          gb: {
            Actions: { expand: "Expand" },
            TestsPerformed: {
              stepId: "step id",
              stepName: "step name",
              stepStatus: "status",
              screenshots: "screenshots",
            },
            Postman: {
              id: "#",
              status: "status",
              method: "method",
              url: "url",
              assertions: "assertions",
              response: "response",
              showResponse: "show response",
              time: "time",
              executionResults: "Postman execution results",
              executionResultsHelp: "Review request results.",
              emptyResults: "No Postman execution data.",
              fullDetails: "Open full Postman details",
              responsePreview: "Response preview",
              hideResponse: "Hide response",
            },
          },
        },
      },
    },
  });
}

describe("performed test details modal", () => {
  it("renders Postman results from the performed step payload", async () => {
    const wrapper = mountModal();

    await wrapper.vm.showModal(
      [
        {
          id: 17,
          name: "postman",
          status: 1,
          type: "postman",
          screenshots: "[]",
          data: JSON.stringify([
            {
              status: 200,
              method: "get",
              url: "https://example.test/health",
              response: { ok: true },
            },
          ]),
        },
      ],
      "postman",
    );

    expect(wrapper.vm.postmanResults(wrapper.vm.arrayStep[0])).toMatchObject([
      {
        status: 200,
        method: "GET",
        url: "https://example.test/health",
        response: { ok: true },
      },
    ]);

    await wrapper.get(".postman-response").trigger("click");
    expect(wrapper.text()).toContain('"ok": true');
  });

  it("ignores invalid screenshot payloads without breaking the modal", () => {
    const wrapper = mountModal();

    expect(wrapper.vm.safeScreenshots({ screenshots: "{not-json" })).toEqual(
      [],
    );
  });

  it("releases focus before hiding the modal for Postman navigation", async () => {
    const wrapper = mountModal();

    await wrapper.vm.showModal(
      [
        {
          id: 17,
          testDoneId: 44,
          name: "postman",
          status: 1,
          type: "postman",
          screenshots: "[]",
          data: "[]",
        },
      ],
      "postman",
    );

    wrapper.vm.$refs.mymodal.classList.add("show");
    const detailsButton = wrapper.get(".btn-outline-info");
    detailsButton.element.focus();
    expect(document.activeElement).toBe(detailsButton.element);

    await detailsButton.trigger("click");

    expect(document.activeElement).not.toBe(detailsButton.element);
    expect(modalHide).toHaveBeenCalled();
    expect(wrapper.vm.$router.push).not.toHaveBeenCalled();

    wrapper.vm.$refs.mymodal.dispatchEvent(new Event("hidden.bs.modal"));
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
      name: "postman",
      params: { projectId: 3, id: 44 },
    });
  });
});
