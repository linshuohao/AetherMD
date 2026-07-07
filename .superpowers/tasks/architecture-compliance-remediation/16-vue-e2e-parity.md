# Task 16: Vue E2E parity + E2EProbes in showcase

Change: architecture-compliance-remediation
Spec Requirement:

- product-experience / Scenarios A, B, C
- validation-suite / Vue Playwright coverage
  Source Docs:
- e2e/playwright/tests/block-morphing.spec.ts (reference)
- examples/shared/e2e-probes.tsx
  Depends On: none
  Parallel Group: wave-6a
  Barrier: false
  Allowed Files:
- e2e/playwright/tests/vue-block-morphing.spec.ts
- e2e/playwright/fixtures/vue-editor.ts
- examples/vue/src/AetherShellShowcase.vue
- examples/vue/package.json (if probe dependency needed)
- examples/shared/e2e-probes.tsx (reuse or vue adapter)
  Forbidden Files:
- packages/core/**
- openspec/specs/**
  Implementation Notes:
- Add `E2EProbes` to Vue showcase (port from React pattern or shared wrapper).
- Add `data-testid="force-parent-rerender"` for GateLock regression.
- Port high-value scenarios from React: A (focused sigils), B (blur rendered), Slice B emphasis/link, edit isolation, keyboard Tab, typing, moveBlock.
- Reuse or extend `vue-editor.ts` fixtures mirroring `editor.ts`.
  TDD Notes:
- Red: new playwright tests fail before probes wired.
- Green: probes + fixtures make tests pass.
  Validation:
- `pnpm --filter @aether-md/e2e-playwright test --project=vue` (or equivalent from repo root)
  Intuitive Verification:
- Vue morphing demo survives force-parent-rerender without content loss.
  Review Checklist:
- Morphing mode still has zero `markdown-preview`
- No Command Bus bypass in showcase
  Rollback Notes:
- Revert e2e and showcase probe changes.
  Version Impact: none
  Commit Scope: test(e2e)
  Status: done
  Run Log:
  - Wired `E2EProbes` (render-fn `defineComponent` inside `AetherShellShowcase.vue`) with `data-testid="e2e-probes"`, markdown/editor-stable probes, and `window.__AETHER_E2E__.moveBlock`.
  - Moved `force-parent-rerender` button inside `AetherEditorRoot` with `data-testid="force-parent-rerender"`.
  - Expanded `vue-block-morphing.spec.ts` from 3 to 22 tests (parity with React block-morphing scenarios A/B/C, Slice B, isolation, keyboard, typing, moveBlock, GateLock).
  - Extended `vue-editor.ts` to re-export shared editor fixtures and assert probes ready in `gotoVueMorphingDemo`.
  - Validation: `pnpm e2e:test --project=vue` — 22 passed (11.3s).
    Deviation:
  - E2EProbes implemented inline in `AetherShellShowcase.vue` (dual `<script>` + `h()` render) rather than shared `e2e-probes.vue`, because inline `template` in `defineComponent` is not compiled by Vite and a separate shared `.vue` export would require `examples/shared/package.json` changes (not in allowed files).
