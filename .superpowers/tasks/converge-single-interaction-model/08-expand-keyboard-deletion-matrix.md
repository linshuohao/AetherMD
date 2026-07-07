# Task 08: Expand product-path keyboard insertion/deletion matrix

Change: converge-single-interaction-model
Spec Requirement:

- validation-suite / Requirement: Keyboard interaction matrix is enforced on product path
  Source Docs:
- openspec/changes/converge-single-interaction-model/specs/validation-suite/spec.md
  Depends On: 07-vue-morphing-surface-parity
  Parallel Group: wave-4
  Barrier: true
  Allowed Files:
- e2e/playwright/tests/block-morphing.spec.ts
- e2e/playwright/fixtures/editor.ts
- .superpowers/tasks/converge-single-interaction-model/08-expand-keyboard-deletion-matrix.md
  Forbidden Files:
- packages/core/**
- packages/preset-gfm/**
- packages/react/**
- packages/vue/**
- openspec/specs/**
  Implementation Notes:
- Add product-path keyboard deletion checks using Backspace/Delete on morphing source textarea.
- Assert markdown/render sync and editor stability after consecutive keyboard edits.
  TDD Notes:
- Red: add e2e scenarios for Backspace/Delete and observe failures before helper updates.
- Green: update helpers/assertions and stabilize tests.
  Validation:
- `pnpm e2e:test -- --grep "keyboard: deletion"`
  Intuitive Verification:
- In morphing mode, edit source via keyboard and verify rendered output updates after blur.
  Review Checklist:
- Backspace and Delete are both covered
- tests assert source-to-render/markdown sync
- no editor remount during consecutive keyboard edits
  Rollback Notes:
- Revert task commit to restore previous keyboard matrix coverage.
  Version Impact: none
  Commit Scope: test(e2e)
  Status: done
  Run Log:
- Started Task 08 on branch `feature/converge-single-interaction-model`.
- Added product-path keyboard deletion E2E scenarios in `e2e/playwright/tests/block-morphing.spec.ts` for both Backspace and Delete flows.
- New checks assert source text mutation, `data-edit-synced` completion, rendered output fidelity, markdown probe sync, and editor stability on consecutive keyboard edits.
- Validation passed: `pnpm exec playwright test --config e2e/playwright/playwright.config.ts --grep "keyboard: deletion"`.
  Deviation:
- Local Playwright browser binaries were missing; installed Chromium via `pnpm exec playwright install chromium` before running targeted E2E validation.
