import { describe, expect, it } from "vitest";

import {
  auditSequenceChanges,
  createSequenceState,
  hasBlockingSequenceDiagnostics,
  loadPersistedSequence,
  sequencePersistenceRequest,
  serializeLegacySequence,
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
      "invalid",
      "malformed",
      "duplicate",
      "limit",
      "referenceMissing",
      "referenceStale",
    ];

    for (const key of keys) {
      expect(english.SequenceBuilder.diagnostics[key]).toBeTruthy();
      expect(italian.SequenceBuilder.diagnostics[key]).toBeTruthy();
    }
  });
});
