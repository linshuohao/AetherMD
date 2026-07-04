---
name: aether-workflow-create-plan
description: Generate an AetherMD implementation plan from an approved OpenSpec change. Use after proposal, design, delta specs, and high-level tasks exist and before creating executable tasks.
---

# Aether Workflow: Create Plan

Use this skill as Step 3 of the AetherMD AI-native engineering workflow.

These instructions are host-agnostic. Any coding agent may execute them.

## Goal

Convert an OpenSpec change into an implementation plan without redefining the requirements.

## Inputs

- `openspec/changes/<change>/proposal.md`
- `openspec/changes/<change>/design.md`
- `openspec/changes/<change>/specs/`
- `openspec/changes/<change>/tasks.md`
- Referenced Docs and ADRs

## Required Skills

| Role | Skill name | Kind |
| --- | --- | --- |
| OpenSpec status/context | `openspec-apply-change` | Project |
| Plan process | `writing-plans` | Superpowers |

## Skill Invocation

To invoke a named skill:

1. Use the host skill-invocation mechanism when available (for example a `Skill` tool or `/skill-name`).
2. Otherwise find the skill by `name` in the host's available-skills list and read its full `SKILL.md` with the host file-read tool, then follow it.
3. Project skills are mirrored under `.cursor/skills/<name>/SKILL.md` and `.codex/skills/<name>/SKILL.md`. Use either path; content is identical.
4. Installed Superpowers skills are referenced by name only. Resolve them from the host skill list or the Superpowers plugin install path.
5. Announce each loaded skill by name before applying it.
6. If a required skill cannot be loaded, pause and report the missing skill name. Do not silently skip it.

## Tooling Contract

- Load and follow `openspec-apply-change` for change status and requirement context before planning.
- Load and follow `writing-plans` as the planning process driver.
- Write the plan to `.superpowers/plans/<change>.md` (AetherMD path override of any Superpowers default plan location).
- Use `assets/implementation-plan-template.md` for AetherMD section scaffold after `writing-plans` process rules are applied.
- Direct edits to the plan file are allowed only after `writing-plans` has been loaded and followed.
- Do not let plan text redefine OpenSpec requirements.
- If a required skill cannot be loaded, pause and report the missing skill; do not hand-write a plan as a substitute.

## Version And Code Management Hooks

- Version hook: include a plan section or bullet that states whether the change affects package versions, `SUPPORTED_MANIFEST_VERSIONS`, `manifestVersion`, public exports, lockfiles, or compatibility docs.
- Code-management hook: run `git status --short` before planning and keep the plan scoped to the active OpenSpec change.
- Branch/commit hook: identify the expected commit type and scope, and whether one task should map to one commit or the whole change should be squashed later.

## Actions

1. Load and follow `openspec-apply-change` to inspect artifact completion and context.
2. Load and follow `writing-plans`.
3. If creating a plan from scratch or repairing a malformed plan, use `assets/implementation-plan-template.md` as the section scaffold.
4. Read only the referenced docs needed to plan implementation.
5. Read the OpenSpec change artifacts.
6. Write `.superpowers/plans/<change>.md` with implementation phases, dependencies, risk areas, validation strategy, and review focus.
7. Identify tasks that may affect public contracts, architecture boundaries, ADRs, or test strategy.
8. Keep the plan tied to existing OpenSpec requirements.

## Plan Sections

Use these sections:

- Change
- Source Artifacts
- Implementation Phases
- Dependency Order
- Boundary Risks
- Validation Matrix
- Task Breakdown
- Review Focus
- Open Questions

## Bundled Resources

- `assets/implementation-plan-template.md`: implementation plan scaffold.

## Pause If

- OpenSpec artifacts are incomplete;
- requirements conflict with Docs or accepted ADRs;
- the plan would require files or packages outside the declared scope;
- validation cannot be defined;
- `openspec-apply-change` or `writing-plans` cannot be loaded;
- version impact is omitted from the plan;
- code-management scope cannot be isolated from unrelated work.

## Output

Report the plan path, skills loaded (`openspec-apply-change`, `writing-plans`), version impact, code-management status, phases, task breakdown summary, risks, and recommended next workflow skill.
