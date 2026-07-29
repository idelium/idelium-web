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

## Migration and rollback

Existing routes and API endpoints remain compatible. Listings move to the shared
contract one route group at a time. Until a route is migrated, its legacy
implementation remains available. Rollback consists of reverting the affected
route migration without changing persisted entity data.
