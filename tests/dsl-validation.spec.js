import { describe, expect, it } from "vitest";

import {
  buildDslSourcePayload,
  extractDslSource,
  isDslSourcePayload,
  validateDslSource,
} from "@/domain/dslValidation";

describe("DSL validation", () => {
  it("accepts a versioned DSL source with a test block", () => {
    const result = validateDslSource('idelium 1.0\n\ntest "smoke" {\n}\n');

    expect(result.valid).toBe(true);
    expect(result.diagnostics).toEqual([]);
  });

  it("rejects unsupported language versions before saving", () => {
    const result = validateDslSource('idelium 2.0\n\ntest "smoke" {\n}\n');

    expect(result.valid).toBe(false);
    expect(result.diagnostics[0]).toEqual(
      expect.objectContaining({
        line: 1,
        code: "DSL_VERSION_UNSUPPORTED",
      }),
    );
  });

  it("recognizes persisted DSL source payloads", () => {
    const payload = buildDslSourcePayload('idelium 1.0\n\ntest "smoke" {\n}\n');

    expect(isDslSourcePayload(JSON.stringify(payload))).toBe(true);
    expect(extractDslSource(JSON.stringify(payload))).toContain('test "smoke"');
  });
});
