# Task 05: 定义 plugin-prosemirror GFM engine 失败测试

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
- `docs/engineering/test-strategy.md`

## 目标

在 `@aether-md/plugin-prosemirror` 添加 GFM engine/conversion **失败测试**：schema 扩展后的 apply 成功/失败快照；`aetherDocToPm` / `pmToAetherDoc` GFM fixture 往返。

## 范围

- **仅添加/更新测试**，不修改 PM schema 或 conversion 生产代码。
- 共享 GFM fixture `AetherDoc` JSON（list、link、strong/emphasis marks）。
- `engine.test.ts`（或等价）：
  - GFM fixture → `create` → 成功 `apply`（`replaceText` 最小编辑）→ `getDocument` 在未编辑块保留 list/link/mark。
  - 失败 `apply` → `getDocument` 为 apply 前快照；GFM 结构不被污染。
- `conversion` tests（可 inline 于 engine test 或独立）：
  - `aetherDocToPm` / `pmToAetherDoc` 往返 GFM fixture 结构。
- 确认 `round-trip.test.ts` M3 paragraph/heading 样例仍 **PASS**（不修改其断言，仅 regression）。
- **不**添加 cross-package integration（Task 08）；**不** scaffold preset（Task 07）。

Allowed Files:

- `packages/plugins/plugin-prosemirror/src/engine.test.ts`
- `packages/plugins/plugin-prosemirror/src/**/*conversion*.test.ts`（若新建）
- `packages/plugins/plugin-prosemirror/src/fixtures/**`（GFM `AetherDoc` JSON fixtures，可选）

Forbidden Files:

- `packages/plugins/plugin-prosemirror/src/engine.ts`
- `packages/plugins/plugin-prosemirror/src/conversion.ts`
- `packages/plugins/plugin-prosemirror/package.json`（schema 依赖变更在 Task 06）
- `packages/plugins/plugin-remark/src/**`（除只读 fixture 参考）
- `packages/core/src/**`
- `packages/preset-gfm/**`
- `docs/**`、`openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 添加 GFM apply 成功/失败 snapshot failing tests → `pnpm --filter @aether-md/plugin-prosemirror test` **FAIL**。
2. 添加 conversion round-trip failing tests → **FAIL**。
3. `round-trip.test.ts` M3 tests → **PASS**。

TDD Notes:

- Red-first；Task 06 实现 schema/conversion/engine 使 tests 变绿。
- 使用与 Task 04 一致的 GFM `AetherDoc` 形状作 contract 中间断言。

Validation:

```bash
pnpm --filter @aether-md/plugin-prosemirror test
pnpm --filter @aether-md/plugin-prosemirror exec tsc --noEmit
rg "prosemirror|remark" packages/core/package.json packages/core/src
```

预期：新增 GFM engine tests **FAIL**；M3 `round-trip.test.ts` **PASS**。

Intuitive Verification:

- 阅读 failing 输出：`getDocument` 是否将 list/mark 降级为 plain text。

Review Checklist:

- [ ] 仅修改/新增 test 文件与 fixtures。
- [ ] 覆盖 apply 成功保留 GFM 结构与 apply 失败快照语义。
- [ ] conversion 往返测试存在。
- [ ] 未 touch cross-package round-trip 或 preset。

Rollback Notes:

- 删除本 task 新增 tests 与 fixtures。

Version Impact:

- none（仅测试）

Commit Scope:

- `test(plugin-prosemirror): add failing GFM engine and conversion tests`

Status:

- complete

Run Log:

- 2026-07-05: Task started; adding GFM engine/conversion failing tests.
- 2026-07-05: Added conversion.test.ts, GFM engine tests, fixtures/gfm-doc.ts.
- 2026-07-05: Validation — 5 GFM FAIL, 8 pass (M3 round-trip included).

Deviation:

- none
