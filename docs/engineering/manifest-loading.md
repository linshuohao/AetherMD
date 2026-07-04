# Manifest 加载实现要点

> 状态：设计草案 + M1 Core Bootstrap。本页作为对应主题的维护入口。

## Manifest 加载实现要点

### Manifest 规范化

```typescript
function normalizeManifest(raw: unknown): ExtensionManifest {
  if (isLayeredManifest(raw)) return raw;
  throw new CoreError({ code: 'MANIFEST_INVALID', severity: 'fatal', ... });
}
```

M1 Core Bootstrap 已实现 `ExtensionPlugin.manifest` 的最小 shape validation 和 `metadata.manifestVersion` 校验。当前实现不会把 legacy 或 shorthand Manifest 转换成完整 Manifest；无效 shape 会以 fatal `CoreError` 中止启动。

### CapabilityId 规范化

```typescript
/** 将能力声明规范化为命名空间 ID */
function normalizeCapabilityIds(ids?: string[]): CapabilityId[] | undefined {
  return ids?.map((id) => {
    if (id.includes(':')) return id as CapabilityId;
    if (CORE_ALIASES[id]) return CORE_ALIASES[id];  // 'selection' → 'core:selection'
    return `plugin:${id}` as PluginCapabilityId;
  });
}
```

Capability alias normalization 是后续策略，M1 暂不实现。M1 要求 `metadata.provides` 和 `metadata.requires` 已经使用完整 `CapabilityId` 字符串，例如 `core:selection` 或 `plugin:table`。

---
