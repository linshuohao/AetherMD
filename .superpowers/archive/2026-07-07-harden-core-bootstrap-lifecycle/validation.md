# harden-core-bootstrap-lifecycle Validation

Date: 2026-07-05 (re-run)  
Branch: `fix/harden-core-bootstrap-lifecycle`  
Change: `harden-core-bootstrap-lifecycle`  
Validator: `aether-workflow-validate-task` + `verification-before-completion`

## Summary

**Overall: PASS** — all required commands exit 0; no test failures; non-goals guards clean; OpenSpec change valid.

## Command Results

| Command                                             | Exit code | Result   | Notes                                                                   |
| --------------------------------------------------- | --------- | -------- | ----------------------------------------------------------------------- |
| `pnpm core:test`                                    | 0         | **PASS** | `@aether-md/core` 57 tests, 16 suites, 0 failed                         |
| `pnpm typecheck`                                    | 0         | **PASS** | turbo 5/5 typecheck tasks (core + plugins)                              |
| `pnpm test`                                         | 0         | **PASS** | turbo 6/6 test tasks; core 57 + remark 7 + prosemirror 8 = **72** total |
| `pnpm check`                                        | 0         | **PASS** | `pnpm skills:check` + turbo 9/9 check pipeline                          |
| `openspec validate harden-core-bootstrap-lifecycle` | 0         | **PASS** | Change artifacts valid                                                  |

## Validation Matrix

| Delta spec requirement / scenario                                  | Test / check                                                                             | Status           |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ---------------- |
| ADDED: Duplicate plugin name aborts startup                        | `rejects duplicate metadata.name before lifecycle hooks`                                 | PASS             |
| ADDED: Unique plugin names pass validation                         | `allows unique plugin names to bootstrap`                                                | PASS             |
| MODIFIED: Startup hook failure cleans up successful onInit plugins | `cleans up successful onInit plugins when a later onInit fails`                          | PASS             |
| MODIFIED: onReady failure cleanup                                  | `cleans up all onInit-success plugins when onReady fails`                                | PASS             |
| MODIFIED: No onInit → no onDestroy                                 | `does not invoke onDestroy when startup fails before any successful onInit`              | PASS             |
| MODIFIED: Cleanup continues after onDestroy failure                | `continues startup cleanup when onDestroy fails during cleanup`                          | PASS             |
| MODIFIED: Hook failure aborts startup (no runtime)                 | `does not return a running bootstrap runtime when startup hook fails`                    | PASS             |
| MODIFIED: Repeated dispose no-op public contract                   | `does not run destroy hooks more than once for repeated dispose calls` + `doesNotReject` | PASS             |
| MODIFIED: Normal dispose onDestroy failure fatal                   | `aborts normal dispose when onDestroy fails`                                             | PASS             |
| MODIFIED: Dispose reverse order (regression)                       | `runs onDestroy in reverse successful lifecycle order`                                   | PASS             |
| Regression: M1 excludes later milestones                           | `@aether-md/core package boundary` suite                                                 | PASS             |
| Regression: M2 Command/Event unchanged                             | git diff + rg on `command-event*.ts`                                                     | PASS (zero diff) |
| Regression: M3 adapter plugins                                     | plugin remark/prosemirror tests in `pnpm test`                                           | PASS             |
| Version: `CoreErrorCode` + `PLUGIN_NAME_DUPLICATE`                 | typecheck + duplicate test assertion                                                     | PASS             |
| Version: `SUPPORTED_MANIFEST_VERSIONS` unchanged                   | `[1] as const` in manifest.ts                                                            | PASS             |

## Changed Files (implementation)

```
packages/core/src/bootstrap.test.ts
packages/core/src/bootstrap.ts
packages/core/src/dependencies.ts
packages/core/src/errors.ts
packages/core/src/lifecycle.test.ts
packages/core/src/lifecycle.ts
packages/core/src/manifest.ts
```

## Scope Guards (rg)

| Guard                                    | Command / check                                                                                      | Result                         |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------ |
| Non-goals in changed production files    | `rg createEditor\|AetherEditor\|react\|vue\|gfm\|…` on changed `.ts` (non-test)                      | **PASS** — no matches (exit 1) |
| Non-goals in core src (non-test)         | `rg createEditor\|AetherEditor\|react\|vue\|gfm\|preset-gfm` `packages/core/src --glob '!*.test.ts'` | **PASS** — no matches (exit 1) |
| Command/Event runtime untouched          | `git diff packages/core/src/command-event*.ts`                                                       | **PASS** — empty diff          |
| Adapter plugin packages untouched        | `git diff packages/plugins/`                                                                         | **PASS** — empty diff          |
| Docs not modified (implementation phase) | `git diff docs/`                                                                                     | **PASS** — empty diff          |

## Non-goals Confirmation

| Non-goal                                                 | Confirmed                                             |
| -------------------------------------------------------- | ----------------------------------------------------- |
| `createEditor` / `AetherEditor`                          | Yes — not in diff; boundary test still rejects export |
| React / Vue Shell                                        | Yes — no imports or runtime deps added                |
| GFM preset                                               | Yes — no gfm/preset-gfm references in changed files   |
| Adapter plugin loading via `bootstrapCore`               | Yes — no bootstrap adapter wiring                     |
| `core:engine` / `core:parser` silent provide             | Yes — unchanged capability tests pass                 |
| Command/Event runtime behavior change                    | Yes — zero diff on command-event modules              |
| `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` change | Yes — still `[1] as const`                            |
| duplicate `metadata.provides` ConflictResolver           | Yes — out of scope, not implemented                   |

## Failures

None.

## Deviations (accepted)

| Item                                  | Notes                                                                                                                                                                                                    |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task 07 boundary test path            | `test --run src/package-boundary.test.ts` is invalid (runs against `src/` not `dist/`); full `pnpm core:test` includes boundary suite — acceptable.                                                      |
| Cleanup destroy failure `cause` chain | Delta spec MAY attach cleanup failures in `cause`; implementation uses best-effort continue without explicit `cause` chaining — behavior meets primary-error requirement; optional enhancement deferred. |

## Deferred Items (post-implementation workflow)

| Item                                                                      | Owner step                                              |
| ------------------------------------------------------------------------- | ------------------------------------------------------- |
| Docs sync: `manifest.md`, `lifecycle.md`, `core-api.md`, `error-model.md` | `aether-workflow-update-docs-spec` (OpenSpec tasks 5.3) |
| Main spec sync: `openspec/specs/core-bootstrap/spec.md`                   | Step 8 archive path                                     |
| Spec compliance review                                                    | `aether-workflow-review-compliance`                     |
| OpenSpec archive + final report                                           | `aether-workflow-archive-change`                        |
| `createEditor` startup cleanup semantics                                  | Future editor integration change (explicit non-goal)    |
| duplicate `metadata.provides` ConflictResolver                            | Future change (explicit non-goal)                       |

## Task Run Cross-reference

| Task  | Validated by                                   |
| ----- | ---------------------------------------------- |
| 01–02 | duplicate name tests + `PLUGIN_NAME_DUPLICATE` |
| 03–04 | startup failure cleanup suite (5 tests)        |
| 05–06 | dispose idempotency + normal dispose fatal     |
| 07    | rg guards + boundary tests + diff scope        |
| 08    | this validation record                         |

## Version Impact Verified

- `@aether-md/core` patch-level behavior hardening
- `CoreErrorCode` extended with `PLUGIN_NAME_DUPLICATE`
- No lockfile change in implementation diff
- No new public exports from `index.ts`

## Recommended Next Skill

`aether-workflow-review-compliance`
