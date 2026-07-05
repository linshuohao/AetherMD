# Task 11: 全量验证与 validation 记录

Change:

- `add-gfm-preset`

Branch:

- `feat/add-gfm-preset`

Spec Requirement:

- `gfm-preset` / ADDED `GFM preset package exists in workspace`（Scenario: Preset package participates in workspace verification）
- OpenSpec `tasks.md` §6 Verification、§7 Explicit non-goals guard、§8 Workflow follow-up

Source Docs:

- `.superpowers/plans/add-gfm-preset.md`
- `openspec/changes/add-gfm-preset/tasks.md`
- `openspec/changes/add-gfm-preset/proposal.md`
- `docs/engineering/test-strategy.md`

## 目标

跑通 workspace 级 `pnpm check` 与 `openspec validate add-gfm-preset --strict`；确认 Task 01–10 功能矩阵全绿；创建 `.superpowers/runs/add-gfm-preset/validation.md` 验证记录（供 `aether-workflow-validate-task` 完善）。

## 范围

- 运行 root `pnpm check`（build + typecheck + test + skills check：core、plugin-remark、plugin-prosemirror、preset-gfm）。
- 运行 `openspec validate add-gfm-preset --strict`。
- 汇总 per-package test counts 与 guard 结果。
- 若 `pnpm check` FAIL：定位 failing package，**最小** spec 内修复（可能回溯 Task 04/06/07/08/09）。
- 创建/更新 `.superpowers/runs/add-gfm-preset/validation.md`。
- **不** archive OpenSpec change；**不** sync 长期 Docs / main specs（留 `aether-workflow-update-docs-spec`）。

Allowed Files:

- `.superpowers/runs/add-gfm-preset/validation.md`
- `packages/**`（仅修复 `pnpm check` 暴露的 spec 内缺口）
- `pnpm-lock.yaml`（仅缺口修复导致）

Forbidden Files:

- `docs/**`（长期 Docs sync 留 archive 前）
- `openspec/specs/**`（main spec sync 留 archive 前）
- `packages/react/**`
- `AGENTS.md` 及其他无关 dirty 文件
- 任何 `createEditor` 实现
- workflow skill mirrors（`.codex/skills/**`、`.cursor/skills/**`）

## TDD 入口

1. 运行 `pnpm check`；若 FAIL，为缺口写/跑 failing test → 最小修复 → 再跑至 **PASS**。
2. 若全部已绿，以 validate + guard 为入口，在 Deviation 写明「Task 01–10 已覆盖功能矩阵」。
3. 填写 `validation.md`：命令、pass/fail、测试数、non-goals checklist、version impact 确认。

TDD Notes:

- 本 task 以**验证汇总**为主；runtime 修改仅用于修复 check 失败。
- Task 08 integration matrix 与 Task 09 serializer error 路径 MUST 在此 task 前已绿。

Validation:

```bash
pnpm check
openspec validate add-gfm-preset --strict
pnpm core:test
pnpm --filter @aether-md/plugin-remark test
pnpm --filter @aether-md/plugin-prosemirror test
pnpm --filter @aether-md/preset-gfm test
rg -i "remark|prosemirror|react|vue|gfm|createEditor|AetherEditor|EditorContext|preset-gfm" packages/core/package.json packages/core/src
rg "createEditor|AetherEditor|EditorContext|preset-gfm|packages/react" packages/core packages/plugins packages/preset-gfm
rg "transactionFailed" packages/core/src/command-event-runtime.ts
```

预期：全部 **PASS**；validation.md 记录 evidence；non-goals 全勾选。

Intuitive Verification:

- 人工阅读 `validation.md` 与 non-goals checklist。

Review Checklist:

- [ ] `pnpm check` 通过（含 preset-gfm）。
- [ ] `openspec validate add-gfm-preset --strict` 通过。
- [ ] GFM 六类 integration matrix 绿。
- [ ] M3 paragraph/heading round-trip 仍绿。
- [ ] SerializationError / CustomBlock 占位符 绿。
- [ ] Core boundary guards 绿。
- [ ] 无 editor/Shell/Command rollback scope creep。
- [ ] `validation.md` 已创建。
- [ ] 无关 dirty 文件未纳入变更。
- [ ] `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` 仍为 `[1]`。

Rollback Notes:

- 回滚 `validation.md` 与本 task 为修复 check 的最小 code commits。
- 不回滚 Task 01–10 主功能 commits（除非无法分离）。

Version Impact:

- 确认汇总：`@aether-md/core` 无 breaking change；`@aether-md/preset-gfm` 新包 `0.0.0`；plugin packages minor extension；lockfile 来自 `remark-gfm` + workspace links；`manifestVersion` 不变。

Commit Scope:

- `chore: verify add-gfm-preset workspace checks and record validation`

Status:

- complete

Run Log:

- 2026-07-05: Task started; running full workspace validation.
- 2026-07-05: `pnpm check` PASS (107 tests across 4 packages); `openspec validate add-gfm-preset --strict` PASS.
- 2026-07-05: Updated `.superpowers/runs/add-gfm-preset/validation.md` with full summary.

Deviation:

- Task 01–10 deviations recorded in validation.md; no Task 11 runtime fixes required.
