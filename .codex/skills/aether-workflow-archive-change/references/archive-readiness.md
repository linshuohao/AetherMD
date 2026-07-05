<!-- Generated from .skills/aether-workflow/aether-workflow-archive-change/references/archive-readiness.md. Do not edit directly. Run pnpm skills:sync. -->

# Archive Readiness

Use this reference before archiving a completed change.

## Required State

- OpenSpec change is complete and ready for the installed archive skill or command.
- Superpowers tasks are complete.
- Validation record exists and includes commands, results, failures, and deviations.
- Compliance review has no unresolved blockers.
- Docs, specs, ADRs, and glossary updates are complete or explicitly deferred.
- Final version impact is recorded.
- Changed files map to tasks or documented finalization work.
- **Full Change:** plan file exists.
- **Spec Change:** exactly one task exists; plan file must not exist.

## Do Not Archive When

- tasks remain incomplete;
- validation is missing;
- compliance review has blockers;
- spec sync is incomplete;
- public contract or ADR changes lack confirmation;
- unrelated dirty files would be mixed into final reporting.

## Final Report Focus

The final report should preserve what future maintainers need: source docs, specs updated, task list, changed-file mapping, validation results, deviations, version impact, and remaining follow-ups.
