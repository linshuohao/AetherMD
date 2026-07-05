# Command Event Runtime Spec

## Purpose

Minimal Command Bus and Event Hub runtime in `@aether-md/core` for M2: synchronous command registration and dispatch, reviewable `CommandResult`, Event Hub subscribe/emit/unsubscribe, handler error isolation, and disposed fail-closed behavior. Independent of `bootstrapCore`, Adapter, Markdown, and Shell.

## Requirements

### Requirement: Command and Event public types are exported

`@aether-md/core` SHALL export the minimal public Command/Event types required by M2.

References:

- `docs/sdk/command-event-protocol.md`
- `docs/architecture/core-api.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: Consumer imports Command and Event types

- **GIVEN** a consumer imports from `@aether-md/core`
- **WHEN** the M2 package is built
- **THEN** the package exposes `CommandId`, `CommandRequest`, `CommandMeta`, `CommandResult`, `EventName`, `EventEnvelope`, `CommandHandler`, `EventListener`, and `Unsubscribe` types required by this spec

### Requirement: CommandEventRuntime public API is exported

`@aether-md/core` SHALL export `createCommandEventRuntime` and a `CommandEventRuntime` surface with `register`, `dispatch`, `on`, `emit`, and `dispose`.

References:

- `docs/architecture/core-api.md`
- `docs/sdk/command-event-protocol.md`
- `docs/sdk/commands.md`

#### Scenario: Consumer creates an independent runtime

- **GIVEN** a consumer imports `createCommandEventRuntime` from `@aether-md/core`
- **WHEN** the factory is called
- **THEN** it returns a runtime that exposes `register`, `dispatch`, `on`, `emit`, and `dispose`
- **AND** creation does not require `bootstrapCore`, Adapter, Markdown, or Shell packages

### Requirement: Synchronous command handlers can be registered and dispatched

Core SHALL provide a Command/Event runtime that supports synchronous command handler registration and synchronous `dispatch`.

References:

- `docs/sdk/commands.md`
- `docs/sdk/command-event-protocol.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: Registered handler receives dispatch

- **GIVEN** a Command/Event runtime has a handler registered for a `CommandId`
- **WHEN** `dispatch` is called with a matching `CommandRequest`
- **THEN** the registered handler runs synchronously
- **AND** `dispatch` returns a `CommandResult` without requiring Adapter, Markdown, or Shell packages

#### Scenario: Unknown command returns failure result

- **GIVEN** a Command/Event runtime has no handler for a `CommandId`
- **WHEN** `dispatch` is called with that `CommandId`
- **THEN** `dispatch` returns `{ ok: false }` with a reviewable error whose `source` is `core`
- **AND** the call does not throw to the host

#### Scenario: Command priority metadata is ignored

- **GIVEN** a `CommandRequest` includes `meta.priority`
- **WHEN** `dispatch` runs on the M2 runtime
- **THEN** execution order does not depend on `priority`
- **AND** no Command Queue priority or coalescing behavior is required

#### Scenario: Dispatch uses error-boundary middleware only

- **GIVEN** a Command/Event runtime
- **WHEN** `dispatch` runs
- **THEN** handler execution is wrapped by the runtime error boundary
- **AND** M2 does not require ReadOnlyGuard, CapabilityGuard, PermissionGuard, HistoryCapture, or TelemetrySpan

### Requirement: CommandResult reports success and failure

`dispatch` SHALL return a `CommandResult` that distinguishes success from failure.

References:

- `docs/sdk/command-event-protocol.md`
- `docs/engineering/error-model.md`

#### Scenario: Successful handler returns ok result

- **GIVEN** a registered handler completes without throwing and does not return `false`
- **WHEN** `dispatch` runs
- **THEN** the `CommandResult` has `ok: true`
- **AND** any handler return value may be exposed as `value`

#### Scenario: Handler returning false becomes failed result

- **GIVEN** a registered handler returns `false`
- **WHEN** `dispatch` runs
- **THEN** the `CommandResult` has `ok: false`
- **AND** the failure is not treated as an exception

### Requirement: Event Hub supports subscribe emit and unsubscribe

Core SHALL provide an Event Hub with `on`, `emit`, and unsubscribe behavior using `EventEnvelope`.

References:

- `docs/sdk/command-event-protocol.md`
- `docs/architecture/core-api.md`

#### Scenario: Listener receives emitted event

- **GIVEN** a listener is registered with `on` for an `EventName`
- **WHEN** `emit` is called with a matching `EventEnvelope`
- **THEN** the listener receives that envelope
- **AND** the envelope includes `name`, `source`, and `timestamp`

#### Scenario: Unsubscribe stops delivery

- **GIVEN** a listener was registered with `on` and then unsubscribed via the returned `Unsubscribe`
- **WHEN** `emit` is called for the same `EventName`
- **THEN** the unsubscribed listener is not invoked

#### Scenario: Change and error events can be emitted

- **GIVEN** a Command/Event runtime Event Hub
- **WHEN** `emit` is called with `name: 'change'` or `name: 'pluginError'`
- **THEN** subscribed listeners receive the event
- **AND** M2 does not require Adapter-backed document snapshots to emit `change`

#### Scenario: Event payload is JSON serializable

- **GIVEN** an `EventEnvelope` with a `payload`
- **WHEN** `emit` delivers the event to listeners
- **THEN** the payload is JSON-serializable
- **AND** M2 does not require internal non-serializable event payloads

### Requirement: Handler errors become reviewable failure results

When a command handler throws, the runtime SHALL convert the failure into a reviewable `CommandResult` and SHALL NOT let the exception escape `dispatch`. M2 SHALL NOT require Adapter transaction rollback.

References:

- `docs/engineering/error-model.md`
- `docs/engineering/test-strategy.md`
- `docs/sdk/command-event-protocol.md`

#### Scenario: Thrown handler error is isolated

- **GIVEN** a registered handler throws during `dispatch`
- **WHEN** `dispatch` completes
- **THEN** the `CommandResult` has `ok: false`
- **AND** `error` has `source: 'plugin'` and `severity: 'recoverable'`
- **AND** `dispatch` does not throw to the host
- **AND** no Adapter transaction rollback is required

#### Scenario: Thrown handler error emits pluginError event

- **GIVEN** a listener is subscribed to `pluginError`
- **AND** a registered handler throws during `dispatch`
- **WHEN** `dispatch` completes
- **THEN** the listener receives a `pluginError` `EventEnvelope`
- **AND** the envelope payload includes a reviewable `error`

### Requirement: Disposed runtime rejects further command dispatch

After `dispose`, the Command/Event runtime SHALL reject further `dispatch` calls with a reviewable failure result and SHALL stop event delivery.

References:

- `docs/architecture/core-api.md`
- `docs/sdk/lifecycle.md`

#### Scenario: Dispatch after dispose fails closed

- **GIVEN** a Command/Event runtime has completed `dispose`
- **WHEN** `dispatch` is called again
- **THEN** the call returns `{ ok: false }` with a reviewable error whose `source` is `core`
- **AND** registered handlers are not invoked
- **AND** the call does not throw to the host

#### Scenario: Emit after dispose is a no-op

- **GIVEN** a Command/Event runtime has completed `dispose`
- **AND** a listener was previously subscribed
- **WHEN** `emit` is called
- **THEN** the listener is not invoked

#### Scenario: Repeated dispose is a no-op

- **GIVEN** a Command/Event runtime has completed `dispose`
- **WHEN** `dispose` is called again
- **THEN** the second call does not throw
- **AND** this runtime-level behavior does not define `bootstrapCore` dispose public-contract follow-up

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
