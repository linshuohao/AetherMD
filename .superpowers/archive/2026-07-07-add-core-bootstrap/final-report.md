# add-core-bootstrap Final Report

## Change

`add-core-bootstrap` introduced the first minimal `@aether-md/core` M1 Core Bootstrap package and runtime surface.

The completed scope covers Manifest shape/version validation, Service Capability validation, deterministic `metadata.dependsOn` ordering, startup lifecycle order, reverse `dispose()` teardown, package/export boundaries, minimal repeatable validation scripts, and workflow records for the AetherMD AI-native engineering process.

OpenSpec archive path after final archive:

- `openspec/changes/archive/2026-07-04-add-core-bootstrap/`

Superpowers run path:

- `.superpowers/runs/add-core-bootstrap/`

## Source Docs

Primary source docs and contracts used by this change:

- `docs/architecture/core-api.md`
- `docs/architecture/package-layout.md`
- `docs/architecture/compatibility.md`
- `docs/engineering/manifest-loading.md`
- `docs/engineering/error-model.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/sdk/manifest.md`
- `docs/sdk/capabilities-and-permissions.md`
- `docs/sdk/lifecycle.md`
- `docs/glossary.md`
- `AI_NATIVE_ENGINEERING_WORKFLOW.md`

Workflow and execution records:

- `openspec/changes/archive/2026-07-04-add-core-bootstrap/proposal.md`
- `openspec/changes/archive/2026-07-04-add-core-bootstrap/design.md`
- `openspec/changes/archive/2026-07-04-add-core-bootstrap/specs/core-bootstrap/spec.md`
- `openspec/changes/archive/2026-07-04-add-core-bootstrap/tasks.md`
- `.superpowers/plans/add-core-bootstrap.md`
- `.superpowers/tasks/add-core-bootstrap/*.md`
- `.superpowers/runs/add-core-bootstrap/validation.md`
- `.superpowers/reviews/add-core-bootstrap.md`

## Specs Updated

Main OpenSpec specs updated:

- `openspec/specs/core-bootstrap/spec.md`
- `openspec/specs/engineering-workflow/spec.md`

The main `core-bootstrap` spec has been synced and refined from the delta spec. The main spec uses the durable `# Core Bootstrap Spec` shape and includes implemented M1 scenarios for Adapter-backed capability boundaries, same-level host order, lifecycle hook failure, and repeated dispose no-op.

The archived delta spec remains the original change artifact and is intentionally preserved under the archived change.

## Tasks Completed

OpenSpec high-level tasks were completed and marked done before archive:

- Package boundary
- Manifest loading and version validation
- Service Capability validation
- Plugin dependency ordering
- Lifecycle startup and dispose
- Validation
- Chinese workflow artifact language
- Workflow follow-up into Superpowers plan/tasks/validation/review

Superpowers implementation tasks completed:

- Task 01: `01-define-minimal-package-workspace-boundary.md`
- Task 02: `02-define-core-public-types.md`
- Task 03: `03-implement-manifest-version-validation.md`
- Task 04: `04-implement-service-capability-validation.md`
- Task 05: `05-implement-dependson-topological-order.md`
- Task 06: `06-implement-lifecycle-startup-order.md`
- Task 07: `07-implement-dispose-reverse-destroy.md`
- Task 08: `08-add-minimal-tests-and-validation-script.md`

Each Superpowers task records `Status: completed` and corresponding validation evidence in `.superpowers/runs/add-core-bootstrap/validation.md`.

## Files Changed

Core implementation:

- `packages/core/package.json`
- `packages/core/tsconfig.json`
- `packages/core/tsconfig.test.json`
- `packages/core/src/index.ts`
- `packages/core/src/types.ts`
- `packages/core/src/errors.ts`
- `packages/core/src/manifest.ts`
- `packages/core/src/capabilities.ts`
- `packages/core/src/dependencies.ts`
- `packages/core/src/lifecycle.ts`
- `packages/core/src/bootstrap.ts`

Core tests:

- `packages/core/src/manifest.test.ts`
- `packages/core/src/capabilities.test.ts`
- `packages/core/src/dependencies.test.ts`
- `packages/core/src/lifecycle.test.ts`
- `packages/core/src/bootstrap.test.ts`
- `packages/core/src/package-boundary.test.ts`

Workspace and package management:

- `package.json`
- `pnpm-lock.yaml`

OpenSpec and Superpowers artifacts:

- `openspec/changes/archive/2026-07-04-add-core-bootstrap/*`
- `openspec/specs/core-bootstrap/spec.md`
- `openspec/specs/engineering-workflow/spec.md`
- `.superpowers/plans/add-core-bootstrap.md`
- `.superpowers/tasks/add-core-bootstrap/*.md`
- `.superpowers/runs/add-core-bootstrap/validation.md`
- `.superpowers/runs/add-core-bootstrap/final-report.md`
- `.superpowers/reviews/add-core-bootstrap.md`

