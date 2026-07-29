# Idelium Console design system

The Idelium Console design system provides semantic tokens and focused Vue
primitives for consistent enterprise workflows. Documentation and source comments
are written in English; user-facing copy is supplied by the existing English and
Italian localization files.

## Principles

- Use Idelium orange for the dominant page action, not for success state.
- Use green for successful state, blue for information or running state, amber for
  warnings, and red for destructive state.
- Keep labels visible after a value is entered.
- Never communicate state by color alone.
- Provide every interaction through keyboard as well as pointer input.
- Never render or log credentials, tokens, sessions, authorization headers, or
  unredacted protected payloads.
- Keep client capability checks as presentation logic; the API remains the
  authorization authority.

## Tokens

Tokens live in `src/styles/_design-tokens.scss`. Components consume `--id-*`
semantic variables. Raw colors are allowed only inside the token definition or a
documented legacy compatibility layer.

Token groups include surfaces, text, borders, semantic actions and states,
typography, spacing, shape, elevation, focus, and motion. Motion is effectively
disabled when the operating system requests reduced motion.

## Components

### `IdButton`

Use `primary` once for the dominant page action. Use `secondary` or `ghost` for
supporting actions, `warning` for a risky reversible action, and `danger` for a
destructive action. `loading` disables duplicate submission and exposes
`aria-busy`. An icon-only button requires `accessibleLabel`.

### `IdFormField`

The default slot receives `inputId`, `describedBy`, and `invalid`. Apply these to
the actual input:

```vue
<IdFormField
  label="Environment code"
  helper-text="Unique value used by CLI and pipelines."
  required
  v-slot="{ inputId, describedBy, invalid }"
>
  <input
    :id="inputId"
    :aria-describedby="describedBy"
    :aria-invalid="invalid"
  />
</IdFormField>
```

Errors are displayed next to the field with `role="alert"`. Secret controls must
pass references or masked metadata, never complete server-resolved secrets.

### `IdFeedbackState`

Supported states are `loading`, `empty`, `no-results`, `error`, `permission`, and
`stale`. The caller supplies localized title, message, and optional action label.
Use an error state for a failed initial load and a stale state when authorized data
remains visible after a failed refresh.

### `IdTooltip`

The scoped slot exposes `describedBy`. Apply it to the interactive control.
Tooltips supplement an accessible name; they do not replace one.

### `EnterpriseDialogHost`

Use the existing `$showAlert` and `$showConfirm` interfaces. The host traps focus,
supports Escape, starts confirmation focus on the safe action, and restores focus
after closing. Critical confirmation copy must name the affected entity and the
consequence.

## Prohibited patterns

- `window.alert`, `window.confirm`, and `window.prompt`.
- Placeholder-only field descriptions.
- Icon-only actions without an accessible name and tooltip.
- Complete secrets in DOM attributes, URLs, browser storage, logs, telemetry, or
  test snapshots.
- New component-local semantic colors.
- Hover-only actions.

## Verification

Run:

```shell
npm run check:design-tokens
npm run lint:check
npm run format:check
npm run test:unit -- --run
npm run build
```

The design-token check covers new shared UI components. Existing legacy styles are
migrated incrementally and removed only after their final consumer is verified.
