# Task 23: GFM wiring centralization

Change: architecture-compliance-remediation
Spec Requirement:

- validation-suite / Requirement: Single canonical GFM plugin wiring for tests and examples
  Source Docs:
- examples/shared/gfm-wiring.ts
  Depends On: none
  Parallel Group: wave-6c
  Barrier: false
  Allowed Files:
- examples/shared/gfm-wiring.ts
- packages/react/src/testing/gfm-plugins.ts
- packages/vue/src/testing/gfm-plugins.ts
- packages/core/src/editor/create-editor-gfm.test.ts
  Forbidden Files:
- openspec/specs/**
  Implementation Notes:
- React/Vue test helpers delegate to `createGfmEditorPlugins()` from `@aether-md/example-shared`.
- Remove duplicated bootstrap-stub + preset wiring from test files.
- Keep core test independent or import shared helper if package boundary allows (devDependency).
  TDD Notes:
- Red: duplicated wiring count > 1 for same pattern.
- Green: single shared function.
  Validation:
- `pnpm test` (affected packages)
  Intuitive Verification:
- `rg core-bootstrap-stub` shows shared helper + core test only.
  Review Checklist:
- No new runtime dependency from packages to examples (dev/test only)
  Rollback Notes:
- Restore inline wiring in test helpers.
  Version Impact: none
  Commit Scope: refactor(test)
  Status: done
  Run Log:
  - React/Vue `gfm-plugins.ts` re-export `createGfmEditorPlugins` from `@aether-md/example-shared`.
  - Core `create-editor-gfm.test.ts` imports shared helper; removed local bootstrap-stub wiring.
  - Added `@aether-md/example-shared` devDependency to `@aether-md/core`, `@aether-md/react`, `@aether-md/vue`.
  - Validation: `pnpm --filter @aether-md/core test` (157 passed); react GFM smoke/shell (7 passed); vue GFM smoke (4 passed).
  - `rg core-bootstrap-stub`: only `examples/shared/gfm-wiring.ts` (+ bench script, archive).
    Deviation:
