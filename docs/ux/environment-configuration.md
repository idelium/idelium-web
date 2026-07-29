# Enterprise environment configuration

## Contract

Idelium Console uses the versioned `2026.07` environment contract for Web and
Selenium, Mobile and Appium, and API and Postman configurations. Each family
defines sections, fields, required values, defaults, constraints, capabilities,
and English GitHub documentation. Versions from `2026.01` through the current
contract are readable.

The initial template catalog contains:

- local browser;
- Selenium Grid;
- Android with UiAutomator2;
- iOS with XCUITest;
- externally managed Appium;
- API and Postman.

Templates use local endpoints, `example.invalid`, or `idelium.org` demonstration
URLs. They never contain provider usernames, passwords, tokens, authorization
headers, or resolved secret values.

## Legacy compatibility

Existing unversioned Web, Appium, and Web service JSON remains readable. The
loader infers the supported family from the route hint or stable legacy fields,
keeps the exact persisted source, and emits a migration warning. An unchanged
legacy environment serializes to its original shape. The current versioned
envelope is written only after a meaningful change:

```json
{
  "schemaVersion": "2026.07",
  "type": "web",
  "config": {}
}
```

A schema version newer than the Console or older than the compatibility window
is blocked. Its original source and configuration remain available for recovery;
the loader never guesses a downgrade or discards unknown values.

## Security and ownership

Schemas and templates contain configuration metadata only. Tenant ownership,
environment authorization, secret-reference resolution, provider capabilities,
and persistence remain API responsibilities. Future form and preview layers must
consume secret identifiers rather than resolved values and must not include
protected values in diagnostics, exports, logs, screenshots, or telemetry.

## Sectioned form

`EnvironmentSchemaForm` renders persistent labels and help through the shared
form-field control. Identity and runtime precede schema-defined connection,
browser, device, and API sections. Variable and secret-reference sections are
enabled by schema capabilities. Raw JSON remains collapsed under Advanced and
is not the primary editing path; sensitive legacy keys are redacted before that
source is displayed.

Validation associates a stable code with an exact field path and section.
Required and optional fields are explicit, and the sticky save bar remains in
the viewport at reduced widths and 200% zoom. Changing environment family first
computes incompatible fields. The current type and values remain unchanged when
the author cancels; confirmation removes only the listed incompatible values and
applies target defaults. Inline secret fields block save and diagnostics never
contain their values.

## Variable inheritance

Execution variables use the versioned `environment.variables.v1` contract and a
deterministic precedence order: project defaults, environment overrides, then
launch-time overrides. A layer may not replace a variable whose effective
definition disables overrides. Duplicate names within a layer, forbidden
overrides, missing references, dependency cycles, malformed records, and
cross-customer records block execution with stable diagnostics.

The effective-variable table shows name, source, type, override history,
validation state, and a safe preview. Secret variables persist only an
authorized reference identifier. Their values and any derived value that
depends on them are masked; diagnostics, previews, and serialized Console
payloads never contain resolved secret material.

The adapter preserves the three explicit layers used by current persisted
environments and CLI launch parameters. Existing configurations without the
version marker remain readable through the environment compatibility loader.
The API must revalidate customer ownership and variable policy before execution;
the Console resolver is a deterministic preview and not an authorization
boundary.

## Rollout and rollback

The versioned loader can be introduced before route migration because unchanged
legacy payloads round-trip exactly. Rollback continues to read those legacy
payloads. Environments already saved in the versioned envelope require the
documented compatibility adapter; no automatic destructive downgrade is
allowed.
