# Task 10: 全量验证（Barrier）

Change:

- `add-react-shell`

Branch:

- `feat/add-react-shell`

Spec Requirement:

- OpenSpec `proposal.md` 验收标准（`pnpm check`、integration、boundary、Phase 0）
- `react-shell` / ADDED `React Shell package is exported as a public adapter package`（Scenario: React package participates in check pipeline）
- `react-shell` / ADDED `React Shell integration tests use happy-dom`（Scenario: GateLock integration test is present — CI gate）
- OpenSpec `tasks.md` §6.1–6.2

Source Docs:

- `.superpowers/plans/add-react-shell.md`
- `openspec/changes/add-react-shell/tasks.md`
- `openspec/changes/add-react-shell/proposal.md`
- `openspec/changes/add-react-shell/design.md`（Non-Goals）

## 目标

跑通 workspace 级 **`pnpm check` 全绿** 与 `openspec validate add-react-shell --strict`；确认 Task 01–09 功能矩阵完整；填写 non-goals checklist 与 validation 记录。**不写新功能**；runtime 修改 **仅** 修复 check 失败的最小 diff。

## 范围

- 运行 root `pnpm check`（skills check + build + typecheck + test：core、plugins、preset-gfm、react）。
- 运行 `openspec validate add-react-shell --strict`。
- 汇总 per-package test counts 与 boundary guard 结果。
- 创建/更新 `.superpowers/runs/add-react-shell/validation.md`（供 `aether-workflow-validate-task` 完善）。
- Non-goals checklist（**只验证，不实现**）：
  - 无 Vue Shell、toolbar、主题、History UI
  - 无 Core Guard 链、Permission enforce、Core store、Shell Adapter
  - 无 `bootstrapCore` silent provide 变更
  - 无 Playwright / 浏览器 CI、`examples/react-basic`
  - Core **无** react/prosemirror/remark runtime deps；生产代码无变更
  - Phase 0 #2 #3 无 deviation
- 若 `pnpm check` FAIL：定位 failing package，**最小** spec 内修复（可能回溯 Task 05–09）。
- **不** archive OpenSpec change；**不** sync 长期 Docs / main specs（留 `aether-workflow-update-docs-spec`）。

Allowed Files:

- `.superpowers/runs/add-react-shell/validation.md`
- `packages/**`（**仅**修复 `pnpm check` 暴露的 spec 内缺口）
- `pnpm-lock.yaml`（仅缺口修复导致）

Forbidden Files:

- `docs/**`（长期 Docs sync 留 archive 前）
- `openspec/specs/**`（main spec sync 留 archive 前）
- `packages/vue/**`
- workflow skill mirrors（`.codex/skills/**`、`.cursor/skills/**`）
- `AGENTS.md` 及其他无关 dirty 文件
- **禁止**新增功能文件、新 export、新 integration scenario

## TDD 入口（Red → Green → Refactor）

**Red**

1. 运行 `pnpm check` → 若 **FAIL**，记录 failing package/test。
2. 运行 `openspec validate add-react-shell --strict` → 若 **FAIL**，记录 artifact 缺口。

**Green**

3. **仅**最小修复使 check 绿（不回溯添加功能）。
4. 重复直至 `pnpm check` **PASS** + openspec strict **PASS**。
5. 填写 `validation.md`：命令、pass/fail、测试数、non-goals checklist、version impact。

**Refactor**

6. 无代码 refactor；仅 validation 记录整理。

TDD Notes:

- 本 task 以**验证汇总**为主；**Barrier=true**，阻塞 implementation complete 标记。
- Task 01–09 MUST 在功能上已完成；本 task **不写新功能**。

Validation:

```bash
pnpm check
openspec validate add-react-shell --strict

pnpm --filter @aether-md/react test
pnpm --filter @aether-md/plugin-prosemirror test
pnpm core:test
pnpm --filter @aether-md/preset-gfm test

# Package Boundary Guard（汇总）：
rg -i "from ['\"]react|from ['\"]prosemirror|from ['\"]remark|from ['\"]@aether-md/preset-gfm|from ['\"]@aether-md/plugin-" packages/core/src --glob '!**/*.test.ts' --glob '!**/*.integration.test.ts'
rg -i "from ['\"]prosemirror-view|ShellAdapter" packages/react/src --glob '!**/*.test.ts' --glob '!**/*.test.tsx'
node -e "const p=require('./packages/core/package.json'); console.log('core deps',Object.keys(p.dependencies||{}).filter(x=>/react|prosemirror|remark/.test(x)))"
node -e "const p=require('./packages/react/package.json'); const d=Object.keys(p.dependencies||{}); console.log('plugin-prosemirror', d.includes('@aether-md/plugin-prosemirror')); console.log('forbidden', d.filter(x=>/prosemirror-view|remark/.test(x)))"
rg "ReactEditor" packages/core/src/package-boundary.test.ts
```

预期：全部 **PASS**；`validation.md` 含 evidence + non-goals checklist；M1–M4.5 + M5 矩阵绿。

Intuitive Verification:

- 人工阅读 `validation.md` 与 non-goals checklist（proposal Non-Goals + design Non-Goals）。

Review Checklist:

- [ ] **`pnpm check` 全绿**（Barrier 硬门槛）。
- [ ] `openspec validate add-react-shell --strict` 通过。
- [ ] React integration（07）+ GateLock integration（08）+ GFM smoke（09）绿。
- [ ] M1–M4.5 既有测试仍绿。
- [ ] Core boundary guards 绿；**无** react/prosemirror/remark runtime deps；core 生产无变更。
- [ ] React 生产无 `prosemirror-view` 直 import；无 ShellAdapter。
- [ ] Phase 0 #2 #3 无 deviation。
- [ ] Non-goals checklist 全部勾选（Vue、Playwright、Core store、bootstrap silent provide 等 **未** scope creep）。
- [ ] `validation.md` 已创建。
- [ ] **无新功能** commit 在本 task。
- [ ] `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` 仍为 `[1]`。

Rollback Notes:

- 回滚 `validation.md` 与本 task 为修复 check 的最小 code commits。
- 不回滚 Task 01–09 主功能 commits（除非无法分离）。

Version Impact:

- 确认汇总：`@aether-md/react` 新 package；`@aether-md/plugin-prosemirror` minor additive；`@aether-md/core` **无 breaking**；lockfile 合理；`manifestVersion` 不变。

Commit Scope:

- `chore: verify add-react-shell workspace checks and record validation`

Depends On:

- 07, 08, 09

Parallel Group:

- barrier

Barrier:

- **true**

Status:

- completed

Run Log:

- 2026-07-05: Barrier validation — `pnpm check` PASS; `openspec validate add-react-shell --strict` PASS.
- Created `.superpowers/runs/add-react-shell/validation.md` with non-goals checklist.

Deviation:

- none (no check-fix code changes required)

Rollback:

- 见 Rollback Notes
