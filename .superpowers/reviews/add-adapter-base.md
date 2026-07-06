# Compliance Review: add-adapter-base

## Summary

- Status: **pass** with recorded accepted deviations; no blockers for Step 8 docs/spec sync.
- OpenSpec change: `add-adapter-base`
- Branch: `feat/add-adapter-base`
- Review date: 2026-07-05
- Version impact: `@aether-md/core` minor-level additive public exports (document-model + adapter-base); new `@aether-md/plugin-remark` and `@aether-md/plugin-prosemirror` at `0.0.0`; `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` unchanged; `pnpm-lock.yaml` updated for Remark/ProseMirror deps only in plugin packages.
- Skills loaded: `openspec-apply-change`, `requesting-code-review`
- OpenSpec: `openspec validate add-adapter-base --strict` — pass; planning artifacts complete (`isComplete: true`).

## Artifact Coverage

| Artifact          | Present | Notes                                                                                       |
| ----------------- | ------- | ------------------------------------------------------------------------------------------- |
| Proposal          | yes     | `openspec/changes/add-adapter-base/proposal.md`                                             |
| Design            | yes     | `openspec/changes/add-adapter-base/design.md`                                               |
| Delta specs       | yes     | `document-model`, `adapter-base` ADDED; `core-bootstrap` MODIFIED                           |
| OpenSpec tasks    | yes     | `openspec/changes/add-adapter-base/tasks.md` (checkboxes still open — expected pre-archive) |
| Plan              | yes     | `.superpowers/plans/add-adapter-base.md`                                                    |
| Superpowers tasks | yes     | `.superpowers/tasks/add-adapter-base/01`–`08`, all marked complete                          |
| Validation        | yes     | `.superpowers/runs/add-adapter-base/validation.md` — 64/64 tests, guards pass               |
| Review            | yes     | this file                                                                                   |

## Changed-file Mapping

| File                                                         | Task     | Requirement / Source Doc                                         | Status                          |
| ------------------------------------------------------------ | -------- | ---------------------------------------------------------------- | ------------------------------- |
| `packages/core/src/document-model.ts`                        | 01       | `AetherDoc public types`; `Minimal AetherSchema`; extended types | mapped                          |
| `packages/core/src/document-model.test.ts`                   | 01       | JSON serializable shape; schema `{ version: 1 }`                 | mapped                          |
| `packages/core/src/adapter-types.ts`                         | 02       | `Adapter protocol types are exported from core`                  | mapped                          |
| `packages/core/src/adapter-types.test.ts`                    | 02       | protocol + error shape smoke; core deps guard                    | mapped                          |
| `packages/core/src/errors.ts`                                | 02       | `AdapterError and SerializationError are exported`               | mapped                          |
| `packages/core/src/index.ts`                                 | 01, 02   | public exports for document-model + adapter-base                 | mapped                          |
| `packages/core/src/package-boundary.test.ts`                 | 02, 07   | `core-bootstrap` MODIFIED boundary; M4/M5 exclusion              | mapped                          |
| `packages/plugins/plugin-remark/package.json`                | 03       | workspace package scaffold                                       | mapped                          |
| `packages/plugins/plugin-remark/tsconfig*.json`              | 03       | build/typecheck/test scripts                                     | mapped                          |
| `packages/plugins/plugin-remark/src/parser.ts`               | 03       | `Remark parser returns AetherDoc`                                | mapped                          |
| `packages/plugins/plugin-remark/src/parser.test.ts`          | 03       | paragraph, heading, unknown-syntax degradation                   | mapped                          |
| `packages/plugins/plugin-remark/src/serializer.ts`           | 04       | `Remark serializer produces deterministic Markdown`              | mapped                          |
| `packages/plugins/plugin-remark/src/serializer.test.ts`      | 04       | deterministic paragraph + heading output                         | mapped                          |
| `packages/plugins/plugin-remark/src/index.ts`                | 03, 04   | factory exports                                                  | mapped                          |
| `packages/plugins/plugin-prosemirror/package.json`           | 05, 06   | workspace package; devDep remark for integration                 | mapped                          |
| `packages/plugins/plugin-prosemirror/tsconfig*.json`         | 05       | build/typecheck/test scripts                                     | mapped                          |
| `packages/plugins/plugin-prosemirror/src/conversion.ts`      | 05       | AetherDoc ↔ ProseMirror (adapter-private)                        | mapped                          |
| `packages/plugins/plugin-prosemirror/src/engine.ts`          | 05       | `EngineAdapter` create/apply/getDocument/dispose                 | mapped                          |
| `packages/plugins/plugin-prosemirror/src/engine.test.ts`     | 05       | success/failure snapshot, dispose, AdapterError                  | mapped                          |
| `packages/plugins/plugin-prosemirror/src/round-trip.test.ts` | 06       | M3 round-trip paragraph + heading; no editor wiring              | mapped                          |
| `packages/plugins/plugin-prosemirror/src/index.ts`           | 05       | factory export                                                   | mapped                          |
| `pnpm-lock.yaml`                                             | 03–06    | Remark/ProseMirror dependency lock                               | mapped                          |
| `.superpowers/runs/add-adapter-base/validation.md`           | 08       | verification evidence                                            | mapped                          |
| `.superpowers/tasks/add-adapter-base/*.md`                   | 01–08    | task execution records                                           | mapped                          |
| `.superpowers/plans/add-adapter-base.md`                     | plan     | implementation plan                                              | mapped                          |
| `openspec/changes/add-adapter-base/**`                       | OpenSpec | proposal/design/specs/tasks delta                                | mapped (pre-existing untracked) |

