# Enterprise DataTable

`EnterpriseDataTable` is the single supported presentation contract for Idelium
entity listings. It separates bounded data retrieval from rendering, identity,
selection, sorting, actions, and feedback states.

## Contract

- Every row must expose a stable entity identifier. Array indexes are prohibited.
- Server-driven mode must request a bounded page through `buildGridQuery`.
- Local mode is limited to 1,000 records and is intended only for bounded reference
  data or deterministic tests.
- Columns require a stable key and localized label. Complex object values are not
  rendered by default.
- Columns marked `sensitive` are always redacted. Pages must not pass credentials,
  session values, authorization headers, or protected payloads to the component.
- Capability filtering is a presentation safeguard only. The API remains
  authoritative and must enforce tenant ownership and authorization.
- Shared row actions emit an action identifier and the current authorized row.
  Pages own navigation and mutation orchestration.

## Stable extension points

The supported extension points are localized column definitions, bounded rows,
server metadata, sort events, selection events, row activation, and declared row
actions. Per-page table forks, arbitrary HTML cell renderers, index-based identity,
and unbounded client-side data loading are prohibited.

## Accessibility

The scroll region is keyboard focusable, headers remain visible while scrolling,
sortable columns expose `aria-sort`, rows activate with Enter or Space, and
selection controls have entity-specific accessible labels. Compact density keeps
native selection controls at a readable size.

## Canonical query URLs

Table URLs use `q`, `page`, `pageSize`, `sort`, `direction`, and `f.<name>`.
Only fields declared by the route are accepted. Page sizes are capped at 100,
search and filter values are capped at 200 characters, and sensitive filter names
are rejected. Legacy `search` and `filter[name]` parameters are read during
migration but are rewritten to the canonical representation.

Search updates use router replacement after a short debounce. Filter or sort
changes reset the page to one. Unrelated route parameters remain intact, which
keeps deep links compatible with route-backed drawers. URLs must never contain
tokens, credentials, sessions, authorization values, or protected payloads.

## Preferences

Column visibility, order, and density use schema version 1. The storage key
contains the authenticated user ID, tenant ID, project ID, and table identifier.
Consumers must not enable persistence until every scope value is known.
Preferences contain presentation metadata only; entity rows and filter values are
never persisted.

Required columns cannot be hidden. Only configurable columns can be hidden or
reordered. Invalid JSON, removed columns, invalid density values, and older
preference shapes are sanitized against the current column contract. Reset removes
only the current scoped key. Compact mode retains native selection targets and the
shared minimum interactive size.

## Row actions and detail routes

Each row may expose a small number of primary actions and an overflow menu for
secondary actions. Actions require localized labels, semantic variants, and an
optional capability. Capability filtering improves the interface only; every API
mutation must still enforce tenant ownership and authorization. Destructive and
high-impact actions emit `confirm-action` and must be completed through the shared
enterprise confirmation workflow with entity context.

Detail views use the `detail` query parameter and preserve table query state. IDs
are limited to safe stable identifiers. The shared drawer traps keyboard focus,
closes with Escape or its labelled close control, and restores focus to the
originating row action. Closing the drawer retains table scroll because it changes
only route query state.

## Loading, refresh, and recovery

Initial loading, empty data, filtered no-results, permission denial, recoverable
error, stale data, and partial data are separate states. Empty data may offer the
first-create action, while no-results offers filter reset. A failed background
refresh retains the last authorized rows and marks them stale; a permission denial
clears them immediately.

Every request receives an `AbortSignal`. Starting a newer search, filter, page, or
context request aborts the previous request and ignores late responses. Context
changes must call `reset` before loading the new scope. Result counts and completed
background refreshes are announced through the table live region.

## Bulk selection and operations

Page selection stores stable row IDs. Selecting all matching results is a separate
state and is allowed only after the API returns a validated, expiring query
snapshot. Selection scope includes tenant, project, table, and canonical query; a
change to any scope clears selection.

The bulk toolbar shows the impact count and only exposes operations supported by
the current capability and every selected row. High-impact operations use the
confirmation event. The client starts bounded server jobs by snapshot ID and
polls their status so completed, partial, and failed outcomes can provide recovery
guidance. The API remains responsible for rechecking tenant ownership,
authorization, snapshot expiry, and every target immediately before mutation.

Performance and accessibility thresholds are defined in
[`data-table-performance.md`](data-table-performance.md).

## Migration and rollback

Existing routes and API endpoints remain compatible. Listings move to the shared
contract one route group at a time. Until a route is migrated, its legacy
implementation remains available. Rollback consists of reverting the affected
route migration without changing persisted entity data.
