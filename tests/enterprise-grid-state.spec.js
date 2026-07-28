import { shallowMount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import EnterpriseGridState from "@/components/shared/EnterpriseGridState.vue";

describe("enterprise grid state", () => {
  it("renders an accessible reusable empty state", () => {
    const wrapper = shallowMount(EnterpriseGridState, {
      props: {
        title: "No rows available",
        description: "Create a record or adjust your filters.",
      },
      global: {
        stubs: {
          FontAwesomeIcon: { template: "<i />" },
        },
      },
    });

    expect(wrapper.attributes("role")).toBe("status");
    expect(wrapper.attributes("aria-live")).toBe("polite");
    expect(wrapper.classes()).toContain("enterprise-grid-state--empty");
    expect(wrapper.text()).toContain("No rows available");
    expect(wrapper.text()).toContain("Create a record or adjust your filters.");
  });

  it("uses semantic classes for error states", () => {
    const wrapper = shallowMount(EnterpriseGridState, {
      props: {
        title: "Grid unavailable",
        description: "Retry later.",
        variant: "error",
      },
      global: {
        stubs: {
          FontAwesomeIcon: { template: "<i />" },
        },
      },
    });

    expect(wrapper.classes()).toContain("enterprise-grid-state--error");
  });
});
