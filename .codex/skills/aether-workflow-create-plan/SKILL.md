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

## Actions

1. Read the OpenSpec change artifacts.
2. Read only the referenced docs needed to plan implementation.
3. Create or update `.superpowers/plans/<change>.md`.
4. Define implementation phases, dependencies, risk areas, validation strategy, and review focus.
5. Identify tasks that may affect public contracts, architecture boundaries, ADRs, or test strategy.
6. Keep the plan tied to existing OpenSpec requirements.

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

## Pause If

- OpenSpec artifacts are incomplete;
- requirements conflict with Docs or accepted ADRs;
- the plan would require files or packages outside the declared scope;
- validation cannot be defined.

## Output

Report the plan path, phases, task breakdown summary, risks, and recommended next workflow skill.
