import { beforeEach, describe, expect, it } from "vitest";

import router from "@/router";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";
import {
  setUnsavedChangesConfirmationHandler,
  useNavigationStore,
} from "@/stores/navigation";

describe("route smoke checks", () => {
  beforeEach(() => {
    useSessionStore(pinia).clear();
    useNavigationStore(pinia).clearAll();
    setUnsavedChangesConfirmationHandler(null);
  });

  it("opens the login route", async () => {
    await router.push("/login");
    await router.isReady();
    expect(router.currentRoute.value.name).toBe("Login");
  });

  it("redirects an unauthorized main route to login", async () => {
    await router.push("/projects");
    expect(router.currentRoute.value.name).toBe("Login");
    expect(router.currentRoute.value.query.back).toBe("/projects");
  });

  it("preserves project-scoped URLs when redirecting unauthorized users to login", async () => {
    await router.push("/projects/3/testsperformed");
    expect(router.currentRoute.value.name).toBe("Login");
    expect(router.currentRoute.value.query.back).toBe(
      "/projects/3/testsperformed",
    );
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

  it.each([
    ["/projects/7/environments/environment-2/detail", "environment-detail"],
    ["/projects/7/environments/environment-2/edit", "environment-edit"],
    ["/projects/7/environments/environment-2/clone", "environment-clone"],
  ])("opens canonical environment route %s", async (path, name) => {
    useSessionStore(pinia).establishSession();
    await router.push(path);
    expect(router.currentRoute.value.name).toBe(name);
    expect(router.currentRoute.value.params.projectId).toBe("7");
    expect(router.currentRoute.value.params.environmentId).toBe(
      "environment-2",
    );
  });

  it("opens the canonical execution detail route", async () => {
    useSessionStore(pinia).establishSession();
    await router.push("/projects/7/executions/run-42");
    expect(router.currentRoute.value.name).toBe("execution-detail");
    expect(router.currentRoute.value.params.projectId).toBe("7");
    expect(router.currentRoute.value.params.runId).toBe("run-42");
  });

  it("opens the canonical performed test step results route", async () => {
    useSessionStore(pinia).establishSession();
    await router.push(
      "/projects/7/testsperformed/tests/55/steps?testCycleId=1&runId=9",
    );
    expect(router.currentRoute.value.name).toBe("testsperformed-step-results");
    expect(router.currentRoute.value.params.projectId).toBe("7");
    expect(router.currentRoute.value.params.testId).toBe("55");
    expect(router.currentRoute.value.query.runId).toBe("9");
  });

  it("redirects legacy project routes to the selected project URL", async () => {
    const session = useSessionStore(pinia);
    session.establishSession();
    session.selectProject(7);

    await router.push("/plugins/import");

    expect(router.currentRoute.value.name).toBe("plugins");
    expect(router.currentRoute.value.path).toBe("/projects/7/plugins/import");
  });

  it("keeps the current route when unsaved changes are not discarded", async () => {
    const session = useSessionStore(pinia);
    session.establishSession();
    session.selectProject(7);
    await router.push("/projects/7/steps/new");
    useNavigationStore(pinia).markDirty("step:new", "Reusable step");
    setUnsavedChangesConfirmationHandler(() => Promise.resolve(false));

    await router.push("/projects/7/environments/new");

    expect(router.currentRoute.value.path).toBe("/projects/7/steps/new");
  });

  it("clears dirty state after a confirmed route transition", async () => {
    const session = useSessionStore(pinia);
    session.establishSession();
    session.selectProject(7);
    await router.push("/projects/7/steps/new");
    const navigation = useNavigationStore(pinia);
    navigation.markDirty("step:new", "Reusable step");
    setUnsavedChangesConfirmationHandler(() => Promise.resolve(true));

    await router.push("/projects/7/environments/new");

    expect(router.currentRoute.value.path).toBe("/projects/7/environments/new");
    expect(navigation.hasUnsavedChanges).toBe(false);
  });
});
