# Final Report: add-editor-orchestration

## Change

- **OpenSpec change:** `add-editor-orchestration`
- **Archive path:** `openspec/changes/archive/2026-07-05-add-editor-orchestration/`
- **Final status:** archived — Full Change workflow complete (tasks, validation, compliance review, docs/spec sync)
- **Branch:** `feat/add-editor-orchestration` (matches change scope)
- **Version impact:** `@aether-md/core` **minor-level additive** — `createEditor`, `AetherEditor`, `EditorConfig`, `EditorStateSnapshot`, `EditorSecurityConfig`; new `CoreErrorCode`: `EDITOR_ADAPTER_MISSING`, `EDITOR_DISPOSED`; `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` unchanged `[1]`; **no** runtime deps on remark/prosemirror/react/preset-gfm; lockfile unchanged (integration via relative import + test-script sibling builds)
- **Code-management:** All implementation + workflow artifacts present; **uncommitted** working tree — do not stage `packages/core/dist-test/` (build artifact)

## Source Docs

- `docs/architecture/core-api.md` — Phase 0 frozen decisions (#1 async-only, #2 no store, #3 no Shell Adapter); M4.5 `createEditor` / `AetherEditor` surface
- `docs/architecture/package-layout.md` — M4.5 placement in `@aether-md/core`
- `docs/engineering/mvp-implementation-plan.md` — M4.5 milestone; host `getMarkdown()` / `getDocument()` v1.0 goal
- `docs/engineering/test-strategy.md` — M4.5 headless integration + orchestration contract tests
- `docs/project-status.md` — milestone status update
- `README.md` — project status summary

## Specs Updated

| Spec                    | Action   | Path                                           |
| ----------------------- | -------- | ---------------------------------------------- |
| `editor-orchestration`  | ADDED    | `openspec/specs/editor-orchestration/spec.md`  |
| `core-bootstrap`        | MODIFIED | `openspec/specs/core-bootstrap/spec.md`        |
| `command-event-runtime` | MODIFIED | `openspec/specs/command-event-runtime/spec.md` |
| `adapter-base`          | MODIFIED | `openspec/specs/adapter-base/spec.md`          |

Delta specs synced from change archive via `aether-workflow-update-docs-spec` (Step A7). `openspec validate add-editor-orchestration --strict` — pass (pre-archive).

## Tasks Completed

| Task                                           | Status    | Validation                                       | Deviation                            |
| ---------------------------------------------- | --------- | ------------------------------------------------ | ------------------------------------ |
| 01 — define editor public API + boundary tests | completed | `pnpm core:test` PASS                            | —                                    |
| 02 — default conflict resolver                 | completed | `pnpm core:test` PASS                            | —                                    |
| 03 — adapter factory from preset               | completed | `pnpm core:test` PASS                            | `errors.ts` outside Allowed Files    |
| 04 — EditorContext stub services               | completed | `pnpm core:test` PASS                            | —                                    |
| 05 — createEditor orchestration                | completed | `pnpm core:test` PASS                            | engine session before bootstrap (D5) |
| 06 — getMarkdown + getDocument                 | completed | `pnpm core:test` PASS                            | —                                    |
| 07 — dispatch + change events                  | completed | `pnpm core:test` PASS                            | —                                    |
| 08 — GFM integration tests                     | completed | `pnpm --filter @aether-md/core test` PASS        | relative preset import; `dist-test/` |
| 09 — package boundary + non-goals              | completed | `pnpm core:test` + rg guards PASS                | —                                    |
| 10 — full validation (Barrier)                 | completed | `pnpm check` + `openspec validate --strict` PASS | —                                    |

OpenSpec high-level `tasks.md` checkboxes remain unchecked (planning artifact; Superpowers tasks 01–10 are the execution source of truth).

## Files Changed

| File                                                              | Task / Reason | Notes                                       |
| ----------------------------------------------------------------- | ------------- | ------------------------------------------- |
| `packages/core/src/editor/types.ts`                               | 01            | public types                                |
| `packages/core/src/editor/types.test.ts`                          | 01            | type smoke                                  |
| `packages/core/src/index.ts`                                      | 01, 05        | export `createEditor` + types               |
| `packages/core/src/package-boundary.test.ts`                      | 01, 09        | M4.5 boundary flip                          |
| `packages/core/src/editor/conflict-resolver.ts`                   | 02            | default ConflictResolver                    |
| `packages/core/src/editor/conflict-resolver.test.ts`              | 02            | unit tests                                  |
| `packages/core/src/editor/adapter-wiring.ts`                      | 03            | explicit adapter resolve                    |
| `packages/core/src/editor/adapter-wiring.test.ts`                 | 03            | wiring tests                                |
| `packages/core/src/errors.ts`                                     | 03, 07        | `EDITOR_ADAPTER_MISSING`, `EDITOR_DISPOSED` |
| `packages/core/src/editor/context.ts`                             | 04            | EditorContext + stubs                       |
| `packages/core/src/editor/context.test.ts`                        | 04            | context smoke                               |
| `packages/core/src/editor/create-editor.ts`                       | 05            | orchestration pipeline                      |
| `packages/core/src/editor/aether-editor.ts`                       | 05–07         | AetherEditor surface                        |
| `packages/core/src/editor/engine-dispatch.ts`                     | 07            | engine-bound dispatch + rollback            |
| `packages/core/src/editor/editor-orchestration.test.ts`           | 05–07         | contract tests                              |
| `packages/core/src/editor/create-editor-gfm.integration.test.ts`  | 08            | headless GFM round-trip                     |
| `packages/core/package.json`                                      | 08, 10        | test script sibling builds                  |
| `packages/core/tsconfig.test.json`                                | 08, 10        | `dist-test/` outDir                         |
| `docs/architecture/core-api.md`                                   | A7 + Phase 0  | frozen decisions + M4.5 subset              |
| `docs/engineering/mvp-implementation-plan.md`                     | A7            | M4.5 status                                 |
| `docs/engineering/test-strategy.md`                               | A7            | M4.5 test scenarios                         |
| `docs/project-status.md`                                          | A7            | milestone update                            |
| `README.md`                                                       | A7            | status summary                              |
| `openspec/specs/editor-orchestration/spec.md`                     | A7            | ADDED main spec                             |
| `openspec/specs/core-bootstrap/spec.md`                           | A7            | MODIFIED                                    |
| `openspec/specs/command-event-runtime/spec.md`                    | A7            | MODIFIED                                    |
| `openspec/specs/adapter-base/spec.md`                             | A7            | MODIFIED                                    |
| `openspec/changes/archive/2026-07-05-add-editor-orchestration/**` | archive       | proposal, design, delta specs, tasks        |
| `.superpowers/plans/add-editor-orchestration.md`                  | workflow      | implementation plan                         |
| `.superpowers/tasks/add-editor-orchestration/01`–`10`             | workflow      | scoped tasks                                |
| `.superpowers/runs/add-editor-orchestration/validation.md`        | workflow      | validation record                           |
| `.superpowers/reviews/add-editor-orchestration.md`                | workflow      | compliance review                           |

**Untracked / do not commit:** `packages/core/dist-test/` (test build output)

## Validation Results

| Command                                               | Result                   |
| ----------------------------------------------------- | ------------------------ |
| `pnpm check`                                          | PASS (12/12 turbo tasks) |
| `openspec validate add-editor-orchestration --strict` | PASS                     |
| `pnpm core:test`                                      | PASS (20 tests)          |
| Package tests (remark / prosemirror / preset-gfm)     | PASS (21 / 16 / 12)      |

Compliance review: **PASS WITH DEVIATIONS** — no blockers (`.superpowers/reviews/add-editor-orchestration.md`).

## Deviations

1. **Task 03 / errors.ts:** `EDITOR_ADAPTER_MISSING`, `EDITOR_DISPOSED` added outside Task 03 Allowed Files (required public error surface).
2. **Task 08 / devDependencies:** Turbo cyclic graph blocked `@aether-md/preset-gfm` devDependency; integration test uses relative `../../../preset-gfm/dist/index.js`; test script pre-builds siblings; zero runtime deps preserved.
3. **Task 08 / test infra:** `tsconfig.test.json` → `dist-test/` to avoid parallel turbo clobbering production `dist/`.
4. **Integration wiring:** GFM test uses `toExtensionPluginFromPreset(createGfmPreset())` + stub plugins for `core:bootstrap` / `dependsOn`.
5. **Pipeline order:** Engine session created before `bootstrapCore` (design table order differs; functional tests pass).

## Docs / ADR Updates

- Long-lived docs updated: `core-api.md`, `mvp-implementation-plan.md`, `test-strategy.md`, `project-status.md`, `README.md`
- Main OpenSpec specs synced: `editor-orchestration` (new), `core-bootstrap`, `command-event-runtime`, `adapter-base`
- ADR: none required
- Glossary: no new terms

## Remaining Follow-ups

1. **Commit + PR:** Stage implementation + workflow artifacts; exclude `packages/core/dist-test/`. PR body should include OpenSpec change id, Superpowers task list, Test plan, non-goals confirmation per `docs/community/git-workflow.md`.
2. **Optional test:** Duplicate runtime command registration integration test (last-wins resolver wired but not end-to-end in editor).
3. **Optional API:** Forward `EditorConfig.logger` to `EditorContext` if hosts need config-level logger injection (M5+ or small patch).
4. **Release prep:** Record `@aether-md/core` minor additive in Changesets when publishing.

## Skills Loaded

- `aether-workflow-archive-change`
- `openspec-archive-change`
- `finishing-a-development-branch`
