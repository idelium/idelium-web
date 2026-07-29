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
