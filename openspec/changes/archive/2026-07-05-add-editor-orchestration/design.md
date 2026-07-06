## Context

M1–M4 已建立：`bootstrapCore`、独立 `createCommandEventRuntime`、Adapter 协议与 plugin 实现、`@aether-md/preset-gfm` GFM round-trip（显式 harness wiring，不依赖 `createEditor`）。`docs/architecture/core-api.md` 已定义 v1.0 目标 API，且 Phase 0 冻结三项决策（async-only `createEditor`、只读 `state` + Event 观察、React 直接消费 `AetherEditor`）。

M4.5（本 change）在 `@aether-md/core` 内新增**编辑器编排层**，将既有构建块组合为 headless 宿主入口，满足 `docs/architecture/package-layout.md` 中 `packages/react` 建立条件的前半段（Core API smoke path），M5 再负责 React 绑定。

约束：

- 长期事实来源为 Docs；本 design 只抽取 M4.5 implementation contract。
- `@aether-md/core` **MUST NOT** 直接依赖 Remark、ProseMirror、React（ADR 003、M3/M4 boundary）。
- **MUST NOT** 通过 `bootstrapCore` silent provide `core:engine` / `core:parser`（`docs/architecture/core-api.md` M3 约束）。
- Phase 0 冻结决策为硬约束；偏离 **MUST** 在本文件记录 deviation。
- 说明性正文使用中文；API 名称、包名、路径与 OpenSpec 关键词保持 English。

## Goals / Non-Goals

**Goals:**

- 实现 `createEditor(config): Promise<AetherEditor>`，startup 失败 reject `CoreError`。
- 实现 `AetherEditor` 公开面及宿主 `getMarkdown()` / `getDocument()`。
- 显式 Adapter wiring：从 `EditorConfig.plugins` Manifest 解析 `metadata.provides` / factory 注入 Parser、Serializer、Engine；使用 `bootstrapCore` 跑 lifecycle，**不**修改 bootstrap silent-provide 规则。
- 集成 M2 Command/Event（editor 内部实例，非替换 standalone `createCommandEventRuntime`）。
- `initialValue: string` → Parser → Engine session；`initialValue: AetherDoc` → 直接 create session。
- 最小编排：`dispatch` 路由 engine-bound commands 至 `EngineAdapter.apply`；失败时恢复快照 + emit `transactionFailed` + 返回失败 `CommandResult`；成功时更新快照 + emit `change`。
- lifecycle 事件：`ready`（onReady 完成后）、`disposed`（dispose 完成后）。
- `EditorContext` 最小公开面（`commands`、`events`、`logger`、`services.engine/parser`）；`history` / `selection` / `clipboard` / `assets` / `telemetry` 允许 no-op stub。
- `EditorStateSnapshot` 只读快照（至少含当前 `doc`；**无** subscribe/store API）。
- Headless integration test：`createEditor` + `@aether-md/preset-gfm` GFM round-trip（无 UI）。
- 更新 package-boundary tests。

**Non-Goals:**

- M5 React Shell、GateLock、DOM、Shell Adapter。
- 完整 Guard 链、Permission enforce、Command Queue、Worker Thread、Telemetry 后端。
- compile-layer Schema 合并、宿主自定义 ConflictResolver。
- `bootstrapCore` Adapter plugin 自动加载 / silent provide（**否决**；见 Decision 3）。
- History / Selection / Clipboard 完整实现。
- 长期 Docs 大改（archive 后 sync）。

## Decisions

### 1. 新增 capability `editor-orchestration`，修改 `core-bootstrap` / `command-event-runtime` / `adapter-base`

**选择：** 编排行为独立为 `editor-orchestration` capability；package boundary 与 M2 关系分别在既有 capability delta 中 MODIFIED/ADDED。

**理由：** 与 M2/M3/M4「独立 capability + boundary delta」模式一致；避免将 editor 语义塞入 M1 bootstrap spec 正文。

### 2. `createEditor` 编排流水线

**选择：** `createEditor` 顺序：

