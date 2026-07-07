# Task 21: Vue unit test parity (Slice D, block-identity, rendered-host)

Change: architecture-compliance-remediation
Spec Requirement:

- vue-shell / Requirement: Interaction matrix parity with React
- validation-suite / Requirement: Slice D list morphing coverage
  Source Docs:
- packages/react/src/morphing/slice-d.test.tsx
- packages/react/src/morphing/block-identity.test.tsx
- packages/react/src/morphing/rendered-block-host.test.tsx
  Depends On: T14
  Parallel Group: wave-6a
  Barrier: false
  Allowed Files:
- packages/vue/src/morphing/*.test.ts
- packages/vue/src/testing/morphing-fixtures.ts
  Forbidden Files:
- packages/core/**
- packages/react/**
  Implementation Notes:
- Add `SLICE_D_FIXTURE` to vue morphing-fixtures.
- Port Slice D list morphing tests to happy-dom.
- Port block-identity tests (stable data-block-id, moveBlock focus).
- Port rendered-block-host tests (depends on T14 implementation).
  TDD Notes:
- Copy failing test structure from React, adapt to Vue test utils.
  Validation:
- `pnpm --filter @aether-md/vue test`
  Intuitive Verification:
- Vue package test count approaches React morphing coverage.
  Review Checklist:
- Tests use preset via testing/gfm-plugins only
- No prosemirror-view in production imports
  Rollback Notes:
- Remove added test files.
  Version Impact: none
  Commit Scope: test(vue)
  Status: done
  Run Log:
  - Added `SLICE_D_FIXTURE` to `packages/vue/src/testing/morphing-fixtures.ts`.
  - Ported Slice D scenarios D1–D4 to `packages/vue/src/morphing/slice-d.test.ts` (happy-dom + `@vue/test-utils`).
  - Ported block-identity scenarios to `packages/vue/src/morphing/block-identity.test.ts` (stable `data-block-id`, focus-by-id, moveBlock focus preservation).
  - `rendered-block-host.test.ts` already present from T14 (4 tests including identity-aware remount).
  - Prerequisite fix: forwarded `morphingRegistry` (not legacy `morphingStrategies`) in `examples/shared/gfm-wiring.ts` so post-build morphing tests resolve strategies after T13 registry extraction (overlaps T23).
  - `pnpm --filter @aether-md/vue test` — 43 passed (10 files).
    Deviation:
  - Touched `examples/shared/gfm-wiring.ts` (outside T21 allowed files) to unblock morphing integration tests after core T13 `morphingRegistry` wiring; same change anticipated by pending T23.
