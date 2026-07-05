## Why

M3 Adapter 基座已在 `@aether-md/plugin-remark` 与 `@aether-md/plugin-prosemirror` 验证 paragraph/heading 最小 round-trip，但 `ListBlock`、`LinkInline`、`MarkedInline` 等 v1.0 内置类型虽已 export，尚未完成结构化 parse/serialize/编辑往返。MVP M4 需要 GFM Preset，在不引入 `createEditor` 或 React Shell 的前提下，落实 `docs/engineering/test-strategy.md` 对「段落、标题、加粗、斜体、列表、链接」的 round-trip 验收，并闭合 M3 延后的 `SerializationError` 占位符策略。

## What Changes

- 新建 workspace 包 `packages/preset-gfm`（`@aether-md/preset-gfm`），提供 GFM preset 的 Manifest、公开 factory 入口与 GFM round-trip 集成测试编排。
- 扩展 `@aether-md/plugin-remark`：`ParserAdapter` / `SerializerAdapter` 支持 GFM 子集（paragraph、heading、strong、emphasis、unordered/ordered list、link）；实现 `SerializationError` 占位符策略（`CustomBlock` → `[unsupported:block:<name>]`；schema 外节点 reject）。
- 扩展 `@aether-md/plugin-prosemirror`：`EngineAdapter` ProseMirror schema 与 conversion 支持 GFM 块/行内结构；`getDocument` 在 GFM fixture 上保留 list/link/mark 语义（非 M3 式 JSON 降级）。
- 新增 cross-package GFM round-trip integration tests（显式 wiring：parse → apply → serialize），对齐 `test-strategy.md` 六类语法矩阵。
- 更新 `@aether-md/core` package-boundary 测试：workspace 允许 `@aether-md/preset-gfm` 存在；**Core 仍禁止** export `createEditor`、Shell、GFM preset 实现。
- `@aether-md/core` public types **预期不变**（`AetherDoc` 形状已在 M3 export）；若需 golden-string 常量或 schema 辅助类型，以 **additive minor** 评估。
- **非 BREAKING**（相对 M3）：Adapter 行为对 list/link/mark 从「降级为 text」变为「结构化 GFM」——属于 M4 里程碑内预期演进，不视为对已发布 semver 的 breaking change（包尚未发布）。

## Capabilities

### New Capabilities

- `gfm-preset`: `@aether-md/preset-gfm` package、Manifest、`metadata.name: gfm`（或等价官方 preset 名）、公开 factory/聚合入口、GFM round-trip 集成测试归属与 workspace 验证脚本。

### Modified Capabilities

- `document-model`: 将 M3「扩展类型 export 但不测 round-trip」推进为 M4 GFM 子集的 structured round-trip 场景；明确 `ListBlock` / `LinkInline` / `MarkedInline` 的测试矩阵与 `CustomBlock` 仍不在 M4 round-trip 范围。
- `adapter-base`: Remark/ProseMirror 对 GFM 子集的 parse/serialize/apply；新增 GFM round-trip 与 `SerializationError` 占位符/失败路径要求；M3 minimal round-trip 要求保留。
- `core-bootstrap`: 更新 package-boundary 与 workspace 验证——允许 `@aether-md/preset-gfm` 作为独立 package 参与 `pnpm check`；`@aether-md/core` 继续禁止 `createEditor`、Shell、GFM preset 实现 export。

## Impact

- 代码：新建 `packages/preset-gfm`；扩展 `packages/plugins/plugin-remark`、`packages/plugins/plugin-prosemirror`；可能微调 `packages/core` boundary tests。
- API：`@aether-md/preset-gfm` 新 public exports；Adapter plugin factories 行为扩展（GFM 子集）；`@aether-md/core` 类型面预期 additive-only 或不变。
- 契约：`docs/architecture/document-model.md`、`docs/engineering/adapter-protocol.md`、`docs/engineering/error-model.md`、`docs/engineering/test-strategy.md` 的 M4 可执行子集。
- 依赖：`plugin-remark` 可能引入 `remark-gfm` 或等价 GFM 解析依赖；`preset-gfm` 依赖 core + adapter plugins；`@aether-md/core` **MUST NOT** 直接依赖 Remark/ProseMirror/React。
- 测试：GFM round-trip integration tests、SerializationError 失败路径 contract tests、preset package boundary tests。
- OpenSpec main spec（archive 后 sync）：预期修改 `document-model`、`adapter-base`、`core-bootstrap`，新增 `gfm-preset` main spec。

## 非目标

