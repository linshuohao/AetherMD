# Task 08: 运行全量 validation

Change:

- `harden-core-bootstrap-lifecycle`

Branch:

- `fix/harden-core-bootstrap-lifecycle`

Spec Requirement:

- OpenSpec `tasks.md` §4 回归与 §5 workflow 前置验证
- 全部 delta spec scenarios（通过 Tasks 01–07 聚合验证）

Source Docs:

- `.superpowers/plans/harden-core-bootstrap-lifecycle.md`
- `openspec/changes/harden-core-bootstrap-lifecycle/tasks.md`
- `docs/engineering/test-strategy.md`
- `docs/architecture/ci-checklist.md`

Allowed Files:

- `.superpowers/runs/harden-core-bootstrap-lifecycle/validation.md`（创建或追加）
- `.superpowers/tasks/harden-core-bootstrap-lifecycle/*.md`（更新 Status / Run Log 引用）

Forbidden Files:

- `packages/core/src/**`（本 task 不修改 runtime 或 test code）
- `docs/**`
- `openspec/**`（除 validate 只读）

Implementation Notes:

- 本 task **只运行验证并记录**，不修复代码（失败则 pause 并回到对应 task）。
- 按顺序执行并记录 exit code、摘要输出：

```bash
pnpm --filter @aether-md/core exec tsc --noEmit
pnpm --filter @aether-md/core test -- --run
openspec validate harden-core-bootstrap-lifecycle
pnpm check
```

- 将结果写入 `.superpowers/runs/harden-core-bootstrap-lifecycle/validation.md`，包含：
  - 日期、branch、change name
  - 各命令 exit code
  - core test 计数（pass/fail/skip）
  - 失败项与映射 task id

TDD Notes:

- 全量 test suite 为 final green gate。
- `pnpm check` 为 workspace integration gate。

Validation:

- 上述四条命令均 **exit 0**。

Intuitive Verification:

- 打开 validation.md，确认四条命令均有记录且 PASS。

Review Checklist:

- [ ] 无 production code diff in this task。
- [ ] validation.md 存在且完整。
- [ ] openspec validate 仍 green。
- [ ] 失败未 silent ignore。

Rollback Notes:

- 删除或修订 `validation.md` 条目即可；不涉及 code revert。

Version Impact:

- none

Commit Scope:

- `chore(superpowers): record harden-core-bootstrap-lifecycle validation`

Status:

- completed

Run Log:

- 2026-07-05: `tsc --noEmit` PASS。
- `@aether-md/core` test：57/57 PASS。
- `openspec validate harden-core-bootstrap-lifecycle` PASS。
- `pnpm check` PASS（workspace 9/9 tasks）。
- 记录：`.superpowers/runs/harden-core-bootstrap-lifecycle/validation.md`。

Deviation:

- none
