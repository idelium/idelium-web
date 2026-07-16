![Idelium](../idelium-docker/logo/idelium.png)

# Idelium Web

Idelium Web is the Vue single-page administration application for the Idelium
test automation platform. It lets users configure projects, environments,
plugins, reusable steps, test cases, cycles, execution platforms, accounts, and
customers, then inspect execution results produced by Idelium CLI.

This repository contains the browser application only. It depends on
[`idelium-api`](https://github.com/idelium/idelium-api) for authentication,
authorization, persistence, and execution services. Use
[`idelium-docker`](https://github.com/idelium/idelium-docker) for a complete
local HTTPS stack.

## Main capabilities

- Project, environment, plugin, step, test, and test-cycle management.
- Selenium test import and remote test launch workflows.
- Performed cycle, test, step, and Postman result inspection.
- Customer, account, profile, role, and API-key administration.
- Browser, operating-system, device, model, brand, and location management.
- English and Italian user-interface dictionaries.
- Cookie-based browser sessions with CSRF protection.
- Responsive components built with Vue, Pinia, Bootstrap, and Element Plus.

## Technology stack

- Vue 3 and Vue Router 4.
- Pinia for small, explicit pieces of client state.
- Vite 6 for local development and production builds.
- Axios for the centralized API client.
- Vitest, Vue Test Utils, jsdom, and V8 coverage.
- ESLint and Prettier for static checks and formatting.
- Element Plus, Bootstrap, Font Awesome, Konva, and Ace Editor for UI features.

The exact dependency graph is locked in `package-lock.json`. Always use
`npm ci` in CI and for reproducible local installs.

## Application architecture

```text
Vue views and components
        │
        ├── Pinia session and selection state
        │
        ├── domain helpers
        │
        └── centralized Axios client
                    │
                    └── HTTPS + Sanctum session + CSRF ── Idelium API
```

The router controls navigation and lazy-loads most administration views. Route
guards use a local authentication hint only to improve navigation; the API is
the authorization boundary and must validate the session, role, and tenant on
every request.

## Requirements

- Node.js 22.17.0, matching CI and the container build.
- npm with support for the committed lockfile.
- A reachable Idelium API over HTTPS for authenticated workflows.

## Quick start

Clone the repository and install the exact dependency set:

```bash
git clone https://github.com/idelium/idelium-web.git
cd idelium-web
npm ci
cp .env.example .env
```

Start the Vite development server:

```bash
npm run dev
```

Open the URL printed by Vite. When the browser hostname is `localhost`, the
current application configuration sends API requests to
`https://localhost/api/`. Start the Idelium Docker stack first, or provide an
equivalent local HTTPS API and allow the Vite origin in the API CORS settings.

The easiest integrated workflow is:

1. Start [`idelium-docker`](https://github.com/idelium/idelium-docker) in demo
   mode.
2. Run this repository with `npm run dev` when working on frontend code.
3. Accept or trust the local development certificate only in the isolated local
   environment.

## Environment variables

Copy `.env.example` to `.env`. Vite exposes variables prefixed with `VITE_` to
browser code, so they must never contain secrets.

| Variable | Purpose | Required |
| --- | --- | --- |
| `VITE_GOOGLE_SITE_KEY` | Public reCAPTCHA v3 site key used during login | No |
| `VITE_GOOGLE_TAG_ID` | Google tag identifier for analytics | No |

An empty reCAPTCHA site key disables token acquisition during login. Analytics
and reCAPTCHA configuration must use public identifiers only; private keys,
session values, customer data, and credentials must not be included in frontend
environment files or analytics events.

The API base URL is currently selected in `src/App.vue`: localhost uses the
local HTTPS stack and other hosts use the hosted service endpoint. Treat changes
to this behavior as deployment configuration changes and test both local and
deployed routing.

## Authentication and session security

The application uses Laravel Sanctum's stateful browser flow:

1. The login view requests `/api/sanctum/csrf-cookie`.
2. It sends the credentials and CSRF token to `/api/login`.
3. The API creates an opaque `Secure`, `HttpOnly`, `SameSite=Lax` session
   cookie.
4. The centralized Axios client sends credentials on API requests.
5. The first `401` response clears local UI state and returns the user to login.
6. Logout uses `POST /api/logout`, invalidates the server session, and clears
   browser state.

Browser JavaScript does not receive or persist a bearer token or session
identifier. `sessionStorage` contains only a non-sensitive authentication hint,
the selected customer and project identifiers, and a no-projects navigation
flag. These values are not trusted for authorization.

See [Web session security](docs/security/session-storage.md) for the complete
threat model and storage rules.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite with hot module replacement |
| `npm run build` | Produce the optimized static site in `dist/` |
| `npm run preview` | Serve the production build locally for inspection |
| `npm run test:unit` | Run Vitest in watch mode |
| `npm run test:coverage` | Run all tests once and enforce coverage thresholds |
| `npm run lint` | Apply safe ESLint fixes |
| `npm run lint:check` | Run non-mutating ESLint checks |
| `npm run format` | Format the maintained source and test areas |
| `npm run format:check` | Verify formatting without changing files |
| `npm run audit:dependencies` | Fail on high-severity npm audit findings |

## Tests and quality gates

Behavioral changes require focused unit or component tests. Authentication,
project selection, error handling, routing, test-cycle operations, and result
rendering are critical flows and should retain regression coverage.

Run the same non-mutating gates used by CI:

```bash
npm ci
npm run audit:dependencies
npm run lint:check
npm run format:check
npm run test:coverage
npm run build
```

Coverage is collected from the centralized services and stores, domain helpers,
router, login flow, header, and test-cycle views. The configured minimums are:

| Metric | Minimum |
| --- | ---: |
| Statements | 60% |
| Lines | 60% |
| Functions | 50% |
| Branches | 50% |

Use `npm run test:unit -- --run <path>` for a focused one-off run. Do not lower
coverage thresholds to make a behavioral change pass; add useful tests instead.

## Production build

Create an optimized build with:

```bash
npm run build
```

The generated `dist/` directory is a static artifact. Before release, inspect it
locally with:

```bash
npm run preview
```

The production web server must:

- serve `index.html` for Vue history-mode routes;
- proxy `/api/` to Idelium API without exposing internal service ports;
- terminate HTTPS with a trusted certificate;
- set an appropriate Content Security Policy and standard security headers;
- avoid caching `index.html` longer than versioned assets;
- preserve secure cookies and CSRF headers through the reverse proxy.

The supported container build and Apache configuration live in
[`idelium-docker`](https://github.com/idelium/idelium-docker). That stack pins
the Node build image and Apache runtime image and verifies the frontend through
its public HTTPS endpoint.

## Source layout

```text
src/
├── assets/       Static images, icons, and style inputs
├── components/   Shared application shell and UI components
├── domain/       Pure domain transformations
├── languages/    User-interface dictionaries
├── router/       Routes and navigation guards
├── services/     Centralized HTTP and integration services
├── shared/       Reusable helpers
├── stores/       Pinia state stores
└── view/         Feature and page-level components
tests/            Vitest unit and component tests
docs/             Security and design documentation
public/           Files copied unchanged to the build
```

Prefer focused components and pure domain helpers. Keep HTTP behavior in the
centralized API client or an appropriate service, and keep persistent client
state minimal. Do not duplicate authentication, error-normalization, or
selection logic across views.

## Accessibility and localization

New interactive controls must remain keyboard accessible, expose meaningful
labels, preserve visible focus, and communicate validation errors without
depending only on color. Add user-visible text through the language dictionaries
instead of embedding untranslated strings in templates. Documentation and
source comments remain in English even when adding localized UI copy.

## Troubleshooting

### API calls fail with CORS or CSRF errors

Confirm that the API allows the exact Vite origin, both sides use compatible
HTTPS/domain settings, the CSRF-cookie request succeeds, and credentials are
enabled. Clear stale cookies after changing session-domain configuration.

### Local certificate warning

Demo mode uses a generated self-signed certificate. Trust only the certificate
created by your isolated development stack. Production must use a certificate
issued by a trusted authority.

### A deep link returns `404`

Configure the static server to fall back to `index.html` for routes that are not
real files. The development server and the supported Docker Apache
configuration already support the SPA routing model.

### The build behaves differently from development

Run `npm run preview` against a fresh `npm run build`, inspect browser console
and network diagnostics, and verify the deployed hostname selects the intended
API origin. Never paste cookies, request credentials, or protected response
bodies into an issue.

## Contributing

Read [`AGENTS.md`](AGENTS.md) before making changes. Documentation and source
comments must be in clear English. Add tests with behavioral changes, keep
client state non-sensitive, preserve server-side authorization assumptions,
avoid unrelated formatting changes, and run all relevant quality gates before
opening a pull request.

## Related projects

- [`idelium-api`](https://github.com/idelium/idelium-api) — Laravel backend.
- [`idelium-cli`](https://github.com/idelium/idelium-cli) — test execution agent.
- [`idelium-docker`](https://github.com/idelium/idelium-docker) — reproducible
  full-stack environment.

Project information is available at [idelium.io](https://idelium.io/).
