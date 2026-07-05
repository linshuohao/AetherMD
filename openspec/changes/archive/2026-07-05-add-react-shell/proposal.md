## Why

M4.5 已完成 headless `createEditor` / `AetherEditor` 编排与 GFM headless integration tests，但 MVP 仍缺可挂载的 React Shell 来验证「React + AetherEditor + GateLock」最小可运行编辑器假设（见 `docs/engineering/mvp-implementation-plan.md` M5 行、`docs/architecture/roadmap.md`）。M5 在不改变 Core 语义的前提下，新增 `@aether-md/react` 薄绑定层，闭合数据流末端 GateLock（`docs/engineering/data-flow.md`）与 CI 行为回归项（`docs/architecture/ci-checklist.md`）。

## What Changes

- 新建 `@aether-md/react` Public Adapter package（`packages/react`），接入 workspace `build` / `typecheck` / `test` / `pnpm check`。
- 公开 API：`AetherEditorRoot`（Provider）、`AetherEditorContent`（View）、`useAetherEditor` hook；直接消费 `createEditor` / `AetherEditor` 公开面（Phase 0 Decision #3，`docs/architecture/core-api.md`）。
- 实现 Shell GateLock：当受控 `value` / `markdown` prop 的 `prevValue === nextValue` 时 **MUST NOT** 重设文档或 remount engine session。
- ProseMirror DOM 挂载：经 `@aether-md/plugin-prosemirror` additive view-bridge 将 `EditorView` 绑定到 content DOM；用户输入经 Command 路径（`core:replaceText` 或等价 engine-bound command）桥接，**MUST NOT** 绕过 `AetherEditor.dispatch`。
- `useAetherEditor` 在 React 层桥接 `change` 事件为 `markdown` / `doc` state（Phase 0 Decision #2：Core 无 store）。
- happy-dom 集成测试：mount → type → `onChange` callback → dispose。
- GFM smoke：`createEditor` + `@aether-md/preset-gfm` + React 组件（paragraph、strong、list fixtures）。
- 新增 capability delta spec：`react-shell`。
- **可能 MODIFIED** `editor-orchestration`：仅补充 Shell 消费约束措辞，**不**改变 Core 编排行为。
- **非 BREAKING**：`@aether-md/core` 无 API 或行为变更。

## Capabilities

### New Capabilities

- `react-shell`: `@aether-md/react` 包边界、公开组件/hook API、GateLock、ProseMirror DOM 挂载与 change 桥接、happy-dom 集成测试、GFM preset React smoke 归属。

### Modified Capabilities

- `editor-orchestration`: 补充 React Shell 对 `AetherEditor` 的消费约束（直接消费公开 API、无 Shell Adapter、React 层 hook 桥接 `change`）；**不**修改 `createEditor` / `AetherEditor` Core 行为或 headless 集成测试要求。

## Impact

- **代码**：新建 `packages/react`；可能 additive export `@aether-md/plugin-prosemirror` view-bridge（`createProseMirrorView` 或等价）；**不**修改 `packages/core` 运行时依赖。
- **API**：`@aether-md/react` 新 public exports；`@aether-md/core` **无** breaking change；`@aether-md/plugin-prosemirror` 可能 minor additive。
- **契约**：archive 后 sync `react-shell` main spec；`editor-orchestration` 补充 Shell 消费约束。
- **依赖**：`@aether-md/react` 依赖 `react`（peer）、`@aether-md/core`、`@aether-md/plugin-prosemirror`（runtime，Content 消费 view-bridge）；测试 devDeps 引用 preset/plugin-remark；Core **MUST NOT** 新增 react/prosemirror/remark runtime deps。
- **测试/CI**：新增 happy-dom 集成测试；`docs/architecture/ci-checklist.md` GateLock 项可勾选；**不**引入 Playwright / 浏览器 CI。
- **OpenSpec main spec（archive 后 sync）**：新增 `react-shell`；可能 MODIFIED `editor-orchestration`。

