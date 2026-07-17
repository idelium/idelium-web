import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));
const modal = vi.hoisted(() => ({ show: vi.fn(), hide: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));
vi.mock("bootstrap", () => ({ Modal: vi.fn(() => modal) }));

import Plugins from "@/view/plugins.vue";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("plugins component", () => {
  function mountPlugins(overrides = {}) {
    return shallowMount(Plugins, {
      global: {
        plugins: [pinia],
        mocks: {
          $route: { name: "plugins", params: { tab: "list" } },
          $router: { push: vi.fn(), replace: vi.fn() },
          $wkToast: vi.fn(),
          config: {
            currentLanguage: "gb",
            pluginTemplate: "template",
            serviceBaseUrl: "/api/",
            url: { plugins: "plugins" },
          },
          language: {
            gb: {
              Plugins: {
                tabListPlugins: "List Plugins",
                tabNewPlugin: "New Plugin",
                tabTitleImportPlugin: "Import Plugin",
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

  it("opens the new tab and disables the list tab when no plugins exist", async () => {
    const router = { push: vi.fn(), replace: vi.fn() };
    api.get.mockResolvedValue({ data: [] });
    useSessionStore(pinia).selectProject(9);

    const wrapper = mountPlugins({ $router: router });

    await vi.waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        name: "plugins",
        params: { tab: "new" },
      }),
    );
    expect(wrapper.find("#nav-home-tab").attributes("disabled")).toBeDefined();
  });
});
