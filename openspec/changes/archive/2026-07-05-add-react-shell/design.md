## Context

M4.5 已在 `@aether-md/core` 提供 headless `createEditor(config): Promise<AetherEditor>`，支持 `dispatch`、`on('change')`、`getMarkdown`、`getDocument`、`dispose`，并通过 `@aether-md/preset-gfm` headless integration tests 验证 GFM round-trip（无 React/DOM）。`@aether-md/plugin-prosemirror` 当前仅维护 headless `EditorState`（`sessions` Map），**无** `EditorView` / DOM API。

`docs/architecture/core-api.md` Phase 0 已冻结：

- **#2**：Core **MUST NOT** 暴露订阅式 store；Shell 经 `on('change', …)` 观察并在框架层桥接 UI。
- **#3**：React Shell **MUST** 直接消费 `AetherEditor`；**MUST NOT** 引入 Shell Adapter。

M5 建立 `packages/react`（`@aether-md/react`），实现 roadmap 要求的 GateLock 与最小挂载/输入/变更/销毁路径，满足 `docs/engineering/mvp-implementation-plan.md` M5 验收与 `docs/architecture/ci-checklist.md` GateLock CI 项。

约束：

- 长期事实来源为 Docs；本 design 只抽取 M5 implementation contract。
- `@aether-md/core` **MUST NOT** 新增 react/prosemirror/remark runtime deps。
- 说明性正文使用中文；API 名称、包名、路径与 OpenSpec 关键词保持 English。

## Goals / Non-Goals

**Goals:**

- 新建 `@aether-md/react` Public Adapter package，提供 `AetherEditorRoot`、`AetherEditorContent`、`useAetherEditor`。
- `AetherEditorRoot` 内部调用 `createEditor`，管理 editor 生命周期与 React context。
- `AetherEditorContent` 挂载 ProseMirror `EditorView` 到 DOM 容器。
- 用户输入经 Command 路径更新文档（M5 最小路径：`core:replaceText` 或 design 定形的 input→dispatch 桥接），成功编辑 emit `change`，React hook 更新 state。
- GateLock：受控 `value`/`markdown` prop 在 `prevValue === nextValue` 时跳过重设文档。
- happy-dom 集成测试 + GFM preset React smoke（paragraph、strong、list）。
- package-boundary：`@aether-md/core` 无 react/prosemirror/remark runtime deps。

**Non-Goals:**

- Vue Shell、toolbar、主题、History undo/redo UI。
- Core Guard 链、Permission enforce、Core store、Shell Adapter。
- `bootstrapCore` silent provide 变更。
- Playwright / 浏览器 CI、`examples/react-basic`（follow-up）。
- `plugin-prosemirror` 非 additive 重构。

## Decisions

### 1. 新增 capability `react-shell`；`editor-orchestration` 仅 MODIFIED Shell 消费措辞

**选择：** React Shell 行为独立为 `react-shell` capability；`editor-orchestration` delta 仅 MODIFIED「EditorStateSnapshot is read-only without Core store」以显式 React hook 桥接与禁止 Shell Adapter，**不**改动 `createEditor` 流水线或 headless 测试 SHALL 语义。

**理由：** 与 M4.5「独立 capability + 最小 boundary delta」模式一致；Core 行为不变，避免将 DOM 语义塞入 editor-orchestration 正文。

### 2. EditorView 桥接：`@aether-md/plugin-prosemirror` 提供 additive view-bridge

**选择：** `@aether-md/plugin-prosemirror` 新增 additive export，例如：

```typescript
createProseMirrorView(options: {
  session: EngineSession;
  dom: HTMLElement;
  dispatchInput?: (request: AdapterCommandRequest) => void;
}): { view: EditorView; destroy: () => void };
```

`@aether-md/react` **MUST NOT** 直接依赖 `prosemirror-view` 或访问 engine `sessions` Map 内部；**MUST** 通过 plugin-prosemirror 公开 bridge 创建/销毁 view。

**备选 A：** `@aether-md/react` 直接依赖 `prosemirror-view` 并自行同步 session。否决：违反 ADR 003「Adapter 埋葬依赖」与 `component-library-governance.md` 防腐边界；重复 engine 内部知识。

**备选 B：** 在 Core 暴露 view 工厂。否决：Core 业务盲区，引入 DOM/PM 泄漏。

**Deviation：** 无。

### 3. 测试 DOM 运行时：happy-dom

**选择：** M5 集成测试使用 **happy-dom** 作为 DOM 实现（`@aether-md/react` devDependency）。测试在 Node 下通过 `pnpm test` / `pnpm check` 执行，**不**引入 Playwright 或浏览器 CI job。

**理由：** happy-dom 对 ProseMirror 输入/DOM 操作较 jsdom 友好；满足 M5「先 jsdom/happy-dom」范围；CI 复杂度低于 Playwright。

**备选：** jsdom。保留为 fallback 仅在 happy-dom 阻塞时记录 deviation；默认 happy-dom。

### 4. `useAetherEditor` 暴露 `markdown` state

**选择：** `useAetherEditor()` **SHALL** 返回至少：

```typescript
{
  editor: AetherEditor | null;
  markdown: string;
  doc: AetherDoc | null;
  ready: boolean;
  error: Error | null;
}
```

- `markdown` / `doc` 在 `ready` 后由 `on('change')` 更新；初始 `ready` 后从 `getMarkdown()` / `getDocument()` 填充。
- **MUST NOT** 在 Core 新增 store；state 纯属 React hook 本地 state（Phase 0 #2）。

**理由：** 受控 GateLock 需可比较的 Markdown string；宿主常见用法为受控 `value` + `onChange(markdown)`。

### 5. GateLock 语义

**选择：**

