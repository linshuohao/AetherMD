## Why

PR0 change `demo-slice-react-basic-pr0` 已冻结 north star 验收边界。PR A 必须在允许文件范围内实现 **`examples/react-basic` 可连续编辑 GFM 的可感知 demo**，并用自动化测试锁定 PR0 scenario，防止回归。

## What

- 增加 `demo-slice-pr0-acceptance` 集成测试（happy-dom，镜像 `react-basic` 受控 Shell + markdown 预览）
- 按需修复 `packages/react` / `packages/plugins/plugin-prosemirror` 的 view 同步路径
- 更新 `examples/react-basic` 初始内容与 README
- 同步 `openspec/specs/validation-suite/spec.md` main spec（PR0 delta 落地）

## Non-Goals

- History / Selection / Clipboard / toolbar
- workflow 主规范改动（PR B）
- M7 publish
- Playwright / 浏览器 CI（可 PR B backlog）

## Source Docs

- `docs/engineering/demo-slice-delivery-program.md`
- `openspec/changes/demo-slice-react-basic-pr0/change-brief.md`
- `openspec/changes/demo-slice-react-basic-pr0/baseline-record.md`
- `openspec/changes/demo-slice-react-basic-pr0/specs/validation-suite/spec.md`

## Version Impact

none — 无 public export 或 SemVer 契约变更；仅行为修复与测试。

## Branch

`docs/refine-essays`（与交付计划、PR0 同分支；合并前可拆 PR）

## Single-Task Scope Summary

一个 task：TDD 添加 PR0 验收集成测试 → 最小实现修复 → `pnpm check` → 更新 example 与 baseline 引用。

## Validation Strategy

- `pnpm --filter @aether-md/react test`（含新 integration test）
- `pnpm --filter @aether-md/example-react-basic typecheck`
- `pnpm check`

## Escalation Triggers Checked

| 触发器                  | 结果                                               |
| ----------------------- | -------------------------------------------------- |
| workflow semantics      | 否                                                 |
| 多 task / 多 capability | 否 — 单 task，validation-suite 延续 PR0            |
| Core public export 变更 | 否                                                 |
| 超出 PR0 allowed files  | 否 — 限于 react / plugin-prosemirror / react-basic |

## Workflow Path

- **Discover:** Spec Change
- **Execute:** `aether-workflow-execute-spec-change`（implement → validate → review → sync spec → archive）
