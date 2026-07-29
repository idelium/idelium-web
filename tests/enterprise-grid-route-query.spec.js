import { describe, expect, it, vi } from "vitest";

import { createEnterpriseGridQueryController } from "@/composables/useEnterpriseGridQuery";
import {
  mergeGridRouteState,
  parseGridRouteQuery,
  serializeGridRouteQuery,
} from "@/domain/enterpriseGrid";

const options = {
  allowedFilters: ["status", "type", "accessToken"],
  allowedSorts: ["name", "createdAt"],
};

describe("enterprise grid route query", () => {
  it("restores and canonicalizes an authorized deep link", () => {
    const state = parseGridRouteQuery(
      {
        page: "3",
        pageSize: "500",
        search: " checkout ",
        sort: "name",
        direction: "desc",
        "filter[status]": "active",
        "f.accessToken": "must-not-survive",
        "f.unknown": "ignored",
      },
      options,
    );

    expect(state).toEqual({
      page: 3,
      pageSize: 100,
      search: "checkout",
      sort: { field: "name", direction: "desc" },
      filters: { status: "active" },
    });
    expect(serializeGridRouteQuery(state, options)).toEqual({
      page: "3",
      pageSize: "100",
      q: "checkout",
      sort: "name",
      direction: "desc",
      "f.status": "active",
    });
  });

  it("fails safely for malformed values and resets pagination on criteria changes", () => {
    const next = mergeGridRouteState(
      {
        page: "99",
        pageSize: "-10",
        sort: "unauthorized",
        direction: "sideways",
        "f.status": "active",
      },
      { filters: { status: "archived" } },
      options,
    );

    expect(next).toEqual({ "f.status": "archived" });
  });

  it("preserves unrelated route state and debounces search replacements", async () => {
    vi.useFakeTimers();
    const route = {
      query: { drawer: "42", page: "5", "f.status": "active" },
    };
    const router = { replace: vi.fn().mockResolvedValue() };
    const controller = createEnterpriseGridQueryController({
      route,
      router,
      ...options,
      debounceMs: 200,
    });

    controller.setSearch("first");
    controller.setSearch("second");
    await vi.advanceTimersByTimeAsync(200);

    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith({
      query: {
        drawer: "42",
        q: "second",
        "f.status": "active",
      },
    });
    controller.dispose();
    vi.useRealTimers();
  });

  it("supports explicit page navigation for browser history restoration", async () => {
    const route = { query: { q: "smoke" } };
    const router = { replace: vi.fn().mockResolvedValue() };
    const controller = createEnterpriseGridQueryController({
      route,
      router,
      ...options,
    });

    await controller.replace({ page: 2 });

    expect(router.replace).toHaveBeenCalledWith({
      query: { q: "smoke", page: "2" },
    });
    expect(controller.current().search).toBe("smoke");
  });
});
