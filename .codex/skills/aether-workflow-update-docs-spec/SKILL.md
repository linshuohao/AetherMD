---
name: aether-workflow-update-docs-spec
description: Update AetherMD Docs and OpenSpec specs after implementation and compliance review. Use when a change has passed or nearly passed review and long-lived facts, specs, ADRs, or changelog entries need synchronization.
---

# Aether Workflow: Update Docs and Spec

Use this skill as Step 8 of the AetherMD AI-native engineering workflow.

## Goal

Synchronize long-lived docs and main specs with the implemented and reviewed change.

## Inputs

- Spec compliance review
- OpenSpec delta specs
- Current diff
- Validation and deviation records
- Relevant Docs and ADRs

## Tooling Contract

- Delegate OpenSpec spec synchronization to the installed OpenSpec sync skill or command first, such as `openspec-sync-specs` or the equivalent `/opsx:sync` command path.
- Use this Aether skill to add project-specific docs, ADR, glossary, and deviation updates around that OpenSpec sync.
- Do not manually sync `openspec/specs/<capability>/spec.md` until the OpenSpec sync skill/command has been invoked.
- Use the global Superpowers command/skill layer to inspect review and validation records.

## Version And Code Management Hooks

- Version hook: update long-lived docs/specs for package versions, Manifest versions, public exports, compatibility policy, or package layout when implementation changed them.
- Code-management hook: keep docs/spec sync changes separate from unrelated implementation edits in the changed-file summary.
- Release-note hook: if the repository defines changelog or final-report fields, record whether the change affects package/API versioning or is internal-only.

## Actions

1. Read `.superpowers/reviews/<change>.md`.
2. Identify required Docs updates.
3. Invoke the installed OpenSpec sync skill/command to sync accepted delta spec changes into `openspec/specs/<capability>/spec.md`.
4. Inspect Superpowers review/validation state through the global Superpowers command/skill layer.
5. Add or update ADRs when architecture decisions changed.
6. Update glossary for new terminology.
7. Add changelog or final report entries when the repository defines their location.
8. Record any accepted implementation/spec deviations.

## Rules

- Do not duplicate large Docs content into OpenSpec.
- Do not update public SDK contracts silently.
- Do not mark design docs as implemented unless implementation exists and review agrees.
- If an ADR is superseded, update both the old and new ADR references.

## Pause If

- the review has unresolved blockers;
- required docs ownership is unclear;
- syncing a spec would contradict source docs;
- ADR status changes are needed without human confirmation.
- OpenSpec sync skill/command layer is unavailable.
- global Superpowers command/skill review or validation state cannot be inspected.
- versioned contract docs/specs would remain stale after sync;
- docs/spec sync includes unrelated code-management changes.

## Output

Report updated docs, updated specs, OpenSpec sync skill/command path used, Superpowers command/skill path used, version docs/spec changes, code-management status, ADR or glossary changes, remaining manual confirmations, and recommended next workflow skill.
