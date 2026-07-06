## ADDED Requirements

### Requirement: React basic demo slice north star acceptance is frozen for PR A

The repository SHALL treat `examples/react-basic` as the north star browser demo per [Demo Slice 交付计划](../../../../docs/engineering/demo-slice-delivery-program.md). Change `demo-slice-react-basic-pr0` SHALL freeze acceptance boundaries for follow-up implementation change `demo-slice-react-basic` (PR A). PR A MUST NOT expand scope beyond the scenarios and non-goals defined here without escalation.

References:

- `docs/engineering/demo-slice-delivery-program.md`
- `docs/project-status.md`
- `openspec/specs/validation-suite/spec.md`
- `openspec/specs/react-shell/spec.md`

#### Scenario: Maintainer can start the browser demo from workspace

- **GIVEN** the workspace is installed and built per `examples/react-basic/README.md`
- **WHEN** a maintainer runs `pnpm --filter @aether-md/example-react-basic dev`
- **THEN** a browser-rendered editor loads without startup error
- **AND** `AetherEditorRoot` / `AetherEditorContent` mount with GFM preset wiring

#### Scenario: User can continuously type plain paragraphs

- **GIVEN** `examples/react-basic` is running in the browser
- **WHEN** a user types multiple lines of plain paragraph text without reloading
- **THEN** the typed content remains in the editor session
- **AND** content does not reset or bounce back unexpectedly

#### Scenario: User can edit frozen GFM syntax subset

- **GIVEN** `examples/react-basic` is running
- **WHEN** a user edits content using **at least one** item from each of the following groups through in-editor typing or equivalent editing gestures:
  - heading (e.g. `# Title`)
  - strong emphasis (e.g. `**bold**`)
  - list (ordered or unordered)
  - link (e.g. `[text](url)`)
- **THEN** the edited structures remain stable in the session after continued typing
- **AND** the structures are reflected in markdown output or an equivalent visible preview (`useAetherEditor` `markdown` or `data-testid="markdown-preview"`)

#### Scenario: GateLock prevents document reset on parent rerender

- **GIVEN** `examples/react-basic` is running with controlled `value` / `onChange`
- **WHEN** the user edits the document and then triggers the demo's forced parent rerender control without changing `value`
- **THEN** the editor document is not reset to the initial markdown
- **AND** GateLock behavior remains observable in the demo UI

#### Scenario: PR A scope excludes deferred editor chrome

- **GIVEN** PR A implementation for change `demo-slice-react-basic`
- **WHEN** scope is reviewed against this requirement
- **THEN** History, Selection, Clipboard, and full toolbar are out of scope
- **AND** workflow main-spec changes and npm publish are out of scope

#### Scenario: PR A allowed change surface is bounded

- **GIVEN** PR A implementation planning
- **WHEN** allowed files are compared to the delivery program
- **THEN** changes are limited to `examples/react-basic/**`, `packages/react/**`, and demo-necessary paths under `packages/plugins/plugin-prosemirror/**` and `packages/preset-gfm/**`, plus required tests and docs
- **AND** changes to workflow skills, unrelated packages, and `openspec/specs/**` main specs without escalation are forbidden
