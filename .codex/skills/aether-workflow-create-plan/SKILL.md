---
name: aether-workflow-create-plan
description: Generate an AetherMD Superpowers implementation plan from an approved OpenSpec change. Use after proposal, design, delta specs, and high-level tasks exist and before creating executable tasks.
---

# Aether Workflow: Create Plan

Use this skill as Step 3 of the AetherMD AI-native engineering workflow.

## Goal

Convert an OpenSpec change into an implementation plan without redefining the requirements.

## Inputs

- `openspec/changes/<change>/proposal.md`
- `openspec/changes/<change>/design.md`
- `openspec/changes/<change>/specs/`
- `openspec/changes/<change>/tasks.md`
- Referenced Docs and ADRs

## Tooling Contract

- Use the installed OpenSpec skill/command layer to read change status and artifact instructions before planning.
- Use the global Superpowers command/skill layer as the driver for plan creation.
- AetherMD-specific planning rules should constrain the Superpowers output; they should not replace the underlying Superpowers planning step.
- Direct edits to `.superpowers/plans/<change>.md` are allowed only as the artifact output selected or created by the global Superpowers command/skill.
- If the global Superpowers command/skill layer is not callable in the current host, pause and report the tool visibility problem; do not use `.superpowers/` files as a substitute.
- Do not let Superpowers plan text redefine OpenSpec requirements.

## Version And Code Management Hooks

- Version hook: include a plan section or bullet that states whether the change affects package versions, `SUPPORTED_MANIFEST_VERSIONS`, `manifestVersion`, public exports, lockfiles, or compatibility docs.
- Code-management hook: run `git status --short` before planning and keep the plan scoped to the active OpenSpec change.
- Branch/commit hook: identify the expected commit type and scope, and whether one task should map to one commit or the whole change should be squashed later.

## Actions

1. Invoke the installed OpenSpec skill/command to inspect artifact completion and context.
2. Invoke the global Superpowers command/skill to create or continue the implementation plan.
3. If creating a plan from scratch or repairing a malformed plan, use `assets/implementation-plan-template.md` as the section scaffold.
4. Read only the referenced docs needed to plan implementation.
5. Read the OpenSpec change artifacts and generated/selected plan artifact.
6. Define implementation phases, dependencies, risk areas, validation strategy, and review focus.
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
- validation cannot be defined.
- OpenSpec skill/command status cannot be checked;
- global Superpowers command/skill layer is unavailable.
- version impact is omitted from the plan;
- code-management scope cannot be isolated from unrelated work.

## Output

Report the plan path, OpenSpec skill/command path used, Superpowers command/skill path used, version impact, code-management status, phases, task breakdown summary, risks, and recommended next workflow skill.
