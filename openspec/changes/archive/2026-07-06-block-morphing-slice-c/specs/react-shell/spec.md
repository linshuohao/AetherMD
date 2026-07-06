## ADDED Requirements

### Requirement: React Shell exposes multi-block morphing document surface for Slice C

`@aether-md/react` SHALL export `AetherMorphingDocument` as an additive public Shell surface for L2 Slice C multi-block Block Focus. The component SHALL maintain document-level `focusedBlockIndex` so at most one block is in source state. It SHALL derive per-block source text from `AetherDoc.children[blockIndex]` for paragraph blocks and SHALL NOT use whole-document markdown as a single-block source string. `AetherMorphingContent` SHALL remain available as a single-block primitive with per-block doc source.

References:

- `docs/architecture/product-experience-spec.md`
- `openspec/specs/product-experience/spec.md`
- `openspec/changes/block-morphing-slice-c/design.md`

#### Scenario: Focused block B shows source while others stay rendered

- **GIVEN** a mounted `AetherEditorRoot` with `AetherMorphingDocument` and a multi-paragraph fixture (at least two paragraphs)
- **WHEN** the user focuses block B
- **THEN** only block B displays a source editing surface (`morphing-source`)
- **AND** all other blocks display rendered surfaces (`morphing-rendered`)

#### Scenario: Focus switch morphs previous block to rendered

- **GIVEN** block A is in source state in `AetherMorphingDocument`
- **WHEN** the user focuses block B
- **THEN** block A returns to rendered state
- **AND** block B enters source state
- **AND** the user does not see two blocks simultaneously in source state

#### Scenario: Editing one block does not reset sibling blocks

- **GIVEN** a multi-paragraph document with distinct content in blocks A and B
- **WHEN** the user edits block B in source state
- **THEN** block A serialized content remains unchanged

### Requirement: Slice C morphing integration tests use happy-dom

`@aether-md/react` SHALL include happy-dom integration tests for product-experience scenario C (multi-block Block Focus), Slice A scenarios A/B regression, focus switching, and zero-latency typing guard.

References:

- `docs/architecture/product-experience-spec.md`
- `docs/engineering/test-strategy.md`

#### Scenario: Scenario C passes in CI

- **GIVEN** happy-dom and `AetherMorphingDocument` with a multi-paragraph fixture
- **WHEN** integration tests simulate focus on block B
- **THEN** only block B has a source surface
- **AND** other blocks have rendered surfaces

#### Scenario: Slice A regression tests still pass

- **GIVEN** `AetherMorphingContent` with single-paragraph fixture
- **WHEN** Slice A scenario A and B tests run
- **THEN** focus/blur morphing behavior matches Slice A acceptance criteria
