## ADDED Requirements

### Requirement: React Shell exposes morphing content surface for Slice A

`@aether-md/react` SHALL export `AetherMorphingContent` as an additive public Shell surface for L2 Slice A single-paragraph Instant Morphing. The component SHALL orchestrate block focus state (rendered vs source) at the Shell layer without adding morphing semantics to `@aether-md/core`. `AetherMorphingContent` SHALL consume `useAetherEditor` for `editor`, `markdown`, and `ready` state and SHALL commit edits through `AetherEditor.dispatch` with `core:replaceText`.

References:

- `docs/architecture/product-experience-spec.md`
- `openspec/specs/product-experience/spec.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: Focused paragraph shows Markdown source in morphing surface

- **GIVEN** a mounted `AetherEditorRoot` with `AetherMorphingContent` and initial markdown `Hello **world**`
- **WHEN** the user focuses the morphing block surface
- **THEN** the editing surface shows Markdown source containing `**`
- **AND** no separate detached preview panel is required

#### Scenario: Blurred paragraph shows rendered typography

- **GIVEN** a paragraph block in source state after editing in `AetherMorphingContent`
- **WHEN** focus leaves the morphing block surface
- **THEN** the block displays rendered typographic output (for example bold for `**world**`)
- **AND** serialized markdown from `getMarkdown()` reflects the edited content

#### Scenario: Morphing edits use dispatch path

- **GIVEN** a focused `AetherMorphingContent` textarea
- **WHEN** the user changes text in the source surface
- **THEN** the Shell calls `editor.dispatch` with `core:replaceText`
- **AND** a successful edit emits `change` and updates bridged `markdown` state

### Requirement: Slice A morphing integration tests use happy-dom

`@aether-md/react` SHALL include happy-dom integration tests for Slice A scenarios A and B (focus shows source, blur shows rendered) and zero-latency typing guard (no per-keystroke editor remount). Tests SHALL NOT require Playwright or browser CI.

References:

- `docs/architecture/product-experience-spec.md`
- `docs/engineering/test-strategy.md`

#### Scenario: Slice A scenario A passes in CI

- **GIVEN** happy-dom and `AetherMorphingContent` with fixture `Hello **world**`
- **WHEN** integration tests simulate focus on the block surface
- **THEN** the source surface text includes `**world**`

#### Scenario: Slice A scenario B passes in CI

- **GIVEN** a focused morphing block with edited source text
- **WHEN** integration tests simulate blur
- **THEN** the rendered surface shows bold typography without `**` sigils visible to the user
- **AND** markdown serialization matches the edited source

#### Scenario: Consecutive morphing edits do not remount editor

- **GIVEN** a mounted controlled Shell with `AetherMorphingContent`
- **WHEN** tests perform consecutive edits or parent rerenders without controlled value change
- **THEN** the `AetherEditor` instance reference is unchanged
- **AND** document content is preserved
