## Why

M1 Core Bootstrap 与 M2 Command/Event Runtime 已在 `@aether-md/core` 验证 Manifest 加载、Service Capability 校验、同步 Command Bus 与 Event Hub，但仓库仍无法 parse Markdown、持有可编辑文档状态或 serialize 回 Markdown。MVP M3 需要 Adapter 基座，落实 ADR 003 的 Remark / ProseMirror 双轨隔离，并在不引入 `createEditor` 或 React Shell 的前提下，证明框架无关 `AetherDoc` 与三类 Adapter 协议可测、可 round-trip。

## What Changes

- 在 `@aether-md/core` 导出框架无关 `AetherDoc` / `AetherSchema` 最小公开类型（对齐 `docs/architecture/document-model.md`）。
- 在 `@aether-md/core` 导出 `ParserAdapter`、`SerializerAdapter`、`EngineAdapter` 协议类型，以及 `AdapterError`、`AdapterTransactionResult` 等最小 Adapter 契约面（对齐 `docs/engineering/adapter-protocol.md`、`docs/engineering/error-model.md`）。
- 新建 workspace 包 `packages/plugins/plugin-remark`（`@aether-md/plugin-remark`）与 `packages/plugins/plugin-prosemirror`（`@aether-md/plugin-prosemirror`），分别提供最小 Parser/Serializer 与 Engine 实现。
- 建立最小 Markdown round-trip 路径：Markdown 字符串 → `parse` → `AetherDoc` → `EngineAdapter.apply`（最小编辑事务）→ `serialize` → Markdown；失败路径验证 `AdapterError` 与文档快照不被污染。
- 更新 `packages/core` package-boundary 测试：允许 M3 Adapter 相关 export/类型，继续禁止 Shell、GFM preset、`createEditor` / `AetherEditor` 等后续里程碑 API。
- 新增 Adapter 契约测试与包边界 guard（参考 M2 `package-boundary.test.ts` 模式）。
- **非 BREAKING**（相对已发布消费者）：当前尚无已发布包；相对 M2 实现，这是 `@aether-md/core` public export 的 minor-level 增量扩展，并新增两个 Adapter package。

## Capabilities

### New Capabilities

- `document-model`: `@aether-md/core` 导出的框架无关 `AetherDoc` 与 M3 最小 `AetherSchema` 公开类型，对齐 `docs/architecture/document-model.md` 的 v1.0 内置块/行内子集。
- `adapter-base`: 三类 Adapter 协议、`AdapterError` / `SerializationError` 最小形状、Remark/ProseMirror 最小实现包，以及 parse → edit → serialize round-trip 与失败回滚契约测试。

### Modified Capabilities

- `core-bootstrap`: 更新 `@aether-md/core` package boundary 要求——允许 M3 Adapter / document-model 相关 export，继续排除 M4 GFM preset、M5 React Shell、`createEditor` / `AetherEditor` 与完整 editor 入口。

## Impact

- 代码：`packages/core` 新增 document/adapter 类型与错误类；新建 `packages/plugins/plugin-remark`、`packages/plugins/plugin-prosemirror`；更新 package-boundary 与契约测试。
- API：`@aether-md/core` 新增 `AetherDoc`、`AetherSchema`、Adapter 接口与 `AdapterError` 等 export；两个 Adapter package 各自导出 factory/实现入口。
- 契约：`docs/architecture/document-model.md`、`docs/engineering/adapter-protocol.md`、`docs/engineering/error-model.md`、`docs/engineering/test-strategy.md` 的 M3 可执行子集成为本 change 的实现合同。
- 依赖：`plugin-remark` 引入 Remark 生态依赖；`plugin-prosemirror` 引入 ProseMirror 依赖；`@aether-md/core` 仍 **MUST NOT** 直接依赖 Remark、ProseMirror 或 UI 框架。
- 测试策略：新增 Adapter contract tests（parse、serialize、apply 成功/失败、dispose）；更新 core export boundary guard。
- OpenSpec main spec（archive 后 sync）：预期新增 `document-model`、`adapter-base` main specs，并修改 `core-bootstrap` package boundary。

## 非目标

- 不实现 M4 GFM preset（`packages/preset-gfm`）与完整内置语法 round-trip（段落、标题、加粗、斜体、列表、链接全覆盖属于 M4）。
- 不实现 M5 React Shell（`packages/react`）或 Vue Shell。
- 不实现 `createEditor` / `AetherEditor` / `EditorContext` / `getMarkdown()` / `getDocument()` 宿主入口。
- 不实现 Command Bus 与 Adapter 的深度集成（例如在 `createCommandEventRuntime.dispatch` 中自动 rollback、`transactionFailed` 自动发出）；M2 runtime 保持独立。
- 不实现默认 ConflictResolver compile-layer、Manifest Schema 合并、Runtime Permission 沙盒。
- 不实现 Worker Thread、Command Queue priority/coalescing、Telemetry 后端、插件热插拔、多人协作。
- 不实现 M1 follow-up：duplicate `metadata.name`、partial startup cleanup、`bootstrapCore` dispose public contract 文档化。
- 不在本 change 中做长期 Docs 大改；Docs/spec sync 留到 Step 8（`aether-workflow-update-docs-spec`）。
- 不通过 `bootstrapCore` 加载 Adapter plugin 或 silent provide `core:engine` / `core:parser`（留待后续 editor/bootstrap 集成 change）。

