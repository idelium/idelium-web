import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));
const modal = vi.hoisted(() => ({ show: vi.fn(), hide: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));
vi.mock("bootstrap", () => ({ Modal: vi.fn(() => modal) }));

import Steps from "@/view/steps.vue";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("steps component", () => {
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
    expect(wrapper.find("#nav-tabOrderSteps-tab").attributes("disabled")).toBeDefined();
  });
});
