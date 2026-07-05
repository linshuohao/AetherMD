# Final Report: add-react-shell

## Change

- **OpenSpec change:** `add-react-shell`
- **Archive path:** `openspec/changes/archive/2026-07-05-add-react-shell/`
- **Final status:** archived — Full Change workflow complete (tasks 01–10, validation, compliance review PASS WITH DEVIATIONS, docs/spec sync)
- **Branch:** `feat/add-react-shell` (matches change scope)
- **Version impact:** **`@aether-md/react`** **new package** (initial `0.0.0` private; Changeset `minor` for `@aether-md/react` + `@aether-md/plugin-prosemirror`); **`@aether-md/plugin-prosemirror`** **minor additive** — `createProseMirrorView`, `refreshProseMirrorViewFromSession`, `prosemirror-view` runtime dep, internal `readSessionEditorState`; **`@aether-md/core`** **unchanged** (no API or runtime deps); `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` unchanged `[1]`; **`pnpm-lock.yaml`** updated (react package, happy-dom, prosemirror-view, testing-library)
- **Code-management:** All implementation + workflow artifacts present; **uncommitted** working tree — user deferred commit until explicitly requested

## Source Docs

- `docs/architecture/core-api.md` — Phase 0 Decision #2 (no Core store) and #3 (direct `AetherEditor` consumption)
- `docs/architecture/package-layout.md` — M5 `@aether-md/react` placement
- `docs/architecture/ci-checklist.md` — GateLock item #41 checked
- `docs/engineering/mvp-implementation-plan.md` — M5 milestone status
- `docs/engineering/data-flow.md` — GateLock placement after `change` emit
- `docs/engineering/test-strategy.md` — M5 React Shell validation baseline
- `docs/project-status.md` — milestone status update
- `README.md` — project status summary
- `docs/adr/003-remark-prosemirror-dual-track.md` — view-bridge follows dual-track adapter boundary

## Specs Updated

| Spec | Action | Path |
| --- | --- | --- |
| `react-shell` | ADDED | `openspec/specs/react-shell/spec.md` |
| `editor-orchestration` | MODIFIED | `openspec/specs/editor-orchestration/spec.md` |

Delta specs synced from change archive via `aether-workflow-update-docs-spec`. `openspec validate add-react-shell --strict` — pass (pre-archive).

## Tasks Completed

| Task | Status | Validation | Deviation |
| --- | --- | --- | --- |
| 01 — define React public API + boundary tests | completed | `@aether-md/react` boundary PASS | — |
| 02 — scaffold React package workspace | completed | build + turbo check PASS | — |
| 03 — implement GateLock utility | completed | unit tests PASS | — |
| 04 — implement `useAetherEditor` hook | completed | change bridge tests PASS | — |
| 05 — implement plugin-prosemirror view-bridge | completed | view-bridge tests PASS | D1–D2, D7 |
| 06 — implement Root + Content | completed | integration mount PASS | D6 `pluginsKey` |
| 07 — React Shell integration tests | completed | happy-dom integration PASS | D3 dispatch not DOM type |
| 08 — GateLock integration tests | completed | `gate-lock.integration.test.tsx` PASS | — |
| 09 — GFM React smoke + boundary reinforcement | completed | 3 smoke tests PASS | D4 render-only paragraph |
| 10 — full validation (Barrier) | completed | `pnpm check` + `openspec validate --strict` PASS | — |

OpenSpec high-level `tasks.md` checkboxes remain unchecked (planning artifact; Superpowers tasks 01–10 are the execution source of truth).

## Files Changed

