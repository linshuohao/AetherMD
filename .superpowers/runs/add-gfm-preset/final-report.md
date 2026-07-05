# Final Report: add-gfm-preset

## Change

- OpenSpec change: `add-gfm-preset`
- Branch: `feat/add-gfm-preset`
- Archive path: `openspec/changes/archive/2026-07-05-add-gfm-preset/`
- Final status: **archived** — Superpowers tasks 01–11 complete; validation all PASS; compliance review PASS (no blockers); main OpenSpec specs synced on working tree; long-lived docs partially synced (see Docs / ADR Updates)
- Version impact: new `@aether-md/preset-gfm@0.0.0`; `@aether-md/plugin-remark` / `@aether-md/plugin-prosemirror` minor GFM behavior extension; `@aether-md/core` test-only (no production export changes); `remark-gfm` in lockfile; `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` unchanged `[1]`

## Implemented Requirements

| Capability | Requirement | Evidence |
| --- | --- | --- |
| **gfm-preset** | GFM preset package exists in workspace | `packages/preset-gfm/`; `pnpm check` covers 4 packages |
| **gfm-preset** | Manifest + public factory entry | `manifest.ts` (`manifestVersion: 1`, `name: gfm`); `createGfmPreset()` in `index.ts` |
| **gfm-preset** | GFM round-trip integration matrix | `round-trip.test.ts` — 7 scenarios (paragraph, heading, strong, emphasis, ul, ol, link) |
| **document-model** | GFM built-in types structured round-trip | remark + prosemirror + preset tests; core `document-model.test.ts` GFM matrix |
| **document-model** | CustomBlock outside M4 GFM matrix | separate CustomBlock describe; serializer placeholder only |
| **adapter-base** | Remark GFM parse/serialize | `parser.ts` / `serializer.ts`; 21 remark tests |
| **adapter-base** | ProseMirror preserves GFM structures | `conversion.ts`; `engine.test.ts` + `conversion.test.ts`; 13 PM tests |
| **adapter-base** | SerializationError placeholder strategy | `CustomBlock` → `[unsupported:block:<name>]`; unsupported nodes reject |
| **adapter-base** | M3 minimal round-trip preserved | M3 paragraph/heading cases still pass in remark + preset tests |
| **core-bootstrap** | Workspace preset without core re-export | `package-boundary.test.ts`; no `createGfmPreset` / `presetGfm` in core exports |
| **Non-goals** | No createEditor / Shell / bootstrapCore wiring | validation Task 11 checklist; import guards in preset tests |

