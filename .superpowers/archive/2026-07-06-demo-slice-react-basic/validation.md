# Validation: demo-slice-react-basic

Change: demo-slice-react-basic
Task: 01-implement-pr0-demo-slice-acceptance
Date: 2026-07-06

## Commands

| Command                                                  | Result                                           |
| -------------------------------------------------------- | ------------------------------------------------ |
| `pnpm --filter @aether-md/react test`                    | pass (19 tests, incl. demo-slice-pr0-acceptance) |
| `pnpm --filter @aether-md/example-react-basic typecheck` | pass                                             |
| `pnpm check`                                             | see below                                        |

## Files changed

- `packages/react/src/demo-slice-pr0-acceptance.integration.test.tsx` (new)
- `examples/react-basic/src/App.tsx` (GFM initial markdown)
- `openspec/specs/validation-suite/spec.md` (sync)
- `openspec/changes/demo-slice-react-basic-pr0/baseline-record.md` (status update)
- `docs/engineering/demo-slice-delivery-program.md` (phase update)

## Deviations

- Browser `pnpm dev` manual walk not recorded in agent session; CI integration test mirrors `react-basic` Shell instead of Playwright.

## Outcome

PR A implementation complete pending compliance review and archive.
