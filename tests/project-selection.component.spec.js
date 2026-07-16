import { createPinia } from "pinia";
import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
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

describe("logout component flow", () => {
  it("uses an authenticated POST request for logout", async () => {
    api.get.mockResolvedValue({ data: { projects: [], costumers: [] } });
    api.post.mockResolvedValue({ data: null });
    const logout = vi.fn();
    const wrapper = shallowMount(Header, {
      global: {
        plugins: [createPinia()],
        mocks: {
          config: {
            currentLanguage: "gb",
            serviceBaseUrl: "/api/",
            url: { header: "header", logout: "logout" },
          },
          language: { gb: { Header: { languages: {} } } },
          emitter: { on: vi.fn(), emit: vi.fn() },
          setHeaders: () => ({}),
          Logout: logout,
          $route: { name: "projects" },
        },
      },
    });

    wrapper.vm.actionLogout();
    await vi.waitFor(() => expect(api.post).toHaveBeenCalled());

    expect(api.post).toHaveBeenCalledWith("/api/logout", null, {
      headers: {},
    });
    expect(logout).toHaveBeenCalled();
  });
});
