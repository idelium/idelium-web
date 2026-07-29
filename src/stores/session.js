import { defineStore } from "pinia";

import { pinia } from "@/stores/pinia";

const STORAGE_KEY = "idelium.session";

function getStorage() {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

function readPersistedState() {
  const storage = getStorage();
  if (!storage) return {};

  try {
    return JSON.parse(storage.getItem(STORAGE_KEY) || "{}");
  } catch {
    storage.removeItem(STORAGE_KEY);
    return {};
  }
}

export const useSessionStore = defineStore("session", {
  state: () => {
    const persisted = readPersistedState();
    return {
      authenticated: persisted.authenticated === true,
      selectedCustomerId: persisted.selectedCustomerId || null,
      selectedProjectId: persisted.selectedProjectId || null,
      hasNoProjects: persisted.hasNoProjects === true,
      availableCustomers: [],
      availableProjects: [],
      capabilities: [],
    };
  },
  getters: {
    isAuthenticated: (state) => state.authenticated,
  },
  actions: {
    persist() {
      getStorage()?.setItem(
        STORAGE_KEY,
        JSON.stringify({
          authenticated: this.authenticated,
          selectedCustomerId: this.selectedCustomerId,
          selectedProjectId: this.selectedProjectId,
          hasNoProjects: this.hasNoProjects,
        }),
      );
    },
    establishSession() {
      this.authenticated = true;
      this.persist();
    },
    selectCustomer(customerId) {
      this.selectedCustomerId = customerId || null;
      this.selectedProjectId = null;
      this.persist();
    },
    selectProject(projectId) {
      this.selectedProjectId = projectId || null;
      this.persist();
    },
    setAvailableContexts({ customers = [], projects = [], capabilities = [] }) {
      this.availableCustomers = customers;
      this.availableProjects = projects;
      this.capabilities = capabilities;
    },
    hasCapability(capability) {
      return !capability || this.capabilities.includes(capability);
    },
    setProjectAvailability(projects) {
      this.availableProjects = projects;
      this.hasNoProjects = projects.length === 0;
      if (this.hasNoProjects) this.selectedProjectId = null;
      this.persist();
    },
    clear() {
      getStorage()?.removeItem(STORAGE_KEY);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("session");
        window.localStorage.removeItem("isFirstProject");
        window.localStorage.removeItem("projectIdSelected");
      }
      this.$reset();
    },
  },
});

export { STORAGE_KEY };

export function getSelectedProjectId() {
  return useSessionStore(pinia).selectedProjectId;
}
