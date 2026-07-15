import { createPinia } from "pinia";
import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
vi.mock("@/services/apiClient", () => ({ default: api }));

import Header from "@/components/header.vue";

describe("project selection component", () => {
  it("stores the selected project in central session state", async () => {
    api.get.mockResolvedValue({ data: { projects: [], costumers: [] } });
    const wrapper = shallowMount(Header, {
      global: {
        plugins: [createPinia()],
        mocks: {
          config: {
            currentLanguage: "gb",
            serviceBaseUrl: "/api/",
            url: { header: "header" },
          },
          language: { gb: { Header: { languages: {} } } },
          emitter: { on: vi.fn(), emit: vi.fn() },
          setHeaders: () => ({}),
          $route: { name: "projects" },
        },
      },
    });
    await wrapper.setData({ projectSelected: 42 });
    expect(wrapper.vm.session.selectedProjectId).toBe(42);
  });
});
