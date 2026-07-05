# Task 04: Sync docs specs and validate

Change: improve-task-loop-parallel-scheduling
Spec Requirement: All requirements in the change
Source Docs: `AI_NATIVE_ENGINEERING_WORKFLOW.md`, `openspec/specs/engineering-workflow/spec.md`, `.superpowers/plans/improve-task-loop-parallel-scheduling.md`
Depends On: 01, 02, 03
Parallel Group: validation
Barrier: true
Allowed Files:
- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `openspec/specs/engineering-workflow/spec.md`
- `openspec/changes/improve-task-loop-parallel-scheduling/tasks.md`
- `.codex/skills/aether-workflow-create-plan/**`
- `.codex/skills/aether-workflow-create-task/**`
- `.codex/skills/aether-workflow-execute-task-loop/**`
- `.codex/skills/aether-workflow-implement-task/**`
- `.cursor/skills/aether-workflow-create-plan/**`
- `.cursor/skills/aether-workflow-create-task/**`
- `.cursor/skills/aether-workflow-execute-task-loop/**`
- `.cursor/skills/aether-workflow-implement-task/**`
- `.superpowers/runs/improve-task-loop-parallel-scheduling/**`
Forbidden Files:
- `packages/**`
Implementation Notes:
- Update long-lived workflow docs and main engineering-workflow spec after skill source changes.
- Run `pnpm skills:sync`; do not edit host mirrors directly.
- Mark OpenSpec tasks complete only after corresponding implementation work is done.
TDD Notes:
- Design-stage assertion plus command validation: OpenSpec validation, skill drift check, and workspace check should pass.
Validation:
- `openspec validate improve-task-loop-parallel-scheduling`
- `pnpm skills:check`
- `pnpm check`
Intuitive Verification:
- Inspect changed-file mapping and generated mirror notices.
Review Checklist:
- [ ] Docs/specs match new workflow behavior.
- [ ] Host mirrors are generated.
- [ ] OpenSpec task checkboxes reflect completed work.
- [ ] Validation record captures command results and deviations.
Rollback Notes:
- Revert docs/spec updates, generated mirrors, task checkbox updates, and validation record.
Version Impact:
- main OpenSpec workflow spec and long-lived docs only; no package version impact
Commit Scope:
- docs(workflow)
Status:
- completed
Run Log:
- 2026-07-05: Updated `AI_NATIVE_ENGINEERING_WORKFLOW.md` Step 3/4/6.5 text and task template example.
- 2026-07-05: Updated `openspec/specs/engineering-workflow/spec.md` with scheduling metadata, host capability probe, loop mode, and guardrail requirements.
- 2026-07-05: Ran `pnpm skills:sync`; initial sandbox run failed with EPERM on generated `.codex/skills/**` unlink, approved elevated rerun passed.
- 2026-07-05: Validation passed: `openspec validate improve-task-loop-parallel-scheduling`, `pnpm skills:check`, and `pnpm check`.
Deviation:
- none; operational sandbox permission note recorded in validation.md
