import { describe, expect, it } from "vitest";

import {
  resolveApiBaseUrl,
  resolvePublicSiteUrl,
} from "@/services/runtimeConfig";

describe("runtime configuration", () => {
  it("uses reverse-proxy friendly defaults", () => {
    expect(resolveApiBaseUrl({})).toBe("/api/");
    expect(resolvePublicSiteUrl({})).toBe("https://github.com/idelium/");
  });

  it("normalizes configured URLs with a trailing slash", () => {
    expect(
      resolveApiBaseUrl({
        VITE_IDELIUM_API_BASE_URL: "https://example.test/api",
      }),
    ).toBe("https://example.test/api/");
    expect(
      resolvePublicSiteUrl({
        VITE_IDELIUM_PUBLIC_SITE_URL: "https://github.com/idelium/idelium-web",
      }),
    ).toBe("https://github.com/idelium/idelium-web/");
  });

  it("ignores blank configured URLs", () => {
    expect(resolveApiBaseUrl({ VITE_IDELIUM_API_BASE_URL: " " })).toBe("/api/");
    expect(resolvePublicSiteUrl({ VITE_IDELIUM_PUBLIC_SITE_URL: " " })).toBe(
      "https://github.com/idelium/",
    );
  });
});
