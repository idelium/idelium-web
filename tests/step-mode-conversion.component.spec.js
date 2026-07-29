import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import ModeConversionDialog from "@/components/step-editor/ModeConversionDialog.vue";
import { STEP_EDITOR_MODES } from "@/domain/stepEditor";
import {
  executeStepModeConversion,
  planStepModeConversion,
} from "@/domain/stepModeConversion";
import english from "@/languages/english";
import italian from "@/languages/italian";

function model(mode = STEP_EDITOR_MODES.WIZARD, capabilities = {}) {
  return {
    actions: [
      {
        config: { stepType: "open_browser", selector: "#main" },
        contract: {
          actionType: "open_browser",
          capabilities: {
            wizard: true,
            json: true,
            dsl: true,
            ...capabilities,
          },
        },
        identity: "action:1",
      },
    ],
    mode,
    persisted: { steps: [{ stepType: "open_browser", selector: "#main" }] },
  };
}

describe("safe step mode conversion", () => {
  it("round-trips supported Wizard and JSON actions without dropping content", () => {
    const original = model();
    const toJson = planStepModeConversion(original, STEP_EDITOR_MODES.JSON);
    const jsonResult = executeStepModeConversion(original, toJson);
    const toWizard = planStepModeConversion(
      jsonResult.converted,
      STEP_EDITOR_MODES.WIZARD,
    );
    const wizardResult = executeStepModeConversion(
      jsonResult.converted,
      toWizard,
    );

    expect(toJson.unsupported).toHaveLength(0);
    expect(wizardResult.converted.actions).toEqual(original.actions);
    expect(wizardResult.converted.mode).toBe(STEP_EDITOR_MODES.WIZARD);
  });

  it("requires acknowledgement for lossy comments and retains exact recovery source", () => {
    const source = 'idelium 1.0\n# keep this explanation\ntest "smoke" {\n}\n';
    const current = model(STEP_EDITOR_MODES.DSL);
    const plan = planStepModeConversion(current, STEP_EDITOR_MODES.JSON, {
      source,
    });

    expect(plan.lossy[0]).toMatchObject({
      code: "stepEditor.conversion.lossy.comment",
      path: "source:2:1",
    });
    expect(
      executeStepModeConversion(current, plan, {
        acknowledged: false,
        source,
      }),
    ).toMatchObject({ converted: null, reason: "acknowledgement" });
    const result = executeStepModeConversion(current, plan, {
      acknowledged: true,
      source,
    });
    expect(result.snapshot).toEqual({
      content: source,
      mode: STEP_EDITOR_MODES.DSL,
    });
    expect(result.converted.recoverySnapshot).toEqual(result.snapshot);
  });

  it("blocks unsupported actions and identifies the exact affected action", () => {
    const current = model(STEP_EDITOR_MODES.WIZARD, { dsl: false });
    const plan = planStepModeConversion(current, STEP_EDITOR_MODES.DSL);

    expect(plan).toMatchObject({
      blocked: true,
      unsupported: [
        expect.objectContaining({
          code: "stepEditor.conversion.unsupported.action",
          path: "actions[0]",
        }),
      ],
    });
    expect(executeStepModeConversion(current, plan)).toMatchObject({
      converted: null,
      reason: "unsupported",
      snapshot: null,
    });
  });

  it("cancels without changing mode or content", async () => {
    const current = model();
    const wrapper = mount(ModeConversionDialog, {
      props: {
        copy: english.StepEditor.conversion,
        model: current,
        targetMode: STEP_EDITOR_MODES.JSON,
      },
    });

    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Cancel")
      .trigger("click");
    expect(wrapper.emitted("cancel")).toHaveLength(1);
    expect(wrapper.emitted("convert")).toBeUndefined();
    expect(current.mode).toBe(STEP_EDITOR_MODES.WIZARD);
    expect(current.actions[0].config.selector).toBe("#main");
  });

  it("makes lossy acknowledgement keyboard accessible before conversion", async () => {
    const source = 'idelium 1.0\n# comment\ntest "smoke" {\n}\n';
    const wrapper = mount(ModeConversionDialog, {
      props: {
        copy: english.StepEditor.conversion,
        model: model(STEP_EDITOR_MODES.DSL),
        source,
        targetMode: STEP_EDITOR_MODES.JSON,
      },
    });
    const convert = wrapper
      .findAll("button")
      .find((button) => button.text() === "Convert mode");
    expect(convert.attributes("disabled")).toBeDefined();
    await wrapper.get('input[type="checkbox"]').setValue(true);
    expect(convert.attributes("disabled")).toBeUndefined();
    await convert.trigger("click");
    expect(wrapper.emitted("convert")[0][0].snapshot.content).toBe(source);
  });

  it("localizes every disposition and construct in English and Italian", () => {
    for (const language of [english, italian]) {
      for (const disposition of [
        "preserved",
        "normalized",
        "lossy",
        "unsupported",
      ]) {
        expect(
          language.StepEditor.conversion.dispositions[disposition],
        ).toBeTruthy();
      }
      expect(
        language.StepEditor.conversion.constructs[
          "stepEditor.conversion.unsupported.action"
        ],
      ).toBeTruthy();
    }
  });
});
