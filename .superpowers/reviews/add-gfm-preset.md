# Compliance Review: add-gfm-preset

## Summary

- Status: **PASS with follow-ups** — implementation matches OpenSpec M4 GFM scope; architecture boundaries preserved; validation green. Follow-ups are commit grouping and Step 8 docs/spec sync (explicitly deferred in proposal).
- OpenSpec change: `add-gfm-preset`
- Branch: `feat/add-gfm-preset`
- Review date: 2026-07-05
- Version impact: new `@aether-md/preset-gfm@0.0.0`; `@aether-md/plugin-remark` / `@aether-md/plugin-prosemirror` minor GFM behavior extension; `@aether-md/core` additive test-only surface (no production type changes); `remark-gfm` added to plugin-remark; `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` unchanged `[1]`.
- Skills loaded: `openspec-apply-change`, `requesting-code-review`
- OpenSpec: `openspec validate add-gfm-preset --strict` — pass; planning artifacts complete (`isComplete: true`).

## Artifact Coverage

| Artifact | Present | Notes |
| --- | --- | --- |
| Proposal | yes | `openspec/changes/add-gfm-preset/proposal.md` |
| Design | yes | `openspec/changes/add-gfm-preset/design.md` |
| Delta specs | yes | `gfm-preset` ADDED; `document-model`, `adapter-base`, `core-bootstrap` MODIFIED/ADDED |
| OpenSpec tasks | yes | `openspec/changes/add-gfm-preset/tasks.md` (checkboxes still open — expected pre-archive) |
| Plan | yes | `.superpowers/plans/add-gfm-preset.md` |
| Superpowers tasks | yes | `.superpowers/tasks/add-gfm-preset/01`–`11` |
| Validation | yes | `.superpowers/runs/add-gfm-preset/validation.md` — 107/107 tests, guards pass |
| Review | yes | this file |

## Changed-file Mapping

| File | Task | Requirement / Source Doc | Status |
| --- | --- | --- | --- |
| `packages/core/src/document-model.test.ts` | 01 | `GFM built-in types`; `CustomBlock outside GFM matrix` | mapped |
| `packages/core/src/package-boundary.test.ts` | 10 | `core-bootstrap` workspace preset without core re-export | mapped |
| `packages/plugins/plugin-remark/package.json` | 04 | `remark-gfm` dependency | mapped |
| `packages/plugins/plugin-remark/src/parser.ts` | 04 | `Remark adapters support GFM subset parse` | mapped |
| `packages/plugins/plugin-remark/src/parser.test.ts` | 03, 04 | GFM structured parse; M3 degradation preserved | mapped |
| `packages/plugins/plugin-remark/src/serializer.ts` | 04, 09 | GFM deterministic serialize; placeholder strategy | mapped |
| `packages/plugins/plugin-remark/src/serializer.test.ts` | 03, 04, 09 | GFM golden strings; SerializationError paths | mapped |
| `packages/plugins/plugin-prosemirror/src/conversion.ts` | 06 | `ProseMirror engine preserves GFM structures` | mapped |
| `packages/plugins/plugin-prosemirror/src/conversion.test.ts` | 05 | GFM conversion round-trip contract | mapped |
| `packages/plugins/plugin-prosemirror/src/fixtures/gfm-doc.ts` | 05 | GFM fixture for engine/conversion tests | mapped |
| `packages/plugins/plugin-prosemirror/src/engine.test.ts` | 05, 06 | GFM preserve on apply success/failure | mapped |
| `packages/preset-gfm/package.json` | 07 | `@aether-md/preset-gfm` workspace package | mapped |
| `packages/preset-gfm/tsconfig.json` | 07 | build/typecheck scripts | mapped |
| `packages/preset-gfm/tsconfig.test.json` | 07 | test compile config | mapped |
| `packages/preset-gfm/src/manifest.ts` | 07 | `metadata.manifestVersion: 1`, `name: gfm` | mapped |
| `packages/preset-gfm/src/index.ts` | 07 | `createGfmPreset()` public factory | mapped |
| `packages/preset-gfm/src/preset.test.ts` | 07 | Manifest + factory + boundary guards | mapped |
| `packages/preset-gfm/src/round-trip.test.ts` | 08 | Six-syntax GFM round-trip matrix | mapped |
| `pnpm-lock.yaml` | 04, 07 | `remark-gfm`; preset workspace links | mapped |
| `.superpowers/runs/add-gfm-preset/validation.md` | 11 | verification evidence | mapped |
| `.superpowers/tasks/add-gfm-preset/*.md` | 01–11 | task execution records | mapped |
| `.superpowers/plans/add-gfm-preset.md` | plan | implementation plan | mapped |
| `openspec/changes/add-gfm-preset/**` | OpenSpec | proposal/design/specs/tasks delta | mapped |

