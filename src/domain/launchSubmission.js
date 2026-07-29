export function createLaunchSubmission(request, existingKey = null) {
  const idempotencyKey = existingKey || request?.idempotencyKey;
  if (!idempotencyKey) {
    throw new Error("Launch submission requires an idempotency key.");
  }
  return {
    body: request.body,
    endpoint: request.endpoint,
    headers: {
      ...request.headers,
      "Idempotency-Key": idempotencyKey,
    },
    idempotencyKey,
    status: "ready",
  };
}

export function canReplayLaunchRequest(previousSubmission, nextSubmission) {
  if (!previousSubmission?.idempotencyKey || !nextSubmission?.idempotencyKey) {
    return false;
  }
  return (
    previousSubmission.idempotencyKey === nextSubmission.idempotencyKey &&
    previousSubmission.endpoint === nextSubmission.endpoint &&
    JSON.stringify(previousSubmission.body ?? {}) ===
      JSON.stringify(nextSubmission.body ?? {})
  );
}

export function normalizeLaunchSubmissionResult(response = {}) {
  const data = response.data ?? response;
  const statusCode = Number(response.status ?? data.statusCode ?? 200);
  const runId = data.runId ?? data.idRun ?? data.executionId ?? data.id;
  const statusLocation = data.statusLocation ?? data.location ?? null;
  const replayed = Boolean(data.replayed ?? statusCode === 200);

  if (runId) {
    return {
      replayed,
      runId: String(runId),
      status: replayed ? "replayed" : "created",
      statusLocation,
    };
  }
  if (statusCode === 202 && statusLocation) {
    return {
      replayed: false,
      runId: null,
      status: "accepted",
      statusLocation,
    };
  }
  if (statusCode >= 400) {
    return {
      replayed: false,
      runId: null,
      status: "rejected",
      statusLocation,
    };
  }
  return {
    replayed: false,
    runId: null,
    status: "unknown",
    statusLocation,
  };
}

export function canonicalExecutionRoute(projectId, runId) {
  return {
    name: "execution-detail",
    params: {
      projectId: String(projectId),
      runId: String(runId),
    },
  };
}

export function shouldReconcileLaunchOutcome(error) {
  const status = error?.response?.status ?? 0;
  return status === 0 || status === 408 || status === 409 || status >= 500;
}
