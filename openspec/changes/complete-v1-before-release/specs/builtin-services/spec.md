## ADDED Requirements

### Requirement: History service undo and redo

The Core **MUST** provide a `HistoryService` on `EditorContext.services.history` that supports undo and redo of captured editor transactions.

#### Scenario: Undo after captured edit

- **WHEN** a command with `meta.history: "capture"` succeeds
- **AND** the user invokes `core:undo`
- **THEN** the document reverts to the state before that command
- **AND** a `change` event **MAY** be emitted

#### Scenario: Redo after undo

- **WHEN** undo has been performed
- **AND** the user invokes `core:redo`
- **THEN** the document restores the undone state

### Requirement: Selection service exposes current selection

The Core **MUST** provide a `SelectionService` on `EditorContext.services.selection` that returns the current selection snapshot or null when unavailable.

#### Scenario: Get selection after focus

- **WHEN** the editor has focus and a text selection exists
- **AND** `getSelection()` is called
- **THEN** a non-null selection descriptor is returned

### Requirement: Clipboard service proxies copy and paste

The Core **MUST** provide a `ClipboardService` on `EditorContext.services.clipboard` with `copy()` and `paste()` entry points.

#### Scenario: Copy places content on clipboard proxy

- **WHEN** `copy()` is invoked with an active selection
- **THEN** clipboard content is available for subsequent paste

#### Scenario: Paste applies clipboard content

- **WHEN** `paste()` is invoked with clipboard content available
- **THEN** content is inserted at the current selection
