# 版本兼容策略

> 状态：M3 Adapter 基座已开始。本页作为版本兼容与 public export 变更的维护入口。

## 版本兼容策略

* **SemVer**：`@aether-md/core` Major 仅用于架构颠覆；Minor 保证插件向下兼容。
* **Manifest 独立演进**：`manifestVersion` 可独立于 Core SemVer；Core **MUST** 声明 `supportedManifestVersions`（当前：`[1]`，M3 不变更）。
* **适配器独立 SemVer**：`@aether-md/plugin-prosemirror` 等可独立 Major 升级。
* **Deprecation**：废弃 API **SHOULD** 存活至少两个 Minor 版本。

## M3 public export 变更（相对 M2）

| Package | 变更类型 | 说明 |
| --- | --- | --- |
| `@aether-md/core` | additive (minor-level) | 新增 `AetherDoc`、`AetherSchema`、Adapter 协议 types、`AdapterError`、`SerializationError` export |
| `@aether-md/plugin-remark` | new package (`0.0.0`) | `createRemarkParserAdapter`、`createRemarkSerializerAdapter` |
| `@aether-md/plugin-prosemirror` | new package (`0.0.0`) | `createProseMirrorEngineAdapter` |
| `manifestVersion` | unchanged | `[1]` |
| M2 Command/Event API | unchanged | 语义与 export 面不变 |

M3 **不**引入 breaking change 到 M1 bootstrap 或 M2 Command/Event 行为。`createEditor`、`AetherEditor`、宿主 `getMarkdown()` / `getDocument()` 仍未 export。

OpenSpec main specs：`openspec/specs/document-model/spec.md`、`openspec/specs/adapter-base/spec.md`；`openspec/specs/core-bootstrap/spec.md` package boundary MODIFIED。

```typescript
// @aether-md/core 导出
export const SUPPORTED_MANIFEST_VERSIONS = [1] as const;
export type SupportedManifestVersion = typeof SUPPORTED_MANIFEST_VERSIONS[number];
```

## Workflow Version-management Hooks

AI-native workflow steps must classify version impact whenever they touch versioned contracts:

- Package metadata or lockfiles.
- Public package exports or public SDK/Core API types.
- `SUPPORTED_MANIFEST_VERSIONS` or `metadata.manifestVersion`.
- Compatibility policy, SDK docs, ADRs, or OpenSpec main specs.

If a change affects a versioned public contract, the OpenSpec change, validation record, compliance review, docs/spec sync, and final report must say whether it is breaking, additive, internal-only, or deferred.

---
