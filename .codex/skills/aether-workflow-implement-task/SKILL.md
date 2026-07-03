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

## Actions

1. Read the task file first.
2. Read the associated OpenSpec artifacts.
3. Read only task-referenced docs and directly relevant local files.
4. Confirm allowed files and forbidden files.
5. Make the smallest necessary edits.
6. Do not cross task scope.
7. Run the task validation if possible.
8. Update task `Status`, `Run Log`, and `Deviation`.

## Guardrails

- Do not implement from the full `docs/` tree.
- Do not process multiple tasks at once.
- Do not modify public contracts unless the task and OpenSpec spec explicitly require it.
- Do not weaken tests.
- Do not add silent fallback behavior.
- Do not introduce unrecorded architecture decisions.
- Do not bypass Core, Plugin Contract, Adapter, or Shell boundaries.

## Pause If

- the task is ambiguous;
- implementation needs a forbidden file;
- implementation requires a new architecture decision;
- validation fails outside the task scope;
- a required source doc contradicts the task.

## Output

Report change name, task id, files changed, validation performed, deviations, and recommended next workflow skill.
