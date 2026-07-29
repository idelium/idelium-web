import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import IdButton from "@/components/ui/IdButton.vue";
import IdFeedbackState from "@/components/ui/IdFeedbackState.vue";
import IdFormField from "@/components/ui/IdFormField.vue";
import IdTooltip from "@/components/ui/IdTooltip.vue";

describe("Idelium design-system primitives", () => {
  it("prevents duplicate button actions while loading", async () => {
    const wrapper = mount(IdButton, {
      props: {
        loading: true,
        variant: "primary",
      },
      slots: {
        default: "Save",
      },
    });

    expect(wrapper.attributes("aria-busy")).toBe("true");
    expect(wrapper.attributes("disabled")).toBeDefined();
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toBeUndefined();
  });

  it("associates labels, help, and errors with a field", () => {
    const wrapper = mount(IdFormField, {
      props: {
        error: "The code is already in use.",
        helperText: "Use a unique technical code.",
        id: "environment-code",
        label: "Environment code",
        required: true,
      },
      slots: {
        default: ({ inputId, describedBy, invalid }) =>
          h("input", {
            id: inputId,
            "aria-describedby": describedBy,
            "aria-invalid": String(invalid),
          }),
      },
    });

    expect(wrapper.find("label").attributes("for")).toBe("environment-code");
    expect(wrapper.find("input").attributes("aria-describedby")).toBe(
      "environment-code-helper environment-code-error",
    );
    expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
    expect(wrapper.find('[role="alert"]').text()).toContain("already in use");
  });

  it("uses alert semantics for permission and error feedback", () => {
    const wrapper = mount(IdFeedbackState, {
      props: {
        message: "Request access from a customer administrator.",
        title: "Access unavailable",
        type: "permission",
      },
    });

    expect(wrapper.attributes("role")).toBe("alert");
    expect(wrapper.text()).toContain("Access unavailable");
  });

  it("connects tooltip content through a stable description ID", () => {
    const wrapper = mount(IdTooltip, {
      props: {
        text: "Copy credential fingerprint",
      },
      slots: {
        default: ({ describedBy }) =>
          h("button", { "aria-describedby": describedBy }, "Copy"),
      },
    });

    const tooltip = wrapper.find('[role="tooltip"]');
    expect(wrapper.find("button").attributes("aria-describedby")).toBe(
      tooltip.attributes("id"),
    );
  });

  it("exposes the required accessible label for icon-only actions", () => {
    const wrapper = mount(IdButton, {
      props: {
        accessibleLabel: "Delete environment",
        iconOnly: true,
      },
    });

    expect(wrapper.attributes("aria-label")).toBe("Delete environment");
    expect(wrapper.classes()).toContain("id-button--icon");
  });
});
