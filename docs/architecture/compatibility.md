# 版本兼容策略

## 版本兼容策略

- **SemVer**：`@aether-md/core` Major 仅用于架构颠覆；Minor 保证插件向下兼容。
- **Manifest 独立演进**：`manifestVersion` 可独立于 Core SemVer；Core **MUST** 声明 `supportedManifestVersions`（当前：`[1]`）。
- **适配器独立 SemVer**：`@aether-md/plugin-prosemirror` 等可独立 Major 升级。
- **Deprecation**：废弃 API **SHOULD** 存活至少两个 Minor 版本。

## Adapter 基座 public export 变更

| Package                         | 变更类型               | 说明                                                                                              |
| ------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------- |
| `@aether-md/core`               | additive (minor-level) | 新增 `AetherDoc`、`AetherSchema`、Adapter 协议 types、`AdapterError`、`SerializationError` export |
| `@aether-md/plugin-remark`      | new package (`0.0.0`)  | `createRemarkParserAdapter`、`createRemarkSerializerAdapter`                                      |
| `@aether-md/plugin-prosemirror` | new package (`0.0.0`)  | `createProseMirrorEngineAdapter`                                                                  |
| `manifestVersion`               | unchanged              | `[1]`                                                                                             |
| Command/Event API               | unchanged              | 语义与 export 面不变                                                                              |

**不**引入 breaking change 到 bootstrap 或 Command/Event 行为。`createEditor`、`AetherEditor`、宿主 `getMarkdown()` / `getDocument()` 仍未 export。

OpenSpec main specs：`openspec/specs/document-model/spec.md`、`openspec/specs/adapter-base/spec.md`；`openspec/specs/core-bootstrap/spec.md` package boundary MODIFIED。

## GFM Preset public export 变更

| Package                         | 变更类型               | 说明                                                                                          |
| ------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| `@aether-md/core`               | unchanged (production) | 生产 export 面不变；新增 GFM 相关测试与 package-boundary guard                                |
| `@aether-md/plugin-remark`      | minor extension        | GFM parse/serialize（`remark-gfm`）；`SerializationError` 占位符 `[unsupported:block:<name>]` |
| `@aether-md/plugin-prosemirror` | minor extension        | GFM schema/conversion；edit leg 后保留 list、link、mark 结构                                  |
| `@aether-md/preset-gfm`         | new package (`0.0.0`)  | `createGfmPreset()`、`metadata.name: gfm` Manifest；六语法 round-trip 集成测试                |
| `manifestVersion`               | unchanged              | `[1]`                                                                                         |
| bootstrap / Command/Event API   | unchanged              | 语义与 export 面不变                                                                          |

**不**引入 breaking change 到 bootstrap 或 Command/Event 行为。`@aether-md/core` **MUST NOT** re-export GFM preset 工厂或 adapter 实现。`createEditor`、`AetherEditor`、宿主 `getMarkdown()` / `getDocument()` 仍未 export。

OpenSpec main specs：`openspec/specs/gfm-preset/spec.md` ADDED；`openspec/specs/document-model/spec.md`、`openspec/specs/adapter-base/spec.md`、`openspec/specs/core-bootstrap/spec.md` MODIFIED。

## Editor Orchestration public export 变更

