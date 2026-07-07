# Validation Suite — Delta: improve-e2e-block-morphing

## MODIFIED Requirements

### Requirement: Playwright browser E2E Phase 1 covers block-morphing demo

The repository SHALL include Playwright browser E2E under `e2e/playwright/` that exercises `examples/block-morphing` in real Chromium. The suite SHALL verify:

1. Smoke boot and block type attributes
2. Block Focus (single-block source state)
3. Instant Morphing (source edit and blur re-render)
4. GateLock regression (parent rerender preserves edited content)
5. **Scenario C** — focus switches across paragraph, list, and link blocks with at most one `morphing-source` visible
6. **Slice A/B** — `**bold**` / `*emphasis*` paragraph morphing in real browser
7. **Slice B** — link paragraph shows Markdown link syntax in source and renders `<a href>` after blur
8. **Edit isolation** — editing one block does not reset sibling blocks
9. **Browser interaction** — click-to-focus and Tab keyboard paths
10. **Typing** — `pressSequentially` in source without stripping marks
11. **Sync hooks** — tests MAY wait on `data-edit-synced="true"` before blur assertions
12. **Block identity** — stable `data-block-id`, `core:moveBlock` reorder preserves focus
13. **Editor stability** — consecutive edits and parent rerender do not remount editor
14. **L1 react-basic** — ProseMirror smoke, GateLock, browser typing + preview sync

Root scripts `e2e:install` and `e2e:test` SHALL run the suite after workspace build. Shared helpers SHALL live in `e2e/playwright/fixtures/`.

#### Scenario: Playwright smoke boots block-morphing demo

- **GIVEN** the workspace is installed and built
- **WHEN** `pnpm e2e:test` runs
- **THEN** the block-morphing demo loads in Chromium without error
- **AND** morphing blocks 0/1/2 are visible with expected `data-block-type` values

#### Scenario: Playwright Block Focus keeps single source state

- **GIVEN** the block-morphing demo is loaded
- **WHEN** a user focuses the list block and then other blocks in sequence
- **THEN** exactly one block exposes `morphing-source` at a time
- **AND** previously focused blocks return to `morphing-rendered`

#### Scenario: Playwright Instant Morphing edits survive blur

- **GIVEN** a focused list block in source state
- **WHEN** the user edits Markdown source and blurs after `data-edit-synced="true"`
- **THEN** the block renders updated list items matching the edit

#### Scenario: CI runs Playwright as non-blocking job

- **GIVEN** the CI workflow includes `e2e-playwright`
- **WHEN** Playwright tests run on `main`
- **THEN** the job uses `continue-on-error: true`
- **AND** Playwright report artifacts are uploaded when the job completes
