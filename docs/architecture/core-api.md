# Core API 契约

> 状态：设计草案。实现开始前，本页定义宿主应用调用 `@aether-md/core` 的最小公开入口。

## 范围

Core API 面向宿主应用与 Shell。插件作者主要使用 [Plugin SDK](../sdk/README.md)，不应依赖 Core 内部实现类。

v1.0 目标是提供最小可运行编辑器入口：

- 创建编辑器实例
- 加载插件 Manifest
- 暴露 Command Bus 与 Event Hub
- 管理生命周期
- 销毁运行时资源

## 创建入口

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

行为约束：

- `dispatch` **MUST** 经过 Command Pipeline，不允许绕过 Middleware。
- `getDocument` **MUST** 返回只读快照或不可变数据。
- `dispose` **MUST** 以生命周期逆序调用插件清理逻辑。
- `dispose` 后再次调用 `dispatch` **MUST** 返回失败结果或抛出 `CoreError`。

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
