<!-- Generated from .skills/aether-workflow/aether-workflow-execute-task-loop/references/task-loop-protocol.md. Do not edit directly. Run pnpm skills:sync. -->

# Task Loop Protocol

Use this reference when running all tasks for one small AetherMD change.

## Loop Shape

For each task in filename order, or for each task in the selected wave when wave-parallel execution is active:

1. Load the task file.
2. Confirm OpenSpec status and requirement context.
3. Confirm `Depends On`, `Parallel Group`, and `Barrier` metadata.
4. Confirm allowed and forbidden files.
5. Identify the TDD entry point.
6. Implement only that task in the current implementer session.
7. Run that task's validation.
8. Record intuitive verification separately when defined.
9. Update task status, run log, and deviations through Superpowers.
10. Check changed files against the task boundary.

Move to the next task only after the current task is complete or its accepted deviation is recorded.

In wave-parallel mode, move to the next wave only after every task in the current wave is complete and wave-level validation or an accepted deviation is recorded.

## Stop Conditions

Pause the loop when a task:

- is ambiguous;
- needs forbidden files;
- requires expanding OpenSpec scope;
- changes a public contract without explicit spec coverage;
- needs a new ADR;
- has validation failure outside task scope;
- has no TDD entry point and no accepted deviation;
- lacks required scheduling metadata;
- overlaps allowed files with another task in the same wave without a recorded worktree strategy;
- cannot be separated from unrelated git changes.

## End State

After the final task, report changed files by task, validation status, deviations, version-impact checks, and whether the change is ready for compliance review.
