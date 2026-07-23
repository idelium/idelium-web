import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

const api = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));

import TablerSidebar from "@/components/tabler/TablerSidebar.vue";

describe("tabler sidebar component", () => {
  function mountSidebar(path, name = null) {
    api.get.mockResolvedValue({ data: [] });

    return shallowMount(TablerSidebar, {
      global: {
        mocks: {
          $router: {
            currentRoute: { value: { path, name } },
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
    useSessionStore(pinia).selectProject(7);
    const wrapper = mountSidebar("/projects/7/plugins/import", "plugins");

    expect(wrapper.vm.isActiveMenuItem("plugins")).toBe(true);
    expect(wrapper.vm.isActiveMenuItem("environments")).toBe(false);
  });

  it("does not highlight projects while a project-scoped section is active", () => {
    useSessionStore(pinia).selectProject(7);
    const wrapper = mountSidebar("/projects/7/steps/order", "steps");

    expect(wrapper.vm.isActiveMenuItem("steps")).toBe(true);
    expect(wrapper.vm.isActiveMenuItem("projects")).toBe(false);
  });
});
