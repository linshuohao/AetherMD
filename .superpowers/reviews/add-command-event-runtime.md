# Compliance Review: add-command-event-runtime

## Summary

- Status: pass with recorded process deviations; implementation/spec compliance passes.
- OpenSpec change: `add-command-event-runtime`
- Review date: 2026-07-04
- Version impact: minor-level public API expansion for unreleased `@aether-md/core`; no `manifestVersion`, `SUPPORTED_MANIFEST_VERSIONS`, dependency, or lockfile change observed.
- OpenSpec command path used: `openspec status --change add-command-event-runtime --json`; `openspec validate add-command-event-runtime --strict`
- Superpowers command/skill path used: unavailable in this host. `command -v superpowers` returned not found and dynamic tool discovery did not expose a Superpowers command layer; review used existing `.superpowers/` artifacts and records this as an accepted host/tooling deviation.

## Artifact Coverage

| Artifact            | Present | Notes                                                                                |
| ------------------- | ------- | ------------------------------------------------------------------------------------ |
| Proposal            | yes     | `openspec/changes/add-command-event-runtime/proposal.md`                             |
| Design              | yes     | `openspec/changes/add-command-event-runtime/design.md`                               |
| Delta specs         | yes     | `command-event-runtime` ADDED and `core-bootstrap` MODIFIED specs present            |
| OpenSpec status     | yes     | `isComplete: true`; proposal/design/specs/tasks all `done`                           |
| OpenSpec validation | yes     | `openspec validate add-command-event-runtime --strict` passed                        |
| Plan                | yes     | `.superpowers/plans/add-command-event-runtime.md`                                    |
| Tasks               | yes     | `.superpowers/tasks/add-command-event-runtime/01` through `07`, all marked completed |
| Validation          | yes     | `.superpowers/runs/add-command-event-runtime/validation.md`                          |
| Review              | yes     | `.superpowers/reviews/add-command-event-runtime.md`                                  |

## Changed-file Mapping

| File                                                                             | Task                                                     | Requirement / Source Doc                                                                                                                        | Status                          |
| -------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `openspec/changes/add-command-event-runtime/.openspec.yaml`                      | OpenSpec setup                                           | OpenSpec repo-local change metadata                                                                                                             | mapped                          |
| `openspec/changes/add-command-event-runtime/proposal.md`                         | OpenSpec proposal                                        | change scope, version impact, non-goals                                                                                                         | mapped                          |
| `openspec/changes/add-command-event-runtime/design.md`                           | OpenSpec design                                          | public contract, boundaries, testing strategy                                                                                                   | mapped                          |
| `openspec/changes/add-command-event-runtime/specs/command-event-runtime/spec.md` | OpenSpec delta spec                                      | all M2 Command/Event requirements                                                                                                               | mapped                          |
| `openspec/changes/add-command-event-runtime/specs/core-bootstrap/spec.md`        | OpenSpec delta spec                                      | package boundary allows M2 and excludes later milestones                                                                                        | mapped                          |
| `openspec/changes/add-command-event-runtime/tasks.md`                            | OpenSpec tasks                                           | high-level implementation and verification tasks                                                                                                | mapped                          |
| `.superpowers/plans/add-command-event-runtime.md`                                | Plan                                                     | OpenSpec requirements and source docs                                                                                                           | mapped                          |
| `.superpowers/tasks/add-command-event-runtime/*.md`                              | Tasks 01-07                                              | each task maps to OpenSpec requirements                                                                                                         | mapped                          |
| `.superpowers/runs/add-command-event-runtime/validation.md`                      | Task 07                                                  | validation matrix and command results                                                                                                           | mapped                          |
| `packages/core/src/command-event-types.ts`                                       | Task 01                                                  | public Command/Event types; SDK command-event protocol                                                                                          | mapped                          |
| `packages/core/src/command-event-runtime.ts`                                     | Tasks 01-06                                              | factory, event hub, command bus, error isolation, dispose                                                                                       | mapped                          |
| `packages/core/src/command-event-runtime.test.ts`                                | Tasks 01-07                                              | contract tests for M2 requirements                                                                                                              | mapped                          |
| `packages/core/src/errors.ts`                                                    | Tasks 01, 04, 05, 06                                     | `PluginError`, command runtime core failures                                                                                                    | mapped                          |
| `packages/core/src/index.ts`                                                     | Tasks 01, 06                                             | public exports                                                                                                                                  | mapped                          |
| `packages/core/src/package-boundary.test.ts`                                     | Tasks 01, 07                                             | M2 allowed surface and later milestone exclusion                                                                                                | mapped                          |
| `AGENTS.md`                                                                      | workflow support artifact outside runtime implementation | repository agent/workflow instructions; must be committed separately from the runtime change or explicitly called out as workflow-support scope | mapped as separate commit scope |

