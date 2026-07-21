import { flushPromises, shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));
vi.mock("@/stores/session", () => ({
  useSessionStore: () => ({
    selectCustomer: vi.fn(),
    selectProject: vi.fn(),
    setProjectAvailability: vi.fn(),
  }),
}));

import TablerHeader from "@/components/tabler/TablerHeader.vue";

describe("tabler header component", () => {
  function mountHeader() {
    api.get.mockResolvedValue({ data: { projects: [], costumers: [] } });
    api.put.mockResolvedValue({ data: { session: "updated-session" } });

    return shallowMount(TablerHeader, {
      global: {
        mocks: {
          $route: { name: "projects" },
          $router: { push: vi.fn() },
          $confirm: vi.fn(),
          config: {
            currentLanguage: "gb",
            serviceBaseUrl: "/api/",
            url: {
              header: "menu/header",
              projects: "admin/projects",
              logout: "logout",
            },
          },
          language: {
            gb: {
              Actions: {
                toggleSidebar: "Toggle sidebar",
                userMenu: "User menu",
              },
              Header: {
                btnChangeCostumer: "Change customer",
                confirmLogout: "Confirm logout",
                confirmLogoutAction: "Log out",
                confirmLogoutTitle: "End current session",
                cancelLogout: "Stay signed in",
                costumer: "Customer",
                languages: { gb: "English" },
                logOut: "Log out",
                profile: "Profile",
                project: "Project",
              },
            },
          },
          emitter: { on: vi.fn(), emit: vi.fn() },
          setHeaders: () => ({}),
          Logout: vi.fn(),
        },
      },
    });
  }

  it("changes customer even when the session store has no updateSessionId action", async () => {
    const wrapper = mountHeader();

    wrapper.vm.changeCostumer(1);
    await flushPromises();

    expect(api.put).toHaveBeenCalledWith(
      "/api/menu/header/1",
      {},
      { headers: {} },
    );
  });

  it("opens an enterprise logout modal instead of the system confirmation", async () => {
    const wrapper = mountHeader();

    wrapper.vm.logout();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.logoutModalVisible).toBe(true);
    expect(wrapper.vm.$confirm).not.toHaveBeenCalled();
  });

  it("executes logout only after the modal is confirmed", async () => {
    const wrapper = mountHeader();
    const actionLogout = vi.spyOn(wrapper.vm, "actionLogout").mockImplementation(() => {});

    wrapper.vm.logout();
    wrapper.vm.confirmLogout();

    expect(wrapper.vm.logoutModalVisible).toBe(false);
    expect(actionLogout).toHaveBeenCalled();
  });
});
