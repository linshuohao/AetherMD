# Final Report: add-command-event-runtime

## Change

- OpenSpec change: `add-command-event-runtime`
- Archive path: `openspec/changes/archive/2026-07-04-add-command-event-runtime/`
- Final status: archived
- Version impact: minor-level additive public API for unreleased `@aether-md/core`; no package version bump, no `manifestVersion` change, no lockfile change

`add-command-event-runtime` delivered the M2 Command/Event Runtime baseline in `@aether-md/core`: synchronous `createCommandEventRuntime` with `register` / `dispatch` / `on` / `emit` / `dispose`, reviewable `CommandResult`, Event Hub subscribe/emit/unsubscribe, handler throw isolation as `PluginError` + `pluginError` event, and disposed fail-closed behavior. The runtime is independent of `bootstrapCore`, Adapter, Markdown, and Shell.

## Source Docs

- `docs/sdk/command-event-protocol.md`
- `docs/architecture/core-api.md`
- `docs/engineering/error-model.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/engineering/test-strategy.md`
- `docs/project-status.md`

Workflow and execution records:

- `openspec/changes/archive/2026-07-04-add-command-event-runtime/proposal.md`
- `openspec/changes/archive/2026-07-04-add-command-event-runtime/design.md`
- `openspec/changes/archive/2026-07-04-add-command-event-runtime/specs/command-event-runtime/spec.md`
- `openspec/changes/archive/2026-07-04-add-command-event-runtime/specs/core-bootstrap/spec.md`
- `openspec/changes/archive/2026-07-04-add-command-event-runtime/tasks.md`
- `.superpowers/plans/add-command-event-runtime.md`
- `.superpowers/tasks/add-command-event-runtime/*.md`
- `.superpowers/runs/add-command-event-runtime/validation.md`
- `.superpowers/reviews/add-command-event-runtime.md`

## Specs Updated

Main OpenSpec specs synced before archive:

- `openspec/specs/command-event-runtime/spec.md` (ADDED capability, durable main-spec form)
- `openspec/specs/core-bootstrap/spec.md` (MODIFIED package boundary to allow M2 Command/Event surface and keep later milestones excluded)

Long-lived docs updated to mark M2 implemented subset:

- `docs/architecture/core-api.md`
- `docs/sdk/command-event-protocol.md`
- `docs/engineering/error-model.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/engineering/test-strategy.md`
- `docs/project-status.md`

No new ADR. No glossary changes.

## Tasks Completed

| Task                                              | Status    | Validation                                               | Deviation                                    |
| ------------------------------------------------- | --------- | -------------------------------------------------------- | -------------------------------------------- |
| OpenSpec 1.x public types and API surface         | completed | types + exports + boundary tests                         | none                                         |
| OpenSpec 2.x Event Hub                            | completed | on/emit/unsubscribe tests                                | none                                         |
| OpenSpec 3.x Command Bus                          | completed | success/false/unknown/throw/dispose tests                | none                                         |
| OpenSpec 4.x package boundary                     | completed | package-boundary tests + `rg` guard                      | none                                         |
| OpenSpec 5.x verification                         | completed | `pnpm check` pass (38 tests)                             | none                                         |
| OpenSpec 6.x deferred M1 follow-ups (record only) | completed | recorded in plan/validation/review                       | intentionally not implemented                |
| OpenSpec 7.x workflow follow-up                   | completed | Chinese Superpowers artifacts; English API/path keywords | `AGENTS.md` kept out of runtime commit scope |
| Superpowers 01 define types and boundary tests    | completed | red→green recorded                                       | none                                         |
| Superpowers 02 minimal event hub                  | completed | red→green recorded                                       | none                                         |
| Superpowers 03 command handler registry           | completed | red→green recorded                                       | none                                         |
| Superpowers 04 command dispatch and result        | completed | red→green recorded                                       | none                                         |
| Superpowers 05 handler error wrapping             | completed | red→green recorded                                       | none                                         |
| Superpowers 06 public surface and dispose         | completed | red→green recorded                                       | none                                         |
| Superpowers 07 complete tests/exports/boundary    | completed | matrix already covered by 01–06                          | Task 07 added no new failing test            |

## Files Changed

