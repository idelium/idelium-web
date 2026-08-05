import { describe, expect, it } from "vitest";

import {
  buildDslSourcePayload,
  dslConstructCatalog,
  extractDslSource,
  isDslSourcePayload,
  localizeDslConstructs,
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

  it("recognizes imported DSL actions nested in step arrays", () => {
    const source = 'idelium 1.0\n\ntest "imported" {\n}\n';
    const payload = JSON.stringify({
      steps: [
        {
          stepType: "dsl",
          runtime: "dsl",
          schemaVersion: "dsl.source.v1",
          languageVersion: "1.0",
          source,
        },
      ],
    });

    expect(isDslSourcePayload(payload)).toBe(true);
    expect(extractDslSource(payload)).toBe(source);
  });

  it("returns lint severities, source locations, and remediation", () => {
    const result = validateDslSource(
      'idelium 1.0\n\ntest "smoke" {\n  open "http://example.invalid"\n  wait css "#ready" visible\n}\n',
    );

    expect(result.schemaVersion).toBe("dsl-lint-result.v1");
    expect(result.valid).toBe(true);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          line: 4,
          code: "DSL_OPEN_HTTP_URL",
          severity: "warning",
          remediation: expect.stringContaining("HTTPS"),
        }),
        expect.objectContaining({
          line: 5,
          code: "DSL_WAIT_TIMEOUT_IMPLICIT",
          severity: "warning",
        }),
      ]),
    );
  });

  it("redacts sensitive literals from diagnostics", () => {
    const result = validateDslSource(
      'idelium 1.0\n\ntest "smoke" {\n  write css "#password" value "password=secret"\n}\n',
    );

    expect(result.valid).toBe(false);
    expect(result.diagnostics[0]).toEqual(
      expect.objectContaining({
        code: "DSL_SECRET_LITERAL",
        severity: "error",
      }),
    );
    expect(JSON.stringify(result)).not.toContain("password=secret");
    expect(JSON.stringify(result)).toContain("[REDACTED]");
  });

  it("exposes a localized DSL v1 construct catalog", () => {
    const constructs = dslConstructCatalog();
    const localized = localizeDslConstructs({
      constructs: {
        variables: {
          title: "Variables",
          description: "Declare values.",
        },
      },
    });

    expect(constructs.map((construct) => construct.id)).toEqual(
      expect.arrayContaining([
        "variables",
        "interpolation",
        "conditions",
        "loops",
        "reuse",
        "assertions",
        "parameters",
      ]),
    );
    expect(localized[0]).toEqual(
      expect.objectContaining({
        title: "Variables",
        description: "Declare values.",
      }),
    );
  });
});
