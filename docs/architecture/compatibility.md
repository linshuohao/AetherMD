# 版本兼容策略

> 状态：设计草案。实现开始前，本页作为对应主题的维护入口。

## 版本兼容策略

* **SemVer**：`@aether-md/core` Major 仅用于架构颠覆；Minor 保证插件向下兼容。
* **Manifest 独立演进**：`manifestVersion` 可独立于 Core SemVer；Core **MUST** 声明 `supportedManifestVersions`（当前：`[1]`）。
* **适配器独立 SemVer**：`@aether-md/plugin-prosemirror` 等可独立 Major 升级。
* **Deprecation**：废弃 API **SHOULD** 存活至少两个 Minor 版本。

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
