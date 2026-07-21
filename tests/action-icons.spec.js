import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(relativePath) {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

describe("enterprise action icons", () => {
  it("defines semantic colors for action icon categories", () => {
    const styles = readSource("src/assets/custom-vars.scss");

    expect(styles).toContain(".idelium-action-icon--copy");
    expect(styles).toContain(".idelium-action-icon--delete");
    expect(styles).toContain(".idelium-action-icon--download");
    expect(styles).toContain(".idelium-action-icon--duplicate");
    expect(styles).toContain(".idelium-action-icon--remove");
  });

  it("keeps CRUD table action icons color-coded and titled", () => {
    const source = [
      "src/view/projects.vue",
      "src/view/plugins.vue",
      "src/view/environments.vue",
      "src/view/steps.vue",
    ]
      .map(readSource)
      .join("\n");

    expect(source).toContain("Actions.delete");
    expect(source).toContain("Actions.download");
    expect(source).toContain("Actions.duplicate");
    expect(source).toContain("idelium-action-icon--delete");
    expect(source).toContain("idelium-action-icon--download");
    expect(source).toContain("idelium-action-icon--duplicate");
  });

  it("uses buttons rather than hash links for removable draggable items", () => {
    const source = readSource("src/view/tests.vue");

    expect(source).toContain("Actions.remove");
    expect(source).toContain("tests-icon-action");
    expect(source).not.toContain('href="#"\n                      v-on:click="deleteItem');
  });
});
