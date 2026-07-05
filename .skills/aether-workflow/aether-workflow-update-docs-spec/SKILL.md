---
name: aether-workflow-update-docs-spec
description: Update AetherMD Docs and OpenSpec specs after implementation and compliance review. Use when a change has passed or nearly passed review and long-lived facts, specs, ADRs, or changelog entries need synchronization.
---

# Aether Workflow: Update Docs and Spec

Use this skill as Step 8 of the AetherMD AI-native engineering workflow.

These instructions are host-agnostic. Any coding agent may execute them.

## Goal

Synchronize long-lived docs and main specs with the implemented and reviewed change.

## Inputs

- Spec compliance review
- OpenSpec delta specs
- Current diff
- Validation and deviation records
- Relevant Docs and ADRs

## Required Skills

| Role | Skill name | Kind |
| --- | --- | --- |
| OpenSpec main-spec sync | `openspec-sync-specs` | Project |

Superpowers process skills are not required for this step. Read review and validation artifacts directly:

- `.superpowers/reviews/<change>.md`
- `.superpowers/runs/<change>/validation.md`

## Skill Invocation

To invoke a named skill:

1. Use the host skill-invocation mechanism when available (for example a `Skill` tool or `/skill-name`).
2. Otherwise find the skill by `name` in the host's available-skills list and read its full `SKILL.md` with the host file-read tool, then follow it.
3. Project Aether workflow skills are authored under `.skills/aether-workflow/<name>/SKILL.md`. Host-specific mirrors under `.codex/skills/<name>/SKILL.md` and `.cursor/skills/<name>/SKILL.md` are generated; do not edit mirrors directly.
4. Installed Superpowers skills are referenced by name only. Resolve them from the host skill list or the Superpowers plugin install path.
5. Announce each loaded skill by name before applying it.
6. If a required skill cannot be loaded, pause and report the missing skill name. Do not silently skip it.

## Tooling Contract

- Load and follow `openspec-sync-specs` before editing `openspec/specs/<capability>/spec.md`.
- Use this Aether skill for project-specific docs, ADR, glossary, and deviation updates around that OpenSpec sync.
- Do not manually sync main specs until `openspec-sync-specs` has been loaded and followed.
- If `openspec-sync-specs` cannot be loaded, pause and report the missing skill.

## Version And Code Management Hooks

- Version hook: update long-lived docs/specs for package versions, Manifest versions, public exports, compatibility policy, or package layout when implementation changed them.
- Branch hook: record the current branch and confirm it matches the active OpenSpec change or has a recorded rationale.
- Code-management hook: keep docs/spec sync changes separate from unrelated implementation edits in the changed-file summary.
- Release-note hook: if the repository defines changelog or final-report fields, record whether the change affects package/API versioning or is internal-only.

## Actions

1. Read `.superpowers/reviews/<change>.md` and `.superpowers/runs/<change>/validation.md`.
2. Identify required Docs updates.
3. Load and follow `openspec-sync-specs` to sync accepted delta spec changes into `openspec/specs/<capability>/spec.md`.
4. Add or update ADRs when architecture decisions changed.
5. Update glossary for new terminology.
6. Add changelog or final report entries when the repository defines their location.
7. Record any accepted implementation/spec deviations.

## Rules

- Do not duplicate large Docs content into OpenSpec.
- Do not update public SDK contracts silently.
- Do not mark design docs as implemented unless implementation exists and review agrees.
- If an ADR is superseded, update both the old and new ADR references.

## Pause If

- the review has unresolved blockers;
- required docs ownership is unclear;
- syncing a spec would contradict source docs;
- ADR status changes are needed without human confirmation;
- `openspec-sync-specs` cannot be loaded;
- review or validation records are missing;
- versioned contract docs/specs would remain stale after sync;
- branch scope does not match the active change and no rationale is recorded;
- docs/spec sync includes unrelated code-management changes.

## Output

Report updated docs, updated specs, branch, skills loaded (`openspec-sync-specs`), version docs/spec changes, code-management status, ADR or glossary changes, remaining manual confirmations, and recommended next workflow skill.