- 不实现 M5 `createEditor` / `AetherEditor` / `EditorContext` / 宿主 `getMarkdown()` / `getDocument()`。
- 不实现 `@aether-md/react` / Vue Shell、GateLock、React 挂载 smoke path。
- 不实现 Command Bus 与 Adapter 深度集成（`dispatch` 自动 rollback、`transactionFailed` auto emit、Guard 链）。
- 不通过 `bootstrapCore` 加载 Adapter plugin 或 silent provide `core:engine` / `core:parser`。
- 不实现 compile-layer Manifest Schema 合并、ConflictResolver、`gfm:*` Command handler 注册与 Shell 快捷键。
- 不实现 `CustomBlock` round-trip 或自定义块 Markdown fallback 语法。
- 不实现嵌套列表、任务列表、表格、代码块、图片、删除线等超出 M4 六类语法的 GFM 扩展。
- 不实现 Worker Thread、Command Queue、Permission 沙盒、Telemetry、插件热插拔。
- 不在本 change 中做长期 Docs 大改；Docs/spec sync 留到 archive 后 `aether-workflow-update-docs-spec`。

## Source Docs

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/document-model.md`
- `docs/engineering/adapter-protocol.md`
- `docs/engineering/error-model.md`
- `docs/engineering/test-strategy.md`
- `docs/architecture/package-layout.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`
- `openspec/specs/document-model/spec.md`
- `openspec/specs/adapter-base/spec.md`
- `openspec/specs/core-bootstrap/spec.md`

## Version Impact

- **`@aether-md/core`**：预期 **无 breaking change**；public `AetherDoc` / `AetherSchema` / Adapter 协议类型形状不变。若 implementation 需 additive 辅助 export（如 GFM golden fixture 类型），记为 **minor-level additive**。`SerializationError` 类已存在，M4 在 Serializer 路径 **使用** 而非修改其 shape。
- **`@aether-md/preset-gfm`**：新包，初始版本 **`0.0.0`**（workspace 未发布基线）。
- **`@aether-md/plugin-remark` / `@aether-md/plugin-prosemirror`**：**minor-level behavior extension**（GFM 子集）；包版本随 Changesets 策略 bump（仍为 `0.x` 基线）。
- **`manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS`**：**不变**（仍为 `[1]`）；preset Manifest 使用 `manifestVersion: 1`。
- **Lockfiles**：预期变更——`remark-gfm`（或等价）、`preset-gfm` workspace 链接、可能的 ProseMirror schema 相关 devDependencies。
- **Compatibility docs**：archive 后 sync；本 change 不直接改长期 Docs。

## Code-Management Status

- **Branch**：`feat/add-gfm-preset`（从 `main` 创建；创建 artifacts 前工作树干净）。
- **Conventional Commit type**：OpenSpec 产物 `docs(openspec)`；实现阶段预期 `feat(preset-gfm)`、`feat(plugin-remark)`、`feat(plugin-prosemirror)`、`test(...)`、`chore(core)`（boundary）。
- **OpenSpec change id**：`add-gfm-preset`。

## Docs 子集关系

| Docs | M4 采用 | M4 明确延后 |
| --- | --- | --- |
| `docs/architecture/document-model.md` | v1.0 六类 GFM 块/行内 structured round-trip | 稳定 `id`、`CustomBlock` fallback、`meta` 命名空间 |
| `docs/engineering/adapter-protocol.md` | GFM parse/serialize、`SerializationError` 或占位符 | Adapter 能力矩阵、`SelectionAdapter` |
| `docs/engineering/error-model.md` | `SerializationError` 占位符 `[unsupported:block:<name>]`；GFM 已知节点 deterministic serialize | `RenderError` 降级视图 |
| `docs/engineering/test-strategy.md` | 六类语法 round-trip integration tests | React Shell 挂载、Permission 拒绝 |
| `docs/architecture/package-layout.md` | 建立 `packages/preset-gfm` | `packages/react` 仍待 M5 |

## 风险

- GFM 字面量规范（`*` vs `_`、列表缩进）未 RFC 化，可能导致 golden string 争议——须在 design 中冻结。
- Engine schema 扩展不足会导致 edit leg 丢失 mark/link——integration tests 会暴露。
- `SerializationError` 通过 `Promise` rejection 表达，与占位符降级路径并存——测试须分别覆盖。
- 若把 `createEditor` 或 compile-layer 并入 M4，范围膨胀至 M5/M6。
- M3「list 降级为 paragraph text」测试与 M4 结构化 parse **行为变更**——须更新 parser tests，避免双标准。

## 验收标准

- `openspec/changes/add-gfm-preset/` 存在 `proposal.md`、`design.md`、`specs/*/spec.md` delta specs、`tasks.md`。
- Delta specs 覆盖 `gfm-preset`（ADDED）、`document-model`、`adapter-base`、`core-bootstrap`（MODIFIED/ADDED）。
- 可测试 requirement：段落、标题、加粗、斜体、无序/有序列表、链接完成 Markdown → parse → `EngineAdapter.apply`（`replaceText` 最小编辑）→ serialize round-trip；M3 paragraph/heading 样例仍 pass。
- `SerializationError` / 占位符：`CustomBlock` serialize 输出 `[unsupported:block:<name>]`；非法节点 reject `SerializationError`（`source: 'serialization'`, `severity: 'degraded'`）。
- 范围明确排除 `createEditor`、React Shell、Command Bus rollback、`CustomBlock` round-trip、compile-layer。
- `openspec validate add-gfm-preset --strict` 通过。
