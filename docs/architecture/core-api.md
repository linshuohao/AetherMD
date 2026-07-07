# Core API 契约

> 本页定义宿主应用调用 `@aether-md/core` 的 v1.0 目标公开入口，并记录当前已实现子集。

## 范围

Core API 面向宿主应用与 Shell。插件作者主要使用 [Plugin SDK](../sdk/README.md)，不应依赖 Core 内部实现类。

v1.0 目标是提供最小可运行编辑器入口：

- 创建编辑器实例
- 加载插件 Manifest
- 暴露 Command Bus 与 Event Hub
- 管理生命周期
- 销毁运行时资源

当前已实现子集：

- **Core Bootstrap**：`bootstrapCore`，用于验证 Manifest、Service Capability、plugin dependency order 和 lifecycle startup/dispose。
- **Command/Event Runtime**：`createCommandEventRuntime`，提供独立的同步 Command Bus 与 Event Hub；不依赖 `bootstrapCore`、Adapter 实现、Markdown 或 Shell。
- **Document model / Adapter types**：document-model 与 adapter-base **类型** export（`AetherDoc`、`AetherSchema`、三类 Adapter 协议、`AdapterError` / `SerializationError`）；Adapter **实现**位于 `@aether-md/plugin-remark` 与 `@aether-md/plugin-prosemirror`，不由 Core 直接提供 parse/serialize/engine 运行时。
- **Editor orchestration**：`createEditor(config): Promise<AetherEditor>`（async-only，无 sync 入口）；`AetherEditor` 宿主 API（`context`、`state`、`dispatch`、`on`、`getMarkdown`、`getDocument`、`dispose`）；显式 Adapter wiring；最小编排 rollback（engine-bound `core:replaceText`）；`ready` / `change` / `transactionFailed` / `disposed` 事件；**无** Core store/subscribe API。

Core 尚未实现：完整 Guard 链、compile-layer Schema 合并、Permission enforce、`bootstrapCore` Adapter plugin 自动加载、`EditorConfig.logger` 宿主注入（内部 stub 可用）。React Shell 由 `@aether-md/react` 提供，不属于 Core API export。

## `bootstrapCore`

```typescript
export function bootstrapCore(options: BootstrapCoreOptions): CoreBootstrapRuntime;
```

行为约束见 `openspec/specs/core-bootstrap/spec.md`。

## `createCommandEventRuntime`

```typescript
export function createCommandEventRuntime(): CommandEventRuntime;

export interface CommandEventRuntime {
  register(id: CommandId, handler: CommandHandler): void;
  dispatch(command: CommandRequest): CommandResult;
  on(eventName: EventName, listener: EventListener): Unsubscribe;
  emit(event: EventEnvelope): void;
  dispose(): void;
}
```

行为约束：

- `dispatch` **MUST** 同步返回 `CommandResult`，不得要求 `Promise`。
- `dispatch` **MUST** 经过错误边界；handler 抛错时 **MUST** 返回 `{ ok: false }` 且 `error.source` 为 `plugin`，并 **MAY** 发出 `pluginError` 事件。
- 未知命令与 dispose 后的 `dispatch` **MUST** 返回 `{ ok: false }` 且 `error.source` 为 `core`，不得向宿主抛出。
- `meta.priority` **MAY** 被忽略；**MUST NOT** 实现 Command Queue 优先级或 coalescing。
- `on` **MUST** 返回 `Unsubscribe`；取消订阅后 **MUST NOT** 再收到事件。
- `emit` **MAY** 投递 `change` 与 `pluginError`；**MUST NOT** 要求 Adapter 文档快照。
- `dispose` 后 `emit` **MUST** 为 no-op；重复 `dispose` **MUST NOT** 抛出。该行为仅约束 Command/Event runtime，不定义 `bootstrapCore` dispose 公开契约。
- 创建 runtime **MUST NOT** 要求 `bootstrapCore`、Adapter、Markdown 或 Shell。

完整类型见 [Command/Event 协议](../sdk/command-event-protocol.md)。main spec 见 `openspec/specs/command-event-runtime/spec.md`。

## document-model 与 adapter-base 类型（已实现子集）

`@aether-md/core` 导出框架无关文档类型与 Adapter 协议，供 plugin package 与后续 Shell 消费：

```typescript
// document-model（type exports）
export type {
  AetherDoc,
  AetherBlock,
  AetherInline,
  AetherSchema,
  ParagraphBlock,
  HeadingBlock,
  TextInline /* … */,
};

// adapter-base（type exports + error classes）
export type {
  ParserAdapter,
  SerializerAdapter,
  EngineAdapter,
  EngineSession,
  AdapterCommandRequest,
  AdapterTransactionResult,
  AdapterEvent,
};
export { AdapterError, SerializationError };
```

行为约束：

- Core **MUST NOT** 直接依赖 Remark、ProseMirror、React 或 Vue。
- `EngineAdapter.getDocument(session)` 是 Adapter 协议方法，**不是**宿主 `AetherEditor.getDocument()`。
- **MUST NOT** 通过 `bootstrapCore` silent provide `core:engine` / `core:parser`。
- **MUST NOT** 在 `createCommandEventRuntime.dispatch` 中自动 invoke Adapter rollback 或 emit `transactionFailed`。

