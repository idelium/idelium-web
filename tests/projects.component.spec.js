import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));

import Projects from "@/view/projects.vue";

describe("projects component", () => {
  beforeEach(() => {
    api.get.mockReset();
  });

  function mountProjects(overrides = {}) {
    return shallowMount(Projects, {
      global: {
        stubs: {
          fontAwesomeIcon: true,
          modalModifyProject: true,
          EnterpriseDataTable: true,
          IdButton: true,
        },
        mocks: {
          $forceUpdate: vi.fn(),
          $gtag: { event: vi.fn() },
          config: {
            currentLanguage: "gb",
            serviceBaseUrl: "/api/",
            url: {
              costumers: "admin/costumers",
              projects: "admin/projects",
            },
          },
          language: {
            gb: {
              Actions: { delete: "Delete" },
              Projects: {
                btnNewProject: "New project",
                btnDelete: "Delete",
                btnModify: "Edit",
                btnModalModifyProject: "Edit project",
                description: "Description",
                id: "ID",
                listDescription: "Manage projects",
                listEyebrow: "Administration",
                listTitle: "Projects",
                nextPage: "Next",
                pageStatus: "Page {page} of {pages}",
                paginationLabel: "Project pages",
                previousPage: "Previous",
                project: "Project",
                searchLabel: "Search projects",
                searchPlaceholder: "Search",
                textDelete: "Delete project?",
              },
              DataTable: {
                actions: "Actions",
                bulk: {},
                preferences: {},
                states: {},
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

  it("loads projects through the enterprise grid contract when available", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: [{ id: 7, name: "POSTMAN", description: "Postman project" }],
        meta: {
          page: 1,
          pageSize: 25,
          total: 1,
          lastPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    });

    const wrapper = mountProjects();

    await vi.waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/api/admin/projects", {
        headers: {},
        params: {
          page: 1,
          pageSize: 25,
          sort: "created_at",
          direction: "asc",
          search: "",
        },
      }),
    );
    expect(wrapper.vm.arrayProjects).toEqual([
      { id: 7, name: "POSTMAN", description: "Postman project" },
    ]);
    expect(wrapper.vm.projectsGridMeta.total).toBe(1);
  });

  it("keeps legacy array responses compatible", async () => {
    api.get.mockResolvedValueOnce({
      data: [{ id: 3, name: "DEMO", description: "Legacy project" }],
    });

    const wrapper = mountProjects();

    await vi.waitFor(() =>
      expect(wrapper.vm.arrayProjects).toEqual([
        { id: 3, name: "DEMO", description: "Legacy project" },
      ]),
    );
    expect(wrapper.vm.projectsGridMeta.total).toBeNull();
  });

  it("does not fail when analytics is unavailable in local development", async () => {
    api.get.mockResolvedValueOnce({
      data: [{ id: 3, name: "DEMO", description: "Local project" }],
    });

    const wrapper = mountProjects({ $gtag: undefined });

    await vi.waitFor(() =>
      expect(wrapper.vm.arrayProjects).toEqual([
        { id: 3, name: "DEMO", description: "Local project" },
      ]),
    );
    expect(() => wrapper.vm.trackProjectView()).not.toThrow();
  });

  it("keeps search, sorting, and pagination in the route query", async () => {
    vi.useFakeTimers();
    api.get.mockResolvedValue({
      data: {
        data: [],
        meta: {
          page: 1,
          pageSize: 25,
          total: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    });
    const replace = vi.fn().mockResolvedValue();
    const wrapper = mountProjects({
      $route: { query: {} },
      $router: { replace },
    });
    await Promise.resolve();

    wrapper.vm.projectSearch = "postman";
    wrapper.vm.scheduleProjectSearch();
    await vi.advanceTimersByTimeAsync(250);

    expect(replace).toHaveBeenCalledWith({
      query: {
        direction: "asc",
        q: "postman",
        sort: "created_at",
      },
    });
    expect(api.get).toHaveBeenCalledWith("/api/admin/projects", {
      headers: {},
      params: {
        page: 1,
        pageSize: 25,
        search: "postman",
        sort: "created_at",
        direction: "asc",
      },
    });
    vi.useRealTimers();
  });
});
