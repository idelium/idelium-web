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
  function mountHeader(
    route = { name: "projects", params: {} },
    headerData = { projects: [], costumers: [] },
  ) {
    api.get.mockResolvedValue({ data: headerData });
    api.put.mockResolvedValue({ data: { session: "updated-session" } });
    const router = { push: vi.fn(), replace: vi.fn() };

    const wrapper = shallowMount(TablerHeader, {
      global: {
        mocks: {
          $route: route,
          $router: router,
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
    wrapper.router = router;
    return wrapper;
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
    const actionLogout = vi
      .spyOn(wrapper.vm, "actionLogout")
      .mockImplementation(() => {});

    wrapper.vm.logout();
    wrapper.vm.confirmLogout();

    expect(wrapper.vm.logoutModalVisible).toBe(false);
    expect(actionLogout).toHaveBeenCalled();
  });

  it("updates the project id in the current project-scoped route", async () => {
    const wrapper = mountHeader({
      name: "tests",
      params: { projectId: "1", tab: "new" },
      query: { order: "name" },
    });

    await wrapper.setData({ projectSelected: 2 });

    expect(wrapper.router.replace).toHaveBeenCalledWith({
      name: "tests",
      params: { projectId: 2, tab: "new" },
      query: { order: "name" },
    });
  });

  it("falls back to the first available project when the route id is unavailable", async () => {
    const wrapper = mountHeader(
      {
        name: "tests",
        params: { projectId: "999", tab: "new" },
        query: {},
      },
      {
        projects: [
          { id: 3, name: "demo" },
          { id: 4, name: "qa" },
        ],
        costumers: [],
      },
    );
    await flushPromises();

    wrapper.vm.syncProjectSelectionFromRoute();

    expect(wrapper.vm.projectSelected).toBe(3);
  });
});
