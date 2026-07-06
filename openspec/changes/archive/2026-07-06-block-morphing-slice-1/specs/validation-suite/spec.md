## ADDED Requirements

### Requirement: Block morphing example is part of the validation suite

The workspace SHALL include `examples/block-morphing` as a private workspace package (`@aether-md/example-block-morphing`) that demonstrates L2 Slice A single-paragraph Instant Morphing. The example SHALL use `@aether-md/react` morphing surfaces with GFM preset wiring. The example `typecheck` task SHALL participate in root `pnpm check` through the workspace turbo pipeline.

References:

- `docs/architecture/product-experience-spec.md`
- `docs/engineering/mvp-implementation-plan.md`
- `examples/block-morphing/README.md`

#### Scenario: Block morphing example typechecks in CI

- **GIVEN** `block-morphing-slice-1` implementation is complete
- **WHEN** `pnpm check` runs at the repository root
- **THEN** `examples/block-morphing` `typecheck` (`tsc --noEmit`) succeeds

#### Scenario: Maintainer can start block morphing browser demo

- **GIVEN** the workspace is installed and built per `examples/block-morphing/README.md`
- **WHEN** a maintainer runs `pnpm --filter @aether-md/example-block-morphing dev`
- **THEN** a browser-rendered morphing editor loads without startup error
- **AND** the UI demonstrates focus=source / blur=rendered without a separate preview panel

## MODIFIED Requirements

### Requirement: React basic demo slice north star acceptance is frozen and verified

The repository SHALL treat `examples/react-basic` as the **L1 architecture pipeline browser demo** per `docs/engineering/demo-slice-delivery-program.md`. Maintainers SHALL be able to run `pnpm --filter @aether-md/example-react-basic dev` and continuously edit a frozen GFM subset (heading, strong emphasis, list, link) without GateLock document reset when the controlled `value` is unchanged.

`@aether-md/react` SHALL include integration tests mirroring the controlled Shell layout that verify:

1. **ProseMirror user input path** — keyboard-equivalent edits through mounted `AetherEditorContent` update markdown preview for paragraph, heading, and list-item paragraph surfaces.
2. **Programmatic dispatch path** — consecutive `core:replaceText` edits and GateLock preservation across parent rerender (existing `demo-slice-pr0-acceptance` coverage).

This requirement validates **L1 only**. Product north star **L2** (Instant Morphing / Block Focus) is specified in `product-experience` and SHALL be demonstrated by `examples/block-morphing` after Slice A.

CI MUST enforce both L1 paths where automatable; browser maintainer sign-off remains required before M7 demo sign-off but is not a CI gate for L1.

References:

- `docs/engineering/demo-slice-delivery-program.md`
- `examples/react-basic/README.md`
- `docs/architecture/product-experience-spec.md`
- `examples/block-morphing/README.md`

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
