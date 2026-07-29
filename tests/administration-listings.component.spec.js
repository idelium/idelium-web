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
          accountStatuses: {
            active: "Active",
            archived: "Archived",
            "expired-invitation": "Expired invitation",
            invited: "Invited",
            suspended: "Suspended",
          },
          btnAudit: "Audit",
          btnCancelInvite: "Cancel invite",
          btnDelete: "Delete",
          btnDetail: "Details",
          btnModify: "Edit",
          btnReactivate: "Reactivate",
          btnResendInvite: "Resend invite",
          btnSuspend: "Suspend",
          confirmDeleteAccount: "Delete account?",
          costumer: "Customer",
          filterAll: "All",
          filterInvitation: "Invitation",
          filterRole: "Role",
          filterStatus: "Status",
          filterTeam: "Team",
          governanceActionQueued: "Governance action selected",
          id: "ID",
          invitationStates: {
            expired: "Expired",
            none: "None",
            pending: "Pending",
          },
          lastActivity: "Last activity",
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
          status: "Status",
          teams: "Teams",
          updatedAt: "Updated",
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
                status: "invited",
                team: "QA",
                updatedAt: "2026-07-29T10:00:00Z",
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
      params: expect.objectContaining({
        direction: "asc",
        page: "1",
        pageSize: "25",
        sort: "email",
      }),
    });
    expect(wrapper.vm.arrayAccounts[0]).not.toHaveProperty("password");
    expect(wrapper.vm.columns.map((column) => column.key)).toEqual([
      "id",
      "email",
      "name",
      "statusLabel",
      "teams",
      "roleName",
      "updatedAt",
    ]);
    expect(wrapper.vm.accountRows[0]).toMatchObject({
      status: "invited",
      statusLabel: "Invited",
      teams: "QA",
    });
    expect(wrapper.vm.actions.map((action) => action.id)).toEqual([
      "detail",
      "resend-invite",
      "cancel-invite",
      "edit",
      "suspend",
      "reactivate",
      "audit",
      "delete",
    ]);
  });

  it("persists account governance filters in the route and request contract", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/api/admin/accounts") {
        return Promise.resolve({
          data: { data: [], meta: { page: 2, pageSize: 25, total: 0 } },
        });
      }
      if (url === "/api/admin/roles") {
        return Promise.resolve({ data: [{ id: 3, name: "viewer" }] });
      }
      return Promise.resolve({ data: [] });
    });
    const replace = vi.fn().mockResolvedValue();

    const wrapper = shallowMount(Accounts, {
      global: {
        stubs: {
          EnterpriseListingGrid: true,
          EnterpriseListingPage: true,
          modalModifyAccount: true,
        },
        mocks: commonMocks(
          {
            $route: {
              query: {
                "f.invitation": "pending",
                "f.role": "3",
                "f.status": "invited",
                "f.team": "qa",
                page: "2",
              },
            },
            $router: { replace },
          },
          {
            accounts: "admin/accounts",
            costumers: "admin/costumers",
            roles: "admin/roles",
          },
        ),
      },
    });

    await vi.waitFor(() => expect(api.get).toHaveBeenCalled());
    const accountRequest = api.get.mock.calls.find(
      ([url]) => url === "/api/admin/accounts",
    )[1];
    expect(accountRequest.params).toMatchObject({
      "filter[invitation]": "pending",
      "filter[role]": "3",
      "filter[status]": "invited",
      "filter[team]": "qa",
      page: "2",
      pageSize: "25",
    });

    await wrapper.vm.changeFilter("status", "suspended");
    expect(replace).toHaveBeenCalledWith({
      query: {
        direction: "asc",
        "f.invitation": "pending",
        "f.role": "3",
        "f.status": "suspended",
        "f.team": "qa",
        sort: "email",
      },
    });
  });
});
