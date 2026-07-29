export const executionRunFixtures = Object.freeze([
  { id: "queued", projectId: 9, status: "queued" },
  { id: "running", projectId: 9, status: "running" },
  { id: "cancelling", projectId: 9, status: "cancelling" },
  { id: "passed", projectId: 9, status: "passed" },
  { id: "failed", projectId: 9, status: "failed", failedWorkers: 1 },
  { id: "interrupted", projectId: 9, status: "interrupted" },
  { id: "partial", projectId: 9, state: "mystery", reports: [] },
  { id: "unknown", projectId: 9, status: "vendor-new-state" },
  {
    artifacts: [{ expired: true, id: "artifact-expired", runId: "expired" }],
    id: "expired",
    projectId: 9,
    status: "passed",
  },
]);

export function largeRunHistoryFixture(size = 1_000) {
  return Array.from({ length: size }, (_, index) => ({
    cycleName: `Cycle ${index % 10}`,
    id: `run-${index}`,
    lastUpdateAt: `2026-07-29T12:${String(index % 60).padStart(2, "0")}:00Z`,
    progress: { completed: index % 5, total: 5 },
    projectId: index % 2 === 0 ? 9 : 10,
    sequenceId: index,
    status: index % 7 === 0 ? "failed" : "running",
  }));
}

export function largePostmanHierarchyFixture(requestCount = 600) {
  return [
    {
      data: Array.from({ length: requestCount }, (_, index) => ({
        assertions: [
          {
            message: index % 13 === 0 ? "expected false to be truthy" : "",
            name: `assertion ${index}`,
            passed: index % 13 !== 0,
          },
        ],
        method: index % 2 === 0 ? "GET" : "POST",
        name: `Request ${index}`,
        status: index % 13 === 0 ? 500 : 200,
        time: 10 + index,
        url: `https://example.org/request/${index}`,
      })),
      id: "postman-large",
      name: "Postman large suite",
      type: "postman",
    },
  ];
}
