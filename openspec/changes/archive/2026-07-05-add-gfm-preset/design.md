## Context

M3 已在 `@aether-md/core` export 框架无关 `AetherDoc` 与三类 Adapter 协议；`@aether-md/plugin-remark` / `@aether-md/plugin-prosemirror` 验证 paragraph/heading 最小 round-trip。扩展类型（`ListBlock`、`LinkInline`、`MarkedInline`）已 export，但 M3 实现将 list/link/mark **降级**为 plain text 或 JSON paragraph，不满足 M4 GFM 语义。

M4 目标：建立 `@aether-md/preset-gfm`，扩展 Adapter 实现与测试，满足 `docs/engineering/test-strategy.md` 六类语法 round-trip，并闭合 `SerializationError` 占位符策略（M3 deferred）。

约束（来自 ADR 003 与 M3 边界）：

- Remark 负责 parse/serialize；ProseMirror 负责编辑事务；`AetherDoc` 为中转契约。
- `@aether-md/core` **MUST NOT** 直接依赖 Remark、ProseMirror、React。
- Round-trip **MUST NOT** 依赖 `createEditor`、`bootstrapCore` Adapter 加载或 React Shell。
- M2 Command/Event runtime **MUST** 保持独立。
- 说明性正文使用中文；API 名称、包名、路径与 OpenSpec 结构关键词保持 English。

## Goals / Non-Goals

**Goals:**

- 建立 `packages/preset-gfm`（`@aether-md/preset-gfm`）及 Manifest/factory 公开面。
- `@aether-md/plugin-remark` 结构化 parse/serialize GFM 六类语法。
- `@aether-md/plugin-prosemirror` 扩展 PM schema/conversion，使 `getDocument` 在 GFM fixture 上保留 list/link/mark。
- Cross-package integration tests 覆盖六类语法 round-trip（含最小编辑 leg）。
- 实现 `SerializationError` 策略：`CustomBlock` → 占位符；schema 外/不可序列化 inline → reject `SerializationError`。
- 更新 core package-boundary：允许 workspace 存在 preset package；Core export 仍禁止 editor/Shell/GFM 实现。
- M3 paragraph/heading round-trip **MUST** 保持 green。

**Non-Goals:**

- M5 `createEditor` / `AetherEditor` / React Shell / GateLock。
- Command Bus 自动 rollback、`transactionFailed` auto emit、`gfm:*` command 注册。
- `bootstrapCore` Adapter plugin 加载、compile-layer Schema 合并、ConflictResolver。
- `CustomBlock` round-trip、嵌套列表、表格、代码块、图片、任务列表、删除线。
- Worker Thread、Command Queue、Permission 沙盒、Telemetry。
- 长期 Docs 大改（archive 后 sync）。

## Decisions

### 1. 新增 capability `gfm-preset` + 修改 `document-model` / `adapter-base` / `core-bootstrap`

**选择：** Preset 作为独立 package/capability；文档类型与 Adapter 行为分别在既有 capability 上 MODIFIED/ADDED。

**理由：** 与 M3「document-model 类型面 + adapter-base 实现面」分离模式一致；`core-bootstrap` 仅更新 boundary，不引入 editor 入口。

### 2. Preset package 职责：Manifest + factory + GFM integration tests

**选择：** `@aether-md/preset-gfm` 提供：

| 职责              | 说明                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Manifest          | `metadata.name: gfm`，`manifestVersion: 1`，声明对 remark/prosemirror adapter 的 dependsOn（文档化，M4 不通过 bootstrap 加载） |
| Public factory    | 例如 `createGfmPreset()` 返回 `{ manifest, schema }` 或 wired adapter bundle（实现阶段定名）                                   |
| Integration tests | GFM round-trip 矩阵归属 preset package（devDependency 引用 plugin packages）                                                   |

语法实现 **MUST** 留在 `plugin-remark` / `plugin-prosemirror`；preset **MUST NOT** 复制 Remark/PM 逻辑。

**理由：** `package-layout.md` 将 preset 与 compile-layer 绑定；M4 先建立可验证 package 边界，compile-layer 仍 deferred。

### 3. GFM Markdown 字面量规范（golden strings）

**选择：** M4 Serializer **MUST** 输出以下确定性形式：

| 结构           | 输出形式                              |
| -------------- | ------------------------------------- |
| Strong         | `**text**`                            |
| Emphasis       | `*text*`                              |
| Unordered list | `- item\n`（item 为单 paragraph）     |
| Ordered list   | `1. item\n`                           |
| Link           | `[text](href)`（省略 `title` 当为空） |
| Heading        | 沿用 M3：`#` repeat + space + text    |
| Paragraph      | 沿用 M3：text + `\n`，块间 `\n\n`     |

M4 integration tests **MUST** 使用上述 golden strings。Parser **SHOULD** accept common GFM variants（`*`/ `_` for emphasis）但 round-trip 断言以 Serializer 输出为准。

**理由：** 消除 `* vs _` 歧义；测试可重复。

### 4. `AetherDoc` 类型面：M4 不修改 Core public types

