## ADDED Requirements

### Requirement: Slice A single-paragraph morphing MVP is demonstrable

The repository SHALL deliver L2 Slice A as a single-paragraph Instant Morphing MVP where one paragraph block morphs between rendered and source states per the product experience spec. Slice A SHALL be demonstrable via `examples/block-morphing` without a separate preview panel for source editing. Slice A SHALL NOT be labeled as satisfying multi-block Block Focus (Slice C) or full GFM inline mark fidelity in source state (Slice B).

References:

- `docs/architecture/product-experience-spec.md`
- `docs/engineering/mvp-implementation-plan.md`
- `openspec/changes/block-morphing-slice-1/design.md`

#### Scenario: Block morphing example is the L2 demo carrier

- **GIVEN** Slice A implementation is complete
- **WHEN** a maintainer opens `examples/block-morphing`
- **THEN** the example is documented as the L2 product north star demo
- **AND** `examples/react-basic` remains documented as L1 only

#### Scenario: Slice A satisfies focused and blurred paragraph scenarios

- **GIVEN** initial content `Hello **world**` in the block morphing demo or equivalent test fixture
- **WHEN** automated or maintainer acceptance runs scenarios A and B from `product-experience-spec`
- **THEN** focus shows Markdown source with `**`
- **AND** blur shows rendered bold with consistent serialization

## MODIFIED Requirements

### Requirement: Block interaction is primarily plugin-extensible

Block rendered surfaces and source editing behaviors for syntax-specific blocks SHALL be owned by plugins or presets via Manifest `runtime.interactiveRenderers` or successor contracts. Core SHALL NOT embed Markdown rendering or morphing semantics. Shell SHALL orchestrate focus and mount surfaces; plugins SHALL supply block-type behavior.

Slice A MAY implement minimal single-paragraph strong rendering in Shell as an MVP exception documented in `block-morphing-slice-1` design; follow-up slices SHALL move syntax-specific behavior toward preset/plugin layers.

References:

- `docs/architecture/principles.md`
- `docs/sdk/manifest.md`
- `docs/sdk/custom-block-renderer.md`
- `openspec/changes/block-morphing-slice-1/design.md`

#### Scenario: Core remains syntax-agnostic in morphing model

- **GIVEN** the product experience architecture described in this capability
- **WHEN** a reviewer inspects `@aether-md/core` responsibilities
- **THEN** Core does not add Markdown-specific morphing branches
- **AND** block-type behavior is specified at plugin or Shell orchestration layers

#### Scenario: Slice A Shell MVP does not expand Core morphing API

- **GIVEN** Slice A implementation
- **WHEN** `@aether-md/core` public exports are reviewed
- **THEN** no new morphing-specific Core APIs are added
- **AND** document updates remain on existing dispatch paths
