# Task 07: 强化 package-boundary 与 rg guard 收尾

Change:

- `add-adapter-base`

Spec Requirement:

- `core-bootstrap` MODIFIED：`M1 excludes later milestone behavior`
- `Core package boundary excludes editor and shell entrypoints`
- `M3 does not integrate Command Bus automatic rollback`（确认 runtime 未改）

Source Docs:

- `.superpowers/plans/add-adapter-base.md`
- `openspec/changes/add-adapter-base/specs/core-bootstrap/spec.md`
- `openspec/changes/add-command-event-runtime/spec.md`（M2 独立性）
- `docs/engineering/test-strategy.md`

## 目标

在 Task 02 boundary 基础上做**收尾强化**：对照 OpenSpec 全量 M3/M4/M5 禁止面复查 `package-boundary.test.ts`，运行 Core `rg` guard，确认 M2 Command/Event tests 未引入 Adapter 依赖，确认 non-goals（无 `createEditor`、无 bootstrap silent provide）。

## 范围

- 复查/补强 `packages/core/src/package-boundary.test.ts`：
  - M1 bootstrap + M2 Command/Event + M3 document/adapter exports 共存。
  - 禁止 `createEditor`、`AetherEditor`、`EditorContext`、Shell、GFM preset exports。
  - Core `package.json` 无 remark/prosemirror/react/vue dependencies。
- 运行 Core scope `rg` guard（plan Package Boundary Guard 表）。
- 确认 `command-event-runtime.test.ts` 仍绿且 **未** 新增 Adapter/document snapshot 断言。
- 确认 `bootstrap.ts` / `capabilities.ts` **未** silent provide `core:engine` / `core:parser`。
- **不**运行全 repo `pnpm check`（Task 08）；**不**写 validation.md 终稿（Task 08）。

Allowed Files:

- `packages/core/src/package-boundary.test.ts`
- `packages/core/src/command-event-runtime.test.ts`（仅当需修复因 M3 exports 导致的 import 回归；不得加 Adapter 集成测试）

Forbidden Files:

- `packages/plugins/**`（本 task 不改 plugin 实现）
- `packages/core/src/bootstrap.ts`、`capabilities.ts`（禁止借机做 M1 follow-up 或 Adapter 加载）
- `packages/react/**`、`packages/preset-gfm/**`
- `docs/**`、`openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 对照 OpenSpec `core-bootstrap` MODIFIED scenarios，列出 boundary 可能缺口；为缺口写失败断言。
2. 若 M2 tests 因 export 面变化失败，先写/修失败测试再最小修复。
3. 运行 `pnpm --filter @aether-md/core test` + Core `rg` guard → 全 PASS。
4. 若无缺口，在 Deviation 记录「Task 02 已覆盖，本 task 以 rg + 全 core suite 为验证入口」。

TDD Notes:

- 优先补 boundary 断言，不扩 runtime 功能。
- Command Bus 与 Adapter 集成 **仍** out of scope。

Implementation Notes:

- `EngineAdapter.getDocument` 允许 export；`AetherEditor.getDocument` **禁止** export。
- M1 follow-up（duplicate name、partial cleanup、dispose public contract）**不得**在本 task 实现。

## 验证命令

```bash
pnpm --filter @aether-md/core test
pnpm --filter @aether-md/core exec tsc --noEmit
rg -i "remark|prosemirror|react|vue|gfm|createEditor|AetherEditor|EditorContext" packages/core/package.json packages/core/src
rg "core:engine|core:parser" packages/core/src/capabilities.ts packages/core/src/bootstrap.ts
```

预期：core tests 绿；Core 无引擎/UI 依赖；capabilities 未 silent provide adapter capabilities。

Intuitive Verification:

- 人工确认 `index.ts` export 列表无 editor/shell 符号。

Review Checklist:

- [ ] boundary tests 覆盖 M3 允许面 + M4/M5 禁止面。
- [ ] M2 Command/Event tests 仍独立，无 Adapter rollback。
- [ ] `bootstrap.ts` / `capabilities.ts` 未做 Adapter 集成。
- [ ] M1 follow-up 未实现。
- [ ] 未修改 plugin packages。

Rollback Notes:

- 仅回滚本 task 对 `package-boundary.test.ts` / M2 test 的修改。

Version Impact:

- none（测试面调整；无新 public API）

Commit Scope:

- `test(core): reinforce M3 package boundary and scope guards`

Status:

- complete

Run Log:

- 2026-07-05: Added M1 adapter capability + package.json dependency guards; core 49/49 PASS; rg guards PASS.

Deviation:

- Task 02 covered primary M3 boundary; this task added reinforcement only.
