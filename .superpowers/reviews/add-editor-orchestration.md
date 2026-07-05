# Compliance Review: add-editor-orchestration

## Summary

- **Status: PASS WITH DEVIATIONS**
- OpenSpec change: `add-editor-orchestration`
- Branch: `feat/add-editor-orchestration`
- Review date: 2026-07-05
- **Skills loaded:** `openspec-apply-change`, `requesting-code-review`
- OpenSpec: `openspec validate add-editor-orchestration --strict` — **pass**; planning artifacts complete (`isComplete: true`)
- **Version impact:** `@aether-md/core` **minor-level additive** (`createEditor`, `AetherEditor`, `EditorConfig`, `EditorStateSnapshot`, `EditorSecurityConfig`); new `CoreErrorCode`: `EDITOR_ADAPTER_MISSING`, `EDITOR_DISPOSED`; `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` unchanged `[1]`; **no** runtime deps on remark/prosemirror/react/vue/preset-gfm; lockfile unchanged (integration via relative import + test-script sibling builds)

## Artifact Coverage

| Artifact | Present | Notes |
| --- | --- | --- |
| Proposal | yes | `openspec/changes/add-editor-orchestration/proposal.md` |
| Design | yes | `openspec/changes/add-editor-orchestration/design.md` |
| Delta specs | yes | `editor-orchestration` ADDED; `core-bootstrap`, `command-event-runtime`, `adapter-base` MODIFIED |
| OpenSpec tasks | yes | `openspec/changes/add-editor-orchestration/tasks.md` |
| Plan | yes | `.superpowers/plans/add-editor-orchestration.md` |
| Superpowers tasks | yes | `.superpowers/tasks/add-editor-orchestration/01`–`10` (all `completed`) |
| Validation | yes | `.superpowers/runs/add-editor-orchestration/validation.md` — Barrier green |
| Review | yes | this file |

## Changed-file Mapping

| File | Task | Requirement / Source Doc | Status |
| --- | --- | --- | --- |
| `packages/core/src/editor/types.ts` | 01 | `createEditor public entry`; `EditorStateSnapshot` | mapped |
| `packages/core/src/editor/types.test.ts` | 01 | no store API smoke | mapped |
| `packages/core/src/index.ts` | 01, 05 | export `createEditor` + public types | mapped |
| `packages/core/src/package-boundary.test.ts` | 01, 09 | `core-bootstrap` M4.5 boundary | mapped |
| `packages/core/src/editor/conflict-resolver.ts` | 02 | `Runtime command conflicts use default ConflictResolver` | mapped |
| `packages/core/src/editor/conflict-resolver.test.ts` | 02 | last-wins / schema abort | mapped |
| `packages/core/src/editor/adapter-wiring.ts` | 03 | explicit adapter wiring | mapped |
| `packages/core/src/editor/adapter-wiring.test.ts` | 03 | preset-shaped bundle resolve | mapped |
| `packages/core/src/errors.ts` | 03, 07 | `EDITOR_ADAPTER_MISSING`, `EDITOR_DISPOSED` | mapped (deviation: Task 03 Allowed Files) |
| `packages/core/src/editor/context.ts` | 04 | `EditorContext exposes minimal orchestration services` | mapped |
| `packages/core/src/editor/context.test.ts` | 04 | context services smoke | mapped |
| `packages/core/src/editor/create-editor.ts` | 05 | `createEditor` pipeline | mapped |
| `packages/core/src/editor/aether-editor.ts` | 05–07 | `AetherEditor` surface | mapped |
| `packages/core/src/editor/editor-orchestration.test.ts` | 05–07 | startup, getDocument/getMarkdown, dispatch/rollback/dispose | mapped |
| `packages/core/src/editor/engine-dispatch.ts` | 07 | engine-bound dispatch + rollback | mapped |
| `packages/core/src/editor/create-editor-gfm.integration.test.ts` | 08 | headless GFM integration | mapped |
| `packages/core/package.json` | 08, 10 | test script sibling builds | mapped |
| `packages/core/tsconfig.test.json` | 08, 10 | `dist-test/` outDir | mapped |
| `docs/architecture/core-api.md` | Phase 0 (pre-loop) | frozen decisions #1–#3 | mapped (not M4.5 task file; rationale recorded) |
| `.superpowers/**`, `openspec/changes/**` | workflow | traceability | mapped |

**Not modified (correct per non-goals):** `packages/core/src/bootstrap.ts`, `capabilities.ts`, `command-event-runtime.ts`, `packages/react/**`, `packages/preset-gfm/src/**`.

**Build artifact (gitignored intent):** `packages/core/dist-test/` — test compile output; should not be committed.

## Requirement Compliance

