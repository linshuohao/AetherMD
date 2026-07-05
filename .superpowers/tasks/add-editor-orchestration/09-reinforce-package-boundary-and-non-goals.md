# Task 09: 强化 package boundary 与非目标护栏

Change:

- `add-editor-orchestration`

Branch:

- `feat/add-editor-orchestration`

Spec Requirement:

- `core-bootstrap` / MODIFIED `Minimal Core package exists`（Scenario: does not expose React Shell / GFM preset factory）
- `core-bootstrap` / MODIFIED `M1 excludes later milestone behavior`（Scenario: Core package boundary excludes shell and preset implementation entrypoints）
- `command-event-runtime` / MODIFIED `M2 package boundary excludes later milestones`（standalone M2 tests）
- OpenSpec `tasks.md` §4.1–4.2、§7 non-goals

Source Docs:

- `.superpowers/plans/add-editor-orchestration.md`（Package Boundary Guard 表）
- `openspec/changes/add-editor-orchestration/specs/core-bootstrap/spec.md`
- `openspec/changes/add-editor-orchestration/proposal.md`（非目标）
- `docs/architecture/core-api.md`（Phase 0）

## 目标

确认/补全 `@aether-md/core` M4.5 boundary tests 与 static guards：`createEditor`/`AetherEditor` export **允许**；Shell/GFM preset re-export **禁止**；Core **dependencies** 无 remark/prosemirror/react/vue；M2 standalone 无 adapter rollback；non-goals checklist 通过。**不**跑全量 `pnpm check`（Task 10）。

## 范围

- 更新 `package-boundary.test.ts`（若 Task 01 后需增补）：
  - assert `createEditor` exported。
  - assert **无** `createGfmPreset`、`ReactEditor`、`createEditorSync`。
  - assert M1–M3 surfaces 仍 present。
- 运行 plan Package Boundary Guard 命令并记录结果到 Run Log。
- Non-goals 静态审查（**不改** bootstrap/command 生产语义，仅确认）：
  - 无 `@aether-md/react` / Vue / GateLock。
  - 无 bootstrap silent provide `core:engine` / `core:parser`。
  - raw `createCommandEventRuntime` 无 `transactionFailed` auto emit。
  - 无 Core store / sync createEditor / Shell Adapter。
- 确认 M1–M4 测试在 `pnpm core:test` 下绿。

Allowed Files:

- `packages/core/src/package-boundary.test.ts`
- `packages/core/package.json`（仅确认 dependencies — 预期无非法 runtime dep diff）

Forbidden Files:

- `packages/core/src/bootstrap.ts`、`capabilities.ts`、`command-event-runtime.ts`（non-goals 审查 only）
- `packages/react/**`
- `packages/preset-gfm/src/**`
- `docs/**`、`openspec/specs/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口（Red → Green → Refactor）

**Red**

1. 若缺 M4.5 boundary 断言：写 failing test → 补断言 → **PASS**。
2. 运行 guard `rg` 命令；若有违规命中 → 修复对应 task 文件（最小 diff）→ 再跑至 clean。

**Green**

3. `pnpm core:test` 全绿；guard 命令无生产代码违规。

**Refactor**

4. 整理 boundary test describe 块（M4 vs M4.5 注释）。

TDD Notes:

- 以 boundary tests + rg guards 为入口；生产变更预期最小。

Validation:

```bash
pnpm core:test
pnpm --filter @aether-md/core exec tsc --noEmit
rg -i "from ['\"]remark|from ['\"]prosemirror|from ['\"]react|from ['\"]@aether-md/preset-gfm|from ['\"]@aether-md/plugin-" packages/core/src --glob '!**/*.test.ts' --glob '!**/*.integration.test.ts'
node -e "const p=require('./packages/core/package.json'); const d=Object.keys(p.dependencies||{}); console.log(d.filter(x=>/remark|prosemirror|react|vue|preset-gfm|plugin-/.test(x)))"
rg "createEditorSync|createEditorLite" packages/core/src
rg "transactionFailed" packages/core/src/command-event-runtime.ts
rg "core:engine|core:parser" packages/core/src/bootstrap.ts packages/core/src/capabilities.ts
rg "createGfmPreset|preset-gfm" packages/core/src/index.ts
```

预期：core tests **PASS**；dependencies 过滤输出 `[]`；non-goals rg clean。

Intuitive Verification:

- 人工勾选 plan Package Boundary Guard 表与非目标列表。

Review Checklist:

- [ ] createEditor export 允许；preset/Shell 仍 forbid。
- [ ] Core dependencies 无引擎/UI 包。
- [ ] M2 无 adapter rollback 集成。
- [ ] Phase 0 三项决策无 deviation。
- [ ] 未跑 `pnpm check`（留 Task 10）。

Rollback Notes:

- 回滚 `package-boundary.test.ts` 本 task 增补。

Version Impact:

- none（boundary tests / guards only）
- `manifestVersion`：**不变**

Commit Scope:

- `test(core): reinforce M4.5 package boundary and non-goals guards`

Depends On:

- 08

Parallel Group:

- G5

Barrier:

- false

Status:

- completed

Run Log:

- Green: `package-boundary.test.ts` M4.5 asserts; rg guards clean; `pnpm core:test` PASS
- Guards: no prod remark/prosemirror/react imports; deps `[]`; no createGfmPreset re-export

Deviation:

- none

Rollback:

- 见 Rollback Notes
