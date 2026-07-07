# React Shell Spec

## Purpose

M5 React Shell in `@aether-md/react`: public Root / Content / hook surface, direct `AetherEditor` consumption without Shell Adapter, Shell-layer GateLock, plugin-prosemirror view-bridge mounting, happy-dom integration tests, and GFM preset React smoke coverage.

## Requirements

### Requirement: React Shell package is exported as a public adapter package

The workspace SHALL include `@aether-md/react` at `packages/react` as a Public Adapter Package aligned with `docs/engineering/component-library-governance.md`. The package SHALL declare `build`, `typecheck`, and `test` scripts and participate in root `pnpm build`, `pnpm typecheck`, `pnpm test`, and `pnpm check`. `@aether-md/core` SHALL NOT declare runtime dependencies on React, ProseMirror, or Remark.

References:

- `docs/architecture/package-layout.md`
- `docs/architecture/roadmap.md`
- `docs/engineering/component-library-governance.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: React package is consumable from workspace

- **GIVEN** the workspace is installed and built
- **WHEN** a consumer imports from `@aether-md/react`
- **THEN** the package exposes typed public exports for the React Shell surface
- **AND** `@aether-md/core` does not declare runtime dependencies on `react`, `prosemirror-*`, or `remark`

#### Scenario: React package participates in check pipeline

- **GIVEN** `add-react-shell` implementation is complete
- **WHEN** `pnpm check` runs at the repository root
- **THEN** `@aether-md/react` `build`, `typecheck`, and `test` tasks execute successfully

### Requirement: React product surface is morphing-first with explicit legacy content alias

`@aether-md/react` SHALL position morphing surfaces (`AetherMorphingDocument`, `AetherMorphingContent`) as primary product interaction APIs. `AetherEditorContent` MAY remain for legacy/pipeline bridge usage and SHALL be explicitly marked as a legacy surface.

References:

- `docs/architecture/product-experience-spec.md`
- `openspec/specs/shell-interaction-convergence/spec.md`

#### Scenario: Package exports prefer morphing and preserve explicit legacy bridge

- **GIVEN** maintainers inspect `@aether-md/react` public exports
- **WHEN** package boundary tests run
- **THEN** morphing surfaces are present as primary product APIs
- **AND** legacy content bridge remains available via `AetherEditorContent` and explicit legacy alias naming
- **AND** docs/examples do not present content mode as co-equal product north-star interaction

### Requirement: M5 React Shell is a Phase 0 interim integration shell

`@aether-md/react` as delivered in M5 SHALL be documented and specified as a **Phase 0 interim integration shell** that proves `createEditor` → DOM view → Command Bus → serialize → Shell GateLock. The interim shell uses a persistent ProseMirror `EditorView` via `@aether-md/plugin-prosemirror` view-bridge. This interim shell SHALL NOT be described as the product north star interaction model defined in `product-experience`.

References:

- `docs/architecture/product-experience-spec.md`
- `openspec/specs/product-experience/spec.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: Documentation distinguishes interim shell from product north star

- **GIVEN** M5 React Shell is implemented
- **WHEN** a reader opens `docs/architecture/product-experience-spec.md` and `packages/react` consumer docs or `examples/react/README.md`
- **THEN** the Phase 0 interim shell role is explicitly stated
- **AND** Instant Morphing / Block Focus is identified as the product target handled by follow-up slices

#### Scenario: Interim shell remains valid for pipeline verification

- **GIVEN** the Phase 0 interim shell classification
- **WHEN** `pnpm check` runs
- **THEN** existing React Shell integration tests continue to pass without requiring morphing behavior
- **AND** no requirement forces removal of view-bridge before a morphing slice replaces it

### Requirement: React Shell exposes Root, Content, and hook public API

`@aether-md/react` SHALL export `AetherEditorRoot`, `AetherEditorContent`, and `useAetherEditor` as the M5 public Shell surface. `AetherEditorRoot` SHALL create an editor through `createEditor` from `@aether-md/core`. `AetherEditorContent` SHALL mount the editing view into a DOM container. `useAetherEditor` SHALL expose the current `AetherEditor` instance and React-bridged document state.

M5 `AetherEditorContent` fulfills this requirement via the Phase 0 ProseMirror view-bridge. Future product-north-star shells SHALL satisfy the same public API shape while swapping the internal surface strategy to Block Morphing per `product-experience`.

References:

- `docs/architecture/core-api.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/product-experience-spec.md`

#### Scenario: Root creates and disposes AetherEditor

- **GIVEN** a valid plugin configuration including Parser, Serializer, and Engine adapters
- **WHEN** `AetherEditorRoot` mounts with that configuration
- **THEN** `createEditor` is invoked and resolves to a running `AetherEditor`
- **AND** unmounting `AetherEditorRoot` calls `dispose()` on the editor instance

#### Scenario: Content mounts an editable view

- **GIVEN** a running `AetherEditor` provided by `AetherEditorRoot`
- **WHEN** `AetherEditorContent` mounts
- **THEN** an editable DOM view is attached to the content container
- **AND** the host can perform text input through that view

