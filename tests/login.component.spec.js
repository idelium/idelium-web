import { createPinia } from "pinia";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/services/apiClient", () => ({ default: api }));

import Login from "@/view/pages/login.vue";

function mountLogin() {
  const push = vi.fn();
  const emitter = { emit: vi.fn() };
  const wrapper = mount(Login, {
    global: {
      plugins: [createPinia()],
      mocks: {
        config: {
          currentLanguage: "gb",
          serviceBaseUrl: "/api/",
          url: { csrf: "csrf", login: "login" },
        },
        language: {
          gb: {
            Login: {
              welcome: "Welcome",
              welcomeMessage: "Hello",
              info: "Sign in",
              placeUsername: "Email",
              placePassword: "Password",
              btnLogin: "Login",
              errorMail: "Email required",
              isNotEmail: "Invalid email",
              errorPassword: "Password required",
              errorCredential: "Invalid credentials",
            },
          },
        },
        emitter,
        $route: { query: {} },
        $router: { push },
        $isAuthenticated: { value: false },
      },
    },
  });
  return { wrapper, push };
}

describe("login component", () => {
  it("validates credentials before making a request", async () => {
    const { wrapper } = mountLogin();
    await wrapper.get("#login").trigger("click");
    expect(wrapper.text()).toContain("Email required");
    expect(api.post).not.toHaveBeenCalled();
  });

  it("establishes the session and navigates after login", async () => {
    api.get.mockResolvedValue({});
    api.post.mockResolvedValue({
      data: { access_token: "token", session: "session" },
    });
    const { wrapper, push } = mountLogin();
    await wrapper.get("#username").setValue("user@example.com");
    await wrapper.get("#password").setValue("password");
    await wrapper.get("#login").trigger("click");
    await vi.waitFor(() =>
      expect(push).toHaveBeenCalledWith({ name: "projects" }),
    );
  });
});
