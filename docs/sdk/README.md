# Plugin SDK

Plugin SDK 文档定义插件与 `@aether-md/core` 之间的公开契约。公开 TypeScript 类型 **MUST** 从 `@aether-md/core` 导入（见 [SDK 概述](overview.md#类型入口)）；本仓库不提供独立 `@aether-md/sdk` npm 包。

## 页面

| 页面                                            | 作用                                           |
| ----------------------------------------------- | ---------------------------------------------- |
| [SDK 概述](overview.md)                         | SDK 范围与契约摘要                             |
| [Manifest](manifest.md)                         | 分层 Manifest 结构与版本策略                   |
| [能力与权限](capabilities-and-permissions.md)   | Service Capability 与 Runtime Permission 模型  |
| [生命周期](lifecycle.md)                        | 扩展生命周期钩子与约束                         |
| [命令](commands.md)                             | Command Pipeline、Schema 声明、Command Handler |
| [Command/Event 协议](command-event-protocol.md) | 命令请求、命令结果和事件信封的公开数据结构     |
| [EditorContext](editor-context.md)              | 运行时上下文边界                               |
| [冲突解决](conflict-resolution.md)              | 冲突策略枚举与 Resolver 接口                   |
| [CustomBlockRenderer](custom-block-renderer.md) | 自定义块渲染契约                               |
| [插件示例](examples.md)                         | Bold、BubbleMenu、Table 插件示例               |

## 权威边界

SDK 文档负责维护：

- 插件 Manifest 字段
- 公开 TypeScript 接口
- Service Capability 语义
- Runtime Permission 语义
- 生命周期钩子行为
- 命令与 Schema 声明契约
- Command/Event 数据协议
- 插件作者可参考的示例

如果一项变更会影响插件作者，应先更新本分区，再更新实现说明。
