import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

vi.mock("@/services/apiClient", () => ({ default: api }));

import Accounts from "@/view/accounts.vue";
import Costumers from "@/view/costumers.vue";

const dataTableCopy = {
  actions: "Actions",
  bulk: {},
  preferences: {},
  states: {},
};

function commonMocks(section, url) {
  return {
    $forceUpdate: vi.fn(),
    $gtag: { event: vi.fn() },
    $route: { query: {} },
    $router: { replace: vi.fn().mockResolvedValue() },
    config: {
      currentLanguage: "gb",
      serviceBaseUrl: "/api/",
      url,
    },
    language: {
      gb: {
        Accounts: {
          account: "Account",
          btnDelete: "Delete",
          btnModify: "Edit",
          confirmDeleteAccount: "Delete account?",
          costumer: "Customer",
          id: "ID",
          listDescription: "Manage accounts",
          listEyebrow: "Administration",
          listTitle: "Accounts",
          name: "Name",
          newAccount: "New account",
          nextPage: "Next",
          pageStatus: "Page {page} of {pages}",
          paginationLabel: "Account pages",
          previousPage: "Previous",
          role: "Role",
          searchLabel: "Search",
          searchPlaceholder: "Search accounts",
        },
        Costumers: {
          btnDelete: "Delete",
          btnModify: "Edit",
          btnNewCostumer: "New customer",
          costumer: "Customer",
          description: "Description",
          id: "ID",
          licenseExpiration: "License expiration",
          listDescription: "Manage customers",
          listEyebrow: "Administration",
          listTitle: "Customers",
          nextPage: "Next",
          pageStatus: "Page {page} of {pages}",
          paginationLabel: "Customer pages",
          previousPage: "Previous",
          searchLabel: "Search",
          searchPlaceholder: "Search customers",
          textDelete: "Delete customer?",
        },
        DataTable: dataTableCopy,
      },
    },
    emitter: { emit: vi.fn(), on: vi.fn() },
    Logout: vi.fn(),
    setHeaders: () => ({}),
    ...section,
  };
}

describe("administration enterprise listings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads customers through a bounded grid contract", async () => {
    api.get.mockResolvedValue({
      data: {
        data: [
          {
            id: 7,
            costumer: "DEMO",
            description: "Demo",
            licenseExpiration: "2027-01-01T00:00:00Z",
          },
        ],
        meta: { page: 1, pageSize: 25, total: 1 },
      },
    });

    const wrapper = shallowMount(Costumers, {
      global: {
        stubs: {
          EnterpriseListingGrid: true,
          EnterpriseListingPage: true,
          modalModifyCostumer: true,
        },
        mocks: commonMocks({}, { costumers: "admin/costumers" }),
      },
    });

    await vi.waitFor(() => expect(wrapper.vm.arrayCostumers).toHaveLength(1));
    expect(api.get).toHaveBeenCalledWith("/api/admin/costumers", {
      headers: {},
      params: {
        direction: "asc",
        page: 1,
        pageSize: 25,
        search: "",
        sort: "created_at",
      },
    });
    expect(wrapper.vm.columns.some((column) => column.key === "apiKey")).toBe(
      false,
    );
  });

  it("loads tenant accounts through a bounded grid contract", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/api/admin/accounts") {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 9,
                email: "user@example.test",
                name: "User",
                role: 3,
                roleName: "user",
              },
            ],
            meta: { page: 1, pageSize: 25, total: 1 },
          },
        });
      }
      return Promise.resolve({ data: [] });
    });

    const wrapper = shallowMount(Accounts, {
      global: {
        stubs: {
          EnterpriseListingGrid: true,
          EnterpriseListingPage: true,
          modalModifyAccount: true,
        },
        mocks: commonMocks(
          {},
          {
            accounts: "admin/accounts",
            costumers: "admin/costumers",
            roles: "admin/roles",
          },
        ),
      },
    });

    await vi.waitFor(() => expect(wrapper.vm.arrayAccounts).toHaveLength(1));
    expect(api.get).toHaveBeenCalledWith("/api/admin/accounts", {
      headers: {},
      params: {
        direction: "asc",
        page: 1,
        pageSize: 25,
        search: "",
        sort: "email",
      },
    });
    expect(wrapper.vm.arrayAccounts[0]).not.toHaveProperty("password");
  });
});
