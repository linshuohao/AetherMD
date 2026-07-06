## ADDED Requirements

### Requirement: Slice B block morphing integration tests cover GFM inline marks

The `@aether-md/react` validation suite SHALL include happy-dom integration tests for L2 Slice B GFM inline mark morphing fidelity. Tests SHALL cover at least: (1) focused source shows emphasis sigils, (2) blurred render shows `<em>`, (3) source edit of emphasis does not strip marks. Slice A and Slice C regression scenarios SHALL remain passing after Slice B lands.

References:

- `openspec/changes/block-morphing-slice-b/design.md`
- `packages/react/src/block-morphing.integration.test.tsx`

#### Scenario: Slice B integration tests pass in CI

- **GIVEN** Slice B implementation is complete
- **WHEN** `pnpm --filter @aether-md/react test` runs
- **THEN** Slice B inline mark scenarios pass
- **AND** Slice A and Slice C scenarios continue to pass

#### Scenario: Block morphing example includes Slice B fixture

- **GIVEN** `examples/block-morphing` is updated for Slice B
- **WHEN** a maintainer runs the example
- **THEN** the demo fixture includes emphasis and link inline marks
- **AND** README documents Slice B scope
