## ADDED Requirements

### Requirement: Bootstrap loads adapter plugins with silent provide

`bootstrapCore` **MUST** load registered Adapter plugins and silently provide `core:engine` and `core:parser` capabilities when configured.

#### Scenario: Engine adapter auto-wired

- **WHEN** bootstrap includes a ProseMirror engine plugin manifest
- **THEN** `core:engine` is available to dependent plugins without explicit host wiring

### Requirement: Layered manifest merge

The bootstrap **MUST** merge manifest layers metadata, compile, runtime, and security according to documented precedence.

#### Scenario: Compile layer schema contribution merged

- **WHEN** two plugins contribute compile-layer schema fragments
- **THEN** the merged schema is available at editor startup
- **OR** a schema conflict triggers fatal `CoreError` abort per default ConflictResolver
