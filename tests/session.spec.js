import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { STORAGE_KEY, useSessionStore } from "@/stores/session";

describe("session store", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("persists non-sensitive session state only for the browser tab", () => {
    const session = useSessionStore();
    session.establishSession();
    session.selectCustomer(7);
    session.selectProject(11);

    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY))).toMatchObject({
      authenticated: true,
      selectedCustomerId: 7,
      selectedProjectId: 11,
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("clears credentials and selection on logout", () => {
    const session = useSessionStore();
    session.establishSession();
    session.selectProject(11);
    session.clear();

    expect(session.isAuthenticated).toBe(false);
    expect(session.selectedProjectId).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("restores a session after a page refresh", () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        authenticated: true,
        selectedProjectId: 5,
      }),
    );
    setActivePinia(createPinia());

    const restored = useSessionStore();
    expect(restored.isAuthenticated).toBe(true);
    expect(restored.selectedProjectId).toBe(5);
  });
});
