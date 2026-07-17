import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/services/apiClient", () => ({ default: api }));

import TestCycles from "@/view/testcycles.vue";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("test-cycle creation component", () => {
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
          language: { gb: { TestCycles: {} } },
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
});
