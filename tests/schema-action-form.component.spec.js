import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import SchemaActionForm from "@/components/step-editor/SchemaActionForm.vue";
import {
  createSchemaFormModel,
  serializeSchemaForm,
  validateSchemaForm,
  visibleSchemaFields,
} from "@/domain/schemaActionForm";
import english from "@/languages/english";
import italian from "@/languages/italian";

const action = {
  actionType: "request",
  schema: {
    type: "object",
    required: ["method", "timeout", "secretRef"],
    properties: {
      method: {
        type: "string",
        enum: ["GET", "POST"],
        default: "GET",
      },
      timeout: { type: "integer", minimum: 1, maximum: 60 },
      secretRef: { type: "string", format: "secret-reference" },
      selector: { type: "object", format: "locator" },
      headers: { type: "array", items: { type: "string" } },
      payload: {
        type: "object",
        format: "json",
        "x-visible-when": { field: "method", equals: "POST" },
      },
    },
  },
  fields: [],
};

describe("schema-driven action forms", () => {
  it("maps one schema to shared controls without action-specific templates", () => {
    const model = createSchemaFormModel(action, {}, 3);

    expect(
      Object.fromEntries(
        model.fields.map((field) => [field.name, field.control]),
      ),
    ).toEqual({
      method: "select",
      timeout: "number",
      secretRef: "secret-reference",
      selector: "locator",
      headers: "list",
      payload: "json",
    });
    expect(model.values.method).toBe("GET");
    expect(visibleSchemaFields(model).map((field) => field.name)).not.toContain(
      "payload",
    );
  });

  it("preserves valid conditional and unknown legacy fields on round trip", () => {
    const source = {
      method: "POST",
      timeout: 10,
      secretRef: "vault.api",
      payload: { safe: true },
      legacyExtension: { retained: true },
    };
    const model = createSchemaFormModel(action, source, 1);

    model.values.method = "GET";
    expect(visibleSchemaFields(model).map((field) => field.name)).not.toContain(
      "payload",
    );
    model.values.method = "POST";
    expect(model.values.payload).toEqual({ safe: true });
    expect(serializeSchemaForm(model)).toEqual(source);
  });

  it("returns exact, localized-safe diagnostics without secret values", () => {
    const secretValue = "do not expose this value";
    const model = createSchemaFormModel(
      action,
      { method: "POST", timeout: 100, secretRef: secretValue, payload: "{" },
      4,
    );
    const diagnostics = validateSchemaForm(model);

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "stepEditor.form.maximum",
          path: "actions[4].properties.timeout",
        }),
        expect.objectContaining({
          code: "stepEditor.form.secretReference",
          path: "actions[4].properties.secretRef",
        }),
        expect.objectContaining({
          code: "stepEditor.form.json",
          path: "actions[4].properties.payload",
        }),
      ]),
    );
    expect(JSON.stringify(diagnostics)).not.toContain(secretValue);
  });

  it("renders accessible fields, blocks invalid input, and emits current values", async () => {
    const wrapper = mount(SchemaActionForm, {
      props: {
        action,
        actionIndex: 2,
        copy: english.StepEditor.form,
        fieldCopy: {
          method: { label: "HTTP method", help: "Choose the request method." },
          timeout: { label: "Timeout" },
          secretRef: { label: "Secret reference" },
          selector: { label: "Selector" },
          headers: { label: "Headers" },
          payload: { label: "Payload" },
        },
        modelValue: {
          method: "GET",
          timeout: 0,
          secretRef: "",
        },
      },
    });

    expect(wrapper.get("label").text()).toContain("HTTP method");
    expect(wrapper.get("#schema-action-form-1-method-helper").text()).toBe(
      "Choose the request method.",
    );
    expect(wrapper.text()).toContain("2 fields require attention.");
    await wrapper.get("#schema-action-form-1-method").setValue("POST");
    expect(wrapper.find("textarea").exists()).toBe(true);
    expect(wrapper.emitted("update:modelValue").at(-1)[0]).toMatchObject({
      method: "POST",
      timeout: 0,
    });
  });

  it("provides complete English and Italian validation copy", () => {
    for (const key of [
      "required",
      "number",
      "minimum",
      "maximum",
      "enum",
      "json",
      "list",
      "minLength",
      "maxLength",
      "pattern",
      "secretReference",
    ]) {
      expect(english.StepEditor.form.validation[key]).toBeTruthy();
      expect(italian.StepEditor.form.validation[key]).toBeTruthy();
    }
  });
});
