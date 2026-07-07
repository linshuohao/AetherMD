# converge-single-interaction-model Implementation Plan

## Change

- OpenSpec change: `converge-single-interaction-model`
- Status: proposal/design/delta-spec/tasks complete; implementation not started
- Version impact: public export and shell contract adjustments are likely semver-impacting (potential major); no `manifestVersion` bump planned in this wave
- Expected commit scope: `spec(core|react|validation|product-experience)` for artifacts, then `refactor(core|react|vue)` / `test(e2e|react|vue)` / `docs(architecture|engineering)`

## Source Artifacts

- Proposal: `openspec/changes/converge-single-interaction-model/proposal.md`
- Design: `openspec/changes/converge-single-interaction-model/design.md`
- Delta specs:
  - `openspec/changes/converge-single-interaction-model/specs/shell-interaction-convergence/spec.md`
  - `openspec/changes/converge-single-interaction-model/specs/core-bootstrap/spec.md`
  - `openspec/changes/converge-single-interaction-model/specs/editor-orchestration/spec.md`
  - `openspec/changes/converge-single-interaction-model/specs/react-shell/spec.md`
  - `openspec/changes/converge-single-interaction-model/specs/validation-suite/spec.md`
  - `openspec/changes/converge-single-interaction-model/specs/product-experience/spec.md`
  - `openspec/changes/converge-single-interaction-model/specs/gfm-preset/spec.md`
- High-level tasks: `openspec/changes/converge-single-interaction-model/tasks.md`
- Source docs / ADRs:
  - `docs/architecture/principles.md`
  - `docs/architecture/product-experience-spec.md`
  - `docs/architecture/architecture-optimization-principles.md`
  - `docs/engineering/test-strategy.md`
  - `docs/examples/matrix.md`
  - `docs/community/git-workflow.md`
  - `AI_NATIVE_ENGINEERING_WORKFLOW.md`

## Implementation Phases

1. Baseline cleanup and topology alignment (remove stale artifacts, align naming/wiring).
2. Core boundary extraction (morphing contract removal, command routing unification, startup-path dedupe).
3. Shell convergence (React morphing-first API posture + Vue morphing parity).
4. Validation hardening (keyboard insertion/deletion fidelity matrix and product-path acceptance).
5. Docs/spec sync + compliance review + archive preparation.

## Dependency Order

1. Cleanup must complete before Core/Shell refactors to avoid stale references.
2. Core contract movement must land before shell import rewiring.
3. React/Vue convergence must land before final E2E and interaction matrix stabilization.
4. Validation updates run after feature refactors, then docs/main-spec sync and compliance.

## Boundary Risks

- Architecture: Core may accidentally retain DOM/morphing exports or add new bypasses.
- Public contracts: removing or isolating legacy shell exports can break consumers.
- Package/versioning: contract changes may require major-version signaling across `@aether-md/core`, `@aether-md/react`, and `@aether-md/vue`.
- Docs/spec drift: topology wording across docs/OpenSpec can diverge if updates are split from implementation.

## Validation Matrix

| Phase | Requirement | Validation | Intuitive Verification | Notes |
| --- | --- | --- | --- | --- |
| 1 | Canonical topology / no ghost artifacts | `pnpm lint` + `pnpm test` smoke project discovery | Run `pnpm --filter @aether-md/example-react dev` and verify default shell mode | Confirms topology convergence baseline |
| 2 | Core morphing/DOM contract removed, unified command routing | `pnpm --filter @aether-md/core test` + `pnpm --filter @aether-md/core typecheck` | Inspect `packages/core/src/index.ts` export surface | Must preserve command/event behavior |
| 3 | React/Vue primary morphing surface parity | `pnpm --filter @aether-md/react test` + `pnpm --filter @aether-md/vue test` | Open React/Vue examples and verify morphing-first UX | Vue parity is a gating barrier |
| 4 | Keyboard interaction fidelity matrix | `pnpm e2e:test` + target vitest suites for morphing | Manual browser check for Backspace/Delete and no remount jitter | Product-path focused, not pipeline-only |
| 5 | Docs/spec alignment and compliance | `pnpm check` + OpenSpec sync/validation commands | Read north-star docs and ensure single-model narrative | Final gate before archive |

## Task Breakdown

| Task | Outcome | Allowed Area | Validation | Version Impact | Depends On | Parallel Group | Barrier |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Remove stale example/dead shell files and align root test wiring | `examples/**`, `vitest.config.ts`, stale file deletions | targeted vitest discovery + `pnpm test` | none | none | wave-1 | false |
| T02 | Update docs/spec references to canonical showcase topology | `docs/**`, `openspec/changes/converge-single-interaction-model/**` | docs link checks + terminology grep | none | T01 | wave-1 | true |
| T03 | Extract morphing/DOM contracts out of Core public API | `packages/core/src/index.ts`, `packages/core/src/morphing/**`, dependent imports | core tests/typecheck | potential major | T01 | wave-2 | false |
| T04 | Replace hardcoded parse command path with registered command handler flow | `packages/core/src/editor/**`, preset/plugin registration points | core + preset tests | potential major | T03 | wave-2 | false |
| T05 | Deduplicate createEditor/bootstrap manifest validation path | `packages/core/src/editor/create-editor.ts`, bootstrap wiring | core tests + integration smoke | none | T03 | wave-2 | true |
| T06 | React shell morphing-first public posture and legacy-path isolation | `packages/react/src/**`, `examples/react/**` | react tests + e2e subset | potential major | T04,T05 | wave-3 | false |
| T07 | Vue shell morphing parity with React primary API | `packages/vue/src/**`, `examples/vue/**` | vue tests + shared demo checks | potential major | T04,T05 | wave-3 | true |
| T08 | Expand keyboard insertion/deletion fidelity tests | `e2e/playwright/**`, `packages/react/src/morphing/**/*.test.tsx`, optional vue tests | `pnpm e2e:test` + package tests | none | T06,T07 | wave-4 | true |
| T09 | Sync OpenSpec main specs + docs + compliance artifacts | `openspec/specs/**`, `docs/**`, `.superpowers/reviews/**`, `.superpowers/runs/**` | `pnpm check` + compliance review | none | T08 | wave-5 | true |

## Review Focus

- Changed files must map to T01–T09 and related OpenSpec requirements.
- Core public API must stay syntax-blind and DOM-agnostic after refactor.
- React/Vue shell parity must be explicit in exports and acceptance tests.
- Product-path validation must cover keyboard insertion/deletion fidelity.
- Docs/main-spec sync must remove dual-track product narrative.

## Open Questions

- Should legacy `AetherEditorContent` remain as internal/testing-only API or be removed entirely in this change?
- Should shell contract extraction introduce a new shared package (e.g., shell contract types), or stay within preset/plugin modules?
- Is a dedicated migration note required for external consumers before API narrowing lands?
