# Core API 契约

> 状态：M1 Core Bootstrap 与 M2 Command/Event Runtime 已实现。本页定义宿主应用调用 `@aether-md/core` 的 v1.0 目标公开入口，并记录当前已实现子集。

## 范围

Core API 面向宿主应用与 Shell。插件作者主要使用 [Plugin SDK](../sdk/README.md)，不应依赖 Core 内部实现类。

v1.0 目标是提供最小可运行编辑器入口：

- 创建编辑器实例
- 加载插件 Manifest
- 暴露 Command Bus 与 Event Hub
- 管理生命周期
- 销毁运行时资源

当前已实现子集：

- M1：`bootstrapCore`，用于验证 Manifest、Service Capability、plugin dependency order 和 lifecycle startup/dispose。
- M2：`createCommandEventRuntime`，提供独立的同步 Command Bus 与 Event Hub；不依赖 `bootstrapCore`、Adapter、Markdown 或 Shell。

尚未实现：`createEditor`、`AetherEditor`、Adapter、Markdown parse/serialize、React Shell、完整 Guard 链与文档读写 API。

## M1：`bootstrapCore`

```typescript
export function bootstrapCore(options: BootstrapCoreOptions): CoreBootstrapRuntime;
```

行为约束见 `openspec/specs/core-bootstrap/spec.md` 与 M1 相关 Docs。

## M2：`createCommandEventRuntime`

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
- `meta.priority` **MAY** 被忽略；M2 **MUST NOT** 实现 Command Queue 优先级或 coalescing。
- `on` **MUST** 返回 `Unsubscribe`；取消订阅后 **MUST NOT** 再收到事件。
- `emit` **MAY** 投递 `change` 与 `pluginError`；M2 **MUST NOT** 要求 Adapter 文档快照。
- `dispose` 后 `emit` **MUST** 为 no-op；重复 `dispose` **MUST NOT** 抛出。该行为仅约束 Command/Event runtime，不定义 `bootstrapCore` dispose 公开契约。
- 创建 runtime **MUST NOT** 要求 `bootstrapCore`、Adapter、Markdown 或 Shell。

完整类型见 [Command/Event 协议](../sdk/command-event-protocol.md)。main spec 见 `openspec/specs/command-event-runtime/spec.md`。

## 创建入口（v1.0 目标，尚未实现）

```typescript
export function createEditor(config: EditorConfig): Promise<AetherEditor>;
```

`createEditor` **MUST** 完成 Manifest 加载、依赖校验、静态合并、适配器创建和生命周期启动。启动失败时 **MUST** reject `CoreError`。

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

说明：M2 的 `CommandEventRuntime.dispatch` 为同步 API，且仅实现错误边界 Middleware。完整 `AetherEditor` 的 `Promise` 形态与 Guard 链属于后续里程碑。

## ExtensionPlugin

```typescript
export interface ExtensionPlugin {
  manifest: ExtensionManifest;
}
```

v1.0 插件对象以声明式 Manifest 为核心。后续如果引入工厂函数或动态插件包，**MUST** 保持 Manifest 作为可审查的权威入口。

## 开放问题

- `createEditor` 是否需要同步轻量入口。
- `state` 是否暴露订阅式 store。
- React Shell 是否直接消费 `AetherEditor`，还是通过单独的 Shell Adapter。

---
