## ADDED Requirements

### Requirement: ConflictResolver integrated in createEditor

`createEditor` **MUST** apply the default or host-provided ConflictResolver for command, keymap, schema, and capability conflicts.

#### Scenario: Schema conflict aborts startup

- **WHEN** merged plugin schemas conflict under default resolver policy
- **THEN** `createEditor` rejects with fatal `CoreError`

### Requirement: Host ConflictResolver injection

`EditorConfig` **MUST** accept an optional custom `ConflictResolver` that replaces the default for the editor instance when provided.

#### Scenario: Host resolver overrides default

- **WHEN** the host provides `conflictResolver` in config
- **THEN** conflict resolution uses the host implementation

### Requirement: Compile-layer schema merge at editor startup

`createEditor` **MUST** perform compile-layer schema merge before engine session creation.

#### Scenario: Successful merge enables editing

- **WHEN** plugin schemas are compatible
- **THEN** the engine session is created with merged schema

### Requirement: Logger host injection

`EditorConfig` **MUST** accept an optional logger sink used by `EditorContext.logger` when provided by the host.

#### Scenario: Host logger receives errors

- **WHEN** a recoverable plugin error occurs
- **THEN** the host logger sink receives the error payload
