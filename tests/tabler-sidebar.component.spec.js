import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));

import TablerSidebar from "@/components/tabler/TablerSidebar.vue";

describe("tabler sidebar component", () => {
  function mountSidebar(path) {
    api.get.mockResolvedValue({ data: [] });

    return shallowMount(TablerSidebar, {
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
    const wrapper = mountSidebar("/plugins/import");

    expect(wrapper.vm.isActiveMenuItem("plugins")).toBe(true);
    expect(wrapper.vm.isActiveMenuItem("environments")).toBe(false);
  });
});
