# Task 01: 定义 Command/Event public types 与 package boundary tests

Change:

- `add-command-event-runtime`

Spec Requirement:

- `Command and Event public types are exported`
- `CommandEventRuntime public API is exported`（仅类型与 factory 表面断言；行为可在后续 task 补齐）
- `M2 package boundary excludes later milestones`（边界测试骨架）
- `core-bootstrap` MODIFIED：`Minimal Core package exists`（MAY expose Command/Event）

Source Docs:

- `.superpowers/plans/add-command-event-runtime.md`
- `openspec/changes/add-command-event-runtime/design.md`
- `openspec/changes/add-command-event-runtime/specs/command-event-runtime/spec.md`
- `openspec/changes/add-command-event-runtime/specs/core-bootstrap/spec.md`
- `docs/sdk/command-event-protocol.md`
- `docs/engineering/error-model.md`

## 目标

定义 M2 Command/Event public types，并更新 package boundary tests：允许 `createCommandEventRuntime` 表面，继续禁止后续里程碑 API。

## 范围

- 新增 Command/Event 类型与 `PluginError`（或等价 `source: 'plugin'` 错误类型）。
- 导出 `createCommandEventRuntime` 的最小 stub（可返回占位 runtime，方法可先抛未实现或返回最小失败结果）。
- 更新 `package-boundary.test.ts`：允许 M2 factory；禁止 Adapter / React / Remark / ProseMirror / GFM / Markdown parse/serialize / `createEditor`。
- **不**实现完整 Event Hub、Command Bus、dispose 语义或错误隔离逻辑。

Allowed Files:

- `packages/core/src/command-event-types.ts`
- `packages/core/src/errors.ts`（仅扩展 `PluginError` / runtime core 失败码，不改 bootstrap fatal 语义）
- `packages/core/src/command-event-runtime.ts`（仅 factory stub）
- `packages/core/src/index.ts`
- `packages/core/src/package-boundary.test.ts`
- `packages/core/src/command-event-runtime.test.ts`（仅 export / factory 表面 smoke）

Forbidden Files:

- `packages/core/src/bootstrap.ts`（不得把 Command/Event 挂到 `CoreBootstrapRuntime`）
- `packages/react/**`
- `packages/preset-gfm/**`
- `packages/plugin-prosemirror/**`
- `packages/plugin-remark/**`
- Adapter / Markdown parse/serialize 实现文件
- `docs/**`
- `openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 在 `command-event-runtime.test.ts` 写失败测试：可导入 `createCommandEventRuntime`，返回对象含 `register` / `dispatch` / `on` / `emit` / `dispose`。
2. 在 `package-boundary.test.ts` 写失败断言：exports 包含 `createCommandEventRuntime`；仍不包含 `createEditor`、`parseMarkdown`、`serializeMarkdown`、`getMarkdown`、`getDocument`。
3. 运行 `pnpm --filter @aether-md/core test`，确认上述测试 FAIL（缺少 export / factory）。
4. 再写最小 types + stub 使测试 PASS。

TDD Notes:

- red-green：先失败边界/导出测试，再最小实现。
- 本任务不要求 Event Hub 或 dispatch 行为正确，只要求 public surface 存在。

## 实现步骤

1. 按 `docs/sdk/command-event-protocol.md` 定义 `CommandId`、`CommandRequest`、`CommandMeta`、`CommandResult`、`EventName`、`EventEnvelope`、`CommandHandler`、`EventListener`、`Unsubscribe`。
2. 定义 `PluginError`（`source: 'plugin'`，`severity: 'recoverable'`）及 runtime 用 `source: 'core'` 失败形状（可复用/扩展 `CoreError`）。
3. 实现 `createCommandEventRuntime()` stub，方法签名完整。
4. 从 `index.ts` 导出 types 与 factory。
5. 更新 `package-boundary.test.ts`：允许 M2；禁止后续里程碑 export 名。
6. 运行验证命令至通过。

Implementation Notes:

- 规范名称不得改名：`createCommandEventRuntime`、`CommandEventRuntime`。
- 独立 factory，不修改 `bootstrapCore`。
- 说明性注释仅用于边界/延后行为；不写复述代码的注释。

## 验证命令

```bash
pnpm --filter @aether-md/core test
pnpm --filter @aether-md/core exec tsc --noEmit
rg -i "react|prosemirror|remark|gfm|createEditor|parseMarkdown|serializeMarkdown|getMarkdown|getDocument" packages/core/src packages/core/package.json
```

预期：tests / typecheck 通过；`rg` 无后续里程碑实现命中（boundary 测试中的禁止导出名字符串除外）。

Intuitive Verification:

- 无（本任务以自动化 export / boundary 测试为准）。

Review Checklist:

- [x] public types 与 `command-event-protocol.md` 对齐。
- [x] `createCommandEventRuntime` 已导出。
- [x] boundary tests 允许 M2、禁止 Adapter/React/Remark/ProseMirror/GFM/Markdown/`createEditor`。
- [x] 未修改 `bootstrap.ts`。
- [x] 未实现完整 Bus/Hub 行为冒充完成。

## 回滚提示

Rollback Notes:

- 删除本任务新增的 `command-event-types.ts`、`command-event-runtime.ts`、相关 tests。
- 恢复 `index.ts` 与 `package-boundary.test.ts`、`errors.ts` 到任务前状态。
- 不触碰 M1 bootstrap 行为文件（除非本任务误改，一并回滚）。

Version Impact:

- `@aether-md/core` public exports 增量（types + factory stub）；不改 `manifestVersion` / lockfiles。

Commit Scope:

- `feat(core): add command-event public types and boundary tests`

Status:

- completed

Run Log:

- TDD red：`createCommandEventRuntime` / `PluginError` 缺失导致 compile fail。
- 新增 `command-event-types.ts`、`command-event-runtime.ts` stub、`PluginError`、`index.ts` exports。
- 更新 `package-boundary.test.ts` 允许 M2、禁止后续里程碑 export。
- `pnpm --filter @aether-md/core test` pass（24 tests）。
- `pnpm --filter @aether-md/core exec tsc --noEmit` pass。
- `rg` 仅命中 boundary 测试中的禁止导出名字符串。
- 未修改 `bootstrap.ts`。
- Version impact：public exports 增量（types + factory stub + PluginError）。

Deviation:

- 无。
