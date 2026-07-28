import { describe, expect, it } from "vitest";

import {
  buildGridQuery,
  gridStateFromResult,
  parseGridResponse,
  requiresBulkConfirmation,
  sanitizeGridPreferences,
  storageKeyForGrid,
} from "@/domain/enterpriseGrid";

describe("enterprise grid contract", () => {
  it("builds bounded server-side query parameters", () => {
    const query = buildGridQuery({
      page: 2,
      pageSize: 500,
      search: "  smoke test  ",
      sort: { field: "name", direction: "desc" },
      allowedSorts: ["name", "createdAt"],
      filters: {
        status: "active",
        unsafe$key: "ignored",
        tag: ["critical", "regression"],
      },
    });

    expect(query.get("page")).toBe("2");
    expect(query.get("pageSize")).toBe("100");
    expect(query.get("search")).toBe("smoke test");
    expect(query.get("sort")).toBe("name");
    expect(query.get("direction")).toBe("desc");
    expect(query.get("filter[status]")).toBe("active");
    expect(query.get("filter[tag]")).toBe("critical,regression");
    expect(query.has("filter[unsafe$key]")).toBe(false);
  });

  it("parses paginated response metadata without trusting missing fields", () => {
    const result = parseGridResponse({
      data: {
        data: [{ id: 1 }],
        meta: {
          page: "3",
          perPage: "50",
          total: "120",
          hasNextPage: true,
          partial: true,
        },
      },
    });

    expect(result.rows).toEqual([{ id: 1 }]);
    expect(result.meta).toMatchObject({
      page: 3,
      pageSize: 50,
      total: 120,
      hasNextPage: true,
      hasPreviousPage: false,
      partial: true,
    });
  });

  it("maps reusable accessible grid states", () => {
    expect(gridStateFromResult({ loading: true })).toBe("loading");
    expect(gridStateFromResult({ permissionDenied: true })).toBe("permission");
    expect(gridStateFromResult({ error: new Error("boom") })).toBe("error");
    expect(gridStateFromResult({ rows: [], meta: { stale: true } })).toBe(
      "stale",
    );
    expect(gridStateFromResult({ rows: [], meta: { partial: true } })).toBe(
      "partial",
    );
    expect(gridStateFromResult({ rows: [], meta: {} })).toBe("empty");
    expect(gridStateFromResult({ rows: [{ id: 1 }], meta: {} })).toBeNull();
  });

  it("scopes column preferences by tenant and project", () => {
    const key = storageKeyForGrid({
      tenantId: "tenant/one",
      projectId: "project:42",
      gridName: "tests",
    });

    expect(key).toBe("idelium:grid:tenant-one:project-42:tests");

    expect(
      sanitizeGridPreferences(
        { visibleColumns: ["name", "secret"], density: "compact" },
        ["id", "name", "status"],
      ),
    ).toEqual({
      visibleColumns: ["name"],
      density: "compact",
    });
  });

  it("requires confirmation for sensitive bulk actions", () => {
    expect(requiresBulkConfirmation("archive")).toBe(true);
    expect(requiresBulkConfirmation("tag")).toBe(true);
    expect(requiresBulkConfirmation("refresh")).toBe(false);
  });
});
