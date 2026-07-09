# Proposal: Core API subpath exports

## Why

The flat `@aether-md/core` barrel mixes host, plugin, adapter, and internal building blocks in one autocomplete surface. This raises cognitive load and leaks implementation factories (`createHistoryService`, `bootstrapCore`, etc.) that are not part of any stable consumer contract.

## What changes

- Split `@aether-md/core` public surface into role-based subpaths: default (host), `/plugin`, `/adapter`, `/document`, `/testing`.
- Root export (`@aether-md/core`) exposes **host-only** symbols (~15).
- Move `bootstrapCore` and `createCommandEventRuntime` to `@aether-md/core/testing`.
- Remove service factories and telemetry noop helpers from public exports.
- Migrate monorepo imports and update SDK / Core API docs.

## Non-goals

- No behavior change to `createEditor`, Command Bus, or Adapter protocols.
- No new npm packages (`@aether-md/sdk` remains deferred per ADR 009).
- No React/Vue Shell API changes beyond import path updates.

## Source docs

- `docs/architecture/core-api.md`
- `docs/architecture/principles.md`
- `docs/sdk/overview.md`
- `docs/architecture/compatibility.md`

## Affected contracts

- `@aether-md/core` package `exports` map (breaking, pre-1.0)
- Core Bootstrap package boundary requirements
- Plugin SDK type entry documentation

## Acceptance criteria

- `import { createEditor } from '@aether-md/core'` works; root no longer exports `bootstrapCore` or service factories.
- Plugin packages import from `@aether-md/core/plugin` and `@aether-md/core/adapter` / `document` as appropriate.
- `pnpm check` passes including package-boundary tests per subpath.
- `docs/architecture/core-api.md` and `docs/sdk/overview.md` document role-based import paths.

## Branch

`refactor/core-api-subpaths`

## Version impact

Minor-level breaking export reorganization on `@aether-md/core` (workspace 0.0.0).
