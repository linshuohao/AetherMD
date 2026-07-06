# Compliance Review: add-react-shell

## Summary

- **Status: PASS WITH DEVIATIONS**
- OpenSpec change: `add-react-shell`
- Branch: `feat/add-react-shell`
- Review date: 2026-07-05
- **Skills loaded:** `openspec-apply-change`, `requesting-code-review`
- OpenSpec: `openspec validate add-react-shell --strict` — **pass**; planning artifacts complete (`proposal`, `design`, delta specs, `tasks.md`, plan, tasks 01–10, validation)
- **Version impact:** new `@aether-md/react` (`0.0.0` private; Changeset `minor`); `@aether-md/plugin-prosemirror` **minor additive** (`createProseMirrorView`, `prosemirror-view`, `readSessionEditorState`); `@aether-md/core` **unchanged** (no API or runtime deps); `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` unchanged `[1]`; `pnpm-lock.yaml` updated (react, happy-dom, prosemirror-view)

## Artifact Coverage

| Artifact          | Present | Notes                                                             |
| ----------------- | ------- | ----------------------------------------------------------------- |
| Proposal          | yes     | `openspec/changes/add-react-shell/proposal.md`                    |
| Design            | yes     | `openspec/changes/add-react-shell/design.md`                      |
| Delta specs       | yes     | `react-shell` ADDED; `editor-orchestration` MODIFIED              |
| OpenSpec tasks    | yes     | `openspec/changes/add-react-shell/tasks.md`                       |
| Plan              | yes     | `.superpowers/plans/add-react-shell.md`                           |
| Superpowers tasks | yes     | `.superpowers/tasks/add-react-shell/01`–`10`                      |
| Validation        | yes     | `.superpowers/runs/add-react-shell/validation.md` — Barrier green |
| Changeset         | yes     | `.changeset/add-react-shell.md`                                   |
| Review            | yes     | this file                                                         |

## Changed-file Mapping

