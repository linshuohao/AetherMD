---
name: aether-workflow-create-change
description: Create or update an AetherMD OpenSpec change from discovered source docs. Use when a request must enter the AetherMD workflow through proposal, design, delta specs, and high-level tasks before planning or implementation.
---

# Aether Workflow: Create Change

Use this skill as Step 2 of the AetherMD AI-native engineering workflow.

## Goal

Create an OpenSpec change that references Docs as the long-term source of truth and extracts only the implementation contract needed for this change.

## Inputs

- Request classification from `aether-workflow-discover-context`
- Source docs and ADRs
- Change name or user intent

## Actions

1. Choose a kebab-case change name, such as `add-core-bootstrap` or `clarify-adapter-rollback-semantics`.
2. Check current changes with `openspec list --json`.
3. Create or continue `openspec/changes/<change>/`.
4. Produce:
   - `proposal.md`
   - `design.md`
   - `specs/<capability>/spec.md` delta specs
   - `tasks.md`
5. Reference docs by path instead of copying large sections.
6. Keep non-goals explicit.
7. Add acceptance criteria that can be reviewed or tested.

## Artifact Rules

`proposal.md` should explain why, what changes, non-goals, source docs, affected contracts, risks, and acceptance criteria.

`design.md` should explain the implementation contract, architecture boundary checks, public contract impact, test strategy, and open questions.

Delta specs should describe added, modified, removed, or renamed requirements for one capability.

`tasks.md` should stay high-level. Detailed execution belongs in Superpowers tasks.

## Pause If

- public contract impact is unclear;
- no authoritative docs exist for the proposed behavior;
- the change would reverse an accepted ADR without an ADR update;
- the requested scope is too broad for one change.

## Output

Report the change name, artifact paths, source docs used, open questions, and recommended next workflow skill.
