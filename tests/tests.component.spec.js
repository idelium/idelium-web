import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));

import Tests from "@/view/tests.vue";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("tests component", () => {
  beforeEach(() => {
    api.get.mockReset();
  });

  function mountTests(overrides = {}) {
    return shallowMount(Tests, {
      global: {
        plugins: [pinia],
        mocks: {
          $route: { name: "tests", params: { tab: "modify" } },
          $router: { push: vi.fn(), replace: vi.fn() },
          config: {
            currentLanguage: "gb",
            serviceBaseUrl: "/api/",
            url: { steps: "steps", tests: "tests" },
          },
          language: {
            gb: {
              Tests: {
                tabTitleModify: "Modify Test",
                tabTitleNewTest: "New Test",
                tabTitleImportTest: "Import Test",
                importReviewEyebrow: "Import review",
                importReviewFallbackTitle: "Imported test definition",
                importReviewDescription: "Review imported steps.",
                importedSteps: "Steps",
                importedActions: "Actions",
                importedActionsCount: "{count} action(s)",
                importReadyEyebrow: "Ready to save",
                importReadyTitle: "Finalize import",
                importReadyDescription: "Save imported steps.",
                moveImportedUp: "Move imported step up",
                moveImportedDown: "Move imported step down",
                editImported: "Edit imported step",
              },
              Actions: {
                remove: "Remove",
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

  it("opens the new tab and disables the modify tab when no tests exist", async () => {
    const router = { push: vi.fn(), replace: vi.fn() };
    api.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });
    useSessionStore(pinia).selectProject(9);

    const wrapper = mountTests({ $router: router });

    await vi.waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        name: "tests",
        params: { tab: "new" },
      }),
    );
    expect(
      wrapper.find("#nav-tabTitleModify-tab").attributes("disabled"),
    ).toBeDefined();
  });

  it("loads tests through the enterprise grid contract when available", async () => {
    api.get.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({
      data: {
        data: [{ id: 17, name: "postman", description: "Postman flow" }],
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

    const wrapper = mountTests();

    await vi.waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/api/tests/9", {
        headers: {},
        params: {
          page: 1,
          pageSize: 25,
          sort: "id",
          direction: "asc",
        },
      }),
    );
    expect(wrapper.vm.arrayTests).toEqual([
      { id: 17, name: "postman", description: "Postman flow" },
    ]);
    expect(wrapper.vm.testsGridMeta.total).toBe(1);
  });

  it("preserves Selenium, Appium, and Postman step order and configuration", async () => {
    api.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });
    useSessionStore(pinia).selectProject(9);
    const wrapper = mountTests();
    await vi.waitFor(() => expect(wrapper.vm.testsLoaded).toBe(true));
    const steps = [
      {
        id: 11,
        name: "selenium",
        description: "Open browser",
        runtime: "selenium",
        config: { runtime: "selenium", target: "https://example.invalid" },
      },
      {
        id: 12,
        name: "appium",
        description: "Tap login",
        runtime: "appium",
        config: { runtime: "appium", strategy: "accessibility-id" },
      },
      {
        id: 13,
        name: "postman",
        description: "Run collection",
        runtime: "postman",
        config: { runtime: "postman", collectionId: "collection-1" },
      },
    ];
    await wrapper.setData({
      arraySteps: steps,
      listOriginalSteps: steps,
      arrayStepsSelectedDragged: steps,
    });

    expect(
      wrapper.vm.testStepSequenceItems.map((item) => item.identity),
    ).toEqual(["step:11", "step:12", "step:13"]);
    expect(
      wrapper.vm.testStepSequenceItems.map((item) => item.metadata.runtime),
    ).toEqual(["selenium", "appium", "postman"]);
    expect(
      wrapper.vm.testStepSequenceItems.map((item) => item.persisted.config),
    ).toEqual(steps.map((step) => step.config));

    wrapper.vm.updateTestStepSequence([
      wrapper.vm.toBuilderStep(steps[2]),
      wrapper.vm.toBuilderStep(steps[0]),
      wrapper.vm.toBuilderStep(steps[1]),
    ]);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.arrayStepsSelectedDragged).toEqual([
      steps[2],
      steps[0],
      steps[1],
    ]);
    expect(wrapper.findComponent({ name: "SequenceBuilder" }).exists()).toBe(
      true,
    );
    expect(wrapper.findComponent({ name: "draggable" }).exists()).toBe(false);
  });

  it("keeps stale, archived, and missing step references visible", async () => {
    api.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });
    useSessionStore(pinia).selectProject(9);
    const wrapper = mountTests();
    await vi.waitFor(() => expect(wrapper.vm.testsLoaded).toBe(true));
    const available = [
      {
        id: 1,
        name: "active",
        description: "Active step",
        runtime: "selenium",
        version: "v2",
      },
      {
        id: 2,
        name: "archived",
        description: "Archived step",
        runtime: "appium",
        status: "archived",
      },
    ];
    await wrapper.setData({
      arraySteps: available,
      listOriginalSteps: available,
      arrayStepsSelectedDragged: [
        { ...available[0], version: "v1" },
        available[1],
        { id: 99, name: "missing", description: "Missing step" },
      ],
    });

    expect(wrapper.vm.testStepSequenceItems.map((item) => item.status)).toEqual(
      ["stale", "archived", "missing"],
    );
    expect(wrapper.vm.testStepValidation.canSave).toBe(false);
    expect(
      wrapper.vm.testStepValidation.diagnostics.map((entry) => entry.code),
    ).toEqual(
      expect.arrayContaining([
        "sequence.referenceStale",
        "sequence.archivedDependency",
        "sequence.referenceMissing",
      ]),
    );
  });

  it("reviews imported steps with stable keyboard reorder and no drag state", async () => {
    api.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });
    useSessionStore(pinia).selectProject(9);
    const wrapper = mountTests();
    await vi.waitFor(() => expect(wrapper.vm.testsLoaded).toBe(true));
    const imported = [
      { id: "request-1", name: "GET users", steps: [{}] },
      { id: "request-2", name: "POST user", steps: [{}] },
    ];

    wrapper.vm.importTest({
      name: "Postman import",
      description: "Imported collection",
      tests: imported,
    });
    wrapper.vm.tabOpen = 2;
    await wrapper.vm.$nextTick();
    const originalKeys = [...wrapper.vm.arrayImportedStepKeys];
    wrapper.vm.moveImportedItem(1, 0);

    expect(wrapper.vm.arrayStepsImported).toEqual([imported[1], imported[0]]);
    expect(wrapper.vm.arrayImportedStepKeys).toEqual([
      originalKeys[1],
      originalKeys[0],
    ]);
    expect(wrapper.find(".tests-import-review-panel").exists()).toBe(true);
    expect(wrapper.find(".tests-import-actions-panel").exists()).toBe(true);
    expect(wrapper.vm.importedActionsTotal()).toBe(2);
    expect(wrapper.vm.actionTargetSummary({ findBy: "#submit" })).toBe(
      "#submit",
    );
    wrapper.vm.openTab("new");
    expect(() => wrapper.unmount()).not.toThrow();
  });
});
