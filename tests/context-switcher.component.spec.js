import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ContextSwitcher from "@/components/navigation/ContextSwitcher.vue";

describe("context switcher", () => {
  function mountSwitcher() {
    return mount(ContextSwitcher, {
      props: {
        customerId: 4,
        customers: [{ id: 4, costumer: "Example customer" }],
        labels: {
          activeContext: "Active customer and project",
          customer: "Customer",
          project: "Project",
          switchCustomer: "Switch customer",
        },
        projectId: 7,
        projects: [{ id: 7, name: "Automation" }],
      },
      global: {
        stubs: {
          VSelect: {
            props: ["ariaLabelledby", "modelValue", "options"],
            emits: ["update:modelValue"],
            template:
              '<button type="button" :aria-labelledby="ariaLabelledby" v-on:click="$emit(\'update:modelValue\', options[0].id)">Select</button>',
          },
        },
      },
    });
  }

  it("labels both context selectors and the containing region", () => {
    const wrapper = mountSwitcher();

    expect(wrapper.attributes("aria-label")).toBe(
      "Active customer and project",
    );
    const selectors = wrapper.findAll(".id-context-switcher__field button");
    expect(selectors).toHaveLength(2);
    expect(selectors[0].attributes("aria-labelledby")).toContain(
      "id-context-project",
    );
    expect(selectors[1].attributes("aria-labelledby")).toContain(
      "id-context-customer",
    );
  });

  it("emits explicit project and customer actions", async () => {
    const wrapper = mountSwitcher();
    const selectors = wrapper.findAll(".id-context-switcher__field button");

    await selectors[0].trigger("click");
    await wrapper.find(".id-button").trigger("click");

    expect(wrapper.emitted("update:projectId")?.[0]).toEqual([7]);
    expect(wrapper.emitted("applyCustomer")?.[0]).toEqual([4]);
  });
});
