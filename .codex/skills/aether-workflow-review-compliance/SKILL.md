---
name: aether-workflow-review-compliance
description: Perform AetherMD spec compliance and anticorruption review for a change. Use after task implementation and validation, before syncing docs/specs or archiving.
---

# Aether Workflow: Review Compliance

Use this skill as Step 7 of the AetherMD AI-native engineering workflow.

## Goal

Check whether the implementation matches OpenSpec and preserves AetherMD architecture boundaries.

## Inputs

- Current diff
- OpenSpec change artifacts
- Superpowers task files
- `.superpowers/runs/<change>/validation.md`
- Relevant Docs and ADRs

## Tooling Contract

- Use the installed OpenSpec skill/command layer to inspect change status, requirements, and validation state before review.
- Use the global Superpowers command/skill layer to inspect task/run state and to create or update the review artifact.
- Direct edits to `.superpowers/reviews/<change>.md` are allowed as the review record selected by Superpowers, but not as a replacement for the underlying Superpowers review step.
- If either lower layer is unavailable, pause and report the tool visibility problem before completing the review.

## Version And Code Management Hooks

- Version hook: review all changes to package metadata, lockfiles, exports, Manifest versions, public contracts, SDK docs, compatibility docs, and OpenSpec main specs.
- Code-management hook: map every changed file to a task and flag unrelated files.
- Commit-readiness hook: record recommended commit grouping and whether branch/PR metadata must mention OpenSpec, Superpowers tasks, validation, and deviations.

## Actions

1. Invoke the installed OpenSpec skill/command to inspect status and requirements.
2. Invoke the global Superpowers command/skill to inspect task and validation state.
3. Read `references/anticorruption-checklist.md`.
4. Create or update `.superpowers/reviews/<change>.md` through the global Superpowers command/skill, using `assets/compliance-review-template.md` if no stricter template exists.
5. Map changed files to tasks.
6. Map tasks to spec requirements or docs references.
7. Check acceptance criteria.
8. Check architecture boundaries and dependency direction.
9. Check public contract changes.
10. Check validation coverage.
11. Record blockers, accepted deviations, and required docs/spec/ADR updates.

## Bundled Resources

- `assets/compliance-review-template.md`: compliance review scaffold.
- `references/anticorruption-checklist.md`: traceability, architecture, quality, and versioning checks.

## Checklist

- Every changed file maps to a task.
- Every task maps to a spec requirement or source doc.
- Core remains business-blind.
- UI Shell concerns do not leak into Core.
- Third-party engine APIs remain inside Adapter boundaries.
- State changes route through Command Bus.
- Public contract changes are explicit in spec.
- Tests are not weakened.
- Docs, Specs, and ADRs are updated when needed.
- No unrelated files changed.

## Pause If

- implementation diverges from spec;
- public contract changes lack OpenSpec coverage;
- an ADR is required but missing;
- validation is missing or failed without recorded deviation.
- OpenSpec skill/command status cannot be checked;
- global Superpowers command/skill task/review state cannot be checked.
- versioned contract change lacks explicit spec/docs coverage;
- any changed file cannot be mapped to a task.

## Output

Report review path, OpenSpec skill/command path used, Superpowers command/skill path used, pass/fail status, version review, code-management review, blockers, required updates, deviations, and recommended next workflow skill.
