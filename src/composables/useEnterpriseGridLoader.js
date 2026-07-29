import { reactive } from "vue";

export function useEnterpriseGridLoader(loadPage) {
  if (typeof loadPage !== "function") {
    throw new TypeError("Enterprise grid loader requires a load function.");
  }

  const state = reactive({
    error: null,
    loading: false,
    meta: {},
    permissionDenied: false,
    refreshCompleted: false,
    rows: [],
    stale: false,
  });
  let requestSequence = 0;
  let controller = null;

  async function run(query, { background = false } = {}) {
    requestSequence += 1;
    const currentRequest = requestSequence;
    controller?.abort();
    controller = new AbortController();
    const requestController = controller;
    state.loading = true;
    state.refreshCompleted = false;
    state.error = null;
    state.permissionDenied = false;
    if (background && state.rows.length > 0) state.stale = true;

    try {
      const result = await loadPage(query, {
        signal: requestController.signal,
      });
      if (currentRequest !== requestSequence) return null;
      state.rows = Array.isArray(result?.rows) ? result.rows : [];
      state.meta = result?.meta ?? {};
      state.stale = Boolean(state.meta.stale);
      state.refreshCompleted = background;
      return result;
    } catch (error) {
      if (
        requestController.signal.aborted ||
        currentRequest !== requestSequence
      ) {
        return null;
      }
      state.error = error;
      state.permissionDenied = error?.response?.status === 403;
      if (state.permissionDenied) {
        state.rows = [];
        state.meta = {};
        state.stale = false;
      } else if (state.rows.length > 0) {
        state.stale = true;
      }
      return null;
    } finally {
      if (currentRequest === requestSequence) state.loading = false;
    }
  }

  function reset() {
    requestSequence += 1;
    controller?.abort();
    controller = null;
    Object.assign(state, {
      error: null,
      loading: false,
      meta: {},
      permissionDenied: false,
      refreshCompleted: false,
      rows: [],
      stale: false,
    });
  }

  return { reset, run, state };
}