| 步骤                | 行为                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Validate         | `EditorConfig.plugins` Manifest shape、version、`metadata.name` 唯一性（复用 bootstrap 校验逻辑或内部调用）                                  |
| 2. Resolve adapters | 从 plugin entries / preset factory 显式获取 Parser、Serializer、Engine 实例（Capability 校验：requires 必须由 provides 满足）                |
| 3. ConflictResolver | 对 **runtime.commands** 注册冲突调用 `createDefaultConflictResolver()`（`docs/engineering/conflict-resolver.md`）；**不**合并 compile.schema |
| 4. Bootstrap        | `bootstrapCore({ plugins })` 启动 lifecycle                                                                                                  |
| 5. Command/Event    | 创建 editor-scoped Command/Event runtime；注册 plugin commands                                                                               |
| 6. Engine session   | Parse `initialValue` 或接受 `AetherDoc` → `EngineAdapter.create`                                                                             |
| 7. Ready            | emit `ready`；resolve `AetherEditor`                                                                                                         |

**备选：** 扩展 `bootstrapCore` 自动加载 Adapter。否决：违反 M3/M4 边界与 silent-provide 禁止；ADR 001 要求 Adapter 容器化隔离。

### 3. Adapter wiring：显式 factory，非 bootstrap silent provide

**选择：** M4.5 **MUST NOT** 让 `bootstrapCore` silent provide `core:engine` / `core:parser`。Orchestration **MUST**：

- 接受宿主传入的 `ExtensionPlugin[]`（含 preset 的 `manifest` + 可选 factory 回调，implementation 定形）；
- 在 orchestration 层解析并持有 Parser / Serializer / Engine 引用；
- Service Capability validation 在 startup 前执行（loaded plugins + orchestration-resolved providers）。

**理由：** 对齐 `core-api.md` M3 约束与 M4 preset 模式（factory 可审查、不经 bootstrap 加载）。

**Deviation：** 无。

### 4. ConflictResolver 范围（M4.5 子集）

**选择：** M4.5 **仅**对 `runtime.commands` 合并/注册冲突使用 `createDefaultConflictResolver()`（默认 `command: last-wins`）。**不**实现 compile-layer `schema` / `keymap` 合并；**不**支持宿主注入自定义 resolver。

**理由：** `mvp-implementation-plan.md` M3/M4 排除 compile-layer；roadmap 完整 ConflictResolver 留 M5+ 或独立 change。M4.5 只需避免 duplicate command id 静默覆盖。

**备选：** 完整 compile-layer。否决：scope creep。

### 5. `AetherEditor.dispatch` 与 M2 runtime 关系

**选择：**

| 表面                          | 语义                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `createCommandEventRuntime()` | M2 不变：同步 `dispatch`，仅 error-boundary middleware                                           |
| `AetherEditor.dispatch()`     | `Promise<CommandResult>`；内部 editor-scoped runtime；engine-bound commands 经编排层调用 `apply` |
| 关系                          | Editor **MAY** 内部复用 M2 runtime 实现；**MUST NOT** 改变 standalone M2 公开行为或测试          |

Plugin-registered commands：经 editor runtime 同步 handler 路径（与 M2 一致），再包装为 Promise。

Engine-bound commands（implementation 定形，如 `core:replaceText` 或 adapter 协议命令）：编排层 save snapshot → `apply` → 成功更新 doc + emit `change`；失败 restore + emit `transactionFailed` + `{ ok: false }`。

**理由：** 对齐 `core-api.md`（Promise dispatch + Pipeline）与 Phase 0（无 sync createEditor）；闭合 `adapter-protocol.md` 编排 rollback 语义于 editor 层，而非 raw M2。

### 6. `EditorStateSnapshot` 最小 shape

**选择：**

```typescript
export interface EditorStateSnapshot {
  readonly doc: AetherDoc;
  readonly readOnly: boolean;
}
```

**无** `subscribe()` / store API（Phase 0 Decision #2）。Selection 状态 deferred；M4.5 `state` 仅反映文档快照与 readOnly flag。

