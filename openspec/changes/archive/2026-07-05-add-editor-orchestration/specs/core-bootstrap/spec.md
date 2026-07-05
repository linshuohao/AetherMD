## MODIFIED Requirements

### Requirement: Minimal Core package exists

`@aether-md/core` SHALL provide the minimal package surface required for M1 Core Bootstrap and accepted later capabilities including M4.5 editor orchestration.

References:

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/package-layout.md`
- `docs/architecture/core-api.md`

#### Scenario: Core package exposes M1 bootstrap surface

- **GIVEN** a consumer imports from `@aether-md/core`
- **WHEN** the package is built
- **THEN** the package exposes Manifest, plugin, capability, supported Manifest version, bootstrap runtime, and bootstrap error types required by this spec
- **AND** the package MAY expose Command Bus and Event Hub APIs defined by the `command-event-runtime` capability
- **AND** the package MAY expose document-model and adapter-base types defined by the M3 capabilities
- **AND** the package MAY expose `createEditor`, `AetherEditor`, and `EditorContext` defined by the `editor-orchestration` capability
- **AND** the package does not expose React Shell, Vue Shell, or GFM preset factory implementations

### Requirement: Workspace includes GFM preset package without core re-export

The workspace SHALL include `@aether-md/preset-gfm` at `packages/preset-gfm` while `@aether-md/core` continues to exclude GFM preset implementations from its public export surface.

References:

- `docs/architecture/package-layout.md`
- `docs/engineering/mvp-implementation-plan.md`
- `openspec/specs/adapter-base/spec.md`

#### Scenario: Core package boundary excludes GFM preset implementations

- **GIVEN** M4.5 package-boundary tests run for `@aether-md/core`
- **WHEN** tests inspect public exports
- **THEN** exports MAY include `createEditor`, `AetherEditor`, and `EditorContext`
- **AND** exports do not include React Shell components or GFM preset factory implementations
- **AND** `@aether-md/core` does not declare runtime dependencies on Remark, ProseMirror, React, or Vue packages

#### Scenario: GFM preset package is allowed in workspace verification

- **GIVEN** `@aether-md/preset-gfm` exists at `packages/preset-gfm`
- **WHEN** root workspace verification runs
- **THEN** the preset package is included in the workspace package graph
- **AND** `@aether-md/core` boundary tests do not require the preset package to be absent from the monorepo

### Requirement: M1 excludes later milestone behavior

Core Bootstrap implementation SHALL NOT implement later milestone behavior beyond the M1 bootstrap contract, except where a later accepted capability explicitly adds package surface. M4 adds `@aether-md/preset-gfm` as a workspace package without adding Shell APIs to `@aether-md/core`. M4.5 adds editor orchestration APIs to `@aether-md/core` without adding React or Vue Shell APIs.

References:

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/core-api.md`
- `docs/sdk/lifecycle.md`

#### Scenario: Later milestone APIs are not required for M1 tests

- **GIVEN** M1 Core Bootstrap tests run
- **WHEN** tests validate Manifest loading, dependency validation, lifecycle startup, and dispose
- **THEN** tests do not require Markdown round-trip integration, React Shell, or GFM preset packages unless they intentionally exercise adapter-base, gfm-preset, or editor-orchestration scenarios
- **AND** M1 bootstrap tests do not require Command Bus or Event Hub behavior unless they intentionally exercise the `command-event-runtime` capability
- **AND** M1 bootstrap tests do not require Adapter plugin packages unless they intentionally exercise the `adapter-base` capability

#### Scenario: Core package boundary excludes shell and preset implementation entrypoints

- **GIVEN** M4.5 package-boundary tests run for `@aether-md/core`
- **WHEN** tests inspect public exports
- **THEN** exports include document-model, adapter-base, and editor-orchestration surfaces allowed by M3, M4, and M4.5
- **AND** exports do not include React Shell components or GFM preset factory implementations
- **AND** `@aether-md/core` does not declare runtime dependencies on Remark, ProseMirror, React, or Vue packages
