# Task 09: 全量验证 Barrier（`pnpm check` + OpenSpec validate）

Change:

- `add-validation-suite`

Branch:

- `feat/add-validation-suite`

Spec Requirement:

- `validation-suite` / 全部 ADDED requirements（Headless example、publish prep、manifest consistency、examples typecheck、startup abort、G12 docs、release process）
- `engineering-workflow` / ADDED `M6 validation gates participate in root check pipeline`
- OpenSpec `tasks.md` §7.1、§7.2、§7.3

Source Docs:

- `.superpowers/plans/add-validation-suite.md`
- `openspec/changes/add-validation-suite/tasks.md`
- `openspec/changes/add-validation-suite/proposal.md`
- `openspec/changes/add-validation-suite/design.md`
- `docs/engineering/test-strategy.md`
- `docs/architecture/ci-checklist.md`

## 目标

运行全 workspace `pnpm check` 与 `openspec validate add-validation-suite --strict`；确认 Task 01–08 功能矩阵全绿；创建 `.superpowers/runs/add-validation-suite/validation.md` 验证记录（供 `aether-workflow-validate-task` / archive 使用）。**不**新增功能代码；**不** archive OpenSpec change。

## 范围

1. 运行 `pnpm check` — 预期全绿（skills:check + workflow:pr-check + turbo check 含 example + core tests）。
2. 运行 `openspec validate add-validation-suite --strict`。
3. 确认 non-goals：无 publish、无 Core 生产语义变更、无 compile-layer merge。
4. 记录 validation evidence 至 `.superpowers/runs/add-validation-suite/validation.md`。
5. 若 `pnpm check` FAIL：定位 failing package，**最小** spec 内修复（可能回溯 Task 01–08）；本 task 以只读验证为主。

Depends On:

- 01, 02, 03, 04, 05, 06, 07, 08

Parallel Group:

- none

Barrier:

- true

Allowed Files:

- `.superpowers/runs/add-validation-suite/validation.md`
- `packages/**`（仅修复 `pnpm check` 暴露的 spec 内缺口）
- `examples/headless-gfm/**`（仅缺口修复）
- `pnpm-lock.yaml`（仅缺口修复导致）

Forbidden Files:

- 本 task **不**新增功能代码
- `docs/**`（长期 Docs sync 留 archive 前，validation.md 除外 runs 路径）
- `openspec/specs/**`（main spec sync 留 archive 前）
- `examples/react-basic/**`
- `npm publish`、`NPM_TOKEN`、`.github/workflows/**` release job
- `AGENTS.md`、workflow skill mirrors
- 无关 package 运行时语义变更

Implementation Notes:

- Barrier task：**必须**在 Task 01–08 全部完成后执行。
- Archive 前使用 `aether-workflow-update-docs-spec` sync main specs（`validation-suite`、可选 `engineering-workflow`）。
- 保持五包 `private: true`；`SUPPORTED_MANIFEST_VERSIONS` 仍为 `[1]`。

TDD Notes:

- **Red：** 任一前置 task 未完成则 `pnpm check` 或 `openspec validate` 应 FAIL。
- **Green：** Task 01–08 全部完成后两项 **PASS**。
- 若全部已绿，以 validate + non-goals checklist 为入口；在 `validation.md` 记录 evidence。

Validation:

```bash
pnpm check
openspec validate add-validation-suite --strict
pnpm --filter @aether-md/example-headless-gfm start
pnpm --filter @aether-md/core test
pnpm changeset:status
```

预期：全部 **PASS**；`validation.md` 记录命令输出摘要与 non-goals checklist。

Intuitive Verification:

```bash
pnpm build && pnpm --filter @aether-md/example-headless-gfm start
```

人工确认 stdout trace：headless GFM 成功输出；阅读 `validation.md` 与 non-goals checklist。

Review Checklist:

- [ ] `pnpm check` 通过（含 example typecheck + core G11 + startup abort tests）。
- [ ] `openspec validate add-validation-suite --strict` 通过。
- [ ] headless-gfm `start` smoke 绿。
- [ ] 五包 metadata + Changesets linked 已验证。
- [ ] **无** npm publish、`NPM_TOKEN`、Release workflow。
- [ ] **无** Core/React 生产语义变更。
- [ ] **无** compile-layer schema merge。
- [ ] `SUPPORTED_MANIFEST_VERSIONS` / `manifestVersion` 仍为 `[1]`。
- [ ] `validation.md` 已创建。
- [ ] 无关 dirty 文件未纳入变更。

Rollback Notes:

- 回滚 `validation.md` 与本 task 为修复 check 的最小 commits。
- 不回滚 Task 01–08 主功能 commits（除非无法分离）。

Version Impact:

- 确认汇总：五包 semver `0.0.0` private；**无** public API breaking change；`manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` 不变（`[1]`）；`pnpm-lock.yaml` 来自 example workspace 依赖。

Commit Scope:

- `docs(superpowers): add M6 validation evidence`（仅 validation record 时）

Status:

- completed

Run Log:

- 2026-07-05: Barrier wave started after Tasks 01–08 completed.
- `pnpm check` → **PASS** (18 turbo tasks, 6 packages including example typecheck + core 85 tests).
- `openspec validate add-validation-suite --strict` → **PASS**.
- `pnpm build && pnpm --filter @aether-md/example-headless-gfm start` → **PASS** (stdout round-trip).
- `pnpm --filter @aether-md/core test` → **PASS** (85 tests).
- `pnpm changeset:status` → **FAIL** (`--since main`: no changesets for metadata-only edits); linked group node assertion **PASS**.
- Non-goals checklist verified (no publish, no Core production changes, `SUPPORTED_MANIFEST_VERSIONS` = `[1]`).
- Evidence written to `.superpowers/runs/add-validation-suite/validation.md`.

Deviation:

- `pnpm changeset:status --since main` failure accepted per M6 scope (metadata prep without publish; `private: true` at `0.0.0`). Linked configuration validated separately. M7 will add changesets before first release.
