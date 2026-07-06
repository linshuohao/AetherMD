## Why

Demo Slice 程序（PR0→PR B）已闭合，但 `baseline-record.md` 与合并审查均确认：**浏览器自然连续输入**仍未达到 north star 意图。CI 的 `demo-slice-pr0-acceptance` 仅覆盖 programmatic `dispatch`，`view-bridge` / `engine` 对 list 等块级编辑不回写 markdown，导致 `react-basic` preview 与 PM 本地状态分叉。

本 change 是交付计划后置 backlog 中的 **`demo-slice-typing-sync`**，优先级高于 History slice 与 M7 发布准备。

## What

- 扩展 `plugin-prosemirror` 的 PM 输入 → `dispatchInput` → `core:replaceText` 同步路径（`view-bridge` 位置解析 + `engine` 块级应用）
- 在 `@aether-md/react` 增加 **ProseMirror `insertText`** 集成测试（挂载 `AetherEditorContent`，断言 preview 同步）
- 更新 `validation-suite` delta：区分 **CI 键盘输入路径** 与既有 dispatch 验收；诚实标注 browser sign-off 步骤
- 更新 `baseline-record` 场景状态与 `demo-slice-delivery-program.md` 进度（typing-sync 进行中/完成）
- 可选：`examples/react-basic/README.md` 补充手动验收步骤

## Non-Goals

- History / Selection / Clipboard / toolbar / undo-redo
- Playwright 或浏览器 CI
- workflow 主规范、skills、`engineering-workflow` main spec
- M7 publish、npm、Release CI
- compile-layer、新 CommandId、Core 编排语义变更
- 列表 Enter 新建项、拖拽重排、完整 GFM 扩展（表格、任务列表等）
- Essays 复盘（可并行，不在本 change）

## Source Docs

- `docs/engineering/demo-slice-delivery-program.md`
- `openspec/changes/archive/2026-07-06-demo-slice-react-basic-pr0/baseline-record.md`
- `openspec/specs/validation-suite/spec.md`
- `openspec/specs/react-shell/spec.md`
- `packages/plugins/plugin-prosemirror/src/view-bridge.ts`
- `packages/plugins/plugin-prosemirror/src/engine.ts`

## Version Impact

none — 无 SemVer bump、无新 publishable export、无 `manifestVersion` 变更。若实现 list 同步必须扩展 `ReplaceTextCommand` 可选字段，须保持向后兼容且不在本 change 新增公开 CommandId。

## Branch

`feat/demo-slice-typing-sync`

## Single-Task Scope Summary

一个 task：TDD 添加 PM `insertText` 集成测试（paragraph、heading、list item）→ 修复 `view-bridge` 块索引/块类型解析 → 扩展 `engine` 对 list 块的最小 replace 支持 → 保留既有 dispatch 测试 → `pnpm check` → 同步 main spec 与 baseline。

## Validation Strategy

- `pnpm --filter @aether-md/plugin-prosemirror test`
- `pnpm --filter @aether-md/react test`（含新 typing 集成测试 + `demo-slice-pr0-acceptance` 回归）
- `pnpm --filter @aether-md/example-react-basic typecheck`
- `pnpm check`
- **Sign-off（task 外，合并前）：** `pnpm --filter @aether-md/example-react-basic dev` 人工连续打字确认

## Escalation Triggers Checked

| 触发器 | 结果 |
| --- | --- |
| workflow semantics | **否** |
| 多 task / 多 capability | **否** — 单 task；capability 延续 `validation-suite` |
| 新 CommandId 或 Core 编排变更 | **否** — 目标内；若不可避免则暂停升级 Full Change |
| `ReplaceTextCommand` 可选字段扩展 | **可能** — 仅当 list 同步无法用现有 `children` 表达；须向后兼容 |
| Playwright / CI gate 变更 | **否** |
| 超出 demo allowed surface | **否** — `react` + `plugin-prosemirror` + tests + docs |

**结论：** Spec Change；实现中若需第二个独立 task 或新 CommandId，暂停并升级 Full Change。

## Frozen boundary（本 change）

**一句话目标：** 用户在 `AetherEditorContent` 内用键盘连续输入时，markdown preview（`useAetherEditor().markdown`）稳定同步，覆盖 PR0 冻结 GFM 子集的最小可编辑表面。

**MUST 覆盖（CI，`insertText` 或等效 PM 输入）：**

| 表面 | 验收 |
| --- | --- |
| 连续 plain paragraph | 多次 `insertText` 后 preview 反映最终文本 |
| heading 块内编辑 | 标题文本修改后 preview 更新 |
| list item 内段落 | 列表项内打字后 preview 含更新项文本 |
| strong / link 邻接打字 | 不破坏已有 mark 结构（回归） |

**MUST 保留：** 既有 `demo-slice-pr0-acceptance`（dispatch 路径）与 GateLock 测试全绿。

**允许改动：**

- `packages/plugins/plugin-prosemirror/src/**`
- `packages/react/src/**`
- `examples/react-basic/**`（README / 文案 only，除非 demo 展示必须）
- `openspec/changes/demo-slice-typing-sync/**`
- `openspec/specs/validation-suite/spec.md`
- `openspec/changes/archive/2026-07-06-demo-slice-react-basic-pr0/baseline-record.md`
- `docs/engineering/demo-slice-delivery-program.md`
- `.superpowers/tasks/demo-slice-typing-sync/**`

**禁止：** `packages/core/**`（除非 escalation 批准的向后兼容 adapter-types 可选字段）、workflow skills、无关 packages。

## Workflow Path

- **Discover:** Spec Change（demo slice follow-up，见 `aether-workflow-discover-context` demo slice 默认规则）
- **Next:** `aether-workflow-execute-spec-change`
