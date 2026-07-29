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
                downloadReport: "Download report",
                reportUnavailable: "Report unavailable",
                reportForRun: "for execution",
                downloadFailed: "Report download failed.",
                viewDetails: "View details",
                statusPending: "Pending",
                statusPassed: "Passed",
                statusFailed: "Failed",
                parallelRuns: "Parallel executions",
                liveRuns: "Live runs workspace",
                parallelRunsDescription: "Monitor distributed runs.",
                liveRunsDescription: "Track live execution telemetry.",
                parallelRunLabel: "Run",
                emptyParallelRuns: "No parallel runs.",
                cancelRun: "Cancel run",
                cancelRunTitle: "Cancel parallel execution?",
                cancelRunMessage: "Ask the server to cancel this run.",
                confirmCancelRun: "Cancel execution",
                keepRunning: "Keep running",
                workerConcurrency: "Active",
                progress: "Progress",
                workerCompleted: "Completed",
                workerFailed: "Failed",
                workerCancelled: "Cancelled",
                analyticsTitle: "Quality analytics",
                analyticsDescription: "Review quality trends.",
                analyticsWindow: "Window",
                analyticsTimezone: "Timezone",
                passRate: "Pass rate",
                failureRate: "Failure rate",
                averageDuration: "Avg duration",
                averageQueue: "Avg queue",
                flakyTests: "Flaky tests",
                previousPage: "Previous",
                nextPage: "Next",
                paginationSummary:
                  "Page {page} of {lastPage} · {total} results",
                parallelStatuses: {
                  queued: "Queued",
                  running: "Running",
                  cancelled: "Cancelled",
                  completed: "Completed",
                  passed: "Passed",
                  failed: "Failed",
                  unknown: "Unknown",
                },
                staleTelemetry: "Telemetry is stale.",
                degradedChannel: "Live updates are degraded.",
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
          $router: { replace: vi.fn() },
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
    expect(wrapper.find(".testsperformed-analytics-panel").exists()).toBe(true);
    expect(wrapper.findComponent({ name: "splitpanes" }).exists()).toBe(false);
    expect(wrapper.text()).toContain("Select a run first.");
  });

  it("loads test cycles through a bounded reload-safe page", async () => {
    api.get.mockResolvedValue({
      data: {
        data: [{ id: 7, name: "Regression" }],
        meta: {
          page: 2,
          pageSize: 25,
          total: 31,
          lastPage: 2,
          sort: "id",
          direction: "asc",
        },
      },
    });
    const replace = vi.fn();
    const wrapper = mountTestsPerformed({
      $route: {
        name: "testsperformed",
        query: { cyclePage: "2", cyclePerPage: "25" },
      },
      $router: { replace },
    });

    await vi.waitFor(() => expect(wrapper.vm.arrayTestCycles).toHaveLength(1));

    expect(api.get).toHaveBeenCalledWith("/api/testcycles/9", {
      headers: {},
      params: {
        page: 2,
        pageSize: 25,
        sort: "id",
        direction: "asc",
      },
    });
    expect(wrapper.vm.cyclePagination).toMatchObject({
      page: 2,
      total: 31,
      lastPage: 2,
    });
    expect(replace).not.toHaveBeenCalled();
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

  it("enables only API-advertised report formats and downloads with project context", async () => {
    api.get.mockImplementation((url) => {
      if (url.includes("testcycles-performed")) {
        return Promise.resolve({
          data: [
            {
              id: 44,
              date: "2026-07-27",
              reports: [
                {
                  format: "json",
                  url: "reports/44.json",
                  filename: "execution-44.json",
                },
                { format: "html", url: "reports/44.html" },
              ],
            },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });
    URL.createObjectURL = URL.createObjectURL || vi.fn();
    URL.revokeObjectURL = URL.revokeObjectURL || vi.fn();
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:report");
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    const wrapper = mountTestsPerformed();
    await wrapper.vm.getTestCyclesDate(7);
    await vi.waitFor(() =>
      expect(wrapper.findAll(".testsperformed-report-button")).toHaveLength(4),
    );

    const buttons = wrapper.findAll(".testsperformed-report-button");
    expect(buttons.map((button) => button.attributes("disabled"))).toEqual([
      "",
      undefined,
      "",
      undefined,
    ]);
    expect(buttons[1].attributes("aria-label")).toBe(
      "Download report: JSON for execution #44",
    );

    api.get.mockResolvedValueOnce({
      data: new Blob(["{}"], { type: "application/json" }),
      headers: { "content-type": "application/json" },
    });
    await buttons[1].trigger("click");

    await vi.waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/api/reports/44.json", {
        headers: {},
        responseType: "blob",
      }),
    );
    expect(click).toHaveBeenCalled();
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:report");
  });

  it("shows a visible report download error without exposing response payloads", async () => {
    api.get.mockImplementation((url) => {
      if (url.includes("testcycles-performed")) {
        return Promise.resolve({
          data: [
            {
              id: 45,
              date: "2026-07-27",
              availableReports: { json: { url: "reports/45.json" } },
            },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });
    const logout = vi.fn();
    const wrapper = mountTestsPerformed({ Logout: logout });
    await wrapper.vm.getTestCyclesDate(7);
    await vi.waitFor(() =>
      expect(wrapper.findAll(".testsperformed-report-button")).toHaveLength(4),
    );

    api.get.mockRejectedValueOnce({
      response: { status: 500, data: { secret: "do-not-render" } },
    });
    await wrapper.findAll(".testsperformed-report-button")[1].trigger("click");

    await vi.waitFor(() =>
      expect(wrapper.text()).toContain("Report download failed."),
    );
    expect(wrapper.text()).not.toContain("do-not-render");
    expect(logout).toHaveBeenCalled();
  });

  it("persists selected cycle and execution filters in the route query", async () => {
    api.get.mockImplementation((url) => {
      if (url.includes("testcycles-performed")) {
        return Promise.resolve({ data: [{ id: 44, date: "2026-07-28" }] });
      }
      if (url.includes("tests-performed")) {
        return Promise.resolve({ data: [{ id: 5, name: "postman" }] });
      }
      return Promise.resolve({ data: [] });
    });
    const replace = vi.fn();

    const wrapper = mountTestsPerformed({
      $router: { replace },
      $route: { name: "testsperformed", query: {} },
    });

    await wrapper.vm.getTestCyclesDate(7);
    expect(replace).toHaveBeenCalledWith({
      query: {
        testCycleId: "7",
        runPage: "1",
        runPerPage: "25",
      },
    });

    await wrapper.vm.getTest(44);
    expect(replace).toHaveBeenLastCalledWith({
      query: {
        testCycleId: "7",
        runId: "44",
        runPage: "1",
        runPerPage: "25",
        testPage: "1",
        testPerPage: "25",
      },
    });
  });

  it("uses server-side pagination metadata for executions and tests", async () => {
    api.get.mockImplementation((url) => {
      if (url.includes("testcycles-performed")) {
        return Promise.resolve({
          data: {
            data: [{ id: 44, date: "2026-07-28" }],
            meta: {
              pagination: {
                page: 1,
                perPage: 1,
                total: 2,
                lastPage: 2,
                sort: "date",
                direction: "desc",
              },
            },
          },
        });
      }
      if (url.includes("tests-performed")) {
        return Promise.resolve({
          data: {
            data: [{ id: 5, name: "postman" }],
            meta: {
              pagination: {
                page: 2,
                perPage: 1,
                total: 2,
                lastPage: 2,
                sort: "id",
                direction: "asc",
              },
            },
          },
        });
      }
      return Promise.resolve({ data: [] });
    });
    const replace = vi.fn();
    const wrapper = mountTestsPerformed({
      $router: { replace },
      $route: {
        name: "testsperformed",
        query: {
          runPage: "1",
          runPerPage: "1",
          testPage: "2",
          testPerPage: "1",
        },
      },
    });

    await wrapper.vm.getTestCyclesDate(7);

    expect(api.get).toHaveBeenCalledWith("/api/testcycles-performed/7", {
      headers: {},
      params: {
        page: 1,
        perPage: 1,
        sort: "date",
        direction: "desc",
      },
    });
    expect(wrapper.text()).toContain("Page 1 of 2");

    await wrapper.vm.getTest(44);

    expect(api.get).toHaveBeenCalledWith("/api/tests-performed/44", {
      headers: {},
      params: {
        page: 2,
        perPage: 1,
        sort: "id",
        direction: "asc",
      },
    });
    expect(wrapper.text()).toContain("Page 2 of 2");
  });

  it("renders quality analytics and persists analytics filters in the route query", async () => {
    api.get.mockResolvedValue({ data: [] });
    const replace = vi.fn();
    const wrapper = mountTestsPerformed({
      $router: { replace },
      $route: {
        name: "testsperformed",
        query: {
          analyticsWindow: "30d",
          analyticsTimezone: "Europe/Rome",
          status: "passed,failed",
        },
      },
    });

    wrapper.vm.arrayTest = [
      {
        id: 1,
        name: "Checkout",
        status: 1,
        durationMs: 100,
        queueMs: 10,
      },
      {
        id: 1,
        name: "Checkout",
        status: 2,
        durationMs: 300,
        queueMs: 30,
        diagnostic: "expected true",
      },
    ];
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Quality analytics");
    expect(wrapper.text()).toContain("50%");
    expect(wrapper.text()).toContain("200 ms");
    expect(wrapper.text()).toContain("Checkout");
    expect(wrapper.vm.analyticsQueryDescription).toContain("window=30d");
    expect(wrapper.vm.analyticsQueryDescription).toContain(
      "timezone=Europe%2FRome",
    );

    await wrapper.findAll(".testsperformed-status-filter")[2].trigger("click");

    expect(replace).toHaveBeenCalledWith({
      query: {
        analyticsWindow: "30d",
        analyticsTimezone: "Europe/Rome",
        status: "passed,failed,pending",
      },
    });
  });

  it("restores selected cycle and execution filters from a shareable URL", async () => {
    api.get.mockImplementation((url) => {
      if (url.endsWith("testcycles/9")) {
        return Promise.resolve({ data: [{ id: 7, name: "Regression" }] });
      }
      if (url.endsWith("testcycles-performed/7")) {
        return Promise.resolve({ data: [{ id: 44, date: "2026-07-28" }] });
      }
      if (url.endsWith("tests-performed/44")) {
        return Promise.resolve({ data: [{ id: 5, name: "postman" }] });
      }
      return Promise.resolve({ data: [] });
    });

    const wrapper = mountTestsPerformed({
      $route: {
        name: "testsperformed",
        query: { testCycleId: "7", runId: "44" },
      },
    });

    await vi.waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/api/tests-performed/44", {
        headers: {},
        params: {
          page: 1,
          perPage: 25,
          sort: "id",
          direction: "asc",
        },
      }),
    );

    expect(wrapper.vm.testCycleSelected).toBe(7);
    expect(wrapper.vm.testCycleDateSelected).toBe(44);
    expect(wrapper.vm.arrayTest).toEqual([{ id: 5, name: "postman" }]);
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

  it("renders live run progress, stale telemetry, filters, and detail action", async () => {
    const replace = vi.fn();
    api.get.mockImplementation((url) => {
      if (url.includes("/parallel-runs")) {
        return Promise.resolve({
          data: [
            {
              id: 93,
              activeWorkers: 1,
              canOpenDetails: true,
              cycleName: "release smoke",
              lastUpdateAt: "2026-07-29T10:00:00Z",
              progress: { completed: 1, total: 4 },
              projectId: 9,
              requestedConcurrency: 4,
              status: "running",
              target: "selenium-grid",
            },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });

    const wrapper = mountTestsPerformed({
      $route: { name: "testsperformed", query: {} },
      $router: { replace },
    });

    await vi.waitFor(() =>
      expect(wrapper.find(".testsperformed-live-progress").exists()).toBe(true),
    );

    expect(wrapper.text()).toContain("Live runs workspace");
    expect(wrapper.text()).toContain("release smoke");
    expect(wrapper.text()).toContain("Telemetry is stale.");
    expect(wrapper.get("[role='progressbar']").attributes("aria-label")).toBe(
      "release smoke: Progress 1/4",
    );

    await wrapper
      .get(".testsperformed-live-actions .testsperformed-page-button")
      .trigger("click");
    expect(replace).toHaveBeenCalledWith({ query: { runId: "93" } });
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
    global.AbortController = vi.fn(function AbortController() {
      return { abort, signal: {} };
    });
    api.get.mockResolvedValue({ data: [] });

    const wrapper = mountTestsPerformed();
    wrapper.unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(abort).toHaveBeenCalled();

    global.AbortController = originalAbortController;
  });
});
