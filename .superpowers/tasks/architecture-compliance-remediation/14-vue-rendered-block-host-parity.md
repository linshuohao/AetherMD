# Task 14: Vue RenderedBlockHost identity-aware update/remount

Change: architecture-compliance-remediation
Spec Requirement:

- vue-shell / Requirement: RenderedBlockHost stability on block updates
- product-experience / Requirement: Zero-latency typing — unrelated blocks must not remount unnecessarily
  Source Docs:
- docs/architecture/product-experience-spec.md
- packages/react/src/morphing/rendered-block-host.tsx (reference implementation)
  Depends On: none
  Parallel Group: wave-6a
  Barrier: false
  Allowed Files:
- packages/vue/src/morphing/rendered-block-host.ts
- packages/vue/src/morphing/render-fallback-view.ts (create if needed)
- packages/vue/src/morphing/rendered-block-host.test.ts (create)
  Forbidden Files:
- packages/core/**
- packages/preset-gfm/**
- packages/react/**
  Implementation Notes:
- Port React `RenderedBlockHost` identity tracking: `blockId` + `blockType` refs, `renderer.update()` path, remount only when identity changes or update unavailable.
- Use shared `RenderFallbackView` pattern with `role="alert"` and consistent test ids.
- Add unit tests: mount, update via `renderer.update`, remount on identity change, fallback on mount error.
  TDD Notes:
- Red: failing test that block content update calls `renderer.update` without `replaceChildren`.
- Green: implement identity-aware logic matching React.
  Validation:
- `pnpm --filter @aether-md/vue test`
  Intuitive Verification:
- Non-focused block edits do not flash full DOM replacement in morphing demo.
  Review Checklist:
- No GFM syntax logic added
- Matches React rendered-block-host.test.tsx scenarios
  Rollback Notes:
- Revert rendered-block-host.ts to prior replaceChildren-on-any-change behavior.
  Version Impact: none
  Commit Scope: fix(vue)
  Status: done
  Run Log:
  - Ported React identity-aware mount/update/remount logic to `rendered-block-host.ts` using `mountedIdentityRef`, sync cleanup watch on identity/renderer change, and `applyBlockChange` update path.
  - Created `render-fallback-view.ts` with `role="alert"` and matching test ids (`morphing-render-fallback`, `morphing-render-fallback-message`).
  - Added `rendered-block-host.test.ts` with 4 tests: fallback on mount error, successful mount, update without remount on same identity, remount on identity change.
  - Validation: `pnpm --filter @aether-md/vue test` — 8 files, 36 tests passed.
    Deviation:
