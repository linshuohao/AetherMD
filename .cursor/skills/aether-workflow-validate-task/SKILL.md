---
name: aether-workflow-validate-task
description: Validate an AetherMD task implementation and record results. Use after Codex implements a task or when validation needs to be rerun before review or archive.
---

# Aether Workflow: Validate Task

Use this skill as Step 6 of the AetherMD AI-native engineering workflow.

## Goal

Run and record the validation required by the task and by the relevant project docs.

## Inputs

- Implemented task file
- Current diff
- Task validation section
- `docs/engineering/test-strategy.md`
- `docs/architecture/ci-checklist.md`

## Tooling Contract

- Use the installed OpenSpec skill/command layer to confirm the change remains valid when validation affects OpenSpec requirements.
- Use the global Superpowers command/skill layer to record validation state and task run results.
- Direct edits to `.superpowers/runs/<change>/validation.md` are allowed as the execution record selected by Superpowers, but not as a replacement for the global Superpowers validation step.
- If the global Superpowers command/skill layer is unavailable in the current host, pause and report the tool visibility problem.

## Version And Code Management Hooks

- Version hook: validate any task that touched package metadata, lockfiles, exports, Manifest version support, SDK docs, compatibility docs, or main specs with a focused check or recorded review.
- Code-management hook: record changed files and confirm they match task allowed files before marking validation passed.
- Commit-readiness hook: if the task is intended to be committed, verify the validation record includes commands, status, deviations, and suggested commit scope.

## Actions

1. Read the task validation requirements.
2. Read `references/validation-integrity.md`.
3. If creating a validation record from scratch, use `assets/validation-record-template.md` unless the Superpowers layer provides a stricter template.
4. Determine whether this is design-stage validation or code-stage validation.
5. Confirm the task's TDD entry point was exercised or that a deviation explains why it was not.
6. Run available checks.
7. Run intuitive verification when the task defines it, and record it separately from automated validation.
8. Record commands, results, and failures through the global Superpowers command/skill layer.
9. Update task `Run Log`.
10. If a failure is accepted, record it as a deviation instead of hiding it.

## Bundled Resources

- `assets/validation-record-template.md`: validation record scaffold.
- `references/validation-integrity.md`: what counts as validation and what must be recorded.

## Design-stage Checks

- Search related terms with `rg`.
- Check RFC keyword consistency with `rg "MUST|SHOULD|MAY" docs`.
- Check affected document ownership.
- Check whether ADR updates are needed.

## Code-stage Checks

Use the project-defined commands when they exist. Expected future checks include:

- TypeScript type checks
- unit tests
- contract tests
- integration tests
- markdown link checks
- package boundary checks

## TDD Validation Integrity

- Validation should prove the task requirement, not merely prove the project still builds.
- Prefer tests/checks that fail for the intended reason before implementation, especially for code tasks.
- If only a broad command is available, pair it with a focused test, package-boundary check, demo trace, or design assertion when practical.
- Record empty test runs, skipped tests, stale generated output, or noisy scope guards as failures or deviations; do not report them as clean passes.
- Intuitive verification can improve reviewer confidence, but it must be recorded separately and cannot replace required tests or design-stage checks.

## Pause If

- no validation path exists;
- validation failures are unexplained;
- validation requires changing task scope;
- the TDD entry point was skipped without a recorded deviation;
- tests were deleted, skipped, or weakened.
- global Superpowers command/skill layer is unavailable.
- version-impact validation is missing for a versioned contract change;
- changed files do not match the task boundary.

## Output

Report validation commands, pass/fail status, OpenSpec skill/command path used when relevant, Superpowers command/skill path used, version checks, code-management checks, recorded results path, deviations, and recommended next workflow skill.
