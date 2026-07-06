## MODIFIED Requirements

### Requirement: Block morphing example participates in validation pipeline

The workspace SHALL include `@aether-md/example-block-morphing` at `examples/block-morphing` as the L2 Block Morphing demo. After Slice C, the example SHALL use a multi-paragraph fixture and `AetherMorphingDocument` for Block Focus demonstration. The example SHALL participate in root `pnpm check` via `typecheck` (G6 gate).

References:

- `docs/engineering/mvp-implementation-plan.md`
- `examples/block-morphing/README.md`
- `openspec/changes/block-morphing-slice-c/design.md`

#### Scenario: Block morphing example typechecks in check pipeline

- **GIVEN** Slice C block morphing example is complete
- **WHEN** `pnpm check` runs at the repository root
- **THEN** `@aether-md/example-block-morphing` typecheck succeeds
- **AND** the example documents multi-block Block Focus operation
