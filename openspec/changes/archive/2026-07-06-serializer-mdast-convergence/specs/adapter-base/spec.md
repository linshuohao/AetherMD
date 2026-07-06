## MODIFIED Requirements

### Requirement: Remark plugin package provides Parser and Serializer adapters

The workspace SHALL include `@aether-md/plugin-remark` implementing `ParserAdapter` and `SerializerAdapter`. M4 GFM round-trip behavior remains; Phase 1 serializer convergence SHALL route full-document serialization through `AetherDoc -> MDAST -> remark-stringify` while preserving deterministic GFM golden Markdown output for the supported test matrix.

References:

- `docs/architecture/architecture-optimization-principles.md`
- `docs/engineering/adapter-protocol.md`

#### Scenario: Remark serializer uses MDAST stringifier pipeline

- **GIVEN** `@aether-md/plugin-remark` is built
- **WHEN** `SerializerAdapter.serialize` is called with M4 GFM fixture `AetherDoc`
- **THEN** serialization flows through shared `AetherDoc -> MDAST` mapping and remark-stringify
- **AND** output matches existing GFM golden strings in serializer tests

#### Scenario: Shared MDAST mapping is symmetric

- **GIVEN** `@aether-md/plugin-remark` exports shared MDAST mapping utilities
- **WHEN** a maintainer inspects parser and serializer sources
- **THEN** `mdast -> AetherDoc` and `AetherDoc -> mdast` live in one module
- **AND** parser no longer duplicates mapping logic inline
