import { describe, expect, it } from "vitest";

import {
  CREDENTIAL_CONTRACT_VERSION,
  createCredentialLifecycleRequest,
  credentialAuthorization,
  legacyCredentialMigrationPolicy,
  normalizeCredentialDescriptor,
  normalizeCredentialList,
  normalizeRevealOnceResult,
  redactCredentialPayload,
} from "@/domain/credentialLifecycle";

describe("credential lifecycle API and migration contract", () => {
  it("normalizes named credentials without exposing complete secret material", () => {
    const credential = normalizeCredentialDescriptor(
      {
        actor: "admin@idelium.org",
        apiKey: "idelium_full_secret_value_must_not_render",
        createdAt: "2026-07-29T10:00:00Z",
        expiresAt: "2026-12-31T00:00:00Z",
        id: "cred-1",
        keyPrefix: "idelium_live",
        last4: "9abc",
        name: "CI production",
        scopes: ["run:execute", "artifact:read"],
        status: "active",
        tenantId: "tenant-1",
      },
      { tenantId: "tenant-1" },
    );

    expect(credential).toEqual({
      actor: "admin@idelium.org",
      contractVersion: CREDENTIAL_CONTRACT_VERSION,
      createdAt: "2026-07-29T10:00:00.000Z",
      expiresAt: "2026-12-31T00:00:00.000Z",
      fingerprint: "idelium_live…9abc",
      id: "cred-1",
      lastUsedAt: null,
      lineage: {
        previousCredentialId: "",
        rotatedAt: null,
        rotatedBy: "",
      },
      name: "CI production",
      prefix: "idelium_live",
      scopes: ["run:execute", "artifact:read"],
      status: "active",
      tenantId: "tenant-1",
    });
    expect(JSON.stringify(credential)).not.toContain("full_secret");
  });

  it("returns secret material only in a reveal-once creation result", () => {
    const created = normalizeRevealOnceResult(
      {
        id: "cred-2",
        key: "idelium_secret_revealed_once_value",
        name: "Local demo",
        scopes: "run:execute artifact:read",
        tenantId: "tenant-1",
      },
      { tenantId: "tenant-1" },
    );
    const listed = normalizeCredentialList([created], { tenantId: "tenant-1" });

    expect(created.secret).toBe("idelium_secret_revealed_once_value");
    expect(created.revealOnce).toBe(true);
    expect(JSON.stringify(listed)).not.toContain(
      "idelium_secret_revealed_once_value",
    );
  });

  it("enforces tenant scope and action capabilities for every lifecycle action", () => {
    expect(
      credentialAuthorization(
        "rotate",
        { id: "cred-1", tenantId: "tenant-2" },
        { capabilities: ["credential.rotate"], tenantId: "tenant-1" },
      ),
    ).toMatchObject({
      allowed: false,
      reason: "tenant-mismatch",
    });
    expect(
      createCredentialLifecycleRequest(
        "revoke",
        { id: "cred-1", name: "CI", tenantId: "tenant-1" },
        {
          actor: "admin@idelium.org",
          capabilities: ["credential.revoke"],
          tenantId: "tenant-1",
        },
      ),
    ).toMatchObject({
      allowed: true,
      body: {
        action: "revoke",
        actor: "admin@idelium.org",
        credentialId: "cred-1",
        name: "CI",
        tenantId: "tenant-1",
      },
      headers: {
        "Idempotency-Key":
          "credential:revoke:tenant-1:cred-1:admin@idelium.org",
      },
    });
    expect(
      createCredentialLifecycleRequest(
        "audit",
        { id: "cred-1", tenantId: "tenant-1" },
        { capabilities: ["credential.list"], tenantId: "tenant-1" },
      ),
    ).toMatchObject({
      allowed: false,
      reason: "missing-capability",
    });
  });

  it("redacts credential logs and defines legacy migration rollback constraints", () => {
    expect(
      redactCredentialPayload({
        audit: {
          authorization: "Bearer abc123",
          message: "token=abc123 should not leak",
          status: "created",
        },
        credentialId: "cred-1",
      }),
    ).toEqual({
      audit: {
        authorization: "[REDACTED]",
        message: "[REDACTED]",
        status: "created",
      },
      credentialId: "cred-1",
    });

    expect(
      legacyCredentialMigrationPolicy({
        deprecationDate: "2026-07-29",
        removalDate: "2026-12-31",
      }),
    ).toMatchObject({
      compatibilityMode: true,
      deprecationDate: "2026-07-29",
      legacyListReturnsSecret: false,
      migrationRequired: true,
      removalDate: "2026-12-31",
    });
  });
});