| File | Task / Reason | Notes |
| --- | --- | --- |
| `packages/react/package.json` | 02 | new `@aether-md/react` workspace package |
| `packages/react/tsconfig.json` | 02 | production compile |
| `packages/react/tsconfig.test.json` | 02, 07 | happy-dom test compile |
| `packages/react/src/types.ts` | 01 | public props / result types |
| `packages/react/src/index.ts` | 01 | public exports |
| `packages/react/src/context.tsx` | 06 | Root context provider |
| `packages/react/src/gate-lock.ts` | 03 | GateLock utility |
| `packages/react/src/gate-lock.test.ts` | 03 | GateLock unit tests |
| `packages/react/src/use-aether-editor.ts` | 04 | `useAetherEditor` hook |
| `packages/react/src/use-aether-editor.test.ts` | 04 | change bridge without Core store |
| `packages/react/src/aether-editor-root.tsx` | 06 | `createEditor` lifecycle + GateLock |
| `packages/react/src/aether-editor-content.tsx` | 05, 06 | view-bridge mount + dispatch bridge |
| `packages/react/src/package-boundary.test.ts` | 01, 09 | boundary + no ShellAdapter |
| `packages/react/src/test-setup.ts` | 07 | happy-dom registrator |
| `packages/react/src/test-helpers.ts` | 07, 09 | GFM preset fixtures |
| `packages/react/src/react-shell.integration.test.tsx` | 07 | mount / onChange / dispose |
| `packages/react/src/gate-lock.integration.test.tsx` | 08 | GateLock CI scenario (#41) |
| `packages/react/src/gfm-react-smoke.test.tsx` | 09 | paragraph / strong / list smoke |
| `packages/plugins/plugin-prosemirror/src/view-bridge.ts` | 05 | `createProseMirrorView` additive export |
| `packages/plugins/plugin-prosemirror/src/view-bridge.test.ts` | 05 | view ↔ `getDocument()` contract |
| `packages/plugins/plugin-prosemirror/src/engine.ts` | 05 | `readSessionEditorState` (internal) |
| `packages/plugins/plugin-prosemirror/src/conversion.ts` | 05 | `toDOM` / `parseDOM` for EditorView |
| `packages/plugins/plugin-prosemirror/src/index.ts` | 05 | export view-bridge API |
| `packages/plugins/plugin-prosemirror/package.json` | 05 | `prosemirror-view` + happy-dom devDeps |
| `packages/plugins/plugin-prosemirror/tsconfig.test.json` | 05 | `skipLibCheck` for happy-dom types |
| `pnpm-lock.yaml` | 02, 05, 10 | workspace lockfile |
| `.changeset/add-react-shell.md` | 02 | version hook (not yet consumed) |
| `docs/architecture/ci-checklist.md` | A7 | GateLock #41 checked |
| `docs/architecture/package-layout.md` | A7 | M5 react package row |
| `docs/engineering/mvp-implementation-plan.md` | A7 | M5 status |
| `docs/engineering/test-strategy.md` | A7 | M5 validation baseline |
| `docs/project-status.md` | A7 | milestone update |
| `README.md` | A7 | status summary |
| `openspec/specs/react-shell/spec.md` | A7 | ADDED main spec |
| `openspec/specs/editor-orchestration/spec.md` | A7 | MODIFIED main spec |
| `openspec/changes/archive/2026-07-05-add-react-shell/**` | archive | proposal, design, delta specs, tasks |
| `.superpowers/plans/add-react-shell.md` | workflow | implementation plan |
| `.superpowers/tasks/add-react-shell/01`–`10` | workflow | scoped tasks |
| `.superpowers/runs/add-react-shell/validation.md` | workflow | validation record |
| `.superpowers/reviews/add-react-shell.md` | workflow | compliance review |

**Not modified (correct per non-goals):** `packages/core/**`, Vue Shell, Playwright CI, `examples/react-basic`, Core Guard/Permission/store code.

## Validation Results

| Command | Result |
| --- | --- |
| `pnpm check` | PASS (15/15 turbo tasks) |
| `openspec validate add-react-shell --strict` | PASS |
| `pnpm --filter @aether-md/react test` | PASS (14 tests) |
| `pnpm --filter @aether-md/plugin-prosemirror test` | PASS (20 tests) |
| `pnpm core:test` | PASS (20 tests) |
| Package tests (remark / preset-gfm) | PASS (21 / 12) |
| Boundary rg guards | PASS |

Compliance review: **PASS WITH DEVIATIONS** — no blockers (`.superpowers/reviews/add-react-shell.md`).

## Deviations

1. **D1 / Task 05 / `conversion.ts`:** Added `toDOM` / `parseDOM` on schema nodes/marks — required for `EditorView` DOM rendering; not in original allowed files.
2. **D2 / Task 05 / `engine.ts`:** Exported `readSessionEditorState` for view-bridge sync — internal bridge read; not part of `EngineAdapter` contract.
3. **D3 / Tasks 07–08 / integration tests:** Integration asserts `dispatch` path instead of simulating DOM keyboard input — happy-dom PM typing deferred for Node stability; view-bridge unit test covers `dispatchInput`.
4. **D4 / Task 09 / GFM paragraph smoke:** Test mounts and asserts render; no simulated edit — strong/list scenarios similarly render-first.
5. **D5 / Task 07 / dispose scenario:** No react integration test for post-unmount `dispatch` → `EDITOR_DISPOSED` — core M4.5 orchestration already covers fail-closed.
6. **D6 / Task 06 / Root:** `pluginsKey` from manifest names stabilizes mount effect vs inline `plugins` array reference — prevents spurious remount.
7. **D7 / Task 05 / plugin-prosemirror:** `happy-dom` devDependencies for view-bridge tests — test-only; not runtime dep of react.

## Docs / ADR Updates

- Long-lived docs updated: `ci-checklist.md`, `package-layout.md`, `mvp-implementation-plan.md`, `test-strategy.md`, `project-status.md`, `README.md`
- Main OpenSpec specs synced: `react-shell` (new), `editor-orchestration` (M5 Shell consumption wording)
- ADR: none required (follows ADR 003 dual-track)
- Glossary: no new terms

## Remaining Follow-ups

1. **Commit + PR:** Stage implementation + workflow artifacts (including archive path and final report). PR body should cite OpenSpec change id, Superpowers task list, validation path, deviations D1–D7, and version impact per `docs/community/git-workflow.md`. **Deferred** — user has not requested commit.
2. **Changesets:** Consume `.changeset/add-react-shell.md` when publishing — bump `@aether-md/react` (new) and `@aether-md/plugin-prosemirror` (minor additive).
3. **`examples/react-basic`:** Add minimal host example app demonstrating `AetherEditorRoot` / `Content` / `useAetherEditor` with GFM preset — deferred from M5 non-goals; recommended before external adoption.
4. **Playwright CI:** Browser-level integration (DOM typing, focus, accessibility) — explicitly out of M5 scope; consider for M6+ or dedicated CI job.
5. **Optional test gaps:** DOM typing integration (happy-dom `userEvent` / PM `insertText`); post-unmount `EDITOR_DISPOSED` react integration; GFM paragraph smoke with one `dispatch` edit.

## Skills Loaded

- `aether-workflow-archive-change`
- `openspec-archive-change`
- `finishing-a-development-branch`
