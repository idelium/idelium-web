import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));
const modal = vi.hoisted(() => ({ show: vi.fn(), hide: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));
vi.mock("bootstrap", () => ({
  Modal: vi.fn(function Modal() {
    return modal;
  }),
}));

import Plugins from "@/view/plugins.vue";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("plugins component", () => {
  function mountPlugins(overrides = {}) {
    return shallowMount(Plugins, {
      global: {
        plugins: [pinia],
        mocks: {
          $route: { name: "plugins", params: { tab: "list" } },
          $router: { push: vi.fn(), replace: vi.fn() },
          $wkToast: vi.fn(),
          config: {
            currentLanguage: "gb",
            pluginTemplate: "template",
            serviceBaseUrl: "/api/",
            url: { plugins: "plugins" },
          },
          language: {
            gb: {
              Actions: {
                delete: "Delete",
                download: "Download",
                edit: "Edit",
              },
              Plugins: {
                tabListPlugins: "List Plugins",
                tabNewPlugin: "New Plugin",
                tabTitleImportPlugin: "Import Plugin",
                name: "name",
                description: "description",
                approval: "approval",
                integrity: "source integrity",
                listTitle: "Plugins",
                nextPage: "Next",
                pageStatus: "Page {page} of {pages}",
                paginationLabel: "Plugin pages",
                previousPage: "Previous",
                searchLabel: "Search",
                searchPlaceholder: "Search plugins",
                approvalStates: {
                  approved: "Approved",
                  unapproved: "Unapproved",
                  invalid: "Invalid",
                },
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

  it("opens the new tab and disables the list tab when no plugins exist", async () => {
    const router = { push: vi.fn(), replace: vi.fn() };
    api.get.mockResolvedValue({ data: [] });
    useSessionStore(pinia).selectProject(9);

    const wrapper = mountPlugins({ $router: router });

    await vi.waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        name: "plugins",
        params: { tab: "new" },
      }),
    );
    expect(wrapper.find("#nav-home-tab").attributes("disabled")).toBeDefined();
  });

  it("renders plugin approval metadata without exposing source code", async () => {
    api.get.mockResolvedValue({
      data: [
        {
          id: 1,
          name: "safe_step",
          description: "Approved plugin",
          approvalStatus: "approved",
          provenanceReviewed: true,
          sourceSha256: "abcdef1234567890",
          executionMode: "subprocess",
        },
      ],
    });
    useSessionStore(pinia).selectProject(9);

    const wrapper = mountPlugins();

    await vi.waitFor(() => expect(wrapper.vm.displayPlugins).toHaveLength(1));
    expect(wrapper.vm.displayPlugins[0]).toEqual(
      expect.objectContaining({
        approvalLabel: "Approved",
        sourceHash: "abcdef123456",
      }),
    );
    expect(wrapper.vm.displayPlugins[0]).not.toHaveProperty("code");
  });
});
