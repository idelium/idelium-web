import { describe, expect, it } from "vitest";

import {
  assertRedactedArtifact,
  executionDetailRoute,
  hasSensitiveValue,
  normalizeArtifacts,
  normalizeExecutionTimeline,
} from "@/domain/executionDetails";

describe("execution details contract", () => {
  it("normalizes accessible execution timeline entries", () => {
    expect(
      normalizeExecutionTimeline([
        {
          id: 17,
          name: "Postman request",
          status: 2,
          duration: 125,
          message: "expected 200",
          requests: [{ method: "GET" }],
          responses: [{ status: 404 }],
          artifacts: [{ name: "response", type: "json" }],
        },
      ]),
    ).toEqual([
      {
        id: "17",
        name: "Postman request",
        state: "failed",
        durationMs: 125,
        diagnostics: ["expected 200"],
        requestCount: 1,
        responseCount: 1,
        artifactCount: 1,
      },
    ]);
  });

  it("normalizes inline artifacts with bounded previews and safe URLs", () => {
    const artifacts = normalizeArtifacts([
      {
        id: "response body",
        name: "Response body",
        type: "json",
        contentType: "application/json",
        body: { ok: true },
        url: "/api/artifacts/1",
      },
      {
        name: "External link",
        type: "unknown",
        text: "unsafe",
        url: "https://evil.example/artifact",
      },
    ]);

    expect(artifacts).toEqual([
      {
        id: "response-body",
        name: "Response body",
        type: "json",
        contentType: "application/json",
        preview: '{"ok":true}',
        redacted: false,
        downloadUrl: "/api/artifacts/1",
      },
      {
        id: "External-link",
        name: "External link",
        type: "text",
        contentType: "application/octet-stream",
        preview: "unsafe",
        redacted: false,
        downloadUrl: null,
      },
    ]);
  });

  it("builds stable project-scoped detail links", () => {
    expect(
      executionDetailRoute({
        projectId: 3,
        runId: "run 44",
        testId: 17,
        stepId: "step/2",
        artifactId: "response:body",
      }),
    ).toEqual({
      path: "/projects/3/testsperformed",
      query: {
        runId: "run-44",
        testId: "17",
        stepId: "step-2",
        artifactId: "response:body",
      },
    });
  });

  it("detects sensitive values and requires redaction ownership", () => {
    expect(
      hasSensitiveValue({ headers: { Authorization: "Bearer secret" } }),
    ).toBe(true);
    expect(
      assertRedactedArtifact({ preview: "Authorization: Bearer secret" }),
    ).toBe(false);
    expect(
      assertRedactedArtifact({
        preview: "Authorization: Bearer [REDACTED]",
        redacted: true,
      }),
    ).toBe(true);
  });
});
