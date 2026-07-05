# harden-core-bootstrap-lifecycle Tasks

## 1. Duplicate metadata.name validation

- [ ] 1.1 在 bootstrap validation 路径（`loadPluginManifests` 之后、lifecycle 之前）检测 duplicate `metadata.name`。
- [ ] 1.2 对 duplicate name throw fatal `CoreError`，code 为 `PLUGIN_NAME_DUPLICATE`（扩展 public `CoreErrorCode` union）。
- [ ] 1.3 添加 contract tests：duplicate name fatal、unique names 继续 bootstrap、lifecycle hooks 不被调用。

## 2. Startup failure reverse cleanup

- [ ] 2.1 在 startup lifecycle 失败路径中，对已成功 `onInit` 的插件子集调用 reverse-order `runtime.onDestroy`（复用或抽取 `runDestroyLifecycle`）。
- [ ] 2.2 覆盖 `onInit` 中途失败与 `onReady` 失败两条路径；cleanup 后仍 throw fatal `CoreError` 且不返回 running runtime。
- [ ] 2.3 覆盖「无任何 successful onInit 时不调用 onDestroy」场景。
- [ ] 2.4 实现并测试 delta spec「Startup cleanup continues after onDestroy failure」：best-effort cleanup，primary error 仍为原始 startup `LIFECYCLE_HOOK_FAILED`。

## 3. bootstrapCore dispose 幂等 public contract

- [ ] 3.1 确认 `CoreBootstrapRuntime.dispose()` 重复调用为 no-op 且不 throw（实现已存在则补测试与注释对齐 spec）。
- [ ] 3.2 添加或强化 contract test：第二次 `dispose()` 不调用 destroy hooks、不 throw；normal dispose 中 `onDestroy` 失败仍 fatal abort（与 startup cleanup asymmetry 对照）。

## 4. 回归与边界

- [ ] 4.1 运行 `@aether-md/core` 全量 tests 与 `pnpm check`，确认 M2 Command/Event、M3 adapter-base boundary tests 仍绿。
- [ ] 4.2 确认未修改 Command/Event runtime、Adapter loading、`manifestVersion` 或 Shell/GFM 范围。
- [ ] 4.3 确认 `dependencies.ts` 不再依赖 silent Map overwrite 作为 duplicate name 策略。

## 5. Workflow follow-up

- [ ] 5.1 基于本 OpenSpec change 生成 Superpowers implementation plan（`aether-workflow-create-plan`）。
- [ ] 5.2 将 plan 拆成小 implementation tasks（`aether-workflow-create-task`）。
- [ ] 5.3 compliance review 与 archive 前执行 docs/spec sync（`aether-workflow-update-docs-spec`），至少更新：
  - `docs/sdk/manifest.md`（duplicate name fatal）
  - `docs/sdk/lifecycle.md`（startup failure reverse cleanup、dispose 幂等 public contract）
  - `docs/architecture/core-api.md`（移除 L55 bootstrap dispose 排除表述，写入幂等 MUST）
  - `docs/engineering/error-model.md`（`PLUGIN_NAME_DUPLICATE`、startup cleanup 与 normal dispose asymmetry）
  - `openspec/specs/core-bootstrap/spec.md` main spec sync
