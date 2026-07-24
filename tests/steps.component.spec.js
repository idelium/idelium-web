import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
const modal = vi.hoisted(() => ({ show: vi.fn(), hide: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));
vi.mock("bootstrap", () => ({ Modal: vi.fn(() => modal) }));

import Steps from "@/view/steps.vue";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("steps component", () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
    api.put.mockReset();
    modal.show.mockReset();
    modal.hide.mockReset();
  });

  function mountSteps(overrides = {}) {
    return shallowMount(Steps, {
      global: {
        plugins: [pinia],
        stubs: {
          wizard: {
            template: "<div />",
            methods: {
              changeJsonEditor: vi.fn(),
            },
          },
          draggable: {
            template: "<div />",
          },
        },
        mocks: {
          $route: { name: "steps", params: { tab: "order" } },
          $router: { push: vi.fn(), replace: vi.fn() },
          config: {
            currentLanguage: "gb",
            serviceBaseUrl: "/api/",
            url: { steps: "steps" },
          },
          language: {
            gb: {
              Steps: {
                tabOrderSteps: "Order Steps",
                tabNewStep: "New Step",
                confirmationDelete: "Delete step ",
                placeholderDescriptionStep: "Step description",
                placeholderFileName: "File name",
                btnSaveStep: "Save step",
                btnSave: "Save",
                btnCancel: "Cancel",
                errorMessageInputEmpty: "Fields cannot be empty",
                errorCharactersError: "File name contains invalid characters",
                dsl: {
                  sourceLabel: "Idelium DSL source",
                  sourcePlaceholder: 'idelium 1.0\n\ntest "smoke" {\n}',
                  sourceHelp: "Validate DSL before saving.",
                  validate: "Validate DSL",
                  line: "line",
                  column: "column",
                },
              },
              Actions: {
                delete: "Delete",
                download: "Download",
                duplicate: "Duplicate",
              },
              Platforms: {
                ManagePlatform: {
                  modalAddPlatform: {
                    modalTitle: "Edit Step",
                  },
                },
              },
            },
          },
          emitter: { on: vi.fn(), emit: vi.fn() },
          setHeaders: () => ({}),
          Logout: vi.fn(),
          $showConfirm: vi.fn(),
          $showAlert: vi.fn(),
          ...overrides,
        },
      },
    });
  }

  it("opens the new tab and disables the order tab when no steps exist", async () => {
    const router = { push: vi.fn(), replace: vi.fn() };
    api.get.mockResolvedValue({ data: [] });
    useSessionStore(pinia).selectProject(9);

    const wrapper = mountSteps({ $router: router });

    await vi.waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        name: "steps",
        params: { tab: "new" },
      }),
    );
    expect(
      wrapper.find("#nav-tabOrderSteps-tab").attributes("disabled"),
    ).toBeDefined();
  });

  it("clears the loader when steps cannot load without a selected project", () => {
    const emitter = { on: vi.fn(), emit: vi.fn() };
    useSessionStore(pinia).selectProject(null);

    const wrapper = mountSteps({ emitter });

    expect(wrapper.vm.getSteps()).toBe(false);
    expect(emitter.emit).toHaveBeenCalledWith("showLoader", true);
    expect(emitter.emit).toHaveBeenCalledWith("showLoader", false);
  });

  it("uses an enterprise confirmation before deleting a step", async () => {
    const showConfirm = vi.fn().mockResolvedValue(false);
    const wrapper = mountSteps({ $showConfirm: showConfirm });
    const deleteAction = vi.spyOn(wrapper.vm, "deleteAction");

    await wrapper.vm.deleteStep({ id: 7, name: "Open browser" });

    expect(showConfirm).toHaveBeenCalledWith({
      message: "Delete step Open browser",
      variant: "warning",
    });
    expect(deleteAction).not.toHaveBeenCalled();
  });

  it("loads routed step edits from the project id in the URL", async () => {
    const routedStep = {
      name: "checkout_flow",
      description: "Checkout flow",
      config: JSON.stringify({
        name: "Checkout flow",
        failedExit: true,
        attachScreenshot: true,
        steps: [{ stepType: "open_browser", note: "Open browser" }],
      }),
    };
    api.get.mockImplementation((url) => {
      if (url === "/api/steps/3/16")
        return Promise.resolve({ data: routedStep });
      return Promise.resolve({ data: [] });
    });
    useSessionStore(pinia).selectProject(9);

    const wrapper = mountSteps({
      $route: {
        name: "steps",
        params: { projectId: "3", tab: "order" },
        query: { stepId: "16" },
      },
    });

    await vi.waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/api/steps/3/16", {
        headers: {},
      }),
    );
    expect(wrapper.vm.idResume).toBe("16");
    expect(wrapper.vm.stepEditNameFile).toBe("checkout_flow");
    expect(wrapper.vm.jsonResumeSteps.name).toBe("Checkout flow");
    expect(modal.show).toHaveBeenCalled();
  });

  it("shows schema-driven step content when editing an order row", async () => {
    const routedStep = {
      name: "submit_button",
      description: "Submit button",
      config: JSON.stringify({
        runtime: "selenium",
        schemaVersion: "selenium.webdriver.v2",
        command: "click",
        target: "#submit",
      }),
    };
    api.get.mockResolvedValue({ data: routedStep });
    useSessionStore(pinia).selectProject(3);

    const wrapper = mountSteps({
      $route: {
        name: "steps",
        params: { projectId: "3", tab: "order" },
        query: {},
      },
    });

    await wrapper.vm.getJson(17);

    expect(wrapper.vm.idResume).toBe(17);
    expect(wrapper.vm.resumeJson.editorType).toBe("selenium");
    expect(wrapper.vm.resumeJson.steps[0]).toEqual(
      expect.objectContaining({
        stepType: "selenium_command",
        operation: "click",
        target: "#submit",
      }),
    );
    expect(wrapper.vm.jsonResumeSteps).toEqual(wrapper.vm.resumeJson);
    expect(modal.show).toHaveBeenCalled();
  });

  it("saves a valid DSL step with the project id from the route", async () => {
    api.get.mockResolvedValue({ data: [] });
    api.post.mockResolvedValue({ data: { id: 24 } });
    useSessionStore(pinia).selectProject(9);

    const wrapper = mountSteps({
      $route: {
        name: "steps",
        params: { projectId: "3", tab: "new" },
        query: {},
      },
    });
    wrapper.vm.modeSelected = "dsl";
    wrapper.vm.stepDescription = "DSL smoke";
    wrapper.vm.stepNameFile = "dsl_smoke";
    wrapper.vm.dslSource = 'idelium 1.0\n\ntest "smoke" {\n}\n';

    await wrapper.vm.saveStep();

    expect(api.post).toHaveBeenCalledWith(
      "/api/steps",
      expect.objectContaining({
        idProject: "3",
        name: "dsl_smoke",
        config: JSON.stringify({
          runtime: "dsl",
          schemaVersion: "dsl.source.v1",
          languageVersion: "1.0",
          source: 'idelium 1.0\n\ntest "smoke" {\n}\n',
        }),
      }),
      { headers: {} },
    );
  });

  it("blocks DSL save when the language version is unsupported", async () => {
    api.get.mockResolvedValue({ data: [] });
    useSessionStore(pinia).selectProject(3);

    const wrapper = mountSteps();
    wrapper.vm.modeSelected = "dsl";
    wrapper.vm.stepDescription = "DSL smoke";
    wrapper.vm.stepNameFile = "dsl_smoke";
    wrapper.vm.dslSource = 'idelium 2.0\n\ntest "smoke" {\n}\n';

    expect(wrapper.vm.saveStep()).toBe(false);

    expect(api.post).not.toHaveBeenCalled();
    expect(wrapper.vm.dslDiagnostics[0]).toEqual(
      expect.objectContaining({ code: "DSL_VERSION_UNSUPPORTED" }),
    );
  });

  it("opens DSL source content when editing a persisted DSL step", async () => {
    const source = 'idelium 1.0\n\ntest "checkout" {\n}\n';
    api.get.mockResolvedValue({
      data: {
        name: "checkout_dsl",
        description: "Checkout DSL",
        config: JSON.stringify({
          runtime: "dsl",
          schemaVersion: "dsl.source.v1",
          languageVersion: "1.0",
          source,
        }),
      },
    });
    useSessionStore(pinia).selectProject(3);

    const wrapper = mountSteps({
      $route: {
        name: "steps",
        params: { projectId: "3", tab: "order" },
        query: {},
      },
    });

    await wrapper.vm.getJson(17);

    expect(wrapper.vm.modeEditSelected).toBe("dsl");
    expect(wrapper.vm.dslEditSource).toBe(source);
    expect(wrapper.vm.jsonResumeSteps).toBeNull();
    expect(modal.show).toHaveBeenCalled();
  });
});
