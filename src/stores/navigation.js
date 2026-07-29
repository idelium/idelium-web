import { defineStore } from "pinia";

let confirmationHandler = null;

export function setUnsavedChangesConfirmationHandler(handler) {
  confirmationHandler = handler;
}

export const useNavigationStore = defineStore("navigation", {
  state: () => ({
    dirtySources: {},
  }),
  getters: {
    hasUnsavedChanges: (state) => Object.keys(state.dirtySources).length > 0,
    unsavedSourceLabels: (state) => Object.values(state.dirtySources),
  },
  actions: {
    markDirty(sourceId, label = sourceId) {
      if (!sourceId) return;
      this.dirtySources = {
        ...this.dirtySources,
        [sourceId]: label,
      };
    },
    clearDirty(sourceId) {
      if (!sourceId || !this.dirtySources[sourceId]) return;
      const nextSources = { ...this.dirtySources };
      delete nextSources[sourceId];
      this.dirtySources = nextSources;
    },
    clearAll() {
      this.dirtySources = {};
    },
    async confirmDiscard(options = {}) {
      if (!this.hasUnsavedChanges) return true;
      if (!confirmationHandler) return false;
      return confirmationHandler({
        sources: this.unsavedSourceLabels,
        ...options,
      });
    },
  },
});