**Not modified (correct per non-goals):** `packages/core/src/bootstrap.ts`, `capabilities.ts`, `command-event-runtime.ts`, `command-event-types.ts`, `lifecycle.ts`, `document-model.ts`, `index.ts` production exports.

**Unrelated dirty files:** none observed beyond OpenSpec/Superpowers workflow artifacts for this change.

## Requirement Compliance

| Requirement | Evidence | Result | Notes |
| --- | --- | --- | --- |
| GFM preset package exists in workspace | `packages/preset-gfm/`, `pnpm check` (4 packages) | pass | `pnpm-workspace.yaml` `packages/*` includes preset |
| Preset participates in workspace verification | validation Task 11 `pnpm check` | pass | build, typecheck, test via turbo |
| Preset does not place Remark/PM deps in core | `core/package.json`, boundary test deps guard | pass | |
| GFM preset Manifest + factory entry | `manifest.ts`, `preset.test.ts` | pass | `manifestVersion: 1`, `name: gfm` |
| Factory importable without createEditor | `preset.test.ts`, `round-trip.test.ts` import guards | pass | |
| GFM preset owns round-trip integration matrix | `round-trip.test.ts` (7 syntax scenarios) | pass | paragraph, heading, strong, emphasis, list×2, link |
| M3 minimal round-trip remains verified | `plugin-prosemirror/round-trip.test.ts`; preset paragraph/heading cases | pass | |
| GFM built-in types structured round-trip | round-trip + remark parser/serializer + PM engine tests | pass | ListBlock, LinkInline, MarkedInline |
| CustomBlock outside M4 GFM matrix | `document-model.test.ts` CustomBlock describe; serializer placeholder only | pass | no CustomBlock structured round-trip in matrix |
| Extended types exported (MODIFIED) | core types pre-exported; Task 01 smoke tests | pass | zero production diff in core types |
| Remark GFM parse structured AetherDoc | `parser.test.ts` list/link/mark cases | pass | |
| Remark serializer deterministic GFM output | `serializer.test.ts` GFM golden strings | pass | `**`, `*`, `-`, `1.`, `[text](href)` |
| ProseMirror preserves GFM through edit leg | `engine.test.ts` GFM describe; `conversion.test.ts` | pass | success + failure snapshot paths |
| SerializationError placeholder strategy | `serializer.test.ts` CustomBlock + unsupported rejection | pass | `[unsupported:block:<name>]`; `source: 'serialization'` |
| GFM cross-package round-trip verified | `preset-gfm/round-trip.test.ts` | pass | explicit parse → apply → serialize |
| Core excludes GFM preset from exports | `package-boundary.test.ts` | pass | no `createGfmPreset`, `presetGfm` |
| Workspace allows preset without core re-export | boundary test `existsSync` on `packages/preset-gfm` | pass | |
| Core has no remark/prosemirror/react/vue runtime deps | `core/package.json`, rg guard, boundary test | pass | production source zero matches |
| M1 excludes later milestone behavior (MODIFIED) | unchanged bootstrap/capabilities; boundary guards | pass | |
| M2 Command/Event zero behavior change | zero diff vs `main` on `command-event-runtime.ts` | pass | no `transactionFailed` auto emit |
| Explicit non-goals (§7) | validation.md checklist + guard tests | pass | no createEditor/Shell/compile-layer/CustomBlock RT |