| Requirement | Evidence | Result | Notes |
| --- | --- | --- | --- |
| `createEditor` exported; async-only | `index.ts`, `package-boundary.test.ts`, `create-editor.ts` | pass | no `createEditorSync` / `createEditorLite` |
| Startup rejects `CoreError` | `editor-orchestration.test.ts` manifest v99 | pass | |
| `AetherEditor` host APIs | orchestration tests: context, state, dispatch, on, getMarkdown, getDocument, dispose | pass | |
| Phase 0 #1 async-only | export + boundary guards | pass | |
| Phase 0 #2 no Core store | `types.test.ts`, boundary asserts, no subscribe export | pass | observe via `on('change')` |
| Phase 0 #3 no Shell Adapter | no react/shell code; boundary forbids `ReactEditor` | pass | |
| Explicit adapter wiring; no bootstrap silent provide | `adapter-wiring.ts`, rg on bootstrap/capabilities | pass | |
| Core no remark/prosemirror/react runtime deps | `package.json`, rg guards, boundary test | pass | |
| `getDocument` host snapshot | orchestration tests | pass | distinct from `EngineAdapter.getDocument` |
| Lazy `getMarkdown` | serialize spy test | pass | |
| Engine dispatch rollback + `transactionFailed` | orchestration tests | pass | M2 runtime unchanged |
| `change` on successful apply | dispatch success test | pass | payload `{ doc }` only (`markdown?` optional per spec) |
| `ready` / `disposed` lifecycle | ready via plugin onInit listener; dispose test | pass | ready fires before `createEditor` resolves |
| dispose fail-closed | post-dispose dispatch → `EDITOR_DISPOSED` | pass | |
| Headless GFM integration ≥3 fixtures | `create-editor-gfm.integration.test.ts` | pass | paragraph, strong, list |
| GFM via `createEditor` path | integration test dispatch → getMarkdown | pass | |
| Default ConflictResolver command-only | `createEditorRuntime` register wrapper + unit tests | pass | no compile-layer merge |
| M2 standalone independence | no diff on `command-event-runtime.ts`; M2 tests green | pass | |
| M1–M4 regression | `pnpm check` 69 tests across 4 packages | pass | |
| Plugin command error isolation | `pluginError` orchestration test | pass | |

## Boundary Review

- **Core boundary:** pass. Production `packages/core/src` (excl. tests) has zero remark/prosemirror/react/preset-gfm imports; `createEditor` allowed; `createGfmPreset` / Shell exports forbidden; `EditorContext` **class** not exported (type-only via `AetherEditor.context`).
- **Plugin contract:** pass. Adapter implementations remain in plugin packages; orchestration holds wired instances only.
- **Adapter boundary:** pass. Parser/Engine/Serializer invoked through wired adapters; no Remark/PM APIs in core production code.
- **Shell boundary:** pass. No React/Vue/GateLock/DOM; integration test import guard passes.
- **Command/event flow:** pass. Standalone M2 sync dispatch preserved; editor `dispatch` is Promise wrapper with orchestrated engine path; state changes on engine path route through `EngineAdapter.apply` + `change` event.

## Anticorruption Checklist

| Check | Result | Notes |
| --- | --- | --- |
| Every changed file maps to a task | pass | see Changed-file Mapping |
| Every task maps to spec requirement | pass | tasks 01–10 completed with Run Logs |
| Core remains business-blind | pass | no GFM/Markdown engine logic in core production |
| UI Shell concerns do not leak into Core | pass | |
| Third-party engines inside Adapter boundaries | pass | integration imports preset **dist** in test only |
| State changes route through Command Bus (engine path) | pass | `core:replaceText` → `dispatch` → `apply` |
| Dependency direction Shell → Core → Plugin → Adapter | pass | |
| Tests not weakened | pass | core 20 new editor tests; M1–M4 suites green |
| Public contract changes explicit in OpenSpec | pass | delta specs + proposal Version Impact |
| Deviations recorded | pass | validation.md + task Deviation sections |
| New ADR required | no | follows ADR 001/003; design captures M4.5 contract |

## Validation Review

- **Automated (validation.md Task 10):**
  - `pnpm check`: **pass** (12/12 turbo tasks)
  - `openspec validate add-editor-orchestration --strict`: **pass**
  - `@aether-md/core`: 20 tests pass
  - Boundary rg guards: pass (see validation.md)
- **TDD integrity:** Red→Green recorded per task; integration tests depend on Tasks 05–07 completion order (as planned).
- **Intuitive verification:** GFM golden strings in integration fixtures; orchestration trace tests cover startup → dispatch → serialize path.

## Phase 0 / core-api.md Frozen Decisions

| Decision | Implementation | Result |
| --- | --- | --- |
| #1 async-only `createEditor` | `export async function createEditor(...): Promise<AetherEditor>`; no sync export | **pass** |
| #2 no Core store; read-only `state` + `on('change')` | `EditorStateSnapshot` { doc, readOnly }; no subscribe/store export | **pass** |
| #3 React Shell consumes `AetherEditor` directly; no Shell Adapter | no Shell layer introduced | **pass** |

`docs/architecture/core-api.md` on branch **freezes** Phase 0 decisions (pre-M4.5). Body still lists `createEditor` under「尚未实现」— **expected pre-archive drift**; sync deferred to `aether-workflow-update-docs-spec` (Step A7).

## Non-goals Verification

