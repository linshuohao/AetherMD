# Single Task Guardrails

Use this reference before editing files for one Superpowers task.

## Pre-edit Check

- Read the task file before related source files.
- Read only the OpenSpec artifacts, docs, and local files needed for this task.
- Run or inspect `git status --short`.
- Confirm every intended edit is covered by `Allowed Files`.
- Confirm no intended edit is listed under `Forbidden Files`.
- Identify the TDD entry point before editing.

## Scope Rules

- Implement one task only.
- Do not batch multiple task outcomes into one edit.
- Do not modify public contracts unless the task and OpenSpec spec explicitly require it.
- Do not introduce unrecorded architecture decisions.
- Do not add silent fallback behavior.
- Do not delete, skip, or weaken tests.

## Refactor Rules

Keep refactors local to the task. Prefer names, small helpers, and focused test builders over broad directory movement. Add comments only when they explain boundaries, non-obvious tradeoffs, or intentionally deferred behavior.

## Post-edit Check

- Review changed files against the task boundary.
- Run task validation when possible.
- Record validation, deviations, and version impact in the task run log through the Superpowers layer.