## Boundary Review

- **Core boundary:** pass. `@aether-md/core` production code unchanged except tests; no remark/prosemirror/react/vue runtime dependencies; exports exclude `createGfmPreset`, editor, and Shell APIs.
- **Plugin contract:** pass. GFM syntax implementation confined to `plugin-remark` and `plugin-prosemirror`; preset wires factories only, does not duplicate adapter logic.
- **Adapter boundary:** pass. Remark/ProseMirror APIs remain inside `packages/plugins/*`; `AetherDoc` is the interchange contract per ADR 003.
- **Shell boundary:** pass. No React/Vue packages or imports; integration tests assert no `createEditor` / `@aether-md/react` wiring.
- **Command/event flow:** pass. M2 runtime untouched; edits route through explicit `EngineAdapter.apply` in tests only; no Bus rollback integration.

## Anticorruption Checklist

| Check | Result | Notes |
| --- | --- | --- |
| OpenSpec delta requirements have test/validation evidence | pass | see Requirement Compliance; 107 tests green |
| Core has no remark/prosemirror/react/vue runtime deps | pass | `core/package.json` deps empty; rg + boundary test |
| package-boundary forbids createEditor, Shell, bootstrap adapter wiring | pass | `package-boundary.test.ts`; preset uses direct factory wiring in tests only |
| M2 Command/Event zero behavior change | pass | no diff on command-event files vs `main` |
| Non-goals not introduced | pass | validation Task 11 checklist all checked |
| Every changed file maps to a task | pass | see Changed-file Mapping |
| Every task maps to spec requirement | pass | tasks 01–11 align with OpenSpec delta specs |
| Public contract changes explicit in OpenSpec | pass | proposal/design/delta specs cover preset + adapter extensions |
| Deviations recorded | pass | validation.md Tasks 01, 02, 08 |
| Core remains business-blind | pass | no Markdown/PM logic in core production code |
| Third-party engines inside Adapter packages | pass | `remark-gfm` in plugin-remark only |
| Tests not weakened | pass | core 61 (+3), remark 21 (+14), prosemirror 13 (+5), preset 12 (new) |
| New ADR required | no | follows ADR 003; golden-string policy in design |

## Validation Review

- **Automated checks (validation.md Task 11):**
  - `pnpm check`: pass (4 packages, 12 turbo tasks)
  - `openspec validate add-gfm-preset --strict`: pass
  - Package tests: core 61, remark 21, prosemirror 13, preset 12 — all pass
  - Core rg guard (remark/prosemirror/react/vue): pass
  - Non-goals guard (createEditor/Shell/transactionFailed/core:engine): pass
- **TDD integrity:** red→green recorded per task; accepted immediate-pass deviations where M3 types pre-existed (Tasks 01, 02, 08).
- **Intuitive verification:** round-trip golden strings frozen in design; integration tests assert post-edit Markdown predictably.

## Version Review

- `@aether-md/core`: no breaking change; no production export changes.
- `@aether-md/preset-gfm`: new package `0.0.0`.
- `@aether-md/plugin-remark`: minor GFM extension; `remark-gfm` dependency added.
- `@aether-md/plugin-prosemirror`: minor GFM schema/conversion extension.
- `SUPPORTED_MANIFEST_VERSIONS`: unchanged `[1]`.
- `pnpm-lock.yaml`: updated for `remark-gfm` and workspace links.
- Long-lived docs / main OpenSpec specs: **drift present** — expected; Step 8 not yet run.

## Code-Management Review

