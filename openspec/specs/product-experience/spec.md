# Product Experience Spec

## Purpose

Authoritative OpenSpec capability for Instant Morphing, Block Focus, zero-latency typing, and plugin-extensible block interaction. Normative UX detail lives in `docs/architecture/product-experience-spec.md`; this spec encodes testable requirements and acceptance scenarios for product north star alignment.

## Requirements

### Requirement: Product experience specification is the authoritative UX contract

The repository SHALL maintain `docs/architecture/product-experience-spec.md` as the authoritative Product Experience Specification referenced from `docs/architecture/principles.md`. The document SHALL define Instant Morphing, Block Focus, and zero-latency typing as testable product behaviors. Architecture and engineering docs SHALL reference this page instead of duplicating UX normative text.

References:

- `docs/architecture/principles.md`
- `docs/architecture/design-doc-map.md`

#### Scenario: Principles link resolves to product experience spec

- **GIVEN** a reader follows the product experience reference from `docs/architecture/principles.md`
- **WHEN** they open the linked document
- **THEN** they find normative definitions for Instant Morphing and Block Focus
- **AND** each definition includes at least one acceptance scenario

#### Scenario: Glossary aligns with product experience terms

- **GIVEN** `docs/glossary.md` is updated for this change
- **WHEN** a reader looks up Instant Morphing or Block Focus
- **THEN** entries point to `docs/architecture/product-experience-spec.md`

### Requirement: Instant Morphing defines block dual-state behavior

The product experience model SHALL treat each editable block as having two presentation states:

- **Rendered state**: the user sees typographic output (WYSIWYG perception) without Markdown sigils.
- **Source state**: the user sees Markdown source for the focused block, suitable for direct editing.

When a block receives focus, the editor SHALL morph from rendered state to source state without replacing the entire document surface. When the focused block loses focus and the document transaction succeeds, the block SHALL morph back to rendered state.

References:

- `docs/architecture/principles.md`
- `docs/sdk/manifest.md` (`interactiveRenderers`)

#### Scenario: Focused paragraph shows Markdown source

- **GIVEN** a document containing a paragraph with strong emphasis rendered as bold
- **WHEN** the user focuses that paragraph block
- **THEN** the editing surface shows Markdown source containing the strong emphasis syntax (for example `**text**`)
- **AND** a separate detached preview panel is not required for the user to see source

#### Scenario: Blurred paragraph returns to rendered state

- **GIVEN** a paragraph block in source state after editing
- **WHEN** focus moves to another block or the document surface
- **THEN** the former block displays rendered typographic output
- **AND** the serialized document reflects the edited Markdown

### Requirement: Block Focus isolates editing to one block at a time

Block Focus SHALL mean at most one block is in source editing state at a time. Focus changes SHALL morph the previously focused block to rendered state before or as the next block enters source state. Block Focus SHALL NOT require remounting the entire editor or resetting unrelated blocks.

References:

- `docs/architecture/product-experience-spec.md`

#### Scenario: Single block in source state

- **GIVEN** a multi-block document in the morphing editor
- **WHEN** the user focuses block B
- **THEN** block B is in source state
- **AND** all other blocks remain in rendered state

#### Scenario: Focus change morphs prior block

- **GIVEN** block A is focused in source state
- **WHEN** the user focuses block B
- **THEN** block A returns to rendered state with content preserved
- **AND** block B enters source state

### Requirement: Zero-latency typing is a product quality gate

The product experience model SHALL treat perceptible input lag, caret drift caused by full-document resync, and unexpected format stripping during in-block typing as defects against the north star. Phase 0 interim shells MAY exist for pipeline proof but SHALL NOT be labeled as satisfying this requirement.

References:

- `docs/architecture/principles.md` quality table

#### Scenario: In-block typing does not reset caret via full editor remount

- **GIVEN** a block in source state with a controlled Shell
- **WHEN** the user types consecutive characters
- **THEN** the editor instance is not remounted per keystroke
- **AND** the caret remains in the typing position without full-surface refresh

### Requirement: Block interaction is primarily plugin-extensible

Block rendered surfaces and source editing behaviors for syntax-specific blocks SHALL be owned by plugins or presets via Manifest `runtime.interactiveRenderers` or successor contracts. Core SHALL NOT embed Markdown rendering or morphing semantics. Shell SHALL orchestrate focus and mount surfaces; plugins SHALL supply block-type behavior.

Slice A MAY implement minimal single-paragraph strong rendering in Shell as an MVP exception documented in `block-morphing-slice-1` design; follow-up slices SHALL move syntax-specific behavior toward preset/plugin layers.

References:

- `docs/architecture/principles.md`
- `docs/sdk/manifest.md`
- `docs/sdk/custom-block-renderer.md`
- `openspec/changes/archive/2026-07-06-block-morphing-slice-1/design.md`

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

### Requirement: Slice A single-paragraph morphing MVP is demonstrable

The repository SHALL deliver L2 Slice A as a single-paragraph Instant Morphing MVP where one paragraph block morphs between rendered and source states per the product experience spec. Slice A SHALL remain demonstrable via `AetherMorphingContent` and SHALL continue to pass scenario A and B regression tests after Slice B lands. Slice A SHALL NOT be labeled as satisfying multi-block Block Focus (Slice C) or list/link block morphing (Slice D). Slice B inline mark fidelity SHALL extend Slice A strong rendering to full GFM inline marks without breaking Slice A acceptance.

References:

- `docs/architecture/product-experience-spec.md`
- `docs/engineering/mvp-implementation-plan.md`
- `openspec/changes/archive/2026-07-06-block-morphing-slice-1/design.md`

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

### Requirement: Slice C multi-block Block Focus is demonstrable

The repository SHALL deliver L2 Slice C where a multi-paragraph document satisfies product-experience scenario C: focusing block B shows only block B in source state while other blocks remain rendered. Slice C SHALL be demonstrable via `examples/block-morphing` with a multi-paragraph fixture. Slice C SHALL NOT claim Slice B (full GFM inline mark fidelity) or Slice D (list/link block pluginization).

References:

- `docs/architecture/product-experience-spec.md`
- `docs/engineering/mvp-implementation-plan.md`
- `openspec/changes/archive/2026-07-06-block-morphing-slice-c/design.md`

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

### Requirement: Slice B GFM inline mark morphing fidelity is demonstrable

The repository SHALL deliver L2 Slice B where paragraph blocks with GFM inline marks (strong, emphasis, link) morph between rendered typographic output and Markdown source with bidirectional fidelity. Rendered state SHALL display semantic HTML (`<strong>`, `<em>`, `<a href>`) derived from the `AetherInline` tree, not regex-only MVP. Source edits SHALL NOT silently strip valid inline marks after `change` events.

References:

- `docs/architecture/product-experience-spec.md`
- `openspec/changes/archive/2026-07-06-block-morphing-slice-b/design.md`

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
