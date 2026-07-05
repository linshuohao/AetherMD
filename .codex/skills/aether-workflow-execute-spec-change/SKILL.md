---
name: aether-workflow-execute-spec-change
description: Execute a Spec Change through single-task implementation, validation, lightweight review, docs/spec sync, and archive. Use after aether-workflow-create-spec-change completes.
---

<!-- Generated from .skills/aether-workflow/aether-workflow-execute-spec-change/SKILL.md. Do not edit directly. Run pnpm skills:sync. -->


# Aether Workflow: Execute Spec Change

Use this skill to execute a Spec Change after `aether-workflow-create-spec-change` creates the lightweight OpenSpec artifacts and single task.

These instructions are host-agnostic. Any coding agent may execute them.

## Goal

Complete a Spec Change with exactly one Superpowers task, validation, lightweight compliance review, optional docs/spec sync, and archive without plan files or task loops.

## Inputs

- OpenSpec change with `change-brief.md` and delta spec
- Single `.superpowers/tasks/<change>/01-*.md`
- Relevant docs and local files

## Required Skills

| Role | Skill name | When |
| --- | --- | --- |
| OpenSpec status | `openspec-apply-change` | Before and during execution |
| Implement | `aether-workflow-implement-task` | Single task implementation |
| Validate | `aether-workflow-validate-task` | Task validation record |
| Review | `aether-workflow-review-compliance` | Spec Change mode review |
| Docs/spec sync | `aether-workflow-update-docs-spec` | When main spec or docs must sync |
| Archive | `aether-workflow-archive-change` | Spec Change mode archive |

Do not invoke `aether-workflow-create-plan` or `aether-workflow-execute-task-loop`.

## Skill Invocation

To invoke a named skill:

1. Use the host skill-invocation mechanism when available (for example a `Skill` tool or `/skill-name`).
2. Otherwise find the skill by `name` in the host's available-skills list and read its full `SKILL.md` with the host file-read tool, then follow it.
3. Project Aether workflow skills are authored under `.skills/aether-workflow/<name>/SKILL.md`. Host-specific mirrors under `.codex/skills/<name>/SKILL.md` and `.cursor/skills/<name>/SKILL.md` are generated; do not edit mirrors directly.
4. Installed Superpowers skills are referenced by name only. Resolve them from the host skill list or the Superpowers plugin install path.
5. Announce each loaded skill by name before applying it.
6. If a required skill cannot be loaded, pause and report the missing skill name. Do not silently skip it.

## Tooling Contract

- Read `references/spec-change-guardrails.md` before execution.
- Execute exactly one task file in the implementer session.
- Record review using Spec Change mode in `aether-workflow-review-compliance`.
- Record archive using Spec Change mode in `aether-workflow-archive-change`.

## Actions

1. Load and follow `openspec-apply-change` to confirm change status.
2. Verify exactly one task file exists; if more are needed, pause and escalate to Full Change.
3. Load and follow `aether-workflow-implement-task` for that task.
4. Load and follow `aether-workflow-validate-task`.
5. Load and follow `aether-workflow-review-compliance` with **Path: Spec Change**.
6. If delta requires main spec or docs sync, load and follow `aether-workflow-update-docs-spec`.
7. Load and follow `aether-workflow-archive-change` with **Path: Spec Change**.
8. Report PR readiness with change name and spec requirement references.

## Pause If

- more than one task is required;
- plan or task loop skills would be needed;
- review finds unresolved blockers;
- protected boundaries are crossed;
- a required skill cannot be loaded.

## Output

Report change name, branch, task completed, validation status, review status, archive status, version impact, and recommended follow-ups.
