import { mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import EnvironmentConnectionTestPanel from "@/components/environment/EnvironmentConnectionTestPanel.vue";
import EnvironmentResolvedPreview from "@/components/environment/EnvironmentResolvedPreview.vue";
import EnvironmentSchemaForm from "@/components/environment/EnvironmentSchemaForm.vue";
import {
  createConnectionTestRequest,
  normalizeConnectionTestResult,
} from "@/domain/environmentConnectionTest";
import {
  cloneEnvironmentForTenant,
  createEnvironmentArchiveRequest,
  createEnvironmentEditingSession,
  createEnvironmentSaveRequest,
} from "@/domain/environmentEditing";
import {
  buildResolvedEnvironmentPreview,
  serializeResolvedEnvironmentPreview,
} from "@/domain/environmentPreview";
import {
  environmentSchemas,
  loadEnvironmentConfig,
  serializeEnvironmentConfig,
} from "@/domain/environmentSchemas";
import {
  normalizeSecretReferenceCatalog,
  exportSecretReferences,
} from "@/domain/environmentSecrets";
import { resolveEnvironmentVariables } from "@/domain/environmentVariables";
import english from "@/languages/english";
import currentFixture from "./fixtures/environment-current.json";
import legacyFixture from "./fixtures/environment-legacy.json";

const tenantId = "customer-1";

describe("complete environment workflow security and compatibility", () => {
  it("loads current and legacy fixtures or returns actionable migration errors", () => {
    const current = loadEnvironmentConfig(currentFixture);
    const legacy = loadEnvironmentConfig(legacyFixture, {
      typeHint: "mobile",
    });
    const expired = loadEnvironmentConfig({
      config: { retained: true },
      schemaVersion: "2025.12",
      type: "web",
    });

    expect(current).toMatchObject({
      legacy: false,
      type: "api",
      valid: true,
    });
    expect(serializeEnvironmentConfig(current)).toEqual(currentFixture);
    expect(legacy).toMatchObject({
      legacy: true,
      type: "mobile",
      valid: true,
    });
    expect(serializeEnvironmentConfig(legacy)).toEqual(legacyFixture);
    expect(expired).toMatchObject({
      valid: false,
      diagnostics: [
        expect.objectContaining({
          code: "environment.expiredSchemaVersion",
          remediationKey: "EnvironmentSchema.remediation.expiredSchemaVersion",
        }),
      ],
    });
  });

  it("rejects cross-tenant identifiers at every client contract boundary", () => {
    const environment = {
      config: {},
      id: "environment-1",
      name: "Demo",
      tenantId,
      type: "web",
      version: "version-1",
    };
    const session = createEnvironmentEditingSession(environment);

    expect(() => createEnvironmentSaveRequest(session, "customer-2")).toThrow(
      "Environment save context is invalid.",
    );
    expect(() =>
      createEnvironmentArchiveRequest(environment, "customer-2"),
    ).toThrow("Environment archive context is invalid.");
    expect(
      normalizeSecretReferenceCatalog(
        [
          {
            capabilities: ["selenium"],
            id: "vault:foreign",
            name: "Foreign",
            provider: "Vault",
            scope: "project/foreign",
            status: "active",
            tenantId: "customer-2",
          },
        ],
        { requiredCapability: "selenium", tenantId },
      ).references,
    ).toEqual([]);
    expect(
      resolveEnvironmentVariables(
        {
          project: [
            {
              name: "FOREIGN",
              tenantId: "customer-2",
              type: "string",
              value: "foreign-customer-payload",
            },
          ],
        },
        { tenantId },
      ).rows,
    ).toEqual([]);
  });

  it("never exposes a complete secret on preview, export, clone, or diagnostics", () => {
    const protectedValue = "complete-protected-customer-secret";
    const preview = buildResolvedEnvironmentPreview({
      catalogVersion: "catalog-1",
      fields: [
        {
          path: "config.headers",
          source: "environment",
          value: { authorization: `Bearer ${protectedValue}` },
        },
        {
          path: "config.apiToken",
          secretReference: "vault:environment/api",
          source: "project",
          value: protectedValue,
        },
      ],
      schemaVersion: "2026.07",
    });
    const clone = cloneEnvironmentForTenant(
      {
        config: {
          nested: { password: protectedValue },
          secretRef: "vault:source/secret",
        },
        type: "api",
      },
      { name: "Clone", tenantId },
    );
    const exportedReferences = exportSecretReferences([
      {
        alias: "API_TOKEN",
        referenceId: "vault:environment/api",
        value: protectedValue,
      },
    ]);
    const connection = normalizeConnectionTestResult({
      code: "authentication",
      logs: protectedValue,
      target: `https://user:${protectedValue}@example.invalid/path?token=${protectedValue}`,
    });
    const browserSurface = JSON.stringify({
      clone,
      connection,
      exportedReferences,
      preview,
      serializedPreview: serializeResolvedEnvironmentPreview(preview),
    });

    expect(browserSurface).not.toContain(protectedValue);
    expect(browserSurface).not.toContain("vault:source/secret");
    expect(browserSurface).toContain("vault:environment/api");
  });

  it("blocks malicious probe input and bounds server connection requests", () => {
    expect(() =>
      createConnectionTestRequest({
        environmentId: "https://169.254.169.254/latest/meta-data",
        tenantId,
        type: "api",
      }),
    ).toThrow("Invalid environment connection test request.");
    expect(
      createConnectionTestRequest({
        environmentId: "environment-1",
        tenantId,
        timeoutMs: Number.MAX_SAFE_INTEGER,
        type: "webdriver",
      }).timeoutMs,
    ).toBe(30_000);
  });

  it("keeps conditional templates, labels, focus order, and responsive containment", () => {
    const schemas = environmentSchemas();
    const modelValue = {
      config: {
        base_url: "https://demo.idelium.org",
        browser: "chrome",
      },
      identity: { description: "", name: "demo" },
      type: "web",
    };
    const wrapper = mount(EnvironmentSchemaForm, {
      props: {
        copy: english.EnvironmentForm,
        modelValue,
        schemas,
      },
    });
    const controls = wrapper.findAll("input, select, textarea, button");

    expect(wrapper.text()).toContain("Browser");
    expect(wrapper.text()).not.toContain("Device");
    expect(wrapper.get('label[for$="-name"]').exists()).toBe(true);
    expect(controls[0].attributes("id")).toMatch(/-name$/);
    expect(controls.at(-1).attributes("type")).toBe("submit");

    const responsiveSources = [
      "src/components/environment/EnvironmentSchemaForm.vue",
      "src/components/environment/EnvironmentResolvedPreview.vue",
      "src/components/environment/EnvironmentConnectionTestPanel.vue",
    ].map((path) => readFileSync(path, "utf8"));
    expect(
      responsiveSources.every((source) => source.includes("min-width: 0")),
    ).toBe(true);
    expect(responsiveSources.join("\n")).toMatch(
      /overflow-x: auto|grid-template-columns: repeat\(auto-fit/,
    );
  });

  it("gives async validation progress an accessible name and safe cancellation", async () => {
    const execute = () => new Promise(() => {});
    const wrapper = mount(EnvironmentConnectionTestPanel, {
      props: {
        copy: english.EnvironmentConnectionTest,
        execute,
        request: {
          environmentId: "environment-1",
          tenantId,
          type: "api",
        },
      },
    });
    await wrapper.get("button").trigger("click");
    expect(wrapper.get('[role="status"]').text()).toContain("running");
    expect(wrapper.get("button").text()).toBe("Cancel test");
    wrapper.unmount();

    const previewWrapper = mount(EnvironmentResolvedPreview, {
      props: {
        copy: english.EnvironmentPreview,
        preview: buildResolvedEnvironmentPreview({
          catalogVersion: "catalog-1",
          fields: [],
          schemaVersion: "2026.07",
        }),
      },
    });
    expect(previewWrapper.get("caption").text()).toContain(
      "Resolved environment",
    );
    expect(
      previewWrapper
        .findAll("button")
        .every((button) => button.text().trim().length > 0),
    ).toBe(true);
  });
});
