## ADDED Requirements

### Requirement: React shell integrates builtin services

The React Shell **MUST** expose undo/redo and clipboard shortcuts through the Core command path when builtin services are enabled.

#### Scenario: Undo keyboard shortcut

- **WHEN** the user triggers the platform undo shortcut in a mounted React editor
- **THEN** `core:undo` is dispatched and document state updates
