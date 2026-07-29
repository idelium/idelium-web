import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import EnvironmentConnectionTestPanel from "@/components/environment/EnvironmentConnectionTestPanel.vue";
import {
  CONNECTION_TEST_CODES,
  CONNECTION_TEST_TYPES,
  createConnectionTestRequest,
  normalizeConnectionTestResult,
} from "@/domain/environmentConnectionTest";
import english from "@/languages/english";
import italian from "@/languages/italian";

const request = {
  environmentId: "environment-1",
  tenantId: "customer-1",
  timeoutMs: 120_000,
  type: "api",
};

describe("environment connection tests", () => {
  it("creates only bounded managed-target requests", () => {
    expect(createConnectionTestRequest(request)).toMatchObject({
      environmentId: "environment-1",
      tenantId: "customer-1",
      timeoutMs: 30_000,
      type: "api",
    });
    expect(() =>
      createConnectionTestRequest({
        ...request,
        environmentId: "https://internal.example.invalid/admin",
      }),
    ).toThrow("Invalid environment connection test request.");
    expect(() =>
      createConnectionTestRequest({
        ...request,
        targetId: "../../metadata?token=secret",
      }),
    ).toThrow("Invalid environment connection test request.");
  });

  it("normalizes distinct outcomes and strips target credentials and queries", () => {
    for (const code of CONNECTION_TEST_CODES) {
      const result = normalizeConnectionTestResult({
        code,
        durationMs: 100_000,
        logs: "Authorization: Bearer protected-value",
        responseBody: "protected-value",
        target:
          "https://user:password@example.invalid/path?token=protected-value#secret",
      });
      expect(result.code).toBe(code);
      expect(result.durationMs).toBe(35_000);
      expect(result.target).toBe("https://example.invalid/path");
      expect(JSON.stringify(result)).not.toContain("protected-value");
      expect(JSON.stringify(result)).not.toContain("password");
    }
  });

  it("runs through the server callback and renders actionable metadata", async () => {
    const execute = vi.fn().mockResolvedValue({
      auditEventId: "audit-1",
      code: "tls",
      durationMs: 432,
      target: "https://grid.example.invalid/status?token=protected",
    });
    const wrapper = mount(EnvironmentConnectionTestPanel, {
      props: {
        copy: english.EnvironmentConnectionTest,
        execute,
        request,
      },
    });

    await wrapper.get("button").trigger("click");
    await vi.waitFor(() => expect(execute).toHaveBeenCalledOnce());
    await vi.waitFor(() =>
      expect(wrapper.text()).toContain("Verify the certificate chain"),
    );
    expect(wrapper.text()).toContain("https://grid.example.invalid/status");
    expect(wrapper.text()).not.toContain("protected");
    expect(wrapper.emitted("completed")[0][0].code).toBe("tls");
  });

  it("cancels a running operation and aborts safely on navigation", async () => {
    let signal;
    const execute = vi.fn((_request, options) => {
      signal = options.signal;
      return new Promise(() => {});
    });
    const wrapper = mount(EnvironmentConnectionTestPanel, {
      props: {
        copy: english.EnvironmentConnectionTest,
        execute,
        request,
      },
    });

    await wrapper.get("button").trigger("click");
    await vi.waitFor(() => expect(execute).toHaveBeenCalledOnce());
    expect(signal.aborted).toBe(false);
    await wrapper.get("button").trigger("click");
    expect(signal.aborted).toBe(true);
    expect(wrapper.emitted("completed")[0][0].code).toBe("cancelled");

    const navigationWrapper = mount(EnvironmentConnectionTestPanel, {
      props: {
        copy: english.EnvironmentConnectionTest,
        execute,
        request,
      },
    });
    await navigationWrapper.get("button").trigger("click");
    const navigationSignal = execute.mock.calls.at(-1)[1].signal;
    navigationWrapper.unmount();
    expect(navigationSignal.aborted).toBe(true);
  });

  it("provides complete English and Italian outcome remediation", () => {
    for (const language of [english, italian]) {
      for (const type of CONNECTION_TEST_TYPES) expect(type).toBeTruthy();
      for (const code of CONNECTION_TEST_CODES) {
        expect(language.EnvironmentConnectionTest.outcomes[code]).toBeTruthy();
        expect(
          language.EnvironmentConnectionTest.remediation[code],
        ).toBeTruthy();
      }
    }
  });
});
