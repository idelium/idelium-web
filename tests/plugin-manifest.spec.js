import { describe, expect, it } from "vitest";

import { pluginApprovalView, shortPluginHash } from "@/domain/pluginManifest";

describe("plugin manifest metadata", () => {
  it("shows approved only when provenance, hash, and subprocess mode are present", () => {
    expect(
      pluginApprovalView({
        approvalStatus: "approved",
        provenanceReviewed: true,
        sourceSha256: "1234567890abcdef",
        executionMode: "subprocess",
      }),
    ).toMatchObject({
      status: "approved",
      variant: "success",
      label: "Approved",
    });
  });

  it("shows unapproved plugins as saved but blocked from execution", () => {
    expect(pluginApprovalView({ approvalStatus: "unapproved" })).toMatchObject({
      status: "unapproved",
      variant: "warning",
      label: "Unapproved",
    });
  });

  it("marks incomplete approved metadata as invalid", () => {
    expect(
      pluginApprovalView({
        approvalStatus: "approved",
        provenanceReviewed: false,
        sourceSha256: "",
        executionMode: "direct",
      }),
    ).toMatchObject({
      status: "invalid",
      variant: "danger",
      label: "Invalid",
    });
  });

  it("renders short hashes without exposing source code", () => {
    expect(shortPluginHash({ sourceSha256: "abcdef1234567890" })).toBe(
      "abcdef123456",
    );
  });
});