## Source Docs

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/document-model.md`
- `docs/engineering/adapter-protocol.md`
- `docs/architecture/core-api.md`
- `docs/architecture/principles.md`
- `docs/architecture/package-layout.md`
- `docs/architecture/compatibility.md`
- `docs/engineering/error-model.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/data-flow.md`
- `docs/glossary.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`
- `openspec/specs/core-bootstrap/spec.md`
- `openspec/specs/command-event-runtime/spec.md`

## Version Impact

- **Package SemVer**：`@aether-md/core` 仍为未发布基线；本 change 增加 document/adapter public exports，属于 **minor-level additive**（相对 M2）。新增 `@aether-md/plugin-remark`、`@aether-md/plugin-prosemirror` 以 `0.0.0` 引入。
- **`manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS`**：不变更（仍为 `[1]`）。
- **Public SDK contracts**：新增 `AetherDoc`、`AetherSchema`、Adapter 接口与 `AdapterError`；不修改既有 Manifest bootstrap 或 M2 Command/Event 语义。
- **Package exports**：`packages/core` `exports` 扩展；两个 Adapter package 建立 public `exports`。
- **Lockfiles**：预期变更（Remark、ProseMirror 运行时依赖）。
- **Compatibility docs**：实现后在 docs/spec sync 阶段更新；本 change 不直接改长期 Docs。

## Code-Management Status

- **Branch**：`feat/add-adapter-base`（从 `main` 创建）。
- **创建 artifacts 前 `git status --short`**：工作树干净。
- **Conventional Commit type**：OpenSpec 产物可用 `docs(openspec)`；实现阶段预期 `feat(core)`、`feat(plugin-remark)`、`feat(plugin-prosemirror)`。
- **OpenSpec change id**：`add-adapter-base`。

## Docs 子集关系

本 change 实现长期 Docs 的 **M3 可执行子集**，不是完整 v1.0 目标面：

| Docs | M3 采用 | M3 明确延后 |
| --- | --- | --- |
| `docs/architecture/document-model.md` | v1.0 内置块/行内最小子集（paragraph、heading、text）；`CustomBlock` 类型存在但 M3 不测 fallback | 稳定 `id`、自定义块 Markdown fallback、`meta` 命名空间 |
| `docs/engineering/adapter-protocol.md` | 三类 Adapter 接口、`AdapterTransactionResult`、失败不改变 Core 可见快照 | Adapter 能力矩阵、`SelectionAdapter`、调试私有快照 |
| `docs/engineering/error-model.md` | `AdapterError` recoverable + 回滚语义；`SerializationError` 最小形状 | `RenderError`、完整占位符策略 |
| `docs/engineering/test-strategy.md` | Adapter contract tests、apply 失败保留快照 | GFM round-trip、Permission 拒绝、Command handler 自动 rollback |
| `docs/architecture/core-api.md` | 类型面为后续 `createEditor` 奠基 | `createEditor`、`AetherEditor`、Guard 链、Promise dispatch |

## 风险

- `AetherSchema` 在 Docs 中未独立成页；若 M3 过度设计 Schema 合并，会侵入 M4 compile-layer 范围。
- Remark / ProseMirror 依赖体积与版本升级面扩大；必须通过 Adapter package 隔离，Core 不得直接依赖。
- 若把 GFM 全覆盖 round-trip 或 `createEditor` 一并实现，M3 范围会膨胀到 M4/M5。
- 若 package-boundary 未更新，M3 export 会与 M2 边界测试冲突。
- 若误把 Command Bus 自动 rollback 当作 M3 必做，会与 M2 独立 runtime 设计冲突。
- M3 最小 Markdown 子集若未在 spec 中写清，实现与 M4 验收边界会混淆。

## 验收标准

- `openspec/changes/add-adapter-base/` 下存在 `proposal.md`、`design.md`、`specs/*/spec.md` delta specs 与 `tasks.md`。
- Delta specs 覆盖 `document-model`、`adapter-base`，并 **MODIFIED** `core-bootstrap` package boundary。
- 范围明确排除 GFM preset、React Shell、`createEditor`、Command Bus 深度集成、compile-layer、M1 follow-up。
- `openspec validate add-adapter-base --strict` 通过。
- Requirements 可在后续 implementation 中通过 contract/integration tests 验证。
- 说明性正文使用中文；API 名称、包名、路径与 OpenSpec 结构关键词保持英文。