**选择：** M4 **不**修改 `@aether-md/core` 中 `AetherDoc` / block / inline 类型定义；仅要求 Adapter 产出/消费已有 `ListBlock`、`LinkInline`、`MarkedInline` 形状。

**理由：** M3 已 export 完整 v1.0 内置类型；M4 补语义与测试，非类型 breaking change。

### 5. Remark GFM 解析

**选择：** `@aether-md/plugin-remark` 引入 GFM 解析能力（例如 `remark-gfm` 或等价 mdast 转换），将 mdast 映射为：

- `list` → `ListBlock`（`ordered` flag；M4 仅单层 item，item 内单 `paragraph`）
- `link` → `LinkInline`
- `strong` / `emphasis` → `MarkedInline`（`mark: 'strong' | 'emphasis'`）
- 保留 M3 paragraph/heading 路径

无法识别语法 **SHOULD** 仍降级为 paragraph/text（非 GFM 扩展），**MUST NOT** 静默丢弃。

### 6. ProseMirror Engine schema 扩展

**选择：** `plugin-prosemirror` 扩展 PM schema：

- Nodes：`bullet_list`、`ordered_list`、`list_item`（或等价）映射 `ListBlock`
- Marks：`strong`、`emphasis`、`link`（`href` attr）映射 `MarkedInline` / `LinkInline`

`aetherDocToPm` / `pmToAetherDoc` **MUST** 往返 GFM fixture 结构。M4 edit leg 仍使用 M3 `replaceText`；apply 后 `getDocument` **MUST** 保留未编辑块上的 list/link/mark 结构。

**备选：** 仅 parse/serialize 不测 edit leg。否决：`test-strategy.md` 要求 round-trip 含 apply。

### 7. `SerializationError` 与占位符策略

**选择：**

| 节点                              | Serializer 行为                                                                                                             |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| GFM 六类 + paragraph/heading/text | 确定性 Markdown string（resolve）                                                                                           |
| `CustomBlock`                     | resolve `[unsupported:block:<name>]\n`（degraded，不 throw）                                                                |
| 未知 block/inline 类型            | reject `Promise` with `SerializationError`（`code: 'UNSUPPORTED_NODE'`, `source: 'serialization'`, `severity: 'degraded'`） |

`SerializerAdapter` 签名保持 `Promise<string>`；错误通过 **rejection** 表达，不扩展 result 类型。

**理由：** 对齐 `adapter-protocol.md`「SerializationError OR 占位符」；`error-model.md` deferred `[unsupported:block]` 在 M4 闭合；与 M3 export 的 error class 一致。

### 8. Round-trip 编排：显式 wiring，非 `createEditor`

**选择：** 与 M3 相同——integration tests 直接组合 remark parser/serializer + prosemirror engine；可选通过 `@aether-md/preset-gfm` factory 获取统一 schema/fixtures。

**理由：** M5 才引入 `createEditor`；M4 只验证 GFM + Adapter 管道。

### 9. M3 测试迁移

**选择：** 更新 `plugin-remark` parser test「list 降级为 paragraph text」→ 改为断言 `ListBlock` structured parse；保留「未知非 GFM 语法降级」场景（与 GFM list 区分）。

**理由：** M4 结构化 parse 是预期演进；避免 contradictory tests。

## Risks / Trade-offs

- [GFM 变体输入 vs 固定 Serializer 输出] → Parser 宽容、Serializer 固定；测试 assert Serializer golden strings。
- [Engine schema 与 Remark 映射不一致] → 共享 GFM fixture `AetherDoc` JSON 作为 contract test 中间断言。
- [SerializationError rejection vs 宿主 M5 `getMarkdown()` 错误处理] → M4 仅测 Adapter/preset 层；M5 design 再定义宿主捕获。
- [remark-gfm 依赖体积] → 隔离在 `plugin-remark`；监控 `principles.md` Gzip budget（实现阶段）。
- [单层列表限制] → 在 spec 中 explicit；嵌套列表 deferred，避免 scope creep。

## Migration Plan

1. 建立 `packages/preset-gfm` scaffold（`build` / `typecheck` / `test`）。
2. 扩展 `plugin-remark` parse/serialize + unit tests。
3. 扩展 `plugin-prosemirror` schema/conversion + unit tests。
4. 添加 preset 或 prosemirror 包内 GFM integration tests。
5. 更新 M3 parser tests（list 行为）。
6. 更新 core boundary tests（如需要 workspace 文档化）。
7. `pnpm check` + `openspec validate add-gfm-preset --strict`。

Rollback：revert branch；无 published package 迁移负担。

## Open Questions

- `createGfmPreset()` 公开 API 精确形状（仅 manifest vs bundled adapters）——implementation 阶段在 preset package 内定稿，须满足 boundary tests。
- Ordered list 多 item 样例是否纳入 M4 最小矩阵——建议至少 2 items single-level。
- `LinkInline.title` 非空时 Serializer 是否输出 `title` 属性——M4 建议 omit title 于 round-trip 矩阵，title 保留 parse-only。
