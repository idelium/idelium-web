import apiClient from "@/services/apiClient";

export async function createGridQuerySnapshot(endpoint, payload, options = {}) {
  const response = await apiClient.post(
    `${endpoint}/query-snapshots`,
    payload,
    { signal: options.signal },
  );
  return response.data?.data;
}

export async function startGridBulkJob(endpoint, payload, options = {}) {
  if (!payload?.querySnapshotId) {
    throw new TypeError(
      "Bulk operations require a validated server query snapshot.",
    );
  }
  const response = await apiClient.post(`${endpoint}/bulk-jobs`, payload, {
    signal: options.signal,
  });
  return response.data?.data;
}

export async function getGridBulkJob(endpoint, jobId, options = {}) {
  const response = await apiClient.get(`${endpoint}/bulk-jobs/${jobId}`, {
    signal: options.signal,
  });
  return response.data?.data;
}
