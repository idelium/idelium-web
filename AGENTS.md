# Idelium Web Directives

These rules extend the workspace-level Idelium engineering directives.

## Directives

1. **Use English for documentation and source-code comments.** This includes Vue
   component comments, JavaScript comments, test descriptions, UI developer notes,
   accessibility text, and diagnostics intended for maintainers.
2. **Centralize authentication and API access.** Use one configured HTTP client and
   one session store for authorization headers, `401` handling, errors, and request
   cancellation. Do not duplicate this logic in components.
3. **Do not treat client-side state as authorization.** Route guards improve user
   experience but never replace server-side access control. Prefer secure,
   `HttpOnly`, `Secure`, and appropriate `SameSite` cookies when supported by the
   API architecture.
4. **Do not expose sensitive data.** Never log tokens, sessions, passwords, API
   keys, customer data, or complete API responses containing protected data.
5. **Keep components focused.** Extract reusable composables, stores, and child
   components when a view coordinates unrelated responsibilities. Business rules
   must not be hidden in templates.
6. **Test user-critical flows.** Maintain automated coverage for login, logout,
   customer/project selection, test creation, cycle execution, and authorization
   failures. Every fixed UI bug needs a regression test.
7. **Preserve accessibility and localization.** Interactive controls require
   keyboard support and accessible names. New user-facing text must use the
   localization mechanism rather than being hard-coded in a component.
8. **Keep checks non-mutating in CI.** CI lint and format commands must report
   differences without rewriting files. Formatting fixes belong in a separate
   developer command.

## Required verification

- Run unit and component tests.
- Run lint and formatting checks without automatic changes.
- Produce a successful production build.
- Smoke-test the main authenticated route and the login route.
