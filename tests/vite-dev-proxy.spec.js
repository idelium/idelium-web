import { describe, expect, it } from "vitest";

import { resolveDevApiProxyTarget } from "../config/devProxy";

describe("Vite development API proxy", () => {
  it("uses the Docker HTTPS reverse proxy by default", () => {
    expect(resolveDevApiProxyTarget({})).toBe("https://localhost");
  });

  it("allows overriding the Docker API target for local development", () => {
    expect(
      resolveDevApiProxyTarget({
        VITE_IDELIUM_DEV_API_TARGET: "https://api.local.test",
      }),
    ).toBe("https://api.local.test");
  });

  it("ignores blank development API targets", () => {
    expect(
      resolveDevApiProxyTarget({
        VITE_IDELIUM_DEV_API_TARGET: " ",
      }),
    ).toBe("https://localhost");
  });
});
