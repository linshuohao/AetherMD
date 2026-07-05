## 1. OpenSpec 与 package 脚手架

- [ ] 1.1 确认 `openspec/changes/add-react-shell/` artifacts 与 `openspec validate add-react-shell --strict` 通过
- [ ] 1.2 创建 `packages/react`（`@aether-md/react`）：`package.json`、`exports`、types、`build` / `typecheck` / `test` 脚本
- [ ] 1.3 将 `packages/react` 接入 `pnpm-workspace.yaml` / turbo pipeline；添加 Changeset

## 2. plugin-prosemirror view-bridge（additive）

- [ ] 2.1 在 `@aether-md/plugin-prosemirror` 新增 additive `createProseMirrorView`（或等价）export
- [ ] 2.2 实现 view 创建/销毁：绑定 `EngineSession`、DOM 容器、输入回调；不暴露 `sessions` Map
- [ ] 2.3 补充 plugin-prosemirror contract tests：view 与 `getDocument()` 快照一致

## 3. React Shell 组件与 hook

- [ ] 3.1 实现 `AetherEditorRoot`：`createEditor` 生命周期、context、受控 `value`/`onChange` props
- [ ] 3.2 实现 `AetherEditorContent`：DOM ref + `createProseMirrorView` 挂载/卸载
- [ ] 3.3 实现 `useAetherEditor`：暴露 `editor`、`markdown`、`doc`、`ready`、`error`；桥接 `change` 事件
- [ ] 3.4 实现 GateLock：`prevValue === nextValue` 时跳过重设文档/remount session

## 4. 输入与 Command 桥接

- [ ] 4.1 将 DOM 输入桥接到 `AetherEditor.dispatch`（M5 最小：`core:replaceText` 路径）
- [ ] 4.2 确认成功编辑 emit `change` 并触发 `onChange(markdown)`

## 5. 测试与 package boundary

- [ ] 5.1 配置 happy-dom 作为 `@aether-md/react` 测试 DOM 运行时
- [ ] 5.2 集成测试：mount → type → `onChange` → dispose
- [ ] 5.3 GateLock 集成测试：`prevValue === nextValue` 不重设文档
- [ ] 5.4 GFM React smoke：paragraph、strong、list fixtures
- [ ] 5.5 package-boundary：`@aether-md/core` 无 react/prosemirror/remark runtime deps；`@aether-md/react` 不直接 import `prosemirror-view`
- [ ] 5.6 确认 M1–M4.5 既有测试保持 green

## 6. 验证与归档准备

- [ ] 6.1 运行 `pnpm check` 全绿
- [ ] 6.2 运行 `openspec validate add-react-shell --strict`
- [ ] 6.3 准备 archive 后 docs/spec sync 清单（`aether-workflow-update-docs-spec`：test-strategy M5 基线、package-layout、`ci-checklist` GateLock 项）

## 7. Superpowers 详细任务（本文件仅高层）

- [ ] 7.1 使用 `aether-workflow-create-plan` 生成 implementation plan
- [ ] 7.2 使用 `aether-workflow-create-task` / `aether-workflow-execute-task-loop` 拆分并实现 scoped tasks