#### Scenario: useAetherEditor exposes bridged markdown state

- **GIVEN** `AetherEditorRoot` has completed startup and emitted `ready`
- **WHEN** a child component calls `useAetherEditor()`
- **THEN** the hook returns the current `AetherEditor` reference
- **AND** the hook returns `markdown` and `doc` state updated from `change` events without a Core-level store API

### Requirement: React Shell consumes AetherEditor directly without Shell Adapter

`@aether-md/react` SHALL consume `AetherEditor` public APIs (`dispatch`, `on`, `getMarkdown`, `getDocument`, `dispose`) directly. M5 SHALL NOT introduce a separate Shell Adapter abstraction layer between Core and React.

References:

- `docs/architecture/core-api.md`
- `docs/architecture/principles.md`

#### Scenario: React Shell does not add Shell Adapter protocol

- **GIVEN** M5 React Shell implementation
- **WHEN** package exports and internal modules are reviewed
- **THEN** no `ShellAdapter` interface or equivalent second host boundary is exported
- **AND** React components call `AetherEditor` methods and events directly

### Requirement: Shell GateLock prevents redundant document resets

React Shell SHALL implement GateLock at the Shell layer so that when a controlled `value` or `markdown` prop changes with `prevValue === nextValue`, the Shell MUST NOT reset the document, remount the engine session, or re-parse Markdown into a new session.

References:

- `docs/engineering/data-flow.md`
- `docs/architecture/ci-checklist.md`

#### Scenario: equal controlled value does not reset document

- **GIVEN** a mounted `AetherEditorRoot` with controlled `value` or `markdown`
- **WHEN** React re-renders with the same controlled Markdown string as the previous render
- **THEN** the Shell does not reinitialize `createEditor`
- **AND** the visible document content remains unchanged

#### Scenario: GateLock integration test is present

- **GIVEN** M5 React Shell integration tests
- **WHEN** CI runs `pnpm check`
- **THEN** a test verifies `prevValue === nextValue` does not reset the document
- **AND** the test executes without Playwright or a browser CI job

### Requirement: DOM input is bridged through editor dispatch

User input in the mounted React Shell view SHALL reach document updates through `AetherEditor.dispatch` and `EngineAdapter.apply`. M5 SHALL NOT bypass the Command Bus by directly mutating ProseMirror state from React components.

References:

- `docs/engineering/data-flow.md`
- `docs/architecture/principles.md`
- `docs/engineering/adapter-protocol.md`

#### Scenario: typing emits change through dispatch path

- **GIVEN** a mounted React Shell with GFM preset fixtures
- **WHEN** the test simulates user text input in the content view
- **THEN** the editor emits a `change` event
- **AND** `getMarkdown()` reflects the updated content after the edit

#### Scenario: onChange callback receives updated markdown

- **GIVEN** `AetherEditorRoot` with an `onChange` handler
- **WHEN** user input produces a successful document update
- **THEN** the handler is invoked with the updated Markdown string

### Requirement: ProseMirror view mounting uses plugin-prosemirror view bridge

`@aether-md/react` SHALL mount ProseMirror DOM through an additive view-bridge export from `@aether-md/plugin-prosemirror` (for example `createProseMirrorView`). `@aether-md/react` SHALL NOT directly depend on `prosemirror-view` or access private engine session internals.

References:

- `docs/adr/003-remark-prosemirror-dual-track.md`
- `docs/engineering/component-library-governance.md`
- `packages/plugins/plugin-prosemirror/src/engine.ts`

#### Scenario: React uses plugin-prosemirror bridge for EditorView

- **GIVEN** a running `AetherEditor` with an active engine session
- **WHEN** `AetherEditorContent` mounts
- **THEN** it creates the editing view through the plugin-prosemirror view-bridge API
- **AND** `@aether-md/react` does not import `prosemirror-view` directly

#### Scenario: view destroy is called on content unmount

- **GIVEN** a mounted `AetherEditorContent` view
- **WHEN** the content component unmounts or the editor disposes
- **THEN** the view-bridge destroy path runs without leaking DOM listeners

### Requirement: React Shell integration tests use happy-dom

M5 SHALL include integration tests for mount, input, change callback, and dispose using happy-dom as the DOM runtime. M5 SHALL NOT require Playwright or browser-based CI jobs.

References:

