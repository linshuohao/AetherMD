## ADDED Requirements

### Requirement: Slice B GFM inline mark morphing fidelity is demonstrable

The repository SHALL deliver L2 Slice B where paragraph blocks with GFM inline marks (strong, emphasis, link) morph between rendered typographic output and Markdown source with bidirectional fidelity. Rendered state SHALL display semantic HTML (`<strong>`, `<em>`, `<a href>`) derived from the `AetherInline` tree, not regex-only MVP. Source edits SHALL NOT silently strip valid inline marks after `change` events.

References:

- `docs/architecture/product-experience-spec.md`
- `openspec/changes/block-morphing-slice-b/design.md`

#### Scenario: Focused paragraph shows emphasis and link source sigils

- **GIVEN** a paragraph containing `*emphasis*` and `[text](url)` inline marks
- **WHEN** the user focuses that paragraph in the morphing editor
- **THEN** the source surface shows Markdown sigils for emphasis and link
- **AND** sigils are not stripped to plain text

#### Scenario: Blurred paragraph renders emphasis and links

- **GIVEN** a paragraph with emphasis and link inline marks in rendered state
- **WHEN** the block is not focused
- **THEN** the rendered surface contains `<em>` and `<a href>` elements
- **AND** raw Markdown sigils are not visible in the rendered surface

#### Scenario: Source edit preserves inline marks

- **GIVEN** a focused paragraph with `*world*` emphasis in source state
- **WHEN** the user edits source to `*universe*` or adds `[link](https://example.com)`
- **THEN** the serialized document retains the corresponding inline mark syntax
- **AND** blurred render reflects the updated marks

## MODIFIED Requirements

### Requirement: Slice A single-paragraph morphing MVP is demonstrable

The repository SHALL deliver L2 Slice A as a single-paragraph Instant Morphing MVP where one paragraph block morphs between rendered and source states per the product experience spec. Slice A SHALL remain demonstrable via `AetherMorphingContent` and SHALL continue to pass scenario A and B regression tests after Slice B lands. Slice A SHALL NOT be labeled as satisfying multi-block Block Focus (Slice C) or list/link block morphing (Slice D). Slice B inline mark fidelity SHALL extend Slice A strong rendering to full GFM inline marks without breaking Slice A acceptance.

References:

- `docs/architecture/product-experience-spec.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: Slice A satisfies focused and blurred paragraph scenarios

- **GIVEN** initial content `Hello **world**` in `AetherMorphingContent` or equivalent test fixture
- **WHEN** automated or maintainer acceptance runs scenarios A and B from `product-experience-spec`
- **THEN** focus shows Markdown source with `**`
- **AND** blur shows rendered bold with consistent serialization
