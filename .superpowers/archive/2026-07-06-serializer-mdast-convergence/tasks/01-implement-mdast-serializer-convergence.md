# Task 01: Implement MDAST serializer convergence

**Change:** `serializer-mdast-convergence`  
**Status:** completed  
**Depends On:**  
**Parallel Group:**  
**Barrier:** false

## Goal

Implement architecture optimization Phase 1: shared `AetherDoc <-> MDAST` mapping and remark-stringify serializer; remove duplicate inline serialization from preset-gfm.

## OpenSpec

- `openspec/changes/serializer-mdast-convergence/specs/adapter-base/spec.md`

## Allowed files

- `packages/plugins/plugin-remark/src/**`
- `packages/plugins/plugin-remark/package.json`
- `packages/preset-gfm/src/gfm-inline-morphing.ts`
- `packages/preset-gfm/src/index.ts`
- `packages/preset-gfm/src/inline-morphing.test.ts`
- `pnpm-lock.yaml`

## Forbidden files

- `packages/core/**`
- `packages/react/**` (unless test failure requires no change)
- workflow skills
- `openspec/specs/**` (sync in archive step)

## TDD entry point

Existing `packages/plugins/plugin-remark/src/serializer.test.ts` GFM golden strings MUST remain green after migration.

## Validation

- `pnpm --filter @aether-md/plugin-remark test`
- `pnpm --filter @aether-md/preset-gfm test`
- `pnpm check`

## Run Log

- 2026-07-06: Task started on `feature/serializer-mdast-convergence`.
- 2026-07-06: Implemented `mdast-mapping.ts`, migrated serializer, preset re-export; `pnpm check` green.
