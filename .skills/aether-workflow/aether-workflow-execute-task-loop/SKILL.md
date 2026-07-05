---
name: aether-workflow-execute-task-loop
description: Execute and validate all tasks for one AetherMD change in order. Use after task files exist and before spec compliance review, when the change scope is small enough for an automated implement/validate loop.
---

# Aether Workflow: Execute Task Loop

Use this skill as Step 6.5 of the AetherMD AI-native engineering workflow.

These instructions are host-agnostic. Any coding agent may execute them.

## Goal

Run the implementation and validation loop for one OpenSpec change while preserving the single-task implementer boundary.

This skill orchestrates `aether-workflow-implement-task` and `aether-workflow-validate-task`. It does not loosen their guardrails: the coordinator may dispatch independent tasks in parallel only when each implementer agent session receives exactly one task.

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
| Loop driver (sequential subagent) | `subagent-driven-development` | Superpowers, when the host supports subagents |
| Loop driver (wave parallel) | `dispatching-parallel-agents` | Superpowers, when the host supports parallel subagent dispatch and task metadata allows waves |
| Loop driver (fallback) | `executing-plans` | Superpowers, when subagents are unavailable |
| Per-task implement | `aether-workflow-implement-task` | Project |
| Per-task validate | `aether-workflow-validate-task` | Project |

`aether-workflow-implement-task` already requires `test-driven-development` and `verification-before-completion`. Do not skip those by implementing tasks inline.

## Skill Invocation

To invoke a named skill:

1. Use the host skill-invocation mechanism when available (for example a `Skill` tool or `/skill-name`).
2. Otherwise find the skill by `name` in the host's available-skills list and read its full `SKILL.md` with the host file-read tool, then follow it.
3. Project Aether workflow skills are authored under `.skills/aether-workflow/<name>/SKILL.md`. Host-specific mirrors under `.codex/skills/<name>/SKILL.md` and `.cursor/skills/<name>/SKILL.md` are generated; do not edit mirrors directly.
4. Installed Superpowers skills are referenced by name only. Resolve them from the host skill list or the Superpowers plugin install path.
5. Announce each loaded skill by name before applying it.
6. If a required skill cannot be loaded, pause and report the missing skill name. Do not silently skip it.

## Tooling Contract

- Load and follow `openspec-apply-change` before the loop and whenever task execution reveals requirement drift.
- Run and record a Host Capability Probe before choosing the loop driver.
- Load and follow `dispatching-parallel-agents` when parallel dispatch is available and task metadata permits wave-parallel execution.
- Load and follow `subagent-driven-development` when subagents are available but wave-parallel execution is unavailable or inappropriate; otherwise load and follow `executing-plans`.
- Constrain each implementer agent session to one AetherMD task file by loading `aether-workflow-implement-task` and `aether-workflow-validate-task` for each task.
- Update task `Status`, `Run Log`, `Deviation`, and `.superpowers/runs/<change>/validation.md` as AetherMD execution records after the per-task skills complete.
- Record capability fallbacks, wave boundaries, and wave-level validation in the validation record or loop run log.
- If a required skill cannot be loaded, pause and report the missing skill; do not use `.superpowers/` files as a substitute for the process skills.

## Version And Code Management Hooks

- Pre-loop code hook: run `git status --short` and identify unrelated dirty files before starting the loop.
- Pre-loop branch hook: record the current branch and confirm it matches the active OpenSpec change or has a recorded rationale.
- Per-task code hook: after each task, check changed files against that task's allowed files and rollback notes.
- Per-wave code hook: before dispatching a parallel wave, confirm tasks in the wave have disjoint allowed files or an explicit worktree strategy.
- Per-task version hook: if a task touches versioned contracts, run or record the required version/contract validation before moving on.
- Post-loop code hook: produce a changed-file summary grouped by task, and do not stage or commit unless explicitly requested.

## Actions

1. Load and follow `openspec-apply-change` to confirm change status.
2. Run a Host Capability Probe and record this matrix in the validation record or loop run log:
   - task/subagent dispatch availability;
   - `subagent-driven-development` availability;
   - `dispatching-parallel-agents` availability;
   - `executing-plans` availability;
   - Superpowers CLI / skill fallback availability;
   - selected fallback for each unavailable capability.
3. Read `references/task-loop-protocol.md`.
4. Read `references/parallel-wave-protocol.md` when any task has `Parallel Group` metadata or when the plan has four or more tasks.
5. Read the plan and task files, including `Depends On`, `Parallel Group`, and `Barrier` metadata.
6. Choose the loop driver:
   - **Sequential loop**: use when the change has three or fewer tasks, chained dependencies, missing parallel metadata, unavailable parallel dispatch, or maintainer preference for serial execution.
   - **Wave-parallel loop**: use when the change has four or more tasks, explicit parallel groups, satisfied dependency/barrier checks, disjoint allowed files, and available parallel dispatch.
7. Load and follow `dispatching-parallel-agents`, `subagent-driven-development`, or `executing-plans` according to the selected driver and available capabilities.
8. For each task in sequential order, or for each task within the current wave:
   - Load and follow `aether-workflow-implement-task` for that task only.
   - Load and follow `aether-workflow-validate-task` for that task only.
   - Confirm task `Status`, `Run Log`, `Deviation`, and validation record are updated.
9. In wave-parallel mode, close each wave by recording wave-level validation or the reason no wave-level validation applies.
10. Continue to the next task or wave only after all required task validations complete or accepted deviations are recorded.
11. Stop after all tasks complete. Do not update docs/specs, archive, or commit unless explicitly asked.

## Bundled Resources

- `references/task-loop-protocol.md`: task-by-task loop shape, stop conditions, and end-state reporting.
- `references/parallel-wave-protocol.md`: DAG construction, wave grouping, allowed-files conflict checks, barrier handling, wave validation, and worktree fallback guidance.

## Guardrails

- Do not process multiple tasks as one combined implementation in a single implementer session.
- Coordinator-level parallel dispatch is allowed only when each implementer session receives exactly one task and the parallel-wave protocol checks pass.
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
- branch scope does not match the active change and no rationale is recorded;
- unrelated git changes cannot be separated from task changes;
- a task with versioned contract impact lacks validation.

## Output

Report:

- change name;
- branch;
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
