# Reusable step editor contract

The reusable step editor consumes the existing `stepCatalog` domain as its only
authoritative command source. It does not copy Selenium, Appium, Postman, web
service, or plugin action lists into route components.

## Versioned action catalogue

The catalogue publishes:

- the current catalogue version and minimum readable compatibility version;
- runtime groups and stable action IDs;
- an action type, runtime, plugin ID, and schema version;
- JSON-schema-compatible properties, required fields, defaults, enum and numeric
  constraints;
- localization and GitHub documentation keys;
- deprecation version and replacement action;
- Wizard, JSON, DSL, conversion, and test-execution capabilities.

Core actions are derived from the existing runtime step files. Plugin actions are
accepted only from the authorized plugin response supplied by the route. Plugin
and action identifiers are bounded and validated, field counts and enum values
are limited, and only documentation URLs under `github.com/idelium/` are retained.
Plugin source, credentials, configuration payloads, and arbitrary diagnostic
messages never enter the catalogue contract.

## Loading and compatibility

`loadStepEditorModel` first uses the shared legacy configuration normalizer and
then resolves every action through the catalogue interface. Saved configurations
without a catalogue version remain readable and receive a non-blocking migration
warning. Versions from `2026.01` through the current `2026.07` contract are in the
read compatibility window. A newer version is blocked until the Console is
updated; an older version is blocked with the minimum supported version.

Unknown action types are not guessed and receive a stable diagnostic with an
exact `steps[index]` path. Deprecated actions remain readable and expose their
replacement during the compatibility window. Malformed source opens as an
invalid JSON-mode model so the user can repair it.

An unchanged legacy model serializes to the exact original value. After a
meaningful edit, persistence writes the current catalogue version at the editor
and action levels. This keeps existing API shapes compatible while making future
migrations explicit.

## Capabilities

The model intersects action capabilities so the route enables a mode only when
every action supports it. JSON remains available as the repair and compatibility
mode. Postman and plugin actions default to no DSL support. Plugin actions also
default to no automatic conversion unless their authorized manifest explicitly
declares it.

## Rollout and rollback

The contract is introduced before replacing the current wizard UI. Existing
routes continue to persist their current configuration. Rollback removes the new
adapter and leaves all unchanged legacy payloads intact. Configurations already
saved with `catalogVersion` continue to load through the existing wizard because
unknown fields are preserved.
