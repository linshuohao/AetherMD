# 文档模型

> 状态：M3 最小子集 + M4 GFM structured round-trip 已实现（`@aether-md/core` export + Adapter plugin + preset-gfm round-trip）。本页定义 AetherMD 的框架无关文档数据边界；`ListBlock`/`LinkInline`/`MarkedInline` 已纳入 M4 round-trip 矩阵，`CustomBlock` export 保留但 structured round-trip 仍 deferred。

## 目标

`AetherDoc` 是 Core、SDK 与 Adapter 之间共享的最小文档结构。它不是 ProseMirror JSON，也不是 Markdown AST 的直接暴露。

文档模型的目标：

- 对插件保持稳定
- 能映射到 Markdown
- 能映射到 ProseMirror
- 支持自定义块与行内扩展
- 避免上层插件携带引擎私有类型

## 最小结构

```typescript
export interface AetherDoc {
  type: 'doc';
  children: AetherBlock[];
  meta?: Record<string, unknown>;
}

export type AetherBlock =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | CustomBlock;

export type AetherInline =
  | TextInline
  | LinkInline
  | MarkedInline;
```

## v1.0 内置块

```typescript
export interface ParagraphBlock {
  type: 'paragraph';
  children: AetherInline[];
}

export interface HeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: AetherInline[];
}

export interface ListBlock {
  type: 'list';
  ordered: boolean;
  items: AetherBlock[][];
}
```

## v1.0 内置行内结构

```typescript
export interface TextInline {
  type: 'text';
  text: string;
}

export interface LinkInline {
  type: 'link';
  href: string;
  title?: string;
  children: AetherInline[];
}

export interface MarkedInline {
  type: 'mark';
  mark: 'strong' | 'emphasis' | string;
  children: AetherInline[];
}
```

## 自定义块

```typescript
export interface CustomBlock {
  type: 'custom';
  name: string;
  attrs?: Record<string, unknown>;
  children?: AetherBlock[] | AetherInline[];
}
```

自定义块 **MUST** 使用 JSON 可序列化属性。插件 **MUST NOT** 在 `attrs` 中存放 DOM、函数、ProseMirror Node 或 Remark Node。

## 映射要求

| 方向 | 要求 |
| --- | --- |
| Markdown -> AetherDoc | Parser Adapter **MUST** 保留 v1.0 内置块语义 |
| AetherDoc -> Markdown | Serializer Adapter **MUST** 对内置结构提供稳定输出；M4 覆盖 paragraph、heading、strong、emphasis、list、link；`CustomBlock` 输出 `[unsupported:block:<name>]` 占位符 |
| AetherDoc -> ProseMirror | Engine Adapter **MUST** 负责私有结构转换；M4 保留 GFM list、link、mark 结构通过 edit leg |
| ProseMirror -> AetherDoc | Engine Adapter **MUST** 产出框架无关快照 |

## 开放问题

- 是否需要为所有节点引入稳定 `id`。
- 自定义块的 Markdown fallback 语法是否由插件声明。
- `meta` 是否允许插件命名空间写入。

---
