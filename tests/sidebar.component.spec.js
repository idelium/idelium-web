import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));

import Sidebar from "@/components/sidebar.vue";

describe("sidebar component", () => {
  function mountSidebar(path) {
    api.get.mockResolvedValue({ data: [] });

    return shallowMount(Sidebar, {
      global: {
        mocks: {
          $router: {
            currentRoute: { value: { path } },
            push: vi.fn(),
          },
          config: {
            currentLanguage: "gb",
            serviceBaseUrl: "/api/",
            url: { sidebar: "sidebar" },
          },
          language: { gb: { Sidebar: {} } },
          emitter: { on: vi.fn(), emit: vi.fn() },
          setHeaders: () => ({}),
        },
      },
    });
  }

  it("keeps a menu item active for routable child tabs", () => {
    const wrapper = mountSidebar("/environments/new");

    expect(wrapper.vm.isActiveMenuItem("environments")).toBe(true);
    expect(wrapper.vm.isActiveMenuItem("plugins")).toBe(false);
  });
});
