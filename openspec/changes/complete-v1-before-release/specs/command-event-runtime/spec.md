## ADDED Requirements

### Requirement: Command dispatch Guard chain

`dispatch` **MUST** pass through ReadOnlyGuard and CapabilityGuard before invoking handlers.

#### Scenario: ReadOnlyGuard blocks mutation

- **WHEN** the editor is in read-only mode
- **AND** a mutating command is dispatched
- **THEN** `dispatch` returns `{ ok: false }` without invoking the handler

### Requirement: Command queue priority

The Command Bus **MUST** honor `meta.priority` with P0–P3 ordering per concurrency strategy.

#### Scenario: Undo preempts normal command

- **WHEN** `core:undo` (P0) and a normal-priority command arrive concurrently
- **THEN** undo is processed before the normal command

### Requirement: History capture middleware

Commands with `meta.history: "capture"` **MUST** be recorded by HistoryService on success.

#### Scenario: Captured command creates history entry

- **WHEN** a successful command has `meta.history: "capture"`
- **THEN** a subsequent undo restores prior document state
