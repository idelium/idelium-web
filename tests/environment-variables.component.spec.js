import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import EnvironmentVariablesTable from "@/components/environment/EnvironmentVariablesTable.vue";
import {
  ENVIRONMENT_VARIABLE_CONTRACT_VERSION,
  resolveEnvironmentVariables,
  serializeEnvironmentVariables,
} from "@/domain/environmentVariables";
import english from "@/languages/english";
import italian from "@/languages/italian";

const tenantId = "customer-1";

function variable(name, value, overrides = {}) {
  return {
    allowOverride: true,
    name,
    tenantId,
    type: "string",
    value,
    ...overrides,
  };
}

describe("environment variable inheritance", () => {
  it("resolves project, environment, and launch precedence deterministically", () => {
    const resolution = resolveEnvironmentVariables(
      {
        project: [
          variable("BASE_URL", "https://project.example.invalid"),
          variable("NAME", "project"),
        ],
        environment: [variable("NAME", "environment")],
        launch: [variable("NAME", "launch")],
      },
      { tenantId },
    );

    expect(resolution.contractVersion).toBe(
      ENVIRONMENT_VARIABLE_CONTRACT_VERSION,
    );
    expect(resolution.precedence).toEqual(["project", "environment", "launch"]);
    expect(resolution.executionBlocked).toBe(false);
    expect(resolution.rows.find((row) => row.name === "NAME")).toMatchObject({
      displayValue: "launch",
      overriddenSources: ["project", "environment"],
      source: "launch",
      valid: true,
    });
  });

  it("blocks duplicates, forbidden overrides, and cross-customer records", () => {
    const resolution = resolveEnvironmentVariables(
      {
        project: [
          variable("LOCKED", "base", { allowOverride: false }),
          variable("DUPLICATE", "first"),
          variable("DUPLICATE", "second"),
        ],
        environment: [
          variable("LOCKED", "replacement"),
          variable("FOREIGN", "protected", { tenantId: "customer-2" }),
        ],
      },
      { tenantId },
    );

    expect(resolution.executionBlocked).toBe(true);
    expect(resolution.diagnostics.map((entry) => entry.code)).toEqual(
      expect.arrayContaining([
        "environmentVariable.duplicate",
        "environmentVariable.forbiddenOverride",
        "environmentVariable.crossTenant",
      ]),
    );
    expect(
      resolution.rows.find((row) => row.name === "LOCKED").displayValue,
    ).toBe("base");
    expect(JSON.stringify(resolution)).not.toContain("protected");
  });

  it("blocks unresolved references and marks every member of a cycle invalid", () => {
    const resolution = resolveEnvironmentVariables(
      {
        project: [
          variable("FIRST", "${SECOND}"),
          variable("SECOND", "${FIRST}"),
          variable("MISSING", "${UNKNOWN}"),
        ],
      },
      { tenantId },
    );

    expect(resolution.executionBlocked).toBe(true);
    expect(resolution.diagnostics.map((entry) => entry.code)).toEqual(
      expect.arrayContaining([
        "environmentVariable.cycle",
        "environmentVariable.unresolved",
      ]),
    );
    expect(
      resolution.rows
        .filter((row) => ["FIRST", "SECOND", "MISSING"].includes(row.name))
        .every((row) => row.valid === false),
    ).toBe(true);
  });

  it("never exposes or serializes inline secret values", () => {
    const layers = {
      project: [
        variable("TOKEN", "must-not-survive", {
          secretRef: "vault:project/token",
          type: "secret",
        }),
        variable("HEADER", "Bearer ${TOKEN}"),
      ],
    };
    const resolution = resolveEnvironmentVariables(layers, { tenantId });
    const serialized = serializeEnvironmentVariables(layers);

    expect(JSON.stringify(resolution)).not.toContain("must-not-survive");
    expect(JSON.stringify(serialized)).not.toContain("must-not-survive");
    expect(resolution.rows.find((row) => row.name === "TOKEN")).toMatchObject({
      displayValue: "••••••",
      reference: "vault:project/token",
    });
    expect(resolution.rows.find((row) => row.name === "HEADER")).toMatchObject({
      displayValue: "••••••",
    });
  });

  it("renders an accessible localized table without protected values", () => {
    const resolution = resolveEnvironmentVariables(
      {
        project: [
          variable("TOKEN", null, {
            secretRef: "vault:project/token",
            type: "secret",
          }),
        ],
      },
      { tenantId },
    );
    const wrapper = mount(EnvironmentVariablesTable, {
      props: { copy: english.EnvironmentVariables, resolution },
    });

    expect(wrapper.get("caption").text()).toContain(
      "Resolved environment variables",
    );
    expect(wrapper.get('th[scope="row"]').text()).toBe("TOKEN");
    expect(wrapper.text()).toContain(
      "Protected reference: vault:project/token",
    );
    expect(wrapper.text()).not.toContain("null");
  });

  it("provides complete English and Italian variable copy", () => {
    for (const language of [english, italian]) {
      for (const key of [
        "invalid",
        "crossTenant",
        "duplicate",
        "forbiddenOverride",
        "unresolved",
        "cycle",
      ]) {
        expect(language.EnvironmentVariables.validation[key]).toBeTruthy();
      }
      for (const source of ["project", "environment", "launch"]) {
        expect(language.EnvironmentVariables.sources[source]).toBeTruthy();
      }
    }
  });
});
