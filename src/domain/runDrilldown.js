import { normalizeExecutionStatus } from "@/domain/executionContracts";
import { parsePostmanResults } from "@/domain/postmanResults";

const MAX_NODES = 500;

export function normalizeRunDrilldown(payload = {}, options = {}) {
  const tests = safeArray(payload.tests ?? payload.results ?? payload);
  const nodes = tests.flatMap((test, testIndex) =>
    normalizeTestNode(test, testIndex),
  );
  return {
    nodes: nodes.slice(0, positiveInteger(options.limit, MAX_NODES)),
    total: nodes.length,
    truncated: nodes.length > positiveInteger(options.limit, MAX_NODES),
  };
}

export function normalizeDrilldownSelection(value) {
  return safeIdentifier(value) || null;
}

export function drilldownSelectionRoute({ detailId, projectId, runId, tab }) {
  const query = new URLSearchParams();
  query.set("tab", tab || "tests");
  if (detailId) query.set("detailId", normalizeDrilldownSelection(detailId));
  return {
    name: "execution-detail",
    params: {
      projectId: safeIdentifier(projectId),
      runId: safeIdentifier(runId),
    },
    query: Object.fromEntries(query.entries()),
  };
}

function normalizeTestNode(test, index) {
  const runtime = String(
    test?.type ?? test?.runtime ?? "unknown",
  ).toLowerCase();
  const testId = safeIdentifier(test?.id ?? test?.testId ?? index + 1);
  const children =
    runtime === "postman"
      ? postmanRequestNodes(test, testId)
      : safeArray(test?.steps ?? test?.commands)
          .map((step, stepIndex) => stepNode(step, testId, stepIndex, runtime))
          .flat();
  const status = deriveParentStatus(test, children);
  return [
    {
      id: `test:${testId}`,
      parentId: null,
      level: "test",
      runtime,
      name: safeText(test?.name ?? test?.testName ?? `Test ${index + 1}`),
      status,
      durationMs: nonNegativeNumber(test?.durationMs ?? test?.duration),
      failure: failureDescriptor(test, status),
      children: children.map((child) => child.id),
    },
    ...children,
  ];
}

function postmanRequestNodes(test, testId) {
  return parsePostmanResults(test.postmanData ?? test.data ?? [])
    .map((request, index) => {
      const requestId = `postman:${testId}:${index + 1}`;
      const assertions = safeArray(request.assertions).map(
        (assertion, assertionIndex) =>
          assertionNode(assertion, requestId, assertionIndex),
      );
      const status =
        request.passed === false ||
        assertions.some((assertion) => assertion.status === "failed")
          ? "failed"
          : normalizeExecutionStatus(
              request.status < 400 ? "passed" : "failed",
            );
      return [
        {
          id: requestId,
          parentId: `test:${testId}`,
          level: "step",
          runtime: "postman",
          name: safeText(request.name ?? request.url ?? `Request ${index + 1}`),
          method: safeText(request.method),
          url: safeUrl(request.url),
          responseStatus: nonNegativeNumber(request.status),
          status,
          durationMs: nonNegativeNumber(request.time ?? request.durationMs),
          failure: failureDescriptor(request, status),
          artifacts: safeArray(request.artifacts),
          children: assertions.map((assertion) => assertion.id),
        },
        ...assertions,
      ];
    })
    .flat();
}

function stepNode(step, testId, index, runtime) {
  const stepId = `step:${testId}:${safeIdentifier(step?.id ?? index + 1)}`;
  const assertions = safeArray(step?.assertions).map(
    (assertion, assertionIndex) =>
      assertionNode(assertion, stepId, assertionIndex),
  );
  const status = deriveParentStatus(step, assertions);
  return [
    {
      id: stepId,
      parentId: `test:${testId}`,
      level: "step",
      runtime,
      name: safeText(step?.name ?? step?.command ?? `Step ${index + 1}`),
      status,
      durationMs: nonNegativeNumber(step?.durationMs ?? step?.duration),
      failure: failureDescriptor(step, status),
      artifacts: safeArray(step?.artifacts),
      children: assertions.map((assertion) => assertion.id),
    },
    ...assertions,
  ];
}

function assertionNode(assertion, parentId, index) {
  const status =
    assertion?.passed === false
      ? "failed"
      : assertion?.passed === true
        ? "passed"
        : normalizeExecutionStatus(assertion?.status);
  return {
    id: `${parentId}:assertion:${safeIdentifier(assertion?.id ?? index + 1)}`,
    parentId,
    level: "assertion",
    runtime: "assertion",
    name: safeText(
      assertion?.name ?? assertion?.assertion ?? `Assertion ${index + 1}`,
    ),
    status,
    durationMs: 0,
    failure: failureDescriptor(assertion, status),
    remediation: safeText(assertion?.remediation),
    retryable: Boolean(assertion?.retryable),
    children: [],
  };
}

function deriveParentStatus(source, children) {
  if (children.some((child) => child.status === "failed")) return "failed";
  const status = normalizeExecutionStatus(source?.status ?? source?.state);
  return status === "unknown" && children.length > 0 ? "passed" : status;
}

function failureDescriptor(source, status) {
  if (status !== "failed") return null;
  return {
    code: safeIdentifier(
      source?.code ?? source?.failureCode ?? "execution.failure",
    ),
    message: redactText(source?.message ?? source?.error ?? source?.diagnostic),
    retryable: Boolean(source?.retryable),
  };
}

function redactText(value) {
  const text = safeText(value);
  return /authorization|bearer |cookie|password|secret|token|x-api-key/i.test(
    text,
  )
    ? "[REDACTED]"
    : text;
}

function safeUrl(value) {
  const text = String(value ?? "");
  return /^https?:\/\//.test(text) || text.startsWith("/")
    ? redactText(text)
    : "";
}

function safeIdentifier(value) {
  return String(value ?? "")
    .replace(/[^a-zA-Z0-9_.:@-]/g, "-")
    .slice(0, 120);
}

function safeText(value) {
  return String(value ?? "")
    .trim()
    .slice(0, 500);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function nonNegativeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function positiveInteger(value, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}
