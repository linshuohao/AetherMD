## ADDED Requirements

### Requirement: Standalone Command Event runtime remains independent from editor orchestration

`createCommandEventRuntime()` SHALL retain M2 synchronous behavior, error-boundary-only middleware, and disposed fail-closed semantics. Editor orchestration MAY reuse internal runtime implementation but SHALL NOT change standalone M2 public behavior or tests.

References:

- `docs/architecture/core-api.md`
- `docs/sdk/command-event-protocol.md`
- `openspec/changes/add-editor-orchestration/design.md`

#### Scenario: createCommandEventRuntime works without editor packages

- **GIVEN** a consumer imports `createCommandEventRuntime` from `@aether-md/core`
- **WHEN** the factory is called and used without `createEditor`
- **THEN** register, dispatch, on, emit, and dispose behave per M2 requirements
- **AND** creation does not require Adapter, Markdown, preset, or Shell packages

#### Scenario: M2 tests do not require createEditor

- **GIVEN** M2 Command/Event regression tests run
- **WHEN** package exports and runtime behavior are validated
- **THEN** tests pass without importing `createEditor`, `@aether-md/preset-gfm`, or adapter plugin packages
- **AND** M2 behavior is not regressed by editor orchestration implementation

### Requirement: Editor integrated dispatch extends Command Event semantics without replacing M2 API

`AetherEditor.dispatch` SHALL return `Promise<CommandResult>`, integrate with an editor-scoped Command/Event runtime, and preserve M2 handler error isolation for plugin-registered commands. Engine-bound orchestration rollback and lifecycle events are defined by the `editor-orchestration` capability and SHALL NOT alter raw `createCommandEventRuntime.dispatch` requirements.

References:

- `docs/architecture/core-api.md`
- `docs/sdk/command-event-protocol.md`
- `docs/engineering/data-flow.md`

#### Scenario: plugin command errors remain isolated in editor dispatch

- **GIVEN** a running `AetherEditor` with a plugin-registered command handler that throws
- **WHEN** the host calls `dispatch` for that command
- **THEN** the Promise resolves to `{ ok: false }` with a plugin-sourced error
- **AND** a `pluginError` event is emitted
- **AND** the host does not receive an uncaught exception

#### Scenario: editor lifecycle events are distinct from standalone runtime dispose

- **GIVEN** a standalone `CommandEventRuntime` created through `createCommandEventRuntime`
- **WHEN** only M2 behavior is exercised
- **THEN** dispose does not emit editor lifecycle `ready` or `disposed` events
- **AND** editor lifecycle events are emitted only through `createEditor` / `AetherEditor` orchestration

## MODIFIED Requirements

### Requirement: M2 package boundary excludes later milestones

The Command/Event runtime implementation SHALL NOT require Adapter, Markdown, Shell, or preset packages for standalone M2 usage. M4.5 editor orchestration APIs MAY coexist in `@aether-md/core` exports without requiring standalone M2 tests to import those later packages.

References:

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/core-api.md`
- `docs/engineering/test-strategy.md`

#### Scenario: Later milestone APIs remain out of standalone M2 package surface tests

- **GIVEN** M2 Command/Event tests run
- **WHEN** package exports and tests are validated for standalone runtime usage
- **THEN** `createCommandEventRuntime`, Command Bus, and Event Hub APIs are available
- **AND** tests do not require Adapter creation, Markdown parsing, Markdown serialization, React Shell, Remark, ProseMirror, or GFM preset packages
- **AND** standalone M2 tests do not require calling `createEditor`

#### Scenario: M1 follow-ups remain out of this capability

- **GIVEN** M2 Command/Event requirements are implemented
- **WHEN** scope is reviewed against M1 follow-ups
- **THEN** duplicate `metadata.name` handling is not required
- **AND** partial startup cleanup is not required
- **AND** documenting `bootstrapCore` dispose idempotency as a public contract is not required
