const MAX_SEQUENCE_ITEMS = 500;
const SAFE_IDENTIFIER = /^[a-zA-Z0-9_.:-]+$/;
const PROTECTED_METADATA_KEY =
  /(authorization|cookie|credential|password|secret|session|token)/i;

export const SEQUENCE_ITEM_STATUS = Object.freeze({
  ACTIVE: "active",
  ARCHIVED: "archived",
  MISSING: "missing",
  STALE: "stale",
  UNAUTHORIZED: "unauthorized",
});

export const SEQUENCE_DIAGNOSTIC_SEVERITY = Object.freeze({
  ERROR: "error",
  WARNING: "warning",
});

/**
 * @typedef {Object} SequenceItem
 * @property {string} identity Stable entity identity.
 * @property {string|number} entityId Persisted entity identifier.
 * @property {string} entityType Entity contract name.
 * @property {string} name Safe display name.
 * @property {number} position One-based sequence position.
 * @property {string|null} version Immutable referenced version when available.
 * @property {string} status Current reference status.
 * @property {string|null} disabledReason Localized reason key for an ineligible item.
 * @property {Object} metadata Safe display metadata only.
 * @property {Object} persisted Backward-compatible opaque persisted value.
 */

export function createSequenceState(options = {}) {
  const loaded = loadPersistedSequence(options.persisted ?? [], {
    availableItems: options.availableItems,
    duplicatePolicy: options.duplicatePolicy,
    entityType: options.entityType,
    serverVersion: options.serverVersion,
  });

  return {
    persisted: loaded,
    transient: {
      checkedIds: [],
      filters: {},
      focusedId: null,
      search: "",
    },
  };
}

export function loadPersistedSequence(rawSequence, options = {}) {
  const diagnostics = [];
  const duplicatePolicy = options.duplicatePolicy ?? "reject";
  const entityType = safeEntityType(options.entityType ?? "entity");
  const source = parseSequence(rawSequence, diagnostics);
  const bounded = source.slice(0, MAX_SEQUENCE_ITEMS);
  if (source.length > MAX_SEQUENCE_ITEMS) {
    diagnostics.push(
      diagnostic("sequence.limit", SEQUENCE_DIAGNOSTIC_SEVERITY.ERROR, null, {
        maximum: MAX_SEQUENCE_ITEMS,
      }),
    );
  }

  const available = indexAvailableItems(options.availableItems, entityType);
  const identities = new Set();
  const items = bounded.map((entry, index) => {
    const normalized = normalizeSequenceItem(entry, {
      entityType,
      position: index + 1,
    });
    const authoritative = available?.get(normalized.identity);
    const item =
      authoritative == null && available != null
        ? missingSequenceItem(normalized)
        : mergeAvailableItem(normalized, authoritative);

    if (identities.has(item.identity)) {
      diagnostics.push(
        diagnostic(
          "sequence.duplicate",
          duplicatePolicy === "allow"
            ? SEQUENCE_DIAGNOSTIC_SEVERITY.WARNING
            : SEQUENCE_DIAGNOSTIC_SEVERITY.ERROR,
          item.identity,
          { position: item.position },
        ),
      );
    }
    identities.add(item.identity);
    return item;
  });

  return {
    diagnostics,
    duplicatePolicy,
    items,
    serverVersion: normalizeVersion(options.serverVersion),
  };
}

export function normalizeSequenceItem(rawItem, options = {}) {
  if (
    rawItem == null ||
    typeof rawItem !== "object" ||
    Array.isArray(rawItem)
  ) {
    const position = positiveInteger(options.position, 1);
    return {
      identity: `invalid:${position}`,
      entityId: `invalid-${position}`,
      entityType: safeEntityType(options.entityType ?? "entity"),
      name: "Unavailable item",
      position,
      version: null,
      status: SEQUENCE_ITEM_STATUS.MISSING,
      disabledReason: "sequence.invalid",
      metadata: {},
      persisted: {},
    };
  }

  const entityType = safeEntityType(
    rawItem.entityType ?? options.entityType ?? "entity",
  );
  const entityId = normalizeEntityId(rawItem.entityId ?? rawItem.id);
  const position = positiveInteger(options.position ?? rawItem.position, 1);
  const identity = `${entityType}:${entityId}`;

  return {
    identity,
    entityId,
    entityType,
    name: safeDisplayText(rawItem.name, `Item ${entityId}`),
    position,
    version: normalizeVersion(
      rawItem.version ?? rawItem.versionId ?? rawItem.assetVersionId,
    ),
    status: normalizeStatus(rawItem.status),
    disabledReason: safeReason(rawItem.disabledReason),
    metadata: sanitizeDisplayMetadata(rawItem.metadata),
    persisted: structuredCloneSafe(rawItem),
  };
}

