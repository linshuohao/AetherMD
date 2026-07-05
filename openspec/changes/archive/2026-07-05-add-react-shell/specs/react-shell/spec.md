## ADDED Requirements

### Requirement: React Shell package is exported as a public adapter package

The workspace SHALL include `@aether-md/react` at `packages/react` as a Public Adapter Package aligned with `docs/engineering/component-library-governance.md`. The package SHALL declare `build`, `typecheck`, and `test` scripts and participate in root `pnpm build`, `pnpm typecheck`, `pnpm test`, and `pnpm check`. `@aether-md/core` SHALL NOT declare runtime dependencies on React, ProseMirror, or Remark.

References:

- `docs/architecture/package-layout.md`
- `docs/architecture/roadmap.md`
- `docs/engineering/component-library-governance.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: React package is consumable from workspace

- **GIVEN** the workspace is installed and built
- **WHEN** a consumer imports from `@aether-md/react`
- **THEN** the package exposes typed public exports for the React Shell surface
- **AND** `@aether-md/core` does not declare runtime dependencies on `react`, `prosemirror-*`, or `remark`

#### Scenario: React package participates in check pipeline

- **GIVEN** `add-react-shell` implementation is complete
- **WHEN** `pnpm check` runs at the repository root
- **THEN** `@aether-md/react` `build`, `typecheck`, and `test` tasks execute successfully

### Requirement: React Shell exposes Root, Content, and hook public API

`@aether-md/react` SHALL export `AetherEditorRoot`, `AetherEditorContent`, and `useAetherEditor` as the M5 public Shell surface. `AetherEditorRoot` SHALL create an editor through `createEditor` from `@aether-md/core`. `AetherEditorContent` SHALL mount the editing view into a DOM container. `useAetherEditor` SHALL expose the current `AetherEditor` instance and React-bridged document state.

References:

- `docs/architecture/core-api.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: Root creates and disposes AetherEditor

- **GIVEN** a valid plugin configuration including Parser, Serializer, and Engine adapters
- **WHEN** `AetherEditorRoot` mounts with that configuration
- **THEN** `createEditor` is invoked and resolves to a running `AetherEditor`
- **AND** unmounting `AetherEditorRoot` calls `dispose()` on the editor instance

#### Scenario: Content mounts an editable view

- **GIVEN** a running `AetherEditor` provided by `AetherEditorRoot`
- **WHEN** `AetherEditorContent` mounts
- **THEN** an editable DOM view is attached to the content container
- **AND** the host can perform text input through that view

#### Scenario: useAetherEditor exposes bridged markdown state

- **GIVEN** `AetherEditorRoot` has completed startup and emitted `ready`
- **WHEN** a child component calls `useAetherEditor()`
- **THEN** the hook returns the current `AetherEditor` reference
- **AND** the hook returns `markdown` and `doc` state updated from `change` events without a Core-level store API

### Requirement: React Shell consumes AetherEditor directly without Shell Adapter

`@aether-md/react` SHALL consume `AetherEditor` public APIs (`dispatch`, `on`, `getMarkdown`, `getDocument`, `dispose`) directly. M5 SHALL NOT introduce a separate Shell Adapter abstraction layer between Core and React.

References:

- `docs/architecture/core-api.md`
- `docs/architecture/principles.md`

#### Scenario: React Shell does not add Shell Adapter protocol

- **GIVEN** M5 React Shell implementation
- **WHEN** package exports and internal modules are reviewed
- **THEN** no `ShellAdapter` interface or equivalent second host boundary is exported
- **AND** React components call `AetherEditor` methods and events directly

### Requirement: Shell GateLock prevents redundant document resets

React Shell SHALL implement GateLock at the Shell layer so that when a controlled `value` or `markdown` prop changes with `prevValue === nextValue`, the Shell MUST NOT reset the document, remount the engine session, or re-parse Markdown into a new session.

References:

- `docs/engineering/data-flow.md`
- `docs/architecture/ci-checklist.md`

#### Scenario: equal controlled value does not reset document

- **GIVEN** a mounted `AetherEditorRoot` with controlled `value` or `markdown`
- **WHEN** React re-renders with the same controlled Markdown string as the previous render
- **THEN** the Shell does not reinitialize `createEditor`
- **AND** the visible document content remains unchanged

