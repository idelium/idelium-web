import { computed, onBeforeUnmount, ref } from "vue";

import { useNavigationStore } from "@/stores/navigation";

const DEFAULT_HISTORY_LIMIT = 50;

export function useSequenceEditor(options) {
  const navigation = options.navigation ?? useNavigationStore();
  const historyLimit = boundedHistoryLimit(options.historyLimit);
  const baseline = ref(clone(options.initialSequence ?? []));
  const sequence = ref(clone(options.initialSequence ?? []));
  const past = ref([]);
  const future = ref([]);
  const diagnostics = ref([]);
  const conflict = ref(null);
  const lastSavedAt = ref(options.lastSavedAt ?? null);
  const serverVersion = ref(options.serverVersion ?? null);
  const saving = ref(false);
  let activeSave = null;
  let idempotencyKey = createIdempotencyKey();

  const dirty = computed(
    () => fingerprint(sequence.value) !== fingerprint(baseline.value),
  );
  const canUndo = computed(() => past.value.length > 0);
  const canRedo = computed(() => future.value.length > 0);

  function syncDirtyRegistration() {
    if (dirty.value) navigation.markDirty(options.sourceId, options.label);
    else navigation.clearDirty(options.sourceId);
  }

  function apply(nextSequence) {
    const next = clone(nextSequence ?? []);
    if (fingerprint(next) === fingerprint(sequence.value)) return false;
    past.value = [...past.value, clone(sequence.value)].slice(-historyLimit);
    sequence.value = next;
    future.value = [];
    conflict.value = null;
    diagnostics.value = [];
    idempotencyKey = createIdempotencyKey();
    syncDirtyRegistration();
    return true;
  }

  function undo() {
    if (!canUndo.value) return false;
    const previous = past.value.at(-1);
    past.value = past.value.slice(0, -1);
    future.value = [clone(sequence.value), ...future.value].slice(
      0,
      historyLimit,
    );
    sequence.value = clone(previous);
    idempotencyKey = createIdempotencyKey();
    syncDirtyRegistration();
    return true;
  }

  function redo() {
    if (!canRedo.value) return false;
    const [next, ...remaining] = future.value;
    past.value = [...past.value, clone(sequence.value)].slice(-historyLimit);
    future.value = remaining;
    sequence.value = clone(next);
    idempotencyKey = createIdempotencyKey();
    syncDirtyRegistration();
    return true;
  }

  function discard() {
    sequence.value = clone(baseline.value);
    clearHistory();
    diagnostics.value = [];
    conflict.value = null;
    idempotencyKey = createIdempotencyKey();
    syncDirtyRegistration();
  }

  function reset(nextSequence, nextServerVersion = null, savedAt = null) {
    baseline.value = clone(nextSequence ?? []);
    sequence.value = clone(nextSequence ?? []);
    serverVersion.value = nextServerVersion;
    lastSavedAt.value = savedAt;
    diagnostics.value = [];
    conflict.value = null;
    clearHistory();
    idempotencyKey = createIdempotencyKey();
    syncDirtyRegistration();
  }

  function reloadConflict(remoteSequence, nextServerVersion) {
    reset(remoteSequence, nextServerVersion, null);
  }

  function compareConflict() {
    if (conflict.value == null) return null;
    return {
      baseline: clone(baseline.value),
      local: clone(sequence.value),
      remote: clone(conflict.value.remoteSequence ?? []),
      serverVersion: conflict.value.serverVersion,
    };
  }

  async function save() {
    if (activeSave != null) return activeSave;
    if (typeof options.save !== "function") {
      throw new TypeError("A sequence save function is required.");
    }
    const snapshot = clone(sequence.value);
    const requestKey = idempotencyKey;
    saving.value = true;
    activeSave = Promise.resolve(
      options.save({
        sequence: snapshot,
        expectedVersion: serverVersion.value,
        idempotencyKey: requestKey,
      }),
    )
      .then((result = {}) => {
        baseline.value = clone(snapshot);
        sequence.value = clone(snapshot);
        serverVersion.value = result.serverVersion ?? serverVersion.value;
        lastSavedAt.value = result.savedAt ?? new Date().toISOString();
        diagnostics.value = [];
        conflict.value = null;
        clearHistory();
        idempotencyKey = createIdempotencyKey();
        syncDirtyRegistration();
        return result;
      })
      .catch((error) => {
        const failure = normalizeSaveFailure(error);
        diagnostics.value = failure.diagnostics;
        conflict.value = failure.conflict;
        syncDirtyRegistration();
        return Promise.reject(failure);
      })
      .finally(() => {
        activeSave = null;
        saving.value = false;
      });
    return activeSave;
  }

  async function retryConflict(nextServerVersion = null) {
    if (nextServerVersion != null) serverVersion.value = nextServerVersion;
    conflict.value = null;
    return save();
  }

  function clearHistory() {
    past.value = [];
    future.value = [];
  }

  function dispose() {
    navigation.clearDirty(options.sourceId);
    activeSave = null;
  }

  onBeforeUnmount(dispose);
  syncDirtyRegistration();

  return {
    apply,
    canRedo,
    canUndo,
    compareConflict,
    conflict,
    diagnostics,
    dirty,
    discard,
    dispose,
    lastSavedAt,
    redo,
    reloadConflict,
    reset,
    retryConflict,
    save,
    saving,
    sequence,
    serverVersion,
    undo,
  };
}

function normalizeSaveFailure(error) {
  const status = Number(error?.status ?? error?.response?.status);
  if (status === 409) {
    return {
      code: "sequence.conflict",
      status,
      diagnostics: [
        {
          code: "sequence.conflict",
          severity: "error",
          identity: null,
          scope: "sequence",
        },
      ],
      conflict: {
        canCompare: error?.capabilities?.compare !== false,
        canReload: error?.capabilities?.reload !== false,
        canRetry: error?.capabilities?.retry !== false,
        remoteSequence: Array.isArray(error?.remoteSequence)
          ? clone(error.remoteSequence)
          : null,
        serverVersion: safeVersion(error?.serverVersion),
      },
    };
  }
  return {
    code: status === 422 ? "sequence.validationFailed" : "sequence.saveFailed",
    status: Number.isInteger(status) ? status : null,
    diagnostics: [
      {
        code:
          status === 422 ? "sequence.validationFailed" : "sequence.saveFailed",
        severity: "error",
        identity: null,
        scope: "sequence",
      },
    ],
    conflict: null,
  };
}

function boundedHistoryLimit(value) {
  const parsed = Number(value ?? DEFAULT_HISTORY_LIMIT);
  if (!Number.isInteger(parsed)) return DEFAULT_HISTORY_LIMIT;
  return Math.min(Math.max(parsed, 1), 100);
}

function fingerprint(value) {
  return JSON.stringify(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeVersion(value) {
  const normalized = String(value ?? "").trim();
  return normalized === "" ? null : normalized.slice(0, 200);
}

function createIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `sequence-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
