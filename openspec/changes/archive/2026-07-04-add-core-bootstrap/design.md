# add-core-bootstrap Design

## 总览

本 change 定义 `@aether-md/core` 的第一个可执行切片：最小 Core Bootstrap runtime。它应能接收插件 Manifest，校验启动合同，按依赖顺序执行生命周期钩子，并在销毁时按逆序清理插件。

实现应刻意保持窄范围。它只创建满足 `docs/engineering/mvp-implementation-plan.md` 中 M1 Core Bootstrap 所需的包与模块。

## 实现合同

M1 实现合同如下：

- 提供加载插件所需的最小 `@aether-md/core` 包表面，插件公开入口为 `ExtensionPlugin.manifest`。
- 导出 `SUPPORTED_MANIFEST_VERSIONS = [1] as const`，并提供与 `docs/sdk/manifest.md` 和 `docs/architecture/compatibility.md` 一致的 Manifest 相关类型。
- 按 `docs/engineering/manifest-loading.md` 规范化或拒绝原始 Manifest 输入。
- 校验每个插件 Manifest 都声明受支持的 `metadata.manifestVersion`。
- 使用 Core 和插件提供的能力校验 `metadata.requires` 中声明的 Service Capability 需求。
- 将 `metadata.dependsOn` 解析为确定性的生命周期顺序。
- 对缺失插件依赖和依赖环报 fatal Core bootstrap error。
- 按依赖顺序执行 `runtime.onInit` 和 `runtime.onReady`。
- 在 `dispose()` 中按成功启动生命周期的逆序执行 `runtime.onDestroy`。
- 保持 bootstrap validation failure 为 fatal，并防止部分初始化的 editor 进入 running 状态。

## 架构边界检查

- Core 保持微内核 bootstrap 与 lifecycle coordinator 职责，符合 `docs/adr/001-microkernel-architecture.md`。
- Manifest 仍是插件身份、能力和生命周期钩子的声明式权威入口，符合 `docs/adr/002-declarative-manifest-merging.md`。
- `manifestVersion`、`metadata.provides`、`metadata.requires`、`metadata.dependsOn` 遵循 `docs/adr/005-manifest-capabilities-versioning.md`。
- Manifest 分层和 Service Capability 术语遵循 `docs/adr/006-layered-manifest-permission-model.md`。
- 本 change 中 Core 不依赖 React、ProseMirror、Remark、GFM 或浏览器 UI API。
- 本 change 中 Core 不实现 Command Bus、Event Hub、Adapter 创建、Markdown 解析或渲染。

## Public Contract 影响

本 change 建立现有设计阶段 public contracts 的第一个实现，不应发明新的 public SDK 概念。

实现可以引入表示以下内容所需的最小 exported types 和 functions：

- `ExtensionManifest`
- `ManifestMetadata`
- `RuntimeManifest`
- `ExtensionPlugin`
- `CapabilityId`
- `PluginName`
- `SUPPORTED_MANIFEST_VERSIONS`
- `CoreError` 或等价的 documented fatal bootstrap error shape

如果实现需要超出现有 docs 的新 public API，应暂停编码并先更新 OpenSpec change。

## Service Capability 边界

`docs/sdk/capabilities-and-permissions.md` 中定义的 `CORE_SERVICE_REGISTRY` 包含 `core:engine` 和 `core:parser` 等 Adapter 支撑的能力。

由于 Adapter 不在 M1 范围内，实现必须显式定义并测试 M1 Core-provided capability set。除非某个能力已经由 M1 bootstrap contract 表示，否则实现不得 silent claim 该 Adapter-backed capability 已可用。

如果实现时发现这里存在歧义，应记录为 open question 或 deviation，而不是扩大到 Adapter 范围。

## 生命周期语义

生命周期顺序受 `docs/sdk/lifecycle.md` 约束：

- load 和 validate manifests 是纯数据操作；
- runtime hooks 之前解析 Service Capability 和 `dependsOn` 依赖；
- 按依赖顺序运行 `onInit`；
- 成功完成 `onInit` 后，按依赖顺序运行 `onReady`；
- dispose 时按成功生命周期逆序运行 `onDestroy`。

M1 应在 implementation planning 阶段明确 hook failure 行为。fatal startup errors 应中止启动。partial startup 之后的 cleanup 行为应在 implementation tasks 和 tests 中显式处理。

## 文档语言约定

本 change 及其后续 workflow 产物的说明性文档应使用中文，便于维护者审查并与现有项目工作流文档保持一致。

以下内容应保持英文原文：

- 代码标识、类型名、函数名、包名和文件路径。
- OpenSpec 结构关键词，例如 `ADDED Requirements`、`Requirement:`、`Scenario:`。
- RFC 关键词或测试关键词，例如 `MUST`、`SHALL`、`GIVEN`、`WHEN`、`THEN`，如果工具或规范格式依赖它们。

## 测试策略

测试应遵循 `docs/engineering/test-strategy.md`，聚焦 contract behavior：

- 不支持的 `manifestVersion` 中止启动；
- 缺失 `metadata.requires` Service Capability 中止启动；
- 插件 `metadata.dependsOn` 决定生命周期顺序；
- 依赖环中止启动；
- 缺失 dependency name 中止启动；
- `dispose()` 逆序调用 `onDestroy`；
- M1 package exports 匹配最小 public contract。

测试不得要求 Adapter、DOM、React、ProseMirror、Remark 或 GFM preset packages。

## Open Questions

- 在 Adapter packages 存在前，M1 应暴露哪些 Core-provided Service Capability？
- 重复的 `metadata.provides` 值应在 M1 中 fatal，还是留到后续默认 ConflictResolver 里处理？
- `dispose()` 是否应在 M1 Core Bootstrap 中要求幂等，还是推迟到后续 lifecycle hardening task？
