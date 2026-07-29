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

## Responsive editor shell

`StepEditorShell` keeps the Action catalogue, Sequence canvas, and Properties
inspector in that accessible DOM order. Desktop uses three internally scrolling
panels and two visible separators. Separators support pointer dragging and
Left/Right Arrow resizing, expose their percentage through separator ARIA values,
and clamp catalogue and inspector widths between 18% and 35% so the sequence
keeps usable space.

The shell height is bounded to the dynamic viewport and owns internal scrolling;
it does not increase the document height as catalogue or form content grows. At
960 CSS pixels or less—including the effective layout at 200% zoom—the panels
become a tabbed list/detail fallback. All slot components remain mounted under
`v-show`, preserving parent-owned active action, form values, focus identity, and
unsaved registration while the layout changes. Arrow keys cycle through the
three tabs.

Code modes provide an explicit full-screen button and Escape exit. Full screen
uses the same mounted slots, so source text is not recreated. Resize observers,
pointer listeners, and transient resize state are removed on unmount. Every
control is permanently visible and keyboard reachable; no operation depends on
hover.

## Action catalogue

`ActionCatalog` consumes the versioned contract instead of maintaining a
component-specific action list. It groups core and plugin actions, searches
localized labels and descriptions together with stable technical names and
tags, and reports runtime-version incompatibilities before mutation. Unsupported
actions remain discoverable for compatibility diagnostics but cannot be added.
Every action links to English documentation hosted in an Idelium GitHub
repository; external plugin data cannot introduce arbitrary documentation
origins.

The catalogue accepts a bounded action collection and query, never loads tenant
data by itself, and emits only the selected catalog contract. The containing
route remains responsible for authorization and tenant-scoped persistence.

## Schema-driven property forms

`SchemaActionForm` maps the selected action schema to shared form-field, enum,
boolean, number, text, secret-reference, locator, JSON, and list controls.
Required fields, defaults, patterns, ranges, conditional visibility, and
contextual help use the same contract for every runtime. Conditional controls
stay mounted in the model so switching a controlling value does not discard a
previously valid value.

Validation diagnostics contain only a stable code, field name, action position,
and localization key. They never contain the submitted value, which is
particularly important for secret-reference fields. Secret values cannot be
entered into these fields: authors select only a bounded secret identifier.
Unknown legacy properties are retained separately and merged back during
serialization, providing a non-destructive rollback path for compatible schema
extensions.

## Wizard mode

`WizardStepEditor` composes the shared `SequenceBuilder`,
`SequenceValidationPanel`, and `SequenceSaveBar`. Authors can add, configure,
duplicate, multi-select, remove, and reorder actions without drag-and-drop.
Action instance identities remain stable across reorder, so the open properties
inspector continues to address the same action. Duplicates receive a deterministic
instance identity and every rendered sequence child uses that identity as its
Vue key.

The inspector shows the action number, runtime, summary, failure behavior,
screenshot policy, and field-level diagnostics. The save action remains disabled
until sequence validation and required warning acknowledgements pass. A bounded
history supplies undo and redo; the initial value is retained for discard and
dirty comparison. Dirty editors register a `beforeunload` safeguard and remove
it on unmount. Parent routes remain responsible for tenant-authorized save
requests and server conflict handling.

## JSON mode

`SafeJsonStepEditor` uses the same serialized model as Wizard mode and provides
JSON syntax highlighting, line numbers, bounded viewport sizing, formatting,
and explicit Apply. Editing source never mutates the durable parent model.
Temporarily invalid source retains the last valid parsed model; only a valid,
schema-compatible, changed source enables Apply. Formatting uses JSON
serialization without sorting object keys or semantically ordered arrays.

The parser limits source to one megabyte, 50 nesting levels, and 20,000 values.
Syntax and schema diagnostics include a stable path, line, column, localization
key, and remediation key. Diagnostics never contain submitted values. Inline
credentials and secrets are rejected; a field ending in `Ref` may contain only a
bounded secret-reference identifier. Rollback to Wizard mode therefore restores
the last durable model rather than incomplete JSON text.

## DSL mode

`DslStepEditor` integrates the existing versioned DSL parser and stable lint
codes. The editor preserves the author's source text, exposes bounded
line-numbered editing, and requires explicit Apply. Empty, legacy-version,
malformed, insecure, secret-bearing, and oversized fixtures are rejected without
changing the durable source. The current DSL contract accepts version `1.0` and
limits source to 500,000 bytes.

Completions are derived only from the already authorized action catalog, limited
to 200 entries, and contain an action identifier, insertion text, runtime, and
GitHub documentation URL. Environment variables, tenant payloads, and
credentials are not completion inputs. Catalog checks report unsupported
actions and runtime incompatibility before save. The UI localizes diagnostic
codes but keeps each stable code, line, column, severity, and remediation
available for support and automation.

## Mode conversion

Every representation change first creates a conversion plan. The plan classifies
each action or source construct as preserved, normalized, lossy, or unsupported
and reports an exact action index or source location. Unsupported constructs
block conversion. Lossy constructs—such as DSL comments that have no Wizard or
JSON representation—require explicit acknowledgement.

Cancellation does not mutate the model, source, or active mode. A successful
conversion retains an in-memory recovery snapshot containing the exact previous
mode and source. Recovery content is not displayed in diagnostics or logs.
Wizard-to-JSON-to-Wizard round trips preserve action configuration; JSON
formatting may be normalized. DSL conversion without a parser-produced action
model is blocked rather than guessing or silently dropping source constructs.

## Step testing and update impact

`StepTestPanel` sends only the step, authorized environment, compatible target,
runtime, and bounded timeout identifiers to a caller-provided server executor.
Environment credentials and resolved secret values never enter the request or
browser result. Client cancellation uses an abort signal; passed, validation
failed, timed out, cancelled, and target unavailable states remain distinct.
Returned logs are bounded and redacted. Artifacts expose only bounded metadata,
never inline binary or response payloads.

Impact responses are filtered by the active tenant, limited to 50 entries per
page, and expose only consumer ID, safe name, type, and pinned version. Tests,
cycles, and schedules are visible before update. The governance policy controls
whether the author may publish a new immutable version, update the current
draft, or choose between both. The API remains authoritative for tenant
ownership, target authorization, execution, impact retrieval, and policy
enforcement.

## Rollout and rollback

The contract is introduced before replacing the current wizard UI. Existing
routes continue to persist their current configuration. Rollback removes the new
adapter and leaves all unchanged legacy payloads intact. Configurations already
saved with `catalogVersion` continue to load through the existing wizard because
unknown fields are preserved.
