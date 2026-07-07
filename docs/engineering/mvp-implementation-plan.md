# 实施范围与验收标准

> 本页定义 v1.0 实施边界、已交付子集与验收标准。能力差距见 [能力概览](../project-status.md)。

## 实施目标

验证 AetherMD 的两条核心假设：

1. **架构假设**：声明式插件、微内核调度、Adapter 隔离、Markdown 往返与 React Shell 能组成可运行的集成管线（`examples/react` content 模式）。
2. **产品假设**：Instant Morphing + Block Focus 能组成可感知的产品体验（`examples/react` / `examples/vue` morphing 模式）。

架构集成管线通过 **不得** 解释为产品交互 north star 已满足（见 [产品交互体验规范](../architecture/product-experience-spec.md)）。

## 包范围

v1.0 **MUST** 至少包含：

- `packages/core`
- `packages/plugin-prosemirror`
- `packages/plugin-remark`
- `packages/preset-gfm`
- `packages/react`

`packages/vue` **MAY** 保留，作为 Vue Shell 与 morphing 产品面的集成载体。

## 已交付子集

### `@aether-md/core`

- **Bootstrap**：`bootstrapCore`、Manifest / Service Capability 校验、duplicate `metadata.name` 拒绝、lifecycle startup/dispose（含启动失败清理与幂等 `dispose()`）
- **Command/Event**：`createCommandEventRuntime`、同步 Command Bus、Event Hub、`PluginError` 错误边界
- **文档模型**：`AetherDoc` / `AetherSchema`、Adapter 协议类型、`AdapterError` / `SerializationError`
- **Editor Orchestration**：`createEditor(config): Promise<AetherEditor>`；`AetherEditor` 宿主 API；显式 Adapter wiring；`core:replaceText` rollback；headless GFM integration tests

### 适配器与预设

- `@aether-md/plugin-remark`：paragraph/heading 子集 + GFM parse/serialize；`CustomBlock` 占位符与 `SerializationError`
- `@aether-md/plugin-prosemirror`：最小 EngineAdapter + GFM schema/conversion + `createProseMirrorView` view-bridge
- `@aether-md/preset-gfm`：`createGfmPreset()`；六语法 round-trip integration tests

### 框架外壳

- `@aether-md/react`：`AetherEditorRoot` / `AetherEditorContent` / `useAetherEditor`；GateLock；happy-dom 集成测试
- `@aether-md/vue`：Vue morphing 产品面

### 验证套件

- `examples/headless-gfm`、`examples/react`、`examples/vue`
- G11 manifest 文档一致性、G6 example `typecheck`、启动中止回归
- 五包 publish 预备元数据；Changesets `linked` 配置

### OpenSpec main specs

`core-bootstrap`、`command-event-runtime`、`document-model`、`adapter-base`、`gfm-preset`、`editor-orchestration`、`react-shell`、`validation-suite`、`engineering-workflow`

## 必须实现（v1.0 完整目标）

- Manifest 分层加载与规范化
- `SUPPORTED_MANIFEST_VERSIONS` 校验
- Service Capability 校验
- Lifecycle：`load → onInit → onReady → dispose → onDestroy`
- Command Pipeline 同步路径与完整 Guard 链
- `CoreError`、`PluginError`、`AdapterError`、`SerializationError`
- Markdown 字符串初始化与 `getMarkdown()` / `getDocument()`
- History、Selection、Clipboard 内置底座
- compile-layer Schema 合并与 ConflictResolver 编排集成
- PermissionGuard 沙盒 enforce

## 暂不实现

- Worker Thread
- Command Queue 优先级与 coalescing
- 第三方插件完整沙盒
- Telemetry 后端
- 插件热插拔
- 多人协作
- nested lists、tables 等 GFM 扩展语法
- `CustomBlock` structured round-trip

## 验收标准

| 域                       | 验收条件                                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| **Core Bootstrap**       | 加载插件 Manifest，校验版本与依赖，启动生命周期；启动失败反向清理                                        |
| **Command/Event**        | 派发命令、返回结果、发出 `change` 与错误事件                                                             |
| **Adapter**              | parse Markdown、编辑文档、serialize Markdown；跨包 round-trip                                            |
| **GFM Preset**           | 六语法 round-trip；`SerializationError` 占位符策略                                                       |
| **Editor Orchestration** | headless `createEditor`；宿主 `getMarkdown` / `getDocument`；显式 wiring                                 |
| **React Shell**          | 挂载编辑器、dispatch 更新、GateLock 防重设、销毁实例                                                     |
| **产品交互**             | Instant Morphing + Block Focus 可演示；见 [产品交互体验规范](../architecture/product-experience-spec.md) |
| **CI**                   | `pnpm check` 绿；G11/G6 门禁；consumer smoke                                                             |

## 关联文档

- [Core API](../architecture/core-api.md)
- [文档模型](../architecture/document-model.md)
- [Adapter 协议](adapter-protocol.md)
- [Command/Event 协议](../sdk/command-event-protocol.md)
- [测试策略](test-strategy.md)
- [ADR 009：发布与治理策略](../adr/009-release-governance.md)
- [发布流程](../community/release-process.md)
- [产品交互体验规范](../architecture/product-experience-spec.md)
- [Examples Matrix](../examples/matrix.md)

---
