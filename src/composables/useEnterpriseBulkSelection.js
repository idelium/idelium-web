import { ref } from "vue";

export function useEnterpriseBulkSelection(initialScope = null) {
  const allResultsSelected = ref(false);
  const querySnapshotId = ref(null);
  const scope = ref(initialScope);
  const selectedIds = ref([]);

  function clear() {
    allResultsSelected.value = false;
    querySnapshotId.value = null;
    selectedIds.value = [];
  }

  function setPageSelection(ids) {
    allResultsSelected.value = false;
    querySnapshotId.value = null;
    selectedIds.value = [...new Set((ids ?? []).map(String))];
  }

  function selectAllResults(snapshot) {
    if (!snapshot?.id || !Number.isInteger(snapshot?.total)) {
      throw new TypeError(
        "All-results selection requires a validated server query snapshot.",
      );
    }
    selectedIds.value = [];
    allResultsSelected.value = true;
    querySnapshotId.value = String(snapshot.id);
  }

  function updateScope(nextScope) {
    if (scope.value !== nextScope) {
      scope.value = nextScope;
      clear();
    }
  }

  return {
    allResultsSelected,
    clear,
    querySnapshotId,
    scope,
    selectAllResults,
    selectedIds,
    setPageSelection,
    updateScope,
  };
}