#### Scenario: GateLock integration test is present

- **GIVEN** M5 React Shell integration tests
- **WHEN** CI runs `pnpm check`
- **THEN** a test verifies `prevValue === nextValue` does not reset the document
- **AND** the test executes without Playwright or a browser CI job

### Requirement: DOM input is bridged through editor dispatch

User input in the mounted React Shell view SHALL reach document updates through `AetherEditor.dispatch` and `EngineAdapter.apply`. M5 SHALL NOT bypass the Command Bus by directly mutating ProseMirror state from React components.

References:

- `docs/engineering/data-flow.md`
- `docs/architecture/principles.md`
- `docs/engineering/adapter-protocol.md`

#### Scenario: typing emits change through dispatch path

- **GIVEN** a mounted React Shell with GFM preset fixtures
- **WHEN** the test simulates user text input in the content view
- **THEN** the editor emits a `change` event
- **AND** `getMarkdown()` reflects the updated content after the edit

#### Scenario: onChange callback receives updated markdown

- **GIVEN** `AetherEditorRoot` with an `onChange` handler
- **WHEN** user input produces a successful document update
- **THEN** the handler is invoked with the updated Markdown string

### Requirement: ProseMirror view mounting uses plugin-prosemirror view bridge

`@aether-md/react` SHALL mount ProseMirror DOM through an additive view-bridge export from `@aether-md/plugin-prosemirror` (for example `createProseMirrorView`). `@aether-md/react` SHALL NOT directly depend on `prosemirror-view` or access private engine session internals.

References:

- `docs/adr/003-remark-prosemirror-dual-track.md`
- `docs/engineering/component-library-governance.md`
- `packages/plugins/plugin-prosemirror/src/engine.ts`

#### Scenario: React uses plugin-prosemirror bridge for EditorView

- **GIVEN** a running `AetherEditor` with an active engine session
- **WHEN** `AetherEditorContent` mounts
- **THEN** it creates the editing view through the plugin-prosemirror view-bridge API
- **AND** `@aether-md/react` does not import `prosemirror-view` directly

#### Scenario: view destroy is called on content unmount

- **GIVEN** a mounted `AetherEditorContent` view
- **WHEN** the content component unmounts or the editor disposes
- **THEN** the view-bridge destroy path runs without leaking DOM listeners

### Requirement: React Shell integration tests use happy-dom

M5 SHALL include integration tests for mount, input, change callback, and dispose using happy-dom as the DOM runtime. M5 SHALL NOT require Playwright or browser-based CI jobs.

References:

- `docs/engineering/test-strategy.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: mount type change dispose integration test passes

- **GIVEN** happy-dom is configured for `@aether-md/react` tests
- **WHEN** an integration test mounts `AetherEditorRoot`, simulates input, observes `onChange`, and unmounts
- **THEN** the test passes in Node through `pnpm test`
- **AND** the test does not import Playwright or launch a browser

#### Scenario: dispose integration test leaves no active editor

- **GIVEN** a mounted React Shell instance
- **WHEN** the test unmounts the root component
- **THEN** `dispose()` has been invoked
- **AND** subsequent dispatch attempts fail closed at the editor layer

### Requirement: GFM preset React smoke verifies createEditor with Shell

M5 SHALL include React smoke tests that combine `createEditor`, `@aether-md/preset-gfm`, and React Shell for at least paragraph, strong, and list fixtures.

References:

- `docs/engineering/mvp-implementation-plan.md`
- `docs/engineering/test-strategy.md`
- `openspec/specs/gfm-preset/spec.md`

#### Scenario: paragraph fixture smoke passes in React

- **GIVEN** `createGfmPreset()` and a paragraph Markdown fixture
- **WHEN** the React smoke test mounts the Shell and performs a minimal edit
- **THEN** `getMarkdown()` and the `onChange` callback reflect predictable paragraph output

#### Scenario: strong and list fixtures smoke pass in React

- **GIVEN** `createGfmPreset()` and GFM strong and list fixtures
- **WHEN** the React smoke tests run through `pnpm check`
- **THEN** strong and list round-trip behavior is verified through the React Shell path
- **AND** the tests remain distinct from M4.5 headless-only integration tests
