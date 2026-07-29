import { describe, expect, it } from "vitest";

import { createEnterpriseGridPreferencesController } from "@/composables/useEnterpriseGridPreferences";

const columns = [
  { key: "id", required: true, configurable: false },
  { key: "name", configurable: true, legacyKeys: ["projectName"] },
  { key: "status", configurable: true },
];

const scope = {
  userId: "user-7",
  tenantId: "tenant-4",
  projectId: "project-2",
  gridName: "projects",
};

describe("enterprise grid preferences", () => {
  it("persists only sanitized versioned presentation state", () => {
    const controller = createEnterpriseGridPreferencesController({
      storage: localStorage,
      scope,
      columns,
    });

    const saved = controller.save({
      schemaVersion: 0,
      visibleColumns: ["name", "removed"],
      columnOrder: ["status", "removed", "name"],
      density: "compact",
      rows: [{ id: 1, secret: "must-not-persist" }],
    });

    expect(saved).toEqual({
      schemaVersion: 1,
      visibleColumns: ["name", "id"],
      columnOrder: ["status", "name", "id"],
      density: "compact",
      configurableColumns: ["name", "status"],
    });
    expect(localStorage.getItem(controller.key)).not.toContain("secret");
    expect(controller.load()).toEqual(saved);
  });

  it("removes invalid preferences and safely restores defaults", () => {
    const controller = createEnterpriseGridPreferencesController({
      storage: localStorage,
      scope,
      columns,
    });
    localStorage.setItem(controller.key, "{invalid");

    expect(controller.load()).toMatchObject({
      schemaVersion: 1,
      visibleColumns: ["id", "name", "status"],
      density: "comfortable",
    });
    expect(localStorage.getItem(controller.key)).toBeNull();
  });

  it("migrates renamed column identifiers without exposing removed fields", () => {
    const controller = createEnterpriseGridPreferencesController({
      storage: localStorage,
      scope,
      columns,
    });

    const migrated = controller.save({
      visibleColumns: ["projectName", "unknown"],
      columnOrder: ["projectName", "status"],
    });

    expect(migrated.visibleColumns).toEqual(["name", "id"]);
    expect(migrated.columnOrder).toEqual(["name", "status", "id"]);
  });

  it("resets preferences without affecting another scoped table", () => {
    const controller = createEnterpriseGridPreferencesController({
      storage: localStorage,
      scope,
      columns,
    });
    const other = createEnterpriseGridPreferencesController({
      storage: localStorage,
      scope: { ...scope, userId: "user-8" },
      columns,
    });
    controller.save({ visibleColumns: ["name"] });
    other.save({ visibleColumns: ["status"] });

    controller.reset();

    expect(localStorage.getItem(controller.key)).toBeNull();
    expect(other.load().visibleColumns).toEqual(["status", "id"]);
  });
});
