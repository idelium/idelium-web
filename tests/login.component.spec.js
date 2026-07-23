import { createPinia } from "pinia";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/services/apiClient", () => ({ default: api }));

import Login from "@/view/pages/login.vue";

function mountLogin(route = { query: {} }) {
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
            Actions: {
              hidePassword: "Hide password",
              showPassword: "Show password",
            },
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
              rememberPassword: "Remember password",
            },
          },
        },
        emitter,
        $route: route,
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
    api.post.mockResolvedValue({ data: { authenticated: true } });
    const { wrapper, push } = mountLogin();
    await wrapper.get("#username").setValue("user@example.com");
    await wrapper.get("#password").setValue("password");
    await wrapper.get("#login").trigger("click");
    await vi.waitFor(() =>
      expect(push).toHaveBeenCalledWith({ name: "projects" }),
    );
  });

  it("navigates back to the original project-scoped URL after login", async () => {
    api.get.mockResolvedValue({});
    api.post.mockResolvedValue({ data: { authenticated: true } });
    const { wrapper, push } = mountLogin({
      query: { back: "/projects/3/testsperformed" },
    });
    await wrapper.get("#username").setValue("user@example.com");
    await wrapper.get("#password").setValue("password");
    await wrapper.get("#login").trigger("click");

    await vi.waitFor(() =>
      expect(push).toHaveBeenCalledWith({ path: "/projects/3/testsperformed" }),
    );
  });

  it("remembers credentials after a successful login when selected", async () => {
    api.get.mockResolvedValue({});
    api.post.mockResolvedValue({ data: { authenticated: true } });
    const { wrapper } = mountLogin();
    await wrapper.get("#username").setValue("user@example.com");
    await wrapper.get("#password").setValue("password");
    await wrapper.get("#rememberPassword").setValue(true);
    await wrapper.get("#login").trigger("click");

    await vi.waitFor(() =>
      expect(window.localStorage.getItem("idelium.rememberedLogin")).toBe(
        JSON.stringify({
          email: "user@example.com",
          password: "password",
        }),
      ),
    );
  });

  it("loads remembered credentials", async () => {
    window.localStorage.setItem(
      "idelium.rememberedLogin",
      JSON.stringify({
        email: "remembered@example.com",
        password: "remembered-password",
      }),
    );

    const { wrapper } = mountLogin();
    await wrapper.vm.$nextTick();

    expect(wrapper.get("#username").element.value).toBe(
      "remembered@example.com",
    );
    expect(wrapper.get("#password").element.value).toBe("remembered-password");
    expect(wrapper.get("#rememberPassword").element.checked).toBe(true);
  });
});
