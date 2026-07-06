## ADDED Requirements

### Requirement: Validation suite distinguishes architecture demo from product north star

The validation suite SHALL distinguish two north-star layers:

1. **Architecture pipeline demo (L1)** — `examples/react-basic` proves React Shell + GFM wiring, GateLock, and markdown preview sync. This is the Demo Slice program outcome.
2. **Product interaction north star (L2)** — a future morphing demo (for example `examples/block-morphing`, name deferred to its change) proves Instant Morphing and Block Focus per `product-experience`.

L1 passing SHALL NOT be interpreted as L2 satisfied. Documentation and project status SHALL state both layers explicitly.

References:

- `docs/engineering/demo-slice-delivery-program.md`
- `docs/architecture/product-experience-spec.md`
- `openspec/specs/product-experience/spec.md`

#### Scenario: Project status lists both north-star layers

- **GIVEN** this change is merged
- **WHEN** a reader opens `docs/project-status.md`
- **THEN** architecture demo delivery (L1) and product morphing north star (L2) are listed separately
- **AND** L2 is marked not started or in planning with a link to `product-experience-spec`

#### Scenario: React basic README does not claim product morphing

- **GIVEN** `examples/react-basic/README.md`
- **WHEN** a reader evaluates what the example proves
- **THEN** the README describes architecture/pipeline verification
- **AND** the README does not claim Instant Morphing or Block Focus

## MODIFIED Requirements

### Requirement: React basic demo slice north star acceptance is frozen and verified

The repository SHALL treat `examples/react-basic` as the **L1 architecture pipeline browser demo** per `docs/engineering/demo-slice-delivery-program.md`. Maintainers SHALL be able to run `pnpm --filter @aether-md/example-react-basic dev` and continuously edit a frozen GFM subset (heading, strong emphasis, list, link) without GateLock document reset when the controlled `value` is unchanged.

`@aether-md/react` SHALL include integration tests mirroring the controlled Shell layout that verify:

1. **ProseMirror user input path** — keyboard-equivalent edits through mounted `AetherEditorContent` update markdown preview for paragraph, heading, and list-item paragraph surfaces.
2. **Programmatic dispatch path** — consecutive `core:replaceText` edits and GateLock preservation across parent rerender (existing `demo-slice-pr0-acceptance` coverage).

This requirement validates **L1 only**. Product north star **L2** (Instant Morphing / Block Focus) is specified in `product-experience` and is out of scope for this requirement.

CI MUST enforce both L1 paths where automatable; browser maintainer sign-off remains required before M7 demo sign-off but is not a CI gate for L1.

References:

- `docs/engineering/demo-slice-delivery-program.md`
- `examples/react-basic/README.md`
- `docs/architecture/product-experience-spec.md`
- `openspec/changes/archive/2026-07-06-demo-slice-react-basic-pr0/baseline-record.md`

#### Scenario: Maintainer can start the browser demo from workspace

- **GIVEN** the workspace is installed and built per `examples/react-basic/README.md`
- **WHEN** a maintainer runs `pnpm --filter @aether-md/example-react-basic dev`
- **THEN** a browser-rendered editor loads without startup error
- **AND** initial content showcases heading, strong emphasis, list, and link GFM structures

#### Scenario: ProseMirror typing updates markdown preview in CI

- **GIVEN** a mounted controlled Shell with `AetherEditorContent` and markdown preview (mirroring `examples/react-basic`)
- **WHEN** integration tests simulate consecutive ProseMirror user input on paragraph, heading, and list-item surfaces
- **THEN** markdown preview reflects the latest edited content for each surface

#### Scenario: GateLock preserves edits across parent rerender in CI

- **GIVEN** a controlled Shell with `value` and `onChange` wired like `examples/react-basic`
- **WHEN** tests edit content and trigger a parent rerender without changing `value`
- **THEN** the document content is preserved
- **AND** markdown preview still reflects the edited content
