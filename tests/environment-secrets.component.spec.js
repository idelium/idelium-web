import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import EnvironmentSecretSelector from "@/components/environment/EnvironmentSecretSelector.vue";
import {
  containsSensitiveSecretPayload,
  exportSecretReferences,
  findSecretReference,
  normalizeSecretReferenceCatalog,
  SECRET_REFERENCE_METADATA_FIELDS,
} from "@/domain/environmentSecrets";
import english from "@/languages/english";
import italian from "@/languages/italian";

const tenantId = "customer-1";

function secret(overrides = {}) {
  return {
    capabilities: ["selenium", "postman"],
    id: "vault:environment/main",
    lastValidatedAt: "2026-07-29T08:00:00Z",
    name: "Environment credential",
    provider: "Idelium Vault",
    scope: "project/demo",
    status: "active",
    tenantId,
    usageCount: 2,
    ...overrides,
  };
}

describe("environment secret references", () => {
  it("allowlists metadata and never retains a secret returned by an API", () => {
    const protectedValue = "must-never-reach-the-browser";
    const catalog = normalizeSecretReferenceCatalog(
      [
        secret({
          authorization: `Bearer ${protectedValue}`,
          secretValue: protectedValue,
          token: protectedValue,
        }),
      ],
      { requiredCapability: "postman", tenantId },
    );

    expect(Object.keys(catalog.references[0]).sort()).toEqual(
      [...SECRET_REFERENCE_METADATA_FIELDS].sort(),
    );
    expect(JSON.stringify(catalog)).not.toContain(protectedValue);
    expect(containsSensitiveSecretPayload(catalog)).toBe(false);
  });

  it("makes forged, missing, cross-customer, and unauthorized IDs indistinguishable", () => {
    const catalog = normalizeSecretReferenceCatalog(
      [
        secret({ id: "vault:foreign", tenantId: "customer-2" }),
        secret({ capabilities: ["selenium"], id: "vault:wrong-capability" }),
      ],
      { requiredCapability: "postman", tenantId },
    );

    const forged = findSecretReference(catalog, "../../forged?token=value");
    const missing = findSecretReference(catalog, "vault:missing");
    expect(forged).toEqual(missing);
    expect(forged.diagnostic.code).toBe("secretReference.unavailable");
    expect(JSON.stringify(catalog)).not.toContain("customer-2");
  });

  it("blocks revoked and expired references with stable diagnostics", () => {
    for (const status of ["revoked", "expired"]) {
      const catalog = normalizeSecretReferenceCatalog([secret({ status })], {
        tenantId,
      });
      expect(
        findSecretReference(catalog, "vault:environment/main").diagnostic.code,
      ).toBe(`secretReference.${status}`);
    }
  });

  it("exports safe references and redacts malformed legacy bindings", () => {
    const exported = exportSecretReferences([
      {
        alias: "API_TOKEN",
        referenceId: "vault:environment/main",
        value: "protected-value",
      },
      { alias: "LEGACY", value: "legacy-secret" },
    ]);

    expect(exported).toEqual([
      {
        alias: "API_TOKEN",
        referenceId: "vault:environment/main",
      },
      { value: "[REDACTED]" },
    ]);
    expect(JSON.stringify(exported)).not.toContain("protected-value");
    expect(JSON.stringify(exported)).not.toContain("legacy-secret");
  });

  it("renders metadata only and confirms removal of a used reference", async () => {
    const catalog = normalizeSecretReferenceCatalog([secret()], { tenantId });
    const wrapper = mount(EnvironmentSecretSelector, {
      props: {
        catalog,
        copy: english.EnvironmentSecrets,
        modelValue: "vault:environment/main",
      },
    });

    expect(wrapper.text()).toContain("Environment credential");
    expect(wrapper.text()).toContain("Idelium Vault");
    expect(wrapper.text()).not.toContain("must-never");
    await wrapper.get(".environment-secret-selector__remove").trigger("click");
    expect(wrapper.get('[role="alertdialog"]').text()).toContain(
      "used by 2 configurations",
    );
    expect(wrapper.emitted("remove")).toBeUndefined();

    await wrapper
      .findAll('[role="alertdialog"] button')
      .find((button) => button.text() === "Remove reference")
      .trigger("click");
    expect(wrapper.emitted("remove")[0]).toEqual(["vault:environment/main"]);
    expect(wrapper.emitted("update:modelValue").at(-1)[0]).toBe("");
  });

  it("exposes complete accessible English and Italian copy", () => {
    for (const language of [english, italian]) {
      expect(language.EnvironmentSecrets.label).toBeTruthy();
      expect(language.EnvironmentSecrets.confirmation.confirm).toBeTruthy();
      for (const status of ["active", "revoked", "expired", "unavailable"]) {
        expect(language.EnvironmentSecrets.status[status]).toBeTruthy();
      }
    }
  });
});
