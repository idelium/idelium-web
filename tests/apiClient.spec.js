import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient, { setUnauthorizedHandler } from "@/services/apiClient";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("central API client", () => {
  beforeEach(() => {
    setUnauthorizedHandler(null);
    useSessionStore(pinia).clear();
  });

  it("uses browser credentials without adding JavaScript-readable secrets", async () => {
    useSessionStore(pinia).establishSession();
    apiClient.defaults.adapter = async (request) => ({
      data: null,
      status: 200,
      statusText: "OK",
      headers: {},
      config: request,
    });

    const response = await apiClient.get("/resource");
    expect(response.config.withCredentials).toBe(true);
    expect(response.config.withXSRFToken).toBe(true);
    expect(apiClient.defaults.xsrfCookieName).toBe("XSRF-TOKEN");
    expect(apiClient.defaults.xsrfHeaderName).toBe("X-XSRF-TOKEN");
    expect(response.config.headers.Authorization).toBeUndefined();
    expect(response.config.headers.Session).toBeUndefined();
  });

  it("runs one predictable logout handler for an authorization failure", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    useSessionStore(pinia).establishSession();
    apiClient.defaults.adapter = () =>
      Promise.reject({ response: { status: 401 }, code: "ERR" });

    await expect(apiClient.get("/protected")).rejects.toMatchObject({
      normalized: { status: 401, message: "Authentication required" },
    });
    expect(handler).toHaveBeenCalledOnce();
    expect(useSessionStore(pinia).isAuthenticated).toBe(false);
  });
});
