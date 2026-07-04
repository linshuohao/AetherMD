---
name: aether-workflow-discover-context
description: Discover AetherMD workflow context before creating or changing implementation artifacts. Use when a request may affect architecture, SDK contracts, engineering strategy, OpenSpec changes, Superpowers tasks, Codex guardrails, or long-lived project documentation.
---

# Aether Workflow: Discover Context

Use this skill as Step 1 of the AetherMD AI-native engineering workflow.

## Goal

Determine whether the request needs an OpenSpec change and identify the authoritative docs that constrain it.

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
   - governance or Agent workflow
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

OpenSpec may be skipped for typo fixes, broken link fixes, formatting-only docs edits, and small Agent-rule clarifications that do not change workflow semantics.

## Output

Report:

- request classification;
- source docs found;
- missing docs or uncertainty;
- whether to create an OpenSpec change;
- recommended next workflow skill.

Do not implement or edit files unless the user explicitly asks for the resulting documentation change.
