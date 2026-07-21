import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));
const modal = vi.hoisted(() => ({ show: vi.fn(), hide: vi.fn() }));
const button = vi.hoisted(() => ({}));

vi.mock("@/services/apiClient", () => ({ default: api }));
vi.mock("bootstrap", () => ({
  Modal: vi.fn(() => modal),
  Button: vi.fn(() => button),
}));

import Environments from "@/view/environments.vue";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("environments component", () => {
  beforeEach(() => {
    api.get.mockReset();
    modal.show.mockClear();
    modal.hide.mockClear();
  });

  function mountEnvironments(overrides = {}, mountOptions = {}) {
    return shallowMount(Environments, {
      ...mountOptions,
      global: {
        plugins: [pinia],
        stubs: {
          wizard: {
            template: "<div />",
            methods: {
              generateJson: vi.fn(),
              putJson: vi.fn(),
            },
          },
        },
        mocks: {
          $route: { name: "environments", params: { tab: "order" } },
          $router: { push: vi.fn(), replace: vi.fn() },
          config: {
            currentLanguage: "gb",
            serviceBaseUrl: "/api/",
            url: { environments: "environments" },
          },
          language: {
            gb: {
              Actions: {
                delete: "Delete",
                download: "Download",
                duplicate: "Duplicate",
              },
              Environments: {
                tabOrderEnvironments: "Order Environments",
                tabNewEnvironment: "New Environment",
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

  it("opens the new tab and disables the order tab when no environments exist", async () => {
    const router = { push: vi.fn(), replace: vi.fn() };
    api.get.mockResolvedValue({ data: [] });
    useSessionStore(pinia).selectProject(9);

    const wrapper = mountEnvironments({ $router: router });

    await vi.waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        name: "environments",
        params: { tab: "new" },
      }),
    );
    expect(wrapper.find("#nav-home-tab").attributes("disabled")).toBeDefined();
  });

  it("moves focus out of the editor modal before hiding it", async () => {
    api.get.mockResolvedValue({ data: [{ id: 1, code: "dev" }] });
    const host = document.createElement("div");
    document.body.append(host);

    const wrapper = mountEnvironments({}, { attachTo: host });

    const cancelButton = wrapper.find(".modal-footer .btn-secondary");
    cancelButton.element.focus();

    await cancelButton.trigger("click");

    expect(document.activeElement).not.toBe(cancelButton.element);
    expect(modal.hide).toHaveBeenCalled();
    wrapper.unmount();
    host.remove();
  });
});