## Requirement Compliance

| Requirement                                   | Evidence                                                                    | Result | Notes                                                                                                                                                                      |
| --------------------------------------------- | --------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Command/Event public types exported           | `command-event-types.ts`, `index.ts`, typecheck via `pnpm check`            | pass   | Required types are exported. Additional related source/error types (`AetherError`, `CommandSource`, `EventSource`, `ErrorSeverity`) are traceable to SDK/error-model docs. |
| `CommandEventRuntime` API exported            | `createCommandEventRuntime`, `CommandEventRuntime`, package boundary test   | pass   | Independent factory; does not require `bootstrapCore`, Adapter, Markdown, or Shell.                                                                                        |
| Synchronous register/dispatch                 | `command-event-runtime.ts`, tests for handler invocation and result mapping | pass   | `dispatch` returns `CommandResult`, not `Promise`.                                                                                                                         |
| `CommandResult` success/failure               | tests cover success value, `false`, unknown command                         | pass   | Unknown command returns `CoreError` with `source: core`.                                                                                                                   |
| Event Hub subscribe/emit/unsubscribe          | tests cover `change`, `pluginError`, unsubscribe, JSON payload              | pass   | M2 tests do not require document snapshot.                                                                                                                                 |
| Handler throw isolation                       | tests cover `PluginError` result and `pluginError` event                    | pass   | No Adapter transaction rollback implemented or asserted.                                                                                                                   |
| Dispose fail-closed                           | tests cover dispatch after dispose, emit no-op, repeated dispose            | pass   | Runtime-level idempotency only; does not close M1 bootstrap follow-up.                                                                                                     |
| M2 package boundary excludes later milestones | package boundary test and `rg` guard                                        | pass   | Guard hits only forbidden-name assertions plus source-string unions from documented types. No later-milestone packages or APIs added.                                      |
| M1 follow-ups remain out of scope             | task/validation notes; no `bootstrap.ts` changes                            | pass   | duplicate `metadata.name`, partial startup cleanup, and `bootstrapCore` dispose public contract not implemented.                                                           |

## Boundary Review

- Core boundary: pass. Implementation remains inside `packages/core/src` and introduces only the M2 Command/Event runtime.
- Plugin contract: pass. `PluginError` is introduced for command handler isolation and is covered by OpenSpec.
- Adapter boundary: pass with note. No Adapter package, factory, import, transaction API, or rollback behavior was introduced. The string literal `adapter` appears only in documented error/event source union types from SDK/error-model docs.
- Shell boundary: pass with note. No React or Shell package/import was introduced. The string literal `shell` appears only in documented command/event source union types.
- Command/event flow: pass. State-changing intent enters through `dispatch`; observation uses `emit`/`on`; M2 only implements the error-boundary middleware.

## Explicit User Checks

