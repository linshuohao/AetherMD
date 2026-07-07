# Editor Orchestration Spec

## Purpose

M4.5 editor orchestration in `@aether-md/core`: headless `createEditor` / `AetherEditor` entry, explicit Adapter wiring, editor-scoped Command/Event integration, minimal engine dispatch rollback, lifecycle events, and headless GFM preset integration tests without React Shell or DOM.

## Requirements

### Requirement: createEditor public entry is exported from core

`@aether-md/core` SHALL export `createEditor(config: EditorConfig): Promise<AetherEditor>` aligned with `docs/architecture/core-api.md`. Startup SHALL validate plugin Manifests, resolve Service Capabilities, wire Parser / Serializer / Engine adapters explicitly, run lifecycle through `bootstrapCore`, and reject startup failures with `CoreError`.

References:

- `docs/architecture/core-api.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/engineering/adapter-protocol.md`
- `docs/sdk/manifest.md`
- `docs/sdk/lifecycle.md`

#### Scenario: createEditor resolves AetherEditor on successful startup

- **GIVEN** a valid `EditorConfig` with plugins that provide required Parser, Serializer, and Engine adapters
- **WHEN** `createEditor(config)` is called
- **THEN** the returned Promise resolves to an `AetherEditor` instance
- **AND** the editor exposes `context`, `state`, `dispatch`, `on`, `getMarkdown`, `getDocument`, and `dispose`

#### Scenario: createEditor rejects startup failures with CoreError

- **GIVEN** an `EditorConfig` with unsupported manifest version, missing required capabilities, or lifecycle startup failure
- **WHEN** `createEditor(config)` is called
- **THEN** the returned Promise is rejected with `CoreError`
- **AND** no running `AetherEditor` is returned to the host

#### Scenario: createEditor accepts async-only entry

- **GIVEN** M4.5 Phase 0 frozen decision for async-only editor creation
- **WHEN** consumers integrate with `@aether-md/core`
- **THEN** `createEditor` is the sole v1.0 editor factory entry
- **AND** no synchronous lightweight `createEditorSync` or equivalent parallel entry is exported

### Requirement: AetherEditor exposes host document and lifecycle APIs

`AetherEditor` SHALL expose host-level `getDocument(): AetherDoc` and `getMarkdown(): Promise<string>` distinct from `EngineAdapter.getDocument(session)`. `getDocument` SHALL return a read-only or immutable snapshot. `dispose()` SHALL run plugin cleanup in reverse lifecycle order and fail-closed subsequent `dispatch` calls.

References:

- `docs/architecture/core-api.md`
- `docs/engineering/data-flow.md`

#### Scenario: getDocument returns core-visible snapshot

- **GIVEN** a running `AetherEditor` initialized with Markdown or `AetherDoc`
- **WHEN** the host calls `getDocument()`
- **THEN** the result is a framework-independent `AetherDoc` snapshot
- **AND** the snapshot reflects the latest successful orchestration-visible document state

#### Scenario: getMarkdown serializes current document

- **GIVEN** a running `AetherEditor` with a current document snapshot
- **WHEN** the host calls `getMarkdown()`
- **THEN** the returned Promise resolves to a Markdown string produced through the wired Serializer adapter
- **AND** the call does not require React Shell or DOM APIs

#### Scenario: dispose fails closed for subsequent dispatch

- **GIVEN** an `AetherEditor` that has completed `dispose()`
- **WHEN** the host calls `dispatch` again
- **THEN** the call returns a failure result or rejects with `CoreError`
- **AND** lifecycle cleanup is not invoked a second time

### Requirement: EditorStateSnapshot is read-only without Core store

`AetherEditor.state` SHALL expose a read-only `EditorStateSnapshot` without a Core-level subscribe or reactive store API. Shells SHALL observe changes through Event Hub `on('change', ...)`. React Shell (`@aether-md/react`) SHALL bridge `change` events into framework-local state (for example `markdown` and `doc` in `useAetherEditor`) without introducing a Shell Adapter abstraction layer or Core-level store APIs.

References:

- `docs/architecture/core-api.md`
- `docs/architecture/principles.md`
- `docs/sdk/command-event-protocol.md`
- `docs/engineering/data-flow.md`

#### Scenario: state exposes snapshot fields only

- **GIVEN** a running `AetherEditor`
- **WHEN** the host reads `editor.state`
- **THEN** the snapshot includes at least the current `doc` and `readOnly` flag
- **AND** the Core export surface does not include a subscribe, store, or observable API for editor state

#### Scenario: React Shell bridges change without Core store

