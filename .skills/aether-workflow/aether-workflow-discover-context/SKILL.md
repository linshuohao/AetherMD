---
name: aether-workflow-discover-context
description: Discover AetherMD workflow context before creating or changing implementation artifacts. Use when a request may affect architecture, SDK contracts, engineering strategy, OpenSpec changes, Superpowers tasks, workflow guardrails, or long-lived project documentation.
---

# Aether Workflow: Discover Context

Use this skill as Step 1 of the AetherMD AI-native engineering workflow.

These instructions are host-agnostic. Any coding agent may execute them.

## Goal

Classify the request into a workflow execution path, determine whether OpenSpec is required, and identify the authoritative docs that constrain it.

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

## Workflow Path Classification

Classify every request into exactly one path:

| Path | When to use |
| --- | --- |
| **Maintenance** | Typo, broken link, formatting-only, or semantics-free docs cleanup |
| **Quick Change** | Single scoped fix or docs clarification without public contract or spec wording |
| **Spec Change** | Single capability delta and one task; needs spec trace but not multi-step plan |
| **Full Change** | Architecture, SDK, ADR, CI, workflow semantics, multi-task, or MVP implementation |

Paths may only escalate upward:

`Maintenance → Quick Change → Spec Change → Full Change`

Do not downgrade a path to avoid review.

## Protected Boundaries

The following always require **Full Change** (never Maintenance, Quick Change, or Spec Change):

- Architecture boundaries
- SDK, Core API, Manifest, Command/Event, Capability, or Permission contracts
- ADR creation, supersede, or deprecation
- Test strategy or CI gate changes
- Workflow semantics (path rules, skill routing, task loop guardrails, engineering-workflow SHALL/MUST changes)
- New workflow skills or deletion of workflow skills
- Multi-capability delta or multi-task implementation
- MVP package or runtime behavior first implementation
- Direct edits to `openspec/specs/**` main specs without a change delta

**Maintenance** additionally forbids: `packages/**`, `openspec/**`, `.skills/**`, ADR, any semantic change.

**Quick Change** additionally forbids: OpenSpec delta wording, workflow semantics, protected paths above.

**Spec Change** additionally forbids: plan files, task loops, parallel waves, second tasks, workflow semantics.

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
4. Choose **Workflow Path Classification** using the table and protected boundaries above.
5. Write **why this path is sufficient** (1–3 sentences citing source docs).
6. List **escalation triggers** that would force the next path up.
7. Derive **open_spec_required**: yes for Spec Change and Full Change; no for Maintenance and Quick Change.
8. Recommend the **next workflow skill** using the routing table below.

## Path Routing

| Classification | open_spec_required | recommended next workflow skill |
| --- | --- | --- |
| Maintenance | no | None — implement directly and fill Maintenance PR traceability |
| Quick Change | no | `aether-workflow-quick-change` |
| Spec Change | yes | `aether-workflow-create-spec-change` |
| Full Change | yes | `aether-workflow-create-change` |

## OpenSpec Required (Full Change and Spec Change baseline)

Require OpenSpec when the request:

- changes architecture boundaries;
- changes SDK, Core API, Manifest, Command/Event, Capability, or Permission contracts;
- starts implementation of MVP packages or runtime behavior;
- changes test strategy or CI gates;
- changes, supersedes, or deprecates an ADR;
- changes workflow semantics or engineering-workflow requirements.

Spec Change uses lightweight OpenSpec artifacts (`change-brief.md` + delta spec). Full Change uses the complete OpenSpec stack.

## Output

Report all of the following:

- request classification;
- source docs found;
- missing docs or uncertainty;
- workflow path classification;
- why this path is sufficient;
- escalation triggers;
- open_spec_required;
- recommended next workflow skill;
- optional skills loaded, if any.

Do not implement or edit files unless the user explicitly asks for the resulting documentation change.
