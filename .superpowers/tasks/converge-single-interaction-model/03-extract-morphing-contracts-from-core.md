# Task 03: Extract morphing/DOM contracts out of Core public API

Change: converge-single-interaction-model
Spec Requirement:

- core-bootstrap / Requirement: Core public API remains morphing-agnostic and DOM-agnostic
- gfm-preset / Requirement: GFM preset owns morphing strategy contracts
  Source Docs:
- docs/architecture/principles.md
- docs/architecture/architecture-optimization-principles.md
- docs/sdk/custom-block-renderer.md
  Depends On: 01-cleanup-convergence-baseline
  Parallel Group: wave-2
  Barrier: false
  Allowed Files:
- packages/core/src/index.ts
- packages/core/src/morphing/**
- packages/core/src/editor/types.ts
- packages/core/test-d/**
- packages/core/src/**/*.test.ts
- packages/preset-gfm/src/morphing/**
- packages/preset-gfm/src/index.ts
- packages/preset-gfm/test-d/**
- packages/react/src/morphing/**
- packages/react/src/shell/use-aether-editor.test.ts
- packages/react/package.json
- examples/shared/gfm-wiring.ts
  Forbidden Files:
- packages/vue/**
- packages/plugins/**
- e2e/**
- openspec/specs/**
  Implementation Notes:
- Move canonical morphing strategy and DOM renderer contracts to `@aether-md/preset-gfm`.
- Remove morphing/renderer exports from `@aether-md/core` public surface.
- Keep kernel-internal morphing registry wiring in Core without re-exporting contracts.
- Narrow `AetherEditor` morphing accessor to opaque `unknown` strategy records at the kernel boundary.
- Rewire React morphing modules and shared example wiring to import contracts from preset-gfm.
  TDD Notes:
- Red: add `packages/core/src/public-api-boundary.test.ts` asserting morphing contract symbols are absent from Core public exports.
- Green: relocate contracts to preset-gfm and update imports until boundary test and package checks pass.
  Validation:
- `pnpm --filter @aether-md/core test`
- `pnpm --filter @aether-md/core typecheck`
- `pnpm --filter @aether-md/preset-gfm check`
- `pnpm --filter @aether-md/react check`
  Intuitive Verification:
- Inspect `packages/core/src/index.ts` and confirm morphing/renderer symbols are not exported.
  Review Checklist:
- Core public exports exclude morphing strategy and DOM renderer contracts
- Preset-gfm exports own the relocated contracts
- React morphing imports no longer depend on Core morphing exports
- No Vue/plugin changes in this task
  Rollback Notes:
- Revert task commit to restore Core morphing exports and prior import graph.
  Version Impact: potential major — Core public export narrowing; preset-gfm becomes canonical morphing contract owner
  Commit Scope: refactor(core|preset-gfm|react)
  Status: done
  Run Log:
- Started Task 03 on branch `feature/converge-single-interaction-model`.
- Added red boundary guard `packages/core/src/public-api-boundary.test.ts` to assert morphing contracts are absent from Core exports.
- Removed morphing contract re-exports from `packages/core/src/index.ts` and narrowed editor morphing accessor surface in `packages/core/src/editor/types.ts` to opaque strategy access.
- Kept Core internal registry records in `packages/core/src/morphing/types.ts` for runtime orchestration without public exposure.
- Introduced canonical morphing contracts in `packages/preset-gfm/src/morphing/contracts.ts` and rewired preset exports/types to own these contracts.
- Updated React morphing internals to consume local shell contracts (`packages/react/src/morphing/contracts.ts`) while using preset-owned contracts in shared wiring/test-facing boundaries.
- Validation passed: `pnpm --filter @aether-md/core test` (via `pnpm exec vitest run`), `pnpm --filter @aether-md/core typecheck`, `pnpm --filter @aether-md/preset-gfm check`, `pnpm --filter @aether-md/react check`.
  Deviation:
- Core test command needed fallback execution via `pnpm exec vitest run` under `packages/core` because recursive install/check flow intermittently failed in this environment due pnpm module-purge/permission issues unrelated to task changes.
