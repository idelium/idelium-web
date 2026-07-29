# Execution observability contracts

Idelium Web consumes execution data through a versioned contract before rendering
run history, run detail, live updates, reports, and artifacts. The current
contract version is `2026-07-29.execution.v1`.

## Descriptor model

The normalized model contains these descriptor families:

- `run`: stable run identifier, project ownership, tenant ownership, terminal or
  transitional status, progress, timings, worker assignment, cancellation, and
  retry metadata.
- `worker`: worker identifier, display name, runtime, region, and current state.
- `test`: test identifier, runtime (`postman`, `selenium`, `appium`, `api`, or
  `unknown`), required flag, duration, child steps, assertions, artifacts, and
  failure summaries.
- `step`: step identifier, ordered sequence identifier, required flag, duration,
  assertions, artifacts, and failure metadata.
- `assertion`: assertion identifier, pass/fail state, required flag, and failure
  metadata.
- `artifact` and `report`: safe relative download URL, size/format metadata,
  retention metadata, and redaction state.
- `live event`: monotonic `sequenceId`, event type, run identifier, occurrence
  timestamp, redacted payload, and replay marker.

## Status semantics

Terminal states are `passed`, `failed`, `cancelled`, `skipped`, and `blocked`.
Transitional states are `queued`, `running`, and `cancelling`. Any unknown value
normalizes to `unknown`; it must never be rendered as passed.

Required child failures propagate upward. A failed required assertion marks the
step as failed, a failed required step marks the test as failed, and any failed
required test or step marks the run as failed. Optional child failures remain
visible in diagnostics but do not override the parent outcome.

## Live event replay

Live updates use monotonic sequence identifiers. After reconnect, the client
requests events after its last applied cursor. If the first returned event has a
sequence larger than the expected next sequence, the client treats the stream as
gapped and must replay the run detail from the server snapshot before applying
new events.

## Live runs workspace

The live runs workspace presents an operational window of queued, running,
cancelling, recently passed, failed, and cancelled executions. The view uses the
same normalized execution status semantics as run detail and applies a bounded
window before rendering high-frequency telemetry.

Each live run card exposes:

- project-scoped run identity and cycle name;
- status text, non-color visual treatment, and an accessible progress label;
- target or update channel, requested concurrency, active concurrency, worker
  completion, failed workers, cancelled workers, queue time, elapsed time, and
  last update metadata when available;
- explicit stale telemetry and degraded channel messages;
- detail and cancel actions only when the normalized capability flags allow them.

Progress is monotonic. If out-of-order events arrive after a more advanced
progress value, the UI keeps the greater completed count and updates only fields
that do not make progress regress. Status filters are local and project-scoped;
they do not request or render runs for another selected project.

## Run history filters and saved views

Run history uses the shared server-side DataTable pattern and persists safe
filters, sorting, and pagination in the canonical route query. The current saved
view schema is `2026-07-29.run-history.v1`.

Supported filters are status, cycle, environment, target, author, time range,
tag, and failure classification. Query parameters are project-scoped, bounded by
page size, and sanitized so credentials or protected payload fragments are not
stored in URLs. Date-only boundaries are inclusive: `fromInclusive=YYYY-MM-DD`
maps to `00:00:00.000`, and `toInclusive=YYYY-MM-DD` maps to `23:59:59.999`.
The source timezone is kept alongside the UTC instant so the API can apply
indexed tenant-scoped queries consistently.

Saved views are personal and versioned. Legacy filter names are migrated:
`cycle` to `cycleId`, `env` to `environmentId`, `from` to `fromInclusive`, `to`
to `toInclusive`, and `user` to `author`. Rollback is safe because saved-view
migration is additive and the canonical URL still contains plain filters.

## Canonical run detail

The canonical route is `/projects/:projectId/executions/:runId`. The active tab
is stored as `?tab=overview|tests|workers|timeline|artifacts|logs|reports`, and
the selected nested item is stored as `detailId` when needed. Refreshing the
route restores the same authorized run and tab without relying on mutable asset
names.

The overview renders immutable run identity, status, cycle snapshot,
environment snapshot, target snapshot, initiator, timestamps, duration,
concurrency, progress, and correlation ID. Reproducibility commands are generated
from safe identifiers only. Configuration payloads are redacted before rendering.

Historical details remain useful when related assets have been deleted or
expired. In that case the UI displays snapshot names and marks the detail as
partial instead of failing to render. Unauthorized direct access must be handled
as a not-found or permission-denied state by the API; the client does not render
protected detail payloads when the contract marks the run as unauthorized.

## Worker, test, step, and assertion drill-down

Run detail adapters normalize Postman requests/assertions, Selenium steps, and
Appium commands into one bounded hierarchy. Parent status is derived from child
failures so failed assertions cannot appear as passed at the test or run level.
Each node can expose status, duration, failure code, failure message,
remediation, retryability, related artifacts, and Postman request metadata
including name, method, URL, response status, duration, assertions, and response
descriptor when available.

The selected node is persisted as `detailId` in the canonical execution route,
which allows refresh and browser back navigation to restore the same authorized
detail. Legacy result shapes remain inspectable through the adapters and are
bounded before rendering large result sets.

## Legacy compatibility

Legacy status values are still accepted:

- `1` and `success` normalize to `passed`.
- `2` and `error` normalize to `failed`.
- Missing progress is inferred from terminal child tests.
- Missing contract version is marked in the `legacy` descriptor so the UI can
  display safe fallbacks without requiring an API migration to be deployed first.

Partial Postman, Selenium, and Appium results are supported. Missing test, step,
assertion, artifact, report, timing, and worker fields use bounded defaults.

## Redaction and retention

Execution payloads must not expose credentials or protected customer payloads.
Artifacts, reports, failures, and live event payloads are normalized with
redaction metadata. Sensitive markers such as authorization headers, bearer
tokens, cookies, passwords, secrets, API keys, and token query parameters are
redacted before rendering.

Retention metadata is carried with runs and artifacts. The UI treats missing
retention policy as `default`, supports `expiresAt`, and preserves legal-hold
signals.

## Migration and rollback

The contract is additive and backward compatible with the existing
`testsperformed` route and current API payloads. If the API later emits the same
contract version directly, the client normalizer remains safe to run as an
idempotent compatibility layer. Rollback is safe because the new module is pure
client-side normalization and does not mutate persisted data.
