# Enterprise launch configuration

## Contract

Idelium Console uses the versioned `2026.07` launch contract to describe a run
before it reaches the API. The contract contains the active customer, project,
test cycle, environment, execution target, concurrency, launch options,
preflight diagnostics, and an idempotency key. The Console may use the contract
for validation, preview, review, and recovery, but the API remains authoritative
for ownership, capability, scheduling, target capacity, and final execution
creation.

The canonical launch request is additive to the current `admin/launchtest`
endpoint. The compatibility layer keeps that legacy endpoint visible while the
UI and API migrate toward:

- `admin/launch/preflight` for diagnostics;
- `admin/launch` for idempotent launch submission.

## Required inputs

A launch cannot proceed without explicit cycle, environment, execution target,
and concurrency values. Browser, device, timeout, variables, tags, and optional
schedule references are normalized as launch options. Unsupported options fail
with stable validation diagnostics instead of being silently ignored.

## Cycle and environment selection

Cycle and environment selection uses bounded, searchable, project-scoped
selectors. Each request uses an explicit page size of 50 and an allowlisted
search query, so the Console never loads an unbounded set of customer assets.
The API must keep filtering unauthorized entities; the browser additionally
filters unauthorized status markers if legacy responses contain them.

Each option exposes enough metadata to prevent operator mistakes: version,
status, runtime compatibility, owner, and updated date. Archived, inactive,
cross-project, cross-customer, and runtime-incompatible options remain
non-selectable with a localized reason. Changing the environment clears only an
already-selected cycle when its runtime becomes incompatible; other draft state
is preserved.

The safe draft state is stored in the route query as selected cycle and
environment identifiers only. Secrets, variables, headers, payloads, and
credentials are never copied into the URL. Refreshing the page reloads the
authorized bounded lists and revalidates whether the referenced selections are
still available.

## Target and concurrency configuration

Execution target configuration lists authorized target pools with health,
runtime, region, queue state, capacity, and capability metadata. The Console
never renders infrastructure credentials, provider tokens, internal connection
strings, authorization headers, or raw target payloads. If the canonical target
endpoint is not available during rollout, the page falls back to the legacy
platform pool so existing launch behavior remains usable.

Unhealthy, incompatible, or capacity-exhausted targets are disabled with a
localized reason. Stale health is visible as a non-blocking warning because the
API preflight must refresh capacity immediately before launch. The UI validates
concurrency against target capacity and the global client maximum, but the API
must enforce policy, target capacity, cycle composition, and capacity changes
again at preflight and launch.

Browser and device overrides are editable only when the selected target exposes
the corresponding capability. Unsupported overrides block the launch review and
are never sent as hidden free-form options.

The diagnostic model contains:

- `severity`: `info`, `warning`, or `error`;
- `code`: stable machine-readable diagnostic code;
- `location`: field or section affected by the diagnostic;
- `message`: human-readable summary safe for display;
- `remediationKey`: localization key for the recommended action;
- `blocking`: whether submission must stop;
- `correlationId`: optional API/client correlation reference.

## Idempotency and retries

Every launch request has an `Idempotency-Key` scoped to the contract version,
customer, project, user, cycle, and redacted launch configuration. A retry with
the same key and equivalent request can return the existing run instead of
creating a duplicate. A retry with the same key and a different request is not
equivalent and must be rejected by the API.

Recoverable failures must preserve the configured launch in the browser so the
operator can change only the field that caused the problem and retry. Successful
launches must redirect to the canonical run route returned by the API.

## CLI compatibility

The contract maps directly to CLI launch concepts:

- `--idCycle` maps to `cycle.id`;
- `--idProject` maps to `projectId`;
- `--environment` maps to `environment.code` or `environment.id`;
- target selectors map to `target`;
- timeout, debug, browser, device, tags, and variables map to `options`.

The browser-side contract never changes runner behavior by itself. It only
normalizes and previews the request that the API and CLI-compatible runner will
validate again.

## Security and redaction

The Console contract redacts sensitive values before preview, diagnostics,
idempotency hashing, logs, screenshots, exports, or submission previews.
Sensitive keys include authorization, password, secret, token, API key, session,
cookie, and private-key variants. URL usernames, passwords, query strings, and
fragments are removed.

Tenant and project ownership is checked on every client boundary to prevent
unsafe UX states, and the API must repeat those checks during preflight and
launch. Client checks are usability diagnostics only; they are not an
authorization boundary.

## Rollout and rollback

The contract is additive. Existing launcher routes and the legacy launch
endpoint remain available while the UX moves from modal-first launch to
configuration, preflight, review, and idempotent submit. Rollback keeps using
the legacy endpoint because the current persisted test cycle, environment, and
platform records are unchanged.
