# Task 04: Route parse-block command via runtime registration

Change: converge-single-interaction-model
Spec Requirement:
- editor-orchestration / Requirement: Editor command handling uses unified runtime routing
Source Docs:
- openspec/changes/converge-single-interaction-model/specs/editor-orchestration/spec.md
- docs/architecture/principles.md
Depends On: 03-extract-morphing-contracts-from-core
Parallel Group: wave-2
Barrier: false
Allowed Files:
- packages/core/src/editor/create-editor.ts
- packages/core/src/editor/aether-editor.ts
- packages/core/src/editor/editor-orchestration.test.ts
- .superpowers/tasks/converge-single-interaction-model/04-route-parse-command-via-runtime-registration.md
Forbidden Files:
- packages/preset-gfm/**
- packages/react/**
- packages/vue/**
- openspec/specs/**
Implementation Notes:
- Register parse-block command in editor runtime during canonical startup wiring.
- Remove dedicated parse command branch from `AetherEditorImpl.dispatch`.
- Keep undo/redo and engine-bound command flow intact.
TDD Notes:
- Red: add test that plugin/runtime registration can override parse-block command behavior.
- Green: route parse command through runtime registration and remove hardcoded bypass.
Validation:
- `pnpm --filter @aether-md/core test`
- `pnpm --filter @aether-md/core typecheck`
Intuitive Verification:
- Inspect `packages/core/src/editor/aether-editor.ts` and confirm no dedicated parse-block branch in `dispatch`.
Review Checklist:
- parse command resolved via runtime registration
- no parse-specific branch remains in dispatch
- new regression test covers runtime override behavior
Rollback Notes:
- Revert task commit to restore previous parse-branch dispatch behavior.
Version Impact: none
Commit Scope: refactor(core)
Status: done
Run Log:
- Started Task 04 on branch `feature/converge-single-interaction-model`.
- Added regression test asserting `core:parseBlockMarkdown` can be overridden via runtime registration (`packages/core/src/editor/editor-orchestration.test.ts`).
- Registered parse-block command in canonical startup wiring (`packages/core/src/editor/create-editor.ts`) with `runtime.register(...)` and non-mutating command metadata.
- Removed dedicated parse-block dispatch branch from `AetherEditorImpl.dispatch` and normalized runtime promise-like command values in one generic path (`packages/core/src/editor/aether-editor.ts`).
- Validation passed: `pnpm exec vitest run` and `pnpm typecheck` under `packages/core`.
Deviation:
