# Task 22: React focus FSM same-block early return guards

Change: architecture-compliance-remediation
Spec Requirement:

- react-shell / Requirement: Block Focus state machine without redundant transitions
  Source Docs:
- packages/vue/src/morphing/morphing-focus-context.ts (reference guard)
  Depends On: none
  Parallel Group: wave-6a
  Barrier: false
  Allowed Files:
- packages/react/src/morphing/morphing-focus-context.tsx
- packages/react/src/morphing/morphing-block-surface.tsx
- packages/react/src/morphing/interaction-matrix.test.tsx
  Forbidden Files:
- packages/vue/**
- packages/core/**
  Implementation Notes:
- Add same-block early return in `requestFocus()` matching Vue.
- Guard `handleFocus` in morphing-block-surface when block already focused.
- Add regression test for repeated focus events.
  TDD Notes:
- Red: test that double-focus does not re-run commit queue.
- Green: implement guards.
  Validation:
- `pnpm --filter @aether-md/react test`
  Intuitive Verification:
- Repeated click on focused block does not flicker source surface.
  Review Checklist:
- Vue/React focus semantics aligned
  Rollback Notes:
- Revert focus context changes.
  Version Impact: none
  Commit Scope: fix(react)
  Status: done
  Run Log:
  - Added same-block early return in `requestFocus()` (`focusedBlockIdRef.current === blockId`).
  - Guarded `handleFocus` in `MorphingBlockSurface` when `focusContext.focusedBlockId === blockId`.
  - Added regression test covering commit-queue spy (`MorphingFocusProvider`) and product-path repeated source focus stability.
  - Validation: `pnpm --filter @aether-md/react test` — 58/58 passed.
    Deviation:
