import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import AccountAuditHistory from "@/components/account/AccountAuditHistory.vue";

const copy = {
  action: "Action",
  actions: {
    invite: "Invitation",
    reactivate: "Reactivation",
    "role-change": "Role change",
    suspend: "Suspension",
  },
  actor: "Actor",
  all: "All",
  close: "Close audit",
  correlationId: "Correlation ID",
  description: "Immutable events for {account} ({accountId}).",
  empty: "No audit events.",
  export: "Request export",
  eyebrow: "Governance audit",
  filters: "Audit filters",
  loading: "Loading.",
  next: "Next",
  outcome: "Outcome",
  outcomes: {
    failed: "Failed",
    rejected: "Rejected",
    requested: "Requested",
    success: "Success",
  },
  pageStatus: "Page {page} of {pages}",
  pagination: "Audit event pages",
  previous: "Previous",
  reason: "Reason",
  safeFailure: "Could not load audit.",
  target: "Target",
  timestamp: "Timestamp",
  title: "Account and role audit history",
};

describe("AccountAuditHistory", () => {
  it("renders immutable audit rows with durable identifiers and emits safe controls", async () => {
    const wrapper = mount(AccountAuditHistory, {
      props: {
        account: { email: "admin@example.test", id: "account-1" },
        copy,
        events: [
          {
            action: "role-change",
            actorId: "admin-1",
            correlationId: "corr-1",
            eventId: "event-1",
            outcome: "success",
            reason: "approved",
            targetId: "account-1",
            targetLabel: "Administrator",
            timestamp: "2026-07-29T10:00:00.000Z",
          },
        ],
        filters: { action: "", outcome: "" },
        meta: { page: 1, pageSize: 25, total: 1 },
      },
    });

    expect(wrapper.text()).toContain("admin@example.test");
    expect(wrapper.text()).toContain("account-1");
    expect(wrapper.text()).toContain("corr-1");

    await wrapper.find("select").setValue("role-change");
    expect(wrapper.emitted("filter-change")[0][0]).toEqual({
      action: "role-change",
      outcome: "",
    });

    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Request export")
      .trigger("click");
    expect(wrapper.emitted("export")).toBeTruthy();
  });
});
