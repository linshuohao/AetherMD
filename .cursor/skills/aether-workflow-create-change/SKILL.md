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

## Tooling Contract

- Delegate OpenSpec mechanics to the installed OpenSpec skill or command layer first.
- For a new change, invoke `openspec-propose` or the equivalent `/opsx:propose` command path, then apply AetherMD-specific source-doc, language, and boundary rules.
- If continuing or repairing an existing change, use the installed OpenSpec skill/command instructions for status, artifact order, instructions, and validation instead of hand-rolling the lifecycle.
- Direct file edits under `openspec/changes/<change>/` are allowed only after the OpenSpec skill/command has established the artifact path and required shape.
- If the OpenSpec skill/command layer is not callable in the current host, pause and report the tool visibility problem; do not create artifacts by hand.

## Version And Code Management Hooks

- Version hook: identify whether the proposed change may affect package SemVer, `manifestVersion`, public SDK contracts, package exports, lockfiles, or compatibility docs. Record the result in `proposal.md` or `design.md`.
- Code-management hook: run `git status --short` before creating artifacts and note any unrelated dirty files. Do not include unrelated work in the change scope.
- Traceability hook: record the expected branch/commit scope and Conventional Commit type implied by `docs/community/git-workflow.md`.

## Actions

1. Choose a kebab-case change name, such as `add-core-bootstrap` or `clarify-adapter-rollback-semantics`.
2. Invoke the installed OpenSpec skill/command to create or continue the change.
3. Use the OpenSpec skill/command output to determine artifact paths, required artifacts, and artifact instructions.
4. Check or request OpenSpec validation through the same OpenSpec layer.
5. Apply AetherMD-specific constraints on top of the generated/instructed artifacts.
6. Produce:
   - `proposal.md`
   - `design.md`
   - `specs/<capability>/spec.md` delta specs
   - `tasks.md`
7. Reference docs by path instead of copying large sections.
8. Keep non-goals explicit.
9. Add acceptance criteria that can be reviewed or tested.
10. Record which OpenSpec skill/command path was used and the validation result.

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
- OpenSpec skill/command layer is unavailable.
- version impact cannot be classified;
- current git status contains unrelated changes that would be mixed into the change.

## Output

Report the change name, artifact paths, OpenSpec skill/command path used, version impact, code-management status, validation status, source docs used, open questions, and recommended next workflow skill.