- Branch matches change: `feat/add-gfm-preset` ✓
- **Commit-readiness follow-up:** implementation files (`packages/preset-gfm/**`, prosemirror `conversion.test.ts`, `fixtures/gfm-doc.ts`) and workflow artifacts remain untracked on branch; stage before PR.
- Recommended commit grouping:
  - `test(core): add GFM document-model and package-boundary guards` (tasks 01, 10)
  - `feat(plugin-remark): GFM parse/serialize and SerializationError strategy` (tasks 03–04, 09)
  - `feat(plugin-prosemirror): GFM conversion and engine preservation` (tasks 05–06)
  - `feat(preset-gfm): scaffold GFM preset with round-trip integration tests` (tasks 07–08)
  - `chore: verify add-gfm-preset workspace checks` (task 11)
  - OpenSpec/Superpowers artifacts: separate `docs(openspec)` commits or PR body citation
- PR metadata should cite: OpenSpec `add-gfm-preset`, Superpowers tasks 01–11, validation path, deviations, version impact.

## Blockers

- None for implementation/spec compliance or proceeding to `aether-workflow-update-docs-spec`.

## Accepted Deviations

| Deviation | Task | Assessment |
| --- | --- | --- |
| GFM/CustomBlock document-model tests passed immediately; M3 already exported types | 01 | **Accepted.** Tests add M4 contract coverage; no production edits required. |
| Zero production diff for document-model types | 02 | **Accepted.** Aligns with design decision 4 (M4 does not modify Core public types). |
| Cross-package integration tests green on first run (prerequisites complete) | 08 | **Accepted.** Valid when Tasks 04/06/07 already implemented; matrix still provides required evidence. |
| Round-trip import guard checks `import` lines only | 06, 08 | **Accepted.** Same pattern as M3 adapter-base review; guards detect wiring, not string literals in comments. |
| `createGfmPreset()` wires adapters directly (not via `bootstrapCore`) | 07 | **Accepted.** Explicit non-goal; matches design and OpenSpec factory scenario. |

## Required Updates (Step 8 — do not sync in this review)

### Docs

| Path | Reason |
| --- | --- |
| `docs/architecture/document-model.md` | M4 GFM structured round-trip for ListBlock/LinkInline/MarkedInline |
| `docs/engineering/adapter-protocol.md` | GFM parse/serialize; SerializationError placeholder implemented |
| `docs/engineering/error-model.md` | `[unsupported:block:<name>]` placeholder path now implemented |
| `docs/engineering/test-strategy.md` | Six-syntax GFM round-trip matrix now executable |
| `docs/architecture/package-layout.md` | Record `packages/preset-gfm` |
| `docs/engineering/mvp-implementation-plan.md` | M4 acceptance cross-reference |
| `docs/architecture/compatibility.md` | New preset package; adapter behavior extension notes |
| `README.md` | Project status / package list |

### Specs (main OpenSpec sync on archive)

| Path | Action |
| --- | --- |
| `openspec/specs/gfm-preset/spec.md` | ADD from change delta |
| `openspec/specs/document-model/spec.md` | MODIFY GFM round-trip + CustomBlock deferral |
| `openspec/specs/adapter-base/spec.md` | MODIFY GFM + SerializationError requirements |
| `openspec/specs/core-bootstrap/spec.md` | MODIFY workspace preset boundary |

### ADR

- None required. Implementation follows ADR 003; golden-string policy captured in change design.

### Glossary

- Review only; verify GFM preset terminology aligns with `docs/glossary.md`.

## Recommendation

- **Result: PASS with follow-ups**
- **Follow-ups:** (1) stage and commit implementation + workflow artifacts with recommended grouping; (2) mark OpenSpec `tasks.md` checkboxes on archive path; (3) run Step 8 docs/spec sync.
- **May proceed to `aether-workflow-update-docs-spec`:** **yes** — no compliance blockers; long-lived docs/main spec drift is expected and scoped to Step 8 per proposal non-goals.
- **Do not archive yet.** Archive after docs/spec sync and intentional commit/PR grouping.
- **Recommended next skill:** `aether-workflow-update-docs-spec`
