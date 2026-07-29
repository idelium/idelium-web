import { describe, expect, it } from "vitest";

import {
  ACCOUNT_GOVERNANCE_CONTRACT_VERSION,
  accountOperationContract,
  buildRolePickerOptions,
  createAccountInvitationRequest,
  legacyAccountCompatibility,
  normalizeAccountDescriptor,
  permissionMatrixForRoles,
  roleMetadata,
  roleReductionWarning,
} from "@/domain/accountGovernance";

describe("account lifecycle and role governance contract", () => {
  it("maps existing accounts deterministically to active lifecycle descriptors", () => {
    expect(
      legacyAccountCompatibility(
        {
          account: "ADMIN@IDELIUM.ORG",
          id: "account-1",
          name: "Administrator",
          role: "admin",
        },
        { tenantId: "tenant-1" },
      ),
    ).toMatchObject({
      contractVersion: ACCOUNT_GOVERNANCE_CONTRACT_VERSION,
      email: "admin@idelium.org",
      id: "account-1",
      migrationRequired: false,
      roleId: "admin",
      status: "active",
      tenantId: "tenant-1",
    });
    expect(
      normalizeAccountDescriptor({
        id: "account-2",
        invitationExpiresAt: "2020-01-01T00:00:00Z",
        role: "operator",
        tenantId: "tenant-1",
      }).status,
    ).toBe("expired-invitation");
  });

  it("defines localized role metadata, permission summaries, and assignment constraints", () => {
    expect(roleMetadata("admin", "it")).toMatchObject({
      assignmentConstraints: ["cannot-remove-last-admin", "tenant-bound"],
      displayName: "Amministratore",
      id: "admin",
      permissions: expect.arrayContaining(["account.invite"]),
    });
    expect(roleMetadata("unknown", "gb")).toMatchObject({
      displayName: "Viewer",
      id: "viewer",
      permissionsSummary: "artifact.read",
    });
  });

  it("builds role picker options and permission matrix from stable role IDs", () => {
    const roles = [
      { id: 1, name: "superadmin" },
      { id: 2, name: "admin" },
      { id: 3, name: "viewer" },
    ];
    const options = buildRolePickerOptions(roles, {
      assignableRoleIds: ["2", "3"],
      copy: { unavailableRole: "Not authorized." },
      language: "gb",
    });

    expect(options).toEqual([
      expect.objectContaining({
        allowed: false,
        disabledReason: "Not authorized.",
        displayName: "superadmin",
        stableId: "1",
        value: "1",
      }),
      expect.objectContaining({
        allowed: true,
        displayName: "admin",
        stableId: "2",
        value: "2",
      }),
      expect.objectContaining({
        allowed: true,
        displayName: "viewer",
        stableId: "3",
        value: "3",
      }),
    ]);
    expect(
      permissionMatrixForRoles(roles, { assignableRoleIds: ["2", "3"] }).find(
        (group) => group.group === "administration",
      ).permissions,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          permission: "account.invite",
          roles: { 1: true, 2: true, 3: false },
        }),
      ]),
    );
    expect(
      roleReductionWarning({ name: "admin" }, { name: "viewer" }, {}),
    ).toBe("governance-reduction");
  });

  it("builds tenant-scoped idempotent contracts for valid account operations", () => {
    expect(
      accountOperationContract(
        "suspend",
        {
          email: "operator@idelium.org",
          id: "account-2",
          role: "operator",
          status: "active",
          tenantId: "tenant-1",
        },
        {
          actor: "admin@idelium.org",
          capabilities: ["account.suspend"],
          reason: "Offboarding",
          tenantId: "tenant-1",
          timestamp: "2026-07-29T10:00:00Z",
        },
      ),
    ).toMatchObject({
      allowed: true,
      audit: {
        accountId: "account-2",
        actor: "admin@idelium.org",
        operation: "suspend",
        outcome: "requested",
        reason: "Offboarding",
        tenantId: "tenant-1",
      },
      body: {
        accountId: "account-2",
        operation: "suspend",
        reason: "Offboarding",
        tenantId: "tenant-1",
      },
      headers: {
        "Idempotency-Key":
          "account:suspend:tenant-1:account-2:admin@idelium.org",
      },
      transition: { nextStatus: "suspended" },
    });
    expect(
      accountOperationContract(
        "role-change",
        {
          id: "account-2",
          role: "operator",
          status: "active",
          tenantId: "tenant-1",
        },
        {
          actor: "admin@idelium.org",
          capabilities: ["account.role.assign"],
          roleId: "admin",
          tenantId: "tenant-1",
        },
      ),
    ).toMatchObject({
      allowed: true,
      body: { roleId: "admin" },
      transition: { nextStatus: "active" },
    });
  });

  it("builds safe idempotent invitation requests without administrator passwords or tokens", () => {
    expect(
      createAccountInvitationRequest(
        {
          email: "New.User@IDELIUM.ORG",
          idCostumer: "team-1",
          name: "New User",
          password: "must-not-be-used",
          role: "2",
        },
        {
          actor: "admin@idelium.org",
          allowedRoleIds: ["1", "2"],
          capabilities: ["account.invite"],
          existingAccounts: [],
          tenantId: "tenant-1",
        },
      ),
    ).toMatchObject({
      allowed: true,
      body: {
        displayName: "New User",
        email: "new.user@idelium.org",
        roleId: "2",
        teamId: "team-1",
        tenantId: "tenant-1",
      },
      headers: {
        "Idempotency-Key":
          "account:invite:tenant-1:new.user@idelium.org:2:admin@idelium.org",
      },
      safeFeedback: "invitation-requested",
    });
    const invalid = createAccountInvitationRequest(
      {
        email: "existing@idelium.org",
        name: "",
        role: "admin",
      },
      {
        actor: "admin@idelium.org",
        capabilities: ["account.invite"],
        existingAccounts: [{ email: "existing@idelium.org" }],
        tenantId: "tenant-1",
      },
    );
    expect(invalid).toMatchObject({ allowed: false, status: "invalid" });
    expect(invalid.errors.map((error) => error.code)).toEqual([
      "required",
      "duplicate",
    ]);
    expect(JSON.stringify(invalid)).not.toContain("token");
    expect(JSON.stringify(invalid)).not.toContain("must-not-be-used");
  });

  it("rejects invalid transitions, forged tenants, self-modification, and last-admin removal", () => {
    const account = {
      id: "account-1",
      role: "admin",
      status: "active",
      tenantId: "tenant-1",
    };
    expect(
      accountOperationContract("suspend", account, {
        actor: "admin@idelium.org",
        capabilities: ["account.suspend"],
        lastAdmin: true,
        tenantId: "tenant-1",
      }),
    ).toMatchObject({
      allowed: false,
      reason: "last-admin-protected",
    });
    expect(
      accountOperationContract("suspend", account, {
        actor: "admin@idelium.org",
        actorAccountId: "account-1",
        capabilities: ["account.suspend"],
        tenantId: "tenant-1",
      }),
    ).toMatchObject({
      allowed: false,
      reason: "self-modification-protected",
    });
    expect(
      accountOperationContract("reactivate", account, {
        actor: "admin@idelium.org",
        capabilities: ["account.reactivate"],
        tenantId: "tenant-1",
      }),
    ).toMatchObject({
      allowed: false,
      reason: "invalid-transition",
    });
    expect(
      accountOperationContract("archive", account, {
        actor: "admin@idelium.org",
        capabilities: ["account.archive"],
        tenantId: "tenant-2",
      }),
    ).toMatchObject({
      allowed: false,
      reason: "tenant-mismatch",
    });
  });
});
