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

## Actions

1. Read the task validation requirements.
2. Determine whether this is design-stage validation or code-stage validation.
3. Run available checks.
4. Record commands, results, and failures in `.superpowers/runs/<change>/validation.md`.
5. Update task `Run Log`.
6. If a failure is accepted, record it as a deviation instead of hiding it.

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

## Pause If

- no validation path exists;
- validation failures are unexplained;
- validation requires changing task scope;
- tests were deleted, skipped, or weakened.

## Output

Report validation commands, pass/fail status, recorded results path, deviations, and recommended next workflow skill.
