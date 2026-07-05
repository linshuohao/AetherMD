<!-- Generated from .skills/aether-workflow/aether-workflow-create-task/references/task-quality-rules.md. Do not edit directly. Run pnpm skills:sync. -->

# Task Quality Rules

Use this reference when splitting a plan into Superpowers task files or repairing tasks that are too broad.

## Required Binding

Each task must bind to:

- one OpenSpec change;
- one or more explicit spec requirements or source docs;
- precise allowed files;
- precise forbidden files;
- a validation path;
- rollback notes;
- version impact, even when the answer is "none";
- commit scope, when useful.

## Size

A good task has one clear outcome and can be reviewed without reading the whole change history. Split a task when it:

- crosses architecture layers;
- mixes public contract changes with implementation details;
- needs unrelated files;
- cannot be rolled back independently;
- has multiple unrelated validation paths.

## TDD Entry Point

Each task must name the first failing signal before implementation:

- an automated test;
- a contract or package-boundary check;
- a docs/design assertion for documentation-only work.

If no meaningful failing signal exists, require a `Deviation` entry explaining why.

## Intuitive Verification

Use intuitive verification only as reviewer support. It may be a demo script, CLI trace, screenshot, or smoke path. It must not replace required automated or design-stage validation.
