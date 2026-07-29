import { describe, expect, it } from "vitest";

import {
  CREDENTIAL_CONTRACT_VERSION,
  createRevealOnceSession,
  createCredentialLifecycleRequest,
  createCredentialCreationRequest,
  createCredentialRevocationRequest,
  createCredentialRotationRequest,
  credentialUsageSnippets,
  credentialAuthorization,
  buildCredentialInventoryQuery,
  credentialInventoryActions,
  credentialInventoryRow,
  applyCredentialRotationResult,
  legacyCredentialMigrationPolicy,
  validateCredentialCreation,
  validateCredentialRevocation,
  validateCredentialUsageSnippet,
  validateCredentialRotation,
  normalizeCredentialInventory,
  normalizeCredentialDescriptor,
  normalizeCredentialList,
  normalizeRevealOnceResult,
  revealOnceDownloadPayload,
  revealOnceSafeSnapshot,
  redactCredentialPayload,
  shouldClearRevealOnceRoute,
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

  it("keeps reveal-once sessions volatile and exports only after acknowledgement", () => {
    const session = createRevealOnceSession(
      {
        id: "cred-3",
        key: "idelium_secret_revealed_once_value",
        name: "CI",
        scopes: ["run:execute"],
        tenantId: "tenant-1",
      },
      { now: Date.parse("2026-07-29T10:00:00Z"), tenantId: "tenant-1" },
    );

    expect(session).toMatchObject({
      acknowledged: false,
      credential: {
        id: "cred-3",
        name: "CI",
        revealOnce: true,
        tenantId: "tenant-1",
      },
      expiresAt: "2026-07-29T10:10:00.000Z",
      secret: "idelium_secret_revealed_once_value",
    });
    expect(JSON.stringify(revealOnceSafeSnapshot(session))).not.toContain(
      "idelium_secret_revealed_once_value",
    );
    expect(
      revealOnceDownloadPayload(session, { acknowledged: false }),
    ).toMatchObject({
      allowed: false,
      reason: "acknowledgement-required",
    });
    expect(
      revealOnceDownloadPayload(session, { acknowledged: true }),
    ).toMatchObject({
      allowed: true,
      filename: "CI.idelium",
      text: "idelium_secret_revealed_once_value",
    });
  });

  it("clears reveal-once material on navigation except the in-memory reveal route", () => {
    const session = {
      credential: { id: "cred-3" },
      secret: "idelium_secret_revealed_once_value",
    };

    expect(
      shouldClearRevealOnceRoute(
        {
          fullPath: "/apikey?mode=reveal-once&credentialId=cred-3",
          name: "apikey",
          params: {},
          query: { credentialId: "cred-3", mode: "reveal-once" },
        },
        { fullPath: "/apikey", name: "apikey", params: {}, query: {} },
        session,
      ),
    ).toBe(false);
    expect(
      shouldClearRevealOnceRoute(
        {
          fullPath: "/projects/2/apikey",
          name: "apikey",
          params: { idProject: "2" },
          query: {},
        },
        {
          fullPath: "/projects/1/apikey",
          name: "apikey",
          params: { idProject: "1" },
          query: {},
        },
        session,
      ),
    ).toBe(true);
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

  it("builds bounded filtered inventory rows and capability-scoped actions", () => {
    const inventory = normalizeCredentialInventory(
      [
        {
          actor: "admin@idelium.org",
          expiresAt: "2027-07-30T00:00:00Z",
          fingerprint: "safe-fingerprint",
          id: "cred-active",
          name: "CI",
          scopes: ["run:execute"],
          status: "active",
          tenantId: "tenant-1",
        },
        {
          actor: "admin@idelium.org",
          id: "cred-revoked",
          name: "Old",
          scopes: ["artifact:read"],
          status: "revoked",
          tenantId: "tenant-1",
        },
      ],
      { filters: { scope: "run:execute", status: "active" }, limit: 50 },
    );

    expect(inventory).toHaveLength(1);
    expect(
      credentialInventoryRow(inventory[0], { neverUsed: "Never used" }),
    ).toMatchObject({
      fingerprint: "safe-fingerprint",
      lastUsedAt: "Never used",
      name: "CI",
      scopes: "run:execute",
    });
    expect(
      buildCredentialInventoryQuery(
        { pageSize: 500, status: "active,revoked,invalid" },
        { tenantId: "tenant-1" },
      ).toString(),
    ).toBe("tenantId=tenant-1&pageSize=100&status=active&status=revoked");
    expect(
      credentialInventoryActions(
        { id: "cred-1", name: "CI", status: "active" },
        { capabilities: ["credential.rotate", "credential.audit"] },
      ).map((action) => action.id),
    ).toEqual(["rotate", "audit"]);
  });

  it("validates least-privilege credential creation and idempotent submission", () => {
    expect(validateCredentialCreation({ name: "CI" })).toMatchObject({
      valid: true,
      model: { scopes: ["run:execute"] },
    });
    expect(
      validateCredentialCreation(
        {
          expiresAt: "2028-12-31",
          name: "CI",
          scopes: ["run:execute", "credential:admin", "artifact:read"],
        },
        {
          actorScopes: ["run:execute", "artifact:read"],
          existingCredentials: [{ name: "CI" }],
        },
      ).errors.map((error) => error.code),
    ).toEqual([
      "duplicate",
      "unauthorized-scope",
      "maximum-lifetime",
      "dangerous-combination",
    ]);

    expect(
      createCredentialCreationRequest(
        {
          description: "CI token",
          expiresAt: "2027-07-01",
          name: "CI",
          scopes: ["run:execute"],
        },
        {
          actor: "admin@idelium.org",
          actorScopes: ["run:execute"],
          capabilities: ["credential.create"],
          tenantId: "tenant-1",
        },
      ),
    ).toMatchObject({
      allowed: true,
      body: {
        description: "CI token",
        expiresAt: "2027-07-01",
        name: "CI",
        scopes: ["run:execute"],
        tenantId: "tenant-1",
      },
      headers: {
        "Idempotency-Key":
          "credential:create:tenant-1:admin@idelium.org:CI:2027-07-01:run:execute",
      },
    });
  });

  it("builds idempotent rotation requests and visible lineage without secrets", () => {
    const credential = {
      expiresAt: "2027-07-01",
      id: "cred-old",
      name: "CI",
      scopes: ["run:execute"],
      status: "active",
      tenantId: "tenant-1",
    };

    expect(
      validateCredentialRotation({ policy: "overlap-24h" }, credential),
    ).toMatchObject({
      valid: true,
      model: { policy: "overlap-24h" },
    });
    expect(
      validateCredentialRotation(
        { policy: "overlap-24h" },
        { ...credential, status: "revoked" },
      ).errors.map((error) => error.code),
    ).toEqual(["terminal-state"]);
    expect(
      createCredentialRotationRequest({ policy: "overlap-7d" }, credential, {
        actor: "admin@idelium.org",
        capabilities: ["credential.rotate"],
        tenantId: "tenant-1",
      }),
    ).toMatchObject({
      allowed: true,
      body: {
        credentialId: "cred-old",
        policy: "overlap-7d",
        tenantId: "tenant-1",
      },
      headers: {
        "Idempotency-Key":
          "credential:rotate:tenant-1:cred-old:admin@idelium.org:overlap-7d",
      },
    });

    const rotated = applyCredentialRotationResult(
      [credential],
      credential,
      {
        id: "cred-new",
        key: "idelium_new_secret_must_not_enter_inventory",
        name: "CI rotated",
        scopes: ["run:execute"],
        tenantId: "tenant-1",
      },
      {
        actor: "admin@idelium.org",
        rotatedAt: "2026-07-29T10:00:00Z",
        tenantId: "tenant-1",
      },
    );

    expect(rotated).toHaveLength(2);
    expect(rotated.map((entry) => entry.status)).toContain("rotated");
    expect(
      credentialInventoryRow(rotated[1], { rotatedFrom: "Rotated from" })
        .lineage,
    ).toBe("Rotated from cred-old");
    expect(JSON.stringify(rotated)).not.toContain("new_secret");
  });

  it("requires deliberate idempotent revocation confirmation", () => {
    const credential = {
      fingerprint: "safe-fingerprint",
      id: "cred-old",
      name: "CI",
      scopes: ["run:execute"],
      status: "active",
      tenantId: "tenant-1",
    };

    expect(
      validateCredentialRevocation(
        {
          confirmFingerprint: "safe-fingerprint",
          confirmName: "CI",
          elevated: true,
          reason: "Compromised automation host",
        },
        credential,
        { reasonRequired: true, requiresElevatedConfirmation: true },
      ),
    ).toMatchObject({ valid: true });
    expect(
      validateCredentialRevocation(
        {
          confirmFingerprint: "wrong",
          confirmName: "Wrong",
        },
        { ...credential, status: "revoked" },
        { reasonRequired: true, requiresElevatedConfirmation: true },
      ).errors.map((error) => error.code),
    ).toEqual([
      "already-revoked",
      "confirmation-mismatch",
      "confirmation-mismatch",
      "reason-required",
      "elevated-confirmation-required",
    ]);
    expect(
      createCredentialRevocationRequest(
        {
          confirmFingerprint: "safe-fingerprint",
          confirmName: "CI",
          reason: "Compromised automation host",
        },
        credential,
        {
          actor: "admin@idelium.org",
          capabilities: ["credential.revoke"],
          tenantId: "tenant-1",
        },
      ),
    ).toMatchObject({
      allowed: true,
      body: {
        actor: "admin@idelium.org",
        credentialId: "cred-old",
        reason: "Compromised automation host",
        tenantId: "tenant-1",
      },
      headers: {
        "Idempotency-Key":
          "credential:revoke:tenant-1:cred-old:admin@idelium.org:Compromised-automation-host",
      },
    });
  });

  it("generates redacted pinned CLI and CI usage snippets", () => {
    const snippets = credentialUsageSnippets({
      baseUrl: "https://idelium.io",
      cliVersion: "latest",
      cycleId: "2",
      environment: "demo",
      projectId: "3",
    });
    const rendered = snippets.map((snippet) => snippet.body).join("\n---\n");

    expect(snippets).toHaveLength(3);
    expect(rendered).toContain("idelium==1.0.14");
    expect(rendered).toContain("actions/checkout@v4");
    expect(rendered).toContain("actions/setup-python@v5");
    expect(rendered).toContain("https://idelium.org");
    expect(rendered).not.toContain("idelium.io");
    expect(rendered).not.toContain("latest");
    expect(rendered).not.toContain("idelium_secret");
    expect(snippets.map(validateCredentialUsageSnippet)).toEqual([
      { id: "local-shell", safe: true },
      { id: "github-actions", safe: true },
      { id: "generic-ci", safe: true },
    ]);
  });
});
