import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));
const postmanResponseModalShow = vi.hoisted(() => vi.fn());

vi.mock("@/services/apiClient", () => ({ default: api }));

import StepResultsDetail from "@/view/testperformed/StepResultsDetail.vue";

const labels = {
  TestsPerformed: {
    backToTestResults: "Back to test results",
    emptySteps: "No steps were recorded.",
    statusFailed: "Failed",
    statusPassed: "Passed",
    statusPending: "Pending",
    statusSkipped: "Skipped",
    browser: "Browser",
    device: "Device",
    environment: "Environment",
    executionContext: "Execution context",
    executionContextHelp: "Captured run metadata.",
    notCaptured: "Not captured",
    operatingSystem: "Operating system",
    stepDuration: "Step duration",
    stepResults: "Step-by-step results",
    stepResultsDetailDescription: "Inspect steps.",
    stepResultsDetailFallback: "Performed test",
    stepResultsDetailHelp: "Review status and diagnostics.",
  },
  Postman: {
    assertions: "assertions",
    diagnostic: "diagnostic",
    emptyResults: "No Postman execution data is available.",
    executionResults: "Postman execution results",
    executionResultsHelp: "Review captured Postman calls.",
    id: "#",
    method: "method",
    moreDetails: "More details",
    request: "request",
    requests: "requests",
    response: "response",
    showResponse: "show response",
    status: "status",
    time: "time",
    url: "url",
  },
};

function mountStepResults(overrides = {}) {
  return shallowMount(StepResultsDetail, {
    global: {
      stubs: {
        modalPostmanResponse: {
          template: "<div />",
          methods: { showModal: postmanResponseModalShow },
        },
        PostmanResultTable: true,
      },
      mocks: {
        $route: {
          name: "testsperformed-step-results",
          params: { projectId: "7", testId: "55" },
          query: { runId: "9", testCycleId: "1", testName: "Checkout" },
        },
        $router: { push: vi.fn() },
        config: {
          currentLanguage: "gb",
          serviceBaseUrl: "/api/",
          url: {
            getStepPerformed: "steps-performed",
            getTestCyclePerformed: "testcycles-performed",
          },
        },
        emitter: { emit: vi.fn() },
        language: { gb: labels },
        Logout: vi.fn(),
        setHeaders: () => ({}),
        ...overrides,
      },
    },
  });
}

describe("step results detail page", () => {
  beforeEach(() => {
    api.get.mockReset();
    postmanResponseModalShow.mockReset();
  });

  it("loads performed test steps from the dedicated route", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/api/steps-performed/55") {
        return Promise.resolve({
          data: [
            {
              id: 11,
              name: "Open browser",
              status: 1,
              created_at: "2026-07-31T10:00:00.000Z",
              updated_at: "2026-07-31T10:00:01.000Z",
            },
          ],
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    const wrapper = mountStepResults();

    await vi.waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/api/steps-performed/55", {
        headers: {},
      }),
    );
    expect(wrapper.text()).toContain("Checkout");
    expect(wrapper.text()).toContain("Open browser");
    expect(wrapper.text()).toContain("1.00 s");
  });

  it("shows the execution context for the selected performed run", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/api/steps-performed/55") {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({
        data: {
          data: [
            {
              id: 9,
              executionContext: {
                browser: "firefox",
                browserVersion: "stable",
                device: "Pixel 8",
                environment: "demo",
                platformName: "darwin",
                platformVersion: "25.0.0",
              },
            },
          ],
        },
      });
    });

    const wrapper = mountStepResults();

    await vi.waitFor(() =>
      expect(wrapper.text()).toContain("firefox stable"),
    );

    expect(wrapper.text()).toContain("demo");
    expect(wrapper.text()).toContain("Pixel 8");
    expect(wrapper.text()).toContain("darwin 25.0.0");
    expect(api.get).toHaveBeenCalledWith("/api/testcycles-performed/1", {
      headers: {},
      params: {
        direction: "desc",
        page: 1,
        perPage: 25,
        sort: "date",
      },
    });
  });

  it("returns to the performed tests page preserving the execution context", async () => {
    api.get.mockResolvedValue({ data: [] });
    const push = vi.fn();
    const wrapper = mountStepResults({ $router: { push } });

    wrapper.vm.goBackToTestsPerformed();

    expect(push).toHaveBeenCalledWith({
      name: "testsperformed",
      params: { projectId: "7" },
      query: { runId: "9", testCycleId: "1" },
    });
  });

  it("keeps Postman details collapsed until the user opens the modal", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/api/steps-performed/55") {
        return Promise.resolve({
          data: [
            {
              id: 12,
              name: "postman",
              status: 1,
              type: "postman",
              data: [
                {
                  assertions: { total: 1, passed: 1 },
                  method: "GET",
                  name: "Echo",
                  status: 200,
                  time: 42,
                  url: "https://postman-echo.com/get",
                },
              ],
            },
          ],
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });
    const wrapper = mountStepResults();

    await vi.waitFor(() =>
      expect(wrapper.find(".step-results-more-details").exists()).toBe(true),
    );

    expect(wrapper.findComponent({ name: "PostmanResultTable" }).exists()).toBe(
      false,
    );

    await wrapper.get(".step-results-more-details").trigger("click");

    expect(wrapper.find(".step-results-modal").exists()).toBe(true);
    expect(wrapper.findComponent({ name: "PostmanResultTable" }).exists()).toBe(
      true,
    );
  });
});
