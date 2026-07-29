# Credential lifecycle contract

Idelium credentials replace the legacy single API key model with named,
tenant-scoped credentials that can be created, listed, rotated, revoked, and
audited deliberately.

## Descriptor

Every credential descriptor uses `2026-07-29.credentials.v1` and contains only
non-secret metadata:

- stable credential ID;
- display name;
- safe prefix and fingerprint;
- scopes;
- status;
- created, last-used, and expiry timestamps;
- creating or acting user;
- tenant ownership;
- rotation lineage.

List, detail, audit, rotate, revoke, and subsequent retrieval responses must not
return the complete secret. Complete secret material is returned only in the
initial reveal-once creation result.

## Authorization

Every lifecycle action is tenant-scoped and capability-enforced:

- `credential.list`;
- `credential.create`;
- `credential.rotate`;
- `credential.revoke`;
- `credential.audit`.

Cross-tenant credential identifiers are rejected even when the operator has the
right capability in another tenant. Unsupported actions fail closed.

## Inventory listing

The credential inventory uses the shared enterprise DataTable and renders only
safe metadata:

- name;
- prefix or fingerprint;
- scopes;
- status;
- owner;
- created timestamp;
- last-used timestamp;
- expiry timestamp.

Filters are bounded and tenant-scoped. The listing supports status, scope,
owner, and expiry filters, with page size capped at 100 credentials per client
query. Active, expiring, expired, rotated, revoked, legacy, and unknown states
must be visually and textually distinguishable.

Never-used credentials display a clear `Never used` state. When the API cannot
provide last-used data, the UI displays `Unavailable` instead of guessing.

Row actions are exposed only when the active operator has the matching
capability. Rotate and revoke are disabled for terminal credential states such
as revoked and expired. Revoke is a confirmation action.

## Named credential creation

Credential creation collects name, description, allowed scopes, expiration, and
optional approved constraints. The default scope set is intentionally minimal:
`run:execute`. Operators must add additional scopes deliberately.

The client validates duplicate names, invalid or excessive lifetime, dangerous
scope combinations, and whether the actor controls every selected scope before
submitting. Recoverable validation errors preserve non-sensitive form fields and
do not render or store secret material.

Creation uses an idempotency key derived from tenant, actor, name, expiration,
and scope set. Repeated submission of the same form therefore reconciles to the
same logical request instead of creating multiple credentials.

After successful creation, the user is routed to a reveal-once result state. The
complete secret exists only in that creation response and is not part of list,
detail, audit, or subsequent retrieval responses.

## Reveal-once result

The reveal-once result is an in-memory, short-lived UI session created only from
the credential creation response. It displays the complete secret exactly once
and stores only a redacted credential snapshot in inventory state.

Operators must acknowledge that the secret cannot be shown again before Copy or
Download actions become available. Both actions provide accessible feedback
through the page live region. The download action creates a temporary browser
object URL, clicks it, and revokes it immediately after use.

The complete secret must never be written to route parameters, query strings,
local storage, session storage, telemetry, logs, screenshots, test snapshots, or
credential inventory rows. It is cleared when the operator navigates away,
refreshes or closes the page, changes project or route context, dismisses the
panel, or when the reveal timeout expires.

Reloading a reveal-once URL may preserve the credential ID for orientation, but
it cannot retrieve or reconstruct the complete secret. The only recovery path is
to create or rotate a credential and capture the new one-time value.

## Rotation

Credential rotation issues a replacement credential through an idempotent
request scoped to tenant, actor, credential ID, and selected policy. The
supported cutover policies are:

- `immediate`: the replacement should become active without overlap;
- `overlap-24h`: the old and new credentials may overlap for 24 hours;
- `overlap-7d`: the old and new credentials may overlap for seven days.

The rotation panel displays the affected credential metadata, safe fingerprint,
last use, scopes, expiry, and selected policy before the request is submitted.
If the rotation fails, the client leaves the original credential state unchanged
unless the API explicitly reports a durable transition.

Successful rotation returns the replacement secret through the same reveal-once
session used by credential creation. The inventory stores only safe descriptors:
the old credential is marked as rotated and the replacement carries lineage to
the previous credential ID. Neither the old nor replacement full value appears in
inventory rows, route state, telemetry, logs, or documentation fixtures.

## Revocation

Credential revocation invalidates an existing credential through an idempotent,
tenant-scoped request. The operator must confirm both the credential name and the
safe prefix or fingerprint before the request can be submitted. The revocation
panel displays last use, affected scopes, and the immediate consequence: after
durable API confirmation, the credential can no longer authenticate CLI or
automation requests.

An audit reason can be required by policy. Revoking the last usable credential,
or a protected automation path, requires elevated confirmation before the request
is sent. Already revoked, expired, and other terminal credentials fail closed in
the client validation layer.

The UI must not mark a credential as revoked until the API confirms the durable
state transition. If revocation fails, the original credential remains visible
and usable in the client state. Audit records must contain actor, timestamp,
target credential ID, selected outcome, and reason when provided, but never the
complete credential value.

## CLI and CI usage guidance

Generated usage examples must never interpolate complete credential material.
They may contain placeholders, environment variables, or platform secret
references only. Public references use `idelium.org`; examples must not use
`idelium.io`, unpinned package versions, `latest`, or moving branches.

Local shell examples install a pinned Idelium CLI version and read
`IDELIUM_API_KEY` from the operator's local password manager or approved secret
injection flow. GitHub Actions examples use pinned actions such as
`actions/checkout@v4` and `actions/setup-python@v5`, with the credential read
from `${{ secrets.IDELIUM_API_KEY }}`. Generic CI examples describe runtime
injection from the platform secret store without claiming that client-side code
can make the value secret.

Operators should verify a newly created credential with the narrowest required
scope, monitor its last-used timestamp, and rotate it during incidents, operator
changes, CI migration, or suspected exposure. Incident response should revoke
known-compromised credentials after a replacement has been validated.

## Security regression coverage

Credential security tests run with synthetic credentials only. They cover create,
reveal cleanup, list, rotate, revoke, expiration, and last-used transitions, plus
negative forged tenant, customer, project, credential, and scope identifiers.
Cross-tenant attempts fail through the same rejected authorization contract and
must not disclose whether the forged target exists.

Leakage scans cover representative UI logs, API logs, DOM snapshots, URLs,
browser storage, and generated artifacts. Findings report only channel and safe
fingerprint fragments; they must not print complete credential material.

Incident response should validate a replacement credential before revoking the
compromised one unless the incident requires immediate cutover. Rollback may
restore client compatibility and read-only metadata, but it must not re-enable
complete secret retrieval through list, detail, audit, logs, or cached artifacts.

## Redaction and observability

Credential diagnostics, audit records, screenshots, fixtures, and UI state must
not include passwords, bearer tokens, authorization headers, cookies, API keys,
session identifiers, or complete credential material. Logs may include safe
credential IDs, names, fingerprints, scopes, timestamps, status, and lineage.

## Legacy migration policy

Legacy keys remain readable only through compatibility metadata during the
deprecation window. Legacy list, detail, audit, and migration responses must not
return complete secret material.

The default removal criterion is: legacy keys can be removed after the published
removal date when all active customers have at least one named credential and no
legacy key has been used for 30 days.

Rollback may keep legacy read compatibility, but it must not re-enable complete
secret material in list, detail, or audit responses.
