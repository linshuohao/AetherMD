# Adapter 协议

> 状态：设计草案。实现开始前，本页定义 Core 与底层编辑、解析、序列化引擎之间的协议边界。

## 设计原则

Adapter 是重型依赖的容器。Core 和插件 **MUST NOT** 直接依赖 ProseMirror、Remark 或其他具体引擎类型。

## Adapter 类型

v1.0 至少包含三类协议：

- `EngineAdapter`：负责编辑事务与文档状态。
- `ParserAdapter`：负责 Markdown 到 `AetherDoc`。
- `SerializerAdapter`：负责 `AetherDoc` 到 Markdown。

## EngineAdapter

```typescript
export interface EngineAdapter {
  readonly name: string;

  create(initialDoc: AetherDoc): Promise<EngineSession>;
  apply(session: EngineSession, request: AdapterCommandRequest): Promise<AdapterTransactionResult>;
  getDocument(session: EngineSession): AetherDoc;
  dispose(session: EngineSession): Promise<void>;
}
```

`EngineSession` 是 Adapter 私有句柄。Core **MUST NOT** 读取其内部字段。

## ParserAdapter

```typescript
export interface ParserAdapter {
  readonly name: string;
  parse(markdown: string, schema: AetherSchema): Promise<AetherDoc>;
}
```

`parse` **MUST** 返回框架无关 `AetherDoc`。无法识别的语法 **SHOULD** 保留为自定义块或降级为文本，而不是静默丢失。

## SerializerAdapter

```typescript
export interface SerializerAdapter {
  readonly name: string;
  serialize(doc: AetherDoc, schema: AetherSchema): Promise<string>;
}
```

`serialize` **MUST** 对 v1.0 内置结构提供确定性输出。无法序列化的节点 **MUST** 触发 `SerializationError` 或输出明确占位符。

## 事务结果

```typescript
export interface AdapterTransactionResult {
  ok: boolean;
  doc?: AetherDoc;
  markdown?: string;
  events?: AdapterEvent[];
  error?: AdapterError;
}
```

约束：

- 成功事务 **MUST** 返回最新 `AetherDoc`。
- 失败事务 **MUST** 不改变 Core 可见文档快照。
- Adapter 内部异常 **MUST** 转换为 `AdapterError`。

## 回滚语义

Core 在调用 `apply` 前 **SHOULD** 保存当前文档快照。`apply` 失败时：

1. 丢弃失败事务结果。
2. 恢复 Core 可见快照。
3. 发出 `transactionFailed` 事件。
4. 返回失败 `CommandResult`。

## 开放问题

- Adapter 是否需要声明能力矩阵。
- 是否需要独立 `SelectionAdapter`。
- 是否允许 Adapter 暴露调试用私有状态快照。

---
