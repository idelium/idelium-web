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
    useSessionStore(pinia).establishSession();
    await router.push("/projects");
    expect(router.currentRoute.value.name).toBe("projects");
  });

  it("opens a platform tab route for an authenticated session", async () => {
    const session = useSessionStore(pinia);
    session.establishSession();
    session.selectProject(7);
    await router.push("/projects/7/platforms/os");
    expect(router.currentRoute.value.name).toBe("platforms");
    expect(router.currentRoute.value.params.projectId).toBe("7");
    expect(router.currentRoute.value.params.tab).toBe("os");
  });

  it.each([
    ["/projects/7/environments/new", "environments", "new"],
    ["/projects/7/plugins/import", "plugins", "import"],
    ["/projects/7/steps/new", "steps", "new"],
    ["/projects/7/tests/import", "tests", "import"],
    ["/projects/7/testcycles/new", "testcycles", "new"],
  ])("opens %s as a routable tab", async (path, name, tab) => {
    useSessionStore(pinia).establishSession();
    await router.push(path);
    expect(router.currentRoute.value.name).toBe(name);
    expect(router.currentRoute.value.params.projectId).toBe("7");
    expect(router.currentRoute.value.params.tab).toBe(tab);
  });

  it("redirects legacy project routes to the selected project URL", async () => {
    const session = useSessionStore(pinia);
    session.establishSession();
    session.selectProject(7);

    await router.push("/plugins/import");

    expect(router.currentRoute.value.name).toBe("plugins");
    expect(router.currentRoute.value.path).toBe("/projects/7/plugins/import");
  });
});
