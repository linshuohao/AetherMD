# Task 06: 文档同步（`react-basic` 已交付）

Change:

- `add-react-basic-example`

Branch:

- `feature/add-react-basic-example`

Spec Requirement:

- `validation-suite` / ADDED `React basic example package demonstrates React Shell integration path`（Scenario: React example is private and not published）
- `validation-suite` / MODIFIED `Examples package passes TypeScript noEmit check in CI`（G6 文档对齐）

OpenSpec Tasks:

- `openspec/changes/add-react-basic-example/tasks.md` §5.1–5.3

Source Docs:

- `.superpowers/plans/add-react-basic-example.md`
- `docs/adr/009-release-governance.md`（§4 Demo 形态、G6）
- `docs/project-status.md`
- `docs/community/release-process.md`
- `docs/architecture/ci-checklist.md`
- `docs/engineering/test-strategy.md`（若仍写 M6 不覆盖 react-basic）
- `docs/engineering/component-library-governance.md`（Example / Playground 包类型）

## 目标

更新长期文档：将 `examples/react-basic` 标为已交付；G6 / publish 矩阵扩展至 react-basic；test-strategy 闭合 M6 不覆盖措辞；**不**声称 Playwright 已覆盖。

## 范围

1. `docs/project-status.md`：将 `examples/react-basic` 从「尚未开始」移至已交付；更新主要产物列表与近期重点。
2. `docs/community/release-process.md`：M6 预备表增加 `examples/react-basic` 行（`private: true`，不发布 npm）。
3. `docs/architecture/ci-checklist.md`：G6 注释扩展至 `examples/react-basic` `tsc --noEmit`。
4. `docs/engineering/test-strategy.md`（若仍写「M6 不覆盖 `examples/react-basic`」）：改为由本 change 覆盖 example typecheck。
5. 可选：`examples/react-basic/README.md` 简短说明（非 OpenSpec 硬性要求）。

Depends On:

- 04

Parallel Group:

- wave-c

Barrier:

- false

Allowed Files:

- `docs/project-status.md`
- `docs/community/release-process.md`
- `docs/architecture/ci-checklist.md`
- `docs/engineering/test-strategy.md`（若措辞需修正）
- `examples/react-basic/README.md`（可选）

Forbidden Files:

- `docs/sdk/examples.md` 大规模改写
- `openspec/specs/**`（main spec sync 留 archive 前 `aether-workflow-update-docs-spec`）
- `packages/**`
- `AGENTS.md`、workflow skill mirrors
- Playwright / publish CI 配置

Implementation Notes:

- 说明性正文中文；API 名称、包名、路径与 OpenSpec 结构关键词 English。
- 文档描述已交付功能；依赖 Task 04 GateLock 演示完成。

TDD Notes:

- **Red：** `rg "react-basic" docs/` 显示「尚未开始」或 M6 不覆盖措辞不一致。
- **Green：** 文档与 ADR 009 / OpenSpec delta 对齐；`release-process` 矩阵含 `private: true` example 行。

Validation:

```bash
rg "react-basic" docs/
rg "M6 不覆盖.*react-basic|react-basic.*尚未" docs/
```

人工 review 上述文档 diff。

Intuitive Verification:

- 阅读 `project-status.md` 与 `ci-checklist.md`，确认 G6 含 `headless-gfm` + `react-basic`。

Review Checklist:

- [ ] `project-status.md` 标 `react-basic` 已交付。
- [ ] `release-process.md` 含 example 行且 `private: true` / 不发布 npm。
- [ ] `ci-checklist.md` G6 扩展至 react-basic。
- [ ] **未**声称 Playwright 覆盖 example。
- [ ] **未**大规模改写 `docs/sdk/examples.md`。
- [ ] 说明性正文中文；标识 English。

Rollback Notes:

- revert 本 task 对 `docs/**` 与可选 `examples/react-basic/README.md` 的变更。

Version Impact:

- none（文档 only）

Commit Scope:

- `docs(status): document react-basic example delivery`

Status:

- completed

Run Log:

- 2026-07-05: Task started — document react-basic delivery
- 2026-07-05: Updated project-status.md, release-process.md, ci-checklist.md, test-strategy.md
- 2026-07-05: Added optional examples/react-basic/README.md
- 2026-07-05: `rg "react-basic" docs/` — aligned; no "尚未开始" / "M6 不覆盖 react-basic" remaining
- 2026-07-05: Validation complete — Task 06 green

Deviation:

- none
