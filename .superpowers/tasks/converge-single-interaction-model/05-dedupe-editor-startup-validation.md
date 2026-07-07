# Task 05: Deduplicate editor startup manifest validation path

Change: converge-single-interaction-model
Spec Requirement:
- editor-orchestration / Requirement: Startup validation executes through one canonical path
Source Docs:
- openspec/changes/converge-single-interaction-model/specs/editor-orchestration/spec.md
Depends On: 04-route-parse-command-via-runtime-registration
Parallel Group: wave-2
Barrier: true
Allowed Files:
- packages/core/src/editor/create-editor.ts
- packages/core/src/bootstrap/bootstrap.ts
- packages/core/src/bootstrap/bootstrap.test.ts
- .superpowers/tasks/converge-single-interaction-model/05-dedupe-editor-startup-validation.md
Forbidden Files:
- packages/preset-gfm/**
- packages/react/**
- packages/vue/**
- openspec/specs/**
Implementation Notes:
- Ensure createEditor performs manifest load/validation/order once.
- Reuse prepared plugin data in bootstrap lifecycle startup instead of reloading/revalidating.
- Preserve direct `bootstrapCore(plugins)` behavior for non-editor callers.
TDD Notes:
- Red: add bootstrap test proving prepared plugin input skips manifest reload path.
- Green: pass prepared ordered plugins from createEditor to bootstrapCore.
Validation:
- `pnpm exec vitest run`
- `pnpm typecheck`
Intuitive Verification:
- Inspect `packages/core/src/editor/create-editor.ts` and `packages/core/src/bootstrap/bootstrap.ts` for single validation path.
Review Checklist:
- createEditor no longer causes duplicate manifest validation during bootstrap
- bootstrapCore still supports direct plugin array invocation
- tests cover prepared-plugin lifecycle path
Rollback Notes:
- Revert task commit to restore previous bootstrap validation flow.
Version Impact: none
Commit Scope: refactor(core)
Status: done
Run Log:
- Started Task 05 on branch `feature/converge-single-interaction-model`.
- Added bootstrap coverage for prepared ordered plugin startup path (`packages/core/src/bootstrap/bootstrap.test.ts`).
- Extended `bootstrapCore` options with `preparedOrderedPlugins` so lifecycle startup can reuse prevalidated plugin order without manifest reload/validation (`packages/core/src/bootstrap/bootstrap.ts`).
- Updated `createEditor` to compute ordered plugins once and pass them into bootstrap runtime (`packages/core/src/editor/create-editor.ts`), removing duplicated startup validation across stages.
- Validation passed: `pnpm exec vitest run` and `pnpm typecheck` under `packages/core`.
Deviation:
