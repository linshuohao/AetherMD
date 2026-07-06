## Context

M1 已在 `@aether-md/core` 提供 `bootstrapCore`、Manifest / Service Capability 校验与 lifecycle startup/dispose。M2 已提供独立于 bootstrap 的 `createCommandEventRuntime`、同步 Command Bus 与 Event Hub。

M3 目标是在同一 monorepo 内建立 Adapter 基座，满足 `docs/engineering/mvp-implementation-plan.md` 对 M3 的验收：**能 parse Markdown、持有可编辑文档状态、serialize 回 Markdown**，并落实 ADR 003（Remark 负责 parse/serialize，ProseMirror 负责编辑事务，`AetherDoc` 为中转契约）。

约束：

- 长期事实来源仍是 Docs；本 design 只抽取 M3 implementation contract。
- `@aether-md/core` **MUST NOT** 直接依赖 Remark、ProseMirror、React 或 DOM UI。
- Adapter 重型依赖 **MUST** 封装在 `packages/plugins/*`。
- M2 Command/Event runtime **MUST** 保持独立；本 change 不实现 Bus 与 Adapter 编排。
- 说明性正文使用中文；API 名称、包名、路径与 OpenSpec 结构关键词保持 English。

## Goals / Non-Goals

**Goals:**

- 在 `@aether-md/core` 导出 `AetherDoc`、`AetherSchema` 最小类型与三类 Adapter 协议接口。
- 导出 `AdapterError`（及 Serializer 路径所需的 `SerializationError` 最小类型）。
- 建立 `@aether-md/plugin-remark` 与 `@aether-md/plugin-prosemirror` 最小实现。
- 通过 contract/integration tests 验证 Markdown → parse → `AetherDoc` → `EngineAdapter.apply` → serialize → Markdown。
- 验证 `apply` 失败时 Core 可见文档快照不被污染（Adapter 层 + 测试编排层保存/恢复快照）。
- 更新 core package-boundary tests：允许 M3 面，继续禁止 M4/M5 API。

**Non-Goals:**

- M4 GFM preset、完整内置语法 round-trip、compile-layer Schema 合并。
- M5 React Shell、`createEditor` / `AetherEditor` / `EditorContext`。
- `bootstrapCore` 加载 Adapter plugin 或注册 `core:engine` / `core:parser` provides。
- Command Bus 自动 rollback、`transactionFailed` 自动 emit、Guard 链。
- Worker Thread、Command Queue、Permission 沙盒、Telemetry、ConflictResolver。
- M1 follow-up：duplicate `metadata.name`、partial startup cleanup、dispose public contract。
- 长期 Docs 大改（archive 后 sync）。

## Decisions

### 1. 拆分为两个 capability：`document-model` + `adapter-base`

**选择：** `document-model` 负责 Core 侧框架无关数据类型；`adapter-base` 负责 Adapter 协议、错误类、plugin package 与 round-trip 测试。

**理由：** 与 M2 将 Command/Event 独立为 capability 的模式一致；document types 可被后续 M4 preset / M5 Shell 复用，而不与 Remark/PM 实现细节耦合。

**备选：** 合并为单一 `adapter-base`。否决原因：类型面与引擎实现关注点不同，不利于 main spec 长期维护。

### 2. 公开类型与协议放在 `@aether-md/core`

**选择：** `AetherDoc`、`AetherSchema`、`ParserAdapter`、`SerializerAdapter`、`EngineAdapter`、`AdapterCommandRequest`、`AdapterTransactionResult`、`AdapterError`、`SerializationError` 均由 `@aether-md/core` 导出。Plugin package 实现接口并依赖 `@aether-md/core` public contract。

**理由：** `docs/engineering/adapter-protocol.md` 定义 Core 与 Adapter 边界；插件作者与 Adapter 实现方均需稳定类型面。独立 `@aether-md/adapter-types` 包会增加 M3 治理成本，且 `component-library-governance.md` 尚未要求拆分。

**备选：** 类型放在各 plugin package。否决原因：违反「Core、SDK 与 Adapter 共享 `AetherDoc`」原则，且导致循环依赖风险。

### 3. M3 最小 `AetherDoc` / `AetherSchema` 子集

**选择：** M3 实现并对齐测试的节点/行内类型：

| 类型                                                        | M3 范围                                                             |
| ----------------------------------------------------------- | ------------------------------------------------------------------- |
| `AetherDoc`                                                 | `type: 'doc'` + `children: AetherBlock[]`                           |
| `ParagraphBlock`                                            | `type: 'paragraph'` + `TextInline[]`                                |
| `HeadingBlock`                                              | `type: 'heading'`, `level: 1 \| 2`（M3 测试限定 1–2；类型允许 1–6） |
| `TextInline`                                                | `type: 'text'`                                                      |
| `ListBlock` / `LinkInline` / `MarkedInline` / `CustomBlock` | 类型 **MAY** 导出；M3 contract tests **不**要求 parse/serialize     |

**`AetherSchema` M3 最小形状：**

```typescript
export interface AetherSchema {
  readonly version: 1;
}
```

M3 **不**实现 Manifest compile-layer 合并；Parser/Serializer 使用内置 v1.0 块语义 + 空 schema 占位。M4 再扩展 schema 字段。

**理由：** M4 负责 GFM round-trip；M3 只需证明 Adapter 管道可工作。过度实现 list/link/mark 会把 M4 提前。

### 4. M3 最小 Markdown 语法与 round-trip 固定样例

**选择：** M3 round-trip contract tests **MUST** 至少覆盖：

1. 单段落纯文本：`"Hello world\n"` → parse → apply（插入或替换文本的最小 `AdapterCommandRequest`）→ serialize → 可预测 Markdown。
2. 二级标题 + 段落：`"## Title\n\nBody\n"` → 同上。

Parser **SHOULD** 将无法识别语法降级为 paragraph/text，**MUST NOT** 静默丢弃（对齐 `adapter-protocol.md`）。

**理由：** 满足 MVP M3 验收而不侵入 M4 GFM 矩阵。

### 5. Plugin package 布局与命名

**选择：** 按 `docs/architecture/package-layout.md` 建立：

| Package                         | Path                                  | 职责                                          |
| ------------------------------- | ------------------------------------- | --------------------------------------------- |
| `@aether-md/plugin-remark`      | `packages/plugins/plugin-remark`      | `ParserAdapter` + `SerializerAdapter` factory |
| `@aether-md/plugin-prosemirror` | `packages/plugins/plugin-prosemirror` | `EngineAdapter` factory                       |

每个 package **MUST** 提供 `build`、`typecheck`、`test` 脚本以接入 `pnpm check`。

**理由：** workspace 已声明 `packages/plugins/*`；与 compatibility 文档「Adapter 独立 SemVer」一致。

### 6. Round-trip 编排：测试与 thin helper，而非 `createEditor`

**选择：** M3 **不**实现 `createEditor`。Round-trip 由：

1. plugin package integration tests 直接组合 remark parser/serializer + prosemirror engine；
2. 可选 workspace 级 shared contract test fixtures（放在实现阶段决定，优先 plugin package 内集成测试）。

测试编排层在调用 `EngineAdapter.apply` 前保存 `AetherDoc` 快照；失败时断言快照未被污染（对齐 `adapter-protocol.md` 回滚语义，在 M3 由**调用方测试 harness** 实现，而非 Core Command Bus）。

**理由：** `createEditor` 依赖 bootstrap、Guard、Shell，属于 M5 前后里程碑；M3 只验证 Adapter 协议本身。

### 7. `EngineAdapter.apply` 最小事务

**选择：** M3 定义最小 `AdapterCommandRequest` 形状（实现阶段可命名如 `{ type: 'replaceText', blockIndex, text }` 或等价），`plugin-prosemirror` **MUST** 支持至少一种会改变 `AetherDoc` 的 apply 路径并返回成功 `AdapterTransactionResult`（`ok: true`, `doc` 为最新快照）。

失败路径：**MUST** 返回 `ok: false` + `AdapterError`，且 session 内 `getDocument` 仍返回 apply 前快照。

**理由：** M3 验收要求「可编辑文档状态」，不限于只读 parse/serialize。

### 8. 错误模型：M3 最小 `AdapterError` / `SerializationError`

**选择：**

- `AdapterError`：`source: 'adapter'`, `severity: 'recoverable'`，可实例化类，与 M1/M2 `CoreError` / `PluginError` 模式一致。
- `SerializationError`：`source: 'serialization'`, `severity: 'degraded'`；M3 Serializer **MAY** 对无法序列化节点返回 error 而非占位符（完整 `[unsupported:block]` 策略留 M4）。
- Adapter 内部异常 **MUST** 转换为 `AdapterError`，不向宿主抛出（对齐 `adapter-protocol.md`）。

**理由：** 对齐 `docs/engineering/error-model.md`；M3 不测 Render 层。

### 9. 包边界：允许 M3，禁止 M4/M5

**选择：** 修改 `core-bootstrap` spec：`@aether-md/core` **MAY** export document-model 与 adapter-base 类型/错误；**MUST NOT** export `createEditor`、`AetherEditor`、`EditorContext`、React Shell API、GFM preset API。

M2 Command/Event surface 保持不变。

**理由：** 与 M2 修改 `core-bootstrap` 的模式一致。

### 10. 不集成 `bootstrapCore` 与 `core:engine` / `core:parser`

**选择：** M3 plugin package **不**要求被 `bootstrapCore` 加载；不在 Core 内 silent provide Adapter-backed capabilities。Capability 注册与 bootstrap 集成留给后续 `add-editor-bootstrap` 或类似 change。

**理由：** 用户 scope 明确排除 deep integration；M1 已定义 missing provider → fatal error，提前集成会扩大 M3 到 lifecycle/Manifest 合并。

### 11. Contract tests 位置

**选择：**

- `@aether-md/plugin-remark`：unit/contract tests for `parse` / `serialize`。
- `@aether-md/plugin-prosemirror`：unit/contract tests for `create` / `apply` / `getDocument` / `dispose` / failure snapshot。
- Cross-package round-trip integration test **SHOULD** 位于 `@aether-md/plugin-prosemirror` 或独立 test 模块（devDependency 引用 remark package），**MUST NOT** 放入 `@aether-md/core` 的生产依赖。

- `@aether-md/core`：package-boundary tests + document/adapter 类型 shape tests（无 Remark/PM 运行时依赖）。

**理由：** 对齐 `docs/engineering/test-strategy.md`「Adapter 实现 SHOULD 共用 contract tests」精神，同时保持 Core 纯净。

## Risks / Trade-offs

- [`AetherSchema` 仅为占位] → M4 compile-layer change 扩展 schema；M3 spec 明确 `version: 1` only。
- [M3 语法子集小于 document-model v1.0 全集] → delta spec 写明测试矩阵；类型导出可超前于测试覆盖。
- [Remark/PM 依赖体积] → 隔离在 plugin package；Core bundle 不受影响。
- [无 `createEditor` 时的 round-trip 编排] → integration tests 显式 wiring；不在 Core 隐藏魔法。
- [回滚由测试 harness 而非 Command Bus 实现] → design/spec 明确 M3 不自动 emit `transactionFailed`；M5+ 再集成。
- [document-model 开放问题未关闭] → 记录为 Open Questions，不阻塞 M3。

## Migration Plan

- 无已发布消费者。
- 回滚：移除 core document/adapter exports、删除 plugin packages、恢复 package-boundary 断言。
- 实现顺序建议：`AetherDoc` types → Adapter interfaces/errors → `plugin-remark` → `plugin-prosemirror` → round-trip tests → core boundary tests → `pnpm check`。

## Public Contract Impact

**新增（`@aether-md/core`）：**

- Types：`AetherDoc`, `AetherBlock`, `AetherInline`, `AetherSchema`, `ParagraphBlock`, `HeadingBlock`, `TextInline`, …（document-model spec 枚举）
- Adapter：`ParserAdapter`, `SerializerAdapter`, `EngineAdapter`, `EngineSession`, `AdapterCommandRequest`, `AdapterTransactionResult`, `AdapterEvent`
- Errors：`AdapterError`, `SerializationError`

**新增（plugin packages）：**

- `@aether-md/plugin-remark`：remark parser/serializer factory（具体 export 名在实现 task 中固定，OpenSpec 只要求满足 `ParserAdapter` / `SerializerAdapter`）
- `@aether-md/plugin-prosemirror`：prosemirror engine factory（满足 `EngineAdapter`）

**保留不变：**

- `bootstrapCore`、M2 Command/Event runtime 语义。
- `SUPPORTED_MANIFEST_VERSIONS`。
- M1 follow-up 行为裁决。

## 架构边界检查

- 符合「适配器埋葬依赖」（`docs/architecture/principles.md`）。
- Core 仍不直接依赖 Remark/ProseMirror；符合 ADR 003 双轨。
- 不违反「命令通达天下」精神：M3 编辑通过 `EngineAdapter.apply` 显式事务，而非 DOM 直连；Command Bus 集成延后。
- 不反向已接受 ADR；无需新 ADR，除非实现中发现必须改变 Schema 合并策略。

## 测试策略

遵循 `docs/engineering/test-strategy.md`。M3 **必测**：

- `parse` 返回合法 `AetherDoc`（paragraph、heading 样例）。
- `serialize` 对 M3 内置结构确定性输出。
- `EngineAdapter.create` / `getDocument` / `dispose`。
- `apply` 成功返回新 `doc` 快照。
- `apply` 失败不污染 apply 前 `getDocument` 快照；返回 `AdapterError`。
- `dispose` 可安全重复或明确拒绝（实现任选，须可测）。
- `@aether-md/core` package-boundary：允许 M3 exports；禁止 `createEditor`、Shell、GFM preset、Remark/ProseMirror **实现** re-export。
- Cross-package round-trip（paragraph + heading 样例）。
- `pnpm check` 通过。

M3 **不测**：

- GFM 全矩阵 round-trip、Permission 拒绝、Command handler 自动 rollback。
- `bootstrapCore` 加载 Adapter、`core:engine` provides。
- `createEditor` / React Shell。

## Open Questions

以下项 **不阻塞** M3 OpenSpec，但应在 implementation plan 或 follow-up change 中跟踪：

| 问题                                          | 来源                  | M3 处理                                       |
| --------------------------------------------- | --------------------- | --------------------------------------------- |
| 是否为所有节点引入稳定 `id`                   | `document-model.md`   | 不引入；M3 `AetherDoc` 无 `id` 字段           |
| 自定义块 Markdown fallback 是否由插件声明     | `document-model.md`   | 不测 `CustomBlock` round-trip                 |
| `meta` 是否允许插件命名空间写入               | `document-model.md`   | `meta?` 类型保留；M3 测试不写入               |
| Adapter 是否声明能力矩阵                      | `adapter-protocol.md` | 不实现                                        |
| 是否需要 `SelectionAdapter`                   | `adapter-protocol.md` | 不实现                                        |
| Adapter 调试私有快照                          | `adapter-protocol.md` | 不暴露                                        |
| `AdapterCommandRequest` 的稳定命令 vocabulary | 本 design             | M3 最小一种 edit 命令；完整 vocabulary 留 M4+ |
| Shared contract test package 是否提取         | `test-strategy.md`    | 实现 task 决定；默认 plugin 内集成测试        |

## Follow-up Changes（若 scope 膨胀则拆分）

当前 scope 可在一个 change 内完成。若 implementation 中发现以下项必需，应拆分为独立 change：

- `add-editor-bootstrap`：`bootstrapCore` + Adapter plugin 加载 + `core:engine` / `core:parser` provides。
- `add-command-adapter-integration`：Command Bus dispatch → EngineAdapter.apply + rollback + `transactionFailed`。
- `add-gfm-preset`：M4 preset package 与完整 syntax round-trip。
