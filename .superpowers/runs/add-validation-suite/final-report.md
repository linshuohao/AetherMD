# Final Report: add-validation-suite

## Change

- **OpenSpec change:** `add-validation-suite`
- **Archive path:** `openspec/changes/archive/2026-07-05-add-validation-suite/`
- **Final status:** archived — Full Change workflow complete (tasks 01–09, validation barrier, compliance review PASS WITH DEVIATIONS, docs/spec sync)
- **Branch:** `feat/add-validation-suite` (matches change scope)
- **Version impact:** **package metadata only** — five linked packages remain `0.0.0` / `private: true`; additive MIT `license` / `repository` / `files` / `publishConfig`; Changesets `linked` group + root `changeset:publish` script (reserved); new `@aether-md/example-headless-gfm` private workspace package; **`SUPPORTED_MANIFEST_VERSIONS` / `manifestVersion` unchanged** (`[1]`); **no** public API or runtime semantic changes in Core/React; `pnpm-lock.yaml` updated for example deps
- **Code-management:** All implementation + workflow artifacts present; **uncommitted** working tree — user deferred commit/push until explicitly requested
- **Skills loaded:** `openspec-archive-change`, `finishing-a-development-branch` (test verification only; no branch merge/PR per user scope)

## Source Docs

- `docs/adr/009-release-governance.md` — M6 publish prep / M7 canary scope
- `docs/engineering/mvp-implementation-plan.md` — M6 milestone row
- `docs/engineering/test-strategy.md` — M6 validation suite baseline
- `docs/architecture/ci-checklist.md` — G5/G6/G11 enabled; G12 gap annotation
- `docs/architecture/roadmap.md` — M6 snapshot + v1.0 gap cross-ref
- `docs/community/release-process.md` — M6 prep complete; M7 publish deferred
- `docs/project-status.md` — M6 closed; v1.0 gap table
- `docs/sdk/manifest.md` — G11 doc truth for manifest version consistency test

## Specs Updated

| Spec | Action | Path |
| --- | --- | --- |
| `validation-suite` | ADDED | `openspec/specs/validation-suite/spec.md` |
| `engineering-workflow` | MODIFIED | `openspec/specs/engineering-workflow/spec.md` (M6 validation gates in `pnpm check`) |

Delta specs synced to main specs via `aether-workflow-update-docs-spec` before archive. Post-archive: `openspec validate --specs --strict` — pass.

## Tasks Completed

| Task | Status | Validation | Deviation |
| --- | --- | --- | --- |
| 01 — scaffold headless-gfm workspace package | completed | install + private assertion PASS | typecheck FAIL expected pre-src |
| 02 — headless GFM runnable demo script | completed | build/start/typecheck PASS | inlined wiring in example host layer |
| 03 — publish prep metadata (five packages) | completed | node assertion PASS | — |
| 04 — Changesets linked group + publish script | completed | linked group PASS | `changeset:status --since main` FAIL accepted |
| 05 — G11 manifest ↔ docs consistency | completed | 85 core tests PASS | core `test` script `find` fix |
| 06 — wire headless-gfm typecheck into check | completed | turbo check includes example | — |
| 07 — createEditor startup-abort integration tests | completed | 2 integration tests PASS | unsupported manifestVersion via existing test |
| 08 — document M6 + v1.0 gaps | completed | `openspec validate --strict` PASS | — |
| 09 — full validation barrier | completed | `pnpm check` + barrier PASS | changeset:status deviation |

OpenSpec high-level `tasks.md` checkboxes ticked at archive (aligned with Superpowers tasks 01–09).

## Files Changed

