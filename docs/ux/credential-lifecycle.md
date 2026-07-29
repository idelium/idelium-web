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
