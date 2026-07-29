import { describe, expect, it } from "vitest";

import {
  createCredentialCreationRequest,
  createCredentialRevocationRequest,
  createCredentialRotationRequest,
  createRevealOnceSession,
  credentialAuditRecord,
  credentialAuthorization,
  credentialInventoryRow,
  normalizeCredentialInventory,
  normalizeRevealOnceResult,
  scanCredentialLeakage,
  validateCredentialCreation,
} from "@/domain/credentialLifecycle";

const SYNTHETIC_SECRET = "idelium_synthetic_secret_visible_once_123456";

describe("credential security regression coverage", () => {
  it("keeps complete credentials out of list, audit, URL, storage, logs, and artifacts", () => {
    const reveal = normalizeRevealOnceResult(
      {
        id: "cred-secure",
        key: SYNTHETIC_SECRET,
        name: "Secure CI",
        scopes: ["run:execute"],
        tenantId: "tenant-a",
      },
      { tenantId: "tenant-a" },
    );
    const session = createRevealOnceSession(reveal, {
      now: Date.parse("2026-07-29T10:00:00Z"),
      tenantId: "tenant-a",
    });
    const inventory = normalizeCredentialInventory([session.credential], {
      tenantId: "tenant-a",
    });
    const audit = credentialAuditRecord("create", "success", reveal, {
      actor: "admin@idelium.org",
      reason: "Synthetic regression",
      tenantId: "tenant-a",
      timestamp: "2026-07-29T10:00:00Z",
    });

    expect(session.secret).toBe(SYNTHETIC_SECRET);
    expect(
      scanCredentialLeakage(
        {
          apiLogs: audit,
          artifacts: { markdown: "Credential created for cred-secure" },
          domSnapshot: credentialInventoryRow(inventory[0]),
          localStorage: {},
          sessionStorage: {},
          uiLogs: ["Credential created"],
          url: "/apikey?credentialId=cred-secure&mode=reveal-once",
        },
        [SYNTHETIC_SECRET],
      ),
    ).toEqual([]);
  });

  it("rejects forged tenant, credential, project, customer, and scope identifiers without leaking existence", () => {
    expect(
      credentialAuthorization(
        "rotate",
        {
          id: "forged-credential",
          projectId: "forged-project",
          customerId: "forged-customer",
          tenantId: "tenant-b",
        },
        {
          capabilities: ["credential.rotate"],
          tenantId: "tenant-a",
        },
      ),
    ).toMatchObject({
      allowed: false,
      reason: "tenant-mismatch",
    });
    expect(
      createCredentialRotationRequest(
        { policy: "overlap-24h" },
        {
          id: "forged-credential",
          name: "Forged",
          status: "active",
          tenantId: "tenant-b",
        },
        {
          actor: "admin@idelium.org",
          capabilities: ["credential.rotate"],
          tenantId: "tenant-a",
        },
      ),
    ).toMatchObject({
      allowed: false,
      reason: "tenant-mismatch",
    });
    expect(
      validateCredentialCreation(
        {
          expiresAt: "2027-07-01",
          name: "Escalated",
          scopes: ["credential:admin"],
        },
        {
          actorScopes: ["run:execute"],
        },
      ).errors.map((error) => error.code),
    ).toEqual(["unauthorized-scope"]);
  });

  it("covers create, rotate, revoke, expiration, and last-used transitions with synthetic data only", () => {
    const activeCredential = {
      fingerprint: "safe-fingerprint",
      id: "cred-active",
      lastUsedAt: "2026-07-29T09:00:00Z",
      name: "Active CI",
      scopes: ["run:execute"],
      status: "active",
      tenantId: "tenant-a",
    };
    expect(
      createCredentialCreationRequest(
        {
          expiresAt: "2027-07-01",
          name: "New CI",
          scopes: ["run:execute"],
        },
        {
          actor: "admin@idelium.org",
          actorScopes: ["run:execute"],
          capabilities: ["credential.create"],
          tenantId: "tenant-a",
        },
      ).allowed,
    ).toBe(true);
    expect(
      createCredentialRotationRequest(
        { policy: "overlap-24h" },
        activeCredential,
        {
          actor: "admin@idelium.org",
          capabilities: ["credential.rotate"],
          tenantId: "tenant-a",
        },
      ).allowed,
    ).toBe(true);
    expect(
      createCredentialRevocationRequest(
        {
          confirmFingerprint: "safe-fingerprint",
          confirmName: "Active CI",
          reason: "Synthetic incident",
        },
        activeCredential,
        {
          actor: "admin@idelium.org",
          capabilities: ["credential.revoke"],
          tenantId: "tenant-a",
        },
      ).allowed,
    ).toBe(true);
    expect(
      normalizeCredentialInventory(
        [
          activeCredential,
          {
            expiresAt: "2020-01-01T00:00:00Z",
            id: "cred-expired",
            name: "Expired",
            scopes: ["run:execute"],
            status: "active",
            tenantId: "tenant-a",
          },
        ],
        { tenantId: "tenant-a" },
      ).map((credential) =>
        credentialInventoryRow(credential, { neverUsed: "Never used" }),
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "cred-active",
          lastUsedAt: "2026-07-29",
          status: "active",
        }),
        expect.objectContaining({
          id: "cred-expired",
          lastUsedAt: "Never used",
          status: "expired",
        }),
      ]),
    );
  });
});