### 7. `EditorContext` M4.5 最小面

**选择：** 公开 `commands`、`events`、`logger`、`grantedPermissions`、`services.engine`、`services.parser`。`history`、`selection`、`clipboard`、`assets`、`telemetry` 以 no-op stub 满足 `docs/sdk/editor-context.md` 类型形状，避免 M5 再 breaking Context 结构。

**理由：** roadmap 列 History/Selection/Clipboard 为 v1.0 必须，但 M4.5 目标是 headless smoke path；stub 允许 Shell 类型检查而不实现完整语义。

### 8. 事件语义

**选择：**

| 事件                | 触发                                                    |
| ------------------- | ------------------------------------------------------- |
| `ready`             | lifecycle onReady 完成 + engine session ready           |
| `change`            | 成功 apply 或等价文档变更；payload `{ doc, markdown? }` |
| `transactionFailed` | apply 失败且快照已恢复；payload `{ commandId, error }`  |
| `disposed`          | `AetherEditor.dispose()` 完成                           |
| `pluginError`       | 沿用 M2 handler 隔离                                    |

**理由：** `docs/sdk/command-event-protocol.md` 内置事件表；M2 未自动发出 ready/disposed/change(doc)。

### 9. Headless GFM integration test

**选择：** 在 `packages/core` 新增 integration test（devDeps: `@aether-md/preset-gfm`、adapter plugins）：

```
createEditor({ plugins: [gfmPreset], initialValue: markdown })
→ await editor ready
→ dispatch minimal edit
→ getMarkdown() / getDocument() assert
→ dispose
```

至少覆盖 GFM 矩阵中 1–2 个 fixture（implementation 可扩展至六语法）；**MUST NOT** import React/DOM。

**理由：** 验收标准可测试；验证 orchestration 非重复 M4 harness。

### 10. Phase 0 冻结决策对齐

| #   | 决策                      | M4.5 对齐     |
| --- | ------------------------- | ------------- |
| 1   | async-only `createEditor` | Decision 2、5 |
| 2   | 无 Core store             | Decision 6    |
| 3   | 无 Shell Adapter          | Non-Goals     |

**Deviation：** 无。

## Risks / Trade-offs

- [M2 与 editor dispatch 混淆] → 分离 package-boundary 与 dedicated M2 regression suite；editor tests 不替代 M2 tests。
- [stub Context services 被误用] → stub 方法 throw 或 no-op 须在 implementation 文档化；M5 前 plugin 不应依赖 History API。
- [ConflictResolver 仅 command 级] → duplicate keymap/schema 留 compile-layer change；design 明确排除。
- [integration test 依赖 workspace preset] → devDependency only；不进入 Core runtime deps。
- [rollback 仅 engine-bound path] → plugin command 失败仍走 M2 PluginError；不自动 Adapter rollback。

## Migration Plan

1. 新增 `packages/core` editor orchestration 模块与 types export。
2. 实现 `createEditor` 流水线（Decisions 2–4）。
3. 实现 `AetherEditor` 方法（Decisions 5–8）。
4. 更新 package-boundary tests（allow editor / forbid Shell+GFM re-export）。
5. 添加 headless GFM integration test。
6. `pnpm check` + `openspec validate add-editor-orchestration --strict`。

Rollback：revert branch；无 published package 负担。

## Open Questions

- `ExtensionPlugin` 是否需 factory 字段承载 Adapter 实例，或 preset 通过 convention 暴露 `{ manifest, createAdapters() }` — implementation 在 boundary test 通过前提下定稿。
- Engine-bound command id 命名空间（`core:*` vs `adapter:*`）— 须在 implementation 与 integration test 中一致。
- GFM integration matrix 覆盖六语法全量还是最小子集 — 建议至少 paragraph + list + strong 三类，其余可在 Superpowers task 扩展。
- `getMarkdown()` 是否在每次 `change` eagerly serialize — 建议 lazy on call，避免热路径开销；integration test 调用 `getMarkdown()` 断言。
