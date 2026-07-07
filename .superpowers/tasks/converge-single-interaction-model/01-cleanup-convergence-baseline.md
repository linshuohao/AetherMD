# Task 01: Cleanup convergence baseline artifacts

Change: converge-single-interaction-model
Spec Requirement:

- shell-interaction-convergence / Requirement: Shell interaction model converges to single north-star path
- react-shell / Requirement: React shell owns no syntax-specific rendering rules
- validation-suite / Requirement: Validation topology references one canonical browser showcase
  Source Docs:
- docs/architecture/product-experience-spec.md
- docs/engineering/test-strategy.md
- docs/examples/matrix.md
  Depends On: none
  Parallel Group: wave-1
  Barrier: false
  Allowed Files:
- examples/block-morphing/**
- examples/react-basic/**
- examples/_shared/**
- vitest.config.ts
- packages/react/src/morphing/paragraph-render.tsx
- docs/examples/matrix.md
  Forbidden Files:
- packages/core/**
- packages/preset-gfm/**
- packages/plugins/**
- openspec/specs/**
  Implementation Notes:
- Remove ghost example directories that only contain stale `node_modules` residues.
- Remove dead shell-local syntax renderer (`paragraph-render.tsx`) and ensure no references remain.
- Update root vitest projects so workspace tests only point to valid example packages.
- Keep docs edits minimal and topology-focused.
  TDD Notes:
- Failing signal: `vitest` project configuration references non-existent example project path.
- After cleanup, `pnpm test` should discover valid projects without missing-path drift.
  Validation:
- `pnpm test`
- `pnpm lint`
  Intuitive Verification:
- `ls examples/` no longer shows ghost `react-basic` / `block-morphing` directories.
  Review Checklist:
- No remaining imports/references to `packages/react/src/morphing/paragraph-render.tsx`
- Root vitest project list references existing workspace projects only
- Changes are limited to topology cleanup scope
  Rollback Notes:
- Revert this task commit to restore previous file layout and vitest project mapping.
  Version Impact: none
  Commit Scope: refactor(repo)
  Status: done
  Run Log:
- Removed ghost directories `examples/block-morphing`, `examples/react-basic`, and `examples/_shared`.
- Deleted dead file `packages/react/src/morphing/paragraph-render.tsx`.
- Updated root test project mapping in `vitest.config.ts` from `examples/block-morphing` to `examples/react`.
- Validation passed: `pnpm test`, `pnpm lint`.
  Deviation:
- none
