## MODIFIED Requirements

### Requirement: Minimal Core package exists

`@aether-md/core` SHALL provide the minimal package surface required for M1 Core Bootstrap.

References:

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/package-layout.md`
- `docs/architecture/core-api.md`

#### Scenario: Core package exposes M1 bootstrap surface

- **GIVEN** a consumer imports from `@aether-md/core`
- **WHEN** the package is built
- **THEN** the package exposes Manifest, plugin, capability, supported Manifest version, bootstrap runtime, and bootstrap error types required by this spec
- **AND** the package MAY expose Command Bus and Event Hub APIs defined by the `command-event-runtime` capability
- **AND** the package does not expose Adapter, Markdown parse/serialize, React Shell, Remark, ProseMirror, or GFM preset APIs

### Requirement: M1 excludes later milestone behavior

Core Bootstrap implementation SHALL NOT implement later milestone behavior beyond the M1 bootstrap contract, except where a later accepted capability explicitly adds package surface.

References:

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/core-api.md`
- `docs/sdk/lifecycle.md`

#### Scenario: Later milestone APIs are not required for M1 tests

- **GIVEN** M1 Core Bootstrap tests run
- **WHEN** tests validate Manifest loading, dependency validation, lifecycle startup, and dispose
- **THEN** tests do not require Adapter creation, Markdown parsing, Markdown serialization, React Shell, Remark, ProseMirror, or GFM preset packages
- **AND** M1 bootstrap tests do not require Command Bus or Event Hub behavior unless they intentionally exercise the `command-event-runtime` capability
