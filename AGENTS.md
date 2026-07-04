# Repository Guidelines

## Project Structure & Module Organization

AetherMD is currently in the design draft + M1 Core Bootstrap stage for a framework-independent, plugin-oriented Markdown editor engine. The repository now includes a minimal `@aether-md/core` implementation alongside the design documents. The main entry points are:

- `README.md`: project status, goals, and recommended reading paths.
- `CONTRIBUTING.md`: contribution scope and review expectations.
- `package.json`: root workspace scripts for build, typecheck, tests, checks, Changesets, and Git workflow validation.
- `pnpm-workspace.yaml`: workspace boundary for current and future packages.
- `turbo.json`: Turborepo task orchestration for package-level scripts.
- `packages/core/`: M1 Core Bootstrap package with Manifest validation, Service Capability validation, dependency ordering, lifecycle startup, dispose, and tests.
- `openspec/specs/`: synced main OpenSpec specs, including Core Bootstrap and engineering workflow specs.
- `.superpowers/`: implementation plans, task records, validation notes, reviews, and final reports for completed workflow changes.
- `docs/architecture/`: long-term principles, boundaries, roadmap, and compatibility notes.
- `docs/sdk/`: public Plugin SDK contracts, manifests, commands, lifecycle, and examples.
- `docs/engineering/`: runtime strategy, data flow, concurrency, security, observability, and error handling.
- `docs/adr/`: architecture decision records. Use `docs/templates/adr.md` for new decisions.
- `docs/glossary.md`: canonical terminology. Keep new terms aligned with it.

## Build, Test, and Development Commands

The repository uses pnpm workspaces and Turborepo. Current validation commands:

- `pnpm build`: build all packages in scope.
- `pnpm typecheck`: run TypeScript checks across packages.
- `pnpm test`: run package test suites.
- `pnpm check`: run build, typecheck, and test through the workspace check pipeline.
- `pnpm core:test`: run the `@aether-md/core` test suite in watchless mode.

For documentation and terminology work, also use:

- `rg "term" docs`: search for related concepts before changing terminology.
- `rg "MUST|SHOULD|MAY" docs`: review RFC-style requirements for consistency.
- `find docs -name "*.md" | sort`: inspect the documentation surface before broad edits.

## Coding Style & Naming Conventions

Write Markdown with clear headings, short paragraphs, and repository-relative links such as `docs/sdk/manifest.md`. Keep filenames lowercase and hyphenated for new docs, for example `docs/engineering/plugin-runtime.md`. Use RFC keywords (`MUST`, `SHOULD`, `MAY`) sparingly and only when the requirement level is intentional. Prefer precise project terms from `docs/glossary.md`.

## Testing Guidelines

`packages/core` currently uses TypeScript plus the Node built-in test runner for the M1 Core Bootstrap baseline. Treat review as both design validation and executable contract validation: check that architecture changes remain compatible with `docs/architecture/principles.md`, SDK changes update the relevant `docs/sdk/` contract, runtime behavior changes are reflected in `docs/engineering/`, and Core changes keep `pnpm check` green. For major decisions, add or update an ADR rather than burying rationale in a single topic page.

## Commit & Pull Request Guidelines

Follow `docs/community/git-workflow.md` for branch names, commit messages, PR descriptions, and AI/Codex submission rules. Commit messages should use Conventional Commits, for example `docs(workflow): add git workflow checks`.

Pull requests should focus on one topic, describe whether the change affects architecture, SDK contracts, or engineering strategy, and link any related ADR or discussion. Include screenshots only when changing rendered documentation or diagrams.

## Agent-Specific Instructions

Use the Aether workflow skills before changing architecture, SDK contracts, engineering strategy, OpenSpec artifacts, Superpowers artifacts, implementation code, or long-lived project documentation. Skills are host-agnostic and mirrored under `.cursor/skills/` and `.codex/skills/` with identical content. Start with `aether-workflow-discover-context` when the step is unclear, then use the matching `aether-workflow-*` skill for the current workflow stage:

- `aether-workflow-create-change` for OpenSpec proposal, design, delta specs, and high-level tasks (`openspec-propose` or `openspec-apply-change`).
- `aether-workflow-create-plan` for implementation plans (`openspec-apply-change`, `writing-plans`).
- `aether-workflow-create-task` for task files (`openspec-apply-change`, `writing-plans`).
- `aether-workflow-implement-task` for one scoped task (`openspec-apply-change`, `test-driven-development`, `verification-before-completion`).
- `aether-workflow-validate-task` for validation records (`verification-before-completion`, and `openspec-apply-change` when requirements are affected).
- `aether-workflow-execute-task-loop` for ordered task execution (`subagent-driven-development` or `executing-plans`, plus per-task implement/validate skills).
- `aether-workflow-review-compliance` for spec compliance review (`openspec-apply-change`, `requesting-code-review`).
- `aether-workflow-update-docs-spec` for long-lived docs and main spec sync (`openspec-sync-specs`).
- `aether-workflow-archive-change` for final archive and report (`openspec-archive-change`, `finishing-a-development-branch`).

Each skill names its required project and Superpowers skills. Load them via the host skill mechanism when available, otherwise read the skill's `SKILL.md` and follow it. Do not bypass those skills by hand-writing `openspec/` or `.superpowers/` artifacts unless the required lower-level skill has already been loaded and has established the artifact path and structure, or the workflow explicitly allows a small manual clarification. If a required skill is unavailable, pause and report the missing skill name instead of silently falling back.

Do not introduce large implementation scaffolding until the design documents call for it. Prefer small, traceable documentation edits, keep terminology consistent, and update `CONTRIBUTING.md` or this file when repository workflows change.