- `docs/engineering/test-strategy.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: mount type change dispose integration test passes

- **GIVEN** happy-dom is configured for `@aether-md/react` tests
- **WHEN** an integration test mounts `AetherEditorRoot`, simulates input, observes `onChange`, and unmounts
- **THEN** the test passes in Node through `pnpm test`
- **AND** the test does not import Playwright or launch a browser

#### Scenario: dispose integration test leaves no active editor

- **GIVEN** a mounted React Shell instance
- **WHEN** the test unmounts the root component
- **THEN** `dispose()` has been invoked
- **AND** subsequent dispatch attempts fail closed at the editor layer

### Requirement: GFM preset React smoke verifies createEditor with Shell

M5 SHALL include React smoke tests that combine `createEditor`, `@aether-md/preset-gfm`, and React Shell for at least paragraph, strong, and list fixtures.

References:

- `docs/engineering/mvp-implementation-plan.md`
- `docs/engineering/test-strategy.md`
- `openspec/specs/gfm-preset/spec.md`

#### Scenario: paragraph fixture smoke passes in React

- **GIVEN** `createGfmPreset()` and a paragraph Markdown fixture
- **WHEN** the React smoke test mounts the Shell and performs a minimal edit
- **THEN** `getMarkdown()` and the `onChange` callback reflect predictable paragraph output

#### Scenario: strong and list fixtures smoke pass in React

- **GIVEN** `createGfmPreset()` and GFM strong and list fixtures
- **WHEN** the React smoke tests run through `pnpm check`
- **THEN** strong and list round-trip behavior is verified through the React Shell path
- **AND** the tests remain distinct from M4.5 headless-only integration tests

### Requirement: React Shell exposes morphing content surface for Slice A

`@aether-md/react` SHALL export `AetherMorphingContent` as an additive public Shell surface for L2 Slice A single-paragraph Instant Morphing. The component SHALL orchestrate block focus state (rendered vs source) at the Shell layer without adding morphing semantics to `@aether-md/core`. `AetherMorphingContent` SHALL consume `useAetherEditor` for `editor`, `markdown`, and `ready` state and SHALL commit edits through `AetherEditor.dispatch` with `core:replaceText`. Rendered surfaces SHALL use `renderParagraphFromBlock(block)` from the `AetherInline` tree and MUST NOT call deprecated `renderParagraphInline` on the morphing path. Source edits SHALL dispatch `core:replaceText` with parser-derived `children` when inline marks are present in the edited Markdown.

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

### Requirement: React Shell exposes multi-block morphing document surface for Slice C

`@aether-md/react` SHALL export `AetherMorphingDocument` as an additive public Shell surface for L2 Slice C multi-block Block Focus. The component SHALL maintain document-level `focusedBlockIndex` so at most one block is in source state. It SHALL derive per-block source text from `AetherDoc.children[blockIndex]` for paragraph blocks and SHALL NOT use whole-document markdown as a single-block source string. `AetherMorphingContent` SHALL remain available as a single-block primitive with per-block doc source.

References:

- `docs/architecture/product-experience-spec.md`
- `openspec/specs/product-experience/spec.md`
- `openspec/changes/archive/2026-07-06-block-morphing-slice-c/design.md`

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

### Requirement: Slice B morphing integration tests use happy-dom

`@aether-md/react` SHALL include happy-dom integration tests for Slice B GFM inline mark morphing fidelity (emphasis/link source sigils, blurred `<em>`/`<a>` render, source edit mark preservation) plus Slice A and Slice C regression.

References:

- `docs/architecture/product-experience-spec.md`
- `docs/engineering/test-strategy.md`

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

#### Scenario: Slice B integration tests pass in CI

- **GIVEN** Slice B implementation is complete
- **WHEN** `pnpm --filter @aether-md/react test` runs
- **THEN** Slice B inline mark scenarios pass
- **AND** Slice A and Slice C scenarios continue to pass

### Requirement: React Shell morphing document consumes preset block strategies for Slice D

`@aether-md/react` SHALL orchestrate Block Focus across supported GFM block types from `@aether-md/preset-gfm` morphing strategies. Shell SHALL NOT embed GFM list/paragraph syntax rules; it SHALL use preset `serializeSource`, `parseSource`, and `interactiveRenderers` for rendered surfaces.

References:

- `docs/architecture/architecture-optimization-principles.md`
- `packages/preset-gfm`

#### Scenario: Morphing document renders list blocks

- **GIVEN** `AetherMorphingDocument` with a multi-block fixture including a list block
- **WHEN** the document is ready
- **THEN** each supported top-level block has a morphing surface
- **AND** list blocks use preset-provided render and source strategies

#### Scenario: Slice D list morphing integration tests pass in CI

- **GIVEN** Slice D implementation is complete
- **WHEN** `pnpm --filter @aether-md/react test` runs
- **THEN** Slice D list block scenarios pass
- **AND** Slice A, B, and C scenarios continue to pass

### Requirement: React shell product surface is morphing-first

`@aether-md/react` SHALL treat morphing document interaction as the primary product shell surface. Legacy whole-document content shell utilities MAY exist for pipeline verification only, and SHALL be isolated from primary product-facing API positioning.

#### Scenario: Product docs and examples use morphing shell as primary

- **WHEN** maintainers review React shell examples and product-facing docs
- **THEN** morphing document flow is presented as the primary interaction path
- **AND** whole-document content shell is not presented as a co-equal product mode

### Requirement: React shell owns no syntax-specific rendering rules

React shell components SHALL consume preset-provided morphing strategies and interactive renderers and SHALL NOT carry standalone GFM syntax rendering logic that duplicates preset behavior.

#### Scenario: Shell code has no dead syntax renderer path

- **WHEN** maintainers inspect React morphing source files
- **THEN** syntax-specific inline rendering logic is sourced from preset strategy contracts
- **AND** duplicate/dead shell-local GFM render helpers are absent
