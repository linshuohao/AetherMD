## ADDED Requirements

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
