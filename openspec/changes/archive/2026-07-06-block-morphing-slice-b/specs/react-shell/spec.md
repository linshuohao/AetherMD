## MODIFIED Requirements

### Requirement: Morphing content components provide Instant Morphing surfaces

The `@aether-md/react` package SHALL export morphing components that implement Instant Morphing for paragraph blocks. `AetherMorphingContent` SHALL morph a single paragraph between rendered and source states. `AetherMorphingDocument` SHALL map document paragraph blocks with document-level Block Focus (at most one source surface). Rendered surfaces SHALL use `renderParagraphFromBlock(block)` from the `AetherInline` tree and MUST NOT call deprecated `renderParagraphInline` on the morphing path. Source edits SHALL dispatch `core:replaceText` with parser-derived `children` when inline marks are present in the edited Markdown.

References:

- `docs/architecture/product-experience-spec.md`
- `openspec/changes/block-morphing-slice-b/design.md`

#### Scenario: MorphingBlockSurface renders from block tree

- **GIVEN** a `ParagraphBlock` with strong, emphasis, and link children
- **WHEN** the block is in rendered (blurred) state
- **THEN** `MorphingBlockSurface` renders `<strong>`, `<em>`, and `<a>` from `block.children`
- **AND** does not use `renderParagraphInline`

#### Scenario: Source change dispatches parsed children

- **GIVEN** a focused morphing textarea with `*edited*` emphasis
- **WHEN** the user triggers `change` on the textarea
- **THEN** the editor dispatches `core:replaceText` with `children` reflecting parsed inline marks
- **AND** document serialization preserves emphasis syntax
