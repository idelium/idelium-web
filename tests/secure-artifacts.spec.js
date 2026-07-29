import { describe, expect, it } from "vitest";

import {
  ARTIFACT_PREVIEW_LIMIT_BYTES,
  artifactExplanation,
  canPreviewArtifact,
  fullArtifactRoute,
  normalizeArtifactCollection,
  normalizeArtifactDescriptor,
} from "@/domain/secureArtifacts";

describe("secure artifact, log, response, and report viewing", () => {
  it("normalizes metadata, retention, bounded preview, and expiring downloads", () => {
    const descriptor = normalizeArtifactDescriptor(
      {
        body: { ok: true },
        contentType: "application/json",
        downloadUrl: "/api/projects/9/runs/44/artifacts/1",
        expiresAt: "2026-07-30T00:00:00Z",
        id: 1,
        kind: "response",
        name: "Postman response",
        retention: { policy: "7d" },
        runId: 44,
        sizeBytes: 128,
      },
      { projectId: 9, runId: 44 },
    );

    expect(descriptor).toMatchObject({
      availability: "available",
      contentType: "application/json",
      kind: "response",
      name: "Postman response",
      preview: { available: true, content: '{\n  "ok": true\n}' },
      retention: { policy: "7d" },
    });
    expect(descriptor.download).toEqual({
      authorized: true,
      expiresAt: "2026-07-30T00:00:00.000Z",
      method: "GET",
      url: "/api/projects/9/runs/44/artifacts/1",
    });
  });

  it("blocks raw storage paths and cross-run download descriptors", () => {
    const descriptor = normalizeArtifactDescriptor(
      {
        downloadUrl: "/mnt/storage/customer-a/secret.log",
        projectId: 9,
        runId: 45,
      },
      { projectId: 9, runId: 44 },
    );

    expect(descriptor.download.authorized).toBe(false);
    expect(descriptor.download.url).toBeNull();
  });

  it("explains redacted, expired, oversized, quarantined, and unavailable content", () => {
    const copy = {
      expired: "Expired",
      oversized: "Too large",
      quarantined: "Quarantined",
      redacted: "Redacted",
      unavailable: "Unavailable",
    };
    const redacted = normalizeArtifactDescriptor({
      body: "Authorization: Bearer secret",
      contentType: "text/plain",
    });
    const oversized = normalizeArtifactDescriptor({
      contentType: "text/plain",
      sizeBytes: ARTIFACT_PREVIEW_LIMIT_BYTES + 1,
    });

    expect(canPreviewArtifact(redacted)).toBe(false);
    expect(artifactExplanation(redacted, copy)).toBe("Redacted");
    expect(artifactExplanation({ availability: "expired" }, copy)).toBe(
      "Expired",
    );
    expect(artifactExplanation(oversized, copy)).toBe("Too large");
    expect(artifactExplanation({ availability: "quarantined" }, copy)).toBe(
      "Quarantined",
    );
    expect(artifactExplanation({ availability: "unavailable" }, copy)).toBe(
      "Unavailable",
    );
  });

  it("bounds collection previews and opens a full-window route without losing context", () => {
    const artifacts = normalizeArtifactCollection(
      [
        {
          contentType: "text/plain",
          name: "log",
          text: "a".repeat(30_000),
        },
      ],
      { projectId: 9, runId: 44 },
    );

    expect(artifacts[0].preview.content).toHaveLength(20_000);
    expect(artifacts[0].preview.truncated).toBe(true);
    expect(
      fullArtifactRoute({ artifactId: "log 1", projectId: 9, runId: 44 }),
    ).toEqual({
      name: "execution-detail",
      params: { projectId: "9", runId: "44" },
      query: { artifactId: "log-1", tab: "artifacts" },
    });
  });
});
