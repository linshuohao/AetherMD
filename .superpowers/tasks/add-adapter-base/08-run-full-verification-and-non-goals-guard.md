# Task 08: 全量验证与非目标护栏（verification 汇总）

Change:

- `add-adapter-base`

Spec Requirement:

- `Adapter packages participate in workspace verification`
- `M3 does not integrate Command Bus automatic rollback`
- OpenSpec `tasks.md` §7 Verification、§8 Explicit non-goals guard、§9 Workflow follow-up

Source Docs:

- `.superpowers/plans/add-adapter-base.md`
- `openspec/changes/add-adapter-base/tasks.md`
- `openspec/changes/add-adapter-base/proposal.md`（非目标列表）
- `docs/engineering/test-strategy.md`

## 目标

跑通 workspace 级 `pnpm check` 与 `openspec validate add-adapter-base --strict`，执行全仓库 scope guard，确认 non-goals 未混入，并起草 `.superpowers/runs/add-adapter-base/validation.md` 验证记录（供 Step 5 validate-task 完善）。

## 范围

- 运行 root `pnpm check`（build + typecheck + test：core + plugin-remark + plugin-prosemirror）。
- 运行 `openspec validate add-adapter-base --strict`。
- 运行 plan 中全仓库 guard：
  ```bash
  rg "createEditor|AetherEditor|EditorContext|preset-gfm|packages/react" packages/core packages/plugins
  rg "from 'remark|from 'prosemirror" packages/core
  ```
- Non-goals checklist（§8）：
  - 无 `createEditor` / `AetherEditor` / React Shell / GFM preset。
  - 无 Command Bus 自动 rollback / `transactionFailed` auto emit。
  - 无 `bootstrapCore` silent provide `core:engine` / `core:parser`。
  - 无 M1 follow-up 实现。
- 创建或更新 `.superpowers/runs/add-adapter-base/validation.md`（记录命令输出摘要、测试计数、guard 结果）。
- **不**修改长期 Docs / main specs（Step 8 sync）；**不** archive OpenSpec change。
- **不**新增 runtime 功能，除非 `pnpm check` 暴露缺口且仍在 OpenSpec 内。

Allowed Files:

- `.superpowers/runs/add-adapter-base/validation.md`
- `packages/**`（仅修复 `pnpm check` 暴露的 spec 内缺口）
- `pnpm-lock.yaml`（仅缺口修复导致）

Forbidden Files:

- `docs/**`（长期 Docs sync 留 Step 8）
- `openspec/specs/**`（main spec sync 留 archive 前）
- `packages/react/**`、`packages/preset-gfm/**`
- `AGENTS.md` 及其他无关 dirty 文件
- 任何 `createEditor` 实现

## TDD 入口

1. 运行 `pnpm check`；若 FAIL，定位 failing package/test，为缺口写失败测试（在对应 package）→ 最小修复 → 再跑至 PASS。
2. 若全部已绿，以 guard + validate 作为验证入口，在 Deviation 写明「Task 01–07 已覆盖功能矩阵」。
3. 填写 validation.md：命令、pass/fail、测试数、non-goals checklist。

TDD Notes:

- 本 task 以**验证汇总**为主；runtime 修改仅用于修复 check 失败。
- 不把 GFM round-trip 或 editor 入口加入验收。

Implementation Notes:

- validation.md 说明性正文中文；命令/API/path English。
- 确认未暂存无关文件（如 `AGENTS.md`）。
- M1 follow-up 三项在 validation.md 明确标记 deferred。

## 验证命令

```bash
pnpm check
openspec validate add-adapter-base --strict
pnpm --filter @aether-md/core test
pnpm --filter @aether-md/plugin-remark test
pnpm --filter @aether-md/plugin-prosemirror test
rg -i "remark|prosemirror|react|vue|gfm|createEditor|AetherEditor|EditorContext" packages/core/package.json packages/core/src
rg "createEditor|AetherEditor|EditorContext|preset-gfm|packages/react" packages/core packages/plugins
rg "transactionFailed" packages/core/src/command-event-runtime.ts
```

预期：全部 PASS；Command runtime 无 Adapter rollback 集成；scope guard 无违规实现。

Intuitive Verification:

- 人工阅读 `validation.md` non-goals checklist 全部勾选。

Review Checklist:

- [ ] `pnpm check` 通过（三 packages）。
- [ ] `openspec validate add-adapter-base --strict` 通过。
- [ ] 全仓库 scope guard 通过。
- [ ] M2 Command/Event 仍独立；无 `transactionFailed` 自动集成。
- [ ] 无 GFM / Shell / `createEditor` / bootstrap Adapter 加载。
- [ ] M1 follow-up deferred 已记录。
- [ ] `validation.md` 已创建/更新。
- [ ] 无关 dirty 文件未纳入变更。

Rollback Notes:

- 回滚 validation.md 与为本 task 修复 check 的最小 code commits。
- 不回滚 Task 01–07 主功能 commits（除非无法分离）。

Version Impact:

- 确认：`manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` 不变；lockfile 变更应仅来自 plugin packages（Task 03–06）；Core public exports 为 Task 01–02 增量。

Commit Scope:

- `chore: verify add-adapter-base workspace checks and record validation`

Status:

- complete

Run Log:

- 2026-07-05: pnpm check PASS (64 tests); openspec validate --strict PASS; scope guards PASS; validation.md finalized.

Deviation:

- Task 01–07 covered functional matrix; this task validation-only.
