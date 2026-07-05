# Quick Change Guardrails

Use these guardrails for the Quick Change path.

## Scope

- One clear goal per Quick Change.
- Declare allowed files before editing.
- Map every changed file to allowed scope after editing.

## Allowed

- Single-point bug fixes with a clear validation command.
- Small docs clarifications without OpenSpec delta wording.
- Comment or explanation fixes.
- Chores or refactors that do not change public contracts.

## Forbidden

- Creating `openspec/changes/` or `.superpowers/` artifacts.
- Editing `packages/**` public exports without Full Change escalation.
- Editing `openspec/specs/**`, `.skills/aether-workflow/**`, or ADR files.
- Workflow semantics changes.
- Skipping validation or weakening tests.

## Escalation

Pause and re-run Discover when:

- scope grows beyond the declared allowed files;
- public export or versioned contract impact appears;
- OpenSpec spec wording is required;
- a second independent goal appears.

Escalate to Spec Change or Full Change as appropriate.

## Verification

- Load `verification-before-completion` before claiming done.
- Load `test-driven-development` when implementing code with a meaningful test entry point.
- Record validation command and pass/fail in PR traceability.
