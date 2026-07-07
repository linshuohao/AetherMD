# harden-core-bootstrap-lifecycle Final Report

## Change

`harden-core-bootstrap-lifecycle` hardened M1 `@aether-md/core` bootstrap lifecycle behavior:

1. Reject duplicate plugin `metadata.name` during bootstrap validation (`PLUGIN_NAME_DUPLICATE`).
2. Reverse-order `onDestroy` cleanup for plugins that successfully completed `onInit` when a later startup hook fails; primary error remains `LIFECYCLE_HOOK_FAILED`.
3. Document and test `CoreBootstrapRuntime.dispose()` as an idempotent public contract (repeated calls no-op, no throw); normal dispose `onDestroy` failure remains fatal abort.

**Branch:** `fix/harden-core-bootstrap-lifecycle`  
**Final status:** completed — implementation, validation, compliance review, docs/spec sync, and archive done  
**OpenSpec archive path:** `openspec/changes/archive/2026-07-05-harden-core-bootstrap-lifecycle/`  
**Superpowers run path:** `.superpowers/runs/harden-core-bootstrap-lifecycle/`

## Implemented Requirements

### ADDED — Duplicate plugin `metadata.name` rejected during bootstrap validation

- `validateUniquePluginNames()` runs after `loadPluginManifests`, before Service Capability / dependency / lifecycle.
- Fatal `CoreError` with code `PLUGIN_NAME_DUPLICATE`; no lifecycle hooks invoked on that startup attempt.
- Unique names pass validation and bootstrap continues.

### MODIFIED — Lifecycle hooks run in dependency order (startup failure cleanup)

- On startup hook failure (`onInit` or `onReady`), Core reverse-order calls `onDestroy` for plugins that completed `onInit`.
- Primary error code is `LIFECYCLE_HOOK_FAILED` from the original failing hook; no running bootstrap runtime returned.
- If no plugin completed `onInit`, no `onDestroy` hooks run.
- During startup cleanup, a failing `onDestroy` does not stop cleanup for remaining plugins (best-effort).

### MODIFIED — Dispose destroys plugins in reverse lifecycle order (public idempotency)

- Normal dispose: reverse-order `onDestroy`; failure is fatal and stops further destroy hooks.
- Repeated `dispose()`: no-op public contract — no additional hooks, no throw.
- Bootstrap dispose idempotency is separate from M2 Command/Event runtime dispose semantics.

## Validation Evidence

Recorded in `.superpowers/runs/harden-core-bootstrap-lifecycle/validation.md`. Archive re-run:

| Command                                             | Result                               |
| --------------------------------------------------- | ------------------------------------ |
| `pnpm core:test`                                    | PASS — 57 tests, 16 suites, 0 failed |
| `pnpm typecheck`                                    | PASS                                 |
| `pnpm test`                                         | PASS — 72 total (core + plugins)     |
| `pnpm check`                                        | PASS — skills:check + turbo 9/9      |
| `openspec validate harden-core-bootstrap-lifecycle` | PASS (pre-archive)                   |

Compliance review: `.superpowers/reviews/harden-core-bootstrap-lifecycle.md` — **PASS with follow-up updates**; no blockers.

## Docs / Spec Sync Summary

Main OpenSpec spec synced:

- `openspec/specs/core-bootstrap/spec.md` — ADDED duplicate-name requirement; MODIFIED lifecycle cleanup + dispose public contract scenarios

Long-lived docs synced (minimal scope):

- `docs/sdk/manifest.md` — duplicate `metadata.name` fatal validation
- `docs/sdk/lifecycle.md` — startup failure cleanup, bootstrap dispose public contract, M2 boundary note
- `docs/engineering/error-model.md` — `PLUGIN_NAME_DUPLICATE`, startup cleanup vs normal dispose asymmetry
- `docs/engineering/mvp-implementation-plan.md` — M1 status updated; removed completed M1 follow-up list
- `docs/project-status.md` — M1 baseline bullet updated

**Not synced (deferred, non-blocking):**

- `docs/architecture/core-api.md` — L55 still states Command/Event dispose idempotency does not define `bootstrapCore` dispose public contract; main spec and `docs/sdk/lifecycle.md` now carry the bootstrap contract. Optional follow-up to align core-api wording.

No ADR or glossary updates required.

## Deviations

| Deviation                                                                         | Status                                                                                                                                            |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cleanup destroy failure `cause` chain                                             | **Accepted** — delta MAY attach cleanup failures in primary error `cause`; implementation continues best-effort without explicit `cause` chaining |
| Task 07 boundary test path `test --run src/package-boundary.test.ts` invalid      | **Accepted** — full `pnpm core:test` includes package-boundary suite                                                                              |
| `validateUniquePluginNames` exported from `manifest.ts` module but not `index.ts` | **Accepted** — internal validation helper                                                                                                         |
| OpenSpec `tasks.md` checklist left unchecked in archived artifact                 | **Accepted** — Superpowers tasks 01–08 completed and validated; OpenSpec checklist is planning artifact only                                      |

## Deferred Non-Goals

Explicitly out of scope (unchanged):

- `createEditor` / `AetherEditor`, React/Vue Shell, GFM preset
- `bootstrapCore` Adapter plugin loading; `core:engine` / `core:parser` silent provide
- `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` change (still `[1] as const`)
- duplicate `metadata.provides` ConflictResolver
- M2 Command/Event runtime behavior changes
- M3+ adapter plugin package changes
- `createEditor` startup cleanup semantics (future editor integration)

