## ADDED Requirements

### Requirement: React basic demo slice PR0 acceptance is verified in CI

PR A change `demo-slice-react-basic` SHALL implement and verify the scenarios frozen in `demo-slice-react-basic-pr0`. The repository SHALL include an automated integration test in `@aether-md/react` that mirrors the `examples/react-basic` controlled Shell layout (editor content + markdown preview + GateLock rerender control). The test SHALL fail before PR A implementation and pass after.

References:

- `openspec/changes/demo-slice-react-basic-pr0/specs/validation-suite/spec.md`
- `docs/engineering/demo-slice-delivery-program.md`
- `examples/react-basic/README.md`

#### Scenario: Controlled Shell loads GFM fixture with frozen subset visible in markdown output

- **GIVEN** a React Shell tree wired like `examples/react-basic` with GFM preset plugins
- **WHEN** the editor becomes `ready`
- **THEN** markdown output includes evidence of heading, strong emphasis, list, and link structures from the fixture
- **AND** `data-testid="aether-editor-content"` is mounted

#### Scenario: Consecutive edits update markdown without session reset

- **GIVEN** the PR0 acceptance integration fixture is ready
- **WHEN** the user edit path applies at least two consecutive document updates (via ProseMirror view input sync or equivalent `core:replaceText` dispatch through the mounted Shell)
- **THEN** markdown preview reflects the latest edited content
- **AND** prior edits are not lost between updates

#### Scenario: GateLock prevents reset on parent rerender without value change

- **GIVEN** the acceptance fixture performs an edit and echoes markdown through controlled `value` / `onChange`
- **WHEN** a parent rerender is triggered without changing the controlled `value` string
- **THEN** the editor instance is not remounted
- **AND** markdown preview still reflects the edited content

#### Scenario: examples/react-basic documents PR0 checklist

- **GIVEN** PR A is complete
- **WHEN** a maintainer reads `examples/react-basic/README.md`
- **THEN** PR0 acceptance checklist and dev commands are present
- **AND** initial demo content showcases the frozen GFM subset
