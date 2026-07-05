## 1. OpenSpec 与类型面

- [ ] 1.1 确认 `openspec/changes/add-editor-orchestration/` artifacts 与 strict validation 通过
- [ ] 1.2 在 `packages/core` 定义并 export `EditorConfig`、`ExtensionPlugin`、`AetherEditor`、`EditorContext`、`EditorStateSnapshot` 及关联类型

## 2. createEditor 编排流水线

- [ ] 2.1 实现 Manifest / Capability / duplicate name 校验与 `bootstrapCore` lifecycle 集成
- [ ] 2.2 实现显式 Parser / Serializer / Engine adapter 解析与 wiring（无 bootstrap silent provide）
- [ ] 2.3 实现 `initialValue` Markdown → Parser 与 `AetherDoc` 直传两条初始化路径
- [ ] 2.4 集成 `createDefaultConflictResolver()` 于 runtime command 注册（不含 compile-layer merge）
- [ ] 2.5 startup 失败路径 reject `CoreError`；成功路径 emit `ready`

## 3. AetherEditor 运行时

- [ ] 3.1 实现 editor-scoped Command/Event runtime 与 `dispatch(): Promise<CommandResult>`
- [ ] 3.2 实现 engine-bound command 路由、`apply` 成功/失败、快照恢复、`change` / `transactionFailed` 事件
- [ ] 3.3 实现 `getDocument()`、`getMarkdown()`、`on()`、`dispose()` 与 `disposed` 事件
- [ ] 3.4 实现 `EditorContext` 最小面与 History/Selection/Clipboard 等 stub services

## 4. 测试与 package boundary

- [ ] 4.1 更新 `@aether-md/core` package-boundary tests（允许 editor export；禁止 Shell / GFM preset re-export / engine runtime deps）
- [ ] 4.2 确认 M1–M4 既有测试保持 green
- [ ] 4.3 新增 headless integration test：`createEditor` + `@aether-md/preset-gfm` GFM round-trip（无 React / 无 DOM）
- [ ] 4.4 新增 editor orchestration contract tests：startup 失败、dispose fail-closed、rollback 快照

## 5. 验证与归档准备

- [ ] 5.1 运行 `pnpm check` 全绿
- [ ] 5.2 运行 `openspec validate add-editor-orchestration --strict`
- [ ] 5.3 准备 archive 后 docs/spec sync 清单（`aether-workflow-update-docs-spec`）

## 6. Superpowers 详细任务（本文件仅高层）

- [ ] 6.1 使用 `aether-workflow-create-plan` 生成 implementation plan
- [ ] 6.2 使用 `aether-workflow-create-task` / `aether-workflow-execute-task-loop` 拆分并实现 scoped tasks
