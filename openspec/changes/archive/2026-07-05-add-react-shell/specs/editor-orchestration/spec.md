## MODIFIED Requirements

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