1. All implementation files map to OpenSpec requirement or Superpowers task: pass. `AGENTS.md` is not an implementation file; it is mapped as a separate workflow-support doc scope and should not be bundled into a pure runtime commit.
2. M2 only implements Command/Event: pass. No Adapter, Markdown, UI Shell, complete editor, queue/coalescing, guard chain, or M1 follow-up implemented.
3. Core public exports conform to spec: pass. New exports are Command/Event runtime, public types, and `PluginError`/error options covered by design or source docs.
4. Not introduced: Adapter / React / Remark / ProseMirror / GFM / Markdown parse-serialize: pass.
5. Test coverage: pass.
   - successful dispatch: covered.
   - failed dispatch: `false`, unknown command, disposed runtime covered.
   - event subscription: covered.
   - unsubscribe: covered.
   - handler throw: covered with `PluginError` and `pluginError`.
   - package boundary: covered.
6. `pnpm check`: pass on 2026-07-04. Result: build/typecheck/test passed; 38 tests, 0 failures.

## Validation Review

- Automated checks run during this review:
  - `openspec status --change add-command-event-runtime --json`: pass, `isComplete: true`.
  - `openspec validate add-command-event-runtime --strict`: pass.
  - `pnpm check`: pass.
  - `rg -n -i "react|prosemirror|remark|gfm|createEditor|parseMarkdown|serializeMarkdown|getMarkdown|getDocument|Adapter" packages/core/src packages/core/package.json`: acceptable hits only in package-boundary negative assertions and documented type unions.
- Existing validation record: `.superpowers/runs/add-command-event-runtime/validation.md` says tasks 01-07 completed and `pnpm check` passed.
- Intuitive verification: reviewed `index.ts`, runtime implementation, tests, package boundary, and no `bootstrap.ts` dependency in Command/Event runtime.

## Version Review

- Package metadata: no observed package metadata or lockfile change in current diff.
- Manifest support: unchanged; `SUPPORTED_MANIFEST_VERSIONS` remains `[1]`.
- Public exports: additive public surface in `@aether-md/core`; version impact recorded as minor-level for an unreleased package.
- SDK/docs drift: long-lived docs still describe Command/Event as design draft and should be updated/synced after this review.
- Main OpenSpec specs: not yet synced; expected next step before archive.

## Code-Management Review

- Commit grouping: implementation can be one `feat(core)` change with OpenSpec and Superpowers artifacts in the PR body, or task-sized commits followed by squash.
- Separate workflow-support grouping: `AGENTS.md` should be committed separately, for example `docs(workflow): update repository agent instructions`, unless the PR intentionally includes both runtime and workflow guardrail updates and says so.
- Commit/PR metadata must mention: OpenSpec `add-command-event-runtime`, Superpowers tasks 01-07, validation path, version impact, no accepted implementation deviations, and M1 follow-ups deferred.
- Working tree note: `AGENTS.md` remains modified. It is now classified as workflow-support scope, not runtime implementation scope.

## Blockers

- None for implementation/spec compliance.

## Deviations

- Accepted implementation deviations: none.
- Validation deviation already recorded: Task 07 added no new failing test because Tasks 01-06 already covered the validation matrix; accepted.
- Review-process deviation: this review artifact was written directly because the global Superpowers command/skill layer was unavailable in this host. This is accepted for this review because OpenSpec CLI was available, `.superpowers/` plan/task/validation artifacts were present, and dynamic tool discovery did not expose a Superpowers layer.
- Code-management deviation: `AGENTS.md` is present in the dirty tree as workflow-support documentation. It is accepted only as separate commit/PR scope, not as part of the core runtime implementation.

## Required Updates

- Docs: update/sync long-lived Core API / SDK / project status docs to mark the M2 implemented subset and keep later milestones excluded.
- Specs: sync `command-event-runtime` into main OpenSpec specs and update `core-bootstrap` main package boundary after review acceptance.
- ADR: none required; implementation follows existing microkernel/Command/Event principles and does not alter architecture direction.
- Glossary: none required.

## Recommendation

- Recommended next skill: `aether-workflow-update-docs-spec`.
- Do not archive yet. Archive should wait for docs/spec sync and intentional commit grouping that separates or explicitly labels `AGENTS.md` workflow-support changes.