**Not modified (correct per non-goals):** `packages/core/src/bootstrap.ts`, `capabilities.ts`, `command-event-runtime.ts`, `lifecycle.ts`, `manifest.ts`.

**Unrelated dirty files:** none observed beyond OpenSpec/Superpowers workflow artifacts for this change.

## Requirement Compliance

| Requirement                                    | Evidence                                                        | Result | Notes                                                                     |
| ---------------------------------------------- | --------------------------------------------------------------- | ------ | ------------------------------------------------------------------------- |
| AetherDoc public types exported from core      | `document-model.ts`, `index.ts`, `document-model.test.ts`       | pass   | M3 block/inline subset + extended types (`ListBlock`, `LinkInline`, etc.) |
| Document types framework-independent           | `JSON.stringify` shape test                                     | pass   | no function/DOM/engine leaks asserted                                     |
| Minimal AetherSchema exported                  | `{ version: 1 }` test                                           | pass   | no compile-layer merge                                                    |
| Extended types without M3 round-trip           | types exported; tests scoped to paragraph/heading               | pass   |                                                                           |
| Adapter protocol types exported                | `adapter-types.ts`, `adapter-types.test.ts`                     | pass   | includes `ReplaceTextCommand` as M3 `AdapterCommandRequest`               |
| AdapterError / SerializationError exported     | `errors.ts`, boundary + adapter tests                           | pass   | `source`/`severity` match error-model                                     |
| Core has no remark/prosemirror/react deps      | `core/package.json`, adapter-types + boundary tests             | pass   |                                                                           |
| Remark plugin Parser + Serializer              | `plugin-remark` parser/serializer + 7 tests                     | pass   |                                                                           |
| ProseMirror EngineAdapter                      | `plugin-prosemirror/engine` + 5 contract tests                  | pass   |                                                                           |
| Successful apply returns updated doc           | `engine.test.ts` replaceText success                            | pass   |                                                                           |
| Failed apply preserves snapshot                | `engine.test.ts` invalid blockIndex                             | pass   |                                                                           |
| Engine session dispose safe                    | repeated dispose test                                           | pass   |                                                                           |
| M3 minimal Markdown round-trip                 | `round-trip.test.ts` 2 scenarios                                | pass   | `"Hello world\n"`, `"## Title\n\nBody\n"`                                 |
| Round-trip without createEditor/Shell          | import-line guard in integration test                           | pass   |                                                                           |
| Adapter packages in workspace verification     | `pnpm check` 3 packages                                         | pass   |                                                                           |
| M3 no Command Bus auto rollback                | `command-event-runtime.ts` unchanged; rg no `transactionFailed` | pass   |                                                                           |
| core-bootstrap boundary updated                | `package-boundary.test.ts` M3 allow + M4/M5 forbid              | pass   |                                                                           |
| No bootstrap silent provide core:engine/parser | `M1_CORE_CAPABILITIES` + capabilities.ts unchanged              | pass   |                                                                           |
| Explicit non-goals (§8)                        | validation.md checklist                                         | pass   | GFM/Shell/createEditor/bootstrap adapter loading/M1 follow-up excluded    |

