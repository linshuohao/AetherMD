---
name: aether-workflow-create-task
description: Create small AetherMD task files from an implementation plan. Use when a plan exists and work needs to be split into reviewable, reversible, single-task execution units.
---

<!-- Generated from .skills/aether-workflow/aether-workflow-create-task/SKILL.md. Do not edit directly. Run pnpm skills:sync. -->


# Aether Workflow: Create Task

Use this skill as Step 4 of the AetherMD AI-native engineering workflow.

These instructions are host-agnostic. Any coding agent may execute them.

## Goal

Create task files that are small enough to implement one at a time and for humans to review or roll back.

## Inputs

- `.superpowers/plans/<change>.md`
- OpenSpec change artifacts
- Source docs referenced by the plan

## Required Skills

| Role | Skill name | Kind |
| --- | --- | --- |
| OpenSpec status/context | `openspec-apply-change` | Project |
| Task sizing and file mapping | `writing-plans` | Superpowers |

`writing-plans` supplies bite-sized task granularity and file-mapping rules. This Aether skill owns the `.superpowers/tasks/<change>/` file format and templates.

## Skill Invocation

To invoke a named skill:

1. Use the host skill-invocation mechanism when available (for example a `Skill` tool or `/skill-name`).
2. Otherwise find the skill by `name` in the host's available-skills list and read its full `SKILL.md` with the host file-read tool, then follow it.
3. Project Aether workflow skills are authored under `.skills/aether-workflow/<name>/SKILL.md`. Host-specific mirrors under `.codex/skills/<name>/SKILL.md` and `.cursor/skills/<name>/SKILL.md` are generated; do not edit mirrors directly.
4. Installed Superpowers skills are referenced by name only. Resolve them from the host skill list or the Superpowers plugin install path.
5. Announce each loaded skill by name before applying it.
6. If a required skill cannot be loaded, pause and report the missing skill name. Do not silently skip it.

## Tooling Contract

- Load and follow `openspec-apply-change` to confirm change status and requirement coverage before task creation.
- Load and follow `writing-plans` for task sizing, file mapping, and TDD-oriented step shape.
- Write task files under `.superpowers/tasks/<change>/` using `assets/task-template.md` and `references/task-quality-rules.md`.
- Direct edits to task files are allowed only after the required skills have been loaded and followed.
- Do not create tasks that are not traceable to OpenSpec requirements.
- If a required skill cannot be loaded, pause and report the missing skill; do not hand-write tasks as a substitute.

## Version And Code Management Hooks

- Version hook: each task that may touch package metadata, lockfiles, public exports, `SUPPORTED_MANIFEST_VERSIONS`, SDK docs, compatibility docs, or main specs must say so explicitly.
- Branch hook: record the current branch and confirm it matches the active OpenSpec change or has a recorded rationale.
- Code-management hook: each task must list allowed files, forbidden files, and rollback notes precise enough to stage or revert that task alone.
- Scheduling hook: each task must copy `Depends On`, `Parallel Group`, and `Barrier` from the accepted implementation plan; if a field is not applicable, mark it empty, `none`, or `false` explicitly.
- Commit hook: each task should name the likely Conventional Commit type/scope when useful, especially for code or public contract tasks.

## Actions

1. Load and follow `openspec-apply-change` to confirm change status.
2. Load and follow `writing-plans`.
3. Read `references/task-quality-rules.md` before splitting or repairing task files.
4. Use `assets/task-template.md` as the task scaffold.
5. Create one task file per focused implementation unit.
6. Use numbered filenames such as `01-define-core-package-boundary.md`.
7. Bind every task to:
   - OpenSpec change
   - spec requirement
   - source docs
   - dependency ids from the plan (`Depends On`)
   - parallel wave grouping from the plan (`Parallel Group`)
   - barrier status from the plan (`Barrier`)
   - allowed files
   - forbidden files
   - TDD entry point
   - validation
   - intuitive verification, when useful
   - review checklist
8. Keep each task reversible.

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
- Tasks in the same `Parallel Group` must have disjoint allowed files unless the plan records a worktree-based strategy.
- A task that blocks following work, runs full validation, merges parallel outputs, or performs whole-change review must set `Barrier: true`.

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
- a task changes public contracts without explicit spec coverage;
- `openspec-apply-change` or `writing-plans` cannot be loaded;
- a task can affect versioned contracts but lacks `Version Impact`;
- a task lacks `Depends On`, `Parallel Group`, or `Barrier` metadata copied from the plan;
- two tasks in the same parallel wave have overlapping allowed files and no worktree strategy;
- branch scope does not match the active change and no rationale is recorded;
- a task cannot be staged or reviewed independently.

## Output

Report created task paths, branch, task order, skills loaded (`openspec-apply-change`, `writing-plans`), version-impact coverage, code-management boundaries, validation coverage, and recommended next workflow skill.
