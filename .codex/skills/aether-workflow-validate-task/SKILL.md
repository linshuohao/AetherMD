---
name: aether-workflow-validate-task
description: Validate an AetherMD task implementation and record results. Use after a task is implemented or when validation needs to be rerun before review or archive.
---

# Aether Workflow: Validate Task

Use this skill as Step 6 of the AetherMD AI-native engineering workflow.

These instructions are host-agnostic. Any coding agent may execute them.

## Goal

Run and record the validation required by the task and by the relevant project docs.

## Inputs

- Implemented task file
- Current diff
- Task validation section
- `docs/engineering/test-strategy.md`
- `docs/architecture/ci-checklist.md`

## Required Skills

| Role | Skill name | Kind |
| --- | --- | --- |
| OpenSpec status/context | `openspec-apply-change` | Project, when validation affects OpenSpec requirements |
| Verification process | `verification-before-completion` | Superpowers |

Validation records under `.superpowers/runs/<change>/validation.md` and task `Run Log` updates are AetherMD execution records written after the required process skills are loaded.

## Skill Invocation

To invoke a named skill:

1. Use the host skill-invocation mechanism when available (for example a `Skill` tool or `/skill-name`).
2. Otherwise find the skill by `name` in the host's available-skills list and read its full `SKILL.md` with the host file-read tool, then follow it.
3. Project skills are mirrored under `.cursor/skills/<name>/SKILL.md` and `.codex/skills/<name>/SKILL.md`. Use either path; content is identical.
4. Installed Superpowers skills are referenced by name only. Resolve them from the host skill list or the Superpowers plugin install path.
5. Announce each loaded skill by name before applying it.
6. If a required skill cannot be loaded, pause and report the missing skill name. Do not silently skip it.

## Tooling Contract

- Load and follow `openspec-apply-change` when validation affects OpenSpec requirements.
- Load and follow `verification-before-completion` before recording a pass.
- Write `.superpowers/runs/<change>/validation.md` using `assets/validation-record-template.md` unless a stricter project template exists.
- Update the task `Run Log` with commands, results, and failures.
- If a required skill cannot be loaded, pause and report the missing skill.

## Version And Code Management Hooks

- Version hook: validate any task that touched package metadata, lockfiles, exports, Manifest version support, SDK docs, compatibility docs, or main specs with a focused check or recorded review.
- Code-management hook: record changed files and confirm they match task allowed files before marking validation passed.
- Commit-readiness hook: if the task is intended to be committed, verify the validation record includes commands, status, deviations, and suggested commit scope.

## Actions

1. Read the task validation requirements.
2. Read `references/validation-integrity.md`.
3. Load and follow `verification-before-completion`.
4. If validation affects OpenSpec requirements, load and follow `openspec-apply-change`.
5. If creating a validation record from scratch, use `assets/validation-record-template.md`.
6. Determine whether this is design-stage validation or code-stage validation.
7. Confirm the task's TDD entry point was exercised or that a deviation explains why it was not.
8. Run available checks.
9. Run intuitive verification when the task defines it, and record it separately from automated validation.
10. Record commands, results, and failures in `.superpowers/runs/<change>/validation.md`.
11. Update task `Run Log`.
12. If a failure is accepted, record it as a deviation instead of hiding it.

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
- tests were deleted, skipped, or weakened;
- `verification-before-completion` cannot be loaded;
- `openspec-apply-change` is required for this validation and cannot be loaded;
- version-impact validation is missing for a versioned contract change;
- changed files do not match the task boundary.

## Output

Report validation commands, pass/fail status, skills loaded, version checks, code-management checks, recorded results path, deviations, and recommended next workflow skill.
