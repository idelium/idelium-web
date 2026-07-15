import axios from "axios";

import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

let unauthorizedHandler = null;
let handlingUnauthorized = false;

export const apiClient = axios.create({
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

apiClient.interceptors.request.use((request) => {
  const session = useSessionStore(pinia);
  if (session.accessToken)
    request.headers.Authorization = `Bearer ${session.accessToken}`;
  if (session.sessionId) request.headers.Session = session.sessionId;
  return request;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const normalized = {
      status: error.response?.status || 0,
      code: error.code || "REQUEST_FAILED",
      message:
        error.response?.status === 401
          ? "Authentication required"
          : "Request failed",
    };
    error.normalized = normalized;

    if (normalized.status === 401 && !handlingUnauthorized) {
      handlingUnauthorized = true;
      useSessionStore(pinia).clear();
      try {
        await unauthorizedHandler?.();
      } finally {
        handlingUnauthorized = false;
      }
    }
    return Promise.reject(error);
  },
);

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export default apiClient;
