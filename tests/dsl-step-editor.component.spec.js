import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import DslStepEditor from "@/components/step-editor/DslStepEditor.vue";
import {
  MAX_DSL_SOURCE_BYTES,
  createDslCompletions,
  validateDslCatalogCompatibility,
  validateDslSource,
} from "@/domain/dslValidation";
import { createActionCatalog } from "@/domain/stepCatalog";
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

const validSource = 'idelium 1.0\n\ntest "smoke" {\n}\n';

function mountEditor(props = {}) {
  return mount(DslStepEditor, {
    props: {
      catalog: createActionCatalog(),
      copy: english.StepEditor.dsl,
      modelValue: validSource,
      ...props,
    },
    global: { stubs: { VAceEditor: AceStub } },
  });
}

describe("DSL step editing", () => {
  it("keeps stable parser codes while presenting localized diagnostics", async () => {
    const wrapper = mountEditor();
    await wrapper
      .get("textarea")
      .setValue('idelium 2.0\n\ntest "legacy" {\n}\n');

    expect(wrapper.vm.diagnostics[0].code).toBe("DSL_VERSION_UNSUPPORTED");
    expect(wrapper.text()).toContain(
      "The DSL language version is unsupported.",
    );
    expect(wrapper.text()).toContain("DSL_VERSION_UNSUPPORTED");
    expect(
      wrapper
        .get(".dsl-step-editor__validation-status")
        .classes()
        .includes("dsl-step-editor__validation-status--error"),
    ).toBe(true);
    expect(wrapper.text()).toContain("1 DSL error(s)");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("shows live validation state while source changes", async () => {
    const wrapper = mountEditor();

    expect(wrapper.text()).toContain("DSL syntax valid");
    expect(wrapper.text()).toContain(
      "The document is being validated as you type.",
    );

    await wrapper.get("textarea").setValue('idelium 1.0\n\ntest "smoke" {\n');

    expect(
      wrapper
        .get(".dsl-step-editor__validation-status")
        .classes()
        .includes("dsl-step-editor__validation-status--error"),
    ).toBe(true);
    expect(wrapper.text()).toContain("1 DSL error(s)");
  });

  it("preserves source formatting and requires explicit apply", async () => {
    const source = 'idelium 1.0\n\ntest "ordered" {\n  # keep spacing\n}\n';
    const wrapper = mountEditor();
    await wrapper.get("textarea").setValue(source);

    expect(wrapper.vm.source).toBe(source);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Apply DSL changes")
      .trigger("click");
    expect(wrapper.emitted("update:modelValue")[0][0]).toBe(source);
  });

  it("supports live source updates for modal editing", async () => {
    const source = 'idelium 1.0\n\ntest "modal" {\n}\n';
    const wrapper = mountEditor({
      editorMaxLines: 56,
      editorMinLines: 22,
      liveUpdate: true,
      showCompletions: false,
    });

    await wrapper.get("textarea").setValue(source);

    expect(wrapper.emitted("update:modelValue")[0][0]).toBe(source);
    expect(wrapper.find(".dsl-step-editor__completions").exists()).toBe(false);
    expect(wrapper.find("button").exists()).toBe(false);
    expect(wrapper.getComponent(AceStub).props("options")).toMatchObject({
      maxLines: 56,
      minLines: 22,
      showLineNumbers: true,
    });
  });

  it("bounds completion to authorized catalog actions without environment data", () => {
    const catalog = createActionCatalog();
    const authorized = catalog.actions.find(
      (action) => action.actionType === "open_browser",
    );
    const completions = createDslCompletions(catalog, {
      authorizedActionIds: [authorized.id],
      environment: {
        password: "must-not-be-used",
        token: "must-not-be-used",
      },
    });

    expect(completions).toEqual([
      expect.objectContaining({
        actionType: "open_browser",
        id: authorized.id,
        insertText: "action open_browser",
      }),
    ]);
    expect(JSON.stringify(completions)).not.toContain("must-not-be-used");
  });

  it("reports unsupported and runtime-incompatible catalog actions before save", () => {
    const catalog = createActionCatalog();
    const source =
      'idelium 1.0\n\ntest "runtime" {\n  action appium_mobile_command\n  action unknown_action\n}\n';
    const diagnostics = validateDslCatalogCompatibility(source, catalog, {
      activeRuntime: "selenium",
    });

    expect(diagnostics.map((entry) => entry.code)).toEqual([
      "DSL_ACTION_RUNTIME_INCOMPATIBLE",
      "DSL_ACTION_UNSUPPORTED",
    ]);
    expect(diagnostics.map((entry) => entry.line)).toEqual([4, 5]);
  });

  it("fails safely for oversized and legacy input while retaining source", () => {
    const oversized = `idelium 1.0\n${"x".repeat(MAX_DSL_SOURCE_BYTES)}`;
    expect(validateDslSource(oversized).diagnostics[0].code).toBe(
      "DSL_SOURCE_TOO_LARGE",
    );
    const legacy = 'idelium 0.9\n\ntest "legacy" {\n}\n';
    const result = validateDslSource(legacy);
    expect(result.valid).toBe(false);
    expect(result.diagnostics[0].code).toBe("DSL_VERSION_UNSUPPORTED");
    expect(legacy).toContain('test "legacy"');
  });

  it("rejects unknown text typed outside supported DSL statements", async () => {
    const wrapper = mountEditor();
    await wrapper
      .get("textarea")
      .setValue(`${validSource}random words that are not DSL\n`);

    expect(wrapper.vm.diagnostics[0].code).toBe("DSL_STATEMENT_UNKNOWN");
    expect(wrapper.text()).toContain("The DSL statement is not recognized.");
    expect(wrapper.text()).toContain("1 DSL error(s)");
  });

  it("accepts CSS selectors containing single quotes inside double-quoted locators", () => {
    const source =
      'idelium 1.0\n\ntest "selectors" {\n' +
      "    click css \"[data-testid='network-success']\"\n" +
      "    wait css \"[data-testid='network-result']\" visible timeout 10s\n" +
      "    assert visible css \"[data-testid='network-result']\"\n" +
      "}\n";

    expect(
      validateDslSource(source).diagnostics.filter(
        (diagnostic) => diagnostic.code === "DSL_STATEMENT_UNKNOWN",
      ),
    ).toEqual([]);
  });

  it("uses line-numbered bounded editing and complete English/Italian copy", () => {
    const wrapper = mountEditor();
    const ace = wrapper.getComponent(AceStub);
    expect(ace.props("options")).toMatchObject({
      maxLines: 40,
      minLines: 12,
      showLineNumbers: true,
    });
    expect(wrapper.get("textarea").attributes("aria-label")).toBe(
      "Idelium DSL source",
    );
    for (const code of [
      "DSL_VERSION_UNSUPPORTED",
      "DSL_SOURCE_TOO_LARGE",
      "DSL_STATEMENT_UNKNOWN",
      "DSL_ACTION_UNSUPPORTED",
      "DSL_ACTION_RUNTIME_INCOMPATIBLE",
    ]) {
      expect(english.StepEditor.dsl.validation[code]).toBeTruthy();
      expect(italian.StepEditor.dsl.validation[code]).toBeTruthy();
    }
  });
});
