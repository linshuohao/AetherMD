<!-- Generated from .skills/aether-workflow/aether-workflow-execute-task-loop/references/task-loop-protocol.md. Do not edit directly. Run pnpm skills:sync. -->

# Task Loop Protocol

Use this reference when running all tasks for one small AetherMD change.

## Loop Shape

For each task in filename order:

1. Load the task file.
2. Confirm OpenSpec status and requirement context.
3. Confirm allowed and forbidden files.
4. Identify the TDD entry point.
5. Implement only that task.
6. Run that task's validation.
7. Record intuitive verification separately when defined.
8. Update task status, run log, and deviations through Superpowers.
9. Check changed files against the task boundary.

Move to the next task only after the current task is complete or its accepted deviation is recorded.

## Stop Conditions

Pause the loop when a task:

- is ambiguous;
- needs forbidden files;
- requires expanding OpenSpec scope;
- changes a public contract without explicit spec coverage;
- needs a new ADR;
- has validation failure outside task scope;
- has no TDD entry point and no accepted deviation;
- cannot be separated from unrelated git changes.

## End State

After the final task, report changed files by task, validation status, deviations, version-impact checks, and whether the change is ready for compliance review.
