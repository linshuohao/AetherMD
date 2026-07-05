<!-- Generated from .skills/aether-workflow/aether-workflow-review-compliance/references/anticorruption-checklist.md. Do not edit directly. Run pnpm skills:sync. -->

# Anticorruption Checklist

Use this reference during compliance review.

## Traceability

- Every changed file maps to a task.
- Every task maps to a spec requirement or source doc.
- Every public contract change is explicit in OpenSpec and long-lived docs.
- Every deviation is recorded and reviewed.

## Architecture

- Core remains business-blind.
- UI Shell concerns do not leak into Core.
- Third-party engine APIs remain inside Adapter boundaries.
- State changes route through Command Bus where required.
- Dependency direction remains Shell -> Core -> Plugin Contract -> Adapter.

## Quality

- Tests are not deleted, skipped, or weakened.
- Validation proves the changed requirement.
- Intuitive verification is separate from required validation.
- No silent fallback behavior was introduced.
- New architecture decisions are captured in ADRs.

## Versioning

Review package metadata, lockfiles, public exports, Manifest version support, SDK docs, compatibility docs, and main OpenSpec specs for drift.
