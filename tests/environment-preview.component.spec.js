import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import EnvironmentResolvedPreview from "@/components/environment/EnvironmentResolvedPreview.vue";
import {
  buildResolvedEnvironmentPreview,
  ENVIRONMENT_PREVIEW_CONTRACT_VERSION,
  serializeResolvedEnvironmentPreview,
} from "@/domain/environmentPreview";
import english from "@/languages/english";
import italian from "@/languages/italian";

function preview() {
  return buildResolvedEnvironmentPreview({
    catalogVersion: "catalog-2026.07",
    fields: [
      {
        overridden: true,
        path: "runtime.baseUrl",
        source: "environment",
        valid: true,
        value: "https://demo.idelium.org",
      },
      {
        path: "runtime.apiToken",
        secretReference: "vault:environment/api",
        source: "project",
        value: "protected-value",
      },
    ],
    launchMutable: true,
    schemaVersion: "2026.07",
  });
}

describe("resolved environment preview", () => {
  it("is deterministic, versioned, and identifies every source", () => {
    const first = serializeResolvedEnvironmentPreview(preview());
    const second = serializeResolvedEnvironmentPreview(preview());

    expect(first).toBe(second);
    expect(JSON.parse(first)).toMatchObject({
      catalogVersion: "catalog-2026.07",
      contractVersion: ENVIRONMENT_PREVIEW_CONTRACT_VERSION,
      launchMutable: true,
      schemaVersion: "2026.07",
    });
    expect(JSON.parse(first).fields.every((field) => field.source)).toBe(true);
    expect(first).toContain("vault:environment/api");
    expect(first).not.toContain("protected-value");
  });

  it("redacts nested, list, authorization, URL credential, and custom fields", () => {
    const protectedValues = [
      "nested-password",
      "array-secret",
      "Bearer protected-token",
      "url-password",
      "custom-secret",
    ];
    const result = buildResolvedEnvironmentPreview({
      catalogVersion: "catalog-1",
      fields: [
        {
          path: "runtime.custom",
          source: "environment",
          value: {
            headers: { authorization: protectedValues[2] },
            list: [{ password: protectedValues[1] }],
            nested: { password: protectedValues[0] },
            target: `https://user:${protectedValues[3]}@example.invalid/path`,
            token: protectedValues[4],
          },
        },
      ],
      schemaVersion: "schema-1",
    });
    const exported = serializeResolvedEnvironmentPreview(result);

    for (const value of protectedValues) expect(exported).not.toContain(value);
    expect(exported.match(/"redacted":true/g).length).toBeGreaterThanOrEqual(4);
  });

  it("rejects missing versions and bounds untrusted fields", () => {
    expect(() => buildResolvedEnvironmentPreview({ fields: [] })).toThrow(
      "Environment preview versions are required.",
    );
    const result = buildResolvedEnvironmentPreview({
      catalogVersion: "catalog-1",
      fields: Array.from({ length: 1_100 }, (_, index) => ({
        path: `config.field-${index}`,
        source: "launch",
        value: index,
      })),
      schemaVersion: "schema-1",
    });
    expect(result.fields).toHaveLength(1_000);
  });

  it("renders sources, launch warning, and approved copy/download actions", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const createObjectURL = vi.fn(() => "blob:preview");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const wrapper = mount(EnvironmentResolvedPreview, {
      props: { copy: english.EnvironmentPreview, preview: preview() },
    });

    expect(wrapper.text()).toContain("Launch-time overrides");
    expect(wrapper.text()).toContain("Environment");
    expect(wrapper.text()).toContain("vault:environment/api");
    await wrapper.findAll("button")[0].trigger("click");
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(writeText.mock.calls[0][0]).not.toContain("protected-value");
    await wrapper.findAll("button")[1].trigger("click");
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    click.mockRestore();
  });

  it("provides complete English and Italian preview copy", () => {
    for (const language of [english, italian]) {
      expect(language.EnvironmentPreview.copy).toBeTruthy();
      expect(language.EnvironmentPreview.download).toBeTruthy();
      expect(language.EnvironmentPreview.launchWarning).toBeTruthy();
      for (const source of ["default", "project", "environment", "launch"]) {
        expect(language.EnvironmentPreview.sources[source]).toBeTruthy();
      }
    }
  });
});
