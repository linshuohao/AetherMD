## ADDED Requirements

### Requirement: Block stable identity for history operations

Document blocks **MUST** retain stable identifiers across undo, redo, insert, delete, and reorder when provided by the parser/engine pipeline.

#### Scenario: Undo preserves block ids

- **WHEN** a block has a stable id
- **AND** an edit followed by undo occurs
- **THEN** the block retains the same id
