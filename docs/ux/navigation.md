# Idelium Console navigation architecture

This document defines the app-shell and context-navigation contract introduced by
roadmap epic UX-02.

## Information architecture

The authenticated sidebar uses four stable groups:

1. **Execution** — execution history and test launcher.
2. **Authoring** — test cycles, tests, and reusable steps.
3. **Resources** — plugins, environments, platforms, and execution targets.
4. **Administration** — projects, customers, accounts, and credentials.

The server-provided menu remains the source for available entries. An optional
capability on a menu item can further suppress an unavailable entry, but this is
presentation logic only. The API must authorize every read and mutation.

## Canonical routes

Project-owned resources use:

```text
/projects/:projectId/<section>/<optional-tab-or-detail>
```

Legacy unscoped routes redirect to the selected project. Direct entry and refresh
must resolve the project from the path before feature data is loaded. Missing or
unauthorized IDs must not disclose whether another tenant owns the resource.

Tabs, filters, and detail selections should use path or safe query parameters when
they need to survive refresh or be shared. Credentials, secrets, authorization
data, and protected payload values must never appear in a URL.

## Context state

The session store owns:

- selected customer ID;
- selected project ID;
- currently authorized customer and project catalogs;
- effective presentation capabilities.

Only selected non-sensitive IDs and authentication state are persisted in
per-tab session storage. Context catalogs and capabilities are refreshed from the
API and are never treated as authorization.

Context changes cancel or invalidate previous-context feature requests. A feature
must not let a stale response replace current-context data.

## Unsaved changes

Editors register a stable source ID with the navigation store when meaningful
changes exist and clear it after durable save or explicit discard. Route changes,
project/customer changes, logout, and browser exit consult this registry.

The shared confirmation offers:

- stay on the current page;
- discard registered changes and continue.

A failed save does not clear dirty state. Multiple editors remain independently
registered.

## Accessibility and responsive behavior

- A skip link moves focus to the main content landmark.
- Exactly one sidebar entry exposes `aria-current="page"`.
- Group headings remain visible in expanded navigation.
- At widths up to 900 px, navigation becomes an overlay drawer.
- Breadcrumbs expose the project hierarchy and current section.
- Context controls are searchable custom selects with persistent labels.
- Focus, keyboard behavior, and reduced motion follow the design-system contract.

## Rollback

Legacy project redirects and existing route names remain compatible. The new shell
can be rolled back without changing persisted entity data or API payloads. New
editors must still clear their dirty registration during teardown when the
navigation store is rolled back.
