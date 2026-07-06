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

References:

- `docs/architecture/principles.md`
- `docs/sdk/manifest.md`
- `docs/sdk/custom-block-renderer.md`

#### Scenario: Core remains syntax-agnostic in morphing model

- **GIVEN** the product experience architecture described in this capability
- **WHEN** a reviewer inspects `@aether-md/core` responsibilities
- **THEN** Core does not add Markdown-specific morphing branches
- **AND** block-type behavior is specified at plugin or Shell orchestration layers