## 非目标

- Vue Shell（`@aether-md/vue`）、toolbar、主题、History undo/redo UI。
- Core 完整 Guard 链、Permission enforce、Core 订阅式 store（Phase 0 #2）。
- Shell Adapter 抽象层（Phase 0 #3）。
- `bootstrapCore` silent provide 变更。
- Playwright / 浏览器 CI（M5 使用 happy-dom）。
- `examples/react-basic`（可选 follow-up）。
- `plugin-prosemirror` 大改（仅允许 additive view-bridge export，若 `design.md` 决策需要）。
- compile-layer Schema 合并、Worker Thread、Command Queue、Telemetry 后端。

## Source Docs

- `docs/architecture/core-api.md`（Phase 0 Decision #2 #3）
- `docs/architecture/package-layout.md`
- `docs/architecture/roadmap.md`
- `docs/architecture/ci-checklist.md`（GateLock 集成测试项）
- `docs/architecture/principles.md`
- `docs/engineering/mvp-implementation-plan.md`（M5 验收标准）
- `docs/engineering/data-flow.md`（GateLock）
- `docs/engineering/test-strategy.md`
- `docs/engineering/component-library-governance.md`
- `packages/core/src/editor/**`（M4.5 已实现 API）
- `packages/plugins/plugin-prosemirror/**`（EngineSession 内部状态）
- `openspec/specs/editor-orchestration/spec.md`

## Version Impact

- **`@aether-md/react`**：新 package，初始版本 `0.1.0`（或 workspace `0.0.0` private 直至发布审查）；需 Changeset。
- **`@aether-md/core`**：**无 breaking change**；semver 不变；export 与 runtime deps 不变。
- **`@aether-md/plugin-prosemirror`**：可能 **minor additive**（若 export view-bridge helper）；现有 `EngineAdapter` 行为 **MUST NOT** breaking change。
- **`@aether-md/preset-gfm`**：消费方不变；被 React smoke tests 引用。
- **`manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS`**：**不变**（`[1]`）。
- **Lockfiles**：预期变更 — `packages/react` dependencies、happy-dom devDependency、可能 `plugin-prosemirror` peer/export 调整。

## Code-Management Status

- **Branch**：`feat/add-react-shell`（自 `main` 创建；working tree 干净）。
- **Conventional Commit type**：OpenSpec 产物 `docs(openspec)`；实现阶段预期 `feat(react)`、`test(react)`。
- **OpenSpec change id**：`add-react-shell`。
- **Unrelated dirty files**：无。

## 风险

- ProseMirror `EditorView` 与 headless `EngineSession` 状态同步 — 须在 `design.md` 冻结桥接位置，避免 React 直改 PM doc 绕过 Command Bus。
- happy-dom 与 ProseMirror 输入事件兼容性 — 集成测试须覆盖 type → change 主路径；若不足，记录为 follow-up（不切换 Playwright 于 M5）。
- GateLock 与受控 props 时序 — 须明确比较基准（Markdown string）与 `change` 事件顺序，避免反馈环。
- 若将 Core store、Guard 链或 Vue Shell 并入本 change，范围膨胀至 M6+。

## 验收标准

- `openspec/changes/add-react-shell/` 存在 `proposal.md`、`design.md`、`specs/react-shell/spec.md`、`specs/editor-orchestration/spec.md`（若 MODIFIED）、`tasks.md`。
- `openspec validate add-react-shell --strict` 通过。
- **Implementation 阶段**：`pnpm check` 全绿（含新 package）。
- React 组件可挂载、可输入、可监听 change、可 dispose。
- GateLock 集成测试通过（`prevValue === nextValue` 不重设文档）。
- GFM preset + React smoke（paragraph、strong、list）通过。
- `@aether-md/core` dependencies 仍无 react/prosemirror/remark runtime deps。
