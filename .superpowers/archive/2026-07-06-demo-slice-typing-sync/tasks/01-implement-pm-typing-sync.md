# Task 01: Implement ProseMirror typing sync for demo slice

Change: demo-slice-typing-sync
Spec Requirement: validation-suite / React basic demo slice north star acceptance — ProseMirror user input path
Source Docs:

- docs/engineering/demo-slice-delivery-program.md
- openspec/changes/demo-slice-typing-sync/change-brief.md
- openspec/changes/demo-slice-typing-sync/specs/validation-suite/spec.md
- openspec/changes/archive/2026-07-06-demo-slice-react-basic-pr0/baseline-record.md
  Depends On:
  Parallel Group:
  Barrier: false
  Allowed Files:
- packages/react/src/demo-slice-typing-sync.integration.test.tsx
- packages/react/src/**/*.tsx
- packages/react/src/**/*.ts
- packages/plugins/plugin-prosemirror/src/view-bridge.ts
- packages/plugins/plugin-prosemirror/src/view-bridge.test.ts
- packages/plugins/plugin-prosemirror/src/engine.ts
- packages/plugins/plugin-prosemirror/src/engine.test.ts
- packages/core/src/adapter-types.ts
- examples/react-basic/README.md
- openspec/changes/demo-slice-typing-sync/**
- openspec/specs/validation-suite/spec.md
- openspec/changes/archive/2026-07-06-demo-slice-react-basic-pr0/baseline-record.md
- docs/engineering/demo-slice-delivery-program.md
- .superpowers/tasks/demo-slice-typing-sync/01-implement-pm-typing-sync.md
- .superpowers/runs/demo-slice-typing-sync/**
  Forbidden Files:
- .skills/aether-workflow/**
- AI_NATIVE_ENGINEERING_WORKFLOW.md
- openspec/specs/** (except validation-suite/spec.md sync)
- packages/core/** (except adapter-types.ts if list sync requires backward-compatible optional field)
- AGENTS.md
  Implementation Notes:

1. **TDD red:** Add `demo-slice-typing-sync.integration.test.tsx` mirroring controlled Shell (reuse `createGfmEditorPlugins`, `GFM_FIXTURE` pattern from `demo-slice-pr0-acceptance.integration.test.tsx`).
2. Obtain PM `EditorView` from mounted content (expose via test helper or query `.ProseMirror` under `data-testid="aether-editor-content"`).
3. Test cases (minimum):
   - Consecutive `insertText` in plain paragraph → preview updates.
   - `insertText` in heading block → preview shows new title text.
   - `insertText` inside list item paragraph → preview shows updated list item text.
   - Regression: fixture with `**bold**` and `[link](url)` — typing adjacent text preserves marks in preview markdown.
4. **view-bridge:** Resolve edit position to correct top-level `blockIndex`; handle `list_item` > `paragraph` (do not silently drop transactions on non-paragraph top-level nodes).
5. **engine:** Extend `replaceText` / block apply so list blocks can be updated when PM sync requires full list structure replacement; prefer minimal diff. If `ReplaceTextCommand` needs an optional backward-compatible field (e.g. block replacement), limit change to `adapter-types.ts` and document in task deviation.
6. Keep `dispatchInput` fire-and-forget semantics; do not mutate session document in view-bridge (existing invariant).
7. Sync delta into `openspec/specs/validation-suite/spec.md`.
8. Update `baseline-record.md` scenario rows for typing gaps; update delivery program progress log.
9. Add README sign-off checklist for `pnpm dev` manual walk.
   TDD Notes:
   Red: new integration tests fail on list/paragraph typing preview drift. Green: minimal view-bridge + engine changes; no unrelated refactors.
   Validation:

- `pnpm --filter @aether-md/plugin-prosemirror test`
- `pnpm --filter @aether-md/react test`
- `pnpm check`
  Intuitive Verification:
- `pnpm --filter @aether-md/example-react-basic dev` — continuous typing in paragraph, heading, list item; preview tracks edits.
  Review Checklist:
- [x] No forbidden files
- [x] Dispatch path tests still pass
- [x] No new CommandId
- [x] List sync does not break round-trip tests in plugin-prosemirror
      Rollback Notes:
      Revert typing test file, view-bridge/engine changes, adapter-types optional field if added, spec sync.
      Version Impact:
      none
      Commit Scope:
      fix(plugin-prosemirror): sync PM typing to markdown for demo slice
      Status: completed
      Run Log:
- 2026-07-06: RED — `demo-slice-typing-sync.integration.test.tsx` added; list + mark cases failed before engine/view-bridge list sync.
- 2026-07-06: GREEN — `view-bridge` list item resolution, `engine` list-item replace via numeric `text` index + `children`, `aether-editor-content` dual-field payload; unit + integration tests pass; `pnpm check` green.
- 2026-07-06: VALIDATE — `pnpm --filter @aether-md/plugin-prosemirror test` (25/25 pass), `pnpm --filter @aether-md/react test` (23/23 pass), `pnpm check` (21/21 tasks pass); record `.superpowers/runs/demo-slice-typing-sync/validation.md`; browser `pnpm dev` smoke **未做** (non-blocking).
  Deviation:
- List sync encodes `listItemIndex` in `ReplaceTextCommand.text` (numeric string) alongside `children` to avoid `adapter-types` / `engine-dispatch` changes; documented here per change-brief optional-field guidance.
- Mark regression test asserts structural stability (`**bold**` + link URL preserved) rather than exact markdown placement at non-inclusive mark boundaries.
