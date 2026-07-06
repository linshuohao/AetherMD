## MODIFIED Requirements

### Requirement: React Shell exports morphing document surface

`@aether-md/react` SHALL export `AetherMorphingDocument` that orchestrates Block Focus across supported GFM block types from the active preset morphing registry. Shell SHALL NOT embed GFM list/paragraph syntax rules; it SHALL consume preset block strategies for source serialization, parse, and rendered mount.

References:

- `docs/architecture/architecture-optimization-principles.md`
- `packages/preset-gfm`

#### Scenario: Morphing document renders list blocks

- **GIVEN** `AetherMorphingDocument` with a multi-block fixture including a list block
- **WHEN** the document is ready
- **THEN** each supported top-level block has a morphing surface
- **AND** list blocks use preset-provided render and source strategies