- **GIVEN** a running `AetherEditor` mounted through `@aether-md/react`
- **WHEN** the editor emits a `change` event after a successful edit
- **THEN** `useAetherEditor` updates React-local `markdown` and `doc` state from the event and editor APIs
- **AND** `@aether-md/core` does not export a new subscribe or store API

#### Scenario: React Shell does not introduce Shell Adapter in core orchestration

- **GIVEN** M5 React Shell integration with `createEditor`
- **WHEN** consumers inspect `@aether-md/core` editor orchestration exports and behavior
- **THEN** `createEditor` and `AetherEditor` behavior remain unchanged from M4.5
- **AND** no Shell Adapter protocol is added to `@aether-md/core`

### Requirement: EditorContext exposes minimal orchestration services

`AetherEditor.context` SHALL expose `commands`, `events`, `logger`, `grantedPermissions`, and wired `services.engine` and `services.parser` aligned with `docs/sdk/editor-context.md`. M4.5 MAY expose no-op stubs for `history`, `selection`, `clipboard`, `assets`, and `telemetry` without implementing full service semantics.

References:

- `docs/sdk/editor-context.md`
- `docs/architecture/core-api.md`

#### Scenario: context exposes command and event services

- **GIVEN** a running `AetherEditor` created through `createEditor`
- **WHEN** a plugin or host reads `editor.context`
- **THEN** `commands` and `events` are available for registration and subscription
- **AND** custom business services are not registered on the context

### Requirement: Editor orchestration wires adapters explicitly

Editor orchestration SHALL resolve Parser, Serializer, and Engine adapters from loaded plugin entries or preset factories without `bootstrapCore` silent provide of `core:engine` or `core:parser`. `@aether-md/core` SHALL NOT declare runtime dependencies on Remark, ProseMirror, or React.

References:

- `docs/architecture/core-api.md`
- `docs/engineering/adapter-protocol.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`

#### Scenario: adapters are wired without bootstrap silent provide

- **GIVEN** `createEditor` startup with plugins that declare adapter capabilities
- **WHEN** orchestration resolves adapters
- **THEN** Parser, Serializer, and Engine instances are held by the editor orchestration layer
- **AND** `bootstrapCore` does not silently provide `core:engine` or `core:parser`

#### Scenario: Markdown initialValue uses Parser adapter

- **GIVEN** an `EditorConfig` with `initialValue` as a Markdown string
- **WHEN** `createEditor` completes startup
- **THEN** the initial engine session is created from an `AetherDoc` produced by the wired Parser adapter
- **AND** the host receives a running editor without calling Parser APIs directly

### Requirement: Editor dispatch orchestrates engine apply with minimal rollback

`AetherEditor.dispatch` SHALL return `Promise<CommandResult>`, route engine-bound commands through `EngineAdapter.apply`, save a pre-apply document snapshot, restore the snapshot on apply failure, emit `transactionFailed` on failure, and emit `change` with `{ doc, markdown? }` on successful document updates.

References:

- `docs/engineering/adapter-protocol.md`
- `docs/engineering/data-flow.md`
- `docs/sdk/command-event-protocol.md`

#### Scenario: successful engine dispatch updates snapshot and emits change

- **GIVEN** a running `AetherEditor` with an active engine session
- **WHEN** `dispatch` runs a supported engine-bound command successfully
- **THEN** `getDocument()` reflects the updated document
- **AND** a `change` event is emitted with a payload containing the updated `doc`

#### Scenario: failed engine dispatch restores snapshot and emits transactionFailed

- **GIVEN** a running `AetherEditor` with a known pre-dispatch document snapshot
- **WHEN** `dispatch` runs an engine-bound command that fails at `EngineAdapter.apply`
- **THEN** `getDocument()` matches the pre-dispatch snapshot
- **AND** a `transactionFailed` event is emitted with `{ commandId, error }`
- **AND** `dispatch` resolves to `{ ok: false }` without throwing to the host

### Requirement: Editor lifecycle emits ready and disposed events

Editor orchestration SHALL emit `ready` after successful startup and `disposed` after successful editor disposal.

References:

- `docs/sdk/command-event-protocol.md`
- `docs/sdk/lifecycle.md`

#### Scenario: ready event fires after startup

- **GIVEN** a valid `EditorConfig`
- **WHEN** `createEditor` completes startup successfully
- **THEN** listeners receive a `ready` event before the host uses the editor for editing

#### Scenario: disposed event fires after dispose

- **GIVEN** a running `AetherEditor` with a `disposed` listener registered
- **WHEN** `dispose()` completes successfully
- **THEN** the listener receives a `disposed` event

### Requirement: Headless GFM preset integration is verified through createEditor

M4.5 SHALL include integration tests that verify GFM Markdown round-trip through `createEditor` with `@aether-md/preset-gfm` without React Shell, DOM, or UI.

