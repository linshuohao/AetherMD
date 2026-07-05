<!-- Generated from .skills/aether-workflow/aether-workflow-validate-task/references/validation-integrity.md. Do not edit directly. Run pnpm skills:sync. -->

# Validation Integrity

Use this reference when deciding whether a task is actually validated.

## What Counts

Validation must prove the task requirement, not merely prove that a broad command still passes.

Prefer:

- a focused automated test;
- a contract or package-boundary check;
- a docs/design assertion tied to the changed requirement;
- a broad suite paired with a focused check when no narrow command exists.

## What To Record

Record:

- exact commands;
- pass/fail status;
- relevant output summary;
- skipped or empty test runs;
- accepted failures;
- deviations from the task's TDD entry point;
- changed-file boundary check;
- versioned contract checks.

## What Not To Hide

Treat these as failures or deviations, not clean passes:

- tests deleted, skipped, or weakened;
- generated output stale or unreviewed;
- no meaningful assertion executed;
- validation only covers unrelated behavior;
- changed files outside task boundaries.
