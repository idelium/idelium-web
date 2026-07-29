import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import SequenceValidationPanel from "@/components/sequence/SequenceValidationPanel.vue";
import english from "@/languages/english";

function mountPanel(overrides = {}) {
  return mount(SequenceValidationPanel, {
    props: {
      acknowledgedCodes: [],
      copy: english.SequenceBuilder.validation,
      diagnosticCopy: english.SequenceBuilder.diagnostics,
      impact: {
        references: { tests: 2, cycles: 1, schedules: 0 },
        total: 3,
      },
      remediationCopy: english.SequenceBuilder.remediation,
      validation: {
        canSave: false,
        diagnostics: [
          {
            code: "sequence.referenceStale",
            severity: "warning",
            identity: "step:1",
            scope: "item",
            remediationKey: "sequence.remediation.reviewVersion",
            requiresAcknowledgement: true,
            source: "server",
          },
        ],
      },
      ...overrides,
    },
  });
}

describe("SequenceValidationPanel", () => {
  it("renders severity, affected identity, remediation, and impact", () => {
    const wrapper = mountPanel();

    expect(wrapper.text()).toContain("Warning");
    expect(wrapper.text()).toContain("step:1");
    expect(wrapper.text()).toContain(
      "Review and select the current authorized version.",
    );
    expect(wrapper.text()).toContain("Downstream impact");
    expect(wrapper.text()).toContain("Tests");
    expect(wrapper.attributes("data-can-save")).toBe("false");
  });

  it("requires acknowledgement only for policy-defined warnings", async () => {
    const wrapper = mountPanel();

    await wrapper.get('input[type="checkbox"]').setValue(true);
    expect(wrapper.emitted("update:acknowledgedCodes")[0][0]).toEqual([
      "sequence.referenceStale",
    ]);

    await wrapper.setProps({
      acknowledgedCodes: ["sequence.referenceStale"],
    });
    expect(wrapper.attributes("data-can-save")).toBe("true");
  });

  it("blocks errors without rendering server-provided messages", () => {
    const wrapper = mountPanel({
      validation: {
        canSave: false,
        diagnostics: [
          {
            code: "sequence.serverRejected",
            severity: "error",
            identity: null,
            scope: "sequence",
            remediationKey: "sequence.remediation.serverRejected",
            source: "server",
          },
        ],
      },
    });

    expect(wrapper.text()).toContain("Save blocked");
    expect(wrapper.text()).toContain(
      "The server rejected this sequence without exposing protected details.",
    );
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false);
  });
});
