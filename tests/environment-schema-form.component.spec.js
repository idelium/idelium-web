import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import EnvironmentSchemaForm from "@/components/environment/EnvironmentSchemaForm.vue";
import {
  applyEnvironmentTypeChange,
  environmentTypeChangePlan,
  validateEnvironmentForm,
} from "@/domain/environmentForm";
import { environmentSchemas } from "@/domain/environmentSchemas";
import english from "@/languages/english";
import italian from "@/languages/italian";

const schemas = environmentSchemas();

function model(overrides = {}) {
  return {
    config: {
      base_url: "https://demo.idelium.org",
      browser: "chrome",
      seleniumHeadless: true,
      ...overrides.config,
    },
    identity: {
      description: "Local browser validation",
      name: "local-web",
      ...overrides.identity,
    },
    type: overrides.type ?? "web",
  };
}

function mountForm(overrides = {}) {
  return mount(EnvironmentSchemaForm, {
    props: {
      copy: english.EnvironmentForm,
      modelValue: model(overrides),
      schemas,
    },
    slots: {
      variables: '<button type="button">Manage variables</button>',
      secrets: '<button type="button">Manage secret references</button>',
    },
  });
}

describe("EnvironmentSchemaForm", () => {
  it("validates exact fields and sections with secret-safe diagnostics", () => {
    const current = model({
      config: {
        base_url: "not-a-url",
        browser: "unsupported",
        password: "protected-value",
      },
      identity: { name: "" },
    });
    const diagnostics = validateEnvironmentForm(current, schemas.web);

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "environmentForm.required",
          path: "identity.name",
          section: "identity",
        }),
        expect.objectContaining({
          code: "environmentForm.url",
          path: "config.base_url",
          section: "connection",
        }),
        expect.objectContaining({
          code: "environmentForm.enum",
          path: "config.browser",
          section: "connection",
        }),
        expect.objectContaining({
          code: "environmentForm.inlineSecret",
          path: "config.password",
          section: "advanced",
        }),
      ]),
    );
    expect(JSON.stringify(diagnostics)).not.toContain("protected-value");
  });

  it("warns before removing incompatible values and applies target defaults", () => {
    const plan = environmentTypeChangePlan(model().config, schemas.mobile);
    expect(plan.requiresConfirmation).toBe(true);
    expect(plan.incompatible.map((entry) => entry.path)).toEqual(
      expect.arrayContaining([
        "config.base_url",
        "config.browser",
        "config.seleniumHeadless",
      ]),
    );
    const changed = applyEnvironmentTypeChange(model().config, schemas.mobile);
    expect(changed.config).not.toHaveProperty("browser");
    expect(changed.config).toMatchObject({
      appiumServer: "http://localhost:4723",
      isRealDevice: false,
    });
  });

  it("cancels type changes without mutation and confirms explicitly", async () => {
    const wrapper = mountForm();
    const type = wrapper.get('select[id$="-type"]');
    await type.setValue("mobile");
    expect(wrapper.vm.draft.type).toBe("web");
    expect(wrapper.text()).toContain("Review incompatible values");

    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Cancel")
      .trigger("click");
    expect(wrapper.vm.draft.type).toBe("web");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();

    await type.setValue("mobile");
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Change type and remove values")
      .trigger("click");
    expect(wrapper.vm.draft.type).toBe("mobile");
    expect(wrapper.vm.draft.config).not.toHaveProperty("browser");
    expect(wrapper.emitted("update:modelValue").at(-1)[0].type).toBe("mobile");
  });

  it("renders persistent labels, capability sections, summaries, and sticky save", () => {
    const wrapper = mountForm({ identity: { name: "" } });

    expect(wrapper.get('label[for$="-name"]').text()).toContain(
      "Environment name",
    );
    expect(wrapper.text()).toContain("Connection and network");
    expect(wrapper.text()).toContain("Browser");
    expect(wrapper.text()).toContain("Variables");
    expect(wrapper.text()).toContain("Secret references");
    expect(wrapper.text()).toContain("1 fields require attention.");
    expect(wrapper.get(".environment-schema-form__save").exists()).toBe(true);
    expect(
      wrapper.get('button[type="submit"]').attributes("disabled"),
    ).toBeDefined();
    expect(wrapper.get("details").attributes("open")).toBeUndefined();
  });

  it("redacts sensitive legacy values from the advanced editor", () => {
    const wrapper = mountForm({
      config: { password: "must-not-render" },
    });
    expect(wrapper.vm.advancedSource).toContain("[REDACTED]");
    expect(wrapper.vm.advancedSource).not.toContain("must-not-render");
  });

  it("saves valid current data and rejects malformed advanced JSON", async () => {
    const wrapper = mountForm();
    await wrapper.get('button[type="submit"]').trigger("submit");
    expect(wrapper.emitted("save")[0][0]).toEqual(model());

    wrapper.vm.advancedSource = "{invalid";
    wrapper.vm.applyAdvanced();
    expect(wrapper.vm.advancedError).toBe("Enter a valid JSON object.");
    expect(wrapper.vm.draft.config).toEqual(model().config);
  });

  it("provides complete English and Italian form localization", () => {
    for (const language of [english, italian]) {
      for (const section of [
        "identity",
        "runtime",
        "variables",
        "secrets",
        "advanced",
      ]) {
        expect(language.EnvironmentForm.sections[section]).toBeTruthy();
      }
      for (const key of [
        "required",
        "url",
        "range",
        "enum",
        "inlineSecret",
        "json",
      ]) {
        expect(language.EnvironmentForm.validation[key]).toBeTruthy();
      }
    }
  });
});
