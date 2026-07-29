import { describe, expect, it } from "vitest";

import {
  EXECUTION_CONTRACT_VERSION,
  EXECUTION_STATUSES,
  isTerminalExecutionStatus,
  isTransitionalExecutionStatus,
  normalizeExecutionDetail,
  normalizeExecutionStatus,
  normalizeExecutionSummary,
  normalizeLiveEventBatch,
  requiresLiveEventReplay,
} from "@/domain/executionContracts";
import english from "@/languages/english";
import italian from "@/languages/italian";

describe("versioned execution observability contracts", () => {
  it("renders unknown statuses safely instead of treating them as passed", () => {
    const summary = normalizeExecutionSummary({
      id: "run-1",
      status: "teleported",
    });

    expect(summary.contractVersion).toBe(EXECUTION_CONTRACT_VERSION);
    expect(summary.status).toBe(EXECUTION_STATUSES.UNKNOWN);
    expect(summary.terminal).toBe(false);
    expect(normalizeExecutionStatus("completed")).toBe(
      EXECUTION_STATUSES.PASSED,
    );
    expect(isTerminalExecutionStatus("passed")).toBe(true);
    expect(isTransitionalExecutionStatus("running")).toBe(true);
  });

  it("propagates failed required steps to the test and run outcome", () => {
    const detail = normalizeExecutionDetail({
      id: "run-2",
      projectId: "project-3",
      status: "passed",
      tests: [
        {
          id: "test-1",
          name: "checkout",
          status: "passed",
          steps: [
            {
              id: "step-1",
              name: "submit order",
              required: true,
              status: "failed",
              message: "expected response code 200",
            },
          ],
        },
      ],
    });

    expect(detail.status).toBe(EXECUTION_STATUSES.FAILED);
    expect(detail.tests[0].status).toBe(EXECUTION_STATUSES.FAILED);
    expect(detail.tests[0].steps[0].status).toBe(EXECUTION_STATUSES.FAILED);
    expect(detail.failures).toHaveLength(2);
  });

  it("recovers live-event replay cursors and detects reconnect gaps", () => {
    const batch = normalizeLiveEventBatch(
      [
        {
          data: { Authorization: "Bearer sensitive" },
          runId: "run-3",
          sequenceId: 7,
          status: "running",
          timestamp: "2026-07-29T10:00:00Z",
          type: "step.updated",
        },
        {
          runId: "run-3",
          sequenceId: 8,
          status: "failed",
          timestamp: "2026-07-29T10:00:01Z",
          type: "assertion.updated",
        },
      ],
      { afterSequence: 5 },
    );

    expect(batch.gapDetected).toBe(true);
    expect(requiresLiveEventReplay(batch)).toBe(true);
    expect(batch.nextReplayCursor).toBe(8);
    expect(batch.events[0].payload.Authorization).toBe("[REDACTED]");
  });

  it("normalizes Postman, Selenium, Appium, partial, and legacy results", () => {
    const summary = normalizeExecutionSummary({
      idRun: 44,
      status: 2,
      results: [
        {
          idTest: 10,
          name: "Postman collection",
          runner: "postman",
          steps: [
            {
              idStep: 17,
              status: "completed",
              tests: [{ name: "status code is 200", passed: true }],
            },
          ],
        },
        {
          idTest: 11,
          name: "Browser journey",
          runner: "selenium",
          steps: [{ idStep: 18, status: "running" }],
        },
        {
          idTest: 12,
          name: "Mobile journey",
          runner: "appium",
          steps: [{ idStep: 19, status: "pending" }],
        },
      ],
      artifacts: [
        {
          name: "response",
          type: "json",
          url: "/api/artifacts/44",
          size: 1024,
        },
      ],
      report: { type: "junit", url: "/api/reports/44.xml" },
    });

    expect(summary.id).toBe("44");
    expect(summary.legacy).toEqual({
      legacyStatus: true,
      missingContractVersion: true,
      missingProgress: true,
    });
    expect(summary.tests.map((test) => test.runtime)).toEqual([
      "postman",
      "selenium",
      "appium",
    ]);
    expect(summary.progress).toEqual({ completed: 1, total: 3 });
    expect(summary.counts).toMatchObject({
      artifacts: 1,
      reports: 1,
      tests: 3,
    });
  });

  it("keeps redaction, retention, and localized status copy explicit", () => {
    const summary = normalizeExecutionSummary({
      artifacts: [
        {
          name: "raw response",
          preview: "token=abc",
          retention: { expiresAt: "2026-08-01T00:00:00Z" },
        },
      ],
      redaction: { credentialFields: ["Authorization"] },
      retention: { policy: "30d" },
      status: "blocked",
    });

    expect(summary.redaction.payloadRedacted).toBe(true);
    expect(summary.redaction.credentialFields).toEqual(["Authorization"]);
    expect(summary.retention.policy).toBe("30d");
    expect(summary.artifacts[0].redacted).toBe(true);
    expect(english.ExecutionObservability.statusUnknown).toBeTruthy();
    expect(italian.ExecutionObservability.statusUnknown).toBeTruthy();
  });
});
