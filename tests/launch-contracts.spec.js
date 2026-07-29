import { describe, expect, it } from "vitest";

import {
  canReplayLaunchRequest,
  createLaunchApiRequest,
  launchIdempotencyScope,
  normalizeLaunchConfiguration,
  normalizeLaunchDiagnostic,
  redactLaunchConfiguration,
} from "@/domain/launchContracts";
import english from "@/languages/english";
import italian from "@/languages/italian";

const baseLaunch = {
  concurrency: { limit: 2 },
  correlationId: "corr-123",
  cycle: {
    id: "cycle-1",
    name: "Smoke",
    projectId: "project-1",
    tenantId: "tenant-1",
  },
  environment: {
    code: "demo",
    id: "environment-1",
    projectId: "project-1",
    tenantId: "tenant-1",
  },
  options: {
    browser: "chrome",
    tags: ["nightly"],
    timeoutSeconds: 600,
    variables: {
      API_TOKEN: "Bearer complete-secret-token",
      baseUrl: "https://user:pass@example.invalid/path?token=value",
    },
  },
  projectId: "project-1",
  target: {
    browser: "chrome",
    platformId: "platform-1",
    projectId: "project-1",
    tenantId: "tenant-1",
    type: "platform",
  },
  tenantId: "tenant-1",
};

describe("launch configuration contracts", () => {
  it("normalizes required launch inputs and rejects unsupported options", () => {
    const { configuration, diagnostics, valid } = normalizeLaunchConfiguration({
      ...baseLaunch,
      options: { ...baseLaunch.options, unexpectedPayload: true },
    });

    expect(configuration).toMatchObject({
      concurrency: { limit: 2, mode: "parallel" },
      contractVersion: "2026.07",
      cycle: { id: "cycle-1" },
      environment: { code: "demo", id: "environment-1" },
      options: { browser: "chrome", timeoutSeconds: 600 },
      target: { platformId: "platform-1", type: "platform" },
    });
    expect(valid).toBe(false);
    expect(diagnostics).toEqual([
      expect.objectContaining({
        blocking: true,
        code: "launch.validation.unsupportedOption",
        correlationId: "corr-123",
        location: "options.unexpectedPayload",
        remediationKey: "Launch.remediation.unsupportedOption",
        severity: "error",
      }),
    ]);
  });

  it("keeps tenant and project ownership as explicit API validation boundaries", () => {
    const normalized = normalizeLaunchConfiguration({
      ...baseLaunch,
      cycle: { ...baseLaunch.cycle, tenantId: "tenant-2" },
      target: { ...baseLaunch.target, projectId: "project-2" },
    });
    const codes = normalized.diagnostics.map((diagnostic) => diagnostic.code);

    expect(normalized.valid).toBe(false);
    expect(codes).toContain("launch.security.crossTenantReference");
    expect(codes).toContain("launch.security.crossProjectReference");
    expect(createLaunchApiRequest(baseLaunch)).toMatchObject({
      endpoint: "admin/launch",
      legacyEndpoint: "admin/launchtest",
      ownershipValidation: [
        "tenant",
        "project",
        "cycle",
        "environment",
        "target",
      ],
      preflightEndpoint: "admin/launch/preflight",
    });
  });

  it("redacts protected launch values before preview, requests, and replay keys", () => {
    const { configuration } = normalizeLaunchConfiguration(baseLaunch);
    const redacted = redactLaunchConfiguration(configuration);
    const serialized = JSON.stringify(redacted);

    expect(serialized).not.toContain("complete-secret-token");
    expect(serialized).not.toContain("user:pass");
    expect(serialized).not.toContain("token=value");
    expect(serialized).toContain("[REDACTED]");
  });

  it("prevents duplicate launches through scoped idempotency replay semantics", () => {
    const first = createLaunchApiRequest(baseLaunch, { userId: "user-1" });
    const replay = createLaunchApiRequest(baseLaunch, {
      idempotencyKey: first.idempotencyKey,
      userId: "user-1",
    });
    const changedCycle = createLaunchApiRequest(
      { ...baseLaunch, cycle: { ...baseLaunch.cycle, id: "cycle-2" } },
      { idempotencyKey: first.idempotencyKey, userId: "user-1" },
    );

    expect(first.headers["Idempotency-Key"]).toBe(first.idempotencyKey);
    expect(first.idempotencyKey).toBe(
      launchIdempotencyScope(first.body, "user-1"),
    );
    expect(canReplayLaunchRequest(first, replay)).toBe(true);
    expect(canReplayLaunchRequest(first, changedCycle)).toBe(false);
  });

  it("normalizes preflight diagnostics and exposes localized remediation labels", () => {
    expect(
      normalizeLaunchDiagnostic({
        blocking: false,
        code: "launch.preflight.capacityLow",
        location: "target.platform",
        message: "Only one target is currently free.",
        remediationKey: "Launch.remediation.capacityLow",
        severity: "warning",
      }),
    ).toMatchObject({
      blocking: false,
      code: "launch.preflight.capacityLow",
      location: "target.platform",
      remediationKey: "Launch.remediation.capacityLow",
      severity: "warning",
    });
    expect(english.Launch.remediation.capacityLow).toBeTruthy();
    expect(italian.Launch.remediation.capacityLow).toBeTruthy();
  });
});
