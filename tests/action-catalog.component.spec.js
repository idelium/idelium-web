import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import ActionCatalog from "@/components/step-editor/ActionCatalog.vue";
import {
  STEP_CATALOG_VERSION,
  createActionCatalog,
  searchActionCatalog,
} from "@/domain/stepCatalog";
import english from "@/languages/english";
import italian from "@/languages/italian";

function catalogFixture() {
  return createActionCatalog({
    pluginActions: [
      {
        pluginId: "quality",
        actions: [
          {
            name: "verify_release",
            tags: ["quality-gate"],
            minimumRuntimeVersion: "3.2",
            experimental: true,
            documentationUrl:
              "https://github.com/idelium/idelium-cli/blob/main/README.md",
            syntax: [],
          },
          {
            name: "legacy_release",
            unsupported: true,
            deprecated: true,
            replacement: "verify_release",
            syntax: [],
          },
        ],
      },
    ],
  });
}

describe("ActionCatalog", () => {
  it("searches localized labels, descriptions, technical names, and tags", () => {
    const catalog = catalogFixture();
    const localizedActions = {
      "quality:verify_release": {
        label: "Verifica rilascio",
        description: "Controlla la qualità prima della distribuzione",
        tags: ["distribuzione"],
      },
    };

    for (const query of [
      "Verifica",
      "qualità",
      "verify_release",
      "distribuzione",
      "quality-gate",
    ]) {
      expect(
        searchActionCatalog(catalog, { localizedActions, query })
          .groups.flatMap((group) => group.results)
          .some((result) => result.action.actionType === "verify_release"),
      ).toBe(true);
    }
  });

  it("groups runtime actions and exposes compatible catalogue metadata", () => {
    const catalog = catalogFixture();
    const groupIds = catalog.groups.map((group) => group.id);
    const action = catalog.actions.find(
      (entry) => entry.actionType === "verify_release",
    );

    expect(groupIds).toEqual(
      expect.arrayContaining([
        "selenium",
        "appium",
        "postman",
        "webservice",
        "plugin",
      ]),
    );
    expect(action).toMatchObject({
      catalogVersion: STEP_CATALOG_VERSION,
      lifecycle: { experimental: true, unsupported: false },
      runtimeConstraint: { minimum: "3.2" },
      tags: ["quality-gate"],
    });
    expect(action.documentation.url).toMatch(
      /^https:\/\/github\.com\/idelium\//,
    );
  });

  it("adds supported actions by keyboard and explains blocked actions", async () => {
    const wrapper = mount(ActionCatalog, {
      props: {
        activeRuntime: "plugin",
        catalog: catalogFixture(),
        copy: english.StepEditor.catalog,
        localizedActions: {
          "quality:verify_release": {
            label: "Verify release",
            description: "Run the release quality gate.",
          },
          "quality:legacy_release": {
            label: "Legacy release",
            description: "Retained for existing saved steps.",
          },
        },
        runtimeVersions: { plugin: "3.2" },
      },
    });
    const supported = wrapper
      .findAll(".action-catalog__action")
      .find((button) => button.text().includes("Verify release"));
    const blocked = wrapper
      .findAll(".action-catalog__action")
      .find((button) => button.text().includes("Legacy release"));

    await supported.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("add")[0][0].actionType).toBe("verify_release");
    expect(blocked.attributes("disabled")).toBeDefined();
    expect(blocked.attributes("aria-describedby")).toContain("remediation");
    expect(wrapper.text()).toContain(
      "This action is not supported. Choose a supported replacement.",
    );
  });

  it("filters without relying on English labels and keeps copy localized", async () => {
    const wrapper = mount(ActionCatalog, {
      props: {
        catalog: catalogFixture(),
        copy: italian.StepEditor.catalog,
        localizedActions: {
          "quality:verify_release": {
            label: "Verifica rilascio",
            description: "Controlla la qualità",
          },
        },
      },
    });

    await wrapper.get('input[type="search"]').setValue("qualità");
    expect(wrapper.text()).toContain("Verifica rilascio");
    expect(wrapper.text()).toContain("1 azioni disponibili");
    expect(wrapper.get('input[type="search"]').attributes("placeholder")).toBe(
      "Cerca per nome, finalità o tag",
    );
  });

  it("bounds external collections and blocks incompatible runtime versions", () => {
    const filtered = searchActionCatalog(catalogFixture(), {
      activeRuntime: "plugin",
      runtimeVersions: { plugin: "3.1" },
      query: "verify_release",
    });
    const result = filtered.groups[0].results[0];

    expect(result.compatibility).toMatchObject({
      addable: false,
      code: "minimum-version",
    });
    expect(searchActionCatalog({ actions: "invalid" }).total).toBe(0);
  });
});