## Boundary Review

- **Core boundary:** pass. `@aether-md/core` adds types and error classes only; no remark/prosemirror/react/vue runtime dependencies; production source has zero engine imports.
- **Plugin contract:** pass. Plugin packages depend on `@aether-md/core` public types; direction is plugin → core only (prosemirror devDep on remark is test-only for integration).
- **Adapter boundary:** pass. Remark and ProseMirror APIs confined to `packages/plugins/*`; `AetherDoc` conversions encapsulated in plugin-remark parser/serializer and plugin-prosemirror conversion module.
- **Shell boundary:** pass. No React/Vue/GFM preset packages or imports; core exports exclude `createEditor`, `AetherEditor`, `EditorContext`, `getMarkdown`, host-level `getDocument`.
- **Command/event flow:** pass. M2 `createCommandEventRuntime` untouched; no Adapter invocation or automatic `transactionFailed` emit. M3 edits route through explicit `EngineAdapter.apply` in tests only.

## Anticorruption Checklist

| Check                                        | Result         | Notes                                                                    |
| -------------------------------------------- | -------------- | ------------------------------------------------------------------------ |
| Every changed file maps to a task            | pass           | see Changed-file Mapping                                                 |
| Every task maps to spec requirement          | pass           | tasks 01–08 align with OpenSpec delta specs + `tasks.md`                 |
| Public contract changes explicit in OpenSpec | pass           | proposal/design/delta specs cover all new exports                        |
| Deviations recorded                          | pass           | validation.md + task Run Logs                                            |
| Core remains business-blind                  | pass           | no Markdown/PM logic in core                                             |
| UI Shell does not leak into Core             | pass           |                                                                          |
| Third-party engines inside Adapter packages  | pass           | ADR 003 respected                                                        |
| State changes via Command Bus where required | N/A            | M3 explicitly excludes Bus ↔ Adapter integration                         |
| Tests not weakened                           | pass           | core 49 (+11 net new), remark 7, prosemirror 8; M1/M2 suites still green |
| No silent fallback                           | pass with note | unknown syntax degrades to paragraph/text (explicit, tested)             |
| New ADR required                             | no             | follows ADR 003; no new architecture decision                            |

## Validation Review

- **Automated checks (validation.md + re-verified):**
  - `pnpm check`: pass (64 tests, 0 fail)
  - `openspec validate add-adapter-base --strict`: pass
  - Core rg guard (remark/prosemirror/react/vue/gfm): pass (test assertion strings only)
  - Repo scope guard (createEditor/Shell/GFM): pass
  - No `transactionFailed` in `command-event-runtime.ts`: pass
- **TDD integrity:** red→green recorded per task in validation.md.
- **Intuitive verification:** round-trip tests assert predictable post-edit Markdown; separate from required automated suite per task spec.

## Version Review

- `@aether-md/core`: additive exports; no version bump required (unreleased `0.0.0`).
- New packages: `@aether-md/plugin-remark`, `@aether-md/plugin-prosemirror` at `0.0.0`.
- `SUPPORTED_MANIFEST_VERSIONS`: unchanged `[1]`.
- `pnpm-lock.yaml`: changed; Remark/PM deps scoped to plugin packages only.
- Long-lived docs / main OpenSpec specs: **drift present** — see Required Updates (expected; Step 8 not yet run).

## Code-Management Review

- Branch matches change: `feat/add-adapter-base` ✓
- Recommended commit grouping:
  - `feat(core): add AetherDoc, adapter protocol, and M3 boundary tests` (tasks 01–02, 07)
  - `feat(plugin-remark): add ParserAdapter and SerializerAdapter` (tasks 03–04)
  - `feat(plugin-prosemirror): add EngineAdapter and round-trip integration` (tasks 05–06)
  - `chore: verify add-adapter-base workspace checks` (task 08 validation record)
  - OpenSpec/Superpowers artifacts: separate `docs(openspec)` or bundled in PR body with change id
