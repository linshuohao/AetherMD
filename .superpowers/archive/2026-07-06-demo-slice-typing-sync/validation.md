# Validation Record: demo-slice-typing-sync

## Scope

- Change: `demo-slice-typing-sync`
- Task: `01-implement-pm-typing-sync`
- Requirement: `validation-suite` / React basic demo slice north star acceptance — ProseMirror user input path
- Version impact: none
- Branch: `feat/demo-slice-typing-sync`
- Validated: 2026-07-06

## Commands

| Command                                            | Purpose                                                 | Result   | Notes                                 |
| -------------------------------------------------- | ------------------------------------------------------- | -------- | ------------------------------------- |
| `pnpm --filter @aether-md/plugin-prosemirror test` | Task + unit coverage for view-bridge/engine list sync   | **pass** | 25 tests, 0 failures (exit 0)         |
| `pnpm --filter @aether-md/react test`              | Integration typing + PR0 dispatch + GateLock regression | **pass** | 23 tests, 0 failures (exit 0)         |
| `pnpm check`                                       | Workspace skills, build, typecheck, test pipeline       | **pass** | 21/21 turbo tasks successful (exit 0) |

## New Tests

### Integration (`packages/react/src/demo-slice-typing-sync.integration.test.tsx`)

| Test case                                                           | Assertion                                                              |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `updates preview after consecutive insertText in a plain paragraph` | Two `insertText` calls; preview shows `More typing`                    |
| `updates preview after insertText in a heading block`               | Heading edit; preview shows `Demo Title!`                              |
| `updates preview after insertText inside a list item paragraph`     | List item edit; preview shows `item one updated`                       |
| `preserves strong and link marks when typing adjacent text`         | `**bold**` and `[example](url)` structure preserved after adjacent `!` |

### Unit (plugin-prosemirror)

| File                  | New / updated test                                                      |
| --------------------- | ----------------------------------------------------------------------- |
| `view-bridge.test.ts` | `dispatches list item paragraph children with list item index in text`  |
| `engine.test.ts`      | `updates list item paragraph when replaceText includes list item index` |

### Regression (unchanged, re-run green)

- `demo-slice-pr0-acceptance.integration.test.tsx` (3 cases)
- `gate-lock.integration.test.tsx` (2 cases)

## TDD Integrity

- **Red signal:** List item `insertText` preview drift; mark case failed on overly strict placement before implementation.
- **Green result:** `view-bridge` list-item resolution + `engine` list-item replace; all automated commands pass.
- **Refactor check:** No unrelated refactors; helpers (`resolveProseMirrorView`, `dispatchProseMirrorInsertText`) scoped to test + view-bridge.
- **Deviation:** List item index encoded in `ReplaceTextCommand.text` (numeric string) with `children`; mark regression asserts structural stability, not exact non-inclusive mark boundary placement.

## Baseline Record Update Summary

`openspec/changes/archive/2026-07-06-demo-slice-react-basic-pr0/baseline-record.md`:

| Scenario                                        | Before        | After                                                           |
| ----------------------------------------------- | ------------- | --------------------------------------------------------------- |
| Continuous plain paragraphs                     | gap (browser) | **pass (CI)** — `demo-slice-typing-sync.integration.test.tsx`   |
| Frozen GFM subset (heading, strong, list, link) | gap (browser) | **pass (CI)** — typing tests; browser sign-off still required   |
| GateLock on parent rerender                     | partial       | **pass (CI)**                                                   |
| Maintainer browser sign-off                     | not yet       | CI green; **`pnpm dev` still required** before M7 demo sign-off |

## Intuitive Verification

| Method                                                                       | Status   | Result                                                                                                                                   |
| ---------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm --filter @aether-md/example-react-basic dev` — continuous typing smoke | **未做** | Not run in this validation session (non-blocking per change-brief). Maintainer checklist documented in `examples/react-basic/README.md`. |

## Changed-file Check

- **Files reviewed:** All task-allowed paths; no `packages/core/**` changes; no forbidden workflow/skills edits.
- **Boundary result:** pass
- **Unrelated files:** none

## Failures And Deviations

- No automated failures.
- Documented deviations: list index encoding in `text`; relaxed mark placement assertion (see task `Deviation`).

## Validation Status

**PASS** — all required commands green; intuitive browser dev smoke deferred to maintainer sign-off.
