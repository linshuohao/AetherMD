# Task 07: 全量验证 Barrier（`pnpm check` + OpenSpec validate）

Change:

- `add-react-basic-example`

Branch:

- `feature/add-react-basic-example`

Spec Requirement:

- `validation-suite` / 全部 ADDED + MODIFIED requirements（React basic example、Examples typecheck G6、M1–M6 回归）
- `engineering-workflow` / MODIFIED `M6 validation gates participate in root check pipeline`（含 React basic example typecheck gate）
- `openspec/changes/add-react-basic-example/tasks.md` §6.1–6.3

Source Docs:

- `.superpowers/plans/add-react-basic-example.md`
- `openspec/changes/add-react-basic-example/tasks.md`
- `openspec/changes/add-react-basic-example/proposal.md`
- `openspec/changes/add-react-basic-example/design.md`
- `docs/architecture/ci-checklist.md`
- `docs/engineering/test-strategy.md`

## 目标

运行全 workspace `pnpm check` 与 `openspec validate add-react-basic-example --strict`；确认 Task 01–06 功能矩阵全绿；创建 `.superpowers/runs/add-react-basic-example/validation.md` 验证记录；准备 archive 前 main spec sync 清单。**不**新增功能代码；**不** archive OpenSpec change。

## 范围

1. 运行 `pnpm check` — 预期全绿（skills:check + workflow:pr-check + turbo check 含 `headless-gfm` + `react-basic` + 五包测试）。
2. 运行 `openspec validate add-react-basic-example --strict`。
3. 确认 non-goals：无 publish、无五包 public API 变更、无 Playwright、无 `vite build` CI。
4. 记录 validation evidence 至 `.superpowers/runs/add-react-basic-example/validation.md`。
5. 准备 archive sync 清单：`validation-suite`、`engineering-workflow` main spec（`aether-workflow-update-docs-spec`）。
6. 若 `pnpm check` FAIL：定位 failing package，**最小** spec 内修复（可能回溯 Task 01–06）；本 task 以只读验证为主。

Depends On:

- 01, 02, 03, 04, 05, 06

Parallel Group:

- none

Barrier:

- true

Allowed Files:

- `.superpowers/runs/add-react-basic-example/validation.md`
- `examples/react-basic/**`（仅修复 `pnpm check` 暴露的 spec 内缺口）
- `packages/**`（仅缺口修复）
- `pnpm-lock.yaml`（仅缺口修复导致）
- `turbo.json`（仅缺口修复）

Forbidden Files:

- 本 task **不**新增功能代码
- `docs/**`（长期 Docs sync 留 archive 前；`validation.md` 除外 runs 路径）
- `openspec/specs/**`（main spec sync 留 archive 前）
- `npm publish`、`NPM_TOKEN`、M7 Release workflow
- Playwright CI
- `AGENTS.md`、workflow skill mirrors
- 无关 package 运行时语义变更

Implementation Notes:

- Barrier task：**必须**在 Task 01–06 全部完成后执行。
- Archive 前使用 `aether-workflow-update-docs-spec` sync main specs（`validation-suite`、`engineering-workflow`）。
- 五包 semver `0.0.0` private；`SUPPORTED_MANIFEST_VERSIONS` / `manifestVersion` 仍为 `[1]`。

TDD Notes:

- **Red：** 任一前置 task 未完成则 `pnpm check` 或 `openspec validate` 应 FAIL。
- **Green：** Task 01–06 全部完成后两项 **PASS**。
- 若全部已绿，以 validate + non-goals checklist 为入口；在 `validation.md` 记录 evidence。

Validation:

```bash
pnpm check
openspec validate add-react-basic-example --strict
pnpm --filter @aether-md/example-react-basic typecheck
pnpm --filter @aether-md/example-headless-gfm typecheck
```

预期：全部 **PASS**；`validation.md` 记录命令输出摘要与 non-goals checklist。

Intuitive Verification:

```bash
pnpm build && pnpm --filter @aether-md/example-react-basic dev
```

人工确认 GateLock smoke 与编辑器可编辑；阅读 `validation.md` 与 non-goals checklist。

Review Checklist:

- [ ] `pnpm check` 通过（含 `headless-gfm` + `react-basic` typecheck + 五包测试）。
- [ ] `openspec validate add-react-basic-example --strict` 通过。
- [ ] **无** npm publish、`NPM_TOKEN`、Release workflow。
- [ ] **无**五包 public API / GateLock 语义变更。
- [ ] **无** Playwright；**无** `vite build` CI 主路径。
- [ ] example **不** import `@aether-md/react` test 模块。
- [ ] `SUPPORTED_MANIFEST_VERSIONS` / `manifestVersion` 仍为 `[1]`。
- [ ] `validation.md` 已创建。
- [ ] archive sync 清单已就绪（`validation-suite`、`engineering-workflow`）。
- [ ] 无关 dirty 文件未纳入变更。

Rollback Notes:

- 回滚 `validation.md` 与本 task 为修复 check 的最小 commits。
- 不回滚 Task 01–06 主功能 commits（除非无法分离）。

Version Impact:

- 确认汇总：五包 semver `0.0.0` private；**无** public API breaking change；`manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` 不变（`[1]`）；`pnpm-lock.yaml` 来自 example workspace 依赖。

Commit Scope:

- `docs(superpowers): add react-basic validation evidence`（仅 validation record 时）

Status:

- completed

Run Log:

- 2026-07-05: Task started — full validation barrier
- 2026-07-05: `pnpm check` — PASS (21 turbo tasks, incl. headless-gfm + react-basic + M1–M6 tests)
- 2026-07-05: `openspec validate add-react-basic-example --strict` — PASS
- 2026-07-05: Non-goals checklist confirmed in validation.md
- 2026-07-05: Archive sync checklist prepared (validation-suite, engineering-workflow)
- 2026-07-05: Validation complete — Task 07 green; ready for review-compliance

Deviation:

- none
