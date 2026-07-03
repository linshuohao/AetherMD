---
name: aether-workflow-create-task
description: Create small AetherMD Superpowers task files from an implementation plan. Use when a plan exists and work needs to be split into reviewable, reversible, Codex-executable tasks.
---

# Aether Workflow: Create Task

Use this skill as Step 4 of the AetherMD AI-native engineering workflow.

## Goal

Create task files that are small enough for Codex to implement one at a time and for humans to review or roll back.

## Inputs

- `.superpowers/plans/<change>.md`
- OpenSpec change artifacts
- Source docs referenced by the plan

## Actions

1. Create `.superpowers/tasks/<change>/` if needed.
2. Create one task file per focused implementation unit.
3. Use numbered filenames such as `01-define-core-package-boundary.md`.
4. Bind every task to:
   - OpenSpec change
   - spec requirement
   - source docs
   - allowed files
   - forbidden files
   - validation
   - review checklist
5. Keep each task reversible.

## Task Template

```md
# Task <NN>: <title>

Change:
Spec Requirement:
Source Docs:
Allowed Files:
Forbidden Files:
Implementation Notes:
Validation:
Review Checklist:
Rollback Notes:
Status:
Run Log:
Deviation:
```

## Task Sizing Rules

- One task should have one clear outcome.
- One task should avoid crossing architecture layers.
- One task should avoid mixing public contract changes with implementation unless the spec requires it.
- A failed task should be revertible without losing unrelated work.

## Pause If

- a task would touch unrelated files;
- a task has no validation;
- a task depends on unresolved design questions;
- a task changes public contracts without explicit spec coverage.

## Output

Report created task paths, task order, validation coverage, and recommended next workflow skill.
