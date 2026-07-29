import { describe, expect, it, vi } from "vitest";

import { createEnterpriseDetailRouteController } from "@/composables/useEnterpriseDetailRoute";

describe("enterprise detail route", () => {
  it("opens and closes a deep-linkable detail without losing table state", async () => {
    const route = { query: { q: "checkout", page: "2" } };
    const router = {
      push: vi.fn().mockResolvedValue(),
    };
    const controller = createEnterpriseDetailRouteController({ route, router });

    await controller.open(42);
    expect(router.push).toHaveBeenCalledWith({
      query: { q: "checkout", page: "2", detail: "42" },
    });

    route.query.detail = "42";
    expect(controller.current()).toBe("42");
    await controller.close();
    expect(router.push).toHaveBeenLastCalledWith({
      query: { q: "checkout", page: "2" },
    });
  });

  it("rejects malformed detail identifiers", () => {
    const controller = createEnterpriseDetailRouteController({
      route: { query: { detail: "../../tenant" } },
      router: { push: vi.fn() },
    });

    expect(controller.current()).toBeNull();
    expect(() => controller.open("token value")).toThrow("stable safe entity");
  });
});
