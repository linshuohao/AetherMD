## MODIFIED Requirements

### Requirement: React morphing focus transitions commit reliably

`AetherMorphingDocument` and `MorphingBlockSurface` SHALL commit in-flight source edits before switching focus to another block. `RenderedBlockHost` SHALL prefer `interactiveRenderer.update` over full remount when block content changes for non-focused blocks.

#### Scenario: Inter-block focus switch preserves committed content

- **GIVEN** block A in source state with a pending edit
- **WHEN** user focuses block B
- **THEN** block A morphs to rendered with committed content
- **AND** block B enters source state with a single document-wide source surface

### Requirement: React shell spec uses interactiveRenderer path

React shell requirements SHALL reference preset `interactiveRenderer` via `RenderedBlockHost` and SHALL NOT require `renderParagraphFromBlock(block)` on the morphing path.

#### Scenario: Rendered morphing surface mounts preset interactive renderer

- **GIVEN** a blurred paragraph block in `MorphingBlockSurface`
- **WHEN** the block renders in rendered state
- **THEN** `RenderedBlockHost` mounts the preset `interactiveRenderer` for the block type
- **AND** no shell-local `renderParagraphFromBlock` helper is invoked

### Requirement: React Shell exposes morphing content surface for Slice A

`@aether-md/react` SHALL export `AetherMorphingContent` as an additive public Shell surface for L2 Slice A single-paragraph Instant Morphing. The component SHALL orchestrate block focus state (rendered vs source) at the Shell layer without adding morphing semantics to `@aether-md/core`. `AetherMorphingContent` SHALL consume `useAetherEditor` for `editor`, `markdown`, and `ready` state and SHALL commit edits through `AetherEditor.dispatch` with `core:replaceText`. Rendered surfaces SHALL mount preset `interactiveRenderer` via `RenderedBlockHost` and MUST NOT call deprecated `renderParagraphInline` on the morphing path. Source edits SHALL dispatch `core:replaceText` with parser-derived `children` when inline marks are present in the edited Markdown.

#### Scenario: Blurred paragraph shows rendered typography via interactive renderer

- **GIVEN** a paragraph block in source state after editing in `AetherMorphingContent`
- **WHEN** focus leaves the morphing block surface
- **THEN** the block displays rendered typographic output via `RenderedBlockHost`
- **AND** serialized markdown from `getMarkdown()` reflects the edited content
