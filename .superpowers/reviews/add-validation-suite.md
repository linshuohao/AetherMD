# Compliance Review: add-validation-suite

## Summary

- **Status: PASS WITH DEVIATIONS**
- OpenSpec change: `add-validation-suite`
- Branch: `feat/add-validation-suite`
- Review date: 2026-07-05
- **Skills loaded:** `openspec-apply-change`, `requesting-code-review`
- OpenSpec: `openspec validate add-validation-suite --strict` — **pass** (per validation.md Task 09); planning artifacts complete (`proposal`, `design`, delta specs, `tasks.md`, plan, Superpowers tasks 01–09, validation)
- **Version impact:** five linked packages remain `0.0.0` / `private: true`; **no** public API or `manifestVersion` change (`SUPPORTED_MANIFEST_VERSIONS` still `[1]`); additive MIT `license` / `repository` / `files` / `publishConfig` on five packages; Changesets `linked` group configured; root `changeset:publish` script reserved; new `@aether-md/example-headless-gfm` workspace private package; `pnpm-lock.yaml` updated for example deps

## Artifact Coverage

| Artifact          | Present | Notes                                                                                                             |
| ----------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| Proposal          | yes     | `openspec/changes/add-validation-suite/proposal.md`                                                               |
| Design            | yes     | `openspec/changes/add-validation-suite/design.md`                                                                 |
| Delta specs       | yes     | `validation-suite` ADDED; `engineering-workflow` ADDED (CI gate wording)                                          |
| OpenSpec tasks    | yes     | `openspec/changes/add-validation-suite/tasks.md` — **all `[ ]` unchecked** (artifact drift; see Required Updates) |
| Plan              | yes     | `.superpowers/plans/add-validation-suite.md`                                                                      |
| Superpowers tasks | yes     | `.superpowers/tasks/add-validation-suite/01`–`09`                                                                 |
| Validation        | yes     | `.superpowers/runs/add-validation-suite/validation.md` — Barrier green                                            |
| Changeset entry   | no      | **accepted deviation** — M6 metadata-only prep; no publish; packages `private: true`                              |
| Review            | yes     | this file                                                                                                         |

## Changed-file Mapping

| File                                                         | Task       | Requirement / Source Doc                        | Status |
| ------------------------------------------------------------ | ---------- | ----------------------------------------------- | ------ |
| `pnpm-workspace.yaml`                                        | 01         | Headless example workspace entry                | mapped |
| `examples/headless-gfm/package.json`                         | 01, 02, 06 | private package; typecheck/check scripts        | mapped |
| `examples/headless-gfm/tsconfig.json`                        | 01, 02     | G6 `tsc --noEmit` scaffold                      | mapped |
| `examples/headless-gfm/src/run.ts`                           | 02         | Headless GFM integration demo                   | mapped |
| `pnpm-lock.yaml`                                             | 01         | workspace install lockfile                      | mapped |
| `packages/core/package.json`                                 | 03, 05     | publish prep metadata; test script fix for G11  | mapped |
| `packages/plugins/plugin-remark/package.json`                | 03         | M6 publish prep metadata                        | mapped |
| `packages/plugins/plugin-prosemirror/package.json`           | 03         | M6 publish prep metadata                        | mapped |
| `packages/preset-gfm/package.json`                           | 03         | M6 publish prep metadata                        | mapped |
| `packages/react/package.json`                                | 03         | M6 publish prep metadata                        | mapped |
| `.changeset/config.json`                                     | 04         | Changesets `linked` five-package group          | mapped |
| `package.json`                                               | 04         | `changeset:publish` script                      | mapped |
| `packages/core/src/manifest-doc-consistency.test.ts`         | 05         | G11 manifest ↔ docs consistency                 | mapped |
| `packages/core/src/editor/startup-abort.integration.test.ts` | 07         | `createEditor` duplicate-name abort regression  | mapped |
| `docs/project-status.md`                                     | 08         | M6 status + G12 v1.0 gap anchor                 | mapped |
| `docs/architecture/roadmap.md`                               | 08         | M6 snapshot + gap cross-ref                     | mapped |
| `docs/architecture/ci-checklist.md`                          | 08         | M6 enabled gates (G11, G6, behavior regression) | mapped |
| `docs/community/release-process.md`                          | 04, 08     | M6 prep complete; M7 deferred                   | mapped |
| `docs/engineering/test-strategy.md`                          | 08         | M6 validation suite baseline section            | mapped |
| `openspec/changes/add-validation-suite/**`                   | workflow   | OpenSpec traceability                           | mapped |
| `.superpowers/plans/add-validation-suite.md`                 | workflow   | implementation plan                             | mapped |
| `.superpowers/tasks/add-validation-suite/**`                 | 01–09      | scoped task records                             | mapped |
| `.superpowers/runs/add-validation-suite/validation.md`       | 09         | barrier validation record                       | mapped |

