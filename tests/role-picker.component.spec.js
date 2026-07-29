import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import RolePicker from "@/components/account/RolePicker.vue";

const copy = {
  title: "Role assignment",
  description: "Choose a role after reviewing impact.",
  noRoleSelected: "No role selected",
  matrixTitle: "Permission matrix",
  permission: "Permission",
  permissionAllowed: "Permission allowed",
  permissionDenied: "Permission denied",
  unavailableRole: "Not authorized.",
  groups: {
    administration: "Administration",
    assets: "Assets",
    execution: "Execution",
    governance: "Governance",
  },
  permissions: {
    "account.invite": "Invite accounts",
    "account.role.assign": "Assign roles",
    "account.suspend": "Suspend accounts",
    "artifact.read": "Read artifacts",
    "credential.audit": "Audit credentials",
    "run.execute": "Run executions",
  },
  riskLevels: {
    critical: "Critical risk",
    high: "High risk",
    low: "Low risk",
    medium: "Medium risk",
  },
  reductionWarnings: {
    "critical-reduction": "Critical reduction.",
    "governance-reduction": "Governance reduction.",
  },
};

describe("RolePicker", () => {
  it("uses stable role IDs, disables unavailable roles, and exposes permission details", async () => {
    const wrapper = mount(RolePicker, {
      props: {
        assignableRoleIds: ["2", "3"],
        copy,
        modelValue: "3",
        roles: [
          { id: 1, name: "superadmin" },
          { id: 2, name: "admin" },
          { id: 3, name: "viewer" },
        ],
      },
    });

    const radios = wrapper.findAll('[role="radio"]');
    expect(radios).toHaveLength(3);
    expect(radios[0].attributes("disabled")).toBeDefined();
    expect(radios[0].text()).toContain("Not authorized.");
    expect(radios[2].attributes("aria-checked")).toBe("true");
    expect(wrapper.find('[role="table"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Invite accounts");

    await radios[1].trigger("click");
    expect(wrapper.emitted("update:modelValue")[0]).toEqual(["2"]);
  });

  it("announces privilege reduction warnings for keyboard and screen reader users", () => {
    const wrapper = mount(RolePicker, {
      props: {
        assignableRoleIds: ["2", "3"],
        copy,
        currentRole: { name: "admin" },
        modelValue: "3",
        roles: [
          { id: 2, name: "admin" },
          { id: 3, name: "viewer" },
        ],
      },
    });

    expect(wrapper.find('[role="alert"]').text()).toBe("Governance reduction.");
  });
});
