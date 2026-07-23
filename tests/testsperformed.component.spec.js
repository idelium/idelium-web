import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));

import TestsPerformed from "@/view/testsperformed.vue";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("tests performed component", () => {
  beforeEach(() => {
    api.get.mockReset();
    useSessionStore(pinia).selectProject(9);
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
            },
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
    expect(wrapper.findAll(".testsperformed-metric")).toHaveLength(3);
    expect(wrapper.find(".testsperformed-workspace").exists()).toBe(true);
    expect(wrapper.findAll(".testsperformed-panel")).toHaveLength(3);
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
});
