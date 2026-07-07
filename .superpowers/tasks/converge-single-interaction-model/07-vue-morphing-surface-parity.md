# Task 07: Add Vue morphing-first shell parity surface

Change: converge-single-interaction-model
Spec Requirement:

- shell-interaction-convergence / Requirement: Framework shell parity follows the same interaction contract
  Source Docs:
- openspec/changes/converge-single-interaction-model/specs/shell-interaction-convergence/spec.md
  Depends On: 06-converge-react-shell-morphing-first
  Parallel Group: wave-3
  Barrier: true
  Allowed Files:
- packages/vue/src/index.ts
- packages/vue/src/package-boundary.test.ts
- packages/vue/src/gfm-vue-smoke.test.ts
- packages/vue/src/morphing/**
- examples/vue/src/AetherShellShowcase.vue
- .superpowers/tasks/converge-single-interaction-model/07-vue-morphing-surface-parity.md
  Forbidden Files:
- packages/core/**
- packages/preset-gfm/**
- packages/react/**
- openspec/specs/**
  Implementation Notes:
- Introduce Vue morphing components as primary shell surface exports.
- Keep `AetherEditorContent` available as legacy bridge and expose explicit alias.
- Default Vue showcase interaction to morphing mode.
  TDD Notes:
- Red: extend Vue package boundary and smoke assertions for new morphing exports/render path.
- Green: implement morphing components and showcase mode switch until checks pass.
  Validation:
- `pnpm --filter @aether-md/vue check`
- `pnpm --filter @aether-md/example-vue check`
  Intuitive Verification:
- Run Vue showcase and verify morphing mode is default.
  Review Checklist:
- Vue public exports include morphing-first surface and legacy alias
- Vue production source still avoids direct preset-gfm imports
- example-vue defaults to morphing mode
  Rollback Notes:
- Revert task commit to restore Vue content-only shell surface.
  Version Impact: potential minor/major API expansion for Vue shell parity
  Commit Scope: feat(vue)
  Status: done
  Run Log:
- Started Task 07 on branch `feature/converge-single-interaction-model`.
- Added Vue morphing surface components (`AetherMorphingContent`, `AetherMorphingDocument`) and shared morphing rendering contracts under `packages/vue/src/morphing/**`.
- Updated Vue public exports to be morphing-first and added explicit legacy alias `AetherLegacyEditorContent` for content bridge compatibility (`packages/vue/src/index.ts`).
- Expanded Vue boundary and smoke tests to assert morphing-first exports and runtime rendering path (`packages/vue/src/package-boundary.test.ts`, `packages/vue/src/gfm-vue-smoke.test.ts`).
- Updated canonical Vue showcase to default morphing mode, with content mode labeled legacy and switchable (`examples/vue/src/AetherShellShowcase.vue`).
- Validation passed: `pnpm --filter @aether-md/vue check`; `pnpm --filter @aether-md/example-vue check`.
  Deviation:
