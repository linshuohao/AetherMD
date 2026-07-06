## ADDED Requirements

### Requirement: M5 React Shell is a Phase 0 interim integration shell

`@aether-md/react` as delivered in M5 SHALL be documented and specified as a **Phase 0 interim integration shell** that proves `createEditor` → DOM view → Command Bus → serialize → Shell GateLock. The interim shell uses a persistent ProseMirror `EditorView` via `@aether-md/plugin-prosemirror` view-bridge. This interim shell SHALL NOT be described as the product north star interaction model defined in `product-experience`.

References:

- `docs/architecture/product-experience-spec.md`
- `openspec/specs/product-experience/spec.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: Documentation distinguishes interim shell from product north star

- **GIVEN** M5 React Shell is implemented
- **WHEN** a reader opens `docs/architecture/product-experience-spec.md` and `packages/react` consumer docs or `examples/react-basic/README.md`
- **THEN** the Phase 0 interim shell role is explicitly stated
- **AND** Instant Morphing / Block Focus is identified as the product target handled by follow-up slices

#### Scenario: Interim shell remains valid for pipeline verification

- **GIVEN** the Phase 0 interim shell classification
- **WHEN** `pnpm check` runs
- **THEN** existing React Shell integration tests continue to pass without requiring morphing behavior
- **AND** no requirement forces removal of view-bridge before a morphing slice replaces it

## MODIFIED Requirements

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
