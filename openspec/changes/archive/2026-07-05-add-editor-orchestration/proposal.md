## Why

M4 GFM preset 已在显式 Adapter wiring 下验证六语法 round-trip，但 `@aether-md/core` 仍无宿主级 `createEditor` / `AetherEditor` 入口，M5 React Shell 无法挂载可审查的 Core API smoke path（见 `docs/architecture/package-layout.md`）。M4.5 编辑器编排层在不引入 UI 的前提下，将 M1 bootstrap、M2 Command/Event、M3/M4 Adapter 与 preset 组合为 headless 可运行编辑器，闭合 `docs/engineering/mvp-implementation-plan.md` 对宿主 `getMarkdown()` / `getDocument()` 的 v1.0 目标，并为 M5 前置门槛。

## What Changes

- 在 `@aether-md/core` 新增 `createEditor(config): Promise<AetherEditor>` 及关联公开类型（`EditorConfig`、`ExtensionPlugin`、`EditorContext`、`EditorStateSnapshot` 等）。
- 实现 `AetherEditor` 公开面：`context`、`state`、`dispatch`、`on`、`getMarkdown`、`getDocument`、`dispose`（对齐 `docs/architecture/core-api.md` 与 Phase 0 冻结决策）。
- 编排层显式 wiring：`bootstrapCore` lifecycle + Command/Event runtime + 从 plugin Manifest / preset factory 解析的 Parser / Serializer / Engine Adapter；**不**通过 `bootstrapCore` silent provide `core:engine` / `core:parser`。
- `initialValue` Markdown 字符串经 Parser Adapter 初始化 Engine session；成功编辑后 emit `change`（含 `{ doc, markdown? }` payload）；lifecycle 发出 `ready` / `disposed`。
- 最小编排 rollback：`AetherEditor.dispatch` 路由至 Engine `apply` 失败时恢复 Core 可见快照并 emit `transactionFailed`（standalone `createCommandEventRuntime` 语义不变）。
- 新增 headless integration test：`createEditor({ plugins: [createGfmPreset()] })` + GFM round-trip（无 React / 无 DOM）。
- 更新 `@aether-md/core` package-boundary tests：允许 editor orchestration export；继续禁止 React/Vue Shell、GFM preset 实现 re-export、Remark/ProseMirror runtime deps。
- **非 BREAKING**（相对 M1–M4）：M1 bootstrap、M2 独立 runtime、M3/M4 Adapter 既有行为保持不变；新增 additive export。

## Capabilities

### New Capabilities

- `editor-orchestration`: `@aether-md/core` 的 `createEditor` / `AetherEditor` 编排、EditorContext 最小面、宿主 `getMarkdown` / `getDocument`、Adapter 显式 wiring、最小编排 rollback、`ready` / `change` / `transactionFailed` / `disposed` 事件、headless GFM preset integration test 归属。

### Modified Capabilities

- `core-bootstrap`: package export boundary 允许 `createEditor`、`AetherEditor`、`EditorContext`；继续禁止 Shell 与 GFM preset 实现 export；更新 M1 excludes later milestone 措辞以纳入 M4.5 editor surface。
- `command-event-runtime`: 明确 M2 独立 `createCommandEventRuntime` 语义不变；新增 editor-integrated dispatch / lifecycle 事件与 M2 runtime 的关系要求。
- `adapter-base`: 新增 editor orchestration wiring 场景；允许经 `createEditor` 验证 GFM round-trip（替代仅显式 harness wiring）。

## Impact

- **代码**：`packages/core` 新增 editor orchestration 模块、公开 export、integration tests（devDependency `@aether-md/preset-gfm` + adapter plugins）；可能微调 preset-gfm 测试 fixture 复用。
- **API**：`@aether-md/core` additive public exports（见 Version Impact）；M2 `createCommandEventRuntime` 签名与语义不变。
- **契约**：`docs/architecture/core-api.md`（Phase 0 约束落地）、`docs/engineering/test-strategy.md`（M4.5 必测场景）；archive 后 sync main specs。
- **依赖**：Core **MUST NOT** 新增 remark/prosemirror/react runtime deps；integration tests 通过 workspace devDependencies 引用 preset/plugins。
- **OpenSpec main spec（archive 后 sync）**：新增 `editor-orchestration`；MODIFIED `core-bootstrap`、`command-event-runtime`、`adapter-base`。

## 非目标

