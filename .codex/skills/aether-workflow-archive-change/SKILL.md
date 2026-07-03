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

## Actions

1. Check OpenSpec status for the change.
2. Verify all required artifacts exist.
3. Verify all Superpowers tasks are complete.
4. Verify validation results are recorded.
5. Verify compliance review has no unresolved blockers.
6. Verify docs/spec/ADR updates are complete or explicitly deferred.
7. Create `.superpowers/runs/<change>/final-report.md`.
8. Archive the OpenSpec change under `openspec/changes/archive/YYYY-MM-DD-<change>/`.

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

## Pause If

- tasks remain incomplete;
- validation is missing;
- compliance review has blockers;
- spec sync is incomplete;
- public contract or ADR changes lack human confirmation.

## Output

Report archive path, final report path, synced specs, validation summary, deviations, and any follow-up changes.
