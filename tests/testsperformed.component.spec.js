import { shallowMount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
const postmanResponseModalShow = vi.hoisted(() => vi.fn());

vi.mock("@/services/apiClient", () => ({ default: api }));

import TestsPerformed from "@/view/testsperformed.vue";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("tests performed component", () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
    postmanResponseModalShow.mockReset();
    vi.useRealTimers();
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      value: vi.fn(),
    });
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
          modalPostmanResponse: {
            template: "<div />",
            methods: { showModal: postmanResponseModalShow },
          },
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
                showLatestResult: "Show latest result",
                testRunningTab: "Test running",
                testResultsTab: "Test results",
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
                statusSkipped: "Skipped",
                executionSummary: "Execution summary",
                executionSummaryHelp: "Review the selected execution.",
                selectedRun: "Selected run",
                selectedItem: "Selected",
                cycleDuration: "Cycle duration",
                testsInRun: "Tests in run",
                stepsInTest: "Steps in test",
                showStepResults: "Show step results",
                stepResults: "Step-by-step results",
                selectTestFirst: "Select a test to see its steps.",
                emptySteps: "No steps were recorded.",
                stepDuration: "Step duration",
                parallelRuns: "Parallel executions",
                liveRuns: "Live runs workspace",
                parallelRunsDescription: "Monitor distributed runs.",
                liveRunsDescription: "Track live execution telemetry.",
                liveTransportStatus:
                  "Live updates: {transport} · {status} · Last updated {updated}",
                liveTransportPolling: "secure polling",
                liveTransportHealthy: "connected",
                liveTransportDegraded: "retrying",
                liveTransportPending: "pending",
                parallelRunLabel: "Run",
                classicRunSource: "Classic CLI result stream",
                emptyParallelRuns: "No parallel runs.",
                cancelRun: "Cancel run",
                cancelRunTitle: "Cancel parallel execution?",
                cancelRunMessage:
                  "Ask the server to cancel run #{runId}. Impact {scope}.",
                confirmCancelRun: "Cancel execution",
                keepRunning: "Keep running",
                retryTitle: "Retry and rerun",
                rerun: "Rerun full",
                retryFailed: "Retry failed",
                retryRunTitle: "Create a derived execution?",
                retryRunMessage:
                  "Create a new run from #{runId} using {scope}.",
                confirmRetryRun: "Create run",
                keepCurrentRun: "Keep current run",
                retryRequested: "Retry request submitted.",
                retryCreated: "Derived run #{runId} was created.",
                retryFailedRequest: "Retry request failed.",
                retryPreflightRequired: "Preflight is required.",
                retryStates: {
                  eligible: "This run can be retried safely.",
                  "no-failed-scope": "No failed scope is available.",
                  "preflight-required": "Preflight is required.",
                  unauthorized: "Retry is not allowed.",
                  "unsupported-runtime": "Runner does not support retry.",
                },
                cancellationStates: {
                  "cancellation-requested": "Cancellation requested.",
                  cancelled: "Cancellation confirmed.",
                  cancelling: "Cancellation is in progress.",
                  rejected: "Cancellation rejected.",
                  requested: "Cancellation requested.",
                  retryable: "Retry safely.",
                },
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
                actions: "Actions",
                allStatuses: "All statuses",
                clearFilters: "Clear filters",
                noResults: "No runs match filters.",
                resultCount: "{count} executions",
                runHistory: "Run history",
                runDetail: "Advanced execution tools",
                saveView: "Save view",
                status: "Status",
                tag: "Tag",
                initiator: "Initiator",
                correlationId: "Correlation ID",
                partialRunDetail: "Partial snapshot.",
                partialRunStatus: "Partial snapshot",
                drilldownTitle: "Execution drill-down",
                artifactViewer: "Secure artifact viewer",
                fullArtifact: "Open full view",
                noArtifacts: "No artifacts.",
                noLogs: "No logs.",
                noAdvancedData: "No advanced data.",
                artifactStates: {
                  available: "Available.",
                  expired: "Expired.",
                  oversized: "Oversized.",
                  quarantined: "Quarantined.",
                  redacted: "Redacted body.",
                  unavailable: "Unavailable.",
                },
                runDetailTabs: {
                  overview: "Overview",
                  tests: "Tests",
                  workers: "Workers",
                  timeline: "Timeline",
                  artifacts: "Artifacts",
                  logs: "Logs",
                  reports: "Reports",
                },
                paginationSummary:
                  "Page {page} of {lastPage} · {total} results",
                parallelStatuses: {
                  queued: "Queued",
                  running: "Running",
                  cancelling: "Cancelling",
                  pending: "Pending",
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
              Postman: {
                id: "#",
                status: "status",
                request: "request",
                method: "method",
                url: "url",
                assertions: "assertions",
                diagnostic: "diagnostic",
                response: "response",
                showResponse: "show response",
                time: "time",
                executionResults: "Postman execution results",
                executionResultsHelp: "Review captured Postman calls.",
                emptyResults: "No Postman execution data is available.",
                responsePreview: "Response preview",
                hideResponse: "Hide response",
                requests: "requests",
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
    expect(wrapper.findAll(".testsperformed-panel")).toHaveLength(4);
    expect(wrapper.find(".testsperformed-step-panel").exists()).toBe(true);
    expect(wrapper.find(".testsperformed-parallel-panel").exists()).toBe(true);
    expect(wrapper.find(".testsperformed-analytics-panel").exists()).toBe(true);
    expect(wrapper.findAll(".testsperformed-page-tab")).toHaveLength(2);
    expect(wrapper.find(".testsperformed-page-tab.active").text()).toContain(
      "Test results",
    );
    expect(wrapper.findComponent({ name: "splitpanes" }).exists()).toBe(false);
    expect(wrapper.text()).toContain("Select a run first.");
  });

  it("separates live runs and historical results into top-level tabs", async () => {
    api.get.mockResolvedValue({ data: [] });
    const replace = vi.fn();
    const wrapper = mountTestsPerformed({
      $route: {
        name: "testsperformed",
        query: { cyclePage: "1", cyclePerPage: "25", view: "running" },
      },
      $router: { replace },
    });

    expect(wrapper.vm.activeExecutionTab).toBe("running");
    expect(wrapper.find(".testsperformed-summary").attributes("style")).toBe(
      "display: none;",
    );
    expect(
      wrapper.find(".testsperformed-parallel-panel").attributes("style"),
    ).toBe(undefined);

    await wrapper.findAll(".testsperformed-page-tab")[1].trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.activeExecutionTab).toBe("results");
    expect(
      wrapper.find(".testsperformed-summary").attributes("style"),
    ).not.toContain("display: none");
    expect(
      wrapper.find(".testsperformed-parallel-panel").attributes("style"),
    ).toContain("display: none");
    expect(replace).toHaveBeenCalledWith({
      query: { cyclePage: "1", cyclePerPage: "25", view: "results" },
    });
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

  it("shows Postman request details inside step results", async () => {
    api.get.mockResolvedValue({ data: [] });
    const wrapper = mountTestsPerformed();

    await wrapper.setData({
      selectedTestName: "API regression",
      selectedTestSteps: [
        {
          data: JSON.stringify([
            {
              assertions: [{ name: "status is 200", passed: true }],
              method: "GET",
              name: "Get health",
              response: { ok: true },
              status: 200,
              time: 123,
              url: "https://postman-echo.com/get",
            },
          ]),
          id: 12,
          name: "postman",
          status: 1,
          type: "postman",
        },
      ],
    });

    const table = wrapper.findComponent({ name: "PostmanResultTable" });
    expect(table.exists()).toBe(true);
    expect(table.props("results")).toMatchObject([
      {
        method: "GET",
        name: "Get health",
        status: 200,
        url: "https://postman-echo.com/get",
      },
    ]);

    await table.vm.$emit("show-response", table.props("results")[0]);
    await wrapper.vm.$nextTick();

    expect(postmanResponseModalShow).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        name: "Get health",
        response: { ok: true },
      }),
    );
  });

  it("shows Postman details when step results only identify the Postman step", async () => {
    api.get.mockResolvedValue({ data: [] });
    const wrapper = mountTestsPerformed();

    await wrapper.setData({
      selectedPerformedTest: {
        data: JSON.stringify([
          {
            assertions: [{ name: "status is 200", passed: true }],
            method: "POST",
            name: "Create payload",
            status: 200,
            url: "https://postman-echo.com/post",
          },
        ]),
        id: 17,
        name: "Postman",
        type: "postman",
      },
      selectedTestName: "API regression",
      selectedTestSteps: [
        {
          data: null,
          id: 12,
          name: "postman",
          status: 1,
          type: "postman_collection",
        },
      ],
    });

    const table = wrapper.findComponent({ name: "PostmanResultTable" });

    expect(table.exists()).toBe(true);
    expect(table.props("results")).toMatchObject([
      {
        method: "POST",
        name: "Create payload",
        status: 200,
        url: "https://postman-echo.com/post",
      },
    ]);
  });

  it("uses performed test Postman data when the step record has no request payload", async () => {
    api.get.mockResolvedValue({ data: [] });
    const wrapper = mountTestsPerformed();

    await wrapper.setData({
      selectedPerformedTest: {
        id: 17,
        name: "Postman",
        postmanData: JSON.stringify([
          {
            method: "GET",
            name: "Read cookies",
            status: 200,
            url: "https://postman-echo.com/cookies",
          },
        ]),
        type: "postman",
      },
      selectedTestName: "API regression",
      selectedTestSteps: [
        {
          data: null,
          id: 12,
          name: "postman2",
          status: 1,
          type: "postman",
        },
      ],
    });

    const table = wrapper.findComponent({ name: "PostmanResultTable" });

    expect(table.exists()).toBe(true);
    expect(table.props("results")).toMatchObject([
      {
        method: "GET",
        name: "Read cookies",
        status: 200,
        url: "https://postman-echo.com/cookies",
      },
    ]);
  });

  it("shows an empty Postman details panel when the backend only sends a Postman-like step name", async () => {
    api.get.mockResolvedValue({ data: [] });
    const wrapper = mountTestsPerformed();

    await wrapper.setData({
      selectedTestName: "API regression",
      selectedTestSteps: [
        {
          data: null,
          id: 12,
          name: "postman2",
          status: 1,
        },
      ],
    });

    expect(wrapper.text()).toContain("Postman execution results");
    expect(wrapper.text()).toContain("No Postman execution data is available.");
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

  it("refreshes the selected test cycle and opens the newest execution automatically", async () => {
    api.get.mockImplementation((url) => {
      if (url.includes("testcycles/9")) {
        return Promise.resolve({
          data: [{ id: 7, name: "Postman cycle" }],
        });
      }
      if (url.includes("testcycles-performed/7")) {
        return Promise.resolve({
          data: [
            { id: 45, date: "2026-07-29 16:00:00", status: 2 },
            { id: 44, date: "2026-07-29 15:00:00", status: 1 },
          ],
        });
      }
      if (url.includes("tests-performed/45")) {
        return Promise.resolve({
          data: [{ id: 5, name: "latest run test", status: 2 }],
        });
      }
      return Promise.resolve({ data: [] });
    });
    const replace = vi.fn();
    const wrapper = mountTestsPerformed({
      $router: { replace },
      $route: { name: "testsperformed", query: {} },
    });

    await wrapper.vm.refreshResults();

    await vi.waitFor(() => expect(wrapper.vm.testCycleSelected).toBe(7));
    expect(wrapper.vm.testCycleDateSelected).toBe(45);
    expect(wrapper.vm.arrayTest).toEqual([
      { id: 5, name: "latest run test", status: 2 },
    ]);
    expect(api.get).toHaveBeenCalledWith("/api/tests-performed/45", {
      headers: {},
      params: {
        page: 1,
        perPage: 25,
        sort: "id",
        direction: "asc",
      },
    });
    expect(replace).toHaveBeenLastCalledWith({
      query: {
        testCycleId: "7",
        runId: "45",
        runPage: "1",
        runPerPage: "25",
        testPage: "1",
        testPerPage: "25",
      },
    });
  });

  it("provides an explicit button to show the latest execution result", async () => {
    api.get.mockImplementation((url) => {
      if (url.includes("testcycles/9")) {
        return Promise.resolve({ data: [{ id: 7, name: "Postman cycle" }] });
      }
      if (url.includes("testcycles-performed/7")) {
        return Promise.resolve({
          data: [{ id: 45, date: "2026-07-29 16:00:00", status: 2 }],
        });
      }
      if (url.includes("tests-performed/45")) {
        return Promise.resolve({
          data: [{ id: 5, name: "latest run test", status: 2 }],
        });
      }
      return Promise.resolve({ data: [] });
    });
    const wrapper = mountTestsPerformed({
      $route: { name: "testsperformed", query: {} },
    });

    await wrapper.find(".testsperformed-latest-result").trigger("click");

    await vi.waitFor(() => expect(wrapper.vm.testCycleDateSelected).toBe(45));
    expect(wrapper.text()).toContain("latest run test");
    expect(wrapper.find(".testsperformed-latest-result").text()).toContain(
      "Show latest result",
    );
  });

  it("highlights the selected performed cycle immediately on click", async () => {
    api.get.mockReturnValue(new Promise(() => {}));
    const wrapper = mountTestsPerformed({
      $route: { name: "testsperformed", query: {} },
    });
    await wrapper.setData({
      arrayTestCyclesDate: [
        { id: 45, date: "2026-07-29 16:00:00", status: 2 },
        { id: 44, date: "2026-07-29 15:00:00", status: 1 },
      ],
      testCycleDateSelected: null,
    });

    const runButtons = wrapper
      .findAll(".testsperformed-item")
      .filter((button) => button.text().includes("2026-07-29"));

    await runButtons[1].trigger("click");

    expect(wrapper.vm.testCycleDateSelected).toBe(44);
    expect(runButtons[1].classes()).toContain("active");
    expect(runButtons[1].attributes("aria-pressed")).toBe("true");
    expect(runButtons[1].text()).toContain("Selected");
  });

  it("shows all tests for a run and renders selected test steps inline", async () => {
    api.get.mockImplementation((url) => {
      if (url.includes("testcycles-performed/7")) {
        return Promise.resolve({
          data: [
            {
              id: 45,
              date: "2026-07-29 16:00:00",
              status: 2,
              created_at: "2026-07-29T16:00:00.000Z",
              updated_at: "2026-07-29T16:00:04.000Z",
            },
          ],
        });
      }
      if (url.includes("tests-performed/45")) {
        return Promise.resolve({
          data: [
            { id: 5, name: "login", status: 1 },
            { id: 6, name: "checkout", status: 2 },
            { id: 7, name: "logout", status: 5 },
          ],
        });
      }
      if (url.includes("steps-performed/5")) {
        return Promise.resolve({
          data: [
            {
              id: 11,
              name: "open browser",
              status: 1,
              type: "selenium",
              created_at: "2026-07-29T16:00:00.000Z",
              updated_at: "2026-07-29T16:00:01.200Z",
            },
            {
              id: 12,
              name: "submit form",
              status: 2,
              type: "selenium",
              created_at: "2026-07-29T16:00:02.000Z",
              updated_at: "2026-07-29T16:00:02.500Z",
            },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });
    const wrapper = mountTestsPerformed({
      $route: { name: "testsperformed", query: {} },
    });

    await wrapper.vm.getTestCyclesDate(7);
    await wrapper.vm.getTest(45);

    await vi.waitFor(() =>
      expect(wrapper.vm.selectedTestSteps).toHaveLength(2),
    );
    expect(wrapper.findAll(".testsperformed-test-card")).toHaveLength(3);
    expect(wrapper.text()).toContain("login");
    expect(wrapper.text()).toContain("checkout");
    expect(wrapper.text()).toContain("logout");
    expect(wrapper.text()).toContain("open browser");
    expect(wrapper.text()).toContain("submit form");
    expect(wrapper.text()).toContain("4.00 s");
    expect(wrapper.text()).toContain("1.20 s");
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

  it("shows recent classic CLI activity when no parallel run telemetry exists", async () => {
    api.get.mockImplementation((url) => {
      if (url.includes("/parallel-runs")) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes("testcycles-performed/7")) {
        return Promise.resolve({
          data: [
            {
              id: 51,
              cycleName: "CLI demo cycle",
              date: "2026-07-30 12:35:00",
              status: 0,
              target: "local browser",
            },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });

    const wrapper = mountTestsPerformed({
      $route: { name: "testsperformed", query: {} },
    });
    await wrapper.setData({
      activeExecutionTab: "running",
      arrayTestCycles: [{ id: 7, name: "CLI demo cycle" }],
      testCycleSelected: 7,
    });

    await wrapper.vm.loadParallelRuns();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.visibleExecutionActivity).toMatchObject([
      {
        classic: true,
        cycle: { name: "CLI demo cycle" },
        status: "pending",
        target: "local browser",
      },
    ]);
    expect(wrapper.text()).toContain("CLI demo cycle");
    expect(wrapper.text()).toContain("Classic CLI result stream");
  });

  it("renders run history in the shared data table with safe saved views", async () => {
    const replace = vi.fn();
    api.get.mockImplementation((url) => {
      if (url.includes("testcycles-performed")) {
        return Promise.resolve({
          data: [
            {
              id: 44,
              cycleName: "postman cycle",
              date: "2026-07-29 12:00:00",
              status: 2,
              target: "postman-runner",
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

    await wrapper.vm.getTestCyclesDate(7);
    await wrapper.setData({
      runHistoryStatus: "failed",
      runHistoryTag: "smoke",
    });
    wrapper.vm.applyRunHistoryFilters();
    wrapper.vm.saveRunHistoryView();
    await wrapper.vm.$nextTick();

    expect(
      wrapper.findComponent({ name: "EnterpriseDataTable" }).exists(),
    ).toBe(true);
    expect(wrapper.vm.runHistoryRows[0]).toMatchObject({
      cycle: "postman cycle",
      id: 44,
      target: "postman-runner",
    });
    expect(wrapper.vm.runHistorySavedViews).toHaveLength(1);
    expect(replace).toHaveBeenCalledWith({
      query: expect.objectContaining({
        pageSize: "25",
        projectId: "9",
        status: "failed",
        tag: "smoke",
      }),
    });
  });

  it("renders the canonical run detail overview and persists the active tab", async () => {
    const replace = vi.fn();
    api.get.mockResolvedValue({ data: [] });

    const wrapper = mountTestsPerformed({
      $route: {
        name: "execution-detail",
        params: { projectId: "9", runId: "44" },
        query: { tab: "logs" },
      },
      $router: { replace },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find(".testsperformed-run-detail").exists()).toBe(true);
    expect(wrapper.text()).toContain("#44");
    expect(wrapper.text()).toContain("Advanced execution tools");
    expect(wrapper.text()).toContain("Partial snapshot.");
    expect(wrapper.vm.runDetailStatusLabel(wrapper.vm.currentRunDetail)).toBe(
      "Partial snapshot",
    );
    expect(wrapper.vm.runDetailActiveTab).toBe("logs");
    expect(wrapper.text()).toContain("No logs.");

    await wrapper.setData({
      arrayTest: [{ id: 5, name: "login", status: 1 }],
    });

    await wrapper
      .findAll(".testsperformed-run-tabs .testsperformed-status-filter")
      .find((button) => button.text() === "Tests")
      .trigger("click");

    expect(wrapper.text()).toContain("login");

    await wrapper
      .findAll(".testsperformed-run-tabs .testsperformed-status-filter")
      .find((button) => button.text() === "Artifacts")
      .trigger("click");

    expect(replace).toHaveBeenCalledWith({
      query: { tab: "artifacts" },
    });
  });

  it("preserves scroll position when changing run detail tabs", async () => {
    const replace = vi.fn().mockResolvedValue();
    const scrollTo = window.scrollTo;
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback();
        return 1;
      });
    Object.defineProperty(window, "scrollX", {
      configurable: true,
      value: 12,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 480,
    });
    api.get.mockResolvedValue({ data: [] });

    const wrapper = mountTestsPerformed({
      $route: {
        name: "execution-detail",
        params: { projectId: "9", runId: "44" },
        query: { tab: "overview" },
      },
      $router: { replace },
    });

    await wrapper.vm.$nextTick();
    await wrapper
      .findAll(".testsperformed-run-tabs .testsperformed-status-filter")
      .find((button) => button.text() === "Reports")
      .trigger("click");
    await Promise.resolve();

    expect(replace).toHaveBeenCalledWith({ query: { tab: "reports" } });
    expect(scrollTo).toHaveBeenCalledWith(12, 480);
    requestAnimationFrame.mockRestore();
  });

  it("renders route-backed drill-down nodes for the selected run", async () => {
    const push = vi.fn();
    api.get.mockResolvedValue({ data: [] });

    const wrapper = mountTestsPerformed({
      $route: {
        name: "execution-detail",
        params: { projectId: "9", runId: "44" },
        query: { tab: "tests" },
      },
      $router: { push, replace: vi.fn() },
    });
    await wrapper.setData({
      arrayTest: [
        {
          data: [
            {
              assertions: [{ name: "status", passed: false }],
              method: "GET",
              name: "Health",
              status: 200,
              url: "https://example.org/health",
            },
          ],
          id: 17,
          name: "Postman",
          type: "postman",
        },
      ],
    });

    expect(wrapper.findAll(".testsperformed-drilldown-node").length).toBe(3);
    expect(wrapper.text()).toContain("Health");

    await wrapper.findAll(".testsperformed-drilldown-node")[1].trigger("click");
    expect(push).toHaveBeenCalledWith({
      name: "execution-detail",
      params: { projectId: "9", runId: "44" },
      query: { detailId: "postman:17:1", tab: "tests" },
    });
  });

  it("renders secure artifacts and opens full view without losing route context", async () => {
    const push = vi.fn();
    api.get.mockResolvedValue({ data: [] });

    const wrapper = mountTestsPerformed({
      $route: {
        name: "execution-detail",
        params: { projectId: "9", runId: "44" },
        query: { tab: "artifacts" },
      },
      $router: { push, replace: vi.fn() },
    });
    await wrapper.setData({
      arrayTest: [
        {
          artifacts: [
            {
              body: { ok: true },
              contentType: "application/json",
              downloadUrl: "/api/projects/9/runs/44/artifacts/response",
              id: "response",
              name: "Response body",
              runId: 44,
              sizeBytes: 80,
            },
          ],
          id: 17,
        },
      ],
    });

    expect(wrapper.find(".testsperformed-artifact-card").exists()).toBe(true);
    expect(wrapper.text()).toContain("Response body");
    expect(wrapper.text()).toContain("Available.");

    await wrapper.get(".testsperformed-artifact-card button").trigger("click");
    expect(push).toHaveBeenCalledWith({
      name: "execution-detail",
      params: { projectId: "9", runId: "44" },
      query: { artifactId: "response", tab: "artifacts" },
    });
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
      {
        actor: "current-user",
        reason: "",
        runId: "92",
      },
      {
        headers: {
          "Idempotency-Key": "cancel:92:current-user",
        },
      },
    );
    expect(wrapper.text()).toContain("Cancelled");
    expect(wrapper.text()).toContain("Classified cancellation.");
    expect(wrapper.text()).toContain("Cancellation confirmed.");
  });

  it("creates a traceable retry-failed run without mutating history", async () => {
    const push = vi.fn();
    api.get.mockResolvedValue({ data: [] });
    api.post.mockResolvedValue({
      data: { id: 45, projectId: 9, sourceRunId: 44 },
    });

    const wrapper = mountTestsPerformed({
      $route: {
        name: "execution-detail",
        params: { projectId: "9", runId: "44" },
        query: { tab: "tests" },
      },
      $router: { push, replace: vi.fn() },
      $showConfirm: vi.fn().mockResolvedValue(true),
    });
    await wrapper.setData({
      arrayTest: [
        {
          data: [
            {
              assertions: [{ name: "status", passed: false }],
              method: "GET",
              name: "Health",
              status: 500,
              url: "https://example.org/health",
            },
          ],
          id: 17,
          name: "Postman",
          type: "postman",
        },
      ],
      arrayTestCyclesDate: [
        {
          configuration: { authorization: "Bearer secret-token" },
          id: 44,
          runtime: "postman",
          status: "failed",
          version: "snapshot-1",
        },
      ],
    });

    await wrapper
      .findAll(".testsperformed-run-action-buttons button")
      .find((button) => button.text() === "Retry failed")
      .trigger("click");

    await vi.waitFor(() => expect(api.post).toHaveBeenCalled());

    expect(api.post).toHaveBeenCalledWith(
      "/api/projects/9/parallel-runs/44/retry",
      expect.objectContaining({
        configurationSnapshot: { authorization: "[REDACTED]" },
        scope: "failed",
        selectedFailedScope: expect.arrayContaining(["postman:17:1"]),
        sourceRunId: "44",
        sourceVersion: "snapshot-1",
      }),
      {
        headers: {
          "Idempotency-Key": "retry:44:failed:current-user",
        },
      },
    );
    expect(push).toHaveBeenCalledWith({
      name: "execution-detail",
      params: { projectId: "9", runId: "45" },
      query: { tab: "overview" },
    });
    expect(wrapper.vm.arrayTestCyclesDate[0].status).toBe("failed");
  });

  it("shows degraded live transport state and schedules bounded fallback polling", async () => {
    vi.useFakeTimers();
    api.get.mockRejectedValue({
      code: "ERR_NETWORK",
      message: "token=abc123 failed",
      response: { status: 503 },
    });

    const wrapper = mountTestsPerformed();

    await vi.waitFor(() =>
      expect(wrapper.vm.livePollingState.degraded).toBe(true),
    );

    expect(wrapper.text()).toContain("retrying");
    expect(wrapper.vm.livePollingState.lastError).toEqual({
      code: "ERR_NETWORK",
      message: "token=[REDACTED] failed",
      status: 503,
    });
    expect(wrapper.vm.livePollingState.nextDelayMs).toBeGreaterThan(5000);

    wrapper.unmount();
  });

  it("stops polling and aborts pending parallel run requests on unmount", async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const abort = vi.fn();
    const originalAbortController = global.AbortController;
    global.AbortController = vi.fn(function AbortController() {
      return { abort, signal: {} };
    });
    api.get.mockResolvedValue({ data: [] });

    const wrapper = mountTestsPerformed();
    wrapper.unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(abort).toHaveBeenCalled();

    global.AbortController = originalAbortController;
  });
});
