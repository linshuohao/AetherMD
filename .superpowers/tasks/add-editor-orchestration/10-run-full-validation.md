# Task 10: 全量验证（Barrier）

Change:

- `add-editor-orchestration`

Branch:

- `feat/add-editor-orchestration`

Spec Requirement:

- OpenSpec `proposal.md` 验收标准（`pnpm check`、integration、boundary、Phase 0）
- `editor-orchestration` / ADDED `Headless GFM preset integration is verified through createEditor`（workspace CI gate）
- OpenSpec `tasks.md` §5.1–5.2

Source Docs:

- `.superpowers/plans/add-editor-orchestration.md`
- `openspec/changes/add-editor-orchestration/tasks.md`
- `openspec/changes/add-editor-orchestration/proposal.md`

## 目标

跑通 workspace 级 **`pnpm check` 全绿** 与 `openspec validate add-editor-orchestration --strict`；确认 Task 01–09 功能矩阵完整；创建 `.superpowers/runs/add-editor-orchestration/validation.md` 验证记录（供 `aether-workflow-validate-task` 完善）。

## 范围

- 运行 root `pnpm check`（skills check + build + typecheck + test：core、plugins、preset-gfm）。
- 运行 `openspec validate add-editor-orchestration --strict`。
- 汇总 per-package test counts 与 boundary guard 结果。
- 若 `pnpm check` FAIL：定位 failing package，**最小** spec 内修复（可能回溯 Task 05–09）。
- 创建/更新 `.superpowers/runs/add-editor-orchestration/validation.md`。
- **不** archive OpenSpec change；**不** sync 长期 Docs / main specs（留 `aether-workflow-update-docs-spec`）。
- **不**创建 `packages/react`。

Allowed Files:

- `.superpowers/runs/add-editor-orchestration/validation.md`
- `packages/**`（仅修复 `pnpm check` 暴露的 spec 内缺口）
- `pnpm-lock.yaml`（仅缺口修复导致）

Forbidden Files:

- `docs/**`（长期 Docs sync 留 archive 前）
- `openspec/specs/**`（main spec sync 留 archive 前）
- `packages/react/**`
- `packages/vue/**`
- workflow skill mirrors（`.codex/skills/**`、`.cursor/skills/**`）
- `AGENTS.md` 及其他无关 dirty 文件

## TDD 入口（Red → Green → Refactor）

**Red**

1. 运行 `pnpm check` → 若 **FAIL**，记录 failing package/test → 写/跑 targeted failing test → 最小修复。

**Green**

2. 重复直至 `pnpm check` **PASS**。
3. 运行 `openspec validate add-editor-orchestration --strict` → **PASS**。
4. 填写 `validation.md`：命令、pass/fail、测试数、non-goals checklist、version impact。

**Refactor**

5. 无代码 refactor；仅 validation 记录整理。

TDD Notes:

- 本 task 以**验证汇总**为主；runtime 修改仅用于修复 check 失败。
- Task 01–09 MUST 在功能上已完成；本 task 为 **Barrier**，阻塞 implementation complete 标记。

Validation:

```bash
pnpm check
openspec validate add-editor-orchestration --strict
pnpm core:test
pnpm --filter @aether-md/core test
pnpm --filter @aether-md/plugin-remark test
pnpm --filter @aether-md/plugin-prosemirror test
pnpm --filter @aether-md/preset-gfm test
rg -i "from ['\"]remark|from ['\"]prosemirror|from ['\"]react|from ['\"]@aether-md/preset-gfm|from ['\"]@aether-md/plugin-" packages/core/src --glob '!**/*.test.ts' --glob '!**/*.integration.test.ts'
node -e "const p=require('./packages/core/package.json'); console.log('deps',Object.keys(p.dependencies||{})); console.log('devDeps preset', (p.devDependencies||{})['@aether-md/preset-gfm'])"
rg "createGfmPreset" packages/core/src/index.ts
rg "packages/react" packages/core
```

预期：全部 **PASS**；`validation.md` 记录 evidence；M1–M4 regression 绿；createEditor integration 绿。

Intuitive Verification:

- 人工阅读 `validation.md` 与 non-goals checklist（Phase 0 + proposal 非目标）。

Review Checklist:

- [ ] **`pnpm check` 全绿**（Barrier 硬门槛）。
- [ ] `openspec validate add-editor-orchestration --strict` 通过。
- [ ] createEditor GFM integration ≥3 fixtures 绿。
- [ ] M1–M4 既有测试仍绿。
- [ ] Core boundary guards 绿；无 react/remark/prosemirror **runtime** deps。
- [ ] 无 Shell / GateLock / bootstrap silent provide scope creep。
- [ ] `validation.md` 已创建。
- [ ] 无关 dirty 文件未纳入变更。
- [ ] `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` 仍为 `[1]`。

Rollback Notes:

- 回滚 `validation.md` 与本 task 为修复 check 的最小 code commits。
- 不回滚 Task 01–09 主功能 commits（除非无法分离）。

Version Impact:

- 确认汇总：`@aether-md/core` minor additive；M1–M4 无 breaking；lockfile devDeps only；`manifestVersion` 不变。

Commit Scope:

- `chore: verify add-editor-orchestration workspace checks and record validation`

Depends On:

- 09

Parallel Group:

- G6

Barrier:

- **true**

Status:

- completed

Run Log:

- Barrier: `pnpm check` PASS (12/12 tasks); `openspec validate add-editor-orchestration --strict` PASS
- Record: `.superpowers/runs/add-editor-orchestration/validation.md` updated with evidence

Deviation:

- Fixed Task 08 dist race via `dist-test/` (see Task 08 Deviation)

Rollback:

- 见 Rollback Notes
