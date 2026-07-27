import { shallowMount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));

import TestsPerformed from "@/view/testsperformed.vue";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("tests performed component", () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
    vi.useRealTimers();
    useSessionStore(pinia).selectProject(9);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function mountTestsPerformed(overrides = {}) {
    return shallowMount(TestsPerformed, {
      global: {
        plugins: [pinia],
        stubs: {
          modalTestPerformed: { template: "<div />" },
        },
        mocks: {
          $route: { name: "testsperformed" },
          config: {
            currentLanguage: "gb",
            serviceBaseUrl: "/api/",
            url: {
              testcycles: "testcycles",
              getTestCyclePerformed: "testcycles-performed",
              getTestPerformed: "tests-performed",
              getStepPerformed: "steps-performed",
              parallelRuns: "projects",
            },
            timeCheck: 5000,
          },
          language: {
            gb: {
              Actions: {
                refresh: "Refresh",
              },
              TestsPerformed: {
                pageEyebrow: "Execution insights",
                pageTitle: "Tests performed",
                pageDescription: "Review test cycle executions.",
                refresh: "Refresh",
                columnTestCycle: "Test cycles",
                columnTestCycleDate: "Test cycles performed",
                columnTest: "Tests carried out",
                selectCycle: "Select a test cycle.",
                selectRun: "Select a run.",
                openDetails: "Open details.",
                emptyCycles: "No test cycles.",
                emptyRuns: "No executions.",
                emptyTests: "No tests.",
                selectCycleFirst: "Select a cycle first.",
                selectRunFirst: "Select a run first.",
                viewDetails: "View details",
                statusPending: "Pending",
                statusPassed: "Passed",
                statusFailed: "Failed",
                parallelRuns: "Parallel executions",
                parallelRunsDescription: "Monitor distributed runs.",
                parallelRunLabel: "Run",
                emptyParallelRuns: "No parallel runs.",
                cancelRun: "Cancel run",
                cancelRunTitle: "Cancel parallel execution?",
                cancelRunMessage: "Ask the server to cancel this run.",
                confirmCancelRun: "Cancel execution",
                keepRunning: "Keep running",
                workerConcurrency: "Active",
                workerCompleted: "Completed",
                workerFailed: "Failed",
                workerCancelled: "Cancelled",
                parallelStatuses: {
                  queued: "Queued",
                  running: "Running",
                  cancelled: "Cancelled",
                  completed: "Completed",
                  failed: "Failed",
                  unknown: "Unknown",
                },
                failureClasses: {
                  workerFailure: "Classified failure: worker error.",
                  cancelled: "Classified cancellation.",
                  executionFailure: "Classified failure: aggregate state.",
                },
              },
            },
          },
          emitter: { on: vi.fn(), emit: vi.fn() },
          setHeaders: () => ({}),
          Logout: vi.fn(),
          ...overrides,
        },
      },
    });
  }

  it("renders the performed tests dashboard with metrics and guidance", async () => {
    api.get.mockResolvedValue({ data: [{ id: 1, name: "Regression" }] });

    const wrapper = mountTestsPerformed();

    await vi.waitFor(() => expect(api.get).toHaveBeenCalled());

    expect(wrapper.find(".testsperformed-hero").exists()).toBe(true);
    expect(wrapper.findAll(".testsperformed-metric")).toHaveLength(4);
    expect(wrapper.find(".testsperformed-workspace").exists()).toBe(true);
    expect(wrapper.findAll(".testsperformed-panel")).toHaveLength(3);
    expect(wrapper.find(".testsperformed-parallel-panel").exists()).toBe(true);
    expect(wrapper.findComponent({ name: "splitpanes" }).exists()).toBe(false);
    expect(wrapper.text()).toContain("Select a run first.");
  });

  it("shows status labels on test cards", async () => {
    api.get.mockResolvedValue({ data: [] });
    const wrapper = mountTestsPerformed();

    wrapper.vm.arrayTest = [
      { id: 1, name: "Draft test", status: 0 },
      { id: 2, name: "Successful test", status: 1 },
      { id: 3, name: "Broken test", status: 2 },
    ];
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".testsperformed-test-card")).toHaveLength(3);
    expect(wrapper.text()).toContain("Pending");
    expect(wrapper.text()).toContain("Passed");
    expect(wrapper.text()).toContain("Failed");
  });

  it("shows failed for Postman cards when the execution payload failed", async () => {
    api.get.mockResolvedValue({ data: [] });
    const wrapper = mountTestsPerformed();

    wrapper.vm.arrayTest = [
      {
        id: 17,
        name: "postman",
        status: 1,
        type: "postman",
        data: JSON.stringify([
          {
            name: "Newman",
            method: "NEWMAN",
            status: 0,
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
    ];
    await wrapper.vm.$nextTick();

    const statusBadge = wrapper.get(".testsperformed-status");
    expect(statusBadge.text()).toBe("Failed");
    expect(statusBadge.classes()).toContain("danger");
  });

  it("renders parallel execution worker states and classified failures", async () => {
    api.get.mockImplementation((url) => {
      if (url.includes("/parallel-runs")) {
        return Promise.resolve({
          data: [
            {
              id: 91,
              status: "failed",
              requestedConcurrency: 3,
              activeWorkers: 0,
              completedWorkers: 2,
              failedWorkers: 1,
              cancelledWorkers: 0,
              resultSummary: [
                { workerId: "worker-a", status: "completed" },
                { workerId: "worker-b", status: "failed" },
              ],
            },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });

    const wrapper = mountTestsPerformed();

    await vi.waitFor(() =>
      expect(wrapper.find(".testsperformed-parallel-card").exists()).toBe(true),
    );

    expect(wrapper.text()).toContain("Run #91");
    expect(wrapper.text()).toContain("worker-a");
    expect(wrapper.text()).toContain("worker-b");
    expect(wrapper.text()).toContain("Classified failure: worker error.");
    expect(wrapper.find(".testsperformed-cancel-button").exists()).toBe(false);
  });

  it("confirms cancellation and reflects the server response", async () => {
    api.get.mockImplementation((url) => {
      if (url.includes("/parallel-runs")) {
        return Promise.resolve({
          data: [
            {
              id: 92,
              status: "running",
              requestedConcurrency: 2,
              activeWorkers: 1,
              completedWorkers: 0,
              failedWorkers: 0,
              cancelledWorkers: 0,
              resultSummary: [],
            },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });
    api.post.mockResolvedValue({
      data: {
        id: 92,
        status: "cancelled",
        requestedConcurrency: 2,
        activeWorkers: 0,
        completedWorkers: 0,
        failedWorkers: 0,
        cancelledWorkers: 1,
        resultSummary: [{ workerId: "worker-a", status: "cancelled" }],
      },
    });

    const wrapper = mountTestsPerformed({
      $showConfirm: vi.fn().mockResolvedValue(true),
    });

    await vi.waitFor(() =>
      expect(wrapper.find(".testsperformed-cancel-button").exists()).toBe(true),
    );
    await wrapper.get(".testsperformed-cancel-button").trigger("click");

    await vi.waitFor(() => expect(api.post).toHaveBeenCalled());

    expect(api.post).toHaveBeenCalledWith(
      "/api/projects/9/parallel-runs/92/cancel",
      {},
      { headers: {} },
    );
    expect(wrapper.text()).toContain("Cancelled");
    expect(wrapper.text()).toContain("Classified cancellation.");
  });

  it("stops polling and aborts pending parallel run requests on unmount", async () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    const abort = vi.fn();
    const originalAbortController = global.AbortController;
    global.AbortController = vi.fn(() => ({ abort, signal: {} }));
    api.get.mockResolvedValue({ data: [] });

    const wrapper = mountTestsPerformed();
    wrapper.unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(abort).toHaveBeenCalled();

    global.AbortController = originalAbortController;
  });
});
