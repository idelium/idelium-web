import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const modalShow = vi.fn();
const modalHide = vi.fn();
const modalDispose = vi.fn();

vi.mock("bootstrap", () => ({
  Modal: vi.fn(function Modal() {
    return {
      show: modalShow,
      hide: modalHide,
      dispose: modalDispose,
    };
  }),
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
              diagnostic: "diagnostic",
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
            Bidi: {
              artifact: "artifact",
              event: "event",
              url: "url",
              message: "message",
              status: "status",
              executionResults: "WebDriver BiDi diagnostics",
              executionResultsHelp: "Review BiDi diagnostics.",
              emptyResults: "No BiDi diagnostics.",
            },
            ExecutionResult: {
              executionResults: "Execution result details",
              executionResultsHelp: "Review canonical result details.",
              runtime: "runtime",
              schema: "schema",
              duration: "duration",
              diagnostics: "diagnostics",
              artifacts: "artifacts",
              trace: "trace",
              page: "page",
              timeline: "Execution timeline",
              timelineHelp: "Inspect each step state.",
              artifactViewer: "Artifact viewer",
              closeArtifact: "Close",
              artifactPreviewUnavailable: "No inline preview.",
              success: "success",
              failed: "failed",
              emptyResults: "No canonical execution result details.",
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

  it("marks a Postman step as failed when the CLI result payload failed", async () => {
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
              name: "Newman",
              status: 0,
              method: "NEWMAN",
              passed: false,
              assertions: [
                {
                  name: "newman",
                  passed: false,
                  message: "Newman was not found on PATH.",
                },
              ],
            },
          ]),
        },
      ],
      "postman",
    );

    expect(wrapper.vm.getStepVariant(wrapper.vm.arrayStep[0])).toBe("danger");
    expect(wrapper.vm.getStepStatusText(wrapper.vm.arrayStep[0])).toBe(
      "failed",
    );
  });

  it("renders redacted WebDriver BiDi diagnostic events", async () => {
    const wrapper = mountModal();

    await wrapper.vm.showModal(
      [
        {
          id: 18,
          name: "selenium",
          status: 1,
          type: "selenium",
          screenshots: "[]",
          data: JSON.stringify({
            runtime: "selenium",
            schemaVersion: "selenium.bidi.diagnostics.v1",
            artifacts: [
              {
                name: "bidi-diagnostics",
                type: "application/vnd.idelium.bidi.diagnostics+json",
                data: {
                  schemaVersion: "1.0",
                  events: [
                    {
                      type: "script.exceptionThrown",
                      url: "https://example.test?token=%5BREDACTED%5D",
                      message: "Authorization=[REDACTED]",
                      status: "error",
                    },
                  ],
                },
              },
            ],
          }),
        },
      ],
      "selenium",
    );

    expect(wrapper.text()).toContain("WebDriver BiDi diagnostics");
    expect(wrapper.text()).toContain("script.exceptionThrown");
    expect(wrapper.text()).toContain("Authorization=[REDACTED]");
    expect(wrapper.find(".bidi-redacted").exists()).toBe(true);
  });

  it("shows an empty state when Selenium has no BiDi diagnostics", async () => {
    const wrapper = mountModal();

    await wrapper.vm.showModal(
      [
        {
          id: 19,
          name: "selenium",
          status: 1,
          type: "selenium",
          screenshots: "[]",
          data: JSON.stringify({
            runtime: "selenium",
            schemaVersion: "selenium.webdriver.v2",
            commandTrace: [],
          }),
        },
      ],
      "selenium",
    );

    expect(wrapper.text()).toContain("No BiDi diagnostics.");
  });

  it("renders canonical execution result traces and artifacts safely", async () => {
    const wrapper = mountModal();

    await wrapper.vm.showModal(
      [
        {
          id: 20,
          name: "checkout",
          status: 2,
          type: "seleniumOrAppium",
          screenshots: "[]",
          data: JSON.stringify({
            runtime: "selenium",
            schemaVersion: "performed-step-result.v1",
            durationMilliseconds: 143,
            diagnostics: [
              {
                level: "error",
                code: "IDELIUM_WEBDRIVER_TIMEOUT",
                message: "Timeout waiting for token=[REDACTED]",
              },
            ],
            artifacts: [
              {
                name: "failure-screenshot.png",
                type: "image/png",
                path: "screenshots/20.png",
              },
            ],
            trace: {
              status: "failed",
              identity: { kind: "click" },
              page: {
                url: "https://example.test/checkout?token=%5BREDACTED%5D",
              },
              timing: { durationMilliseconds: 143 },
              diagnostics: [
                {
                  level: "error",
                  code: "IDELIUM_WEBDRIVER_TIMEOUT",
                  message: "Timeout waiting for token=[REDACTED]",
                },
              ],
            },
          }),
        },
      ],
      "checkout",
    );

    expect(wrapper.text()).toContain("Execution result details");
    expect(wrapper.text()).toContain("performed-step-result.v1");
    expect(wrapper.text()).toContain("143 ms");
    expect(wrapper.text()).toContain("failure-screenshot.png");
    expect(wrapper.text()).toContain("IDELIUM_WEBDRIVER_TIMEOUT");
    expect(wrapper.text()).toContain("token=[REDACTED]");
    expect(wrapper.text()).not.toContain("token=secret");
  });

  it("renders partial legacy result details without crashing", async () => {
    const wrapper = mountModal();

    await wrapper.vm.showModal(
      [
        {
          id: 21,
          name: "legacy",
          status: 1,
          type: "selenium",
          screenshots: "[]",
          data: JSON.stringify({ runtime: "selenium" }),
        },
      ],
      "legacy",
    );

    expect(wrapper.text()).toContain("Execution result details");
    expect(wrapper.text()).toContain("legacy");
    expect(wrapper.vm.stepArtifacts(wrapper.vm.arrayStep[0])).toEqual([]);
    expect(wrapper.vm.stepDiagnostics(wrapper.vm.arrayStep[0])).toEqual([]);
  });

  it("renders an accessible execution timeline and inline artifact preview", async () => {
    const wrapper = mountModal();

    await wrapper.vm.showModal(
      [
        {
          id: 22,
          name: "open browser",
          status: 1,
          type: "selenium",
          screenshots: '["data:image/png;base64,abc123"]',
          data: JSON.stringify({
            runtime: "selenium",
            schemaVersion: "performed-step-result.v1",
            durationMilliseconds: 51,
            artifacts: [
              {
                name: "console-log",
                type: "text/plain",
                data: "ready [REDACTED]",
              },
            ],
          }),
        },
      ],
      "timeline",
    );

    expect(
      wrapper.find(".execution-timeline-panel").attributes("aria-label"),
    ).toBe("Execution timeline");
    expect(wrapper.text()).toContain("open browser");
    expect(wrapper.text()).toContain("51 ms");
    expect(wrapper.vm.stepArtifacts(wrapper.vm.arrayStep[0])).toHaveLength(2);

    await wrapper.get(".execution-artifact-button").trigger("click");

    expect(wrapper.text()).toContain("Artifact viewer");
    expect(wrapper.text()).toContain("ready [REDACTED]");
    expect(wrapper.text()).not.toContain("ready secret");
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
