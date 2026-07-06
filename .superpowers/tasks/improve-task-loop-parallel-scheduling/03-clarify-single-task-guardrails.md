# Task 03: Clarify single-task guardrails

Change: improve-task-loop-parallel-scheduling
Spec Requirement: Single-task guardrails distinguish implementer scope from coordinator scheduling
Source Docs: `openspec/changes/improve-task-loop-parallel-scheduling/specs/engineering-workflow/spec.md`, `.superpowers/plans/improve-task-loop-parallel-scheduling.md`
Depends On: 02
Parallel Group: guardrails
Barrier: false
Allowed Files:

- `.skills/aether-workflow/aether-workflow-implement-task/SKILL.md`
- `.skills/aether-workflow/aether-workflow-execute-task-loop/SKILL.md`
  Forbidden Files:
- `packages/**`
- `.codex/skills/**`
- `.cursor/skills/**`
  Implementation Notes:
- Replace ambiguous wording that could be read as forbidding coordinator-level parallel dispatch.
- Make the implementer session boundary explicit.
  TDD Notes:
- Design-stage assertion: `rg "single agent session|coordinator" .skills/aether-workflow/aether-workflow-implement-task .skills/aether-workflow/aether-workflow-execute-task-loop` should show both sides of the distinction.
  Validation:
- `rg "single agent session|coordinator" .skills/aether-workflow/aether-workflow-implement-task .skills/aether-workflow/aether-workflow-execute-task-loop`
  Intuitive Verification:
- Compare implement-task guardrails with execute-loop guardrails for non-contradiction.
  Review Checklist:
- [ ] Implementer cannot process more than one task in a session.
- [ ] Coordinator can dispatch independent single-task sessions when checks pass.
- [ ] Wording does not weaken allowed/forbidden file checks.
      Rollback Notes:
- Revert wording changes in implement-task and execute-task-loop.
  Version Impact:
- none; workflow skill wording only
  Commit Scope:
- docs(workflow)
  Status:
- completed
  Run Log:
- 2026-07-05: Updated implement-task guardrails to forbid more than one task per single agent session.
- 2026-07-05: Updated execute-task-loop wording to distinguish coordinator parallel dispatch from implementer task scope.
- 2026-07-05: Validation passed: `rg "single agent session|implementer agent session|coordinator" .skills/aether-workflow/aether-workflow-implement-task .skills/aether-workflow/aether-workflow-execute-task-loop`.
  Deviation:
- none
