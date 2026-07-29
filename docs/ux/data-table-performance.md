# Enterprise DataTable quality thresholds

These thresholds protect the shared table contract before entity migrations.
They are regression ceilings, not product targets.

| Scenario                                               | CI ceiling |
| ------------------------------------------------------ | ---------: |
| 1,000 route/filter/sort/pagination contract operations |     500 ms |
| Render 1,000 rows in jsdom                             |   3,000 ms |
| Build a 1,000-row page selection                       |     250 ms |
| Maximum local rows and all-results snapshot targets    |      1,000 |
| Maximum server page size                               |        100 |

CI uses deterministic fixtures containing 0, 1, 100, 1,000, 1,100, and malformed
records. The 1,100-row fixture proves that local rendering remains capped at 1,000.
Production entity listings use server pagination and should normally render no
more than 100 rows.

## Accessibility matrix

Automated component checks cover accessible table names, sticky semantic headers,
`aria-sort`, keyboard-focusable rows and scroll regions, entity-specific selection
labels, live result announcements, compact density, empty/no-results/error states,
and focus restoration. Manual release checks cover 200% browser zoom and current
stable Chrome, Firefox, Safari, and Edge on desktop, plus current Safari iOS and
Chrome Android for horizontal overflow and touch targets.

## Reproduction

Run:

```bash
npm run test:unit -- --run tests/enterprise-data-table.performance.spec.js tests/enterprise-data-table.accessibility.spec.js
```

Timing failures must be reproduced on the standard CI runner before changing a
ceiling. A ceiling change requires an English rationale in this document. Request
cancellation and stale-response behavior are covered separately by
`enterprise-grid-loader.spec.js`.
