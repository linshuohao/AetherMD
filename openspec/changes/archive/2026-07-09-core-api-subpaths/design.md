# Design: Core API subpath exports

## Implementation contract

### Subpath map

| Subpath                    | Audience                    | Key exports                                                                                                                                     |
| -------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `@aether-md/core`          | Host / Shell                | `createEditor`, `AetherEditor`, `EditorConfig`, minimal Command/Event observe types, `ExtensionPlugin`, `AetherDoc`, `CoreError`, `RenderError` |
| `@aether-md/core/plugin`   | Plugin authors              | Manifest types, capability/permission types, full Command/Event types, `CommandEventRuntime` type, `PluginError`                                |
| `@aether-md/core/adapter`  | Adapter implementers        | Adapter protocol types, `AdapterError`, `SerializationError`, engine command ids, block-id helpers                                              |
| `@aether-md/core/document` | Plugin / Adapter / Morphing | `AetherDoc`, block/inline types, `AetherSchema`                                                                                                 |
| `@aether-md/core/testing`  | Dev / contract tests        | `bootstrapCore`, `createCommandEventRuntime`                                                                                                    |

### Internal (not exported)

- `createHistoryService`, `createSelectionService`, `createClipboardService`, `createDocumentHistory`
- `createNoopTelemetryService`, `createNoopTelemetrySpan`
- `resolvePluginDependencyOrder` (bootstrap internal)
- `AetherEditorImpl`, `EditorContext` class

### Source files

- `packages/core/src/host.ts`
- `packages/core/src/plugin.ts`
- `packages/core/src/adapter.ts`
- `packages/core/src/document.ts`
- `packages/core/src/testing.ts`
- `packages/core/src/index.ts` → re-export `./host.js` only

### Test strategy

- Replace flat deny-list boundary test with per-subpath whitelist tests.
- Update `test-d/public-exports.test-d.ts` for host-only root.
- Migrate all monorepo `@aether-md/core` imports to role-appropriate subpaths.

## Architecture boundary check

Dependency direction unchanged: Shell → Core host → plugins → adapters. Subpaths encode audience, not new runtime layers.
