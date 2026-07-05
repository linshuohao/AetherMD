# Spec Change Entry Criteria

Use these criteria when classifying or executing a Spec Change.

## Allowed

- Single capability OpenSpec delta.
- One Superpowers task can complete the implementation or docs update.
- Localized changes in one package or docs partition when validation is clear.
- Spec trace is required but a full plan and task loop is not.

## Forbidden

- Multiple independent tasks.
- Parallel groups or barrier tasks.
- Architecture, SDK, ADR, CI, or workflow semantics changes.
- Full Change OpenSpec stack when Spec Change artifacts suffice.
- Calling `aether-workflow-create-plan` or `aether-workflow-execute-task-loop`.

## Artifacts

OpenSpec change directory:

- `change-brief.md`
- `specs/<capability>/spec.md`
- `.openspec.yaml`

Do not require `proposal.md`, `design.md`, or `tasks.md`.

Superpowers:

- exactly one `.superpowers/tasks/<change>/01-*.md`
- validation and lightweight review records

## Escalation to Full Change

Pause and escalate when:

- a second task is required;
- parallel scheduling is needed;
- workflow semantics or multi-capability scope appears;
- protected boundaries from Discover are crossed.

## Examples

| Scenario | Path |
| --- | --- |
| One engineering-workflow requirement update, one task | Spec Change |
| New workflow skill plus routing changes | Full Change |
| Typo in skill example path only | Quick Change or Maintenance |
