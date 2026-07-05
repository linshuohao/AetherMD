## ADDED Requirements

### Requirement: Workspace includes GFM preset package without core re-export

The workspace SHALL include `@aether-md/preset-gfm` at `packages/preset-gfm` while `@aether-md/core` continues to exclude GFM preset implementations from its public export surface.

References:

- `docs/architecture/package-layout.md`
- `docs/engineering/mvp-implementation-plan.md`
- `openspec/specs/adapter-base/spec.md`

#### Scenario: Core package boundary excludes GFM preset implementations

- **GIVEN** M4 package-boundary tests run for `@aether-md/core`
- **WHEN** tests inspect public exports
- **THEN** exports do not include `createEditor`, `AetherEditor`, React Shell components, or GFM preset factory implementations
- **AND** `@aether-md/core` does not declare runtime dependencies on Remark, ProseMirror, React, or Vue packages

#### Scenario: GFM preset package is allowed in workspace verification

- **GIVEN** `@aether-md/preset-gfm` exists at `packages/preset-gfm`
- **WHEN** root workspace verification runs
- **THEN** the preset package is included in the workspace package graph
- **AND** `@aether-md/core` boundary tests do not require the preset package to be absent from the monorepo

## MODIFIED Requirements

### Requirement: M1 excludes later milestone behavior

Core Bootstrap implementation SHALL NOT implement later milestone behavior beyond the M1 bootstrap contract, except where a later accepted capability explicitly adds package surface. M4 adds `@aether-md/preset-gfm` as a workspace package without adding editor or Shell APIs to `@aether-md/core`.

References:

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/core-api.md`
- `docs/sdk/lifecycle.md`

#### Scenario: Later milestone APIs are not required for M1 tests

- **GIVEN** M1 Core Bootstrap tests run
- **WHEN** tests validate Manifest loading, dependency validation, lifecycle startup, and dispose
- **THEN** tests do not require Markdown round-trip integration, React Shell, or GFM preset packages unless they intentionally exercise adapter-base or gfm-preset scenarios
- **AND** M1 bootstrap tests do not require Command Bus or Event Hub behavior unless they intentionally exercise the `command-event-runtime` capability
- **AND** M1 bootstrap tests do not require Adapter plugin packages unless they intentionally exercise the `adapter-base` capability

#### Scenario: Core package boundary excludes editor and shell entrypoints

- **GIVEN** M4 package-boundary tests run for `@aether-md/core`
- **WHEN** tests inspect public exports
- **THEN** exports include document-model and adapter-base protocol types allowed by M3 and M4
- **AND** exports do not include `createEditor`, `AetherEditor`, React Shell components, or GFM preset implementations
- **AND** `@aether-md/core` does not declare runtime dependencies on Remark, ProseMirror, React, or Vue packages
