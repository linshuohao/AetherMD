# Task 06: 实现 plugin-prosemirror GFM engine/conversion

Change:

- `add-gfm-preset`

Branch:

- `feat/add-gfm-preset`

Spec Requirement:

- `adapter-base` / ADDED `ProseMirror engine preserves GFM structures through edit leg`

OpenSpec Tasks:

- `openspec/changes/add-gfm-preset/tasks.md` §3.1–3.5

Source Docs:

- `.superpowers/plans/add-gfm-preset.md`
- `openspec/changes/add-gfm-preset/specs/adapter-base/spec.md`
- `docs/engineering/adapter-protocol.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`

## 目标

扩展 `@aether-md/plugin-prosemirror` PM schema 与 conversion，使 Task 05 GFM engine tests 全绿；list nodes、link/strong/emphasis marks 在 edit leg 后保留。

## 范围

- `engine.ts`：扩展 schema（`bullet_list` / `ordered_list` / `list_item`；marks `strong` / `emphasis` / `link` with `href`）。
- `conversion.ts`：更新 `aetherDocToPm` / `pmToAetherDoc` 保留 GFM 结构。
- 微调 `engine.test.ts` 与实现对齐。
- 确认 M3 `round-trip.test.ts` 仍 **PASS**。
- **不**修改 remark package；**不**添加 preset integration tests。

Allowed Files:

- `packages/plugins/plugin-prosemirror/src/engine.ts`
- `packages/plugins/plugin-prosemirror/src/conversion.ts`
- `packages/plugins/plugin-prosemirror/src/engine.test.ts`（对齐小改）
- `packages/plugins/plugin-prosemirror/package.json`（仅 PM schema 相关依赖，若需）
- `pnpm-lock.yaml`（若 dependency 变更）

Forbidden Files:

- `packages/plugins/plugin-remark/src/**`
- `packages/core/src/**`、`packages/core/package.json`
- `packages/preset-gfm/**`
- `packages/plugins/plugin-prosemirror/src/round-trip.test.ts`（M3 integration 留 Task 08 确认）
- `docs/**`、`openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 运行 Task 05 failing tests → **FAIL**。
2. 实现 schema + conversion 最小路径。
3. `pnpm --filter @aether-md/plugin-prosemirror test` → **PASS**（含 M3 regression）。

TDD Notes:

- Green Task 05 tests；失败 apply 路径 MUST 返回 pre-apply snapshot。

Validation:

```bash
pnpm --filter @aether-md/plugin-prosemirror test
pnpm --filter @aether-md/plugin-prosemirror exec tsc --noEmit
rg "prosemirror|remark" packages/core/package.json packages/core/src
```

预期：prosemirror 全 tests **PASS**；Core 无 prosemirror 依赖。

Intuitive Verification:

- 可选：对 GFM fixture 比较 apply 前后 `getDocument` JSON diff，确认未编辑块不变。

Review Checklist:

- [ ] Task 05 tests 全 PASS。
- [ ] apply 失败不污染 GFM snapshot。
- [ ] M3 paragraph/heading engine behavior 不退化。
- [ ] Core 未添加 prosemirror 依赖。

Rollback Notes:

- 回滚 `engine.ts`、`conversion.ts`、`package.json`、`pnpm-lock.yaml` 本 task 改动。

Version Impact:

- `@aether-md/plugin-prosemirror`：**minor-level behavior extension**（GFM schema/conversion）
- `manifestVersion` / Core：**不变**

Commit Scope:

- `feat(plugin-prosemirror): preserve GFM structures through engine apply leg`

Status:

- complete

Run Log:

- 2026-07-05: Task started; implementing PM GFM schema and conversion.
- 2026-07-05: Extended schema with bullet_list/ordered_list/list_item and strong/emphasis/link marks.
- 2026-07-05: Validation — `pnpm --filter @aether-md/plugin-prosemirror test` 13/13 pass.

Deviation:

- none
