# harden-core-bootstrap-lifecycle Design

## Context

M1 `@aether-md/core` 已通过 `add-core-bootstrap` 建立最小 bootstrap runtime。当前实现存在三处与长期 Docs / follow-up 清单不一致的行为：

1. **`dependencies.ts`** 使用 `Map<PluginName, LoadedPlugin>` 构建依赖图，duplicate `metadata.name` 会 silent last-wins 覆盖，与 `docs/sdk/manifest.md` 中「插件唯一标识」冲突。
2. **`lifecycle.ts`** 在 `onInit` / `onReady` 失败时直接 throw fatal `CoreError`，不对已成功 `onInit` 的插件调用 `onDestroy`，可能遗留 side effects。
3. **`bootstrap.ts`** 已实现 `disposed` flag 使重复 `dispose()` 为 no-op，main spec 亦有对应 scenario，但 `docs/architecture/core-api.md` 刻意写明该幂等行为 **不** 定义 `bootstrapCore` 公开契约；follow-up 要求将其提升为 Core API public contract。

本 change 仅硬化 M1 bootstrap / lifecycle 行为，不扩展 Command/Event、Adapter 或 Shell 范围。

**Branch**：`fix/harden-core-bootstrap-lifecycle`

## Goals / Non-Goals

**Goals:**

- 在 lifecycle hooks 运行前的 bootstrap validation 阶段检测 duplicate `metadata.name` 并 fatal fail。
- startup hook failure 时，对已成功完成 `onInit` 的插件子集执行 reverse-order `onDestroy` cleanup，然后再 fatal fail；仍不返回 running `CoreBootstrapRuntime`。
- 将 `CoreBootstrapRuntime.dispose()` 幂等语义写入 delta spec 与后续 Docs sync，与现有实现及 main spec scenario 对齐。
- 通过 contract tests 覆盖上述行为；保持 package export 边界不变。

**Non-Goals:**

- 不实现 `createEditor` / `AetherEditor`、React/Vue Shell、GFM preset。
- 不实现 Adapter plugin loading、`core:engine` / `core:parser` silent provide。
- 不改变 `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS`。
- 不改变 `createCommandEventRuntime` 行为；仅在 design/spec 中引用其 dispose 边界，说明 Command/Event dispose 幂等 **不** 替代 `bootstrapCore` dispose 契约。
- 不定义 duplicate `metadata.provides` ConflictResolver 语义。
- 不在本 change 中完成长期 Docs 大改（Step 8 处理）。

## Decisions

### 1. Duplicate `metadata.name` 在 manifest load 之后、lifecycle 之前 fatal 拒绝

**选择：** 在 `loadPluginManifests` 完成之后、Service Capability 与 dependency 校验之前，扫描 loaded plugin set；若同一 `metadata.name` 出现多于一次，throw fatal `CoreError`，code **`PLUGIN_NAME_DUPLICATE`**（扩展 public `CoreErrorCode` union）。

**理由：** 属于 bootstrap validation，早于 lifecycle hooks；与 `metadata.name` 作为拓扑排序键、capability 关联键的语义一致；避免 Map silent overwrite 导致不可审查行为。

**备选：** 在 `resolvePluginDependencyOrder` 内检测 —— 拒绝，因 validation 应早于 dependency 图构建，错误信息更清晰。

### 2. Startup failure cleanup 仅覆盖已成功 `onInit` 的插件

**选择：** 维护 `successfulOnInitOrder`（与当前 `successfulLifecycleOrder` 字段语义一致：已成功 `onInit` 的插件顺序）。当 `onInit` 或 `onReady` throw 时：

1. 对 `successfulOnInitOrder` 中插件按 **reverse dependency order** 调用 `runtime.onDestroy`（复用 `runDestroyLifecycle` 或等价逻辑）。
2. cleanup 完成后，throw 原始 startup fatal `CoreError`（`LIFECYCLE_HOOK_FAILED`）。
3. `bootstrapCore` **仍 reject**，不返回 partial running runtime。

**理由：** `onReady` 失败时所有 listed plugins 均已完成 `onInit`；`onInit` 失败时仅 prior plugins 在 cleanup 集合内。与 `dispose()` 使用同一 reverse successful order 原则，便于测试与 mental model。

**备选：** `onReady` 失败只 cleanup 已完成 `onReady` 的子集 —— 拒绝，因 M1 未单独跟踪 onReady 成功集合，且 onInit 成功插件可能已持有资源。

### 3. Startup cleanup 中 `onDestroy` 失败：尽力 cleanup 后仍 throw 原始 startup error

**选择：** cleanup 路径中若某个 `onDestroy` 失败，包装为 fatal `CoreError`（`LIFECYCLE_HOOK_FAILED`）并 **继续** 对其余 eligible 插件 attempt destroy；全部 attempt 结束后，**rethrow 原始 startup `LIFECYCLE_HOOK_FAILED`**（primary error）。cleanup 期间的 destroy failure **MAY** 附加在 primary error 的 `cause` 链中。

