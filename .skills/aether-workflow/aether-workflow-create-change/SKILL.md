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
3. Project Aether workflow skills are authored under `.skills/aether-workflow/<name>/SKILL.md`. Host-specific mirrors under `.codex/skills/<name>/SKILL.md` and `.cursor/skills/<name>/SKILL.md` are generated; do not edit mirrors directly.
4. Installed Superpowers skills are referenced by name only. Resolve them from the host skill list or the Superpowers plugin install path.
5. Announce each loaded skill by name before applying it.
6. If a required skill cannot be loaded, pause and report the missing skill name. Do not silently skip it.

## Tooling Contract

- Before writing OpenSpec artifacts, prepare a scoped branch according to `docs/community/git-workflow.md`.
- Load and follow the required OpenSpec skill before writing under `openspec/changes/<change>/`.
- Apply AetherMD source-doc, language, and boundary rules on top of the OpenSpec skill output.
- Direct file edits under `openspec/changes/<change>/` are allowed only after the required OpenSpec skill has established the artifact path and required shape.
- If a required skill cannot be loaded, pause and report the missing skill; do not create artifacts by hand.

## Version And Code Management Hooks

- Version hook: identify whether the proposed change may affect package SemVer, `manifestVersion`, public SDK contracts, package exports, lockfiles, or compatibility docs. Record the result in `proposal.md` or `design.md`.
- Branch hook: run `git branch --show-current` and `git status --short` before creating artifacts. If the current branch is `main`, create or request a scoped branch such as `<type>/<change-name>` before writing artifacts.
- Code-management hook: note any unrelated dirty files. Do not include unrelated work in the change scope.
- Traceability hook: record the active branch, expected commit scope, and Conventional Commit type implied by `docs/community/git-workflow.md`.

## Branch Preparation

- Use `docs/` for workflow, governance, ADR, and documentation-only changes.
- Use `spec/` when the change is primarily OpenSpec artifact work.
- Use `feature/`, `fix/`, `test/`, `chore/`, `ci/`, `build/`, or `refactor/` when implementation scope clearly matches those categories.
- Prefer `<type>/<change-name>` so the branch topic matches the OpenSpec change.
- If the working tree has unrelated dirty files, or a matching branch cannot be chosen safely, pause before writing artifacts.
- Record the branch in `proposal.md`, `design.md`, or the step output.

## Actions

1. Choose a kebab-case change name, such as `add-core-bootstrap` or `clarify-adapter-rollback-semantics`.
2. Prepare or verify a scoped branch for the change.
3. Load and follow `openspec-propose` for a new change, or `openspec-apply-change` to continue or check an existing change.
4. Use that skill's output to determine artifact paths, required artifacts, and artifact instructions.
5. Check or request OpenSpec validation through the same OpenSpec skill or `openspec` CLI.
6. Apply AetherMD-specific constraints on top of the generated/instructed artifacts.
7. Produce:
   - `proposal.md`
   - `design.md`
   - `specs/<capability>/spec.md` delta specs
   - `tasks.md`
8. Reference docs by path instead of copying large sections.
9. Keep non-goals explicit.
10. Add acceptance criteria that can be reviewed or tested.
11. Record the branch, OpenSpec skills loaded, and validation result.

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
- branch scope cannot be prepared or verified safely;
- current git status contains unrelated changes that would be mixed into the change.

## Output

Report the change name, branch, artifact paths, OpenSpec skills loaded, version impact, code-management status, validation status, source docs used, open questions, and recommended next workflow skill.
