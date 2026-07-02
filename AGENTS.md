# Repository Guidelines

## Project Structure & Module Organization

AetherMD is currently a design-stage repository for a framework-independent, plugin-oriented Markdown editor engine. There is no implementation source tree yet. The main entry points are:

- `README.md`: project status, goals, and recommended reading paths.
- `CONTRIBUTING.md`: contribution scope and review expectations.
- `docs/architecture/`: long-term principles, boundaries, roadmap, and compatibility notes.
- `docs/sdk/`: public Plugin SDK contracts, manifests, commands, lifecycle, and examples.
- `docs/engineering/`: runtime strategy, data flow, concurrency, security, observability, and error handling.
- `docs/adr/`: architecture decision records. Use `docs/templates/adr.md` for new decisions.
- `docs/glossary.md`: canonical terminology. Keep new terms aligned with it.

## Build, Test, and Development Commands

No build system or automated test runner is defined yet. For now, validate changes with documentation checks:

- `rg "term" docs`: search for related concepts before changing terminology.
- `rg "MUST|SHOULD|MAY" docs`: review RFC-style requirements for consistency.
- `find docs -name "*.md" | sort`: inspect the documentation surface before broad edits.

When code is introduced later, add the relevant install, build, lint, and test commands here.

## Coding Style & Naming Conventions

Write Markdown with clear headings, short paragraphs, and repository-relative links such as `docs/sdk/manifest.md`. Keep filenames lowercase and hyphenated for new docs, for example `docs/engineering/plugin-runtime.md`. Use RFC keywords (`MUST`, `SHOULD`, `MAY`) sparingly and only when the requirement level is intentional. Prefer precise project terms from `docs/glossary.md`.

## Testing Guidelines

There are no executable tests yet. Treat review as design validation: check that architecture changes remain compatible with `docs/architecture/principles.md`, SDK changes update the relevant `docs/sdk/` contract, and runtime behavior changes are reflected in `docs/engineering/`. For major decisions, add or update an ADR rather than burying rationale in a single topic page.

## Commit & Pull Request Guidelines

Git history is not available in this checkout, so no existing commit convention can be inferred. Use concise, imperative commit subjects such as `Clarify manifest capability model` or `Add ADR for command queue errors`.

Pull requests should focus on one topic, describe whether the change affects architecture, SDK contracts, or engineering strategy, and link any related ADR or discussion. Include screenshots only when changing rendered documentation or diagrams.

## Agent-Specific Instructions

Do not introduce large implementation scaffolding until the design documents call for it. Prefer small, traceable documentation edits, keep terminology consistent, and update `CONTRIBUTING.md` or this file when repository workflows change.
