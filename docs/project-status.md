# 能力概览

AetherMD 是交互驱动、框架无关、高度插件化的现代富文本 Markdown 引擎。本文档汇总当前已交付能力与 v1.0 目标差距。

## 产品目标

交付**最小可运行编辑器**：微内核调度、声明式插件契约、GFM 预设、框架外壳，以及 [Instant Morphing / Block Focus](architecture/product-experience-spec.md) 产品交互体验。公开发布策略见 [ADR 009](adr/009-release-governance.md)。

## 已交付能力

### 微内核与插件运行时（`@aether-md/core`）

| 能力域 | 交付内容 |
| ------ | -------- |
| **Core Bootstrap** | Manifest version/shape 校验、duplicate `metadata.name` 拒绝、Service Capability 校验、`metadata.dependsOn` 生命周期排序、`onInit` / `onReady` 启动、启动失败反向清理、幂等 `dispose()` |
| **Command/Event Runtime** | `createCommandEventRuntime`、同步 `register` / `dispatch`、`CommandResult`、Event Hub `on` / `emit` / unsubscribe、handler 错误隔离为 `PluginError` |
| **文档模型** | `AetherDoc`、`AetherSchema`、三类 Adapter 协议类型、`AdapterError` / `SerializationError` |
| **Editor Orchestration** | async-only `createEditor(config): Promise<AetherEditor>`；宿主 API（`dispatch`、`on`、`getMarkdown`、`getDocument`、`dispose`）；显式 Adapter wiring；最小编排 rollback（`core:replaceText`）；`ready` / `change` / `transactionFailed` / `disposed` 事件 |

### 适配器与预设

| 包 | 交付内容 |
| -- | -------- |
| `@aether-md/plugin-remark` | `ParserAdapter` / `SerializerAdapter`；GFM parse/serialize（`remark-gfm`）；`CustomBlock` 占位符 `[unsupported:block:<name>]`；不支持节点 `SerializationError` 拒绝 |
| `@aether-md/plugin-prosemirror` | `EngineAdapter`；GFM schema/conversion；`createProseMirrorView` view-bridge；edit leg 后保留 list、link、mark 结构 |
| `@aether-md/preset-gfm` | `createGfmPreset()` 工厂、`metadata.name: gfm`；六语法 GFM round-trip（paragraph、heading、strong、emphasis、list、link） |

### 框架外壳

| 包 | 交付内容 |
| -- | -------- |
| `@aether-md/react` | `AetherEditorRoot` / `AetherEditorContent` / `useAetherEditor`；GateLock 单向数据闸门；GFM React 集成测试 |
| `@aether-md/vue` | Vue Shell 与 Instant Morphing 产品面（`AetherMorphingDocument`） |

### 产品交互

| 体验 | 载体 | 证明 |
| ---- | ---- | ---- |
| **架构集成管线** | `examples/react` content 模式 | React Shell + GFM + GateLock + 连续编辑 + probes 同步 |
| **Instant Morphing + Block Focus** | `examples/react` / `examples/vue` morphing 模式 | 单/多块 rendered ↔ source morphing；GFM inline marks 保真；列表与链接块插件化 |

权威交互规格见 [产品交互体验规范](architecture/product-experience-spec.md)。

### 验证与发布就绪

- **集成示例**：`examples/headless-gfm`（Node headless）、`examples/react`、`examples/vue` — 见 [Examples Matrix](examples/matrix.md)
- **CI 门禁**：G11 manifest 文档一致性、G6 example `typecheck`、启动中止回归、consumer smoke
- **规格同步**：`openspec/specs/` 下 core-bootstrap、command-event-runtime、document-model、adapter-base、gfm-preset、editor-orchestration、react-shell、validation-suite、engineering-workflow
- **发布预备**：五包 MIT `license` / `repository` / `files` / `publishConfig`；Changesets `linked` 配置；根 `changeset:publish` 脚本

## v1.0 能力差距

对照 [v1.0 能力范围](architecture/roadmap.md)「必须实现」与当前基线：

| 能力项 | 当前状态 | 说明 |
| ------ | -------- | ---- |
| **compile-layer schema merge** | 未实现 | 默认 ConflictResolver schema abort 单元测试与 `createEditor` fatal startup 回归已覆盖最小路径 |
| **ConflictResolver 完整集成** | 部分 | 默认策略单元可测；`createEditor` 编排层未接入完整 command / keymap / capability 冲突解析 |
| **History / Selection / Clipboard** | 部分 | History undo/redo、Selection、Clipboard 基础实现已落地；完整 Guard 链待接入 |
| **PermissionGuard 沙盒** | 未实现 | 未授权 Runtime Permission 拦截未 enforce |
| **Worker Thread** | 未实现 | Parser / Serializer Worker 化预留契约，见 [线程模型](engineering/thread-model.md) |
| **Command Bus 完整 Pipeline** | 部分 | ReadOnlyGuard、CapabilityGuard 等完整 Guard 链未接入 |
| **`bootstrapCore` Adapter 加载** | 未实现 | 无 `core:engine` / `core:parser` silent provide |
| **分层 Manifest 合并** | 部分 | `metadata` 层校验已有；`compile` / `runtime` / `security` 分层合并未完整 |
| **npm publish** | 待发布 | Release CI 就绪；完整 v1.0 能力落地后 `1.0.0` publish，见 [发布流程](community/release-process.md) |

## 治理决策（ADR 009）

| 决策 | 结论 |
| ---- | ---- |
| 许可证 | MIT |
| Changelog | 首次 `latest` 发布前选定 Changesets changelog 策略 |
| Plugin SDK | 不独立 npm 包；类型入口为 `@aether-md/core` |
| 首发版本号 / Canary dist-tag | `0.1.0` / `canary` |
| Examples 形态 | headless-gfm + react + vue，不发布 npm |

## 贡献建议

优先提交能减少歧义并保护已实现边界的修改：澄清契约语言、暴露隐藏假设、为未决取舍新增 ADR、明确标出开放问题。
