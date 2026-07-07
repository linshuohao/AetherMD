## ADDED Requirements

### Requirement: Vue shell minimal mount API

The `@aether-md/vue` package **MUST** export Root, Content, and hook components mirroring the React Shell public API shape.

#### Scenario: Mount editor in Vue app

- **WHEN** a host uses `AetherEditorRoot` and `AetherEditorContent` with GFM preset wiring
- **THEN** the editor mounts and emits change events
- **AND** `dispose` cleans up on unmount

#### Scenario: GateLock prevents redundant reset

- **WHEN** `value` prop is unchanged between renders
- **THEN** the editor document is not reset
