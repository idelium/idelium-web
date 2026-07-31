import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/services/apiClient", () => ({ default: api }));

import TestCycles from "@/view/testcycles.vue";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("test-cycle creation component", () => {
  const testCycleCopy = {
    availableTests: "Available",
    builderDescription: "Build a run plan.",
    builderEyebrow: "Cycle builder",
    builderStepDescribeDescription: "Name and save the cycle.",
    builderStepDescribeTitle: "Name and save",
    builderStepOrderDescription: "Confirm the sequence.",
    builderStepOrderTitle: "Confirm order",
    builderStepSelectDescription: "Select tests.",
    builderStepSelectTitle: "Select tests",
    builderTitle: "Build the execution flow",
    commandLineCopy: "Copied",
    commandLineInfo: "Command",
    descriptionLabel: "Cycle description",
    nameLabel: "Cycle name",
    readyStatus: "Status",
    readyStatusIncomplete: "Incomplete",
    readyStatusReady: "Ready",
    selectedTests: "Selected",
  };

  function mountTestCycles(overrides = {}) {
    return shallowMount(TestCycles, {
      global: {
        plugins: [pinia],
        mocks: {
          $route: { name: "testcycles", params: {} },
          $router: { push: vi.fn(), replace: vi.fn() },
          config: {
            currentLanguage: "gb",
            serviceBaseUrl: "/api/",
            url: { tests: "tests", testcycles: "cycles" },
          },
          language: { gb: { TestCycles: testCycleCopy } },
          emitter: { on: vi.fn(), emit: vi.fn() },
          setHeaders: () => ({}),
          Logout: vi.fn(),
          ...overrides,
        },
      },
    });
  }

  it("submits a project-scoped cycle payload", async () => {
    api.get.mockResolvedValue({ data: [] });
    api.post.mockResolvedValue({ data: [] });
    useSessionStore(pinia).selectProject(9);
    const wrapper = mountTestCycles();
    await wrapper.setData({
      newNameTestCycle: " Release ",
      newDescriptionTestCycle: " Smoke ",
      arrayTestsSelectedDragged: [{ id: 1 }],
    });
    await wrapper.vm.saveTestCycle();
    await vi.waitFor(() => expect(api.post).toHaveBeenCalled());
    expect(api.post.mock.calls.at(-1)[1]).toEqual({
      name: "Release",
      description: "Smoke",
      config: '[{"id":1}]',
      idProject: 9,
    });
  });

  it("opens the new tab when there are no test cycles to modify", async () => {
    const router = { push: vi.fn(), replace: vi.fn() };
    api.get.mockResolvedValue({ data: [] });
    useSessionStore(pinia).selectProject(9);

    mountTestCycles({ $router: router });

    await vi.waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        name: "testcycles",
        params: { tab: "new" },
      }),
    );
  });

  it("loads test cycles through the enterprise grid contract when available", async () => {
    api.get.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({
      data: {
        data: [{ id: 3, name: "release", description: "Release cycle" }],
        meta: {
          page: 1,
          pageSize: 25,
          total: 1,
          lastPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    });
    useSessionStore(pinia).selectProject(9);

    const wrapper = mountTestCycles();

    await vi.waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/api/cycles/9", {
        headers: {},
        params: {
          page: 1,
          pageSize: 25,
          sort: "id",
          direction: "asc",
        },
      }),
    );
    await vi.waitFor(() =>
      expect(wrapper.vm.arrayTestCycles).toEqual([
        { id: 3, name: "release(3)", description: "Release cycle" },
      ]),
    );
    expect(wrapper.vm.testCyclesGridMeta.total).toBe(1);
  });

  it("marks the current tab as active", () => {
    api.get.mockResolvedValue({ data: [] });
    useSessionStore(pinia).selectProject(9);

    const wrapper = mountTestCycles();

    expect(wrapper.find("#nav-tabTitleModify-tab").classes()).toContain(
      "active",
    );
    expect(
      wrapper.find("#nav-tabTitleNewTestCycle-tab").classes(),
    ).not.toContain("active");
  });

  it("maps legacy cycle tests to the shared builder without changing order or payload", async () => {
    api.get.mockResolvedValue({ data: [] });
    useSessionStore(pinia).selectProject(9);
    const wrapper = mountTestCycles();
    await vi.waitFor(() => expect(wrapper.vm.testCyclesLoaded).toBe(true));
    const legacyTests = [
      { id: 7, name: "Postman smoke", type: "postman", config: { retries: 1 } },
      {
        id: 3,
        name: "Selenium login",
        type: "selenium",
        config: { retries: 2 },
      },
    ];

    await wrapper.setData({
      arrayTests: legacyTests,
      listOriginalTests: legacyTests,
      arrayTestsSelectedDragged: legacyTests,
    });

    expect(
      wrapper.vm.testCycleSequenceItems.map((item) => item.identity),
    ).toEqual(["test:7", "test:3"]);
    expect(
      wrapper.vm.testCycleSequenceItems.map((item) => item.persisted),
    ).toEqual(legacyTests);
    expect(wrapper.findComponent({ name: "SequenceBuilder" }).exists()).toBe(
      true,
    );
    expect(
      wrapper.findComponent({ name: "SequenceBuilder" }).props("layout"),
    ).toBe("split");
    expect(wrapper.findComponent({ name: "draggable" }).exists()).toBe(false);
  });

  it("preserves the legacy save shape after keyboard-capable composition", async () => {
    api.get.mockResolvedValue({ data: [] });
    useSessionStore(pinia).selectProject(9);
    const wrapper = mountTestCycles();
    await vi.waitFor(() => expect(wrapper.vm.testCyclesLoaded).toBe(true));
    const tests = [
      { id: 2, name: "Appium checkout", type: "appium" },
      { id: 1, name: "Selenium login", type: "selenium" },
    ];
    await wrapper.setData({
      arrayTests: tests,
      listOriginalTests: tests,
    });

    wrapper.vm.updateTestCycleSequence([
      wrapper.vm.toBuilderTest(tests[1]),
      wrapper.vm.toBuilderTest(tests[0]),
    ]);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.arrayTestsSelectedDragged).toEqual([tests[1], tests[0]]);
    expect(wrapper.vm.testCycleValidation.canSave).toBe(true);
  });

  it("keeps missing test references visible and blocking", async () => {
    api.get.mockResolvedValue({ data: [] });
    useSessionStore(pinia).selectProject(9);
    const wrapper = mountTestCycles();
    await vi.waitFor(() => expect(wrapper.vm.testCyclesLoaded).toBe(true));
    await wrapper.setData({
      arrayTests: [{ id: 1, name: "Available test" }],
      listOriginalTests: [{ id: 1, name: "Available test" }],
      arrayTestsSelectedDragged: [{ id: 99, name: "Removed test" }],
    });

    expect(wrapper.vm.testCycleSequenceItems[0]).toMatchObject({
      identity: "test:99",
      status: "missing",
      disabledReason: "sequence.referenceMissing",
    });
    expect(wrapper.vm.testCycleValidation).toMatchObject({ canSave: false });
    expect(
      wrapper.vm.testCycleValidation.diagnostics.map((entry) => entry.code),
    ).toContain("sequence.referenceMissing");
  });

  it("keeps the canonical new-cycle deep link active on reload", () => {
    api.get.mockResolvedValue({ data: [] });
    useSessionStore(pinia).selectProject(9);
    const wrapper = mountTestCycles({
      $route: {
        name: "testcycles",
        params: { projectId: "9", tab: "new" },
      },
    });

    expect(wrapper.find("#nav-tabTitleNewTestCycle-tab").classes()).toContain(
      "active",
    );
  });

  it("explains the new test cycle creation flow with progress indicators", async () => {
    api.get.mockResolvedValue({ data: [] });
    useSessionStore(pinia).selectProject(9);
    const wrapper = mountTestCycles({
      $route: {
        name: "testcycles",
        params: { projectId: "9", tab: "new" },
      },
    });

    await wrapper.setData({
      arrayTests: [{ id: 1, name: "Smoke", type: "postman" }],
      listOriginalTests: [{ id: 1, name: "Smoke", type: "postman" }],
      newNameTestCycle: "Release",
      newDescriptionTestCycle: "Release validation",
      disableBtnCreateTestCycle: false,
    });
    wrapper.vm.updateTestCycleSequence([
      wrapper.vm.toBuilderTest({ id: 1, name: "Smoke", type: "postman" }),
    ]);
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".testcycles-guidance").exists()).toBe(true);
    expect(wrapper.vm.cycleCreationSteps).toHaveLength(3);
    expect(wrapper.vm.cycleCreationSteps[0].complete).toBe(true);
    expect(wrapper.vm.cycleCreationSteps[2].complete).toBe(true);
    expect(wrapper.vm.cycleCreationStatus).toBe("Ready");
  });
});
