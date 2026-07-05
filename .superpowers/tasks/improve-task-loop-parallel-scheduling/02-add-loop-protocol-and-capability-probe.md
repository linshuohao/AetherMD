# Task 02: Add loop protocol and capability probe

Change: improve-task-loop-parallel-scheduling
Spec Requirement: Task loop probes host capabilities before execution; Task loop supports sequential and wave-parallel drivers
Source Docs: `openspec/changes/improve-task-loop-parallel-scheduling/specs/engineering-workflow/spec.md`, `.superpowers/plans/improve-task-loop-parallel-scheduling.md`
Depends On: 01
Parallel Group: loop
Barrier: false
Allowed Files:
- `.skills/aether-workflow/aether-workflow-execute-task-loop/SKILL.md`
- `.skills/aether-workflow/aether-workflow-execute-task-loop/references/task-loop-protocol.md`
- `.skills/aether-workflow/aether-workflow-execute-task-loop/references/parallel-wave-protocol.md`
Forbidden Files:
- `packages/**`
- `.codex/skills/**`
- `.cursor/skills/**`
Implementation Notes:
- Add host capability probe requirements before driver selection.
- Add sequential loop and wave-parallel loop selection rules.
- Add parallel wave protocol reference with DAG, wave, allowed-files, barrier, validation, and worktree fallback guidance.
- Clarify validation and run-log recording for fallback and wave completion.
TDD Notes:
- Design-stage assertion: `rg "Host Capability Probe|wave-parallel|parallel-wave-protocol" .skills/aether-workflow/aether-workflow-execute-task-loop` should show protocol coverage.
Validation:
- `rg "Host Capability Probe|wave-parallel|parallel-wave-protocol" .skills/aether-workflow/aether-workflow-execute-task-loop`
Intuitive Verification:
- Read the protocol top to bottom and confirm no step allows one implementer to handle multiple tasks.
Review Checklist:
- [ ] Capability matrix includes dispatch, subagent, parallel, executing-plans, and Superpowers fallback.
- [ ] Driver choice is explicit.
- [ ] Wave protocol blocks overlapping allowed files unless worktree strategy is recorded.
- [ ] Barrier tasks are serial.
Rollback Notes:
- Revert execute-task-loop skill and reference changes.
Version Impact:
- none; workflow skill/reference only
Commit Scope:
- docs(workflow)
Status:
- completed
Run Log:
- 2026-07-05: Updated execute-task-loop with Host Capability Probe, driver selection, wave-level recording, and per-wave file checks.
- 2026-07-05: Added `parallel-wave-protocol.md` and updated `task-loop-protocol.md` for scheduling metadata and wave completion.
- 2026-07-05: Validation passed: `rg "Host Capability Probe|wave-parallel|parallel-wave-protocol|dispatching-parallel-agents|Barrier" .skills/aether-workflow/aether-workflow-execute-task-loop`.
Deviation:
- none
