# Manifest 分层契约

> 状态：设计草案 + M1 Core Bootstrap。本页作为对应主题的维护入口。

## Manifest 分层契约

初始设计中，`ExtensionManifest` 采用四层结构，避免根对象无限膨胀：

```
ExtensionManifest
├── metadata      # 身份、版本、服务依赖
├── compile       # 编译时静态合并（schema / commands / keymaps）
├── runtime       # 运行时渲染与生命周期
└── security      # 运行时权限申请
```

### 完整类型定义

```typescript
import type { CapabilityId, PermissionId, PluginName } from "@aether-md/core";

/** 根契约：四层分离 */
export interface ExtensionManifest {
  metadata: ManifestMetadata;
  compile?: CompileManifest;
  runtime?: RuntimeManifest;
  security?: SecurityManifest;
}

// ─────────────────────────────────────────────
// Layer 1: metadata — 身份与服务依赖
// ─────────────────────────────────────────────
export interface ManifestMetadata {
  /** 契约版本；须在 Core.supportedManifestVersions 内 */
  manifestVersion: SupportedManifestVersion;
  /** 插件唯一标识（kebab-case） */
  name: PluginName;
  /** 插件自身 SemVer（可选，用于遥测与调试） */
  version?: string;

  /** 本插件对外提供的服务能力 */
  provides?: CapabilityId[];
  /** 本插件运行所依赖的服务能力（启动时校验） */
  requires?: CapabilityId[];
  /** 硬依赖插件名（影响 onInit 拓扑排序） */
  dependsOn?: PluginName[];
}

// ─────────────────────────────────────────────
// Layer 2: compile — 编译时静态合并
// ─────────────────────────────────────────────
export interface CompileManifest {
  schema?: SchemaDeclaration | SchemaDeclaration[];
  keymaps?: Record<string, string>;
  inputRules?: InputRuleDeclaration[];
  pasteRules?: PasteRuleDeclaration[];
  commands?: Record<string, CommandHandler>;
}

// ─────────────────────────────────────────────
// Layer 3: runtime — 运行时渲染与生命周期
// ─────────────────────────────────────────────
export interface RuntimeManifest {
  onInit?(ctx: EditorContext): void | Promise<void>;
  onReady?(ctx: EditorContext): void;
  onDestroy?(ctx: EditorContext): void;
}

// ─────────────────────────────────────────────
// Layer 4: security — 运行时权限
// ─────────────────────────────────────────────
export interface SecurityManifest {
  /** 本插件需要宿主授予的运行时权限 */
  requests?: PermissionId[];
}
```

### Manifest 版本

```typescript
/** Core 导出 — 内核当前支持的 Manifest 版本列表 */
export const SUPPORTED_MANIFEST_VERSIONS = [1] as const;
export type SupportedManifestVersion = (typeof SUPPORTED_MANIFEST_VERSIONS)[number];

/** 校验逻辑（RECOMMENDED） */
function validateManifestVersion(version: number): void {
  if (!SUPPORTED_MANIFEST_VERSIONS.includes(version as SupportedManifestVersion)) {
    throw new CoreError({
      code: "MANIFEST_VERSION_UNSUPPORTED",
      message: `manifestVersion ${version} not in [${SUPPORTED_MANIFEST_VERSIONS.join(", ")}]`,
    });
  }
}
```

| manifestVersion | 状态       | 说明                               |
| --------------- | ---------- | ---------------------------------- |
| `1`             | **Stable** | 分层 Manifest；类型化 CapabilityId |
| `2`             | _Reserved_ | 预留给 schema 结构重组             |

## M1 Core Bootstrap implementation

`@aether-md/core` 当前已实现 M1 所需的最小 Manifest 行为：

- 读取 `ExtensionPlugin.manifest`。
- 校验 `manifest.metadata`、`metadata.name`、`metadata.manifestVersion`、`metadata.provides`、`metadata.requires`、`metadata.dependsOn` 和 `security.requests` 的基本 shape。
- 在 lifecycle hooks 运行前拒绝 duplicate `metadata.name`（fatal `CoreError`，code `PLUGIN_NAME_DUPLICATE`）。
- 使用 `SUPPORTED_MANIFEST_VERSIONS = [1] as const` 拒绝不支持的 Manifest version。
- 在 lifecycle hooks 运行前以 fatal `CoreError` 拒绝 invalid Manifest。

M1 不实现 compile layer merge、Schema 合并、Command handler 注册、Runtime Permission 授权执行或 Adapter 创建。

## Block morphing renderer registration

Block-level DOM morphing renderers (`CustomBlockRenderer`) are **not** declared on `manifest.runtime`. Presets and plugins register them at runtime on the wired plugin object:

- `plugin.morphingStrategies` — ordered `MorphingBlockStrategy` list (each strategy may expose an `interactiveRenderer`)
- `plugin.morphingRegistry` — `MorphingStrategyRegistry` accessor resolved by editor bootstrap (`adapter-wiring.resolveMorphingRegistry`)

For GFM, `createGfmPreset()` supplies both fields; `gfmManifest` carries metadata only. Shell packages resolve renderers through `editor.getMorphingStrategy(blockType)` after preset wiring. See [custom-block-renderer](./custom-block-renderer.md) and `@aether-md/morphing-contracts`.

---