- **不实现 M5**：`@aether-md/react` / `@aether-md/vue`、GateLock、DOM 挂载、React 组件/hook。
- **不引入 Shell Adapter**（Phase 0 Decision #3，`docs/architecture/core-api.md`）。
- **不提供** `createEditorSync` 或同步轻量入口（Phase 0 Decision #1）。
- **不在 Core 暴露订阅式 store**（Phase 0 Decision #2）；Shell 通过 `on('change')` 观察。
- **不实现完整 Guard 链**：ReadOnlyGuard、CapabilityGuard、PermissionGuard、HistoryCapture、TelemetrySpan。
- **不通过 `bootstrapCore` silent provide** `core:engine` / `core:parser`（除非 `design.md` 记录 deviation 并论证必需——当前 design **否决**）。
- **不 re-export** GFM preset 工厂或 Adapter 实现到 `@aether-md/core`。
- **不实现** compile-layer Schema 合并、宿主自定义 `ConflictResolver` 注入（M4.5 仅用 `createDefaultConflictResolver()` 于 **runtime command 注册** 冲突，见 `design.md`）。
- **不实现** Worker Thread、Command Queue、Permission 沙盒 enforce、Telemetry 后端、插件热插拔。
- **不实现** History / Selection / Clipboard 完整语义（M4.5 允许 stub/no-op service 占位）。
- **不实现** nested lists、tables、`CustomBlock` structured round-trip、GFM 六语法以外扩展。
- **不在本 change 做长期 Docs 大改** — archive 后 `aether-workflow-update-docs-spec`。

## Source Docs

- `docs/architecture/core-api.md`（含 Phase 0 已冻结决策）
- `docs/architecture/principles.md`
- `docs/architecture/roadmap.md`
- `docs/architecture/package-layout.md`
- `docs/architecture/compatibility.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/engineering/adapter-protocol.md`
- `docs/engineering/data-flow.md`
- `docs/engineering/conflict-resolver.md`
- `docs/engineering/test-strategy.md`
- `docs/sdk/editor-context.md`
- `docs/sdk/command-event-protocol.md`
- `docs/sdk/manifest.md`
- `docs/sdk/lifecycle.md`
- `docs/adr/001-microkernel-architecture.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`
- `openspec/specs/core-bootstrap/spec.md`
- `openspec/specs/command-event-runtime/spec.md`
- `openspec/specs/adapter-base/spec.md`
- `openspec/specs/gfm-preset/spec.md`
- `openspec/changes/archive/2026-07-05-add-gfm-preset/proposal.md`（结构参考）

## Version Impact

- **`@aether-md/core` semver**：**minor-level additive**（包仍为 `0.0.0` 未发布）。新增 export：`createEditor`、`AetherEditor`、`EditorConfig`、`ExtensionPlugin`、`EditorContext`、`EditorStateSnapshot`（及关联类型）。M1 bootstrap、M2 `createCommandEventRuntime`、M3/M4 类型与行为 **MUST NOT** breaking change。
- **`@aether-md/preset-gfm`**：public factory **不变**；可能被 core integration tests 作为 workspace devDependency 消费。
- **`@aether-md/plugin-remark` / `@aether-md/plugin-prosemirror`**：export **不变**；被 orchestration 消费。
- **`manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS`**：**不变**（`[1]`）。
- **Lockfiles**：预期变更 — core integration test devDependencies（`@aether-md/preset-gfm`、adapter plugins workspace links）；Core **MUST NOT** 新增 remark/prosemirror/react **runtime** deps。
- **Compatibility docs**：archive 后 sync `docs/architecture/compatibility.md`（M4.5 export 表）。

## Code-Management Status

- **Branch**：`feat/add-editor-orchestration`（从 `docs/freeze-core-api-open-questions` 创建；含 Phase 0 `core-api.md` 冻结决策，待一并提交）。
- **Conventional Commit type**：OpenSpec 产物 `docs(openspec)`；实现阶段预期 `feat(core)`、`test(core)`。
- **OpenSpec change id**：`add-editor-orchestration`。

## 风险

- 编排层与 M2 独立 runtime 边界混淆 — 须在 boundary tests 分离 `createCommandEventRuntime` 与 `createEditor` 测试。
- `EditorStateSnapshot` 最小 shape 未 RFC 化 — design 冻结后 implementation 不得随意扩展 store 语义。
- GFM integration test 与 M4 preset 测试重复 — 须断言经 `createEditor` 路径，非重复显式 wiring。
- 若将 React Shell 或 compile-layer 并入本 change，范围膨胀至 M5/M6。

## 验收标准

- `openspec/changes/add-editor-orchestration/` 存在 `proposal.md`、`design.md`、`specs/*/spec.md` delta specs、`tasks.md`。
- Delta specs 覆盖 `editor-orchestration`（ADDED）、`core-bootstrap`、`command-event-runtime`、`adapter-base`（MODIFIED/ADDED）。
- `openspec validate add-editor-orchestration --strict` 通过。
- 可测试 requirement（implementation 阶段）：`createEditor({ plugins: [createGfmPreset()], initialValue: '...' })` 返回 `AetherEditor`；经 `dispatch` 最小编辑后 `getDocument()` / `getMarkdown()` round-trip GFM 六语法矩阵之一；**无 UI、无 React import**。
- `createEditor` startup 失败 reject `CoreError`；`dispose` 后 `dispatch` fail-closed。
- package-boundary：`createEditor` / `AetherEditor` export **允许**；React Shell / GFM preset factory re-export **禁止**；Core 无 remark/prosemirror/react runtime deps。
- Phase 0 三项冻结决策无 deviation（或 `design.md` 显式记录 deviation）。
- M1–M4 既有测试保持 green。
