import { beforeEach, describe, expect, it, vi } from "vitest";

const { api } = vi.hoisted(() => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("@/services/apiClient", () => ({ default: api }));

import {
  createGridQuerySnapshot,
  getGridBulkJob,
  startGridBulkJob,
} from "@/services/enterpriseBulkOperations";

describe("enterprise bulk operation service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates snapshots and starts bounded server jobs", async () => {
    api.post
      .mockResolvedValueOnce({
        data: { data: { id: "snapshot-1", total: 25 } },
      })
      .mockResolvedValueOnce({
        data: { data: { id: "job-1", status: "queued" } },
      });

    await expect(
      createGridQuerySnapshot("/admin/grid", {
        resource: "projects",
        query: { q: "checkout" },
      }),
    ).resolves.toMatchObject({ id: "snapshot-1" });
    await expect(
      startGridBulkJob("/admin/grid", {
        action: "export",
        querySnapshotId: "snapshot-1",
      }),
    ).resolves.toMatchObject({ id: "job-1" });
  });

  it("rejects all-results operations without a server snapshot", async () => {
    await expect(
      startGridBulkJob("/admin/grid", { action: "archive" }),
    ).rejects.toThrow("validated server query snapshot");
    expect(api.post).not.toHaveBeenCalled();
  });

  it("retrieves partial-failure job outcomes", async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          id: "job-1",
          status: "partial",
          processedCount: 8,
          failedCount: 2,
        },
      },
    });

    await expect(getGridBulkJob("/admin/grid", "job-1")).resolves.toMatchObject(
      { failedCount: 2 },
    );
  });
});
