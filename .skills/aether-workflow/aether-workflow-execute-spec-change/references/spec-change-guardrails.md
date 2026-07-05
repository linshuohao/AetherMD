# Spec Change Guardrails

Use these guardrails when executing a Spec Change.

## Orchestration

Fixed order:

1. Confirm OpenSpec change status via `openspec-apply-change`.
2. Implement exactly one task via `aether-workflow-implement-task`.
3. Validate via `aether-workflow-validate-task`.
4. Review via `aether-workflow-review-compliance` in **Spec Change mode**.
5. Sync docs/specs when delta requires main spec updates.
6. Archive via `aether-workflow-archive-change` in **Spec Change mode**.

Do not invoke:

- `aether-workflow-create-plan`
- `aether-workflow-create-task` for additional tasks
- `aether-workflow-execute-task-loop`

## Escalation

If implementation reveals:

- a second task;
- parallel wave need;
- workflow semantics impact;

pause and escalate to Full Change. Add plan and multi-task artifacts before continuing.

## Artifact Expectations

- OpenSpec: `change-brief.md` + delta spec
- Superpowers: one task, validation, lightweight review
- No plan file required
