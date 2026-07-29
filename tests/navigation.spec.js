import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import {
  setUnsavedChangesConfirmationHandler,
  useNavigationStore,
} from "@/stores/navigation";

describe("unsaved navigation state", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setUnsavedChangesConfirmationHandler(null);
  });

  it("tracks independent dirty editors", () => {
    const navigation = useNavigationStore();

    navigation.markDirty("environment:7", "Environment");
    navigation.markDirty("step:12", "Reusable step");
    navigation.clearDirty("environment:7");

    expect(navigation.hasUnsavedChanges).toBe(true);
    expect(navigation.unsavedSourceLabels).toEqual(["Reusable step"]);
  });

  it("keeps dirty state when discard is rejected", async () => {
    const navigation = useNavigationStore();
    navigation.markDirty("test:1", "Test");
    setUnsavedChangesConfirmationHandler(vi.fn().mockResolvedValue(false));

    expect(await navigation.confirmDiscard()).toBe(false);
    expect(navigation.hasUnsavedChanges).toBe(true);
  });

  it("allows the caller to clear all sources after confirmation", async () => {
    const navigation = useNavigationStore();
    navigation.markDirty("test:1", "Test");
    setUnsavedChangesConfirmationHandler(vi.fn().mockResolvedValue(true));

    expect(await navigation.confirmDiscard()).toBe(true);
    navigation.clearAll();
    expect(navigation.hasUnsavedChanges).toBe(false);
  });
});
