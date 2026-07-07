## MODIFIED Requirements

### Requirement: Parse-block markdown routes through plugin command registration

Editor orchestration SHALL NOT hardcode markdown block parsing in `createEditor`. The `core:parseBlockMarkdown` command SHALL be registered by `@aether-md/preset-gfm` (or successor plugin) and routed through the standard command runtime pipeline.

#### Scenario: Preset provides parse-block command

- **WHEN** GFM preset is loaded
- **THEN** dispatching `core:parseBlockMarkdown` returns the first parsed block via preset-registered handler
- **AND** Core does not import parse-block payload types in public API
