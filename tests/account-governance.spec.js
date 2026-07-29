import { describe, expect, it } from "vitest";

import {
  ACCOUNT_GOVERNANCE_CONTRACT_VERSION,
  accountOperationContract,
  legacyAccountCompatibility,
  normalizeAccountDescriptor,
  roleMetadata,
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