Docs and workflow updates:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `README.md`
- `docs/README.md`
- `docs/architecture/compatibility.md`
- `docs/architecture/core-api.md`
- `docs/architecture/package-layout.md`
- `docs/community/git-workflow.md`
- `docs/engineering/README.md`
- `docs/engineering/error-model.md`
- `docs/engineering/manifest-loading.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/engineering/test-strategy.md`
- `docs/glossary.md`
- `docs/maintenance.md`
- `docs/project-status.md`
- `docs/sdk/capabilities-and-permissions.md`
- `docs/sdk/lifecycle.md`
- `docs/sdk/manifest.md`
- `.codex/skills/aether-workflow-*.md`

Task mapping:

- Tasks 01 and 08 map to package boundary, workspace scripts, `typescript` dependency, lockfile updates, and package-boundary tests.
- Task 02 maps to public types, error shape, capability identifiers, Manifest types, and package exports.
- Task 03 maps to Manifest shape/version validation and tests.
- Task 04 maps to Service Capability validation and tests.
- Task 05 maps to `dependsOn` topological order and tests.
- Task 06 maps to startup lifecycle ordering and tests.
- Task 07 maps to reverse dispose lifecycle and tests.
- Workflow docs/spec updates map to the Chinese artifact language requirement and Step 6.5 execution-loop hardening.

## Validation Results

Recorded validation passed:

- `pnpm --filter @aether-md/core exec tsc --noEmit`
- `pnpm --filter @aether-md/core test -- --run`
- `rg "react|prosemirror|remark|gfm|CommandBus|EventHub|Adapter" packages/core package.json pnpm-workspace.yaml`
- Manual review of Superpowers plan/task/validation/review language and artifact completeness

Latest recorded core test result:

- 22 tests passed
- 6 suites passed
- 0 failed

Compliance review result:

- `.superpowers/reviews/add-core-bootstrap.md`
- Status: passed with follow-up updates
- Blockers: none

Archive readiness checks:

- `openspec status --change add-core-bootstrap --json` returned `isComplete: true`.
- All OpenSpec artifact statuses were `done`.
- OpenSpec high-level task checklist was updated to completed before archive.
- Superpowers tasks, validation, review, and final report are present.

## Deviations

Accepted deviations:

- Node built-in test runner plus TypeScript compiled output is used instead of Vitest. This keeps M1 dependencies minimal and remains repeatable.
- `dispose()` repeated calls are explicit no-op after first dispose. This is recorded and covered by tests, while full dispose idempotency remains a future hardening topic.
- Lifecycle hook failure is wrapped as fatal `CoreError`; partial startup cleanup is deferred until a future spec defines it.
- Workflow skill and guide updates were included because this change exercised and documented the Step 6.5 Superpowers execution loop.
- The main `core-bootstrap` spec is a durable synced spec and differs textually from the archived delta spec. This is expected after docs/spec sync.

## Docs / ADR Updates

Docs and specs were updated for:

- First `@aether-md/core` M1 package boundary
- Core Bootstrap public API and exported surface
- Manifest loading and error model behavior
- Service Capability and lifecycle behavior
- Test strategy and project status
- AI-native workflow task-loop and archive expectations
- Git workflow and Codex review expectations

No new ADR was added. Existing review found no architecture decision requiring a new ADR for this M1 bootstrap implementation.

## Version Impact

Version and public-contract impact:

- Package versions changed: yes. `packages/core/package.json` introduces `@aether-md/core` at `0.0.0`.
- `manifestVersion` changed: no. `SUPPORTED_MANIFEST_VERSIONS` is `[1] as const`.
- Public exports changed: yes. The new `@aether-md/core` package exports M1 Manifest, capability, plugin, bootstrap runtime, dependency resolver, lifecycle, and fatal error types.
- Lockfiles changed: yes. `pnpm-lock.yaml` was updated for workspace/package setup and TypeScript test support.
- Compatibility docs changed: yes. Architecture, SDK, engineering, and project-status docs were updated to reflect M1 bootstrap behavior.
- Main specs changed: yes. `openspec/specs/core-bootstrap/spec.md` and `openspec/specs/engineering-workflow/spec.md` were updated.

## Remaining Follow-ups

Non-blocking future hardening:

- Define duplicate `metadata.name` behavior in a future Manifest/lifecycle hardening change.
- Decide whether partial startup cleanup after `onInit` or `onReady` failure belongs in a future lifecycle hardening spec.
- Decide whether dispose idempotency should become an explicit public contract beyond M1 no-op behavior.

Code-management state at report creation:

- Uncommitted tracked files remain.
- Untracked implementation, OpenSpec, Superpowers, and package files remain.
- No commit or PR was created during archive.
