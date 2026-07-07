## MODIFIED Requirements

### Requirement: L2 demo topology excludes preview panel in morphing mode

Browser validation for product interaction (morphing path) SHALL NOT require or display a separate Markdown preview panel in morphing mode for any canonical showcase (`examples/react`, `examples/vue`).

#### Scenario: Vue e2e morphing mode matches React no-preview rule

- **WHEN** Playwright loads Vue morphing showcase
- **THEN** `markdown-preview` count is zero
- **AND** block morphing scenarios A–C are exercisable without preview
