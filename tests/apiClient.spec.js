import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient, { setUnauthorizedHandler } from "@/services/apiClient";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("central API client", () => {
  beforeEach(() => {
    setUnauthorizedHandler(null);
    useSessionStore(pinia).clear();
  });

  it("adds authorization state without exposing it to callers", async () => {
    useSessionStore(pinia).establishSession({
      accessToken: "secret-token",
      sessionId: "session-id",
    });
    apiClient.defaults.adapter = async (request) => ({
      data: null,
      status: 200,
      statusText: "OK",
      headers: {},
      config: request,
    });

    const response = await apiClient.get("/resource");
    expect(response.config.headers.Authorization).toBe("Bearer secret-token");
    expect(response.config.headers.Session).toBe("session-id");
  });

  it("runs one predictable logout handler for an authorization failure", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    useSessionStore(pinia).establishSession({
      accessToken: "secret-token",
      sessionId: "session-id",
    });
    apiClient.defaults.adapter = () =>
      Promise.reject({ response: { status: 401 }, code: "ERR" });

    await expect(apiClient.get("/protected")).rejects.toMatchObject({
      normalized: { status: 401, message: "Authentication required" },
    });
    expect(handler).toHaveBeenCalledOnce();
    expect(useSessionStore(pinia).isAuthenticated).toBe(false);
  });
});
