## Why

M6 闭合后，项目 north star 切换为 **`examples/react-basic` 可连续编辑 GFM 的可感知 demo**（见 [Demo Slice 交付计划](../../../docs/engineering/demo-slice-delivery-program.md)）。PR A 实现前必须先冻结验收边界、非目标、允许改动范围与升级条件，避免再次横向铺层或误开 Full Change。

本 change 为 **PR0：前置 Spec Change**；不包含 demo 功能实现（留给 PR A change `demo-slice-react-basic`）。

## What

- 在 `validation-suite` capability 上增加 **Demo Slice north star 验收** delta requirement（冻结 PR A 必须满足的 scenario 子集）
- 执行单 task：对当前 `react-basic` 做基线记录，更新交付计划进度为 PR0 完成、PR A 边界已冻结
- 不修改 `packages/**` 实现代码

## Non-Goals

- History / Selection / Clipboard / 完整 toolbar
- workflow 主规范、Discover path rules、`engineering-workflow` main spec 改动（PR B）
- Superpowers retention 入规（PR B）
- npm publish / M7
- compile-layer、ConflictResolver 全套、PermissionGuard
- PR A 功能实现（本 change 仅冻结边界）

## Source Docs

- `docs/engineering/demo-slice-delivery-program.md`
- `docs/project-status.md`
- `openspec/specs/validation-suite/spec.md`
- `openspec/specs/react-shell/spec.md`
- `docs/adr/009-release-governance.md`
- `essays/product-delivery/01-mvp-intent-vs-architecture-proof.md`

## Version Impact

none — 无 package SemVer、`manifestVersion`、public export 或 lockfile 变更。

## Branch

`docs/refine-essays`（含交付计划与随笔；PR0 OpenSpec artifacts 同分支。后续 PR 可拆为 `spec/demo-slice-react-basic-pr0` 若维护者要求。）

## Single-Task Scope Summary

一个 task：运行/记录 `react-basic` 基线相对 PR0 验收清单的缺口，写入 `baseline-record.md`；更新 `demo-slice-delivery-program.md` 阶段状态；在 `examples/react-basic/README.md` 挂载 PR A 验收清单链接。**不**改 `packages/**`。

## Validation Strategy

- `openspec validate demo-slice-react-basic-pr0`（若 CLI 可用）
- Task 内：`pnpm --filter @aether-md/example-react-basic typecheck`（G6 基线仍绿）
- 基线记录须对照 delta spec 中冻结的 GFM 子集 scenario 逐条标注 pass / gap / unknown

## Escalation Triggers Checked

| 触发器 | 结果 |
| --- | --- |
| workflow semantics 变更 | **否** — 未改 `AI_NATIVE_ENGINEERING_WORKFLOW.md` 或 skills |
| `openspec/specs/**` main spec 大改 | **否** — 仅 active change delta |
| 多 capability / 多 task | **否** — 单 capability delta，单 task |
| Core public contract 变更 | **否** |
| 需要 Full Change proposal/design/tasks | **否** — Spec Change 足够 |

**结论：** 保持 Spec Change；PR A 若触发升级条件则另开 change 并升级路径。

## PR A 冻结边界（摘要）

**一句话目标：** `examples/react-basic` 成为「可连续编辑 GFM」的最小可感知 demo。

**冻结 GFM 验收子集（PR A MUST）：** 段落、标题、加粗、列表、链接（至少覆盖 delta spec scenario）。

**PR A 允许改动上限：**

- `examples/react-basic/**`
- `packages/react/**`
- `packages/plugins/plugin-prosemirror/**`（仅 demo 所需）
- `packages/preset-gfm/**`（仅 demo 所需）
- 必要测试与 example README

**PR A 升级 Full Change 当：** public export 变更、workflow semantics、多独立 capability、main spec 同步超出 PR B 范围。
