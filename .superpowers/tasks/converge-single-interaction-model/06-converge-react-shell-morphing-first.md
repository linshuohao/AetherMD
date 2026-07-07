# Task 06: Converge React shell to morphing-first product surface

Change: converge-single-interaction-model
Spec Requirement:
- react-shell / Requirement: React shell product surface is morphing-first
- shell-interaction-convergence / Requirement: Shell interaction model converges to single north-star path
Source Docs:
- openspec/changes/converge-single-interaction-model/specs/react-shell/spec.md
- openspec/changes/converge-single-interaction-model/specs/shell-interaction-convergence/spec.md
Depends On: 05-dedupe-editor-startup-validation
Parallel Group: wave-3
Barrier: false
Allowed Files:
- packages/react/src/index.ts
- packages/react/src/shell/aether-editor-content.tsx
- packages/react/src/package-boundary.test.ts
- examples/react/src/aether-shell-showcase.tsx
- .superpowers/tasks/converge-single-interaction-model/06-converge-react-shell-morphing-first.md
Forbidden Files:
- packages/core/**
- packages/preset-gfm/**
- packages/vue/**
- openspec/specs/**
Implementation Notes:
- Keep morphing document path as primary product-facing surface.
- Retain `AetherEditorContent` only as legacy bridge utility and expose explicit legacy alias.
- Default canonical React showcase mode to morphing.
TDD Notes:
- Red: adjust React package boundary expectation to require morphing-first + legacy alias.
- Green: update exports/showcase mode and legacy annotation until tests pass.
Validation:
- `pnpm --filter @aether-md/react check`
- `pnpm --filter @aether-md/example-react test`
Intuitive Verification:
- Launch showcase and confirm default visible shell is morphing mode.
Review Checklist:
- React exports present morphing surface as primary
- legacy content path remains available but isolated/labeled as legacy
- canonical showcase defaults to morphing mode
Rollback Notes:
- Revert task commit to restore previous export positioning and showcase default mode.
Version Impact: potential minor/major consumer-facing API positioning update with added legacy alias
Commit Scope: refactor(react)
Status: done
Run Log:
- Started Task 06 on branch `feature/converge-single-interaction-model`.
- Updated React package boundary assertions to enforce morphing-first export posture while preserving a legacy alias for content bridge usage (`packages/react/src/package-boundary.test.ts`).
- Reordered root exports to prioritize morphing surfaces and added explicit `AetherLegacyEditorContent` alias mapped to `AetherEditorContent` (`packages/react/src/index.ts`).
- Refined legacy deprecation annotation for `AetherEditorContent` to point at `examples/react` content mode instead of deleted topology (`packages/react/src/shell/aether-editor-content.tsx`).
- Set canonical React showcase default mode to `morphing` and labeled content mode as legacy (`examples/react/src/aether-shell-showcase.tsx`).
- Adjusted morphing content typing to align with Core opaque strategy boundary (`packages/react/src/morphing/aether-morphing-content.tsx`).
- Validation passed: `pnpm --filter @aether-md/react check`; `pnpm --filter @aether-md/example-react test`.
Deviation:
