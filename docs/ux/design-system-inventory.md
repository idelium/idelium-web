# Idelium Console design-system inventory

This inventory establishes the baseline for roadmap epic UX-01. It is intentionally
limited to reusable primitives and migration risk; feature workflow redesign belongs
to the later roadmap epics.

## Supported verification matrix

| Area           | Baseline                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------ |
| Browsers       | Current stable Chrome, Firefox, Edge, and Safari                                           |
| Desktop widths | 1280 px, 1440 px, and 1920 px                                                              |
| Zoom           | 100%, 125%, 200%                                                                           |
| Input          | Keyboard, pointer, and touch-capable pointer                                               |
| Accessibility  | Visible focus, semantic landmarks, accessible names, error association, and reduced motion |
| Languages      | English and Italian                                                                        |

## Primitive inventory

| Primitive            | Current state                                                  | Target                                               | Migration risk                      |
| -------------------- | -------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------- |
| Visual tokens        | CSS variables mixed with raw colors and SCSS variables         | Semantic tokens in `_design-tokens.scss`             | High: broad CSS cascade             |
| Buttons              | Bootstrap classes and page-specific variants                   | `IdButton`                                           | Medium: action hierarchy            |
| Form fields          | Native controls, placeholders, and modal-specific labels       | `IdFormField` plus existing controls                 | High: validation and IDs            |
| Feedback states      | Page-specific empty/loading/error markup                       | `IdFeedbackState`                                    | Medium                              |
| Tooltips             | Native titles and inconsistent custom behavior                 | `IdTooltip`                                          | Medium: accessible association      |
| Confirmation dialogs | Shared event host plus legacy Bootstrap modals                 | `EnterpriseDialogHost`                               | High: focus and destructive actions |
| Toasts               | Third-party global plugin                                      | A future adapter over the approved feedback contract | Medium                              |
| Tables               | Legacy Bootstrap tables and an enterprise-grid domain contract | UX-03 shared DataTable                               | High: server pagination             |
| Selects              | Native select, vue-select, and Element Plus                    | A shared select adapter in form migration            | High                                |
| Tabs                 | Bootstrap markup repeated by routes                            | Shared route-backed tabs in UX-02                    | Medium                              |

## High-risk consumers

1. Step, test, and test-cycle builders because they combine drag state, validation,
   modals, and unsaved work.
2. Environment and plugin editors because they include raw JSON or source content.
3. Credential and account administration because actions are security-sensitive.
4. Execution details because large and legacy result shapes must remain inspectable.

## Rollout order

1. Adopt tokens and shared primitives in new work.
2. Migrate security-sensitive dialogs and fields.
3. Migrate the app shell and route-backed controls.
4. Migrate feature editors as their roadmap epic is implemented.
5. Remove a legacy style only after its final consumer is verified.

Baseline artifacts must use synthetic data and must never contain credentials,
customer payloads, authorization headers, or session identifiers.
