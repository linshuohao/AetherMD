# Adapter Base Spec

## Purpose

M3 Adapter baseline: protocol types and error classes in `@aether-md/core`, minimal Remark and ProseMirror plugin packages, and parse → edit → serialize round-trip verification without `createEditor`, React Shell, or Command Bus automatic rollback.

## Requirements

### Requirement: Adapter protocol types are exported from core

`@aether-md/core` SHALL export `ParserAdapter`, `SerializerAdapter`, and `EngineAdapter` protocol types aligned with `docs/engineering/adapter-protocol.md`.

References:

- `docs/engineering/adapter-protocol.md`
- `docs/architecture/principles.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`

#### Scenario: Consumer imports Adapter protocol interfaces

- **GIVEN** a consumer imports from `@aether-md/core`
- **WHEN** the M3 package is built
- **THEN** the package exposes `ParserAdapter`, `SerializerAdapter`, and `EngineAdapter`
- **AND** the package exposes supporting types including `EngineSession`, `AdapterCommandRequest`, `AdapterTransactionResult`, and `AdapterEvent` as required by the protocol

#### Scenario: EngineSession remains adapter-private

- **GIVEN** an `EngineAdapter` creates an `EngineSession`
- **WHEN** Core or tests receive the session handle
- **THEN** the protocol does not require consumers to read private session internals
- **AND** document state is read through `getDocument(session)`

### Requirement: AdapterError and SerializationError are exported

`@aether-md/core` SHALL export instantiable `AdapterError` and `SerializationError` types aligned with `docs/engineering/error-model.md`.

References:

- `docs/engineering/error-model.md`
- `docs/engineering/adapter-protocol.md`

#### Scenario: Adapter failure uses AdapterError shape

- **GIVEN** an Adapter operation fails in M3
- **WHEN** the failure is surfaced through `AdapterTransactionResult` or Serializer error paths
- **THEN** the error conforms to `AdapterError` or `SerializationError` with the correct `source` and reviewable `code` and `message`
- **AND** the failure does not throw uncaught exceptions to the test harness or host

### Requirement: Remark plugin package provides Parser and Serializer adapters

The workspace SHALL include `@aether-md/plugin-remark` at `packages/plugins/plugin-remark` implementing `ParserAdapter` and `SerializerAdapter` without placing Remark dependencies in `@aether-md/core`.

References:

- `docs/architecture/package-layout.md`
- `docs/engineering/adapter-protocol.md`
- `docs/architecture/compatibility.md`

#### Scenario: Remark parser returns AetherDoc

- **GIVEN** `@aether-md/plugin-remark` is built
- **WHEN** `ParserAdapter.parse` is called with M3 sample Markdown containing a paragraph or heading
- **THEN** the result is a framework-independent `AetherDoc`
- **AND** unrecognized syntax is preserved as paragraph or text rather than silently dropped

#### Scenario: Remark serializer produces deterministic Markdown for M3 subset

- **GIVEN** an `AetherDoc` containing M3-supported paragraph and heading blocks
- **WHEN** `SerializerAdapter.serialize` is called
- **THEN** the output is a deterministic Markdown string for the M3 test matrix

### Requirement: ProseMirror plugin package provides Engine adapter

The workspace SHALL include `@aether-md/plugin-prosemirror` at `packages/plugins/plugin-prosemirror` implementing `EngineAdapter` without placing ProseMirror dependencies in `@aether-md/core`.

References:

- `docs/architecture/package-layout.md`
- `docs/engineering/adapter-protocol.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`

#### Scenario: Engine adapter creates editable session

- **GIVEN** `@aether-md/plugin-prosemirror` is built
- **WHEN** `EngineAdapter.create` is called with an initial `AetherDoc`
- **THEN** it returns an `EngineSession`
- **AND** `getDocument(session)` returns an `AetherDoc` snapshot equivalent to the initial document for M3 smoke fixtures

#### Scenario: Successful apply returns updated document snapshot

- **GIVEN** an active `EngineSession`
- **WHEN** `EngineAdapter.apply` runs a supported M3 edit request successfully
- **THEN** `AdapterTransactionResult.ok` is `true`
- **AND** the result includes the latest `AetherDoc` snapshot reflecting the edit

#### Scenario: Failed apply does not corrupt visible document snapshot

- **GIVEN** an active `EngineSession` with a known document snapshot before `apply`
- **WHEN** `EngineAdapter.apply` fails
- **THEN** `AdapterTransactionResult.ok` is `false`
- **AND** `getDocument(session)` still returns the pre-apply snapshot
- **AND** the result includes an `AdapterError`

#### Scenario: Engine session can be disposed safely

- **GIVEN** an active `EngineSession`
- **WHEN** `EngineAdapter.dispose` is called
- **THEN** adapter resources are released
- **AND** repeated dispose is either a no-op or a safe rejection that is test-covered

### Requirement: M3 minimal Markdown round-trip is verified

The M3 implementation SHALL verify a minimal Markdown round-trip across remark and prosemirror adapter packages.

References:

- `docs/engineering/mvp-implementation-plan.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/data-flow.md`

#### Scenario: Paragraph round-trip through parse edit serialize

- **GIVEN** M3 adapter packages are built
- **WHEN** a paragraph Markdown sample is parsed, edited through `EngineAdapter.apply`, and serialized
- **THEN** the pipeline completes without requiring `createEditor`, React Shell, or GFM preset packages
- **AND** the final Markdown reflects the applied edit predictably

#### Scenario: Heading and paragraph round-trip is supported

- **GIVEN** M3 adapter packages are built
- **WHEN** a Markdown sample containing a heading and paragraph is parsed, edited, and serialized
- **THEN** the round-trip test passes using the M3 minimal syntax subset
- **AND** the test does not require full GFM syntax coverage

### Requirement: Adapter packages participate in workspace verification

Each new Adapter package SHALL provide `build`, `typecheck`, and `test` scripts compatible with the root `pnpm check` pipeline.

References:

- `docs/architecture/package-layout.md`
- `docs/engineering/test-strategy.md`

#### Scenario: Root check includes adapter packages

- **GIVEN** M3 adapter packages exist in the workspace
- **WHEN** `pnpm check` runs at the repository root
- **THEN** adapter package build, typecheck, and tests are executed through the workspace pipeline

### Requirement: M3 does not integrate Command Bus automatic rollback

M3 SHALL NOT require `createCommandEventRuntime.dispatch` to invoke Adapter rollback or emit `transactionFailed` automatically.

References:

- `openspec/specs/command-event-runtime/spec.md`
- `docs/engineering/adapter-protocol.md`
- `docs/sdk/command-event-protocol.md`

#### Scenario: Command Event runtime remains independent

- **GIVEN** M3 implementation is complete
- **WHEN** only `@aether-md/core` Command/Event tests run
- **THEN** they do not require Adapter packages or document snapshots beyond existing M2 behavior
- **AND** Adapter rollback semantics are validated through Adapter contract tests rather than Command Bus integration
