## ADDED Requirements

### Requirement: Slice C multi-block Block Focus is demonstrable

The repository SHALL deliver L2 Slice C where a multi-paragraph document satisfies product-experience scenario C: focusing block B shows only block B in source state while other blocks remain rendered. Slice C SHALL be demonstrable via `examples/block-morphing` with a multi-paragraph fixture. Slice C SHALL NOT claim Slice B (full GFM inline mark fidelity) or Slice D (list/link block pluginization).

References:

- `docs/architecture/product-experience-spec.md`
- `docs/engineering/mvp-implementation-plan.md`
- `openspec/changes/block-morphing-slice-c/design.md`

#### Scenario: Block morphing example demonstrates multi-block focus

- **GIVEN** Slice C implementation is complete
- **WHEN** a maintainer runs `pnpm --filter @aether-md/example-block-morphing dev`
- **THEN** the demo shows at least two paragraphs with clickable block focus
- **AND** only the focused paragraph shows Markdown source

#### Scenario: Slice C satisfies scenario C acceptance

- **GIVEN** a multi-paragraph fixture in tests or demo
- **WHEN** the user focuses block B
- **THEN** only block B is in source state
- **AND** other blocks are in rendered state

## MODIFIED Requirements

### Requirement: Slice A single-paragraph morphing MVP is demonstrable

The repository SHALL deliver L2 Slice A as a single-paragraph Instant Morphing MVP where one paragraph block morphs between rendered and source states per the product experience spec. Slice A SHALL remain demonstrable via `AetherMorphingContent` and SHALL continue to pass scenario A and B regression tests after Slice C lands. Slice A SHALL NOT be labeled as satisfying multi-block Block Focus (Slice C) or full GFM inline mark fidelity in source state (Slice B).

References:

- `docs/architecture/product-experience-spec.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: Block morphing example is the L2 demo carrier

- **GIVEN** Slice C implementation is complete
- **WHEN** a maintainer opens `examples/block-morphing`
- **THEN** the example is documented as the L2 product north star demo including multi-block Block Focus
- **AND** `examples/react-basic` remains documented as L1 only

#### Scenario: Slice A satisfies focused and blurred paragraph scenarios

- **GIVEN** initial content `Hello **world**` in `AetherMorphingContent` or equivalent test fixture
- **WHEN** automated or maintainer acceptance runs scenarios A and B from `product-experience-spec`
- **THEN** focus shows Markdown source with `**`
- **AND** blur shows rendered bold with consistent serialization
