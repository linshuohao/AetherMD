# architecture-compliance-remediation Implementation Plan

> **For agentic workers:** Use `aether-workflow-implement-task` per task file under `.superpowers/tasks/architecture-compliance-remediation/`. Wave 6A tasks are parallel-safe.

## Change

- OpenSpec change: `architecture-compliance-remediation`
- Status: Wave 1–5 largely complete; **Wave 6** addresses audit residual gaps
- Branch: `refactor/architecture-compliance-remediation`
- Version impact: minor (morphing-contracts additive) + **major** (legacy subpath isolation, optional PM peer)
- Expected commit scope: one commit per task file

## Source Artifacts

- Proposal: `openspec/changes/architecture-compliance-remediation/proposal.md`
- Design: `openspec/changes/architecture-compliance-remediation/design.md`
- Delta specs: `openspec/changes/architecture-compliance-remediation/specs/**`
- High-level tasks: `openspec/changes/architecture-compliance-remediation/tasks.md`
- Audit baseline: architecture compliance review (2026-07-07)

## Implementation Phases

1. **Wave 1–5** — Interaction, contracts, core extraction, legacy posture, e2e subset ✅ (partial; see gaps)
2. **Wave 6A** — Parallel fixes: Vue RenderedBlockHost, docs drift, Vue E2E, Vue unit tests, React focus guards
3. **Wave 6B** — Core morph registry removal, interactiveRenderers resolution, preset registry consolidation
4. **Wave 6C** — Legacy subpath isolation, PM optional peer, GFM wiring centralization
5. **Wave 6D** — Barrier: OpenSpec main spec sync + `pnpm check`

## Dependency Order

```
Wave 1–5 (done/partial)
  → Wave 6A (T14,T15,T16,T21,T22 parallel)
  → Wave 6B (T13,T18,T19 — T18 after T13)
  → Wave 6C (T17,T23)
  → Wave 6D (T20 barrier)
```

## Boundary Risks

- Architecture: Core morph extraction must preserve `getMorphingStrategy` opaque accessor
- Public contracts: legacy subpath is **BREAKING** for direct `AetherEditorContent` importers
- interactiveRenderers: wire in bootstrap OR remove from manifest + SDK docs
- Vue/React parity: RenderedBlockHost port may surface more Vue edge cases

## Validation Matrix

| Phase | Requirement                 | Validation                                         | Task |
| ----- | --------------------------- | -------------------------------------------------- | ---- |
| 6A    | Vue rendered-host stability | `rendered-block-host.test.ts` + interaction-matrix | T14  |
| 6A    | Docs accuracy               | manual + link check                                | T15  |
| 6A    | Vue E2E parity              | `vue-block-morphing.spec.ts` expanded              | T16  |
| 6A    | Vue unit parity             | vue package tests                                  | T21  |
| 6B    | Core syntax-blind morph     | `public-api-boundary.test.ts`, core tests          | T13  |
| 6B    | Manifest contract alignment | manifest tests + typecheck                         | T18  |
| 6B    | Single registry             | preset tests                                       | T19  |
| 6C    | Legacy isolation            | package-boundary tests                             | T17  |
| 6D    | Full gate                   | `pnpm check` + openspec sync                       | T20  |

## Task Breakdown

| Task | Outcome                                                      | Allowed Area                                                         | Validation                       | Version Impact | Depends On | Parallel Group | Barrier  |
| ---- | ------------------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------- | -------------- | ---------- | -------------- | -------- |
| T14  | Vue `RenderedBlockHost` identity-aware update/remount        | `packages/vue/src/morphing/**`                                       | vue tests                        | none           | —          | wave-6a        | false    |
| T15  | Docs drift: README, matrix, E2E counts, vue-shell stub       | `docs/**`, `README.md`                                               | manual                           | none           | —          | wave-6a        | false    |
| T16  | Vue E2E parity + E2EProbes in showcase                       | `e2e/**`, `examples/vue/**`, `examples/shared/**`                    | playwright vue                   | none           | —          | wave-6a        | false    |
| T21  | Vue unit tests: Slice D, block-identity, rendered-host       | `packages/vue/src/**`                                                | vue tests                        | none           | T14        | wave-6a        | false    |
| T22  | React focus FSM same-block guards                            | `packages/react/src/morphing/**`                                     | react tests                      | none           | —          | wave-6a        | false    |
| T13  | Core: remove morph registry factory; opaque plugin handle    | `packages/core/**`, `packages/preset-gfm/**`                         | core tests                       | minor          | W1–5       | wave-6b        | false    |
| T18  | interactiveRenderers: wire bootstrap OR remove dead field    | `packages/core/**`, `packages/preset-gfm/**`, `docs/sdk/manifest.md` | typecheck                        | minor          | T13        | wave-6b        | false    |
| T19  | Preset: consolidate dual registry to morphing-contracts only | `packages/preset-gfm/**`                                             | preset tests                     | none           | T13        | wave-6b        | false    |
| T17  | Legacy subpath export + optional PM peer                     | `packages/react/**`, `packages/vue/**`                               | boundary tests                   | **major**      | T13        | wave-6c        | false    |
| T23  | GFM wiring centralization via example-shared                 | `examples/shared/**`, `packages/*/testing/**`                        | integration                      | none           | —          | wave-6c        | false    |
| T20  | OpenSpec main spec sync + tasks.md reconcile                 | `openspec/specs/**`, `openspec/changes/**/tasks.md`                  | openspec validate + `pnpm check` | none           | T13–T23    | wave-6d        | **true** |

## Review Focus

- No GFM syntax logic added to shell production code
- Core `index.ts` still excludes morphing contract exports after T13
- Vue morphing mode has zero preview elements
- Task 4.2/4.3/5.3 checkbox state matches actual implementation

## Open Questions

- `interactiveRenderers`: prefer wiring via `plugin.morphingStrategies` only and remove manifest field (simpler) vs extend `RuntimeManifest` type
- Legacy subpath: `@aether-md/react/legacy` vs `@aether-md/react/content` naming
