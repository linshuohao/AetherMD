# Task 01: Expand E2E and fix morphing sync

**Change:** `improve-e2e-block-morphing`
**Depends On:**
**Parallel Group:**
**Barrier:** false

## Goal

Extend Playwright coverage to product-experience Scenarios A/B/C and fix `MorphingBlockSurface` async edit/blur race exposed by real-browser `fill()` + `blur()` patterns.

## Requirements

- Delta: `openspec/changes/improve-e2e-block-morphing/specs/validation-suite/spec.md`
- `docs/architecture/product-experience-spec.md` Scenarios A/B/C

## Allowed Files

- `e2e/playwright/**`
- `packages/react/src/morphing/morphing-block-surface.tsx`
- `packages/react/src/morphing/aether-morphing-document.tsx`
- `examples/block-morphing/README.md`
- `docs/engineering/test-strategy.md` (E2E section only)
- `openspec/changes/improve-e2e-block-morphing/**`

## Validation

```bash
pnpm check
pnpm e2e:test
```

Expected: 22 E2E passed; `pnpm check` green.

## Run Log

- 2026-07-07: Implemented 22 E2E tests, morphing sync fix, dual webServer script
- Validation: `pnpm check` pass, `pnpm e2e:test` 22/22 pass
- Review: `.superpowers/reviews/improve-e2e-block-morphing.md` — pass