**Not modified (correct per non-goals):** `packages/core/src/**` production code (`create-editor.ts`, `manifest.ts`, adapters, bootstrap, etc.); `packages/react/src/**`; adapter plugin runtime logic; `.github/workflows/**` Release job; `private: true` removal; `NPM_TOKEN` / `.npmrc` token config.

**Unrelated files:** none identified in implementation diff.

## Requirement Compliance

| Requirement                                                    | Evidence                                                | Result              | Notes                                                                    |
| -------------------------------------------------------------- | ------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------ |
| `examples/headless-gfm` private Node headless demo             | `examples/headless-gfm/`, validation smoke `start`      | pass                | `private: true`; no React/DOM deps                                       |
| `createEditor` + `createGfmPreset()` + explicit adapter wiring | `examples/headless-gfm/src/run.ts`                      | pass                | wiring inlined in example (Task 02 deviation); not Core public API       |
| Five-package MIT publish prep metadata                         | five `package.json` + node assertion in validation      | pass                | `private: true` retained                                                 |
| Changesets `linked` five-package group                         | `.changeset/config.json`                                | pass                |                                                                          |
| Root `changeset:publish` without publish execution             | root `package.json`; no Release workflow                | pass                |                                                                          |
| G11 `SUPPORTED_MANIFEST_VERSIONS` ↔ `docs/sdk/manifest.md`     | `manifest-doc-consistency.test.ts`; 85 core tests       | pass                | fails `pnpm check` on drift                                              |
| Official packages `manifestVersion` in support list            | same test file scan                                     | pass                |                                                                          |
| G6 `examples/headless-gfm` `tsc --noEmit` in `pnpm check`      | turbo check pipeline; validation Task 06                | pass                | intentional TS error fails check                                         |
| G5 M1–M5 regression green                                      | validation `pnpm check`; 85 core tests                  | pass                |                                                                          |
| `createDefaultConflictResolver` schema abort unit test         | `conflict-resolver.test.ts` (unchanged, pre-existing)   | pass                |                                                                          |
| `createEditor` unsupported `manifestVersion` abort             | `editor-orchestration.test.ts` (pre-existing)           | pass with deviation | not duplicated in `startup-abort.integration.test.ts`; comment cross-ref |
| `createEditor` duplicate `metadata.name` abort                 | `startup-abort.integration.test.ts` (2 cases)           | pass                | includes pre-lifecycle abort assertion                                   |
| compile-layer schema merge **not** required                    | design Decision 6; ci-checklist annotation              | pass                | deferred explicitly                                                      |
| G12 v1.0 gap documentation                                     | `docs/project-status.md#v10-差距`; `roadmap.md` table   | pass                |                                                                          |
| Release process M6 prep without publish                        | `docs/community/release-process.md`                     | pass                |                                                                          |
| M6 gates in root `pnpm check`                                  | `engineering-workflow` delta; validation barrier        | pass                |                                                                          |
| Core no react/prosemirror/remark runtime leak                  | no core `src/` production diff; existing boundary tests | pass                | new tests use mocks / filesystem scan only                               |
| No npm publish / Release workflow                              | validation non-goals; no `.github` release job          | pass                |                                                                          |
| Tests not weakened                                             | no test deletions; core `test` script `find` fix        | pass                | **strengthens** G11 participation in check                               |

## ADR 009 M6 Scope Coverage

| ADR 009 M6 deliverable                                                | Status | Evidence                                                  |
| --------------------------------------------------------------------- | ------ | --------------------------------------------------------- |
| `examples/headless-gfm` Node demo                                     | ✅     | `examples/headless-gfm/src/run.ts`; validation smoke      |
| LICENSE + package `license` field sync                                | ✅     | five packages `license: "MIT"`; root LICENSE pre-existing |
| Changesets `linked` + publish prep metadata                           | ✅     | `.changeset/config.json`; five `package.json`             |
| Root `changeset:publish` script (no execute)                          | ✅     | root `package.json`                                       |
| `release-process.md` M6 prep                                          | ✅     | docs updated                                              |
| G6 examples `tsc --noEmit`                                            | ✅     | G6 gate                                                   |
| G11 manifest version doc consistency                                  | ✅     | G11 gate                                                  |
| G5 contract test key paths                                            | ✅     | 85 core tests + existing adapter/preset/react suites      |
| G12 roadmap gap explicit in docs                                      | ✅     | `project-status.md`                                       |
| **Excluded:** npm publish, `NPM_TOKEN`, Release CI, `private` removal | ✅     | validation non-goals confirmed                            |

## Gate Status (G5 / G6 / G11 / G12)

