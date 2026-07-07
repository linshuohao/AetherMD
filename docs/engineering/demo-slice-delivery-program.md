# 示例与集成验证

> 本页描述 workspace examples 的集成证明职责与 CI 门禁。示例矩阵见 [Examples Matrix](../examples/matrix.md)。

## 集成证明职责

| 示例                           | 证明目标                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `examples/headless-gfm`        | Node headless 路径：`createEditor` + `createGfmPreset()` + 显式 adapter wiring |
| `examples/react` content 模式  | React Shell + GFM + GateLock + 连续编辑 + probes 同步                          |
| `examples/react` morphing 模式 | Instant Morphing + Block Focus + GFM inline marks + 多块切换 + 列表/链接块     |
| `examples/vue` morphing 模式   | Vue Shell 与 morphing 产品面对齐                                               |

共享 GFM 插件 wiring：`@aether-md/example-shared`（`createGfmEditorPlugins()`）。

## CI 门禁

| 门禁                | 范围                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------- |
| G6 `typecheck`      | 三个 example 纳入根 `pnpm check`                                                      |
| G11 manifest 一致性 | `SUPPORTED_MANIFEST_VERSIONS` ↔ `docs/sdk/manifest.md`、官方包 `manifestVersion` 扫描 |
| 启动中止回归        | duplicate `metadata.name`、`manifestVersion` unsupported                              |
| Playwright E2E      | `examples/react`（content + morphing）；`examples/vue`（morphing）                    |
| Consumer smoke      | 六个可发布 `@aether-md/*` 包                                                          |

详见 [测试策略](test-strategy.md) 与 [CI 校验计划](../architecture/ci-checklist.md)。
