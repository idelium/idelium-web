import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));

import Profile from "@/view/profile.vue";

describe("profile component", () => {
  it("uses Bootstrap card markup instead of removed BootstrapVue components", () => {
    api.get.mockResolvedValue({
      data: {
        name: "Administrator",
        email: "admin@idelium.org",
        companyName: "demo",
        roleName: "superadmin",
      },
    });

    const wrapper = shallowMount(Profile, {
      global: {
        mocks: {
          config: {
            currentLanguage: "gb",
            serviceBaseUrl: "/api/",
            url: { profile: "profile" },
          },
          language: {
            gb: {
              Profile: {
                title: "Profile",
                name: "Name",
                email: "Email",
                company: "Company",
                role: "Role",
                password: "Password",
                confirmPassword: "Confirm password",
              },
            },
          },
          emitter: { on: vi.fn(), emit: vi.fn() },
          setHeaders: () => ({}),
          Logout: vi.fn(),
        },
      },
    });

    expect(wrapper.find("article.profile-card").exists()).toBe(true);
    expect(wrapper.findComponent({ name: "b-card" }).exists()).toBe(false);
  });
});
