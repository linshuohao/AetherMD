## Why

L2 Slice A–D 已交付，`examples/block-morphing` 承载 Instant Morphing + Block Focus north star，但 CI 仅有 Vitest/happy-dom 与 example typecheck，缺少真实浏览器下的焦点、blur、DOM 渲染与 GateLock 回归覆盖。M7 发布前置需要可演示 + 可自动回归的 L2 证明；ADR 009 将 Playwright 标为 P1 可延后项，本 change 以 **Phase 1 非阻塞 CI** 接入。

## What

- 新增仓库根 `e2e/playwright/`（config、fixtures、block-morphing 四轮用例）
- 根 `package.json` 暴露 `e2e:install` / `e2e:test` 脚本
- CI 新增 `e2e-playwright` job（`continue-on-error: true`），上传 report artifact
- 更新 `docs/engineering/test-strategy.md`、`README.md`、`examples/block-morphing/README.md`

## Non-Goals

- 将 E2E 升为阻塞 CI 门禁（留 M7 后决策）
- M7 publish、去 `private: true`、`NPM_TOKEN`、Release CI
- `examples/react-basic` Playwright 覆盖（后续 change）
- Core/React 生产 runtime 语义变更

## Source Docs

- `.superpowers/plans/m7-release-prep.md`（Task 01–04）
- `docs/adr/009-release-governance.md`（P1 Playwright）
- `docs/engineering/test-strategy.md`
- `docs/architecture/product-experience-spec.md`（场景 A/B/C）
- `openspec/specs/validation-suite/spec.md`

## Version Impact

none — 无 SemVer bump、无 public API 变更、无 `manifestVersion` 变更。根 `devDependencies` 新增 `@playwright/test`；`pnpm-lock.yaml` 预期变更。

## Branch

`feat/playwright-e2e-phase-1`

## Single-Task Scope Summary

一个 task：落地 `e2e/playwright/**` 四轮用例 + CI 非阻塞 job + 文档 → `pnpm check` + `pnpm e2e:test` 绿。

## Validation Strategy

```bash
pnpm format
pnpm check
pnpm e2e:install
pnpm e2e:test
```

Expected: `pnpm check` exit 0；E2E 4 passed。

## Escalation Triggers Checked

| 触发器                  | 结果                                            |
| ----------------------- | ----------------------------------------------- |
| workflow semantics      | **否**                                          |
| 多 task / 多 capability | **否** — 单 task；capability `validation-suite` |
| public API 变更         | **否**                                          |
| M7 publish              | **否**                                          |
| E2E 升阻塞门禁          | **否** — 明确 `continue-on-error: true`         |

**结论：** Spec Change。

## Frozen boundary

**一句话目标：** `examples/block-morphing` 在真实 Chromium 下通过 smoke、Block Focus、Instant Morphing、GateLock 四轮 E2E；CI 非阻塞运行。

**MUST 覆盖（Playwright）：**

| 场景                | 验收                                                |
| ------------------- | --------------------------------------------------- |
| smoke               | 应用启动；段落/列表/段落块 `data-block-type` 正确   |
| Block Focus         | 聚焦列表块仅该块 `morphing-source`；其他块 rendered |
| Instant Morphing    | source 编辑 list 后 blur → 三项 `li` 渲染正确       |
| GateLock regression | Force parent rerender 后列表编辑内容保留            |

**允许改动：** `e2e/**`、根 `package.json`、`pnpm-lock.yaml`、`.github/workflows/ci.yml`、`.gitignore`、`docs/engineering/test-strategy.md`、`README.md`、`examples/block-morphing/README.md`、`openspec/changes/playwright-e2e-phase-1/**`、`openspec/specs/validation-suite/spec.md`（sync）、`.superpowers/**`（本 change 执行记录）

**禁止：** 五包 `private` 移除、Release workflow、生产 morphing 逻辑变更（除非 E2E 暴露 bug 并记录 deviation）。

## Workflow Path

- **Discover:** Spec Change
- **Next:** `aether-workflow-execute-spec-change`
