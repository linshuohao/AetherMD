## Why

PR A（`demo-slice-react-basic`）验证了 **demo/example 类变更可走 Spec Change**，且 Full Change 默认门槛过高导致 M1–M6 产物膨胀。PR B 将已验证结论写入 workflow 主规范：Discover 区分 demo slice 与 public contract 实现、archive 后 Superpowers retention，并归档 PR0/PR A OpenSpec changes。

## What Changes

- `aether-workflow-discover-context`：demo/example slice 默认 Spec Change；public contract 首次实现仍 Full Change
- `aether-workflow-archive-change`：归档后压缩 `.superpowers/tasks|plans|reviews` 至 `.superpowers/archive/`
- `AI_NATIVE_ENGINEERING_WORKFLOW.md`：Demo slice 路径与 retention 摘要
- `engineering-workflow` main spec delta
- 归档 `demo-slice-react-basic-pr0`、`demo-slice-react-basic`；闭合 Demo Slice 交付计划

## Non-Goals

- 批量迁移全部 11 个历史 MVP change 的 Superpowers（仅 demo slice 两 change 作范例）
- History / Selection / Clipboard
- M7 publish 工程
- 新增第 5 条 workflow path

## Capabilities

### Modified Capabilities

- `engineering-workflow`: demo slice path classification、Superpowers retention on archive

## Impact

- `.skills/aether-workflow/`、`AI_NATIVE_ENGINEERING_WORKFLOW.md`、`openspec/specs/engineering-workflow/spec.md`
- `docs/engineering/demo-slice-delivery-program.md`、`docs/project-status.md`
- Archive `openspec/changes/demo-slice-react-basic-pr0`、`demo-slice-react-basic`
- Version impact: none

## Acceptance Criteria

- Discover skill 明确 demo slice vs public contract Full Change 门槛
- Archive skill 含 retention 步骤
- `pnpm skills:check` / `pnpm check` 通过
- PR0/PR A OpenSpec 在 `openspec/changes/archive/`
- 交付计划标记程序闭合
