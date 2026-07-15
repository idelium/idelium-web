import { beforeEach, describe, expect, it } from "vitest";

import router from "@/router";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("route smoke checks", () => {
  beforeEach(() => useSessionStore(pinia).clear());

  it("opens the login route", async () => {
    await router.push("/login");
    await router.isReady();
    expect(router.currentRoute.value.name).toBe("Login");
  });

  it("redirects an unauthorized main route to login", async () => {
    await router.push("/projects");
    expect(router.currentRoute.value.name).toBe("Login");
    expect(router.currentRoute.value.query.back).toBe("projects");
  });

  it("opens the main project route for an authenticated session", async () => {
    useSessionStore(pinia).establishSession({
      accessToken: "token",
      sessionId: "session",
    });
    await router.push("/projects");
    expect(router.currentRoute.value.name).toBe("projects");
  });
});
