# harden-core-bootstrap-lifecycle Proposal

## Why

M1 Core Bootstrap 已实现 Manifest 校验、Service Capability 校验、依赖排序与 lifecycle startup/dispose，但 `add-core-bootstrap` compliance review 与 M2/M3 归档记录仍留下三项 deferred follow-up：duplicate `metadata.name` 静默覆盖、startup hook 失败时无 reverse cleanup、以及 `bootstrapCore` dispose 幂等尚未作为 Core API 公开契约统一文档化。在进入 M4 及后续 editor 集成前，需要以可审查的 OpenSpec 合同关闭这些生命周期硬化缺口，避免实现与 SDK 语义（`metadata.name` 为插件唯一标识）继续漂移。

## What Changes

- 在 bootstrap validation 阶段，对 duplicate `metadata.name` 返回 fatal `CoreError`，拒绝启动；不再通过 `Map` 静默覆盖同名插件。
- 在 `runtime.onInit` 或 `runtime.onReady` 失败导致 startup 中止时，对已成功完成 `runtime.onInit` 的插件执行 reverse-order cleanup（调用 `runtime.onDestroy`），然后再以 fatal `CoreError` 失败；仍不返回 running bootstrap runtime。
- 将 `bootstrapCore` 返回的 `CoreBootstrapRuntime.dispose()` 重复调用行为明确为公开幂等契约：第二次及后续调用 **MUST** 为 no-op，**MUST NOT** 再次调用 destroy hooks，**MUST NOT** 抛出。
- 更新 `core-bootstrap` delta spec 与后续 Docs sync 预期，对齐 `docs/sdk/manifest.md`、`docs/sdk/lifecycle.md`、`docs/architecture/core-api.md` 与 `docs/engineering/error-model.md`。
- **Pre-release behavior tightening**（相对现有 M1 实现、尚无已发布包）：duplicate name 从 silent last-wins 变为 fatal；startup failure cleanup 为新增可观察行为；dispose 幂等为已有实现的行为文档化与 spec 对齐。实现完成后按 patch-level 记录 `@aether-md/core` version impact；若后续发布 policy 将 duplicate fatal 视为 minor，在 archive 前更新 compatibility 说明。

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `core-bootstrap`：新增 duplicate `metadata.name` fatal validation requirement；新增 startup failure reverse cleanup requirement；明确 `bootstrapCore` dispose 幂等为公开 public contract requirement。

## Impact

- **Branch**：`fix/harden-core-bootstrap-lifecycle`
- **代码**：`packages/core` 中 `manifest.ts` / `dependencies.ts` / `lifecycle.ts` / `bootstrap.ts` 及对应 tests。
- **API**：`bootstrapCore` startup failure 与 validation 行为更严格；`CoreBootstrapRuntime.dispose()` 幂等语义写入公开契约（实现已基本具备）。
- **契约**：`openspec/specs/core-bootstrap/spec.md`（archive 后 sync）；`docs/sdk/manifest.md`、`docs/sdk/lifecycle.md`、`docs/architecture/core-api.md`、`docs/engineering/error-model.md`（Step 8 docs sync）。
- **依赖**：不新增 runtime 依赖；不修改 `manifestVersion`、Command/Event runtime 或 Adapter 包。
- **Version impact**：`@aether-md/core` patch-level 行为硬化；`SUPPORTED_MANIFEST_VERSIONS` 不变；public export 形状不变。

## 非目标

- 不实现 `createEditor` / `AetherEditor`。
- 不实现 React / Vue Shell。
- 不实现 GFM preset。
- 不实现 Adapter plugin loading 或 `core:engine` / `core:parser` silent provide。
- 不改变 `manifestVersion` 或 `SUPPORTED_MANIFEST_VERSIONS`。
- 不改变 Command/Event runtime 行为，除非 delta spec 为描述边界而引用 `createCommandEventRuntime.dispose()` 与 `bootstrapCore.dispose()` 的职责分离。
- 不修改 `openspec/specs/command-event-runtime/spec.md` 或 M2 Command/Event 实现代码。
- 不实现 duplicate `metadata.provides` ConflictResolver 语义（仍 deferred）。
- 不新增或修改 ADR（除非 implementation 发现必须记录的新架构取舍）。
- 不在本 change 中做长期 Docs 大改；Docs/spec sync 留到 Step 8（`aether-workflow-update-docs-spec`）。
- 不为未来 `createEditor` 启动失败路径定义 cleanup 语义（留待 editor 集成 change；本 change 仅覆盖 `bootstrapCore`）。

## Source Docs

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/core-api.md`
- `docs/sdk/manifest.md`
- `docs/sdk/lifecycle.md`
- `docs/engineering/error-model.md`
- `docs/engineering/manifest-loading.md`
- `docs/engineering/test-strategy.md`
- `docs/glossary.md`
- `openspec/specs/core-bootstrap/spec.md`

已归档 follow-up 记录：

- `openspec/changes/archive/2026-07-04-add-core-bootstrap/`
- `openspec/changes/archive/2026-07-04-add-command-event-runtime/`
- `openspec/changes/archive/2026-07-05-add-adapter-base/`
- `.superpowers/reviews/add-core-bootstrap.md`

## 受影响契约

- Manifest validation：`metadata.name` 在 loaded plugin set 内唯一。
- Lifecycle startup failure cleanup：hook failure 前的 successful startup 子集必须 reverse destroy。
- Core API：`CoreBootstrapRuntime.dispose()` 幂等公开语义。
- Fatal bootstrap error：`CoreError` 在 validation 与 startup cleanup 路径保持一致。

## 风险

- duplicate name fatal 可能暴露宿主此前未察觉的配置错误；属于 intentional tightening。
- partial cleanup 若 `onDestroy` 再次失败：delta spec 已裁决 best-effort cleanup + primary startup error；与 normal `dispose()` 路径 asymmetry 需在 Step 8 同步至 `error-model.md`。
- Docs 与 main spec 对 dispose 幂等的表述曾不一致；本 change 需一次性对齐，避免再次 drift。

## 验收标准

- `openspec/changes/harden-core-bootstrap-lifecycle/` 下存在 proposal、design、delta spec、tasks。
- delta spec 覆盖三项 follow-up，且 non-goals 明确排除后续里程碑范围。
- requirements 可通过 unit / contract tests 验证。
- OpenSpec validation 通过。
- 说明性正文使用中文；API 名称、包名、路径、OpenSpec 结构关键词保持英文。
