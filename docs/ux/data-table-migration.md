# Enterprise DataTable migration matrix

This matrix records the UX-03 route migrations and the bounded API contract used
by each listing. The shared `EnterpriseDataTable` remains the default for flat
entity catalogues. A specialized presentation is allowed only when the user task
is hierarchical and the exception is documented here.

| Route group  | Presentation                               | Server contract                    | Canonical state                                  | Notes                                                                                                                                    |
| ------------ | ------------------------------------------ | ---------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Projects     | Shared DataTable                           | Page, search, sort, total          | `q`, `page`, `pageSize`, `sort`, `direction`     | Tenant-scoped API fields                                                                                                                 |
| Customers    | Shared DataTable                           | Page, search, sort, total          | Canonical grid query                             | API keys are never returned                                                                                                              |
| Accounts     | Shared DataTable                           | Page, search, sort, total          | Canonical grid query                             | Tenant and role checks remain server-side                                                                                                |
| Steps        | Shared DataTable                           | Page, search, sort, total          | Canonical grid query                             | Reordering includes the server page offset                                                                                               |
| Environments | Shared DataTable                           | Page, search, sort, total          | Canonical grid query                             | Configuration payloads are excluded from rows                                                                                            |
| Plugins      | Shared DataTable                           | Page, search, sort, total          | Canonical grid query                             | Source code is excluded from rows                                                                                                        |
| Platforms    | Shared DataTable                           | Page, search, filter, sort, total  | Canonical grid query and `f.*` filters           | Reference lookups retain their legacy array response when grid parameters are absent                                                     |
| Executions   | Specialized three-level execution explorer | Bounded cycle, run, and test pages | Cycle, run, test, page, and analytics query keys | Documented exception: replacing the cycle → run → test hierarchy with one flat table would remove required context and nested navigation |

## Execution explorer exception

Execution history is not a flat entity listing. It is a three-stage investigation
workflow in which a test cycle selects a run and a run selects its performed
tests. The route therefore keeps the specialized explorer, but every stage uses a
bounded server page, stable identifiers, keyboard-native buttons, localized
labels, explicit empty states, and reload-safe URL state. This is the documented
UX-03 blocker for rendering execution history through one shared flat table; it
does not exempt the route from the shared grid data, accessibility, or security
contracts.

## Compatibility and rollback

API endpoints return the original array response when `page` and page-size
parameters are absent. Migrated web routes always request a bounded page. This
allows older supported clients to continue operating while the web application
uses the enterprise contract.

Rollback is code-only: revert the route component to its previous renderer and
omit grid query parameters. No persisted entity data or schema migration is
involved.

## Security review

- Tenant-owned listings are scoped by the authenticated customer and project in
  the API before search, filter, sort, or pagination is applied.
- The platform catalogue remains a global administrative catalogue and preserves
  its existing role authorization behavior.
- Listing responses exclude credentials, API keys, configuration bodies, plugin
  source, and protected execution payloads.
- URL state accepts only declared filter and sort fields and rejects sensitive
  query-key names.
