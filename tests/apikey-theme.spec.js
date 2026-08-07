import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("API key theme contract", () => {
  it("uses semantic design tokens for every API key tab", () => {
    const source = readFileSync(
      join(process.cwd(), "src/view/apikey.vue"),
      "utf8",
    );

    expect(source).toContain("var(--id-color-surface)");
    expect(source).toContain("var(--id-color-surface-raised)");
    expect(source).toContain("var(--id-color-text)");
    expect(source).toContain("var(--id-color-text-muted)");
    expect(source).toContain("var(--id-color-border)");
    expect(source).toContain("var(--id-shadow-raised)");
    expect(source).not.toContain("rgba(35, 38, 50");
    expect(source).not.toContain("rgba(12, 14, 22");
    expect(source).not.toContain("color: #ffffff");
    expect(source).not.toContain("color: #f8fafc");
  });
});
