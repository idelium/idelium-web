import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(relativePath) {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

describe("wizard markup", () => {
  it("does not assign Bootstrap sizes to native environment inputs", () => {
    const source = readSource("src/view/environments/wizard.vue");

    expect(source).not.toMatch(/<input[^>]*size="sm"/);
    expect(source).toContain("form-control-sm");
    expect(source).toContain(":for=\"'environment-param-' + index\"");
    expect(source).toContain(":id=\"'environment-param-' + index\"");
  });

  it("keys draggable step transition-group children", () => {
    const source = readSource("src/view/steps/wizard.vue");

    expect(source).toContain('tag="transition-group"');
    expect(source).toContain('item-key="__key"');
    expect(source).toContain(':key="element.__key"');
    expect(source).toContain("createStepKey()");
  });

  it("uses unique step wizard ids for new and edit forms", () => {
    const stepsViewSource = readSource("src/view/steps.vue");
    const wizardSource = readSource("src/view/steps/wizard.vue");

    expect(stepsViewSource).toContain('id-prefix="step-new"');
    expect(stepsViewSource).toContain('id-prefix="step-edit"');
    expect(wizardSource).toContain(":id=\"fieldId('name')\"");
    expect(wizardSource).toContain(":name=\"fieldId('name')\"");
    expect(wizardSource).toContain("fieldId(name)");
  });

  it("defines the root loading state used during render", () => {
    const source = readSource("src/App.vue");

    expect(source).toContain('v-if="loading"');
    expect(source).toContain("loading: false");
  });

  it("keeps timeline mouse listeners on Konva nodes instead of the layer", () => {
    const source = readSource("src/view/testperformed/timeLine.vue");
    const layerOpenTag = source.match(/<v-layer[\s\S]*?>/)?.[0] ?? "";

    expect(layerOpenTag).not.toContain("@mousedown");
    expect(layerOpenTag).not.toContain("@mouseenter");
    expect(layerOpenTag).not.toContain("@mouseout");
    expect(source).toContain("@mousedown=\"eventShowImage\"");
  });
});
