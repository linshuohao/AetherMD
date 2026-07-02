# Manifest 加载实现要点

> 状态：设计草案。实现开始前，本页作为对应主题的维护入口。

## Manifest 加载实现要点

### Manifest 规范化

```typescript
function normalizeManifest(raw: unknown): ExtensionManifest {
  if (isLayeredManifest(raw)) return raw;
  throw new CoreError({ code: 'MANIFEST_INVALID', severity: 'fatal', ... });
}
```

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

---
