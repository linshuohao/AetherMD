## Why

AetherMD currently carries parallel interaction tracks (L1 Phase-0 content shell and L2 morphing shell) plus partial ownership drift across Core, Shell, and preset/plugin layers. This creates product ambiguity, inflates Core with morphing/Markdown semantics, and weakens the "single north-star interaction + lightweight microkernel" architecture goals.

## What Changes

- Converge browser product interaction to one north-star path centered on block morphing (`AetherMorphingDocument`) and remove co-equal L1/L2 product positioning.
- Refactor Core to remove morphing- and DOM-specific contracts from kernel public surface; move those contracts to preset/plugin or shell-facing layers.
- Replace Core hardcoded block-markdown parse command handling with plugin/preset command registration through unified Command Bus routing.
- Eliminate duplicate editor/bootstrap validation/orchestration paths so manifest validation and lifecycle startup run once through a single canonical flow.
- Align React and Vue shell API surfaces around the same north-star interaction model; remove or isolate legacy whole-document content shell path from product API.
- Remove stale/ghost example and test wiring artifacts, and synchronize OpenSpec/docs/test strategy/CI naming to one canonical demo topology.
- Expand interaction validation to enforce keyboard typing/deletion behavior and Markdown fidelity through the north-star shell path.

## Capabilities

### New Capabilities

- `shell-interaction-convergence`: single interaction model contract for framework shells, including de-scoping legacy product surfaces and keyboard interaction acceptance.

### Modified Capabilities

- `core-bootstrap`: tighten kernel boundary so Core remains syntax-blind and DOM-agnostic while preserving lifecycle and command/event responsibilities.
- `editor-orchestration`: remove duplicate orchestration paths and unify command routing for editor-level commands through the registered runtime pipeline.
- `react-shell`: promote morphing document as the primary product shell surface and isolate/deprecate legacy content shell semantics.
- `validation-suite`: update example/demo topology and validation gates to one canonical interaction path, including keyboard interaction matrix.
- `product-experience`: align acceptance wording and carrier references to the converged interaction model.
- `gfm-preset`: own morphing strategy and interactive renderer contracts currently leaked into Core.

## Impact

- Affected packages: `@aether-md/core`, `@aether-md/react`, `@aether-md/vue`, `@aether-md/preset-gfm`, example packages, and E2E fixtures.
- Affected docs/specs: architecture principles/north-star docs, validation/test strategy docs, and multiple OpenSpec main capabilities.
- Public API impact: likely deprecation/removal or scope narrowing for legacy shell exports; contract updates required before implementation.
- CI/test impact: E2E and integration naming/scope updates; stronger keyboard-input acceptance coverage.