References:

- `docs/engineering/test-strategy.md`
- `docs/architecture/package-layout.md`
- `openspec/specs/gfm-preset/spec.md`

#### Scenario: createEditor with GFM preset completes headless round-trip

- **GIVEN** `@aether-md/preset-gfm` is available in the workspace
- **WHEN** a test calls `createEditor({ plugins: [createGfmPreset()], initialValue: <GFM markdown> })`
- **THEN** the test receives a running `AetherEditor`
- **AND** after a minimal successful `dispatch`, `getMarkdown()` and `getDocument()` reflect the edited GFM document predictably
- **AND** the test does not import React, Vue, or DOM APIs

#### Scenario: createEditor integration test uses no UI

- **GIVEN** M4.5 editor orchestration integration tests
- **WHEN** tests run in CI through `pnpm check`
- **THEN** they execute in Node without browser or React mounting
- **AND** they assert orchestration behavior rather than Shell rendering

### Requirement: Runtime command conflicts use default ConflictResolver only

M4.5 SHALL use `createDefaultConflictResolver()` for runtime command registration conflicts only. M4.5 SHALL NOT implement compile-layer schema or keymap merging or host-injected custom ConflictResolver.

References:

- `docs/engineering/conflict-resolver.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: duplicate runtime command registration is resolved by default strategy

- **GIVEN** two plugins register the same runtime command id during editor startup
- **WHEN** orchestration merges runtime commands
- **THEN** `createDefaultConflictResolver()` applies the default `command: last-wins` strategy
- **AND** startup does not silently drop both handlers without reviewable resolution

#### Scenario: compile-layer merge remains out of scope

- **GIVEN** M4.5 editor orchestration startup
- **WHEN** plugin Manifests include compile-layer schema or keymap declarations
- **THEN** M4.5 does not merge compile-layer schema or keymaps
- **AND** absence of compile-layer merge does not block headless GFM smoke tests

### Requirement: Parse-block markdown command is handled via runtime registration

Editor orchestration SHALL NOT hardcode markdown block parsing in `createEditor`. The `core:parseBlockMarkdown` command SHALL be registered by `@aether-md/preset-gfm` (or successor plugin) and routed through the standard command runtime pipeline. Core dispatch SHALL NOT contain a dedicated parse-block bypass branch.

References:

- `openspec/specs/core-bootstrap/spec.md`
- `docs/architecture/principles.md`

#### Scenario: Preset provides parse-block command

- **WHEN** GFM preset is loaded
- **THEN** dispatching `core:parseBlockMarkdown` returns the first parsed block via preset-registered handler
- **AND** Core does not import parse-block payload types in public API

#### Scenario: Parse command is overrideable through runtime registration

- **GIVEN** a runtime command handler is registered for `core:parseBlockMarkdown`
- **WHEN** `AetherEditor.dispatch` receives that command
- **THEN** command execution follows registered runtime routing
- **AND** runtime conflict/override behavior applies consistently with other commands

### Requirement: Startup manifest validation executes once in canonical editor path

`createEditor` SHALL perform manifest loading, uniqueness validation, capability validation, and dependency ordering once, and pass prepared plugin order into bootstrap lifecycle startup. Lifecycle startup SHALL reuse this prepared order without re-running the same validation stage.

References:

- `openspec/specs/core-bootstrap/spec.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: Editor startup reuses prepared ordered plugin set for bootstrap lifecycle

- **GIVEN** `createEditor` has completed manifest/capability/dependency validation
- **WHEN** bootstrap lifecycle starts
- **THEN** lifecycle startup consumes prepared ordered plugins from editor orchestration
- **AND** duplicate manifest validation paths are not executed in both stages

### Requirement: Editor command handling uses unified runtime routing

Editor orchestration SHALL route editor commands through registered command handlers in the command runtime pipeline. Core editor runtime SHALL NOT hardcode markdown block parsing behavior as a dedicated bypass branch in dispatch.

#### Scenario: Block markdown parse command is plugin-registered

- **WHEN** morphing source text requires markdown-to-block parsing
- **THEN** the parse command is resolved through runtime command registration
- **AND** Core dispatch does not contain a dedicated hardcoded branch for that command

### Requirement: Startup validation executes through one canonical path

Manifest loading, uniqueness validation, dependency ordering, and capability validation SHALL execute once in the canonical editor startup path and SHALL NOT be duplicated across independent orchestration stages.

#### Scenario: Editor startup does not duplicate manifest validation

- **WHEN** `createEditor` initializes runtime and bootstrap
- **THEN** manifest validation responsibilities are executed in one canonical stage
- **AND** duplicated pre-bootstrap validation logic is absent