| Package                                                      | 变更类型               | 说明                                                                                                                                                                           |
| ------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@aether-md/core`                                            | additive (minor-level) | 新增 `createEditor`、`AetherEditor`、`EditorConfig`、`EditorSecurityConfig`、`EditorStateSnapshot` export；宿主 `getMarkdown()` / `getDocument()`、`dispatch`、`on`、`dispose` |
| `@aether-md/preset-gfm`                                      | unchanged              | 工厂与 Manifest 不变；headless integration 经 `createEditor` 验证                                                                                                              |
| `@aether-md/plugin-remark` / `@aether-md/plugin-prosemirror` | unchanged (production) | 生产 export 面不变；由显式 wiring 接入 `createEditor`                                                                                                                          |
| `manifestVersion`                                            | unchanged              | `[1]`                                                                                                                                                                          |
| bootstrap / Command/Event API                                | unchanged              | 语义与 export 面不变                                                                                                                                                           |

**不**引入 breaking change 到既有 Core / preset / adapter 行为。Core **MUST NOT** re-export GFM preset 或 adapter 实现；**不**通过 `bootstrapCore` silent provide Adapter。React Shell **未** export。

OpenSpec main specs：`openspec/specs/editor-orchestration/spec.md` ADDED；`openspec/specs/command-event-runtime/spec.md`、`openspec/specs/adapter-base/spec.md`、`openspec/specs/core-bootstrap/spec.md` MODIFIED。

## React Shell public export 变更

| Package                                              | 变更类型               | 说明                                                                                                                                                 |
| ---------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@aether-md/react`                                   | new package (`0.0.0`)  | `AetherEditorRoot`、`AetherEditorContent`、`useAetherEditor`；`peerDependencies`: `react`；依赖 `@aether-md/core` 与 `@aether-md/plugin-prosemirror` |
| `@aether-md/plugin-prosemirror`                      | additive (minor-level) | 新增 `createProseMirrorView`、`refreshProseMirrorViewFromSession` 及 view-bridge types；`prosemirror-view` 依赖隔离在本 package                      |
| `@aether-md/core`                                    | unchanged (production) | 生产 export 面不变；**无** React / DOM export                                                                                                        |
| `@aether-md/preset-gfm` / `@aether-md/plugin-remark` | unchanged              | export 面不变                                                                                                                                        |
| `manifestVersion`                                    | unchanged              | `[1]`                                                                                                                                                |

**不**引入 breaking change 到 Core / preset / remark 行为。`@aether-md/react` **MUST NOT** 直接依赖 `prosemirror-view`；Shell 直接消费 `AetherEditor`（无 Shell Adapter）。

OpenSpec main specs：`openspec/specs/react-shell/spec.md` ADDED；`openspec/specs/editor-orchestration/spec.md` MODIFIED。

```typescript
// @aether-md/core 导出
export const SUPPORTED_MANIFEST_VERSIONS = [1] as const;
export type SupportedManifestVersion = (typeof SUPPORTED_MANIFEST_VERSIONS)[number];
```

## Core API subpath export 变更

| Package                    | 变更类型                | 说明                                                                                                                                            |
| -------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `@aether-md/core`          | breaking (pre-1.0)      | 默认入口收窄为宿主面（`createEditor`、`AetherEditor`、最小 Command/Event 观察类型、`ExtensionPlugin`、`AetherDoc`、`CoreError`、`RenderError`） |
| `@aether-md/core/plugin`   | additive                | Manifest、Capability、Permission、Command/Event 契约                                                                                            |
| `@aether-md/core/adapter`  | additive                | Adapter 协议、序列化错误、block-id 工具                                                                                                         |
| `@aether-md/core/document` | additive                | `AetherDoc` 与块/行内类型                                                                                                                       |
| `@aether-md/core/testing`  | additive                | `bootstrapCore`、`createCommandEventRuntime`（仅 dev）                                                                                          |
| monorepo 消费者            | breaking (import paths) | 插件/Adapter 包改从 role subpath 导入                                                                                                           |

**不**改变 `createEditor` 运行时语义。`bootstrapCore` 与 `createCommandEventRuntime` **不再**从默认入口导出；service factory 与 telemetry noop helper **不再**公开。

OpenSpec main specs：`openspec/specs/core-bootstrap/spec.md` MODIFIED。

## Workflow Version-management Hooks

AI-native workflow steps must classify version impact whenever they touch versioned contracts:

- Package metadata or lockfiles.
- Public package exports or public SDK/Core API types.
- `SUPPORTED_MANIFEST_VERSIONS` or `metadata.manifestVersion`.
- Compatibility policy, SDK docs, ADRs, or OpenSpec main specs.

If a change affects a versioned public contract, the OpenSpec change, validation record, compliance review, docs/spec sync, and final report must say whether it is breaking, additive, internal-only, or deferred.

---