| File | Task / Reason | Notes |
| --- | --- | --- |
| `pnpm-workspace.yaml` | 01 | headless example workspace entry |
| `examples/headless-gfm/package.json` | 01, 02, 06 | private package; typecheck/check/start |
| `examples/headless-gfm/tsconfig.json` | 01, 02 | G6 `tsc --noEmit` |
| `examples/headless-gfm/src/run.ts` | 02 | headless GFM integration demo |
| `pnpm-lock.yaml` | 01 | workspace install lockfile |
| `packages/core/package.json` | 03, 05 | publish prep; test script `find` fix |
| `packages/plugins/plugin-remark/package.json` | 03 | M6 publish prep metadata |
| `packages/plugins/plugin-prosemirror/package.json` | 03 | M6 publish prep metadata |
| `packages/preset-gfm/package.json` | 03 | M6 publish prep metadata |
| `packages/react/package.json` | 03 | M6 publish prep metadata |
| `.changeset/config.json` | 04 | Changesets `linked` five-package group |
| `package.json` | 04 | `changeset:publish` script |
| `packages/core/src/manifest-doc-consistency.test.ts` | 05 | G11 gate |
| `packages/core/src/editor/startup-abort.integration.test.ts` | 07 | duplicate-name abort regression |
| `docs/project-status.md` | 08 | M6 status + G12 v1.0 gap |
| `docs/architecture/roadmap.md` | 08 | M6 snapshot |
| `docs/architecture/ci-checklist.md` | 08 | M6 gates |
| `docs/community/release-process.md` | 04, 08 | M6 prep; M7 deferred |
| `docs/engineering/test-strategy.md` | 08 | M6 validation baseline |
| `openspec/specs/validation-suite/spec.md` | spec sync | ADDED main spec |
| `openspec/specs/engineering-workflow/spec.md` | spec sync | M6 check pipeline requirement |
| `openspec/changes/archive/2026-07-05-add-validation-suite/**` | archive | proposal, design, delta specs, tasks |
| `.superpowers/plans/add-validation-suite.md` | workflow | implementation plan |
| `.superpowers/tasks/add-validation-suite/01`–`09` | workflow | scoped tasks |
| `.superpowers/runs/add-validation-suite/validation.md` | 09 | validation record |
| `.superpowers/reviews/add-validation-suite.md` | workflow | compliance review |

**Not modified (correct per non-goals):** Core/React production runtime code; adapter plugin runtime logic; `.github/workflows/**` Release job; `private: true` removal; `NPM_TOKEN` / npm publish.

## Validation Results

| Command | Result |
| --- | --- |
| `pnpm check` | PASS (18/18 turbo tasks) |
| `openspec validate add-validation-suite --strict` | PASS (pre-archive) |
| `openspec validate --specs --strict` | PASS (post-archive) |
| `pnpm build && pnpm --filter @aether-md/example-headless-gfm start` | PASS (headless smoke) |
| `pnpm --filter @aether-md/core test` | PASS (85 tests) |
| Linked Changesets group node assertion | PASS |
| `pnpm changeset:status --since main` | FAIL (accepted deviation) |

Compliance review: **PASS WITH DEVIATIONS** — **no blockers** (`.superpowers/reviews/add-validation-suite.md`).

## Deviations

1. **`pnpm changeset:status --since main` FAIL** — no Changeset file for M6 metadata-only prep; packages remain `private: true` at `0.0.0`. Linked config verified separately. **M7** will add changesets before first publish.
2. **Core `test` script glob → `find`** — infrastructure fix so top-level G11 tests participate in `pnpm check`; strengthens CI.
3. **Example inlined `toExtensionPluginFromPreset` / stub plugins** — host-layer wiring only; not promoted to Core public API (Task 02).
4. **Unsupported `manifestVersion` integration** — covered by pre-existing `editor-orchestration.test.ts`, not duplicated in `startup-abort.integration.test.ts` (design Decision 6 minimum coverage).

## Docs / ADR Updates

- Long-lived docs updated in Task 08 (project status, roadmap, ci-checklist, release-process, test-strategy).
- Main OpenSpec specs synced: `validation-suite` (new), `engineering-workflow` (M6 gates).
- **ADR:** none new — implementation follows ADR 009 M6 scope.
- **Glossary:** none.

## Remaining Follow-ups (M7)

Per ADR 009 and `docs/project-status.md`:

1. **First npm canary publish** — Changesets prerelease (`changeset pre enter canary`), CI-only `changeset publish`, dist-tag `canary` (open question O2).
2. **Remove `private: true`** on five publish-target packages; ensure `exports` + `types` consumer-ready (G2).
3. **Add Changeset entries** for version bumps when preparing publish (resolves `changeset:status` deviation).
4. **Release CI workflow** — GitHub Actions release job + `NPM_TOKEN`; forbid local `npm publish` (G10).
5. **Consumer smoke** — `pnpm pack` then empty-project `import` of package entry points (G8).
6. **`examples/react-basic`** — minimal Vite + React demo for `@aether-md/react` + GateLock (M6 end or M7 start).
7. **README / docs install instructions** aligned with published public API (G9).
8. **Resolve open questions O1–O4** (version series, dist-tag, changelog plugin, MIT review) before first `latest` promote.
