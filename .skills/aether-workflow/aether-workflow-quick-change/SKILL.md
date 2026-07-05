---
name: aether-workflow-quick-change
description: Execute a scoped AetherMD Quick Change with branch hooks, scope guards, validation delegation, and structured PR traceability. Use when Discover classifies a request as Quick Change.
---

# Aether Workflow: Quick Change

Use this skill after Step 1 when `aether-workflow-discover-context` classifies the request as **Quick Change**.

These instructions are host-agnostic. Any coding agent may execute them.

## Goal

Complete a single scoped change without OpenSpec or Superpowers workflow artifacts while preserving branch discipline, validation, and PR traceability.

## Inputs

- Discover output: classification, source docs, allowed scope intent, escalation triggers
- User request and relevant local files

## Required Skills

| Role | Skill name | When |
| --- | --- | --- |
| Implementation process | `test-driven-development` | Code changes with a meaningful test entry point |
| Pre-completion check | `verification-before-completion` | Always before reporting completion |

## Skill Invocation

To invoke a named skill:

1. Use the host skill-invocation mechanism when available (for example a `Skill` tool or `/skill-name`).
2. Otherwise find the skill by `name` in the host's available-skills list and read its full `SKILL.md` with the host file-read tool, then follow it.
3. Project Aether workflow skills are authored under `.skills/aether-workflow/<name>/SKILL.md`. Host-specific mirrors under `.codex/skills/<name>/SKILL.md` and `.cursor/skills/<name>/SKILL.md` are generated; do not edit mirrors directly.
4. Installed Superpowers skills are referenced by name only. Resolve them from the host skill list or the Superpowers plugin install path.
5. Announce each loaded skill by name before applying it.
6. If a required skill cannot be loaded, pause and report the missing skill name. Do not silently skip it.

## Tooling Contract

- Read `references/quick-change-guardrails.md` before editing files.
- Do not create `openspec/changes/` or `.superpowers/` artifacts.
- Do not skip `verification-before-completion`.
- If scope crosses protected boundaries, pause and escalate via Discover to Spec Change or Full Change.

## Version And Code Management Hooks

- Version hook: record whether package SemVer, exports, lockfiles, or compatibility docs may change. Any versioned contract impact requires escalation to Full Change.
- Branch hook: run `git branch --show-current` and `git status --short`. Ensure the current branch is not `main`. Create or verify a scoped branch per `docs/community/git-workflow.md`.
- Code-management hook: declare allowed files before editing; map changed files after editing; flag unrelated dirty files.
- Traceability hook: produce PR body content using `assets/pr-traceability-template.md`.

## Branch Preparation

- Use branch prefixes from `docs/community/git-workflow.md`: `docs/`, `fix/`, `chore/`, `refactor/`, etc.
- Prefer `<type>/<kebab-topic>` describing the change topic.
- Pause when unrelated dirty files exist or branch scope is ambiguous.

## Actions

1. Verify Discover classified the request as Quick Change; if not, stop and use the recommended path skill.
2. Prepare or verify a scoped branch.
3. Declare allowed files and forbidden files for this Quick Change.
4. Load and follow `test-driven-development` when implementing code with a test entry point.
5. Implement the scoped change.
6. Run the validation command recorded in the task output (for example `pnpm check`, targeted tests, or docs checks).
7. Load and follow `verification-before-completion`.
8. Compare changed files to allowed scope; escalate if violated.
9. Generate PR traceability using `assets/pr-traceability-template.md`.
10. Report branch, changed files, validation status, version impact, and suggested commit scope.

## Pause If

- Discover path is not Quick Change;
- protected paths would be edited;
- OpenSpec spec wording is required;
- public contract or version impact appears;
- scope requires a second independent goal;
- a required skill cannot be loaded;
- unrelated dirty files would be mixed into the change.

## Output

Report branch, allowed scope, changed files, validation command and result, escalation check, version impact, PR traceability draft, and whether the change is PR-ready.
