# Task 01: Implement Slice D list block morphing

**Change:** `block-morphing-slice-d`  
**Status:** completed  
**Depends On:**  
**Parallel Group:**  
**Barrier:** false

## Goal

Deliver L2 Slice D: list block morphing, preset `interactiveRenderers`, whole-block replaceText, React registry integration, tests, and example update.

## Allowed files

- `packages/core/src/adapter-types.ts`
- `packages/core/src/editor/engine-dispatch.ts`
- `packages/plugins/plugin-prosemirror/src/engine.ts`
- `packages/plugins/plugin-prosemirror/src/engine.test.ts`
- `packages/plugins/plugin-remark/src/mdast-mapping.ts`
- `packages/preset-gfm/src/**`
- `packages/react/src/**`
- `examples/block-morphing/**`
- `openspec/specs/**` (sync in archive)

## TDD entry point

New Slice D tests in `block-morphing.integration.test.tsx`; existing Slice A/B/C must stay green.

## Validation

- `pnpm check`

## Run Log

- 2026-07-06: Started on `feat/block-morphing-slice-d`.