## Source Docs

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/document-model.md`
- `docs/engineering/adapter-protocol.md`
- `docs/engineering/error-model.md`
- `docs/engineering/test-strategy.md`
- `docs/architecture/package-layout.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`
- `openspec/specs/document-model/spec.md`
- `openspec/specs/adapter-base/spec.md`
- `openspec/specs/core-bootstrap/spec.md`

## Specs Updated

| Main spec | Action | Status |
| --- | --- | --- |
| `openspec/specs/gfm-preset/spec.md` | ADD (3 requirements) | synced on working tree (uncommitted) |
| `openspec/specs/document-model/spec.md` | MODIFY (GFM round-trip + CustomBlock deferral) | synced on working tree (uncommitted) |
| `openspec/specs/adapter-base/spec.md` | MODIFY (GFM + SerializationError) | synced on working tree (uncommitted) |
| `openspec/specs/core-bootstrap/spec.md` | MODIFY (workspace preset boundary) | synced on working tree (uncommitted) |

Delta specs archived with change at `openspec/changes/archive/2026-07-05-add-gfm-preset/specs/`.

## Tasks Completed

| Task | Status | Validation | Deviation |
| --- | --- | --- | --- |
| 01 define-gfm-document-model-tests | complete | core 61/61 | TDD immediate-pass (M3 types pre-exported) |
| 02 implement-gfm-document-model-types | complete | core 61/61 | zero production diff |
| 03 define-remark-gfm-parser-serializer-tests | complete | 11 GFM fail (red) | none |
| 04 implement-remark-gfm-parser-serializer | complete | remark 18/18 | none |
| 05 define-prosemirror-gfm-engine-tests | complete | 5 GFM fail (red) | none |
| 06 implement-prosemirror-gfm-engine | complete | prosemirror 13/13 | none |
| 07 scaffold-preset-gfm-package | complete | preset 4/4 + build | none |
| 08 define-cross-package-gfm-roundtrip-tests | complete | preset 12/12 | integration green on first run |
| 09 implement-serialization-error-placeholder-strategy | complete | remark 21/21 | none |
| 10 reinforce-package-boundary-and-non-goals-guards | complete | core 61/61 + rg guards | none |
| 11 run-full-validation | complete | `pnpm check` PASS; 107 tests | none |

**Note:** OpenSpec `tasks.md` checkboxes remain `[ ]` in the archived change artifact; Superpowers task files record `complete` and evidence lives in `validation.md` / compliance review.

## Files Changed

| File / Area | Task | Notes |
| --- | --- | --- |
| `packages/core/src/document-model.test.ts` | 01 | GFM matrix + CustomBlock contract tests |
| `packages/core/src/package-boundary.test.ts` | 10 | preset workspace guard; no core re-export |
| `packages/plugins/plugin-remark/package.json` | 04 | `remark-gfm` dependency |
| `packages/plugins/plugin-remark/src/parser.ts` | 04 | GFM structured parse |
| `packages/plugins/plugin-remark/src/parser.test.ts` | 03, 04 | GFM parse + M3 degradation |
| `packages/plugins/plugin-remark/src/serializer.ts` | 04, 09 | GFM serialize + placeholder strategy |
| `packages/plugins/plugin-remark/src/serializer.test.ts` | 03, 04, 09 | golden strings + SerializationError |
| `packages/plugins/plugin-prosemirror/src/conversion.ts` | 06 | GFM schema/conversion |
| `packages/plugins/plugin-prosemirror/src/conversion.test.ts` | 05 | GFM conversion contract |
| `packages/plugins/plugin-prosemirror/src/fixtures/gfm-doc.ts` | 05 | GFM fixture |
| `packages/plugins/plugin-prosemirror/src/engine.test.ts` | 05, 06 | GFM preserve on apply |
| `packages/preset-gfm/**` | 07, 08 | new package: manifest, factory, round-trip tests |
| `pnpm-lock.yaml` | 04, 07 | `remark-gfm` + workspace links |
| `openspec/specs/**` | Step 8 (partial) | main spec sync |
| `docs/**` (6 files) | Step 8 (partial) | see Docs / ADR Updates |
| `.superpowers/plans/`, `tasks/`, `runs/`, `reviews/` | workflow | plan, tasks 01–11, validation, review |

**Uncommitted:** all implementation + workflow artifacts remain on `feat/add-gfm-preset` (no commit per user instruction).

## Validation Evidence

| Command | Result | Notes |
| --- | --- | --- |
| `pnpm check` | **PASS** | 4 packages, 12 turbo tasks (Task 11) |
| `openspec validate add-gfm-preset --strict` | **PASS** | pre-archive |
| `@aether-md/core` tests | **PASS** | 61/61 |
| `@aether-md/plugin-remark` tests | **PASS** | 21/21 |
| `@aether-md/plugin-prosemirror` tests | **PASS** | 13/13 |
| `@aether-md/preset-gfm` tests | **PASS** | 12/12 |
| **Total** | **PASS** | **107 tests** |
| Compliance review | **PASS** | no blockers (`.superpowers/reviews/add-gfm-preset.md`) |
| Non-goals guard | **PASS** | validation.md Task 11 checklist |

Full per-task evidence: `.superpowers/runs/add-gfm-preset/validation.md`.

## Deviations (accepted)

| Deviation | Task | Assessment |
| --- | --- | --- |
| GFM/CustomBlock document-model tests passed immediately; M3 already exported types | 01 | Accepted — adds M4 contract coverage |
| Zero production diff for document-model types | 02 | Accepted — design decision 4 |
| Cross-package integration tests green on first run | 08 | Accepted — prerequisites complete |
| Round-trip import guard checks `import` lines only | 06, 08 | Accepted — same pattern as M3 |
| `createGfmPreset()` wires adapters directly (not via `bootstrapCore`) | 07 | Accepted — explicit non-goal |

## Version Impact

| Package / artifact | Impact |
| --- | --- |
| `@aether-md/core` | no breaking change; production exports unchanged |
| `@aether-md/preset-gfm` | **new** workspace package `0.0.0` |
| `@aether-md/plugin-remark` | minor GFM extension; `remark-gfm` added |
| `@aether-md/plugin-prosemirror` | minor GFM schema/conversion extension |
| `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` | unchanged `[1]` |
| `pnpm-lock.yaml` | updated (`remark-gfm`, preset workspace links) |
| Main OpenSpec specs | additive/modified (see Specs Updated) |
| Changesets | not yet created (pre-publish) |

## Docs / ADR Updates

**Synced on working tree (uncommitted):**

- `docs/architecture/document-model.md`
- `docs/engineering/adapter-protocol.md`
- `docs/engineering/error-model.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/engineering/test-strategy.md`
- `docs/project-status.md`

**Explicitly deferred (per proposal §非目标 and compliance review Step 8 list):**

- `docs/architecture/package-layout.md` — record `packages/preset-gfm`
- `docs/architecture/compatibility.md` — preset + adapter extension notes
- `README.md` — package list / status (partially covered by `project-status.md`)
- `docs/glossary.md` — terminology review only

**ADR:** none required (follows ADR 003).

## Suggested Commit Message

Single squash (if preferred):

```
feat(preset-gfm): add M4 GFM preset with adapter extensions and round-trip matrix

Introduce @aether-md/preset-gfm with Manifest/factory, extend plugin-remark
and plugin-prosemirror for six-syntax GFM structured round-trip, implement
SerializationError placeholder strategy, and sync main OpenSpec specs.

OpenSpec: add-gfm-preset (archived 2026-07-05)
Superpowers: tasks 01–11; validation 107/107 PASS
Version: new preset-gfm@0.0.0; plugin minor extensions; core unchanged
```

Recommended multi-commit grouping (from compliance review):

1. `test(core): add GFM document-model and package-boundary guards`
2. `feat(plugin-remark): GFM parse/serialize and SerializationError strategy`
3. `feat(plugin-prosemirror): GFM conversion and engine preservation`
4. `feat(preset-gfm): scaffold GFM preset with round-trip integration tests`
5. `docs(openspec): sync main specs and long-lived docs for add-gfm-preset`
6. `chore: verify add-gfm-preset workspace checks`

## PR Summary (draft)

### Summary

- Add `@aether-md/preset-gfm` — official GFM preset with `createGfmPreset()`, Manifest (`manifestVersion: 1`, `name: gfm`), and six-syntax round-trip integration tests.
- Extend `@aether-md/plugin-remark` with `remark-gfm` for structured parse/serialize of paragraph, heading, strong, emphasis, lists, and links; implement `SerializationError` placeholder for `CustomBlock`.
- Extend `@aether-md/plugin-prosemirror` schema/conversion so `EngineAdapter` preserves GFM structures through edit legs.
- Sync main OpenSpec specs (`gfm-preset` ADDED; `document-model`, `adapter-base`, `core-bootstrap` MODIFIED) and partial long-lived docs.

### Test plan

- [x] `pnpm check` (build, typecheck, test — 107 tests)
- [x] `openspec validate add-gfm-preset --strict` (pre-archive)
- [x] Core package-boundary guards (no remark/PM in core; no preset re-export)
- [x] Non-goals: no `createEditor`, Shell, `bootstrapCore` wiring, or `transactionFailed` auto emit

### Metadata

- OpenSpec change: `add-gfm-preset` → archived `openspec/changes/archive/2026-07-05-add-gfm-preset/`
- Superpowers: `.superpowers/tasks/add-gfm-preset/01`–`11`
- Validation: `.superpowers/runs/add-gfm-preset/validation.md`
- Deviations: Tasks 01, 02, 08 (accepted)
- Version: new `@aether-md/preset-gfm@0.0.0`; plugin minor extensions; core unchanged

## Remaining Follow-ups

| Follow-up | Scope |
| --- | --- |
| Deferred docs | `package-layout.md`, `compatibility.md`, `README.md`, glossary review |
| Branch integration | stage, commit, PR on `feat/add-gfm-preset` (deferred per user) |
| M5+ | `createEditor`, React Shell, `bootstrapCore` Adapter loading |
| M4+ syntax | nested lists, tables, code blocks, `CustomBlock` round-trip |

## Archive Readiness Checklist

- [x] Superpowers tasks 01–11 complete
- [x] Validation record exists and all PASS (`.superpowers/runs/add-gfm-preset/validation.md`)
- [x] Compliance review PASS, no blockers (`.superpowers/reviews/add-gfm-preset.md`)
- [x] Main OpenSpec specs synced on working tree; partial long-lived docs synced; remainder explicitly deferred
- [x] Version impact recorded
- [x] Branch `feat/add-gfm-preset` matches change scope
- [x] No commit / no push (per user instruction)

## Skills Loaded

- `aether-workflow-archive-change`
- `openspec-archive-change`
- `finishing-a-development-branch` — **not resolvable in host skill list**; archive-readiness checks applied manually from `.skills/aether-workflow/aether-workflow-archive-change/references/archive-readiness.md`
