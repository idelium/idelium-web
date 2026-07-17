import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));

import Tests from "@/view/tests.vue";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("tests component", () => {
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
    expect(wrapper.find("#nav-tabTitleModify-tab").attributes("disabled")).toBeDefined();
  });
});
