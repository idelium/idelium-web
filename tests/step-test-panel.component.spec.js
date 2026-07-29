import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import StepTestPanel from "@/components/step-editor/StepTestPanel.vue";
import {
  createStepTestRequest,
  normalizeStepGovernancePolicy,
  normalizeStepImpact,
  normalizeStepTestResult,
} from "@/domain/stepTestExecution";
import english from "@/languages/english";
import italian from "@/languages/italian";

const environments = [
  {
    id: "env-1",
    name: "Authorized environment",
    authorized: true,
    tenantId: "tenant-1",
    runtimes: ["selenium", "appium", "postman"],
    resolvedSecret: "must-never-be-sent",
  },
  {
    id: "env-other",
    name: "Other tenant",
    authorized: true,
    tenantId: "tenant-2",
    runtimes: ["selenium"],
  },
];
const targets = [
  {
    id: "target-1",
    name: "Compatible target",
    authorized: true,
    tenantId: "tenant-1",
    runtimes: ["selenium", "appium", "postman"],
  },
];

function mountPanel(props = {}) {
  return mount(StepTestPanel, {
    props: {
      copy: english.StepEditor.testing,
      environments,
      executor: vi.fn().mockResolvedValue({
        durationMs: 25,
        logs: ["validation complete"],
        status: "passed",
      }),
      governancePolicy: {
        allowedActions: ["publish-version", "update-draft"],
        defaultAction: "publish-version",
      },
      impact: {
        items: [
          {
            id: "test-1",
            name: "Smoke test",
            tenantId: "tenant-1",
            type: "test",
            pinnedVersion: "v3",
          },
          {
            id: "secret-test",
            name: "Other tenant test",
            tenantId: "tenant-2",
            type: "test",
          },
        ],
        page: 1,
        pageSize: 25,
        total: 1,
      },
      runtime: "selenium",
      stepId: "step-1",
      targets,
      tenantId: "tenant-1",
      ...props,
    },
  });
}

describe("StepTestPanel", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(["selenium", "appium", "postman"])(
    "creates a secret-free authorized %s validation request",
    (runtime) => {
      const prepared = createStepTestRequest(
        {
          environmentId: "env-1",
          runtime,
          stepId: "step-1",
          targetId: "target-1",
          timeoutMs: 30_000,
        },
        { environments, targets, tenantId: "tenant-1" },
      );

      expect(prepared.request).toMatchObject({
        environmentId: "env-1",
        runtime,
        stepId: "step-1",
        targetId: "target-1",
      });
      expect(JSON.stringify(prepared.request)).not.toContain(
        "must-never-be-sent",
      );
    },
  );

  it("rejects unauthorized selection and tenant-scopes paginated impact", () => {
    expect(
      createStepTestRequest(
        {
          environmentId: "env-other",
          runtime: "selenium",
          stepId: "step-1",
          targetId: "target-1",
        },
        { environments, targets, tenantId: "tenant-1" },
      ).request,
    ).toBeNull();

    const impact = normalizeStepImpact(
      {
        items: [
          {
            id: "cycle-1",
            name: "Authorized cycle",
            tenantId: "tenant-1",
            type: "cycle",
            pinnedVersion: "v2",
          },
          {
            id: "cycle-2",
            name: "Hidden cycle",
            tenantId: "tenant-2",
            type: "cycle",
          },
        ],
        page: 2,
        pageSize: 500,
        total: 100,
      },
      { tenantId: "tenant-1" },
    );
    expect(impact).toMatchObject({ page: 2, pageSize: 50, total: 100 });
    expect(impact.items.map((item) => item.id)).toEqual(["cycle-1"]);
  });

  it("redacts and bounds logs and artifacts without returning payloads", () => {
    const result = normalizeStepTestResult({
      artifacts: [
        {
          id: "artifact-1",
          mediaType: "image/png",
          name: "screenshot token=protected",
          payload: "binary-secret",
          size: 999_999_999,
        },
      ],
      logs: ["authorization=protected-value request failed"],
      status: "failed",
    });

    expect(result.logs[0]).toBe("authorization=[REDACTED] request failed");
    expect(result.artifacts[0]).toEqual({
      id: "artifact-1",
      mediaType: "image/png",
      name: "screenshot token=[REDACTED]",
      size: 10_000_000,
    });
    expect(JSON.stringify(result)).not.toContain("binary-secret");
    expect(JSON.stringify(result)).not.toContain("protected-value");
  });

  it("distinguishes success, unavailable target, validation failure, and cancellation", async () => {
    const executor = vi
      .fn()
      .mockResolvedValueOnce({ status: "passed", durationMs: 12 })
      .mockRejectedValueOnce(
        Object.assign(new Error("unavailable"), {
          code: "TARGET_UNAVAILABLE",
        }),
      )
      .mockRejectedValueOnce(new Error("validation failed"));
    const wrapper = mountPanel({ executor });
    await wrapper.findAll("select")[0].setValue("env-1");
    await wrapper.findAll("select")[1].setValue("target-1");

    await wrapper.vm.runTest();
    expect(wrapper.vm.result.status).toBe("passed");
    await wrapper.vm.runTest();
    expect(wrapper.vm.result.status).toBe("unavailable");
    await wrapper.vm.runTest();
    expect(wrapper.vm.result.status).toBe("failed");

    const pending = mountPanel({
      executor: (_, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    });
    await pending.findAll("select")[0].setValue("env-1");
    await pending.findAll("select")[1].setValue("target-1");
    const run = pending.vm.runTest();
    pending.vm.cancelTest();
    await run;
    expect(pending.vm.result.status).toBe("cancelled");
  });

  it("distinguishes timeout and applies governance policy", async () => {
    vi.useFakeTimers();
    const wrapper = mountPanel({
      executor: (_, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    });
    await wrapper.findAll("select")[0].setValue("env-1");
    await wrapper.findAll("select")[1].setValue("target-1");
    wrapper.vm.timeoutMs = 1_000;
    const run = wrapper.vm.runTest();
    await vi.advanceTimersByTimeAsync(1_000);
    await run;

    expect(wrapper.vm.result.status).toBe("timeout");
    expect(
      normalizeStepGovernancePolicy(wrapper.props("governancePolicy")),
    ).toEqual({
      defaultAction: "publish-version",
      publishVersion: true,
      updateDraft: true,
    });
  });

  it("renders only authorized choices, impact, and complete EN/IT copy", () => {
    const wrapper = mountPanel();
    expect(wrapper.text()).toContain("Authorized environment");
    expect(wrapper.text()).not.toContain("Other tenant");
    expect(wrapper.text()).toContain("Smoke test");
    expect(wrapper.text()).not.toContain("Other tenant test");
    expect(wrapper.text()).toContain("Pinned to v3");
    for (const status of [
      "passed",
      "failed",
      "timeout",
      "cancelled",
      "unavailable",
    ]) {
      expect(english.StepEditor.testing.status[status]).toBeTruthy();
      expect(italian.StepEditor.testing.status[status]).toBeTruthy();
    }
  });
});
