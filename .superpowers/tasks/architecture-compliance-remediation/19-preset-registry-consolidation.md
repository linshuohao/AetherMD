# Task 19: Preset dual registry consolidation

Change: architecture-compliance-remediation
Spec Requirement:

- gfm-preset / Requirement: Single morphing strategy registry source
  Source Docs:
- packages/morphing-contracts/src/index.ts
  Depends On: T13
  Parallel Group: wave-6b
  Barrier: false
  Allowed Files:
- packages/preset-gfm/src/morphing/registry.ts
- packages/preset-gfm/src/index.ts
- packages/preset-gfm/src/morphing/paragraph-strategy.ts
  Forbidden Files:
- packages/core/**
  Implementation Notes:
- Remove parallel `getGfmMorphingStrategy` local Map if superseded by `createMorphingStrategyRegistry`.
- Deprecate or remove `paragraphSourceFromBlock` redundant alias.
- Export single registry factory from preset index.
  TDD Notes:
- Red: test that registry lookup uses one mechanism.
- Green: delete duplicate Map.
  Validation:
- `pnpm --filter @aether-md/preset-gfm test`
  Intuitive Verification:
- `rg getGfmMorphingStrategy` usage limited or removed.
  Review Checklist:
- No breaking change to shell strategy lookup path
  Rollback Notes:
- Restore getGfmMorphingStrategy.
  Version Impact: none
  Commit Scope: refactor(preset-gfm)
  Status: done
  Run Log:
  - Removed parallel `strategyByType` Map and `getGfmMorphingStrategy` from `registry.ts`; lookup now goes through `createGfmMorphingRegistry().get()`.
  - Removed `paragraphSourceFromBlock` alias from `paragraph-strategy.ts` and preset index exports.
  - Preset index exports `createGfmMorphingRegistry` as the single registry factory path.
  - Added `registry.test.ts` asserting registry-only lookup and supported block types.
  - `pnpm --filter @aether-md/preset-gfm test` — 19 passed.
    Deviation:
