---
name: aether-workflow-execute-task-loop
description: Execute and validate all tasks for one AetherMD change in order. Use after task files exist and before spec compliance review, when the change scope is small enough for an automated implement/validate loop.
---

# Aether Workflow: Execute Task Loop

Use this skill as Step 6.5 of the AetherMD AI-native engineering workflow.

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

## Tooling Contract

- Use the installed OpenSpec skill/command layer to inspect change status before the loop and whenever task execution reveals requirement drift.
- Use the global Superpowers command/skill layer as the loop driver for selecting, starting, validating, and completing tasks.
- This Aether skill adds project guardrails to the Superpowers loop; it must not replace the lower-level global Superpowers execution mechanism.
- If the global Superpowers command/skill layer is unavailable in the current host, pause and report the tool visibility problem; do not use `.superpowers/` files as a substitute.

## Version And Code Management Hooks

- Pre-loop code hook: run `git status --short` and identify unrelated dirty files before starting the loop.
- Per-task code hook: after each task, check changed files against that task's allowed files and rollback notes.
- Per-task version hook: if a task touches versioned contracts, run or record the required version/contract validation before moving on.
- Post-loop code hook: produce a changed-file summary grouped by task, and do not stage or commit unless explicitly requested.

## Actions

1. Invoke the installed OpenSpec skill/command to confirm change status.
2. Invoke the global Superpowers command/skill to load loop state.
3. Read `references/task-loop-protocol.md`.
4. Read the plan and list task files in filename order.
5. For each task:
   - Read the task file first.
   - Read the associated OpenSpec artifacts.
   - Read only task-referenced docs and directly relevant local files.
   - Confirm allowed files and forbidden files.
   - Identify the task's TDD entry point before editing.
   - Prefer red-green-refactor within the single-task boundary.
   - Implement only the selected task.
   - Run that task's validation.
   - Run or record intuitive verification when the task defines one.
   - Record validation commands, results, failures, and deviations through the global Superpowers command/skill.
   - Update the task `Status`, `Run Log`, and `Deviation` through the global Superpowers command/skill.
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

For each task, preserve Superpowers as the driver:

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
- a required source doc contradicts the task.
- OpenSpec skill/command status cannot be checked;
- global Superpowers command/skill layer is unavailable.
- unrelated git changes cannot be separated from task changes;
- a task with versioned contract impact lacks validation.

## Output

Report:

- change name;
- OpenSpec skill/command path used;
- Superpowers command/skill path used;
- task files completed;
- files changed;
- version-impact checks;
- code-management checks;
- validation commands and pass/fail status;
- validation record path;
- deviations;
- paused task and blocker, if any;
- whether the change is ready for `aether-workflow-review-compliance`.