| Gate    | M6 target                                   | Status   | Evidence                                                                         |
| ------- | ------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| **G5**  | Contract test key paths green               | **PASS** | `pnpm check` barrier; `@aether-md/core` 85 tests; M1–M5 package suites unchanged |
| **G6**  | `examples/*` or SDK examples `tsc --noEmit` | **PASS** | `@aether-md/example-headless-gfm` `typecheck` in turbo `check`                   |
| **G11** | `SUPPORTED_MANIFEST_VERSIONS` ↔ SDK docs    | **PASS** | `manifest-doc-consistency.test.ts` in core test run                              |
| **G12** | v1.0 roadmap gap documented                 | **PASS** | `docs/project-status.md` gap table + `roadmap.md` cross-ref                      |

## Boundary Review

- **Core boundary:** **pass.** Zero production-code changes under `packages/core/src/`. New tests do not import `remark`, `prosemirror`, or `react` at runtime. `manifest-doc-consistency.test.ts` scans official package **source paths** via filesystem only. `startup-abort.integration.test.ts` uses in-test mock presets via `adapter-wiring` helpers already in core test surface.
- **Plugin contract:** **pass.** No manifest or capability contract changes; G11 enforces existing `manifestVersion: 1` alignment.
- **Adapter boundary:** **pass.** Example depends on adapter packages at **host** layer (`examples/headless-gfm`); core remains adapter-agnostic.
- **Shell boundary:** **pass.** No React/DOM in example; no core UI concerns added.
- **Command/event flow:** **pass.** Example uses `editor.dispatch` for `core:replaceText`; no new Command Bus bypass in core.

## Validation Review

- **Automated/design checks:** `pnpm check` **PASS** (validation Task 09); `openspec validate add-validation-suite --strict` **PASS**; headless example `start` smoke **PASS**; linked group node assertion **PASS**.
- **Intuitive verification:** Example stdout `**bold**` + `**bold** edited` recorded in validation.md.
- **Deviations (accepted):**
  1. **`pnpm changeset:status --since main` FAIL** — no Changeset file for metadata-only M6 prep; packages `private: true` at `0.0.0`. Linked config verified separately. M7 will add changesets before publish.
  2. **Unsupported `manifestVersion` integration** — covered by pre-existing `editor-orchestration.test.ts`, not duplicated in new `startup-abort.integration.test.ts` (comment cross-reference). Aligns with design Decision 6 minimum coverage.
  3. **Example inlined `toExtensionPluginFromPreset` / stub plugins** — host-layer wiring only; not promoted to Core public API (Task 02 Run Log).
  4. **Core `test` script glob → `find`** — infrastructure fix so top-level G11 tests run; strengthens CI, not weakens.

## Test Integrity

| Check                    | Result    | Notes                                                                 |
| ------------------------ | --------- | --------------------------------------------------------------------- |
| Tests deleted or skipped | **none**  | only additions                                                        |
| Assertions weakened      | **none**  | duplicate-name test adds pre-`onInit` guard                           |
| Coverage gaps vs spec    | **minor** | unsupported manifestVersion relies on existing test file (documented) |
| M1–M5 count regression   | **none**  | 85 core tests pass (up from pre-G11 baseline)                         |

## Version And Code-Management Review

- **Branch:** `feat/add-validation-suite` matches change id — **pass**.
- **Semver:** unchanged `0.0.0`; no Changeset version bump required for M6 prep — **pass**.
- **Public contract:** no new core/react exports; `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` unchanged — **pass**.
- **Commit readiness:** recommend grouped commits per task wave or single feat commit referencing OpenSpec change id + Superpowers tasks; PR should note accepted `changeset:status` deviation.

## Blockers

**None.** Implementation matches OpenSpec delta specs and ADR 009 M6 scope. No anticorruption violations requiring code fix before docs/spec sync.

**Follow-up (non-blocking):**

- Before archive: tick `openspec/changes/add-validation-suite/tasks.md` checkboxes to match completed Superpowers tasks (artifact hygiene).
- M7: add Changeset entries when preparing first publish.

## Required Updates

- **Docs:** none blocking — M6 long-lived docs updated in Task 08.
- **Specs (main):** sync after review — `openspec/specs/validation-suite/spec.md` (new); optional `openspec/specs/engineering-workflow/spec.md` MODIFIED gate wording. **Not done yet** (expected pre-archive via `aether-workflow-update-docs-spec`).
- **ADR:** none — implementation follows ADR 009; no new ADR required.
- **Glossary:** none.
- **OpenSpec change tasks.md:** mark sections 1–7 complete to align with validation record.

## Recommendation

**PASS WITH DEVIATIONS** — proceed to **`aether-workflow-update-docs-spec`** (sync `validation-suite` main spec + optional `engineering-workflow` delta), then **`aether-workflow-archive-change`**.

Do **not** archive in this review step. Do **not** execute npm publish or add Release workflow until M7.