最小 Adapter 实现包：

- `@aether-md/plugin-remark`：`createRemarkParserAdapter()`、`createRemarkSerializerAdapter()`
- `@aether-md/plugin-prosemirror`：`createProseMirrorEngineAdapter()`

main specs 见 `openspec/specs/document-model/spec.md`、`openspec/specs/adapter-base/spec.md`。

## `createEditor` / `AetherEditor`（已实现子集）

```typescript
export function createEditor(config: EditorConfig): Promise<AetherEditor>;
```

`createEditor` **MUST** 完成 Manifest 加载、依赖校验、显式 Adapter wiring、生命周期启动与 engine session 初始化。启动失败时 **MUST** reject `CoreError`。v1.0 **MUST NOT** 提供 `createEditorSync` 或等价同步入口。

**已实现**：宿主 `getMarkdown()` / `getDocument()`、editor-scoped dispatch 最小编排 rollback、lifecycle 事件。**尚未实现**：完整 Guard 链、compile-layer 合并、Permission enforce。

## EditorConfig

```typescript
export interface EditorConfig {
  plugins: ExtensionPlugin[];
  initialValue?: string | AetherDoc;
  readOnly?: boolean;
  security?: EditorSecurityConfig;
  logger?: LoggerSink;
}

export interface EditorSecurityConfig {
  grantedPermissions?: PermissionId[];
  defaultDeny?: PermissionId[];
}
```

约束：

- `plugins` **MUST** 按宿主期望加载顺序传入。
- `initialValue` 为 Markdown 字符串时，Core **MUST** 通过 Parser Adapter 转换为 `AetherDoc`。
- 未声明的 Runtime Permission 默认拒绝。
- v1.0 **MAY** 暂不支持运行时热插拔插件。

## AetherEditor

```typescript
export interface AetherEditor {
  readonly context: EditorContext;
  readonly state: EditorStateSnapshot;

  dispatch(command: CommandRequest): Promise<CommandResult>;
  on(eventName: EventName, listener: EventListener): Unsubscribe;
  getMarkdown(): Promise<string>;
  getDocument(): AetherDoc;
  dispose(): Promise<void>;
}
```

行为约束（v1.0 目标）：

- `dispatch` **MUST** 经过 Command Pipeline，不允许绕过 Middleware。
- `getDocument` **MUST** 返回只读快照或不可变数据。
- `dispose` **MUST** 以生命周期逆序调用插件清理逻辑。
- `dispose` 后再次调用 `dispatch` **MUST** 返回失败结果或抛出 `CoreError`。

说明：同步 `CommandEventRuntime.dispatch` 为独立 API，且仅实现错误边界 Middleware。完整 `AetherEditor` 的 `Promise` 形态与 Guard 链属于后续能力。

## ExtensionPlugin

```typescript
export interface ExtensionPlugin {
  manifest: ExtensionManifest;
}
```

v1.0 插件对象以声明式 Manifest 为核心。后续如果引入工厂函数或动态插件包，**MUST** 保持 Manifest 作为可审查的权威入口。

## 开放问题（已冻结，v1.0）

以下决策在 editor orchestration 与 React Shell 实现期间已冻结为 v1.0 Core API 约束；若实现偏离，**MUST** 在对应 OpenSpec change 的 `design.md` 中记录 deviation。

### 1. `createEditor` 同步轻量入口

- **Decision**：v1.0 **MUST NOT** 提供同步轻量入口；仅保留 `createEditor(config): Promise<AetherEditor>`。
- **Rationale**：Manifest 加载、依赖校验、Adapter 创建与 lifecycle 启动均可能涉及异步 I/O；同步 `CommandEventRuntime` 是独立构建块，不等同于完整编辑器 bootstrap。遵循 [架构原则](principles.md)「非必要不新增抽象」，避免 `createEditorSync` / `createEditorLite` 等并行入口增加宿主选型负担。

### 2. `state` 订阅式 store

- **Decision**：v1.0 **MUST NOT** 在 Core 暴露订阅式 store；`AetherEditor.state` **MUST** 保持只读快照（`EditorStateSnapshot`），Shell 通过 Event Hub `on('change', …)` 观察变更并在框架层自行桥接 UI 状态。
- **Rationale**：与「命令驱动意图，事件驱动观察」一致（见 [架构原则](principles.md) 与 [数据流](../engineering/data-flow.md)）。Core 不引入第二套 reactive 订阅通道；React Shell 可在 `@aether-md/react` 内用 hook 将 `change` 事件映射为组件 state，而不改变 Core 语义。

### 3. React Shell 与 `AetherEditor` 边界

- **Decision**：v1.0 React Shell **MUST** 直接消费 `AetherEditor` 公开 API（`dispatch`、`on`、`getMarkdown`、`getDocument`、`dispose` 等）；**MUST NOT** 引入单独的 Shell Adapter 抽象层。
- **Rationale**：`AetherEditor` 已是宿主/Shell 边界（见本页「范围」）；`@aether-md/react` 提供薄 React 绑定（组件与 hook），而非第二套跨框架 Adapter。单独 Shell Adapter 会增加 indirection 且与「Framework is Disposable」冲突——可抛弃的是 React 包，而非在 Core 与 Shell 之间再插一层协议。

---
