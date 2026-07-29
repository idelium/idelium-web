import { describe, expect, it } from "vitest";

import {
  createRetryRunRequest,
  normalizeRetryRunResponse,
  retryEligibility,
} from "@/domain/runRetry";

describe("retry and rerun workflow contract", () => {
  it("allows full reruns for supported immutable runtime snapshots", () => {
    expect(
      retryEligibility(
        {
          id: 44,
          runtime: "postman",
          status: "failed",
        },
        "full",
      ),
    ).toMatchObject({
      allowed: true,
      reason: "eligible",
      runtime: "postman",
      scope: "full",
      sourceRunId: "44",
    });
  });

  it("only allows retry-failed when a failed scope is available", () => {
    expect(
      retryEligibility(
        {
          failures: [{ id: "step-7" }],
          id: 44,
          runtime: "selenium",
          status: "failed",
        },
        "failed",
      ),
    ).toMatchObject({
      allowed: true,
      reason: "eligible",
      scope: "failed",
    });

    expect(
      retryEligibility(
        {
          id: 45,
          runtime: "selenium",
          status: "passed",
        },
        "failed",
      ),
    ).toMatchObject({
      allowed: false,
      reason: "no-failed-scope",
    });
  });

  it("explains unsupported runners instead of creating hidden retries", () => {
    expect(
      retryEligibility(
        {
          failures: [{ id: "legacy-step" }],
          id: 46,
          runtime: "legacy-runner",
        },
        "failed",
      ),
    ).toMatchObject({
      allowed: false,
      reason: "unsupported-runtime",
    });
  });

  it("forces preflight when inherited assets are missing or snapshot-only", () => {
    expect(
      retryEligibility(
        {
          assets: [
            { available: false, id: "plugin-1", name: "Plugin", version: "2" },
            { id: "safe-plugin", name: "Safe Plugin", version: "1" },
          ],
          failures: [{ id: "step-1" }],
          id: 47,
          runtime: "appium",
        },
        "failed",
      ),
    ).toMatchObject({
      allowed: true,
      reason: "preflight-required",
      requiresPreflight: true,
      unavailableAssets: [{ id: "plugin-1", name: "Plugin", version: "2" }],
    });
  });

  it("creates an idempotent request without mutating or leaking source secrets", () => {
    const source = {
      configuration: {
        authorization: "Bearer very-sensitive-token",
        baseUrl: "https://example.invalid",
      },
      failures: [{ id: "step-2" }],
      id: 48,
      runtime: "postman",
      version: "snapshot-7",
    };

    const request = createRetryRunRequest(source, {
      actor: "admin@idelium.org",
      scope: "failed",
    });

    expect(source.configuration.authorization).toContain("very-sensitive");
    expect(request).toMatchObject({
      allowed: true,
      body: {
        actor: "admin@idelium.org",
        configurationSnapshot: {
          authorization: "[REDACTED]",
          baseUrl: "https://example.invalid",
        },
        scope: "failed",
        selectedFailedScope: ["step-2"],
        sourceRunId: "48",
        sourceVersion: "snapshot-7",
      },
      headers: {
        "Idempotency-Key": "retry:48:failed:admin@idelium.org",
      },
    });
  });

  it("returns a mutually traceable derived run route", () => {
    expect(
      normalizeRetryRunResponse(
        { data: { id: 49, projectId: 3, sourceRunId: 48 } },
        {},
      ),
    ).toEqual({
      derivedRunId: "49",
      sourceRunId: "48",
      trace: {
        derivedRunId: "49",
        sourceRunId: "48",
      },
      route: {
        name: "execution-detail",
        params: { projectId: "3", runId: "49" },
        query: { tab: "overview" },
      },
    });
  });
});