| File                                                              | Task / Reason                     | Notes                                               |
| ----------------------------------------------------------------- | --------------------------------- | --------------------------------------------------- |
| `packages/core/src/command-event-types.ts`                        | Task 01                           | public Command/Event types                          |
| `packages/core/src/command-event-runtime.ts`                      | Tasks 01–06                       | factory, hub, bus, error isolation, dispose         |
| `packages/core/src/command-event-runtime.test.ts`                 | Tasks 01–07                       | contract tests                                      |
| `packages/core/src/errors.ts`                                     | Tasks 01, 04–06                   | `PluginError`, disposed/unknown core failures       |
| `packages/core/src/index.ts`                                      | Tasks 01, 06                      | public exports                                      |
| `packages/core/src/package-boundary.test.ts`                      | Tasks 01, 07                      | M2 allowed / later milestones excluded              |
| `openspec/specs/command-event-runtime/spec.md`                    | docs/spec sync                    | main capability spec                                |
| `openspec/specs/core-bootstrap/spec.md`                           | docs/spec sync                    | package boundary allows M2                          |
| `docs/architecture/core-api.md`                                   | docs/spec sync                    | M2 API surface                                      |
| `docs/sdk/command-event-protocol.md`                              | docs/spec sync                    | implemented subset                                  |
| `docs/engineering/error-model.md`                                 | docs/spec sync                    | PluginError baseline                                |
| `docs/engineering/mvp-implementation-plan.md`                     | docs/spec sync                    | M2 status                                           |
| `docs/engineering/test-strategy.md`                               | docs/spec sync                    | M2 matrix                                           |
| `docs/project-status.md`                                          | docs/spec sync                    | stage status                                        |
| `.superpowers/plans/add-command-event-runtime.md`                 | plan                              | implementation plan                                 |
| `.superpowers/tasks/add-command-event-runtime/*.md`               | tasks 01–07                       | Superpowers tasks                                   |
| `.superpowers/runs/add-command-event-runtime/validation.md`       | Task 07                           | validation record                                   |
| `.superpowers/runs/add-command-event-runtime/final-report.md`     | archive                           | this report                                         |
| `.superpowers/reviews/add-command-event-runtime.md`               | compliance review                 | pass, no blockers                                   |
| `openspec/changes/archive/2026-07-04-add-command-event-runtime/*` | OpenSpec change                   | archived proposal/design/delta/tasks                |
| `AGENTS.md`                                                       | workflow-support (separate scope) | not part of runtime implementation commit           |
| `.cursor/skills/aether-workflow-*.md`                             | unrelated/workflow dirty tree     | present in working tree; not runtime implementation |

## Validation Results

Archive-time final verification:

- `pnpm check`: pass (build, typecheck, test)
- Core tests: 38 passed, 0 failed, 12 suites
- OpenSpec artifacts: proposal/design/specs/tasks all `done`; `isComplete: true`
- OpenSpec tasks checklist: 24/24 completed before archive
- Superpowers tasks 01–07: `Status: completed`
- Validation record: `.superpowers/runs/add-command-event-runtime/validation.md`
- Compliance review: pass with recorded process deviations; blockers: none
- Spec sync: main `command-event-runtime` and `core-bootstrap` specs present in durable form; long-lived docs mark M2 implemented subset

Prior recorded commands (validation.md / review):

- `pnpm --filter @aether-md/core test`: pass
- `pnpm --filter @aether-md/core exec tsc --noEmit`: pass
- `pnpm --filter @aether-md/core build`: pass
- `openspec validate add-command-event-runtime --strict`: pass
- package-boundary `rg` guard: pass (only negative assertions / documented source unions)

## Deviations

- Accepted implementation deviations: none.
- Validation deviation: Task 07 added no new failing test because Tasks 01–06 already covered the validation matrix; accepted.
- Process deviation: global Superpowers command/skill layer unavailable in this host (`command -v superpowers` not found). Archive and review used existing `.superpowers/` artifacts and OpenSpec CLI; accepted.
- Code-management deviation: `AGENTS.md` and some `.cursor/skills/aether-workflow-*.md` files remain dirty as workflow-support / unrelated scope and must not be mixed into a pure runtime commit unless explicitly labeled.
- Spec form deviation: main specs use durable `# Spec` / `## Requirements` shape and differ textually from archived ADDED/MODIFIED delta specs; expected after docs/spec sync.

## Docs / ADR Updates

- Docs updated for M2 Command/Event Runtime implemented subset and exclusions.
- Main OpenSpec specs synced for `command-event-runtime` and `core-bootstrap` package boundary.
- ADR: none required.
- Glossary: none required.

## Version Impact

- Package versions changed: no (`@aether-md/core` remains unreleased baseline version).
- `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` changed: no (`[1]` unchanged).
- Public exports changed: yes — additive Command/Event types, `PluginError`, `createCommandEventRuntime`, `CommandEventRuntime`.
- Lockfiles changed: no.
- Compatibility docs changed: yes — Core API, SDK protocol, error model, MVP plan, test strategy, project status.
- Main specs changed: yes — new `command-event-runtime` capability; `core-bootstrap` package boundary updated.

## Remaining Follow-ups

M1 hardening (still deferred, not part of this change):

- Define duplicate `metadata.name` behavior.
- Decide partial startup cleanup after lifecycle hook failure.
- Decide whether `bootstrapCore` dispose idempotency should become an explicit public contract beyond current no-op behavior.

M2 / later milestones (out of scope):

- Command Queue priority and coalescing.
- Guard chain and full `AetherEditor` async dispatch.
- Adapter transaction rollback on handler failure.
- Markdown parse/serialize, React Shell, Remark, ProseMirror, GFM.

Code-management at archive time:

- Working tree remains uncommitted (no commit created by archive).
- Runtime implementation, OpenSpec archive, Superpowers artifacts, and docs/spec sync are ready for intentional commit grouping.
- Keep `AGENTS.md` / `.cursor/skills` workflow-support changes in a separate commit or explicitly label mixed scope in the PR body.
