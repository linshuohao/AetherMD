---
name: aether-workflow-archive-change
description: Archive a completed AetherMD workflow change after tasks, validation, compliance review, and docs/spec sync are complete. Use at the end of the AI-native engineering workflow.
---

# Aether Workflow: Archive Change

Use this skill as Step 9 of the AetherMD AI-native engineering workflow.

These instructions are host-agnostic. Any coding agent may execute them.

## Goal

Finalize a completed change by preserving OpenSpec artifacts, Superpowers execution records, validation results, deviations, and final summary.

## Inputs

- Completed OpenSpec change
- Completed Superpowers tasks
- Validation record
- Compliance review
- Docs/spec/ADR update results
- Workflow path (`Full Change` default, or `Spec Change` when invoked from `aether-workflow-execute-spec-change`)

## Required Skills

| Role | Skill name | Kind |
| --- | --- | --- |
| OpenSpec archive | `openspec-archive-change` | Project |
| Branch completion checks | `finishing-a-development-branch` | Superpowers |

The final report `.superpowers/runs/<change>/final-report.md` is an AetherMD execution record written after the required process skills are loaded.

## Skill Invocation

To invoke a named skill:

1. Use the host skill-invocation mechanism when available (for example a `Skill` tool or `/skill-name`).
2. Otherwise find the skill by `name` in the host's available-skills list and read its full `SKILL.md` with the host file-read tool, then follow it.
3. Project Aether workflow skills are authored under `.skills/aether-workflow/<name>/SKILL.md`. Host-specific mirrors under `.codex/skills/<name>/SKILL.md` and `.cursor/skills/<name>/SKILL.md` are generated; do not edit mirrors directly.
4. Installed Superpowers skills are referenced by name only. Resolve them from the host skill list or the Superpowers plugin install path.
5. Announce each loaded skill by name before applying it.
6. If a required skill cannot be loaded, pause and report the missing skill name. Do not silently skip it.

## Tooling Contract

- Load and follow `openspec-archive-change` for OpenSpec archive readiness and archive mechanics.
- Load and follow `finishing-a-development-branch` for completion checks before finalizing.
- Verify task/run state by reading `.superpowers/tasks/<change>/`, `.superpowers/runs/<change>/validation.md`, and `.superpowers/reviews/<change>.md`.
- Write `.superpowers/runs/<change>/final-report.md` using:
  - `assets/final-report-template.md` for **Full Change**;
  - `assets/final-report-template-spec-change.md` for **Spec Change**.
- Do not move OpenSpec changes until `openspec-archive-change` has been loaded and followed.
- If a required skill cannot be loaded, pause and report the missing skill.

## Version And Code Management Hooks

- Version hook: final report must state whether package versions, `manifestVersion`, public exports, lockfiles, compatibility docs, or main specs changed.
- Branch hook: final report must state the current branch and whether it matches the archived change scope.
- Code-management hook: final report must include changed-file summary, task mapping, validation summary, and whether any untracked or unstaged files remain.
- Commit/PR hook: if committing or preparing a PR, include OpenSpec, Superpowers tasks, validation, deviations, and version impact in the commit body or PR description.

## Actions

1. Load and follow `openspec-archive-change` to check OpenSpec status and archive readiness.
2. Load and follow `finishing-a-development-branch`.
3. Read `references/archive-readiness.md`.
4. Verify required artifacts exist:
   - **Full Change:** proposal, design, delta specs, plan, tasks, validation, review;
   - **Spec Change:** change-brief, delta specs, single task, validation, review; plan file must not exist.
5. Verify Superpowers tasks are complete by reading task files and run records.
6. Verify validation results are recorded.
7. Verify compliance review has no unresolved blockers.
8. Verify docs/spec/ADR updates are complete or explicitly deferred.
9. Create `.superpowers/runs/<change>/final-report.md` using the template that matches the workflow path.
10. Complete the OpenSpec archive through `openspec-archive-change`.
11. If committing or preparing a PR, follow `docs/community/git-workflow.md`.

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

- `assets/final-report-template.md`: Full Change final report scaffold.
- `assets/final-report-template-spec-change.md`: Spec Change final report scaffold.
- `references/archive-readiness.md`: readiness checks and no-archive conditions.

## Pause If

- tasks remain incomplete;
- validation is missing;
- compliance review has blockers;
- spec sync is incomplete;
- public contract or ADR changes lack human confirmation;
- `openspec-archive-change` or `finishing-a-development-branch` cannot be loaded;
- task/run state cannot be verified from artifacts;
- final version impact is not recorded;
- branch scope does not match the active change and no rationale is recorded;
- final changed-file/task mapping is incomplete.

## Output

Report archive path, final report path, branch, skills loaded (`openspec-archive-change`, `finishing-a-development-branch`), synced specs, version impact, code-management summary, validation summary, deviations, and any follow-up changes.
