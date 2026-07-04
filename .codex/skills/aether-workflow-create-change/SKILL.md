---
name: aether-workflow-create-change
description: Create or update an AetherMD OpenSpec change from discovered source docs. Use when a request must enter the AetherMD workflow through proposal, design, delta specs, and high-level tasks before planning or implementation.
---

# Aether Workflow: Create Change

Use this skill as Step 2 of the AetherMD AI-native engineering workflow.

These instructions are host-agnostic. Any coding agent may execute them.

## Goal

Create an OpenSpec change that references Docs as the long-term source of truth and extracts only the implementation contract needed for this change.

## Inputs

- Request classification from `aether-workflow-discover-context`
- Source docs and ADRs
- Change name or user intent

## Required Skills

| Role | Skill name | When |
| --- | --- | --- |
| OpenSpec create | `openspec-propose` | Creating a new change |
| OpenSpec continue/status | `openspec-apply-change` | Continuing, repairing, or checking an existing change |

Superpowers skills are not required for this step.

## Skill Invocation

To invoke a named skill:

1. Use the host skill-invocation mechanism when available (for example a `Skill` tool or `/skill-name`).
2. Otherwise find the skill by `name` in the host's available-skills list and read its full `SKILL.md` with the host file-read tool, then follow it.
3. Project skills are mirrored under `.cursor/skills/<name>/SKILL.md` and `.codex/skills/<name>/SKILL.md`. Use either path; content is identical.
4. Installed Superpowers skills are referenced by name only. Resolve them from the host skill list or the Superpowers plugin install path.
5. Announce each loaded skill by name before applying it.
6. If a required skill cannot be loaded, pause and report the missing skill name. Do not silently skip it.

## Tooling Contract

- Load and follow the required OpenSpec skill before writing under `openspec/changes/<change>/`.
- Apply AetherMD source-doc, language, and boundary rules on top of the OpenSpec skill output.
- Direct file edits under `openspec/changes/<change>/` are allowed only after the required OpenSpec skill has established the artifact path and required shape.
- If a required skill cannot be loaded, pause and report the missing skill; do not create artifacts by hand.

## Version And Code Management Hooks

- Version hook: identify whether the proposed change may affect package SemVer, `manifestVersion`, public SDK contracts, package exports, lockfiles, or compatibility docs. Record the result in `proposal.md` or `design.md`.
- Code-management hook: run `git status --short` before creating artifacts and note any unrelated dirty files. Do not include unrelated work in the change scope.
- Traceability hook: record the expected branch/commit scope and Conventional Commit type implied by `docs/community/git-workflow.md`.

## Actions

1. Choose a kebab-case change name, such as `add-core-bootstrap` or `clarify-adapter-rollback-semantics`.
2. Load and follow `openspec-propose` for a new change, or `openspec-apply-change` to continue or check an existing change.
3. Use that skill's output to determine artifact paths, required artifacts, and artifact instructions.
4. Check or request OpenSpec validation through the same OpenSpec skill or `openspec` CLI.
5. Apply AetherMD-specific constraints on top of the generated/instructed artifacts.
6. Produce:
   - `proposal.md`
   - `design.md`
   - `specs/<capability>/spec.md` delta specs
   - `tasks.md`
7. Reference docs by path instead of copying large sections.
8. Keep non-goals explicit.
9. Add acceptance criteria that can be reviewed or tested.
10. Record which OpenSpec skills were loaded and the validation result.

## Artifact Rules

`proposal.md` should explain why, what changes, non-goals, source docs, affected contracts, risks, and acceptance criteria.

`design.md` should explain the implementation contract, architecture boundary checks, public contract impact, test strategy, and open questions.

Delta specs should describe added, modified, removed, or renamed requirements for one capability.

`tasks.md` should stay high-level. Detailed execution belongs in Superpowers tasks.

## Pause If

- public contract impact is unclear;
- no authoritative docs exist for the proposed behavior;
- the change would reverse an accepted ADR without an ADR update;
- the requested scope is too broad for one change;
- a required OpenSpec skill cannot be loaded;
- version impact cannot be classified;
- current git status contains unrelated changes that would be mixed into the change.

## Output

Report the change name, artifact paths, OpenSpec skills loaded, version impact, code-management status, validation status, source docs used, open questions, and recommended next workflow skill.
