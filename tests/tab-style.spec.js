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
});
