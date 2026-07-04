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

## Tooling Contract

- Use the installed OpenSpec skill/command layer to confirm change status and requirement coverage before task creation.
- Use the global Superpowers command/skill layer as the driver for task creation.
- AetherMD task rules constrain task size, TDD entry points, validation, and allowed files; they should not replace the underlying Superpowers task-generation step.
- Direct edits to `.superpowers/tasks/<change>/` are allowed only as artifact outputs selected or created by the global Superpowers command/skill.
- If the global Superpowers command/skill layer is not callable in the current host, pause and report the tool visibility problem; do not use `.superpowers/` files as a substitute.
- Do not create tasks that are not traceable to OpenSpec requirements.

## Version And Code Management Hooks

- Version hook: each task that may touch package metadata, lockfiles, public exports, `SUPPORTED_MANIFEST_VERSIONS`, SDK docs, compatibility docs, or main specs must say so explicitly.
- Code-management hook: each task must list allowed files, forbidden files, and rollback notes precise enough to stage or revert that task alone.
- Commit hook: each task should name the likely Conventional Commit type/scope when useful, especially for code or public contract tasks.

## Actions

1. Invoke the installed OpenSpec skill/command to confirm change status.
2. Invoke the global Superpowers command/skill to create or continue tasks.
3. Read `references/task-quality-rules.md` before splitting or repairing task files.
4. Use `assets/task-template.md` as the task scaffold unless the Superpowers layer provides a stricter template.
5. Create one task file per focused implementation unit.
6. Use numbered filenames such as `01-define-core-package-boundary.md`.
7. Bind every task to:
   - OpenSpec change
   - spec requirement
   - source docs
   - allowed files
   - forbidden files
   - TDD entry point
   - validation
   - intuitive verification, when useful
   - review checklist
6. Keep each task reversible.

## Bundled Resources

- `assets/task-template.md`: canonical task field order.
- `references/task-quality-rules.md`: sizing, traceability, TDD entry point, and intuitive verification rules.

## Task Sizing Rules

- One task should have one clear outcome.
- One task should avoid crossing architecture layers.
- One task should avoid mixing public contract changes with implementation unless the spec requires it.
- One task should identify the first failing test, contract check, or design-stage assertion before implementation begins.
- One task should name any useful visual/demo/smoke verification separately from automated tests.
- A failed task should be revertible without losing unrelated work.

## TDD Notes Guidance

Use `TDD Notes` to state how the task should be driven:

- Prefer red-green-refactor: write or identify the failing test/check first, implement the smallest change, then clean up structure.
- For design-stage tasks, use a failing design assertion instead of a code test, such as a missing required section, inconsistent RFC keyword, or absent source reference.
- If a task cannot start from a failing test/check, require the task to record why in `Deviation`.
- Keep automated validation separate from intuitive verification; the latter can be a demo script, CLI trace, screenshot, or manual smoke path.

## Structure And Comments Guidance

- Ask for comments only where they explain boundaries, non-obvious tradeoffs, or intentionally deferred behavior.
- Avoid comments that merely restate straightforward code.
- Flag directory flattening when a task adds enough files that future work becomes harder to scan; prefer small `test/builders` helpers before broad source reshuffles.
- Avoid large directory reorganizations inside behavior tasks unless the task explicitly includes structure cleanup.

## Pause If

- a task would touch unrelated files;
- a task has no validation;
- a task has no TDD entry point and no recorded reason;
- a task depends on unresolved design questions;
- a task changes public contracts without explicit spec coverage.
- OpenSpec skill/command status cannot be checked;
- global Superpowers command/skill layer is unavailable.
- a task can affect versioned contracts but lacks `Version Impact`;
- a task cannot be staged or reviewed independently.

## Output

Report created task paths, task order, OpenSpec skill/command path used, Superpowers command/skill path used, version-impact coverage, code-management boundaries, validation coverage, and recommended next workflow skill.