- PR metadata should cite: OpenSpec `add-adapter-base`, Superpowers tasks 01–08, validation path, deviations, version impact.

## Blockers

- None for implementation/spec compliance.

## Accepted Deviations

| Deviation                                                                                                          | Task | Assessment                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unknown Markdown syntax (e.g. list) degrades via mdast JSON stringify → paragraph text, not structured `ListBlock` | 03   | **Accepted.** Within M3 scope; OpenSpec does not require list round-trip; content preserved not silently dropped.                                |
| `EngineSession` state stored in adapter-private `Map` keyed by `session.id`                                        | 05   | **Accepted.** Protocol requires opaque session handle; Core cannot read internals.                                                               |
| Round-trip import guard checks `import` lines only (test description contains forbidden strings)                   | 06   | **Accepted.** Guard purpose is wiring detection, not string-literal ban in comments.                                                             |
| Task 07 reinforcement largely overlapped Task 02 boundary; added M1 capability + deps guards                       | 07   | **Accepted.** Net positive; no scope creep.                                                                                                      |
| `SerializationError` exported and instantiable but not yet thrown in serializer failure paths                      | 04   | **Accepted.** OpenSpec requires export + shape; M3 serializer happy-path only; failure path deferred to M4 placeholder strategy per error-model. |

## Required Updates (Step 8 — do not sync in this review)

### Docs

| Path                                          | Reason                                                                                                      |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `docs/engineering/error-model.md`             | Still states `AdapterError`/`SerializationError` are future milestones; M3 now exports instantiable classes |
| `docs/engineering/adapter-protocol.md`        | Mark M3 implemented subset; note Bus rollback still deferred                                                |
| `docs/architecture/document-model.md`         | Update status from design draft → M3 baseline implemented                                                   |
| `docs/architecture/core-api.md`               | Document new public exports; keep `createEditor` deferred                                                   |
| `docs/architecture/package-layout.md`         | Record `plugin-remark` / `plugin-prosemirror` packages now exist                                            |
| `docs/architecture/compatibility.md`          | Version/export compatibility notes for new packages                                                         |
| `docs/engineering/test-strategy.md`           | Adapter contract + round-trip test matrix                                                                   |
| `docs/engineering/mvp-implementation-plan.md` | M3 acceptance criteria cross-reference                                                                      |
| `docs/glossary.md`                            | Confirm `AetherDoc`, `AetherSchema`, Adapter terms align with implementation                                |
| `README.md`                                   | Project status / package list                                                                               |

### Specs (main OpenSpec sync on archive)

| Path                                    | Action                                    |
| --------------------------------------- | ----------------------------------------- |
| `openspec/specs/document-model/spec.md` | ADD from change delta                     |
| `openspec/specs/adapter-base/spec.md`   | ADD from change delta                     |
| `openspec/specs/core-bootstrap/spec.md` | MODIFY package boundary from change delta |

### ADR

- None required. Implementation follows ADR 003 (Remark/ProseMirror dual-track isolation).

### Glossary

- Review only; terms likely already defined — verify `AetherSchema` M3 placeholder shape documented.

## Recommendation

- **Result: pass** — implementation matches OpenSpec M3 scope; architecture boundaries preserved; validation green.
- **Recommended next skill:** `aether-workflow-update-docs-spec` (Step 8 docs + main spec sync).
- **Do not archive yet.** Archive after docs/spec sync and intentional commit/PR grouping.
- **Do not commit in this review step** per user instruction.

## Docs/Spec Sync (Step 8)

- **Date:** 2026-07-05
- **Skill:** `aether-workflow-update-docs-spec` + `openspec-sync-specs`
- **Main specs synced:** `document-model` (created), `adapter-base` (created), `core-bootstrap` (MODIFIED boundary)
- **Docs updated:** `project-status.md`, `mvp-implementation-plan.md`, `core-api.md`, `document-model.md`, `adapter-protocol.md`, `error-model.md`, `test-strategy.md`, `package-layout.md`, `compatibility.md`, `glossary.md`
- **ADR:** none (follows ADR 003)
- **Accepted deviations recorded:** see Accepted Deviations section above; reflected in docs where relevant (unknown syntax degradation, SerializationError placeholder deferred, Command Bus rollback deferred)
- **Ready for archive:** yes, after intentional commit/PR grouping
