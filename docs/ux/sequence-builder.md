# Sequence builder domain and persistence contract

The sequence builder is the shared composition model for test cycles containing
tests and tests containing steps. Its domain contract is independent from a
specific picker, drag library, or route component.

## Persisted and transient state

Persisted state contains ordered entity references, the duplicate policy,
validation diagnostics, and the last server version. Transient state contains
search, filters, checked picker items, and focus. Transient state is never sent to
the API and is reset on project or tenant context changes.

Each selected item has:

- a stable identity formed from entity type and entity ID;
- a one-based visible position;
- safe display metadata such as runtime, tags, owner, version, and status;
- an optional immutable referenced version;
- an eligibility status and disabled-reason localization key;
- an opaque backward-compatible persisted value that is never used as display
  metadata or written to diagnostics.

The display metadata contract rejects protected key names such as authorization,
cookie, credential, password, secret, session, and token.

## Compatibility

Existing test and test-cycle `config` arrays load in their stored order and
serialize back to the same array shape. There is no implicit sorting or entity
deduplication. Duplicate references produce a blocking diagnostic under the
default `reject` policy; a future route may explicitly select the `allow` policy.

An available-entity snapshot may be supplied while loading:

- a reference absent from the authorized snapshot becomes `missing`;
- a persisted version different from the authorized version becomes `stale`;
- archived and unauthorized states remain ineligible and visible;
- no cross-tenant entity name or metadata is inferred for a missing reference.

Malformed or oversized input fails with a stable diagnostic. The domain limit is
500 selected references. Server validation and tenant authorization remain
authoritative.

## Concurrency

Persistence requests carry an optional `expectedVersion`. Routes that have a
version-aware API must reject a stale version and preserve local state for
comparison or retry. Legacy endpoints may ignore the optional value during the
migration period. This permits incremental adoption without changing existing
stored test or test-cycle payloads.

## Entity picker

`EntityPicker` is a controlled component: it never downloads an entity catalogue
directly and never treats the current page as the complete tenant dataset. The
route container supplies a bounded page and metadata, then handles `query-change`
events with the shared enterprise-grid query serializer. Search is debounced;
filter and search changes reset the page; selected stable identities remain
controlled by the parent across page changes.

Route containers use `useEnterpriseGridLoader` for picker requests. A newer query
aborts the previous request and ignores a late response. Tenant or project context
changes call `reset`, which aborts in-flight work and clears authorized rows.
Background failures may retain the last authorized page as stale, while a
permission denial clears it immediately.

The picker renders only declared metadata labels and explains why missing, stale,
archived, unauthorized, or otherwise ineligible items cannot be selected. Empty,
no-results, loading, stale, permission, and error states reuse the shared
accessible feedback component.

## Audit events

Comparing the last persisted sequence with the next sequence produces ordered
`sequence.item.added`, `sequence.item.removed`, and
`sequence.item.reordered` events. Events contain stable identities and positions
only. They never contain entity configuration, credentials, or protected result
payloads.

## Rollout and rollback

The shared builder will migrate Test Cycle first and Test second after picker,
reorder, validation, undo, and performance tickets are complete. Rollback restores
the legacy route component; serialized arrays remain compatible and require no
data migration.