Optional future enhancement:

- Attach startup cleanup destroy failures to primary error `cause` chain

## Source Docs

- `docs/sdk/manifest.md`
- `docs/sdk/lifecycle.md`
- `docs/architecture/core-api.md`
- `docs/engineering/error-model.md`
- `docs/engineering/manifest-loading.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/engineering/test-strategy.md`

## Specs Updated

- `openspec/specs/core-bootstrap/spec.md` (main spec synced from delta)

Archived delta preserved at:

- `openspec/changes/archive/2026-07-05-harden-core-bootstrap-lifecycle/specs/core-bootstrap/spec.md`

## Tasks Completed

| Task                                                | Status    | Validation                                 | Deviation            |
| --------------------------------------------------- | --------- | ------------------------------------------ | -------------------- |
| 01-define-duplicate-plugin-name-tests               | completed | duplicate name tests                       | —                    |
| 02-implement-duplicate-plugin-name-validation       | completed | `PLUGIN_NAME_DUPLICATE` + bootstrap wiring | —                    |
| 03-define-partial-startup-cleanup-tests             | completed | 5 cleanup tests                            | —                    |
| 04-implement-partial-startup-cleanup                | completed | lifecycle.ts `runStartupFailureCleanup`    | cause chain optional |
| 05-define-bootstrap-dispose-idempotency-tests       | completed | repeated dispose + fatal normal dispose    | —                    |
| 06-implement-bootstrap-dispose-idempotency-contract | completed | existing `disposed` flag + tests           | —                    |
| 07-reinforce-boundary-and-non-goals-guards          | completed | rg guards + boundary suite                 | test path note       |
| 08-run-full-validation                              | completed | validation.md PASS                         | —                    |

## Files Changed

| File                                          | Task / Reason                    |
| --------------------------------------------- | -------------------------------- |
| `packages/core/src/errors.ts`                 | 01–02 — `PLUGIN_NAME_DUPLICATE`  |
| `packages/core/src/manifest.ts`               | 02 — `validateUniquePluginNames` |
| `packages/core/src/bootstrap.ts`              | 02 — validation call site        |
| `packages/core/src/bootstrap.test.ts`         | 01–02 — duplicate name tests     |
| `packages/core/src/lifecycle.ts`              | 03–04 — startup failure cleanup  |
| `packages/core/src/lifecycle.test.ts`         | 03–06 — cleanup + dispose tests  |
| `packages/core/src/dependencies.ts`           | 07 — comment only                |
| `openspec/specs/core-bootstrap/spec.md`       | docs/spec sync                   |
| `docs/sdk/manifest.md`                        | docs/spec sync                   |
| `docs/sdk/lifecycle.md`                       | docs/spec sync                   |
| `docs/engineering/error-model.md`             | docs/spec sync                   |
| `docs/engineering/mvp-implementation-plan.md` | docs/spec sync                   |
| `docs/project-status.md`                      | docs/spec sync                   |

Superpowers / OpenSpec artifacts:

- `openspec/changes/archive/2026-07-05-harden-core-bootstrap-lifecycle/*`
- `.superpowers/plans/harden-core-bootstrap-lifecycle.md`
- `.superpowers/tasks/harden-core-bootstrap-lifecycle/*.md`
- `.superpowers/runs/harden-core-bootstrap-lifecycle/validation.md`
- `.superpowers/reviews/harden-core-bootstrap-lifecycle.md`

## Version Impact

- Package versions: **unchanged** (`@aether-md/core` remains patch-level hardening)
- `manifestVersion`: **unchanged** — `[1] as const`
- Public exports from `index.ts`: **unchanged** (no new symbols)
- `CoreErrorCode`: **extended** with `PLUGIN_NAME_DUPLICATE` (backward-compatible fatal code addition)
- Lockfiles: **unchanged**

## Recommended Commit / PR Summary

**Suggested commit message:**

```
fix(core): harden bootstrap lifecycle validation and cleanup

Reject duplicate plugin metadata.name before lifecycle hooks,
run reverse onDestroy cleanup on startup failure, and document
bootstrap dispose idempotency as a public contract.

OpenSpec: harden-core-bootstrap-lifecycle (archived)
Validation: pnpm check PASS (57 core tests)
```

**Suggested PR title:** `fix(core): harden M1 bootstrap lifecycle (duplicate names, startup cleanup, dispose idempotency)`

**PR body bullets:**

- Reject duplicate `metadata.name` with fatal `PLUGIN_NAME_DUPLICATE` before lifecycle hooks
- On startup hook failure, reverse-order `onDestroy` for successful `onInit` plugins; primary error `LIFECYCLE_HOOK_FAILED`
- `CoreBootstrapRuntime.dispose()` repeated calls are no-op (public contract); normal dispose `onDestroy` failure still fatal
- Synced `openspec/specs/core-bootstrap/spec.md` and SDK/engineering docs
- No M2/M3/M4/M5 scope expansion; no new public exports or manifestVersion change
- Accepted deviations: optional cleanup `cause` chain; `core-api.md` bootstrap dispose wording deferred

**Code-management state at archive:** uncommitted changes on `fix/harden-core-bootstrap-lifecycle`; no commit or PR created during archive.

## Remaining Follow-ups

- Optional: update `docs/architecture/core-api.md` bootstrap dispose paragraph to match synced main spec
- Optional: implement cleanup destroy failure `cause` chaining per delta MAY
- Future: duplicate `metadata.provides` ConflictResolver; `createEditor` startup cleanup integration