| File                                                          | Task       | Requirement / Source Doc                        | Status             |
| ------------------------------------------------------------- | ---------- | ----------------------------------------------- | ------------------ |
| `packages/react/package.json`                                 | 02         | React package workspace + check pipeline        | mapped             |
| `packages/react/tsconfig.json`                                | 02         | scaffold                                        | mapped             |
| `packages/react/tsconfig.test.json`                           | 02, 07     | happy-dom test compile                          | mapped             |
| `packages/react/src/types.ts`                                 | 01         | public API shape (Decision #7)                  | mapped             |
| `packages/react/src/index.ts`                                 | 01         | public exports                                  | mapped             |
| `packages/react/src/context.tsx`                              | 06         | Root context provider                           | mapped             |
| `packages/react/src/gate-lock.ts`                             | 03         | GateLock utility                                | mapped             |
| `packages/react/src/gate-lock.test.ts`                        | 03         | GateLock unit tests                             | mapped             |
| `packages/react/src/use-aether-editor.ts`                     | 04         | `useAetherEditor` hook                          | mapped             |
| `packages/react/src/use-aether-editor.test.ts`                | 04         | change bridge without Core store                | mapped             |
| `packages/react/src/aether-editor-root.tsx`                   | 06         | `createEditor` lifecycle + GateLock             | mapped             |
| `packages/react/src/aether-editor-content.tsx`                | 05, 06     | view-bridge mount + dispatch bridge             | mapped             |
| `packages/react/src/package-boundary.test.ts`                 | 01, 09     | package boundary + no ShellAdapter              | mapped             |
| `packages/react/src/test-setup.ts`                            | 07         | happy-dom registrator                           | mapped             |
| `packages/react/src/test-helpers.ts`                          | 07, 09     | GFM preset fixtures                             | mapped             |
| `packages/react/src/react-shell.integration.test.tsx`         | 07         | mount / onChange / dispose integration          | mapped             |
| `packages/react/src/gate-lock.integration.test.tsx`           | 08         | GateLock CI scenario                            | mapped             |
| `packages/react/src/gfm-react-smoke.test.tsx`                 | 09         | GFM paragraph / strong / list smoke             | mapped             |
| `packages/plugins/plugin-prosemirror/src/view-bridge.ts`      | 05         | `createProseMirrorView` additive export         | mapped             |
| `packages/plugins/plugin-prosemirror/src/view-bridge.test.ts` | 05         | view ↔ `getDocument()` contract                 | mapped             |
| `packages/plugins/plugin-prosemirror/src/engine.ts`           | 05         | `readSessionEditorState` (internal bridge read) | mapped (deviation) |
| `packages/plugins/plugin-prosemirror/src/conversion.ts`       | 05         | `toDOM` / `parseDOM` for EditorView             | mapped (deviation) |
| `packages/plugins/plugin-prosemirror/src/index.ts`            | 05         | export view-bridge API                          | mapped             |
| `packages/plugins/plugin-prosemirror/package.json`            | 05         | `prosemirror-view` + happy-dom devDeps          | mapped (deviation) |
| `packages/plugins/plugin-prosemirror/tsconfig.test.json`      | 05         | `skipLibCheck` for happy-dom types              | mapped             |
| `pnpm-lock.yaml`                                              | 02, 05, 10 | workspace lockfile                              | mapped             |
| `.changeset/add-react-shell.md`                               | 02         | version hook                                    | mapped             |
| `openspec/changes/add-react-shell/**`                         | workflow   | traceability                                    | mapped             |
| `.superpowers/**`                                             | workflow   | plan / tasks / validation                       | mapped             |

**Not modified (correct per non-goals):** `packages/core/**`, `packages/core/package.json`, `bootstrap.ts`, Guard/Permission/store code, Vue Shell, Playwright CI, `examples/react-basic`.

## Requirement Compliance

| Requirement                                                     | Evidence                                                                                       | Result        | Notes                                                                                    |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------- |
| `@aether-md/react` public adapter package                       | `packages/react/`, `package-boundary.test.ts`, validation `pnpm check`                         | pass          | workspace via `packages/*` glob                                                          |
| Core no react/prosemirror/remark runtime deps                   | `packages/core/package.json` unchanged; no core diff                                           | pass          |                                                                                          |
| `AetherEditorRoot` / `Content` / `useAetherEditor` exports      | `index.ts`, boundary test                                                                      | pass          |                                                                                          |
| Root calls `createEditor`; unmount `dispose()`                  | `aether-editor-root.tsx` cleanup effect                                                        | pass          | no explicit spy test; integration unmount asserts DOM teardown                           |
| Content mounts editable DOM view                                | integration test `.ProseMirror`                                                                | pass          | DOM **typing** not exercised (see D3)                                                    |
| `useAetherEditor` bridges `change` → `markdown` / `doc`         | `use-aether-editor.ts`, `use-aether-editor.test.ts`                                            | pass          | React-local state only                                                                   |
| Phase 0 #3: direct `AetherEditor` consumption; no Shell Adapter | `dispatch` / `on` / `getMarkdown` / `getDocument` / `dispose`; boundary forbids `ShellAdapter` | pass          | session via public `editor.context.services.engine.session` (core-api `context` surface) |
| Phase 0 #2: no Core store                                       | core unchanged; hook uses `useState` + `on('change')`                                          | pass          |                                                                                          |
| GateLock `prevValue === nextValue` skips reset                  | `shouldApplyControlledValue`, `gate-lock.integration.test.tsx`                                 | pass          | compares Markdown string per design #5                                                   |
| GateLock integration in CI (no Playwright)                      | `gate-lock.integration.test.tsx` (happy-dom)                                                   | pass          |                                                                                          |
| Input via `AetherEditor.dispatch` → `EngineAdapter.apply`       | `aether-editor-content.tsx` `core:replaceText`; view-bridge `dispatchInput`                    | pass          | no Shell PM state mutation                                                               |
| `onChange` receives updated markdown                            | `react-shell.integration.test.tsx`                                                             | pass          | via dispatch path                                                                        |
| View via plugin-prosemirror bridge; react no `prosemirror-view` | `createProseMirrorView` import; boundary rg guard                                              | pass          |                                                                                          |
| View destroy on unmount                                         | integration ProseMirror null; `view-bridge.test.ts` destroy                                    | pass          |                                                                                          |
| happy-dom integration (no Playwright)                           | `test-setup.ts`, all `*.test.tsx`                                                              | pass          |                                                                                          |
| GFM smoke paragraph / strong / list                             | `gfm-react-smoke.test.tsx` (3 tests)                                                           | pass with gap | paragraph scenario text says “minimal edit”; test is mount/render only (D4)              |
| `editor-orchestration` MODIFIED Shell consumption wording       | core unchanged; react implements bridge only                                                   | pass          |                                                                                          |
| M1–M4.5 regression                                              | validation `pnpm check` / `pnpm core:test`                                                     | pass          |                                                                                          |

## OpenSpec Scenario Coverage

| Scenario (delta spec)                                  | Test / evidence                                             | Result                         |
| ------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------ |
| React package consumable from workspace                | `package-boundary.test.ts` exports + types                  | pass                           |
| React package participates in `pnpm check`             | validation.md Task 10                                       | pass                           |
| Root creates and disposes `AetherEditor`               | `aether-editor-root.tsx`; integration unmount               | pass (implicit)                |
| Content mounts editable view                           | `react-shell.integration.test.tsx` `.ProseMirror`           | pass                           |
| `useAetherEditor` exposes bridged markdown state       | `use-aether-editor.test.ts`, GFM smoke                      | pass                           |
| No Shell Adapter protocol                              | `package-boundary.test.ts`                                  | pass                           |
| Equal controlled value does not reset document         | `gate-lock.integration.test.tsx`                            | pass                           |
| GateLock integration test in CI                        | `gate-lock.integration.test.tsx`                            | pass                           |
| Typing emits change through dispatch path              | `react-shell.integration.test.tsx` (dispatch, not DOM type) | deviation (D3)                 |
| `onChange` receives updated markdown                   | `react-shell.integration.test.tsx`                          | pass                           |
| React uses plugin-prosemirror bridge                   | `aether-editor-content.tsx`, boundary test                  | pass                           |
| View destroy on content unmount                        | integration + `view-bridge.test.ts`                         | pass                           |
| Mount / type / change / dispose integration            | `react-shell.integration.test.tsx`                          | partial (dispatch not type)    |
| Dispose leaves no active editor; dispatch fail-closed  | unmount clears DOM only                                     | gap (D5)                       |
| GFM paragraph / strong / list smoke                    | `gfm-react-smoke.test.tsx`                                  | partial (no edit in paragraph) |
| `EditorStateSnapshot` read-only; no Core store         | core unchanged (M4.5 tests)                                 | pass (N/A change)              |
| React bridges `change` without Core store              | `use-aether-editor.test.ts`                                 | pass                           |
| Core orchestration unchanged; no Shell Adapter in core | no `packages/core` diff                                     | pass                           |

## Focus Review (requested)

### 1. Phase 0 #3 — React consumes `AetherEditor` directly; no Shell Adapter

**pass.** `@aether-md/react` calls `createEditor`, `editor.dispatch`, `editor.on`, `getMarkdown`, `getDocument`, and `dispose` without an intermediate adapter protocol. `AetherEditorContent` obtains `EngineSession` through the documented public `AetherEditor.context.services.engine.session` surface (not the plugin `sessions` Map). No `ShellAdapter` type, export, or re-export of `createEditor` from the react package.

### 2. Core boundary — no react/prosemirror runtime deps

**pass.** Git diff contains **zero** `packages/core/**` changes. `packages/core/package.json` retains empty runtime `dependencies`. Existing `package-boundary.test.ts` guards remain applicable.

### 3. GateLock vs `docs/engineering/data-flow.md`

**pass.** Data-flow places GateLock after `emit('change')` on the success path. Implementation:

- User edit → `dispatch` → adapter apply → `change` → Root/hook updates local state → `onChange(markdown)` → optional parent re-render.
- Controlled prop effect uses `shouldApplyControlledValue(prev, next)` on Markdown strings; equal values skip `dispose` + `createEditor` reinit (`gate-lock.integration.test.tsx` edits doc then forces parent rerender with unchanged `value`).
- `prevControlledRef` tracks controlled prop only (validation deviation D2), preventing feedback-loop re-parse.

When `prev !== next`, Root **may** reinitialize via `dispose` + `createEditor` (design Decision #5) — acceptable.

### 4. OpenSpec scenarios vs tests

**pass with deviations.** All scenarios have implementation evidence; three have documented test gaps (D3–D5) that do not violate architecture but fall short of literal scenario wording (DOM typing, post-dispose fail-closed, paragraph “minimal edit”).

### 5. Non-goals

**pass.** No Vue Shell, toolbar, theme, History UI, Core Guard chain, Permission enforce, Core subscribe/store, Shell Adapter, `bootstrapCore` silent provide change, Playwright, or `examples/react-basic`. `plugin-prosemirror` changes are additive (view-bridge + schema DOM specs).

## Boundary Review

- **Core boundary:** pass. No production or dependency changes in `@aether-md/core`.
- **Plugin contract:** pass. `EngineAdapter` behavior unchanged; additive view-bridge + internal `readSessionEditorState` for bridge sync only.
- **Adapter boundary:** pass. `prosemirror-view` confined to `plugin-prosemirror`; react imports bridge API only.
- **Shell boundary:** pass. React concerns (GateLock, context, hook state) live in `packages/react`; no DOM/PM in core.
- **Command/event flow:** pass. DOM transactions route through `dispatchInput` → `core:replaceText` → `dispatch` → `apply` → `change`; view-bridge test asserts session doc unchanged until adapter apply + refresh.

## Anticorruption Checklist

| Check                                                 | Result | Notes                                                               |
| ----------------------------------------------------- | ------ | ------------------------------------------------------------------- |
| Every changed file maps to a task                     | pass   | see Changed-file Mapping                                            |
| Every task maps to spec requirement                   | pass   | tasks 01–10 reference `react-shell` / `editor-orchestration` deltas |
| Core remains business-blind                           | pass   | core untouched                                                      |
| UI Shell concerns do not leak into Core               | pass   |                                                                     |
| Third-party engines inside Adapter boundaries         | pass   | PM view in plugin-prosemirror only                                  |
| State changes route through Command Bus (engine path) | pass   | `core:replaceText` dispatch path                                    |
| Dependency direction Shell → Core → Plugin → Adapter  | pass   | react → core + plugin-prosemirror                                   |
| Tests not weakened                                    | pass   | 14 react + 20 plugin-prosemirror tests; workspace check green       |
| Public contract changes explicit in OpenSpec          | pass   | delta specs + proposal Version Impact                               |
| Deviations recorded                                   | pass   | validation.md + task Deviation sections                             |
| New ADR required                                      | no     | follows ADR 003 dual-track; design captures M5 contract             |

## Validation Review

- **Automated (validation.md Task 10):**
  - `pnpm check`: **pass** (15 turbo tasks)
  - `openspec validate add-react-shell --strict`: **pass**
  - `@aether-md/react`: 14 tests pass
  - `@aether-md/plugin-prosemirror`: 20 tests pass (incl. view-bridge)
  - Boundary rg guards: pass (validation.md)
- **TDD integrity:** Red→Green recorded per task; integration depends on view-bridge (Task 05) before Content (Task 06).
- **Intuitive verification:** GateLock equal-value rerender + dispatch onChange trace documented in validation.md.

## Accepted Deviations

| ID  | Area                            | Deviation                                                                                    | Rationale / Mitigation                                                                                                     |
| --- | ------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| D1  | Task 05 / `conversion.ts`       | Added `toDOM` / `parseDOM` on schema nodes/marks                                             | Required for `EditorView` DOM rendering; additive; headless round-trip unchanged                                           |
| D2  | Task 05 / `engine.ts`           | Exported `readSessionEditorState` for view-bridge sync                                       | Internal bridge read; not part of `EngineAdapter` contract; not exposed to react beyond session handle                     |
| D3  | Tasks 07–08 / integration tests | Integration asserts `dispatch` path instead of simulating DOM keyboard input                 | Documented in validation.md; happy-dom PM typing deferred for Node stability; view-bridge unit test covers `dispatchInput` |
| D4  | Task 09 / GFM paragraph smoke   | Test mounts and asserts render; no simulated edit                                            | Strong/list scenarios similarly render-first; follow-up may add dispatch edit for literal “minimal edit” wording           |
| D5  | Task 07 / dispose scenario      | No react integration test for post-unmount `dispatch` → `EDITOR_DISPOSED`                    | Core M4.5 orchestration already covers fail-closed; react test only asserts ProseMirror DOM removed                        |
| D6  | Task 06 / Root                  | `pluginsKey` from manifest names stabilizes mount effect vs inline `plugins` array reference | Prevents spurious remount; recorded in validation.md                                                                       |
| D7  | Task 05 / plugin-prosemirror    | `happy-dom` devDependencies for view-bridge tests                                            | Test-only; not runtime dep of react                                                                                        |

## Blockers

**None.** Implementation satisfies OpenSpec M5 requirements with recorded deviations; Barrier validation green.

## Must-fix Items

**None required before proceeding to archive / docs sync.**

Recommended follow-ups (not compliance blockers):

1. **Archive docs sync (A7):** Sync `react-shell` main spec; MODIFIED `editor-orchestration`; update `docs/engineering/test-strategy.md` M5 baseline, `docs/architecture/package-layout.md`, and check off `docs/architecture/ci-checklist.md` GateLock item (#41) via `aether-workflow-update-docs-spec`.
2. **Optional test gaps:** DOM typing integration (happy-dom `userEvent` / PM `insertText`); post-unmount `EDITOR_DISPOSED` react integration; GFM paragraph smoke with one `dispatch` edit.
3. **Commit hygiene:** Stage all workflow artifacts with implementation; Conventional Commits `feat(react)`, `feat(plugin-prosemirror)`, `test(react)` per plan.

## Required Updates (post-review workflow)

| Area       | Action                                                             | When                                    |
| ---------- | ------------------------------------------------------------------ | --------------------------------------- |
| Docs       | test-strategy M5, package-layout, ci-checklist GateLock checkbox   | `aether-workflow-update-docs-spec`      |
| Specs      | Sync `openspec/specs/react-shell`, MODIFIED `editor-orchestration` | archive / update-docs-spec              |
| ADR        | none                                                               | —                                       |
| Glossary   | none expected                                                      | —                                       |
| Changesets | `@aether-md/react` new; `@aether-md/plugin-prosemirror` minor      | `.changeset/add-react-shell.md` present |

## Version / Export Review

| Surface                                      | Change                                                                           | Recorded                        |
| -------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------- |
| `@aether-md/react` exports                   | `AetherEditorRoot`, `AetherEditorContent`, `useAetherEditor`, props/result types | yes (spec, index.ts, Changeset) |
| `@aether-md/react` dependencies              | `@aether-md/core`, `@aether-md/plugin-prosemirror`; peer `react`                 | yes                             |
| `@aether-md/plugin-prosemirror` exports      | `+createProseMirrorView`, `+refreshProseMirrorViewFromSession`, types            | yes                             |
| `@aether-md/plugin-prosemirror` dependencies | `+prosemirror-view`                                                              | yes                             |
| `@aether-md/core`                            | unchanged                                                                        | yes (validation guards)         |
| `manifestVersion`                            | `[1]` unchanged                                                                  | yes                             |
| Lockfile                                     | react, happy-dom, prosemirror-view, testing-library                              | yes                             |

## Code-management Review

- **Branch:** `feat/add-react-shell` matches change name — pass.
- **Working tree:** implementation uncommitted (expected pre-PR); OpenSpec + Superpowers artifacts present alongside code.
- **Commit readiness:** Recommend scoped commits per Superpowers task or grouped `feat(react)` + `feat(plugin-prosemirror)`; PR body must cite OpenSpec change id, task ids, validation path, and deviations D1–D7.
- **Unrelated files:** none identified.

## Recommendation

**PASS WITH DEVIATIONS** — proceed to:

1. **Commit** implementation + workflow artifacts (user-initiated).
2. **`aether-workflow-archive-change`** after PR approval, or
3. **`aether-workflow-update-docs-spec`** to sync long-lived docs and main specs.

No implementation rework required for spec compliance or anticorruption boundaries. Optional follow-ups (DOM typing integration, dispose fail-closed react test, GFM paragraph edit smoke) may land in a small M5.1 patch or M6 prep.
