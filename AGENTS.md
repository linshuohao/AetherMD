# Repository Guidelines

## Project Structure & Module Organization

AetherMD is a plugin-oriented Markdown editor microkernel with headless core, GFM preset, React/Vue shells, Instant Morphing surfaces, and integration examples. The repository includes `@aether-md/core`, `@aether-md/plugin-remark` / `@aether-md/plugin-prosemirror` adapter plugin packages, `@aether-md/preset-gfm`, `@aether-md/react`, `@aether-md/vue`, `@aether-md/adapter-contract-tests` (dev-only contract harness), `examples/headless-gfm`, `examples/react`, `examples/vue`, and `examples/shared` (`@aether-md/example-shared` GFM wiring helper) alongside the design documents. The main entry points are:

- `README.md`: project status, goals, and recommended reading paths.
- `CONTRIBUTING.md`: contribution scope and review expectations.
- `package.json`: root workspace scripts for build, typecheck, tests, checks, Changesets, and Git workflow validation.
- `pnpm-workspace.yaml`: workspace boundary for current and future packages.
- `turbo.json`: Turborepo task orchestration for package-level scripts.
- `packages/core/`: microkernel — `src/bootstrap/` (plugin lifecycle), `src/manifest/`, `src/command-event/`, `src/document/`, `src/morphing/` (contracts), `src/editor/` (orchestration).
- `packages/plugins/plugin-remark/` and `packages/plugins/plugin-prosemirror/`: Parser/Serializer and EngineAdapter implementations (flat `src/` at current size).
- `packages/preset-gfm/`: GFM preset factory — `src/morphing/` (strategies), `src/serialization/` (remark re-export outlet).
- `packages/react/`: React Shell — `src/shell/` (Root/Content/hook/GateLock), `src/morphing/` (Instant Morphing / Block Focus surfaces).
- `packages/adapter-contract-tests/`: dev-only shared Parser/Serializer/Engine contract test harness.
- `examples/headless-gfm/`: Node headless GFM demo.
- `examples/react/`: React Shell demo (`AetherShellShowcase` — Content mode + Instant Morphing mode).
- `examples/vue/`: Vue Shell demo (`AetherShellShowcase` — Content mode + GateLock).
- `examples/shared/`: `@aether-md/example-shared` — `createGfmEditorPlugins()` wiring shared by examples.
- `docs/architecture/product-experience-spec.md`: authoritative Instant Morphing / Block Focus product spec.
- `.skills/aether-workflow/`: authoritative source for Aether workflow skills.
- `.codex/skills/` and `.cursor/skills/`: generated host-specific skill mirrors; do not edit Aether workflow mirrors directly.
- `openspec/specs/`: synced main OpenSpec specs, including Core Bootstrap, Command/Event Runtime, Document Model, Adapter Base, GFM Preset, Editor Orchestration, React Shell, Validation Suite, and engineering workflow specs.
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
- `pnpm check`: run workflow skill drift checks, then build, typecheck, and test through the workspace check pipeline.
- `pnpm skills:sync`: regenerate `.codex/skills/aether-workflow-*` and `.cursor/skills/aether-workflow-*` from `.skills/aether-workflow/`.
- `pnpm skills:check`: fail if generated Aether workflow skill mirrors drift from the authoritative source.
- `pnpm core:test`: run the `@aether-md/core` test suite in watchless mode.

For documentation and terminology work, also use:

- `rg "term" docs`: search for related concepts before changing terminology.
- `rg "MUST|SHOULD|MAY" docs`: review RFC-style requirements for consistency.
- `find docs -name "*.md" | sort`: inspect the documentation surface before broad edits.

## Coding Style & Naming Conventions

Write Markdown with clear headings, short paragraphs, and repository-relative links such as `docs/sdk/manifest.md`. Keep filenames lowercase and hyphenated for new docs, for example `docs/engineering/plugin-runtime.md`. Use RFC keywords (`MUST`, `SHOULD`, `MAY`) sparingly and only when the requirement level is intentional. Prefer precise project terms from `docs/glossary.md`.

## Testing Guidelines

Workspace packages use **Vitest** with colocated tests under `src/**/*.test.ts(x)` and shared helpers under `src/testing/`. See [docs/engineering/test-strategy.md](docs/engineering/test-strategy.md) for the full layout contract. Treat review as both design validation and executable contract validation: check that architecture changes remain compatible with `docs/architecture/principles.md`, SDK changes update the relevant `docs/sdk/` contract, runtime behavior changes are reflected in `docs/engineering/`, and Core changes keep `pnpm check` green. For major decisions, add or update an ADR rather than burying rationale in a single topic page.

## Commit & Pull Request Guidelines

Follow `docs/community/git-workflow.md` for branch names, commit messages, PR descriptions, and AI/Codex submission rules. Commit messages should use Conventional Commits, for example `docs(workflow): add git workflow checks`.

Pull requests should focus on one topic, describe whether the change affects architecture, SDK contracts, or engineering strategy, and link any related ADR or discussion. Include screenshots only when changing rendered documentation or diagrams.

## Agent-Specific Instructions

Use the Aether workflow skills before changing architecture, SDK contracts, engineering strategy, OpenSpec artifacts, Superpowers artifacts, implementation code, or long-lived project documentation. Skills are host-agnostic and authored under `.skills/aether-workflow/`; `.cursor/skills/` and `.codex/skills/` contain generated mirrors. Start with `aether-workflow-discover-context` when the step is unclear, then use the matching `aether-workflow-*` skill for the current workflow stage:

- `aether-workflow-discover-context` for path classification (Maintenance / Quick Change / Spec Change / Full Change) and source docs.
- `aether-workflow-quick-change` for scoped Quick Change execution with PR traceability.
- `aether-workflow-create-spec-change` for lightweight Spec Change artifacts (change-brief + delta + single task).
- `aether-workflow-execute-spec-change` for Spec Change single-task execution, validation, review, and archive.
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

For non-trivial workflow changes, prepare a scoped branch before writing OpenSpec, Superpowers, implementation, or long-lived documentation artifacts. If currently on `main`, create a branch that follows `docs/community/git-workflow.md`, preferably `<type>/<openspec-change-name>`, after confirming `git status --short` has no unrelated dirty files.

When editing Aether workflow skills, modify `.skills/aether-workflow/` first, then run `pnpm skills:sync` and `pnpm skills:check`. Mirror-only edits under `.codex/skills/aether-workflow-*` or `.cursor/skills/aether-workflow-*` should be treated as generated-output drift unless explicitly repairing generated files.

Do not introduce large implementation scaffolding until the design documents call for it. Prefer small, traceable documentation edits, keep terminology consistent, and update `CONTRIBUTING.md` or this file when repository workflows change.
