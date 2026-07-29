import { describe, expect, it } from "vitest";

import {
  auditSequenceChanges,
  createSequenceState,
  hasBlockingSequenceDiagnostics,
  loadPersistedSequence,
  sequencePersistenceRequest,
  sequenceSaveState,
  serializeLegacySequence,
  summarizeSequenceImpact,
  validateSequenceComposition,
} from "@/domain/sequenceBuilder";
import english from "@/languages/english";
import italian from "@/languages/italian";

describe("sequence builder domain contract", () => {
  const legacySteps = [
    { id: 9, name: "Open browser", config: { runtime: "selenium" } },
    { id: 3, name: "Click login", config: { runtime: "selenium" } },
  ];

  it("loads and serializes legacy sequences without silent reordering", () => {
    const sequence = loadPersistedSequence(JSON.stringify(legacySteps), {
      entityType: "step",
      serverVersion: "v7",
    });

    expect(sequence.items.map((item) => item.entityId)).toEqual(["9", "3"]);
    expect(sequence.items.map((item) => item.position)).toEqual([1, 2]);
    expect(serializeLegacySequence(sequence)).toEqual(legacySteps);
    expect(sequencePersistenceRequest(sequence)).toEqual({
      sequence: legacySteps,
      expectedVersion: "v7",
    });
  });

  it("separates persisted composition from transient picker state", () => {
    const state = createSequenceState({
      persisted: legacySteps,
      entityType: "step",
    });

    state.transient.search = "login";
    state.transient.checkedIds.push("step:3");

    expect(serializeLegacySequence(state.persisted)).toEqual(legacySteps);
    expect(state.transient).toMatchObject({
      checkedIds: ["step:3"],
      search: "login",
    });
  });

  it("reports duplicate, missing, stale, and malformed references safely", () => {
    const sequence = loadPersistedSequence(
      [
        { id: 1, name: "First", version: "v1" },
        { id: 1, name: "First duplicate", version: "v1" },
        { id: 2, name: "Missing" },
      ],
      {
        entityType: "test",
        availableItems: [
          { id: 1, name: "First", version: "v2", status: "active" },
        ],
      },
    );

    expect(sequence.items[0]).toMatchObject({
      identity: "test:1",
      status: "stale",
      disabledReason: "sequence.referenceStale",
    });
    expect(sequence.items[2]).toMatchObject({
      identity: "test:2",
      status: "missing",
      disabledReason: "sequence.referenceMissing",
    });
    expect(sequence.diagnostics.map((entry) => entry.code)).toContain(
      "sequence.duplicate",
    );
    expect(hasBlockingSequenceDiagnostics(sequence)).toBe(true);

    const malformed = loadPersistedSequence("{not-json}", {
      entityType: "test",
    });
    expect(malformed.items).toEqual([]);
    expect(malformed.diagnostics[0]).toMatchObject({
      code: "sequence.malformed",
      severity: "error",
    });
  });

  it("keeps protected metadata out of the display contract", () => {
    const sequence = loadPersistedSequence(
      [
        {
          id: 1,
          name: "Safe item",
          metadata: {
            runtime: "selenium",
            owner: "QA",
            accessToken: "must-not-render",
          },
        },
      ],
      { entityType: "step" },
    );

    expect(sequence.items[0].metadata).toEqual({
      runtime: "selenium",
      owner: "QA",
    });
  });

  it("creates deterministic audit events without entity payloads", () => {
    const before = loadPersistedSequence(legacySteps, { entityType: "step" });
    const after = loadPersistedSequence(
      [legacySteps[1], { id: 4, name: "Submit" }, legacySteps[0]],
      { entityType: "step" },
    );

    expect(auditSequenceChanges(before, after)).toEqual([
      {
        type: "sequence.item.reordered",
        identity: "step:3",
        from: 2,
        to: 1,
      },
      {
        type: "sequence.item.added",
        identity: "step:4",
        to: 2,
      },
      {
        type: "sequence.item.reordered",
        identity: "step:9",
        from: 1,
        to: 3,
      },
    ]);
  });

  it("provides English and Italian copy for every domain diagnostic", () => {
    const keys = [
      "archivedDependency",
      "conflict",
      "invalid",
      "incompatibleRuntime",
      "malformed",
      "duplicate",
      "limit",
      "missingVersion",
      "referenceMissing",
      "referenceStale",
      "required",
      "saveFailed",
      "serverRejected",
      "validationFailed",
    ];

    for (const key of keys) {
      expect(english.SequenceBuilder.diagnostics[key]).toBeTruthy();
      expect(italian.SequenceBuilder.diagnostics[key]).toBeTruthy();
    }
  });

  it("validates composition policy and merges server diagnostics safely", () => {
    const sequence = loadPersistedSequence(
      [
        {
          id: 1,
          name: "Selenium item",
          status: "active",
          metadata: { runtime: "selenium" },
        },
        {
          id: 2,
          name: "Archived Appium item",
          status: "archived",
          metadata: { runtime: "appium" },
        },
      ],
      { entityType: "step" },
    );
    const validation = validateSequenceComposition(
      sequence,
      {
        allowMixedRuntimes: false,
        requireVersions: true,
        warningAcknowledgementCodes: ["sequence.referenceStale"],
      },
      [
        {
          code: "sequence.referenceStale",
          severity: "warning",
          identity: "step:1",
          message: "Authorization: Bearer must-not-render",
          context: { customerName: "Other tenant" },
        },
        {
          code: "internal.secret",
          severity: "error",
          identity: "step:999",
          message: "password=must-not-render",
        },
      ],
    );

    expect(validation.canSave).toBe(false);
    expect(validation.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "sequence.archivedDependency",
          identity: "step:2",
          scope: "item",
        }),
        expect.objectContaining({
          code: "sequence.incompatibleRuntime",
          identity: "step:2",
        }),
        expect.objectContaining({
          code: "sequence.serverRejected",
          identity: null,
          context: {},
          source: "server",
        }),
      ]),
    );
    expect(JSON.stringify(validation)).not.toContain("must-not-render");
    expect(JSON.stringify(validation)).not.toContain("Other tenant");
  });

  it("blocks only errors and policy-acknowledged warnings", () => {
    const warning = {
      code: "sequence.referenceStale",
      severity: "warning",
      requiresAcknowledgement: true,
    };

    expect(
      sequenceSaveState({ diagnostics: [warning], canSave: true }, []),
    ).toMatchObject({
      canSave: false,
      hasErrors: false,
      hasUnacknowledgedWarnings: true,
    });
    expect(
      sequenceSaveState({ diagnostics: [warning], canSave: true }, [
        "sequence.referenceStale",
      ]),
    ).toMatchObject({
      canSave: true,
      hasErrors: false,
      hasUnacknowledgedWarnings: false,
    });
  });

  it("returns a bounded impact summary without entity metadata", () => {
    expect(
      summarizeSequenceImpact({
        tests: 3,
        cycles: 2,
        schedules: 1,
        names: ["Cross-tenant test"],
      }),
    ).toEqual({
      references: { tests: 3, cycles: 2, schedules: 1 },
      total: 6,
    });
  });
});
