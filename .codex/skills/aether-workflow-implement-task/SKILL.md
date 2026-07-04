---
name: aether-workflow-implement-task
description: Implement exactly one AetherMD Superpowers task with Codex guardrails. Use when a single task file has been selected and Codex should make scoped code or documentation changes.
---

# Aether Workflow: Implement Task

Use this skill as Step 5 of the AetherMD AI-native engineering workflow.

## Goal

Implement one selected Superpowers task while preserving traceability and architecture boundaries.

## Inputs

- One `.superpowers/tasks/<change>/<NN>-<task>.md`
- Current OpenSpec change artifacts
- Task-referenced docs
- Relevant local files

## Tooling Contract

- Use the installed OpenSpec skill/command layer to confirm change status and relevant requirements before implementation.
- Use the global Superpowers command/skill layer to select, start, and update task execution state.
- Direct edits to the task file are allowed as the execution record, but not as a replacement for the underlying Superpowers step when that step is callable.
- If the global Superpowers command/skill layer is not callable in the current host, pause and report the tool visibility problem; do not use the task file as a substitute.
- Do not implement a task whose OpenSpec status cannot be checked through the OpenSpec layer.

## Version And Code Management Hooks

- Pre-edit code hook: run `git status --short` and inspect the task's allowed/forbidden files before editing.
- Version hook: if the task changes package metadata, lockfiles, exports, manifest support, public types, SDK docs, compatibility docs, or OpenSpec main specs, record the version/contract impact in the task `Run Log` or `Deviation`.
- Post-edit code hook: run `git diff --name-status` or equivalent scoped diff review and confirm every changed file maps to the current task.
- Staging hook: do not stage, commit, or push unless explicitly requested; if requested, stage only files belonging to the current task and follow `docs/community/git-workflow.md`.

## Actions

1. Invoke the installed OpenSpec skill/command to confirm change status and requirement context.
2. Start or update the task through the global Superpowers command/skill.
3. Read the task file first.
4. Read the associated OpenSpec artifacts.
5. Read only task-referenced docs and directly relevant local files.
6. Read `references/single-task-guardrails.md` before editing.
7. Confirm allowed files and forbidden files.
8. Identify the TDD entry point before implementation:
   - a failing automated test;
   - a failing contract/package-boundary check;
   - or a design-stage assertion for documentation-only tasks.
9. Prefer red-green-refactor:
   - create or confirm the red test/check first when practical;
   - implement the smallest change that turns it green;
   - then clean structure, names, and comments without expanding scope.
10. Make the smallest necessary edits.
11. Do not cross task scope.
12. Run the task validation if possible.
13. Add intuitive verification when useful, such as a demo script, CLI trace, screenshot, or manual smoke path, but do not treat it as a replacement for automated validation.
14. Update task `Status`, `Run Log`, and `Deviation` through the global Superpowers command/skill.
15. If committing or preparing a PR, follow `docs/community/git-workflow.md`.

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
- a required source doc contradicts the task.
- OpenSpec skill/command status cannot be checked;
- global Superpowers command/skill layer is unavailable.
- git status shows unrelated changes that cannot be separated from this task;
- versioned contract impact appears but is not covered by OpenSpec or task `Version Impact`.

## Output

Report change name, task id, OpenSpec skill/command path used, Superpowers command/skill path used, files changed, version impact, code-management status, validation performed, deviations, and recommended next workflow skill.
