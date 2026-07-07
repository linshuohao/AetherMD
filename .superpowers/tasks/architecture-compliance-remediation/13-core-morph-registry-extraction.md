# Task 13: Core morph registry extraction

Change: architecture-compliance-remediation
Spec Requirement:

- core-bootstrap / Requirement: Core SHALL NOT construct morphing strategy registries during createEditor
- editor-orchestration / Requirement: Preset owns morph registry factory
  Source Docs:
- openspec/changes/architecture-compliance-remediation/design.md Wave 3
- packages/morphing-contracts/src/index.ts
  Depends On: Wave 2 complete
  Parallel Group: wave-6b
  Barrier: false
  Allowed Files:
- packages/core/src/editor/create-editor.ts
- packages/core/src/editor/adapter-wiring.ts
- packages/core/src/morphing/types.ts (delete)
- packages/core/src/editor/editor-orchestration.test.ts
- packages/preset-gfm/src/index.ts
- packages/preset-gfm/src/morphing/registry.ts
  Forbidden Files:
- packages/react/**
- packages/vue/**
- openspec/specs/**
  Implementation Notes:
- Delete `packages/core/src/morphing/types.ts`; remove `createMorphingStrategyRegistry` from core.
- Preset `createGfmPreset()` exposes pre-built opaque registry or factory on plugin field.
- Core `createEditor` reads opaque handle from plugin without aggregating strategies.
- Keep `getMorphingStrategy` returning `unknown`.
- Update tests to not import registry factory from core.
  TDD Notes:
- Red: public-api-boundary / orchestration test asserts no morph factory in core.
- Green: move aggregation to preset.
  Validation:
- `pnpm --filter @aether-md/core test`
- `pnpm --filter @aether-md/preset-gfm test`
  Intuitive Verification:
- `rg createMorphingStrategyRegistry packages/core` returns zero production hits.
  Review Checklist:
- Core index still excludes morphing contract exports
- Morphing dispatch path still works in integration tests
  Rollback Notes:
- Restore core/morphing/types.ts and resolveMorphingRegistry.
  Version Impact: minor
  Commit Scope: refactor(core)
  Status: done
  Run Log:
  - Deleted `packages/core/src/morphing/types.ts`; core no longer defines `createMorphingStrategyRegistry`.
  - Added `createGfmMorphingRegistry()` in preset-gfm; `createGfmPreset()` exposes `morphingRegistry`.
  - Core `adapter-wiring.resolveMorphingAccessor` reads opaque `plugin.morphingRegistry` (last wins).
  - `createEditor` wires morphing via accessor; `getMorphingStrategy` still returns `unknown`.
  - Updated orchestration + public-api-boundary tests.
  - `pnpm --filter @aether-md/core test` — 157 passed.
  - `pnpm --filter @aether-md/preset-gfm test` — 17 passed.
    Deviation:
