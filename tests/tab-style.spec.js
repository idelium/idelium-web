import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const customVarsPath = join(process.cwd(), "src/assets/custom-vars.scss");

describe("shared tab styling", () => {
  it("uses a clear active state for all nav tabs", () => {
    const styles = readFileSync(customVarsPath, "utf8");

    expect(styles).toContain(".nav-tabs .nav-link.active");
    expect(styles).toContain("var(--idelium-primary)");
    expect(styles).toContain(".nav-tabs .nav-link:disabled");
    expect(styles).toContain(".idelium-enterprise-tabs");
    expect(styles).toContain(".idelium-enterprise-tab-content");
  });

  it("applies the enterprise tab system to all project scoped tab pages", () => {
    [
      "testcycles.vue",
      "tests.vue",
      "steps.vue",
      "plugins.vue",
      "environments.vue",
      "platforms.vue",
    ].forEach((viewFile) => {
      const source = readFileSync(
        join(process.cwd(), "src/view", viewFile),
        "utf8",
      );

      expect(source).toContain("idelium-enterprise-tabs");
      expect(source).toContain("idelium-enterprise-tab-content");
    });
  });

  it("uses enterprise modal and form styling", () => {
    const styles = readFileSync(customVarsPath, "utf8");

    expect(styles).toContain(".modal.fade .modal-dialog");
    expect(styles).toContain(".modal-backdrop.show");
    expect(styles).toContain(".modal .form-control");
    expect(styles).toContain("backdrop-filter: blur");
    expect(styles).toContain(".modal .btn-secondary");
    expect(styles).toContain("min-width: 6.75rem");
  });

  it("renders native select controls with enterprise styling", () => {
    const styles = readFileSync(customVarsPath, "utf8");

    expect(styles).toContain("select.form-control");
    expect(styles).toContain("appearance: none !important");
    expect(styles).toContain("viewBox='0 0 16 16'");
    expect(styles).toContain("select option");
  });

  it("renders vue-select controls with enterprise styling", () => {
    const styles = readFileSync(customVarsPath, "utf8");

    expect(styles).toContain(".vs__dropdown-toggle");
    expect(styles).toContain(".vs__dropdown-menu");
    expect(styles).toContain("max-height: min(24rem, 52vh)");
    expect(styles).toContain("overflow-y: auto !important");
    expect(styles).toContain(".vs__dropdown-option--highlight");
    expect(styles).toContain("Enterprise v-select");
  });

  it("renders the steps ordering grid with enterprise data-table styling", () => {
    const styles = readFileSync(customVarsPath, "utf8");

    expect(styles).toContain(".idelium-tabler-container .idelium-steps-grid");
    expect(styles).toContain(".idelium-steps-grid__header");
    expect(styles).toContain(".idelium-steps-grid__row:hover");
    expect(styles).toContain(".idelium-steps-grid__link");
  });

  it("keeps the Steps workspace surfaces theme-aware", () => {
    const styles = readFileSync(
      join(process.cwd(), "src/view/steps.vue"),
      "utf8",
    );

    expect(styles).toContain(".idelium-steps-order-grid");
    expect(styles).toContain("var(--id-color-surface)");
    expect(styles).toContain("var(--id-color-surface-raised)");
    expect(styles).toContain("var(--id-color-text-muted)");
    expect(styles).toContain("var(--id-shadow-raised)");
    expect(styles).not.toContain("rgba(30, 34, 46");
    expect(styles).not.toContain("rgba(43, 48, 63");
    expect(styles).not.toContain("var(--idelium-text");
  });

  it("renders the environment creation form with enterprise panel styling", () => {
    const styles = readFileSync(
      join(process.cwd(), "src/view/environments.vue"),
      "utf8",
    );

    expect(styles).toContain(".idelium-environment-form");
    expect(styles).toContain(".idelium-environment-form__grid");
    expect(styles).toContain(".idelium-environment-form__builder");
    expect(styles).toContain("grid-template-columns");
  });

  it("allows the execution results workspace to use wide enterprise screens", () => {
    const styles = readFileSync(customVarsPath, "utf8");

    expect(styles).toContain(
      ".idelium-tabler-container > .testsperformed-page.costum",
    );
    expect(styles).toContain("max-width: min(1760px, calc(100vw - 3rem))");
  });
});
