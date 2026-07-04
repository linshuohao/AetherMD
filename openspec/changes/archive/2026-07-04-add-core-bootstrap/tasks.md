# add-core-bootstrap Tasks

## 1. 包边界

- [x] 定义 M1 所需的最小 `packages/core` 包结构。
- [x] 只添加 Manifest、Capability、plugin、lifecycle、supported Manifest versions 和 bootstrap errors 所需的 public exports。
- [x] 避免添加 Command Bus、Event Hub、Adapter、Shell、Remark、ProseMirror 或 GFM 实现文件。

## 2. Manifest 加载与版本校验

- [x] 实现分层 Manifest shape validation。
- [x] 导出 `SUPPORTED_MANIFEST_VERSIONS = [1] as const`。
- [x] 对不支持的 `metadata.manifestVersion` 返回 fatal Core bootstrap error。

## 3. Service Capability 校验

- [x] 显式定义 M1 Core-provided Service Capability set。
- [x] 收集 plugin `metadata.provides` values。
- [x] 在 lifecycle hooks 运行前校验所有 plugin `metadata.requires` values。
- [x] 对缺失 Service Capabilities 返回 fatal Core bootstrap error。

## 4. Plugin Dependency 排序

- [x] 使用确定性的 topological ordering 解析 `metadata.dependsOn`。
- [x] 拒绝缺失的 plugin dependencies。
- [x] 拒绝 dependency cycles。

## 5. Lifecycle Startup 与 Dispose

- [x] 按 resolved dependency order 运行 `runtime.onInit`。
- [x] successful `onInit` 后，按 resolved dependency order 运行 `runtime.onReady`。
- [x] 记录 successfully initialized plugins 以支持 teardown。
- [x] 在 `dispose()` 中按 reverse successful lifecycle order 运行 `runtime.onDestroy`。

## 6. 验证

- [x] 添加 supported 和 unsupported Manifest versions 的 unit 或 contract tests。
- [x] 添加 missing Service Capabilities tests。
- [x] 添加 `dependsOn` ordering、missing dependencies 和 cycles tests。
- [x] 添加 lifecycle startup order tests。
- [x] 添加 reverse `dispose()` order tests。
- [x] 确认 M1 tests 不依赖 Command Bus、Event Hub、Adapter、React、Remark、ProseMirror 或 GFM preset packages。

## 7. 文档语言

- [x] 后续 Superpowers plan 使用中文说明性正文。
- [x] 后续 Superpowers task、validation、review 和 archive 产物使用中文说明性正文。
- [x] 代码标识、API 名称、包名、文件路径和 OpenSpec 结构关键词保持英文。

## 8. Workflow Follow-up

- [x] 基于本 OpenSpec change 生成 Superpowers implementation plan。
- [x] 编辑 source code 前，将 plan 拆成小 implementation tasks。
- [x] compliance review 前记录 validation results。