| Non-goal | Checked | Result |
| --- | --- | --- |
| M5 React Shell / Vue / GateLock / DOM | rg + integration import guard | **not introduced** |
| Command Queue / priority coalescing | no queue in editor dispatch | **not introduced** |
| bootstrap silent provide `core:engine` / `core:parser` | rg bootstrap/capabilities | **not introduced** |
| Core subscribe/store API | boundary + types tests | **not introduced** |
| `createEditorSync` / Shell Adapter | boundary tests | **not introduced** |
| compile-layer schema/keymap merge | design exclusion; no merge code | **not introduced** |
| GFM preset re-export from core | rg index.ts | **not introduced** |

## Accepted Deviations

| ID | Area | Deviation | Rationale / Mitigation |
| --- | --- | --- | --- |
| D1 | Task 03 / errors.ts | `EDITOR_ADAPTER_MISSING`, `EDITOR_DISPOSED` added outside Allowed Files | Required public error surface for wiring + dispose fail-closed |
| D2 | Task 08 / integration deps | No `@aether-md/preset-gfm` devDependency; relative `../../../preset-gfm/dist/index.js` import | Turbo cyclic package graph blocked devDeps; test script builds siblings; **zero runtime deps** preserved |
| D3 | Task 08 / test infra | `tsconfig.test.json` → `dist-test/` | Prevent parallel turbo clobber of production `dist/` |
| D4 | Integration wiring | GFM test uses `toExtensionPluginFromPreset(createGfmPreset())` + stub plugins for `core:bootstrap` / `dependsOn` | Required by gfm manifest capability/dependency graph; still exercises full `createEditor` orchestration path |
| D5 | createEditor pipeline order | Engine session created before `bootstrapCore` (design table shows bootstrap earlier) | Functional tests + integration pass; lifecycle receives full `EditorContext`; record only — no spec violation |

## Blockers

**None.** Implementation satisfies OpenSpec M4.5 requirements with recorded deviations; Barrier validation green.

## Must-fix Items

**None required before proceeding to archive / docs sync.**

The following are **recommended follow-ups** (not compliance blockers):

1. **Archive docs sync (A7):** Update `docs/architecture/core-api.md`「当前已实现子集」/「尚未实现」to reflect M4.5 `createEditor` / `AetherEditor`; sync main OpenSpec specs via `aether-workflow-update-docs-spec`.
2. **Optional test gap:** Add editor-orchestration test for duplicate runtime command registration (two plugins, same command id, `last-wins`) — resolver is wired and unit-tested; integration scenario from delta spec not explicitly exercised.
3. **Optional API parity:** `docs/architecture/core-api.md` lists `EditorConfig.logger`; `EditorContext` supports `logger` option but `createEditor` does not forward `config.logger` — defer to M5+ or small follow-up if hosts need config-level logger injection.
4. **Commit hygiene:** Ensure `packages/core/dist-test/` is not staged; include OpenSpec + Superpowers artifacts with implementation in PR.

## Required Updates (post-review workflow)

| Area | Action | When |
| --- | --- | --- |
| Docs | `core-api.md`, SDK cross-refs, test-strategy M4.5 notes | `aether-workflow-update-docs-spec` (archive前/后 per workflow) |
| Specs | Sync `openspec/specs/editor-orchestration`, MODIFIED deltas | archive / update-docs-spec |
| ADR | none | — |
| Glossary | none expected | — |
| Changesets / version | record `@aether-md/core` minor additive on publish | release prep |

## Version / Export Review

| Surface | Change | Recorded |
| --- | --- | --- |
| `@aether-md/core` exports | `+createEditor`, `+AetherEditor`, `+EditorConfig`, `+EditorStateSnapshot`, `+EditorSecurityConfig` | yes (proposal, Task 01, index.ts) |
| `@aether-md/core` dependencies | unchanged (empty runtime deps) | yes (validation guards) |
| `CoreErrorCode` | `+EDITOR_ADAPTER_MISSING`, `+EDITOR_DISPOSED` | partial — document in SDK/errors on docs sync |
| `manifestVersion` | `[1]` unchanged | yes |
| Lockfile | unchanged (no preset devDep) | yes (D2) |

## Code-management Review

- **Branch:** `feat/add-editor-orchestration` matches change name — pass.
- **Commit readiness:** Recommend Conventional Commits scoped to `feat(core): …` / `test(core): …`; single PR with OpenSpec + Superpowers traceability section per `docs/community/git-workflow.md`.
- **Unrelated files:** `docs/architecture/core-api.md` Phase 0 freeze aligns with change; not unrelated.

## Recommendation

**PASS WITH DEVIATIONS** — proceed to:

1. **Commit** implementation + workflow artifacts (user-initiated).
2. **`aether-workflow-archive-change`** after PR approval path, or
3. **`aether-workflow-update-docs-spec`** to sync long-lived docs and main specs (Step A7).

No implementation rework required for spec compliance. Optional follow-ups (duplicate-command integration test, `EditorConfig.logger` wiring) may be addressed in a small post-M4.5 patch or M5 prep change.
