## MODIFIED Requirements

### Requirement: React basic demo slice north star acceptance is frozen and verified

The repository SHALL treat `examples/react-basic` as the north star browser demo per `docs/engineering/demo-slice-delivery-program.md`. Maintainers SHALL be able to run `pnpm --filter @aether-md/example-react-basic dev` and continuously edit a frozen GFM subset (heading, strong emphasis, list, link) without GateLock document reset when the controlled `value` is unchanged.

`@aether-md/react` SHALL include integration tests mirroring the controlled Shell layout that verify:

1. **ProseMirror user input path** — keyboard-equivalent edits through mounted `AetherEditorContent` update markdown preview for paragraph, heading, and list-item paragraph surfaces.
2. **Programmatic dispatch path** — consecutive `core:replaceText` edits and GateLock preservation across parent rerender (existing `demo-slice-pr0-acceptance` coverage).

CI MUST enforce both paths where automatable; browser maintainer sign-off remains required before M7 demo sign-off but is not a CI gate in this change.

References:

- `docs/engineering/demo-slice-delivery-program.md`
- `examples/react-basic/README.md`
- `openspec/changes/archive/2026-07-06-demo-slice-react-basic-pr0/baseline-record.md`

#### Scenario: Maintainer can start the browser demo from workspace

- **GIVEN** the workspace is installed and built per `examples/react-basic/README.md`
- **WHEN** a maintainer runs `pnpm --filter @aether-md/example-react-basic dev`
- **THEN** a browser-rendered editor loads without startup error
- **AND** initial content showcases heading, strong emphasis, list, and link GFM structures

#### Scenario: ProseMirror typing updates markdown preview in CI

- **GIVEN** a mounted controlled Shell with `AetherEditorContent` and markdown preview (mirroring `examples/react-basic`)
- **WHEN** tests apply ProseMirror `insertText` (or equivalent user-input transactions) to edit plain paragraph, heading, and list-item paragraph content
- **THEN** the preview reflects the typed text after each edit sequence
- **AND** adjacent strong emphasis and link marks remain structurally stable where the fixture includes them

#### Scenario: Demo slice dispatch acceptance remains enforced in CI

- **GIVEN** `demo-slice-typing-sync` implementation is complete
- **WHEN** `pnpm --filter @aether-md/react test` runs
- **THEN** `demo-slice-pr0-acceptance.integration.test.tsx` passes
- **AND** existing React Shell and GateLock integration tests continue to pass

#### Scenario: Maintainer browser sign-off is documented

- **GIVEN** CI typing and dispatch tests pass
- **WHEN** a maintainer follows `examples/react-basic/README.md` sign-off steps
- **THEN** continuous keyboard typing in the browser demo is confirmed before claiming demo sign-off for M7
- **AND** any remaining browser-only gaps are recorded in `baseline-record.md` rather than implied as complete by CI alone
