# Validation Record: add-adapter-base

## Scope

- Change: add-adapter-base
- Branch: feat/add-adapter-base
- Tasks: 01–08 complete
- Version impact: @aether-md/core minor additive exports; new @aether-md/plugin-remark and @aether-md/plugin-prosemirror (0.0.0); manifestVersion unchanged; pnpm-lock.yaml updated for Remark/PM deps

## Commands

| Command | Purpose | Result | Notes |
| --- | --- | --- | --- |
| `pnpm --filter @aether-md/core test` | core contract + boundary | PASS | 49 tests |
| `pnpm --filter @aether-md/plugin-remark test` | remark parser/serializer | PASS | 7 tests |
| `pnpm --filter @aether-md/plugin-prosemirror test` | engine + round-trip | PASS | 8 tests |
| `pnpm check` | workspace build/typecheck/test | PASS | 3 packages, turbo 9 tasks |
| `openspec validate add-adapter-base --strict` | OpenSpec change validity | PASS | |
| Core rg guard | no remark/prosemirror/react in core prod | PASS | test assertion strings excluded |
| Repo scope rg guard | no createEditor/Shell/GFM in packages | PASS | test strings excluded |
| `rg transactionFailed command-event-runtime.ts` | no Bus rollback integration | PASS | no matches |

## Test Summary

| Package | Tests | Pass | Fail |
| --- | --- | --- | --- |
| @aether-md/core | 49 | 49 | 0 |
| @aether-md/plugin-remark | 7 | 7 | 0 |
| @aether-md/plugin-prosemirror | 8 | 8 | 0 |
| **Total** | **64** | **64** | **0** |

## Non-goals Checklist (§8)

- [x] 无 `createEditor` / `AetherEditor` / React Shell / GFM preset 实现
- [x] 无 Command Bus 自动 rollback / `transactionFailed` auto emit
- [x] 无 `bootstrapCore` silent provide `core:engine` / `core:parser`
- [x] 无 M1 follow-up 实现（deferred）
- [x] M3 测试矩阵未扩展到 list/link/mark GFM 全覆盖

## M1 Follow-up Deferred

- duplicate plugin name handling
- partial cleanup on startup failure
- dispose public contract refinement

## TDD Integrity (per task)

| Task | Red signal | Green result |
| --- | --- | --- |
| 01 | missing AetherDoc/AetherSchema exports | document-model.ts + shape tests |
| 02 | missing adapter types/errors/boundary | adapter-types.ts, errors, boundary |
| 03 | parser contract failures | plugin-remark ParserAdapter |
| 04 | serializer contract failures | SerializerAdapter deterministic output |
| 05 | engine contract failures | EngineAdapter create/apply/dispose |
| 06 | round-trip pipeline failures | cross-package integration tests |
| 07 | boundary gap assertions | M1 adapter capability + deps guards |
| 08 | pnpm check / openspec validate | all green |

## Deviations

- Task 03: unknown Markdown syntax (e.g. list) degrades via JSON.stringify of mdast node rather than structured ListBlock — within M3 scope (no list round-trip required).
- Task 07: Task 02 already covered primary boundary; Task 07 added M1 capability + package.json dependency guards.

## Intuitive Verification

- Round-trip integration tests assert predictable Markdown after `replaceText` edit.
- No manual demo script required.

## Changed-file Check

- All changes scoped to Task 01–08 allowed files.
- Unrelated dirty files (OpenSpec/Superpowers artifacts) pre-existed; no AGENTS.md or docs/** modified.

## Failures And Deviations

- none blocking

## Ready for Compliance Review

- Yes — all 8 tasks implemented, validated, and recorded.
