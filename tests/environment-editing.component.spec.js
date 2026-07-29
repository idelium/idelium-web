import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import EnvironmentEditingStatus from "@/components/environment/EnvironmentEditingStatus.vue";
import {
  applyEnvironmentSaveResult,
  cloneEnvironmentForTenant,
  createEnvironmentArchiveRequest,
  createEnvironmentEditingSession,
  createEnvironmentSaveRequest,
  discardEnvironmentChanges,
  environmentRouteLeaveDecision,
  updateEnvironmentDraft,
} from "@/domain/environmentEditing";
import english from "@/languages/english";
import italian from "@/languages/italian";

function environment() {
  return {
    config: {
      baseUrl: "https://demo.idelium.org",
      nested: {
        customerId: "customer-1",
        password: "protected-password",
        secretRef: "vault:environment/main",
      },
    },
    description: "Demo",
    id: "environment-1",
    lastSavedAt: "2026-07-29T08:00:00Z",
    name: "Demo environment",
    tenantId: "customer-1",
    type: "web",
    version: "version-1",
  };
}

describe("environment editing lifecycle", () => {
  it("clones only non-sensitive configuration into a new authorized identity", () => {
    const cloned = cloneEnvironmentForTenant(environment(), {
      description: "Destination",
      name: "Cloned environment",
      tenantId: "customer-2",
    });
    const serialized = JSON.stringify(cloned);

    expect(cloned.environment).toMatchObject({
      description: "Destination",
      name: "Cloned environment",
      tenantId: "customer-2",
      version: null,
    });
    expect(cloned.environment).not.toHaveProperty("id");
    expect(cloned.environment.config.baseUrl).toBe("https://demo.idelium.org");
    expect(serialized).not.toContain("customer-1");
    expect(serialized).not.toContain("protected-password");
    expect(serialized).not.toContain("vault:environment/main");
    expect(cloned.cloneWarnings).toEqual(
      expect.arrayContaining(["ownershipRemoved", "referenceRevalidation"]),
    );
  });

  it("requires a new clone identity and enforces save tenant ownership", () => {
    expect(() =>
      cloneEnvironmentForTenant(environment(), {
        name: "",
        tenantId: "customer-2",
      }),
    ).toThrow("Clone destination identity is required.");
    const session = createEnvironmentEditingSession(environment());
    expect(() => createEnvironmentSaveRequest(session, "customer-2")).toThrow(
      "Environment save context is invalid.",
    );
  });

  it("preserves local work on conflict or failure and uses optimistic versions", () => {
    const session = updateEnvironmentDraft(
      createEnvironmentEditingSession(environment()),
      { ...environment(), name: "Local update" },
    );
    const request = createEnvironmentSaveRequest(session, "customer-1");
    expect(request.expectedVersion).toBe("version-1");

    const conflict = applyEnvironmentSaveResult(session, {
      code: "conflict",
      remoteVersion: "version-2",
    });
    expect(conflict.current.name).toBe("Local update");
    expect(conflict.durable.name).toBe("Demo environment");
    expect(conflict.dirty).toBe(true);
    expect(conflict.status).toBe("conflict");

    const failed = applyEnvironmentSaveResult(session, { code: "failed" });
    expect(failed.current.name).toBe("Local update");
    expect(failed.dirty).toBe(true);
    expect(failed.status).toBe("failed");
  });

  it("updates the durable snapshot on save and restores it on discard", () => {
    const editing = updateEnvironmentDraft(
      createEnvironmentEditingSession(environment()),
      { ...environment(), name: "Saved update" },
    );
    const saved = applyEnvironmentSaveResult(editing, {
      code: "saved",
      savedAt: "2026-07-29T09:00:00Z",
      version: "version-2",
    });
    expect(saved.dirty).toBe(false);
    expect(saved.durable.name).toBe("Saved update");
    expect(saved.lastSavedAt).toBe("2026-07-29T09:00:00.000Z");

    const changedAgain = updateEnvironmentDraft(saved, {
      ...saved.current,
      name: "Discard this",
    });
    const discarded = discardEnvironmentChanges(changedAgain);
    expect(discarded.current.name).toBe("Saved update");
    expect(discarded.dirty).toBe(false);
  });

  it("guards dirty routes and defines tenant-scoped archive instead of deletion", () => {
    const clean = createEnvironmentEditingSession(environment());
    const dirty = updateEnvironmentDraft(clean, {
      ...environment(),
      name: "Dirty",
    });
    expect(environmentRouteLeaveDecision(clean)).toBe("allow");
    expect(environmentRouteLeaveDecision(dirty)).toBe("confirm");
    expect(
      createEnvironmentArchiveRequest(environment(), "customer-1"),
    ).toMatchObject({
      environmentId: "environment-1",
      expectedVersion: "version-1",
      operation: "archive",
      tenantId: "customer-1",
    });
  });

  it("renders accessible conflict and leave-confirmation workflows in EN/IT", async () => {
    const dirty = applyEnvironmentSaveResult(
      updateEnvironmentDraft(createEnvironmentEditingSession(environment()), {
        ...environment(),
        name: "Local update",
      }),
      { code: "conflict", remoteVersion: "version-2" },
    );
    const wrapper = mount(EnvironmentEditingStatus, {
      props: {
        copy: english.EnvironmentEditing,
        leaveConfirmation: true,
        session: dirty,
      },
    });

    expect(wrapper.get('[role="alert"]').text()).toContain("newer");
    expect(wrapper.get('[role="alertdialog"]').text()).toContain(
      "unsaved changes",
    );
    await wrapper
      .findAll('[role="alertdialog"] button')
      .find((button) => button.text() === "Continue editing")
      .trigger("click");
    expect(wrapper.emitted("stay")).toHaveLength(1);
    for (const language of [english, italian]) {
      expect(language.EnvironmentEditing.conflict.title).toBeTruthy();
      expect(language.EnvironmentEditing.leave.confirm).toBeTruthy();
      expect(
        language.EnvironmentEditing.clone.referencesRequireValidation,
      ).toBeTruthy();
    }
  });
});
