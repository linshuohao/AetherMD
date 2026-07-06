## ADDED Requirements

### Requirement: Slice D list block morphing is demonstrable

The repository SHALL deliver L2 Slice D where GFM `list` blocks morph between rendered (`ul`/`ol`/`li`) and Markdown source (`- item` / `1. item`) per Block Focus rules. Slice D SHALL be demonstrable via `examples/block-morphing` with a fixture containing at least one list block alongside paragraphs. Slice D SHALL NOT claim M7 publish readiness.

References:

- `docs/architecture/product-experience-spec.md`
- `docs/architecture/architecture-optimization-principles.md`

#### Scenario: Focused list block shows Markdown list source

- **GIVEN** a document with a list block `- alpha\n- beta`
- **WHEN** the user focuses the list block in `AetherMorphingDocument`
- **THEN** the source surface shows list marker syntax
- **AND** other blocks remain rendered

#### Scenario: Blurred list block shows rendered list typography

- **GIVEN** a list block in source state
- **WHEN** focus moves away after edit
- **THEN** the block renders as `ul`/`ol` with `li` children
- **AND** serialized document preserves list structure

#### Scenario: Slice A–C regression preserved

- **GIVEN** Slice D implementation is complete
- **WHEN** `pnpm --filter @aether-md/react test` runs
- **THEN** Slice A, B, and C block-morphing integration tests pass
