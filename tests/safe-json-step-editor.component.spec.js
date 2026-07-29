import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import SafeJsonStepEditor from "@/components/step-editor/SafeJsonStepEditor.vue";
import {
  MAX_JSON_SOURCE_BYTES,
  analyzeJsonSource,
  formatJsonSource,
} from "@/domain/safeJsonEditor";
import english from "@/languages/english";
import italian from "@/languages/italian";

const AceStub = {
  name: "VAceEditor",
  inheritAttrs: false,
  props: ["value", "lang", "options"],
  emits: ["update:value"],
  template:
    '<textarea v-bind="$attrs" :value="value" v-on:input="$emit(\'update:value\', $event.target.value)"></textarea>',
};

function mountEditor(modelValue = { actions: [{ name: "open" }] }) {
  return mount(SafeJsonStepEditor, {
    props: {
      copy: english.StepEditor.json,
      modelValue,
      validateModel: (value) =>
        Array.isArray(value.actions)
          ? []
          : [
              {
                code: "stepEditor.json.schema",
                column: 3,
                line: 2,
                path: "$.actions",
              },
            ],
    },
    global: { stubs: { VAceEditor: AceStub } },
  });
}

describe("safe JSON step editing", () => {
  it("reports syntax location and preserves the last valid model", async () => {
    const wrapper = mountEditor();
    const original = wrapper.vm.lastValidModel;

    await wrapper.get("textarea").setValue('{\n "actions": [}');

    expect(wrapper.vm.analysis).toMatchObject({
      valid: false,
      diagnostics: [
        expect.objectContaining({
          code: "stepEditor.json.syntax",
          line: 2,
          path: "$",
        }),
      ],
    });
    expect(wrapper.vm.lastValidModel).toEqual(original);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.text()).toContain("Line 2");
  });

  it("requires explicit apply and never replaces the durable model early", async () => {
    const wrapper = mountEditor();
    const next = { actions: [{ name: "open" }, { name: "click" }] };
    await wrapper.get("textarea").setValue(JSON.stringify(next));

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.text()).toContain("Valid changes are ready to apply.");
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Apply JSON changes")
      .trigger("click");
    expect(wrapper.emitted("update:modelValue")[0][0]).toEqual(next);
    expect(wrapper.emitted("apply")[0][0]).toEqual(next);
  });

  it("formats without reordering semantically ordered arrays", () => {
    const result = formatJsonSource('{"actions":[{"id":3},{"id":1},{"id":2}]}');

    expect(result.valid).toBe(true);
    expect(
      JSON.parse(result.source).actions.map((action) => action.id),
    ).toEqual([3, 1, 2]);
  });

  it("blocks oversized, deeply nested, and inline-secret payloads safely", () => {
    const oversized = `"${"x".repeat(MAX_JSON_SOURCE_BYTES)}"`;
    expect(analyzeJsonSource(oversized).diagnostics[0].code).toBe(
      "stepEditor.json.size",
    );

    let nested = 0;
    for (let index = 0; index < 52; index += 1) nested = { nested };
    expect(analyzeJsonSource(JSON.stringify(nested)).diagnostics[0].code).toBe(
      "stepEditor.json.depth",
    );

    const secret = "protected-value-that-must-not-appear";
    const diagnostics = analyzeJsonSource(
      JSON.stringify({ password: secret }),
    ).diagnostics;
    expect(diagnostics[0]).toMatchObject({
      code: "stepEditor.json.inlineSecret",
      path: "$.password",
    });
    expect(JSON.stringify(diagnostics)).not.toContain(secret);
  });

  it("normalizes schema diagnostics with exact safe paths and locations", () => {
    const result = analyzeJsonSource('{"actions":"invalid"}', {
      validate: () => [
        {
          code: "stepEditor.json.schema",
          column: 12,
          line: 1,
          path: "$.actions",
          remediationKey: "StepEditor.json.remediation.schema",
        },
      ],
    });

    expect(result.diagnostics[0]).toMatchObject({
      column: 12,
      line: 1,
      path: "$.actions",
      severity: "error",
    });
  });

  it("configures bounded JSON highlighting and complete EN/IT copy", () => {
    const wrapper = mountEditor();
    const ace = wrapper.getComponent(AceStub);

    expect(ace.props("lang")).toBe("json");
    expect(ace.props("options")).toMatchObject({
      maxLines: 40,
      minLines: 12,
      showGutter: true,
      showLineNumbers: true,
    });
    expect(wrapper.get("textarea").attributes("aria-label")).toBe(
      "Step JSON source",
    );
    for (const key of [
      "syntax",
      "size",
      "depth",
      "nodes",
      "inlineSecret",
      "schema",
    ]) {
      expect(english.StepEditor.json.validation[key]).toBeTruthy();
      expect(italian.StepEditor.json.validation[key]).toBeTruthy();
    }
  });
});