export function serializeLegacySequence(sequence) {
  const items = Array.isArray(sequence?.items) ? sequence.items : [];
  return items.map((item) => structuredCloneSafe(item.persisted));
}

export function sequencePersistenceRequest(sequence, options = {}) {
  return {
    sequence: serializeLegacySequence(sequence),
    expectedVersion: normalizeVersion(
      options.expectedVersion ?? sequence?.serverVersion,
    ),
  };
}

export function auditSequenceChanges(previousSequence, nextSequence) {
  const previous = Array.isArray(previousSequence?.items)
    ? previousSequence.items
    : [];
  const next = Array.isArray(nextSequence?.items) ? nextSequence.items : [];
  const previousPositions = new Map(
    previous.map((item, index) => [item.identity, index + 1]),
  );
  const nextPositions = new Map(
    next.map((item, index) => [item.identity, index + 1]),
  );
  const events = [];

  for (const item of previous) {
    if (!nextPositions.has(item.identity)) {
      events.push({
        type: "sequence.item.removed",
        identity: item.identity,
        from: previousPositions.get(item.identity),
      });
    }
  }
  for (const item of next) {
    if (!previousPositions.has(item.identity)) {
      events.push({
        type: "sequence.item.added",
        identity: item.identity,
        to: nextPositions.get(item.identity),
      });
      continue;
    }
    const from = previousPositions.get(item.identity);
    const to = nextPositions.get(item.identity);
    if (from !== to) {
      events.push({
        type: "sequence.item.reordered",
        identity: item.identity,
        from,
        to,
      });
    }
  }
  return events;
}

export function hasBlockingSequenceDiagnostics(sequence) {
  return (sequence?.diagnostics ?? []).some(
    (entry) => entry.severity === SEQUENCE_DIAGNOSTIC_SEVERITY.ERROR,
  );
}

function parseSequence(rawSequence, diagnostics) {
  if (Array.isArray(rawSequence)) return rawSequence;
  if (typeof rawSequence === "string") {
    try {
      const parsed = JSON.parse(rawSequence);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // The caller receives a stable diagnostic below.
    }
  }
  diagnostics.push(
    diagnostic("sequence.malformed", SEQUENCE_DIAGNOSTIC_SEVERITY.ERROR, null),
  );
  return [];
}

function indexAvailableItems(availableItems, entityType) {
  if (availableItems == null) return null;
  const index = new Map();
  for (const entry of Array.isArray(availableItems) ? availableItems : []) {
    const item = normalizeSequenceItem(entry, { entityType });
    index.set(item.identity, item);
  }
  return index;
}

function missingSequenceItem(item) {
  return {
    ...item,
    status: SEQUENCE_ITEM_STATUS.MISSING,
    disabledReason: "sequence.referenceMissing",
  };
}

function mergeAvailableItem(persisted, available) {
  if (available == null) return persisted;
  const stale =
    persisted.version != null &&
    available.version != null &&
    persisted.version !== available.version;
  return {
    ...persisted,
    name: available.name,
    status: stale ? SEQUENCE_ITEM_STATUS.STALE : available.status,
    disabledReason:
      available.disabledReason ??
      (stale ? "sequence.referenceStale" : persisted.disabledReason),
    metadata: available.metadata,
  };
}

function sanitizeDisplayMetadata(metadata) {
  if (
    metadata == null ||
    typeof metadata !== "object" ||
    Array.isArray(metadata)
  ) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !PROTECTED_METADATA_KEY.test(key))
      .slice(0, 20)
      .map(([key, value]) => [
        safeDisplayText(key, "metadata"),
        safeDisplayText(value, ""),
      ]),
  );
}

function diagnostic(code, severity, identity, context = {}) {
  return { code, severity, identity, context };
}

function normalizeEntityId(value) {
  const normalized = String(value ?? "").trim();
  return normalized !== "" && SAFE_IDENTIFIER.test(normalized)
    ? normalized
    : "unknown";
}

function safeEntityType(value) {
  const normalized = String(value ?? "").trim();
  return SAFE_IDENTIFIER.test(normalized) ? normalized : "entity";
}

function normalizeVersion(value) {
  if (value == null || value === "") return null;
  return safeDisplayText(value, null);
}

function normalizeStatus(value) {
  return Object.values(SEQUENCE_ITEM_STATUS).includes(value)
    ? value
    : SEQUENCE_ITEM_STATUS.ACTIVE;
}

function safeReason(value) {
  const normalized = String(value ?? "").trim();
  return normalized === "" ? null : normalized.slice(0, 100);
}

function safeDisplayText(value, fallback) {
  const normalized = String(value ?? "").trim();
  return normalized === "" ? fallback : normalized.slice(0, 200);
}

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
