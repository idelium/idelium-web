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
});
