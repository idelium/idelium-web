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
    $showConfirm: vi.fn().mockResolvedValue(true),
    $wkToast: vi.fn(),
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
          lifecycleConfirmations: {
            "cancel-invite":
              "Cancel the invitation for {account}? Role: {role}. Impact: {impact}",
            reactivate: "Reactivate {account}? Role: {role}. Impact: {impact}",
            "resend-invite":
              "Resend the invitation for {account}? Role: {role}. Impact: {impact}",
            suspend: "Suspend {account}? Role: {role}. Impact: {impact}",
          },
          lifecycleImpacts: {
            "cancel-invite":
              "The invitation becomes unusable and is retained for audit.",
            reactivate:
              "The account can sign in again according to the API session policy.",
            "resend-invite":
              "A new delivery attempt is requested subject to API rate limits.",
            suspend:
              "Active sessions and credentials are invalidated according to API policy.",
          },
          lifecycleSafeFailure:
            "The lifecycle action could not be completed. The account remains unchanged until the API confirms a durable transition.",
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
          privilegedRoleConfirmation:
            "Change {account} from {currentRole} to {nextRole}? This privileged change is revalidated by the API before it becomes durable.",
          privilegedRoleSafeFailure:
            "The privileged role change could not be completed. The account remains unchanged until the API confirms the administrator invariant.",
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
          EnterpriseListingGrid: {
            name: "EnterpriseListingGrid",
            props: ["density"],
            template: "<div />",
          },
          EnterpriseListingPage: {
            name: "EnterpriseListingPage",
            template: "<section><slot /></section>",
          },
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
    expect(wrapper.vm.actions.find((action) => action.id === "detail")).toMatchObject({
      icon: "eye",
      tooltip: "Details",
    });
    expect(wrapper.vm.actions.find((action) => action.id === "edit")).toMatchObject({
      icon: "pen",
      tooltip: "Edit",
    });
    expect(wrapper.vm.actions.find((action) => action.id === "delete")).toMatchObject({
      icon: "trash",
      tooltip: "Delete",
      variant: "danger",
    });
    expect(wrapper.getComponent({ name: "EnterpriseListingGrid" }).props("density")).toBe(
      "compact",
    );
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

  it("submits idempotent lifecycle actions and updates state only after API confirmation", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/api/admin/accounts") {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 9,
                email: "user@example.test",
                name: "User",
                role: "operator",
                roleName: "Operator",
                status: "active",
                tenantId: "tenant-1",
              },
            ],
            meta: { page: 1, pageSize: 25, total: 1 },
          },
        });
      }
      return Promise.resolve({ data: [] });
    });
    api.post.mockResolvedValue({
      data: {
        status: "suspended",
        updatedAt: "2026-07-29T11:00:00Z",
      },
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
    wrapper.vm.session.capabilities = ["account.suspend"];
    await vi.waitFor(() =>
      expect(wrapper.vm.accountRows[0].status).toBe("active"),
    );

    await wrapper.vm.handleAction({
      action: "suspend",
      row: wrapper.vm.accountRows[0],
    });

    expect(api.post).toHaveBeenCalledWith(
      "/api/admin/accounts/9/suspend",
      expect.objectContaining({
        accountId: "9",
        audit: expect.objectContaining({
          accountId: "9",
          operation: "suspend",
          outcome: "requested",
          tenantId: "tenant-1",
        }),
        operation: "suspend",
        tenantId: "tenant-1",
      }),
      {
        headers: {
          "Idempotency-Key": "account:suspend:tenant-1:9:current-user",
        },
      },
    );
    expect(
      wrapper.vm.arrayAccounts.find((account) => account.id === 9).status,
    ).toBe("suspended");
  });

  it("keeps lifecycle state unchanged when the API rejects a concurrent transition", async () => {
    const originalAccount = {
      id: 10,
      email: "invite@example.test",
      name: "Invite",
      role: "viewer",
      roleName: "Viewer",
      status: "invited",
      tenantId: "tenant-1",
    };
    api.get.mockImplementation((url) => {
      if (url === "/api/admin/accounts") {
        return Promise.resolve({
          data: {
            data: [originalAccount],
            meta: { page: 1, pageSize: 25, total: 1 },
          },
        });
      }
      return Promise.resolve({ data: [] });
    });
    api.post.mockRejectedValue(new Error("conflict"));

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
    wrapper.vm.session.capabilities = ["account.invite"];
    await vi.waitFor(() =>
      expect(wrapper.vm.accountRows[0].status).toBe("invited"),
    );

    await wrapper.vm.handleAction({
      action: "cancel-invite",
      row: wrapper.vm.accountRows[0],
    });

    expect(wrapper.vm.arrayAccounts).toEqual([originalAccount]);
    expect(wrapper.vm.error.safeFeedback).toBe(
      "The lifecycle action could not be completed. The account remains unchanged until the API confirms a durable transition.",
    );
  });

  it("submits privileged role changes with replacement context before profile updates", async () => {
    const accounts = [
      {
        email: "admin@example.test",
        id: 42,
        idCostumer: "tenant-1",
        name: "Admin",
        role: 2,
        status: "active",
      },
      {
        email: "replacement@example.test",
        id: 43,
        idCostumer: "tenant-1",
        name: "Replacement",
        role: 2,
        status: "active",
      },
    ];
    api.get.mockImplementation((url) => {
      if (url === "/api/admin/accounts") {
        return Promise.resolve({
          data: {
            data: accounts,
            meta: { page: 1, pageSize: 25, total: 2 },
          },
        });
      }
      if (url === "/api/admin/roles") {
        return Promise.resolve({
          data: [
            { id: 2, name: "admin" },
            { id: 3, name: "viewer" },
          ],
        });
      }
      if (url === "/api/admin/costumers") {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });
    api.post.mockResolvedValue({ data: { status: "active" } });
    api.put.mockResolvedValue({ data: {} });

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
    wrapper.vm.session.capabilities = ["account.role.assign"];
    await vi.waitFor(() => expect(wrapper.vm.arrayRoles).toHaveLength(2));

    await wrapper.vm.updateAccount({
      id: 42,
      name: "Admin",
      password: "Password1",
      replacementAdminId: "43",
      role: 3,
      type: "modify",
    });

    expect(api.post).toHaveBeenCalledWith(
      "/api/admin/accounts/42/role-change",
      expect.objectContaining({
        accountId: "42",
        audit: expect.objectContaining({
          operation: "role-change",
          replacementAdminId: "43",
          tenantId: "tenant-1",
        }),
        replacementAdminId: "43",
        roleId: "3",
        tenantId: "tenant-1",
      }),
      {
        headers: {
          "Idempotency-Key": "account:role-change:tenant-1:42:current-user",
        },
      },
    );
    expect(api.put).toHaveBeenCalledWith(
      "/api/admin/accounts/42",
      { name: "Admin", password: "Password1" },
      { headers: {} },
    );
  });

  it("loads tenant-scoped redacted audit history and queues authorized exports", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/api/admin/accounts") {
        return Promise.resolve({
          data: {
            data: [
              {
                email: "admin@example.test",
                id: 42,
                idCostumer: "tenant-1",
                name: "Admin",
                role: 2,
                status: "active",
              },
            ],
            meta: { page: 1, pageSize: 25, total: 1 },
          },
        });
      }
      if (url === "/api/admin/roles") {
        return Promise.resolve({ data: [{ id: 2, name: "admin" }] });
      }
      if (url === "/api/admin/costumers") {
        return Promise.resolve({ data: [] });
      }
      if (url === "/api/admin/accounts/42/audit") {
        return Promise.resolve({
          data: {
            data: [
              {
                accountId: "42",
                actor: "admin@example.test",
                correlationId: "corr-1",
                id: "event-1",
                message: "token=secret from 10.0.0.1",
                operation: "suspend",
                status: "success",
                targetLabel: "admin@example.test",
                tenantId: "tenant-1",
              },
            ],
            meta: { page: 1, pageSize: 25, total: 1 },
          },
        });
      }
      return Promise.resolve({ data: [] });
    });
    api.post.mockResolvedValue({ data: { exportId: "export-1" } });

    const wrapper = shallowMount(Accounts, {
      global: {
        stubs: {
          AccountAuditHistory: true,
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
    wrapper.vm.session.capabilities = ["account.audit", "account.audit.export"];
    await vi.waitFor(() => expect(wrapper.vm.accountRows).toHaveLength(1));

    await wrapper.vm.handleAction({
      action: "audit",
      row: wrapper.vm.accountRows[0],
    });

    expect(api.get).toHaveBeenCalledWith("/api/admin/accounts/42/audit", {
      headers: {},
      params: {
        accountId: "42",
        page: "1",
        pageSize: "25",
        tenantId: "tenant-1",
      },
    });
    expect(wrapper.vm.auditEvents[0]).toMatchObject({
      action: "suspend",
      correlationId: "corr-1",
      eventId: "event-1",
      outcome: "success",
    });
    expect(JSON.stringify(wrapper.vm.auditEvents)).not.toContain("secret");
    expect(JSON.stringify(wrapper.vm.auditEvents)).not.toContain("10.0.0.1");

    await wrapper.vm.exportAccountAudit();
    expect(api.post).toHaveBeenCalledWith(
      "/api/admin/accounts/42/audit/exports",
      expect.objectContaining({
        accountId: "42",
        format: "csv",
        tenantId: "tenant-1",
      }),
      {
        headers: {
          "Idempotency-Key": "account-audit-export:tenant-1:42:current-user",
        },
      },
    );
  });
});
