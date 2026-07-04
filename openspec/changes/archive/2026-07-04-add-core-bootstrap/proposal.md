# add-core-bootstrap Proposal

## 背景

AetherMD 已准备进入 `docs/engineering/mvp-implementation-plan.md` 中定义的 MVP M1 Core Bootstrap。本 change 在引入代码前，为第一个 `@aether-md/core` 实现切片创建 OpenSpec 实现合同。

目标是让初始 Core 包保持小、可审查、可追踪，并严格对应现有架构与 SDK 文档。M1 只验证插件启动路径，不提前引入 Command Bus、Event Hub、Adapter、React、ProseMirror、Remark 或 GFM preset 等后续里程碑内容。

## 变更内容

- 定义 `@aether-md/core` 的最小实现范围。
- 要求 Manifest 加载与 `SUPPORTED_MANIFEST_VERSIONS` 校验。
- 要求基于 `metadata.provides` 和 `metadata.requires` 的 Service Capability 校验。
- 要求基于 `metadata.dependsOn` 的插件生命周期拓扑顺序。
- 要求生命周期执行顺序为 `load -> onInit -> onReady -> dispose -> onDestroy`。
- 定义无效 Manifest、不支持的 Manifest 版本、缺失 Service Capability、无效插件依赖图的 fatal 启动失败行为。
- 定义 M1 bootstrap 行为的高层验证预期。
- 要求本 change 生成的 OpenSpec 与 Superpowers 工作流文档使用中文，代码标识、API 名称、包名和路径保持英文。

## 非目标

- 不实现 Command Bus 或 Event Hub。
- 不实现 Adapter 创建、ProseMirror、Remark、Markdown 解析或 Markdown 序列化。
- 不实现 React Shell、Vue Shell 或任何 UI 包。
- 不实现 GFM preset 或官方语法插件。
- 不实现 Worker Thread、插件热插拔、Telemetry 后端或权限沙盒执行。
- 不引入超出 M1 最小包表面的实施脚手架。
- 不修改长期 SDK 契约文档，除非实现前发现明确不一致，并在后续 workflow step 中处理。

## Source Docs

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/core-api.md`
- `docs/architecture/compatibility.md`
- `docs/architecture/package-layout.md`
- `docs/sdk/manifest.md`
- `docs/sdk/capabilities-and-permissions.md`
- `docs/sdk/lifecycle.md`
- `docs/engineering/manifest-loading.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/error-model.md`
- `docs/glossary.md`

已接受 ADR：

- `docs/adr/001-microkernel-architecture.md`
- `docs/adr/002-declarative-manifest-merging.md`
- `docs/adr/005-manifest-capabilities-versioning.md`
- `docs/adr/006-layered-manifest-permission-model.md`

## 受影响契约

- Core 包边界：`@aether-md/core` / `packages/core`
- M1 所需 Core public exports，包括 Manifest 相关类型和受支持 Manifest 版本。
- `ExtensionManifest` 校验语义。
- Service Capability 校验语义。
- 插件生命周期排序与销毁语义。
- fatal bootstrap error 行为。
- workflow 文档语言约定：本 change 的 OpenSpec、Plan、Task、Validation、Review 等说明性文档使用中文。

由于当前尚无实现，本 change 不构成对既有实现的 breaking change。但它会建立文档中 public contracts 的第一个可执行基线。

## 风险

- 如果过早引入 Command/Event、Adapter 或 Shell 关注点，M1 可能膨胀到后续里程碑范围。
- `docs/sdk/capabilities-and-permissions.md` 中的 `CORE_SERVICE_REGISTRY` 包含 `core:engine` 和 `core:parser` 等 Adapter 相关能力；本 change 不实现 Adapter，后续实现必须避免假装这些能力已经可用。
- 生命周期顺序必须足够确定，才能支撑测试和未来插件作者预期。
- 错误码未来可能需要细化；M1 应保持 fatal bootstrap errors 明确，但不要过度设计完整错误分类。
- 如果后续产物混用中英文说明，可能降低 review 可读性；因此本 change 将中文文档要求写入 delta spec。

## 验收标准

- `openspec/changes/add-core-bootstrap/` 下存在 proposal、design、delta spec 和 high-level tasks。
- delta spec 只覆盖 M1 Core Bootstrap 行为。
- 范围明确排除 Command Bus、Event Hub、Adapter、React、Remark、ProseMirror 和 GFM preset 实现。
- requirements 可在后续 implementation task 中通过 unit 或 contract tests 验证。
- 所有 requirements 引用既有 Docs 作为长期事实来源，不复制大段文档。
- 本 change 及其后续 workflow 产物的说明性文档使用中文，代码标识、API 名称、包名和路径保持英文。
