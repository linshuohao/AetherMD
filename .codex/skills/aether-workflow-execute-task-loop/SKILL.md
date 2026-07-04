---
name: aether-workflow-execute-task-loop
description: Execute and validate all tasks for one AetherMD change in order. Use after task files exist and before spec compliance review, when the change scope is small enough for an automated implement/validate loop.
---

# Aether Workflow: Execute Task Loop

Use this skill as Step 6.5 of the AetherMD AI-native engineering workflow.

These instructions are host-agnostic. Any coding agent may execute them.

## Goal

Run the implementation and validation loop for one OpenSpec change while preserving the single-task execution boundary.

This skill orchestrates `aether-workflow-implement-task` and `aether-workflow-validate-task`. It does not loosen their guardrails.

## Inputs

- `openspec/changes/<change>/proposal.md`
- `openspec/changes/<change>/design.md`
- `openspec/changes/<change>/specs/`
- `.superpowers/plans/<change>.md`
- `.superpowers/tasks/<change>/`
- Task-referenced docs

## Preconditions

- The OpenSpec change is intentionally small.
- The plan and task files have been created.
- Each task has explicit allowed files, forbidden files, validation, review checklist, rollback notes, status, run log, and deviation sections.
- The user or maintainer has accepted the plan and task split.

## Required Skills

| Role | Skill name | Kind |
| --- | --- | --- |
| OpenSpec status/context | `openspec-apply-change` | Project |
| Loop driver (preferred) | `subagent-driven-development` | Superpowers, when the host supports subagents |
| Loop driver (fallback) | `executing-plans` | Superpowers, when subagents are unavailable |
| Per-task implement | `aether-workflow-implement-task` | Project |
| Per-task validate | `aether-workflow-validate-task` | Project |

`aether-workflow-implement-task` already requires `test-driven-development` and `verification-before-completion`. Do not skip those by implementing tasks inline.

## Skill Invocation

To invoke a named skill:

1. Use the host skill-invocation mechanism when available (for example a `Skill` tool or `/skill-name`).
2. Otherwise find the skill by `name` in the host's available-skills list and read its full `SKILL.md` with the host file-read tool, then follow it.
3. Project skills are mirrored under `.cursor/skills/<name>/SKILL.md` and `.codex/skills/<name>/SKILL.md`. Use either path; content is identical.
4. Installed Superpowers skills are referenced by name only. Resolve them from the host skill list or the Superpowers plugin install path.
5. Announce each loaded skill by name before applying it.
6. If a required skill cannot be loaded, pause and report the missing skill name. Do not silently skip it.

## Tooling Contract

- Load and follow `openspec-apply-change` before the loop and whenever task execution reveals requirement drift.
- Load and follow `subagent-driven-development` when subagents are available; otherwise load and follow `executing-plans`.
- Constrain the Superpowers loop driver to one AetherMD task file at a time by loading `aether-workflow-implement-task` and `aether-workflow-validate-task` for each task.
- Update task `Status`, `Run Log`, `Deviation`, and `.superpowers/runs/<change>/validation.md` as AetherMD execution records after the per-task skills complete.
- If a required skill cannot be loaded, pause and report the missing skill; do not use `.superpowers/` files as a substitute for the process skills.

## Version And Code Management Hooks

- Pre-loop code hook: run `git status --short` and identify unrelated dirty files before starting the loop.
- Per-task code hook: after each task, check changed files against that task's allowed files and rollback notes.
- Per-task version hook: if a task touches versioned contracts, run or record the required version/contract validation before moving on.
- Post-loop code hook: produce a changed-file summary grouped by task, and do not stage or commit unless explicitly requested.

## Actions

1. Load and follow `openspec-apply-change` to confirm change status.
2. Load and follow `subagent-driven-development` or, if subagents are unavailable, `executing-plans`.
3. Read `references/task-loop-protocol.md`.
4. Read the plan and list task files in filename order.
5. For each task:
   - Load and follow `aether-workflow-implement-task` for that task only.
   - Load and follow `aether-workflow-validate-task` for that task only.
   - Confirm task `Status`, `Run Log`, `Deviation`, and validation record are updated.
6. Continue to the next task only after the current task is complete or its accepted deviation is recorded.
7. Stop after all tasks complete. Do not update docs/specs, archive, or commit unless explicitly asked.

## Bundled Resources

- `references/task-loop-protocol.md`: task-by-task loop shape, stop conditions, and end-state reporting.

## Guardrails

- Do not process multiple tasks as one combined implementation.
- Do not batch red-green-refactor cycles across task files; each task gets its own failing check, implementation, validation, and log update.
- Do not use this loop for broad changes that cross architecture, SDK, Adapter, Shell, and UI layers at once.
- Do not implement from the full `docs/` tree.
- Do not modify public contracts unless the task and OpenSpec spec explicitly require it.
- Do not weaken tests.
- Do not use intuitive verification as a substitute for automated or design-stage validation.
- Do not add silent fallback behavior.
- Do not introduce unrecorded architecture decisions.
- Do not bypass Core, Plugin Contract, Adapter, or Shell boundaries.

## TDD Loop Expectations

For each task, preserve Superpowers process skills as the driver:

- Red: create or identify the failing test, contract check, package-boundary check, or design-stage assertion.
- Green: implement the smallest scoped change that satisfies that task only.
- Refactor: improve names, structure, test builders, and boundary comments after validation is green.
- Record: write commands, results, deviations, and any intuitive verification into the validation record and task log before moving on.

Use intuitive verification to make behavior reviewable by humans when it helps, for example demo scripts, CLI traces, screenshots, or smoke flows. Keep it separate from required tests.

During refactor, prefer:

- comments that explain boundaries or deferred behavior;
- test builders/helpers to reduce repetitive setup;
- small local structure improvements over broad directory reshuffles.

## Pause If

- a task is ambiguous;
- a task needs a forbidden file;
- a task requires expanding the OpenSpec scope;
- a task changes public contracts without explicit spec coverage;
- implementation requires a new architecture decision or ADR;
- validation fails outside the task scope;
- validation has no clear command or design-stage check;
- no TDD entry point can be found and no deviation has been accepted;
- tests were deleted, skipped, or weakened;
- a required source doc contradicts the task;
- a required skill cannot be loaded;
- unrelated git changes cannot be separated from task changes;
- a task with versioned contract impact lacks validation.

## Output

Report:

- change name;
- skills loaded;
- task files completed;
- files changed;
- version-impact checks;
- code-management checks;
- validation commands and pass/fail status;
- validation record path;
- deviations;
- paused task and blocker, if any;
- whether the change is ready for `aether-workflow-review-compliance`.
