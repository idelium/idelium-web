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

## Addition and removal

The shared builder supports the same deterministic add operation through four
input methods:

- select one or more picker checkboxes and activate **Add selected**;
- double-click an eligible picker item;
- activate the explicit per-item **Add** action;
- drag an eligible picker item onto the selected sequence.

Multi-selection follows the authorized picker order rather than the order in
which checkboxes were activated. Each operation compares stable identities
against both the persisted sequence and the current addition batch. Existing
items are not duplicated, and the builder announces the rejected duplicate count
without exposing entity configuration.

Selected-sequence checkboxes support a single bulk removal. Every item also has
an explicit remove action with its entity name in the accessible label. The most
recent removal can be undone, restoring the removed items at their original
indexes and restoring the previous selection. Visible positions are always
one-based and recalculated from the current sequence; they are never persisted.

## Accessible reorder

Every selected item has a native drag handle and explicit **Move to start**,
**Move up**, **Move down**, and **Move to end** actions. The commands and native
drag operation use the same reorder function and therefore produce the same
persisted array. First and last boundary commands are disabled with localized
reasons.

After a keyboard or pointer reorder, the moved row receives focus after the
controlled sequence prop updates. A polite live region announces the entity name
and its source and destination positions. Stable entity identities remain the
render keys, while visible one-based positions are recalculated.

The selected list has a bounded viewport. Native drag-over events scroll it by
at most 24 pixels per event near either edge and clamp the scroll position to the
container bounds. The component does not use a drag library or global listener;
its unmount hook clears drag, focus, and element references so route changes
cannot leave library state behind.

## Validation and downstream impact

`validateSequenceComposition` evaluates required item counts, duplicates,
incompatible runtimes, archived or missing dependencies, stale references,
required immutable versions, and bounded policy limits. Every diagnostic has a
stable code, `error` or `warning` severity, sequence/item/field scope, affected
stable identity when authorized, and a localization remediation key. Errors
block saving. Warnings block only when their code is explicitly listed in the
policy and has not been acknowledged.

Server validation remains authoritative and is merged after client validation.
Only supported codes, severities, scopes, and identities already present in the
authorized sequence are accepted. Server messages, arbitrary context, and
unknown identities are discarded; an unknown rejection becomes the generic
`sequence.serverRejected` error. This prevents backend diagnostics from
accidentally rendering credentials or cross-tenant metadata.

Reusable-content routes may provide an impact response to
`summarizeSequenceImpact`. The UI renders bounded aggregate counts for authorized
tests, cycles, and schedules only. Names and other response properties are never
carried into the impact contract.

## Editing history, dirty state, and conflicts

`useSequenceEditor` owns a controlled local sequence, its last durable baseline,
and a bounded undo/redo history. The default history stores 50 meaningful
snapshots and the configurable bound is clamped between 1 and 100. Add, remove,
reorder, and nested configuration changes all use the same structural comparison.
No-op updates do not create history entries.

The editor registers its source with the central navigation store as soon as the
local value differs from the durable baseline. A successful save, explicit
discard, remote reload, or project/tenant context reset clears the registration.
A route transition therefore uses the existing enterprise unsaved-change modal.
Component teardown unregisters only that editor; failed saves retain the local
value and dirty registration.

Save requests include the current server version and an idempotency key. Repeated
save activation while a request is in flight reuses the active operation. A
successful persistence boundary updates the baseline, last-saved timestamp, and
server version, then clears undo and redo history. Validation and general
failures retain the sequence and expose stable generic diagnostics without
copying response messages.

HTTP 409 conflicts preserve local work and expose only endpoint capabilities,
the safe server version, and an optional already-authorized remote sequence.
Routes may offer reload, compare, and retry according to those capabilities.
Reload is an explicit discard boundary. Compare returns clones of the baseline,
local, and authorized remote arrays. Retry retains the local sequence and may
adopt a newly confirmed server version.

## Performance targets

The supported editor fixture contains 500 available items and 100 selected
items. The following thresholds define the UX-04 performance budget:

- render no more than 50 available entity rows at once;
- render at most the supported 100 selected rows;
- retain at most 500 safe metadata cache entries for the current authorized
  source snapshot;
- retain at most 50 undo and redo snapshots by default;
- dispatch debounced search within 250 milliseconds after the last input;
- keep local add, remove, reorder, and validation work below 50 milliseconds on
  the reference fixture during manual browser profiling;
- keep the editor-owned sequence and history below 10 MiB for the reference
  fixture.

`EntityPicker` uses a fixed estimated-row virtual window only when a supplied
page exceeds 100 items. Stable identities remain the keys and controlled
selection is independent from mounted rows. When a focused row would leave the
window, the window remains pinned to that identity until focus moves, preventing
keyboard focus loss. Safe derived metadata is cached by identity and source
object and cleared whenever the authorized source array changes.

Search requests continue to use the abortable enterprise-grid loader.
`useCancelableSequenceValidation` adds the same latest-request behavior for
remote validation: starting a new validation aborts the previous controller,
late responses cannot replace current results, and unmount cancels outstanding
work. CI uses fixed fixtures and asserts rendered-node bounds, stable selection,
pointer/keyboard reorder results, and cancellation rather than unstable
wall-clock timing. Browser profiling checks the documented latency and memory
budgets before a release.

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
