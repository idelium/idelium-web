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

## Rollout and rollback

The versioned loader can be introduced before route migration because unchanged
legacy payloads round-trip exactly. Rollback continues to read those legacy
payloads. Environments already saved in the versioned envelope require the
documented compatibility adapter; no automatic destructive downgrade is
allowed.