**理由：** primary failure 是 startup hook failure；cleanup 是 best-effort 资源回收。与 normal `dispose()` 路径 **刻意 asymmetry**：正常 `dispose()` 中 `onDestroy` failure 仍 fatal 并 abort 剩余 destroy（保持现有 M1 行为）；startup failure cleanup 则优先减少 resource leak。

**备选：** cleanup 失败立即 abort 剩余 cleanup —— 拒绝，减少 resource leak。

### 4. `bootstrapCore.dispose()` 幂等作为公开 public contract

**选择：** delta spec **MODIFIED** `Dispose destroys plugins in reverse lifecycle order`，在 repeated dispose scenario 中明确：

- 第二次及后续 `CoreBootstrapRuntime.dispose()` **MUST** 为 no-op；
- **MUST NOT** 再次调用 `onDestroy`；
- **MUST NOT** throw。

实现已满足；本 change 以 spec + tests + Step 8 docs sync 对齐 `core-api.md` 与 `lifecycle.md`。

**边界说明：** `createCommandEventRuntime().dispose()` 幂等由 `command-event-runtime` capability 约束；与本 change 独立，不在代码中修改 Command/Event 模块。

### 5. 错误码与测试入口

**选择：** 新增 duplicate name 测试于 manifest 或 bootstrap contract tests；startup cleanup 测试于 lifecycle / bootstrap tests，覆盖 `onInit` 失败与 `onReady` 失败两条路径；dispose 幂等补全 public contract 断言（no throw on repeat）。

## 架构边界检查

- Core 仍为 bootstrap / lifecycle coordinator；不引入 Adapter、Shell、Command Bus 编排变更。
- Manifest 仍是插件身份权威入口；duplicate name fatal 强化 ADR 002 声明式 Manifest 可审查性。
- 不修改 ADR 005/006 capability 模型；不新增 ADR，除非 implementation 发现需记录 cleanup primary-error 策略（当前不需要）。

## Public Contract 影响

| 表面 | 变化 |
| --- | --- |
| `bootstrapCore` validation | duplicate name → fatal（新行为，tightening） |
| `bootstrapCore` startup failure | reverse cleanup before throw（新可观察行为） |
| `CoreBootstrapRuntime.dispose()` | 幂等 MUST 写入公开契约（文档化 + spec 对齐） |
| `SUPPORTED_MANIFEST_VERSIONS` | 不变 |
| public exports | 形状不变；可能新增 `CoreErrorCode` 枚举值 |

**Version impact：** `@aether-md/core` patch-level；无 lockfile 结构性变更预期。

## 测试策略

遵循 `docs/engineering/test-strategy.md`，聚焦 contract behavior：

- duplicate `metadata.name` → fatal，lifecycle hooks 不运行；
- `onInit` 中途失败 → prior plugins 收到 reverse `onDestroy`，然后 throw；
- `onReady` 失败 → 全部 onInit-success plugins 收到 reverse `onDestroy`，然后 throw；
- startup failure 后 `bootstrapCore` reject，不返回 runtime；
- 成功 startup 后 repeated `dispose()` no-op 且不 throw；
- 成功 `bootstrapCore` startup 后，`dispose()` 使用的 reverse order 与 `successfulOnInitOrder` 一致（成功路径下全部插件均已完成 `onInit` 与 `onReady`）。
- startup cleanup 中 `onDestroy` 失败 → 继续 cleanup，最终 throw primary startup `LIFECYCLE_HOOK_FAILED`；
- normal `dispose()` 中 `onDestroy` 失败 → 仍 fatal abort（与 startup cleanup asymmetry，保持现有行为）；
- regression：dependency order、capability validation、M2/M3 package-boundary tests 仍绿（回归，不扩展 M2/M3 实现 scope）。

## Risks / Trade-offs

| Risk | Mitigation |
| --- | --- |
| duplicate name fatal 暴露宿主配置问题 | intentional tightening；错误信息含 duplicate name |
| cleanup 增加 startup failure 路径复杂度 | 复用 `runDestroyLifecycle`；独立 contract tests |
| cleanup 与 primary error 双重失败难断言 | 测试 focus primary `LIFECYCLE_HOOK_FAILED`；cleanup failure 可选 `cause` |
| Docs/spec 再次 drift | Step 8 同步 `core-api.md` 移除 bootstrap dispose 排除表述 |

## Migration Plan

- 无已发布包 migration。
- 开发/测试宿主若依赖 duplicate name last-wins，需修正 plugin 列表为唯一 name。
- 实现完成后跑 `pnpm check`；archive 前 sync main spec。

## Open Questions

- 无阻塞项。下列决策已写入 delta spec，implementation 按 spec 执行即可：
  - duplicate name 使用 `CoreErrorCode` **`PLUGIN_NAME_DUPLICATE`**；
  - startup cleanup 中 `onDestroy` 失败：best-effort + primary startup `LIFECYCLE_HOOK_FAILED`；
  - normal `dispose()` 路径 asymmetry 保持 fatal abort；
  - 未来 `createEditor` startup cleanup 不在本 change 范围。
