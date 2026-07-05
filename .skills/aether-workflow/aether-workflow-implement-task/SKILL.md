---
name: aether-workflow-implement-task
description: Implement exactly one AetherMD Superpowers task with project guardrails. Use when a single task file has been selected and scoped code or documentation changes are required.
---

# Aether Workflow: Implement Task

Use this skill as Step 5 of the AetherMD AI-native engineering workflow.

These instructions are host-agnostic. Any coding agent may execute them.

## Goal

Implement one selected Superpowers task while preserving traceability and architecture boundaries.

## Inputs

- One `.superpowers/tasks/<change>/<NN>-<task>.md`
- Current OpenSpec change artifacts
- Task-referenced docs
- Relevant local files

## Required Skills

| Role | Skill name | Kind |
| --- | --- | --- |
| OpenSpec status/context | `openspec-apply-change` | Project |
| Implementation process | `test-driven-development` | Superpowers |
| Pre-completion check | `verification-before-completion` | Superpowers |

Task `Status`, `Run Log`, and `Deviation` fields are AetherMD execution records. Update them after the required Superpowers process skills have been loaded and followed; there is no separate Superpowers state API for those fields.

## Skill Invocation

To invoke a named skill:

1. Use the host skill-invocation mechanism when available (for example a `Skill` tool or `/skill-name`).
2. Otherwise find the skill by `name` in the host's available-skills list and read its full `SKILL.md` with the host file-read tool, then follow it.
3. Project Aether workflow skills are authored under `.skills/aether-workflow/<name>/SKILL.md`. Host-specific mirrors under `.codex/skills/<name>/SKILL.md` and `.cursor/skills/<name>/SKILL.md` are generated; do not edit mirrors directly.
4. Installed Superpowers skills are referenced by name only. Resolve them from the host skill list or the Superpowers plugin install path.
5. Announce each loaded skill by name before applying it.
6. If a required skill cannot be loaded, pause and report the missing skill name. Do not silently skip it.

## Tooling Contract

- Load and follow `openspec-apply-change` to confirm change status and requirement context before implementation.
- Load and follow `test-driven-development` before editing implementation files.
- Load and follow `verification-before-completion` before claiming the task is done.
- Direct edits to the task file are the execution record for `Status`, `Run Log`, and `Deviation`.
- Do not implement a task whose OpenSpec status cannot be checked through `openspec-apply-change`.
- If a required skill cannot be loaded, pause and report the missing skill; do not implement as a substitute.

## Version And Code Management Hooks

- Pre-edit code hook: run `git status --short` and inspect the task's allowed/forbidden files before editing.
- Branch hook: record the current branch and confirm it matches the active OpenSpec change or has a recorded rationale before editing.
- Version hook: if the task changes package metadata, lockfiles, exports, manifest support, public types, SDK docs, compatibility docs, or OpenSpec main specs, record the version/contract impact in the task `Run Log` or `Deviation`.
- Post-edit code hook: run `git diff --name-status` or equivalent scoped diff review and confirm every changed file maps to the current task.
- Staging hook: do not stage, commit, or push unless explicitly requested; if requested, stage only files belonging to the current task and follow `docs/community/git-workflow.md`.

## Actions

1. Load and follow `openspec-apply-change` to confirm change status and requirement context.
2. Load and follow `test-driven-development`.
3. Read the task file first.
4. Update task `Status` to in progress and append the start entry to `Run Log`.
5. Read the associated OpenSpec artifacts.
6. Read only task-referenced docs and directly relevant local files.
7. Read `references/single-task-guardrails.md` before editing.
8. Confirm allowed files and forbidden files.
9. Identify the TDD entry point before implementation:
   - a failing automated test;
   - a failing contract/package-boundary check;
   - or a design-stage assertion for documentation-only tasks.
10. Prefer red-green-refactor:
    - create or confirm the red test/check first when practical;
    - implement the smallest change that turns it green;
    - then clean structure, names, and comments without expanding scope.
11. Make the smallest necessary edits.
12. Do not cross task scope.
13. Run the task validation if possible.
14. Add intuitive verification when useful, such as a demo script, CLI trace, screenshot, or manual smoke path, but do not treat it as a replacement for automated validation.
15. Load and follow `verification-before-completion` before marking the task complete.
16. Update task `Status`, `Run Log`, and `Deviation`.
17. If committing or preparing a PR, follow `docs/community/git-workflow.md`.

## Bundled Resources

- `references/single-task-guardrails.md`: pre-edit, scope, refactor, and post-edit checks.

## Code Quality Review

- Add comments only where they explain boundaries, non-obvious tradeoffs, or intentionally deferred behavior.
- Prefer tests and names over explanatory comments for straightforward behavior.
- Watch for a source directory becoming too flat as files accumulate; prefer small test helpers/builders before broad source reorganizations.
- Do not perform large directory reshuffles inside a behavior task unless the task explicitly allows structure cleanup.
- If a public API, lifecycle behavior, or idempotency choice is intentionally limited, document that choice in code or task `Deviation`.

## Guardrails

- Do not implement from the full `docs/` tree.
- Do not process multiple tasks at once.
- Do not modify public contracts unless the task and OpenSpec spec explicitly require it.
- Do not weaken tests.
- Do not skip the TDD entry point; if none exists, record the reason as a deviation.
- Do not add silent fallback behavior.
- Do not introduce unrecorded architecture decisions.
- Do not bypass Core, Plugin Contract, Adapter, or Shell boundaries.

## Pause If

- the task is ambiguous;
- implementation needs a forbidden file;
- implementation requires a new architecture decision;
- validation fails outside the task scope;
- no meaningful failing test/check/design assertion can be identified;
- a required source doc contradicts the task;
- `openspec-apply-change`, `test-driven-development`, or `verification-before-completion` cannot be loaded;
- branch scope does not match the active change and no rationale is recorded;
- git status shows unrelated changes that cannot be separated from this task;
- versioned contract impact appears but is not covered by OpenSpec or task `Version Impact`.

## Output

Report change name, branch, task id, skills loaded (`openspec-apply-change`, `test-driven-development`, `verification-before-completion`), files changed, version impact, code-management status, validation performed, deviations, and recommended next workflow skill.