| 条件 | 行为 |
| --- | --- |
| 受控 `value` / `markdown` prop 变化且 `prevValue !== nextValue` | **MAY** 经 `createEditor` 重初始化或 `dispatch` 重置文档（implementation 定形；优先避免 remount 若可增量 apply） |
| `prevValue === nextValue`（引用相等或字符串相等） | **MUST NOT** 重设文档、**MUST NOT** remount engine session、**MUST NOT** 触发多余 `getMarkdown` 驱动的反馈环 |
| 用户编辑引发 `change` | Shell 调用 `onChange(markdown)`；若宿主回传相同 `value`，GateLock 阻止重入 |

比较基准：**Markdown string**（与 CI checklist 与受控 editor 惯例一致）。

**理由：** 对齐 `docs/engineering/data-flow.md` 数据流末端 GateLock 与 `docs/architecture/ci-checklist.md` 集成测试描述。

### 6. 输入 → Command 桥接（M5 最小路径）

**选择：** DOM 输入 **MUST** 最终经 `AetherEditor.dispatch` 到达 `EngineAdapter.apply`，不得 Shell 直写 PM `EditorState`。

M5 最小实现：

- 键盘输入经 view-bridge 的 `dispatchInput` 回调，由 `@aether-md/react` 转为 `core:replaceText`（或 orchestration 已支持的 engine-bound command）`dispatch`。
- 成功 `apply` 后 Core emit `change`；React hook 更新 `markdown`/`doc`。

**备选：** 直接 PM `tr` 不经 Command Bus。否决：违反「命令通达天下」与 `data-flow.md`。

### 7. 公开组件 API 形状

**选择：**

```tsx
<AetherEditorRoot
  plugins={...}
  initialValue?: string
  value?: string          // 受控 markdown（GateLock）
  onChange?: (markdown: string) => void
  readOnly?: boolean
>
  <AetherEditorContent />
</AetherEditorRoot>
```

- `AetherEditorRoot`：Provider + `createEditor` + dispose on unmount。
- `AetherEditorContent`：ref 容器 + `createProseMirrorView` 挂载。
- `useAetherEditor()`：消费 context；无 Provider 时 throw 或返回 null（implementation 定形，须在 spec 冻结一种）。

**理由：** 分离 lifecycle（Root）与 view（Content），便于测试 GateLock 与 content-only remount 场景。

### 8. Package 布局与依赖

**选择：**

```text
packages/react/
  package.json          # name: @aether-md/react
  peerDependencies: react ^18 || ^19
  dependencies: @aether-md/core, @aether-md/plugin-prosemirror
  devDependencies: @aether-md/preset-gfm, @aether-md/plugin-remark, happy-dom, @testing-library/react (若需要)
```

- `@aether-md/plugin-prosemirror` 为 **runtime dependency**：`AetherEditorContent` 生产代码经 `createProseMirrorView` 挂载 DOM；**MUST NOT** 将 `prosemirror-view` 直接加入 react `dependencies`（仍由 plugin 包埋葬）。
- `@aether-md/preset-gfm` / `@aether-md/plugin-remark` 仅测试路径 devDependency（GFM smoke / integration）。
- `exports`：`"."` → 组件 + hook；**MUST** 有 `types`。
- Turbo：`build`、`typecheck`、`test` 接入根 `pnpm check`。
- **MUST NOT** 被 `@aether-md/core` 依赖。

## Risks / Trade-offs

| 风险 | 缓解 |
| --- | --- |
| happy-dom 输入事件与 PM 不完全一致 | 集成测试覆盖 type → change；失败时记录 gap，M6 再评估 Playwright |
| view-bridge 与 headless session 双轨状态 | bridge **MUST** 读写同一 `EngineSession` record；单测断言 apply 后 view 与 `getDocument()` 一致 |
| GateLock 与 React Strict Mode 双 mount | dispose/create 幂等；集成测试断言 `prevValue === nextValue` 不二次 parse |
| 受控 prop 反馈环 | GateLock 在 prop effect 入口比较 string；仅不等时重设 |
| plugin-prosemirror additive export 扩大 surface | 仅 export view factory；不 export `sessions` Map；contract test 覆盖 |

## Migration Plan

1. 合并 OpenSpec artifacts → `aether-workflow-create-plan` → implementation tasks。
2. 先 scaffold `packages/react` + package-boundary tests。
3. additive `plugin-prosemirror` view-bridge（若需要）→ React 组件 → GateLock → tests。
3. `pnpm check` 全绿 → archive → `aether-workflow-update-docs-spec` sync main specs 与 `docs/engineering/test-strategy.md` M5 基线。

**Rollback：** 移除 `packages/react` workspace entry；revert plugin-prosemirror additive export；Core 无变更故无 Core rollback。

## Open Questions

以下问题在本 design **已冻结**（implementation 不得偏离，除非新 OpenSpec deviation 记录）：

| # | 问题 | 冻结决策 |
| --- | --- | --- |
| 1 | EditorView 桥接位置 | `@aether-md/plugin-prosemirror` additive `createProseMirrorView`；`@aether-md/react` 不直接依赖 `prosemirror-view` |
| 2 | 测试 DOM | **happy-dom**（非 Playwright；jsdom 仅作 documented fallback） |
| 3 | `useAetherEditor` 是否暴露 `markdown` | **是** — `markdown` + `doc` state，由 `change` + lazy `getMarkdown`/`getDocument` 更新 |

**Implementation 阶段待定形（不阻塞 OpenSpec）：**

- `useAetherEditor` 在 missing Provider 时 throw vs return null（spec 场景采用 throw，与 React context 惯例一致）。
- M5 输入桥接是否仅支持 `core:replaceText` 或包含更细粒度 input command（M5 最小：`replaceText` 路径可测即可）。
