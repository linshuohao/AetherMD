# Task 01: Add scheduling metadata fields

Change: improve-task-loop-parallel-scheduling
Spec Requirement: Task artifacts carry scheduling metadata
Source Docs: `openspec/changes/improve-task-loop-parallel-scheduling/specs/engineering-workflow/spec.md`, `.superpowers/plans/improve-task-loop-parallel-scheduling.md`
Depends On: none
Parallel Group: metadata
Barrier: false
Allowed Files:

- `.skills/aether-workflow/aether-workflow-create-plan/SKILL.md`
- `.skills/aether-workflow/aether-workflow-create-plan/assets/implementation-plan-template.md`
- `.skills/aether-workflow/aether-workflow-create-task/SKILL.md`
- `.skills/aether-workflow/aether-workflow-create-task/assets/task-template.md`
- `.skills/aether-workflow/aether-workflow-create-task/references/task-quality-rules.md`
  Forbidden Files:
- `packages/**`
- `.codex/skills/**`
- `.cursor/skills/**`
  Implementation Notes:
- Add `Depends On`, `Parallel Group`, and `Barrier` to plan/task templates.
- Update create-plan and create-task instructions so task metadata is derived from the plan, not invented per task.
- Update quality rules for disjoint allowed files and explicit barrier marking.
  TDD Notes:
- Design-stage assertion: `rg "Depends On|Parallel Group|Barrier" .skills/aether-workflow/aether-workflow-create-*` should show template and instruction coverage.
  Validation:
- `rg "Depends On|Parallel Group|Barrier" .skills/aether-workflow/aether-workflow-create-*`
  Intuitive Verification:
- Inspect the task template field order and Task Breakdown columns.
  Review Checklist:
- [ ] Plan template includes the scheduling columns.
- [ ] Task template includes the scheduling fields.
- [ ] create-plan/create-task instructions explain propagation.
- [ ] quality rules cover same-wave allowed file conflicts and barrier marking.
      Rollback Notes:
- Revert the listed `.skills/aether-workflow/aether-workflow-create-*` changes.
  Version Impact:
- none; workflow skill/template only
  Commit Scope:
- docs(workflow)
  Status:
- completed
  Run Log:
- 2026-07-05: Updated plan/task templates, create-plan/create-task instructions, and task quality rules with scheduling metadata.
- 2026-07-05: Validation passed: `rg "Depends On|Parallel Group|Barrier" .skills/aether-workflow/aether-workflow-create-plan .skills/aether-workflow/aether-workflow-create-task`.
  Deviation:
- none
