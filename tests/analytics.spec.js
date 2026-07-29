import { describe, expect, it, vi } from "vitest";

import { createNoopGtag, installAnalytics } from "@/services/analytics";

describe("analytics service", () => {
  function createAppStub() {
    return {
      config: { globalProperties: {} },
      use: vi.fn(),
    };
  }

  it("provides a no-op gtag event handler", () => {
    expect(() => createNoopGtag().event("local-dev")).not.toThrow();
  });

  it("does not load analytics when the tag id is not configured", async () => {
    const app = createAppStub();
    const loader = vi.fn();

    await expect(installAnalytics(app, {}, loader)).resolves.toBe(false);

    expect(loader).not.toHaveBeenCalled();
    expect(app.use).not.toHaveBeenCalled();
    expect(() =>
      app.config.globalProperties.$gtag.event("route"),
    ).not.toThrow();
  });

  it("installs vue-gtag when the module exposes createGtag", async () => {
    const app = createAppStub();
    const plugin = { install: vi.fn() };
    const createGtag = vi.fn(() => plugin);

    await expect(
      installAnalytics(app, { VITE_GOOGLE_TAG_ID: "G-123" }, async () => ({
        createGtag,
      })),
    ).resolves.toBe(true);

    expect(createGtag).toHaveBeenCalledWith({ tagId: "G-123" });
    expect(app.use).toHaveBeenCalledWith(plugin);
  });

  it("keeps the application bootable when vue-gtag cannot be loaded", async () => {
    const app = createAppStub();

    await expect(
      installAnalytics(app, { VITE_GOOGLE_TAG_ID: "G-123" }, async () => {
        throw new Error("module cache mismatch");
      }),
    ).resolves.toBe(false);

    expect(app.use).not.toHaveBeenCalled();
    expect(() =>
      app.config.globalProperties.$gtag.event("route"),
    ).not.toThrow();
  });
});
