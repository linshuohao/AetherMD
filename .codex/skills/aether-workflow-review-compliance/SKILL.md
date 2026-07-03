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

## Actions

1. Create or update `.superpowers/reviews/<change>.md`.
2. Map changed files to tasks.
3. Map tasks to spec requirements or docs references.
4. Check acceptance criteria.
5. Check architecture boundaries and dependency direction.
6. Check public contract changes.
7. Check validation coverage.
8. Record blockers, accepted deviations, and required docs/spec/ADR updates.

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

## Output

Report review path, pass/fail status, blockers, required updates, deviations, and recommended next workflow skill.
