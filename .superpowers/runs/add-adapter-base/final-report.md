# Final Report: add-adapter-base

## Change

- OpenSpec change: `add-adapter-base`
- Branch: `feat/add-adapter-base`
- Archive path: `openspec/changes/archive/2026-07-05-add-adapter-base/`
- Final status: **archived** — Superpowers tasks 01–08 complete; compliance review pass; docs/spec sync complete; final `pnpm check` pass
- Version impact: `@aether-md/core` minor-level additive public exports; new `@aether-md/plugin-remark` and `@aether-md/plugin-prosemirror` (`0.0.0`); `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` unchanged; `pnpm-lock.yaml` updated (Remark/ProseMirror deps in plugin packages only)

## Source Docs

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/document-model.md`
- `docs/engineering/adapter-protocol.md`
- `docs/architecture/core-api.md`
- `docs/architecture/principles.md`
- `docs/architecture/package-layout.md`
- `docs/architecture/compatibility.md`
- `docs/engineering/error-model.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/data-flow.md`
- `docs/glossary.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`
- `openspec/specs/core-bootstrap/spec.md`
- `openspec/specs/command-event-runtime/spec.md`

## Specs Updated

| Main spec                               | Action                                   |
| --------------------------------------- | ---------------------------------------- |
| `openspec/specs/document-model/spec.md` | Created (3 requirements)                 |
| `openspec/specs/adapter-base/spec.md`   | Created (8 requirements)                 |
| `openspec/specs/core-bootstrap/spec.md` | Modified (M3 package boundary scenarios) |

Synced during Step 8 (`aether-workflow-update-docs-spec`); archive uses `--skip-specs` (already synced).

## Tasks Completed

| Task                                                  | Status   | Validation                            | Deviation                                               |
| ----------------------------------------------------- | -------- | ------------------------------------- | ------------------------------------------------------- |
| 01 define-aetherdoc-types-and-shape-tests             | complete | core 49 tests (incl. 3 new shape)     | none                                                    |
| 02 define-adapter-protocol-exports-and-boundary-tests | complete | adapter-types + boundary tests        | none                                                    |
| 03 scaffold-plugin-remark-and-minimal-parser          | complete | plugin-remark 4 parser tests          | unknown syntax → paragraph via mdast JSON               |
| 04 implement-plugin-remark-minimal-serializer         | complete | plugin-remark 7 total tests           | SerializationError not thrown on serializer failure yet |
| 05 scaffold-plugin-prosemirror-and-engine-adapter     | complete | 5 engine contract tests               | session state in adapter-private Map                    |
| 06 add-cross-package-round-trip-integration-tests     | complete | 3 integration tests                   | import guard checks import lines only                   |
| 07 reinforce-package-boundary-and-rg-guards           | complete | M1 capability + deps guards           | overlapped Task 02 boundary                             |
| 08 run-full-verification-and-non-goals-guard          | complete | `pnpm check` 64/64; openspec validate | validation-only                                         |

**Note:** OpenSpec `tasks.md` checkboxes remain `[ ]` in the change artifact; Superpowers task files record `complete` and implementation evidence in validation/review.

## Files Changed

| Area                  | Files                                                                                                                                                                                                           | Task     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Core document-model   | `packages/core/src/document-model.ts`, `document-model.test.ts`, `index.ts`                                                                                                                                     | 01       |
| Core adapter protocol | `packages/core/src/adapter-types.ts`, `adapter-types.test.ts`, `errors.ts`, `index.ts`                                                                                                                          | 02       |
| Core boundary         | `packages/core/src/package-boundary.test.ts`                                                                                                                                                                    | 02, 07   |
| plugin-remark         | `packages/plugins/plugin-remark/**`                                                                                                                                                                             | 03, 04   |
| plugin-prosemirror    | `packages/plugins/plugin-prosemirror/**`                                                                                                                                                                        | 05, 06   |
| Lockfile              | `pnpm-lock.yaml`                                                                                                                                                                                                | 03–06    |
| Main specs            | `openspec/specs/document-model/`, `adapter-base/`, `core-bootstrap/spec.md`                                                                                                                                     | Step 8   |
| Long-lived docs       | `docs/project-status.md`, `mvp-implementation-plan.md`, `core-api.md`, `document-model.md`, `adapter-protocol.md`, `error-model.md`, `test-strategy.md`, `package-layout.md`, `compatibility.md`, `glossary.md` | Step 8   |
| Superpowers           | `.superpowers/plans/`, `tasks/`, `runs/`, `reviews/`                                                                                                                                                            | workflow |

**Uncommitted:** all changes remain on `feat/add-adapter-base` (no commit per user instruction).

## Validation Results

| Command                                       | Result   | Notes                      |
| --------------------------------------------- | -------- | -------------------------- |
| Final `pnpm check` (archive)                  | **PASS** | 64 tests, turbo 9/9 cached |
| `openspec validate add-adapter-base --strict` | **PASS** | pre-archive                |
| Compliance review                             | **PASS** | no blockers                |
| Non-goals guard                               | **PASS** | see validation.md §8       |

## Deviations (accepted)

1. **Task 03:** Unknown Markdown syntax degrades via mdast JSON → paragraph text (not structured `ListBlock`).
2. **Task 05:** `EngineSession` state in internal `Map` keyed by `session.id`.
3. **Task 04:** `SerializationError` exported; serializer failure placeholder strategy deferred to M4.
4. **Task 06:** Round-trip import guard checks `import` lines only.
5. **Task 07:** Boundary reinforcement overlapped Task 02; net positive.

## Docs / ADR Updates

- **Docs:** 10 long-lived docs updated (see Files Changed).
- **ADR:** none new (follows ADR 003).
- **Glossary:** `AetherSchema` M3 placeholder shape clarified.

## Remaining Follow-ups

| Follow-up change                  | Scope                                                                             |
| --------------------------------- | --------------------------------------------------------------------------------- |
| `add-editor-bootstrap`            | `bootstrapCore` + Adapter plugin loading + `core:engine` / `core:parser` provides |
| `add-command-adapter-integration` | Command Bus ↔ EngineAdapter + `transactionFailed`                                 |
| `add-gfm-preset`                  | M4 GFM syntax round-trip                                                          |
| M1 follow-up                      | duplicate plugin name, partial startup cleanup, dispose public contract           |
| Branch integration                | commit + PR on `feat/add-adapter-base` (deferred per user)                        |

## Archive Readiness Checklist

- [x] Superpowers tasks 01–08 complete
- [x] Validation record exists (`.superpowers/runs/add-adapter-base/validation.md`)
- [x] Compliance review pass, no blockers (`.superpowers/reviews/add-adapter-base.md`)
- [x] Docs/spec sync complete (Step 8)
- [x] Final `pnpm check` pass
- [x] No commit (per user instruction)
