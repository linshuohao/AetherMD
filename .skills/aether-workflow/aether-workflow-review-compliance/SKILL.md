---
name: aether-workflow-review-compliance
description: Perform AetherMD spec compliance and anticorruption review for a change. Use after task implementation and validation, before syncing docs/specs or archiving.
---

# Aether Workflow: Review Compliance

Use this skill as Step 7 of the AetherMD AI-native engineering workflow.

These instructions are host-agnostic. Any coding agent may execute them.

## Goal

Check whether the implementation matches OpenSpec and preserves AetherMD architecture boundaries.

## Inputs

- Current diff
- OpenSpec change artifacts
- Superpowers task files
- `.superpowers/runs/<change>/validation.md`
- Relevant Docs and ADRs

## Required Skills

| Role | Skill name | Kind |
| --- | --- | --- |
| OpenSpec status/context | `openspec-apply-change` | Project |
| Review process | `requesting-code-review` | Superpowers |

The compliance review file `.superpowers/reviews/<change>.md` is an AetherMD review record written after the required process skills are loaded.

## Skill Invocation

To invoke a named skill:

1. Use the host skill-invocation mechanism when available (for example a `Skill` tool or `/skill-name`).
2. Otherwise find the skill by `name` in the host's available-skills list and read its full `SKILL.md` with the host file-read tool, then follow it.
3. Project Aether workflow skills are authored under `.skills/aether-workflow/<name>/SKILL.md`. Host-specific mirrors under `.codex/skills/<name>/SKILL.md` and `.cursor/skills/<name>/SKILL.md` are generated; do not edit mirrors directly.
4. Installed Superpowers skills are referenced by name only. Resolve them from the host skill list or the Superpowers plugin install path.
5. Announce each loaded skill by name before applying it.
6. If a required skill cannot be loaded, pause and report the missing skill name. Do not silently skip it.

## Tooling Contract

- Load and follow `openspec-apply-change` to inspect change status, requirements, and validation state before review.
- Load and follow `requesting-code-review` as the review process driver.
- Write `.superpowers/reviews/<change>.md` using `assets/compliance-review-template.md` and `references/anticorruption-checklist.md`.
- Direct edits to the review file are allowed only after the required skills have been loaded and followed.
- If a required skill cannot be loaded, pause and report the missing skill before completing the review.

## Version And Code Management Hooks

- Version hook: review all changes to package metadata, lockfiles, exports, Manifest versions, public contracts, SDK docs, compatibility docs, and OpenSpec main specs.
- Branch hook: verify the current branch matches the active OpenSpec change or has a recorded rationale.
- Code-management hook: map every changed file to a task and flag unrelated files.
- Commit-readiness hook: record recommended commit grouping and whether branch/PR metadata must mention OpenSpec, Superpowers tasks, validation, and deviations.

## Actions

1. Load and follow `openspec-apply-change` to inspect status and requirements.
2. Load and follow `requesting-code-review`.
3. Read `references/anticorruption-checklist.md`.
4. Create or update `.superpowers/reviews/<change>.md` using `assets/compliance-review-template.md`.
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
- validation is missing or failed without recorded deviation;
- `openspec-apply-change` or `requesting-code-review` cannot be loaded;
- versioned contract change lacks explicit spec/docs coverage;
- branch scope does not match the active change and no rationale is recorded;
- any changed file cannot be mapped to a task.

## Output

Report review path, branch, skills loaded (`openspec-apply-change`, `requesting-code-review`), pass/fail status, version review, code-management review, blockers, required updates, deviations, and recommended next workflow skill.
