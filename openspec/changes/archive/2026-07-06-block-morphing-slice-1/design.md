## Context

M5 `@aether-md/react` 提供 Phase 0 interim shell（`AetherEditorContent` + ProseMirror view-bridge + 下方 preview）。产品 north star 要求 **Instant Morphing**：聚焦块显示 Markdown 源码，失焦显示排版，无独立 preview 栏。Slice A 以最小范围交付单段落 morphing MVP，作为 M7 门禁 L2 证明。

约束：

- Core **MUST NOT** 新增 Markdown/morphing 分支。
- Shell 负责 focus 状态机与块 surface 挂载；GateLock 复用现有 API。
- 块行为 MVP 可在 Shell 层最小实现（preset/插件层 follow-up 于 Slice B+）。
- PM 仅在 `@aether-md/plugin-prosemirror`；Slice A morphing **不**使用 `AetherEditorContent` PM 表面。

## Goals / Non-Goals

**Goals:**

- 单段落文档 `Hello **world**`：聚焦见 `**` 源码；失焦见粗体渲染。
- 源码编辑 → `dispatch`/`core:replaceText` → `change` → Shell 更新；聚焦/失焦为纯 UI 态。
- 连续打字不 remount 整编辑器；无 GateLock 式全量 reset。
- `examples/block-morphing` 可 `pnpm dev` 演示。
- happy-dom 集成测试覆盖场景 A/B。

**Non-Goals:**

- 多块 Block Focus（Slice C）、列表/链接块（Slice D）、GFM marks 全保真（Slice B）。
- History、Selection、Clipboard、M7 publish。

## Decisions

### 1. Source 表面：聚焦块 `<textarea>` + 等宽字体

**选择：** 聚焦时渲染 `<textarea data-testid="morphing-source">`，`font-family: monospace`；失焦时渲染 `<div data-testid="morphing-rendered">`。

**理由：** 最简单正确路径；无 contenteditable 歧义；happy-dom 可测 focus/blur。

### 2. 块模型：单段落；`blockIndex` 默认 `0`

**选择：** Slice A 仅支持文档含一个 `paragraph` block（或等价单段 Markdown）。`AetherMorphingContent` 接受可选 `blockIndex`（默认 `0`）。块 id 稳定为文档 index `0`。

**理由：** 满足验收场景 A/B；避免 Slice C 多块复杂度。

### 3. Rendered 视图：最小 inline strong

**选择：** Shell 层 `renderParagraphInline()` 解析 `**text**` → `<strong>`；其余为文本节点。不引入 remark/HTML 管线于 rendered 路径。

**理由：** MVP 可演示；Slice B 可换为 preset `interactiveRenderers`。

### 4. Shell 集成：additive `AetherMorphingContent`

**选择：** 复用 `AetherEditorRoot` / `useAetherEditor`；新增 `AetherMorphingContent` export。不替换 `AetherEditorRoot`；example 使用 Root + MorphingContent（无 Content PM 表面、无 preview 栏）。

**理由：** additive；不破坏 `react-basic` Phase 0 路径。

### 5. 数据流

**选择：**

| 步骤 | 行为 |
| --- | --- |
| textarea `onChange` | `editor.dispatch({ id: 'core:replaceText', payload: { blockIndex, text } })` |
| `change` 事件 | Root/hook 更新 `markdown`；MorphingContent 读 `markdown` 作 source |
| focus | `setFocused(true)`；下一帧 focus textarea |
| blur | `setFocused(false)`；显示 rendered |

GateLock 语义不变：`prevValue === nextValue` 不重设 editor。

### 6. Example 包名与目录

**选择：** `@aether-md/example-block-morphing`，目录 `examples/block-morphing`；Vite + React，镜像 `react-basic` 脚手架。

### 7. 零 remount 验证

**选择：** 集成测试捕获 `AetherEditor` 实例引用；连续 `dispatch` 或 `fireEvent.input` 后 `assert.strictEqual(editorBefore, editorAfter)`；父组件 force rerender 后实例不变。

## Risks / Mitigations

| 风险 | 缓解 |
| --- | --- |
| textarea 与 `markdown` 受控竞态 | 以 editor `change` 为 source of truth；本地不 fork 文档 |
| happy-dom focus/blur | 使用 `fireEvent.focus` / `blur` + `waitFor` |
| 单段落假设与多段 fixture | Slice A 测试 fixture 仅单段；文档注明限制 |

## Open Questions

（无 — 以上决策为 Slice A 默认值，已拍板。）
