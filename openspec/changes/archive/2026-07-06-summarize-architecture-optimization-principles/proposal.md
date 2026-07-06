## Why

AetherMD has validated the core adapter pipeline, but recent architecture review exposed a recurring risk: Markdown syntax ownership, adapter translation, and morphing responsibilities can drift across Remark, ProseMirror, preset, and React layers. The project needs one concise architecture guardrail document that summarizes the optimization direction and gives future changes a shared decision framework.

## What Changes

- Add a long-lived architecture document summarizing the bridge-layer optimization strategy, design principles, and approved patterns.
- Cross-link the new document from architecture entry points so future architecture, adapter, preset, and morphing work can discover it.
- Record explicit non-goals: no runtime refactor, no Adapter API change, no React Shell behavior change, and no Markdown serialization implementation change in this documentation-only change.

## Capabilities

### New Capabilities

- `architecture-optimization-principles`: documents the required architecture guidance page for bridge-layer optimization principles, syntax ownership, and approved design patterns.

### Modified Capabilities

- None.

## Impact

- Affected docs: `docs/architecture/`.
- Affected OpenSpec artifacts: new change under `openspec/changes/summarize-architecture-optimization-principles/`.
- Public API impact: none.
- Package SemVer / manifestVersion impact: none.
- Runtime dependency impact: none.
- Branch: `docs/summarize-architecture-optimization-principles`.
- Expected commit scope: `docs(architecture)`.
