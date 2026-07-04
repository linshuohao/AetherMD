---
name: aether-workflow-archive-change
description: Archive a completed AetherMD workflow change after tasks, validation, compliance review, and docs/spec sync are complete. Use at the end of the AI-native engineering workflow.
---

# Aether Workflow: Archive Change

Use this skill as Step 9 of the AetherMD AI-native engineering workflow.

## Goal

Finalize a completed change by preserving OpenSpec artifacts, Superpowers execution records, validation results, deviations, and final summary.

## Inputs

- Completed OpenSpec change
- Completed Superpowers tasks
- Validation record
- Compliance review
- Docs/spec/ADR update results

## Tooling Contract

- Delegate OpenSpec archive mechanics to the installed OpenSpec archive skill or command first, such as `openspec-archive-change` or the equivalent `/opsx:archive` command path.
- Use the global Superpowers command/skill layer to verify task/run/final-report state.
- This Aether skill adds final AetherMD checks and final-report content; it must not manually move OpenSpec changes until the OpenSpec archive skill/command has been invoked.

## Version And Code Management Hooks

- Version hook: final report must state whether package versions, `manifestVersion`, public exports, lockfiles, compatibility docs, or main specs changed.
- Code-management hook: final report must include changed-file summary, task mapping, validation summary, and whether any untracked or unstaged files remain.
- Commit/PR hook: if committing or preparing a PR, include OpenSpec, Superpowers tasks, validation, deviations, and version impact in the commit body or PR description.

## Actions

1. Invoke the installed OpenSpec archive skill/command to check OpenSpec status and archive readiness.
2. Read `references/archive-readiness.md`.
3. Verify all required artifacts exist.
4. Verify all Superpowers tasks are complete through the global Superpowers command/skill layer.
5. Verify validation results are recorded.
6. Verify compliance review has no unresolved blockers.
7. Verify docs/spec/ADR updates are complete or explicitly deferred.
8. Create `.superpowers/runs/<change>/final-report.md` through the global Superpowers command/skill, using `assets/final-report-template.md` if no stricter template exists.
9. Archive the OpenSpec change through the OpenSpec archive skill/command.
10. If committing or preparing a PR, follow `docs/community/git-workflow.md`.

## Final Report Sections

- Change
- Source Docs
- Specs Updated
- Tasks Completed
- Files Changed
- Validation Results
- Deviations
- Docs / ADR Updates
- Remaining Follow-ups

## Bundled Resources

- `assets/final-report-template.md`: final report scaffold.
- `references/archive-readiness.md`: readiness checks and no-archive conditions.

## Pause If

- tasks remain incomplete;
- validation is missing;
- compliance review has blockers;
- spec sync is incomplete;
- public contract or ADR changes lack human confirmation.
- OpenSpec archive skill/command layer is unavailable;
- global Superpowers command/skill task/run state cannot be verified.
- final version impact is not recorded;
- final changed-file/task mapping is incomplete.

## Output

Report archive path, final report path, OpenSpec archive skill/command path used, Superpowers command/skill path used, synced specs, version impact, code-management summary, validation summary, deviations, and any follow-up changes.
