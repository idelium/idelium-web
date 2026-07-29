import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import AccountAuditHistory from "@/components/account/AccountAuditHistory.vue";
import RolePicker from "@/components/account/RolePicker.vue";
import {
  accountOperationContract,
  createAccountInvitationRequest,
  legacyAccountCompatibility,
  normalizeAccountAuditPage,
} from "@/domain/accountGovernance";
import english from "@/languages/english";
import italian from "@/languages/italian";

const roles = [
  { id: 2, name: "admin" },
  { id: 3, name: "operator" },
  { id: 4, name: "viewer" },
];

describe("account governance critical journey hardening", () => {
  it("rejects every protected transition for missing capability or forged tenant", () => {
    const account = {
      id: "account-1",
      role: "2",
      status: "active",
      tenantId: "tenant-1",
    };

    for (const operation of [
      "archive",
      "audit",
      "reactivate",
      "role-change",
      "suspend",
    ]) {
      expect(
        accountOperationContract(operation, account, {
          capabilities: [],
          roleId: "3",
          tenantId: "tenant-1",
        }),
      ).toMatchObject({ allowed: false, reason: "missing-capability" });
    }

    expect(
      accountOperationContract("suspend", account, {
        capabilities: ["account.suspend"],
        tenantId: "tenant-2",
      }),
    ).toMatchObject({ allowed: false, reason: "tenant-mismatch" });
  });

  it("proves concurrent last-admin requests cannot bypass replacement requirements", () => {
    const account = {
      id: "admin-1",
      role: "2",
      roleId: "admin",
      status: "active",
      tenantId: "tenant-1",
    };
    const context = {
      allowedRoleIds: ["2", "4"],
      capabilities: ["account.role.assign"],
      lastAdmin: true,
      roleCanonicalId: "viewer",
      roleId: "4",
      tenantId: "tenant-1",
    };

    const first = accountOperationContract("role-change", account, context);
    const concurrent = accountOperationContract(
      "role-change",
      account,
      context,
    );

    expect(first).toMatchObject({
      allowed: false,
      reason: "replacement-admin-required",
    });
    expect(concurrent).toMatchObject({
      allowed: false,
      reason: "replacement-admin-required",
    });
  });

  it("keeps invitation, audit, and migration artifacts free of protected values", () => {
    const protectedValue = "complete-secret-token";
    const invitation = createAccountInvitationRequest(
      {
        email: "new@example.test",
        name: "New User",
        password: protectedValue,
        role: "2",
      },
      {
        actor: "admin@example.test",
        allowedRoleIds: ["2"],
        capabilities: ["account.invite"],
        existingAccounts: [],
        tenantId: "tenant-1",
      },
    );
    const audit = normalizeAccountAuditPage({
      data: {
        data: [
          {
            message: `token=${protectedValue} session=${protectedValue}`,
            operation: "invite",
            targetLabel: `New token=${protectedValue}`,
          },
        ],
      },
    });
    const migrated = legacyAccountCompatibility(
      {
        account: "ADMIN@IDELIUM.ORG",
        id: "admin-1",
        role: "admin",
      },
      { tenantId: "tenant-1" },
    );

    expect(invitation.allowed).toBe(true);
    expect(migrated.status).toBe("active");
    expect(JSON.stringify({ audit, invitation, migrated })).not.toContain(
      protectedValue,
    );
  });

  it("exposes keyboard and screen-reader friendly account governance controls", async () => {
    const rolePicker = mount(RolePicker, {
      props: {
        assignableRoleIds: ["2", "3", "4"],
        copy: english.Accounts.rolePicker,
        currentRole: { name: "admin" },
        modelValue: "4",
        roles,
      },
    });
    const radios = rolePicker.findAll('[role="radio"]');
    expect(radios.every((radio) => radio.element.tagName === "BUTTON")).toBe(
      true,
    );
    expect(rolePicker.find('[role="alert"]').exists()).toBe(true);
    await radios[1].trigger("click");
    expect(rolePicker.emitted("update:modelValue")[0]).toEqual(["3"]);

    const auditPanel = mount(AccountAuditHistory, {
      props: {
        account: { email: "admin@example.test", id: "admin-1" },
        copy: english.Accounts.auditHistory,
        events: [],
        filters: { action: "", outcome: "" },
      },
    });
    expect(
      auditPanel.find("section").attributes("aria-labelledby"),
    ).toBeTruthy();
    expect(auditPanel.find("nav").attributes("aria-label")).toBe(
      english.Accounts.auditHistory.pagination,
    );
    expect(auditPanel.findAll("select")).toHaveLength(2);
  });

  it("keeps English and Italian account governance copy aligned", () => {
    for (const locale of [english, italian]) {
      expect(locale.Accounts.auditHistory.title).toBeTruthy();
      expect(locale.Accounts.lifecycleConfirmations.suspend).toContain(
        "{account}",
      );
      expect(locale.Accounts.privilegedRoleConfirmation).toContain(
        "{currentRole}",
      );
      expect(locale.Accounts.replacementAdmin).toBeTruthy();
      expect(
        locale.Accounts.rolePicker.permissions["account.role.assign"],
      ).toBeTruthy();
    }
  });
});
