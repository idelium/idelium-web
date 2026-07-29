import { describe, expect, it } from "vitest";

import {
  cancellationEligibility,
  createCancellationRequest,
  normalizeCancellationResponse,
  shouldRetryCancellation,
} from "@/domain/runCancellation";

describe("safe run cancellation contract", () => {
  it("shows eligibility and expected scope for active authorized work", () => {
    expect(
      cancellationEligibility(
        {
          activeWorkers: 2,
          id: 44,
          status: "running",
          target: "selenium-grid",
        },
        ["run.cancel"],
      ),
    ).toEqual({
      allowed: true,
      reason: "eligible",
      scope: { activeConcurrency: 2, runId: "44", target: "selenium-grid" },
      status: "running",
    });
  });

  it("does not expose unauthorized or already-terminal cancellation", () => {
    expect(cancellationEligibility({ id: 1, status: "running" })).toMatchObject(
      {
        allowed: false,
        reason: "unauthorized",
      },
    );
    expect(
      cancellationEligibility({ canCancel: true, id: 1, status: "passed" }),
    ).toMatchObject({
      allowed: false,
      reason: "terminal",
    });
  });

  it("creates idempotent auditable cancellation requests", () => {
    const first = createCancellationRequest(
      { canCancel: true, id: 44, status: "running" },
      {
        actor: "admin@idelium.org",
        reason: "Wrong environment",
        requestedAt: "2026-07-29T12:00:00Z",
      },
    );
    const retry = createCancellationRequest(
      { canCancel: true, id: 44, status: "running" },
      {
        actor: "admin@idelium.org",
        idempotencyKey: first.idempotencyKey,
        reason: "Wrong environment",
      },
    );

    expect(first.status).toBe("cancellation-requested");
    expect(first.headers["Idempotency-Key"]).toBe(
      retry.headers["Idempotency-Key"],
    );
    expect(first.audit).toEqual({
      actor: "admin@idelium.org",
      reason: "Wrong environment",
      requestedAt: "2026-07-29T12:00:00.000Z",
    });
  });

  it("does not report cancelled before durable server state confirms it", () => {
    const request = createCancellationRequest(
      { canCancel: true, id: 44, status: "running" },
      { actor: "admin@idelium.org" },
    );

    expect(
      normalizeCancellationResponse({ status: "cancelling" }, request),
    ).toMatchObject({
      audit: { outcome: "cancelling" },
      uiState: "cancelling",
    });
    expect(
      normalizeCancellationResponse({ status: "cancelled" }, request),
    ).toMatchObject({
      audit: { outcome: "cancelled" },
      uiState: "cancelled",
    });
  });

  it("marks timeout and transient failures retryable", () => {
    expect(shouldRetryCancellation({ response: { status: 408 } })).toBe(true);
    expect(shouldRetryCancellation({ response: { status: 403 } })).toBe(false);
  });
});
