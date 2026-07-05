---
name: aether-workflow-discover-context
description: Discover AetherMD workflow context before creating or changing implementation artifacts. Use when a request may affect architecture, SDK contracts, engineering strategy, OpenSpec changes, Superpowers tasks, workflow guardrails, or long-lived project documentation.
---

<!-- Generated from .skills/aether-workflow/aether-workflow-discover-context/SKILL.md. Do not edit directly. Run pnpm skills:sync. -->


# Aether Workflow: Discover Context

Use this skill as Step 1 of the AetherMD AI-native engineering workflow.

These instructions are host-agnostic. Any coding agent may execute them.

## Goal

Determine whether the request needs an OpenSpec change and identify the authoritative docs that constrain it.

## Required Skills

None. This step only reads project docs and classifies the request.

## Optional Skills

- `brainstorming` (Superpowers): when the request is creative or ambiguous and needs structured exploration before classification.

## Skill Invocation

To invoke a named skill:

1. Use the host skill-invocation mechanism when available (for example a `Skill` tool or `/skill-name`).
2. Otherwise find the skill by `name` in the host's available-skills list and read its full `SKILL.md` with the host file-read tool, then follow it.
3. Project Aether workflow skills are authored under `.skills/aether-workflow/<name>/SKILL.md`. Host-specific mirrors under `.codex/skills/<name>/SKILL.md` and `.cursor/skills/<name>/SKILL.md` are generated; do not edit mirrors directly.
4. Installed Superpowers skills are referenced by name only. Resolve them from the host skill list or the Superpowers plugin install path.
5. Announce each loaded skill by name before applying it.
6. If a required skill cannot be loaded, pause and report the missing skill name. Do not silently skip it.

## Read First

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `docs/README.md`
- `docs/maintenance.md`
- Relevant pages under `docs/architecture/`, `docs/sdk/`, `docs/engineering/`, `docs/adr/`, and `docs/glossary.md`

## Actions

1. Classify the request as one or more of:
   - architecture boundary
   - SDK public contract
   - engineering strategy
   - implementation task
   - documentation-only maintenance
   - governance or workflow
2. Search existing docs with `rg` before inventing terminology or new requirements.
3. Identify source-of-truth docs and any accepted ADRs.
4. Decide whether OpenSpec is required.

## OpenSpec Required

Require an OpenSpec change when the request:

- changes architecture boundaries;
- changes SDK, Core API, Manifest, Command/Event, Capability, or Permission contracts;
- starts implementation of MVP packages or runtime behavior;
- changes test strategy or CI gates;
- changes, supersedes, or deprecates an ADR.

## OpenSpec Optional

OpenSpec may be skipped for typo fixes, broken link fixes, formatting-only docs edits, and small workflow-rule clarifications that do not change workflow semantics.

## Output

Report:

- request classification;
- source docs found;
- missing docs or uncertainty;
- whether to create an OpenSpec change;
- optional skills loaded, if any;
- recommended next workflow skill.

Do not implement or edit files unless the user explicitly asks for the resulting documentation change.
