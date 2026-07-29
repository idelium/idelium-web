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
