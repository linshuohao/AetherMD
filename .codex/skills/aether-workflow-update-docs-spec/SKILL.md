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

## Actions

1. Read `.superpowers/reviews/<change>.md`.
2. Identify required Docs updates.
3. Sync accepted delta spec changes into `openspec/specs/<capability>/spec.md`.
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
- ADR status changes are needed without human confirmation.

## Output

Report updated docs, updated specs, ADR or glossary changes, remaining manual confirmations, and recommended next workflow skill.
