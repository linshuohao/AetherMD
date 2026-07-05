---
name: aether-workflow-create-spec-change
description: Create a lightweight AetherMD Spec Change with change-brief, delta spec, and a single Superpowers task. Use when Discover classifies a request as Spec Change.
---

# Aether Workflow: Create Spec Change

Use this skill as the Spec Change variant of Step 2 in the AetherMD AI-native engineering workflow.

These instructions are host-agnostic. Any coding agent may execute them.

## Goal

Create a lightweight OpenSpec change with `change-brief.md`, delta specs, and exactly one Superpowers task without plan files or Full Change proposal/design/tasks artifacts.

## Inputs

- Discover output from `aether-workflow-discover-context`
- Source docs and ADRs
- Change name or user intent

## Required Skills

| Role | Skill name | When |
| --- | --- | --- |
| OpenSpec create | `openspec-propose` | Creating a new change |
| OpenSpec continue/status | `openspec-apply-change` | Continuing or checking an existing change |
| Task drafting | `writing-plans` | Drafting the single task content only |

Do not invoke `aether-workflow-create-plan`.

## Skill Invocation

To invoke a named skill:

1. Use the host skill-invocation mechanism when available (for example a `Skill` tool or `/skill-name`).
2. Otherwise find the skill by `name` in the host's available-skills list and read its full `SKILL.md` with the host file-read tool, then follow it.
3. Project Aether workflow skills are authored under `.skills/aether-workflow/<name>/SKILL.md`. Host-specific mirrors under `.codex/skills/<name>/SKILL.md` and `.cursor/skills/<name>/SKILL.md` are generated; do not edit mirrors directly.
4. Installed Superpowers skills are referenced by name only. Resolve them from the host skill list or the Superpowers plugin install path.
5. Announce each loaded skill by name before applying it.
6. If a required skill cannot be loaded, pause and report the missing skill name. Do not silently skip it.

## Tooling Contract

- Read `references/spec-change-entry-criteria.md` before creating artifacts.
- Prepare a scoped branch according to `docs/community/git-workflow.md`.
- Load and follow the required OpenSpec skill before writing under `openspec/changes/<change>/`.
- Write `change-brief.md` using `assets/change-brief-template.md`.
- Do not create `proposal.md`, `design.md`, or `tasks.md` for Spec Change.
- Create exactly one task at `.superpowers/tasks/<change>/01-<task>.md`.
- Do not create `.superpowers/plans/<change>.md`.

## Version And Code Management Hooks

- Version hook: record version impact in `change-brief.md`.
- Branch hook: ensure current branch is not `main` before writing artifacts.
- Code-management hook: note unrelated dirty files and record branch in `change-brief.md`.
- Traceability hook: task must reference the delta spec requirement and source docs.

## Actions

1. Verify Discover classified the request as Spec Change; otherwise stop and use the recommended path skill.
2. Choose a kebab-case change name.
3. Prepare or verify a scoped branch matching the change name.
4. Load and follow `openspec-propose` or `openspec-apply-change`.
5. Write `change-brief.md` from `assets/change-brief-template.md`.
6. Write `specs/<capability>/spec.md` delta spec for the affected capability.
7. Create exactly one Superpowers task file with:
   - `Depends On:` empty
   - `Parallel Group:` empty
   - `Barrier: false`
8. Validate OpenSpec change structure when tooling is available.
9. Recommend next skill: `aether-workflow-execute-spec-change`.

## Single Task Rules

- One task only. If more than one task is needed, pause and escalate to Full Change.
- Task allowed files must be precise.
- Task must declare validation and TDD entry point or deviation.

## Pause If

- Discover path is not Spec Change;
- multiple tasks or parallel scheduling are required;
- workflow semantics or protected boundaries are involved;
- a required OpenSpec or Superpowers skill cannot be loaded;
- branch scope cannot be prepared safely.

## Output

Report change name, branch, artifact paths, OpenSpec skills loaded, version impact, single task path, validation status, and recommended next workflow skill.
