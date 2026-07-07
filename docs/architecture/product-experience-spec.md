# 产品交互体验设计规范 (Product Experience Specification)

> 状态：初版 · 2026-07 · 纠偏 change `align-instant-morphing-north-star`  
> 权威层级：与 [架构原则](principles.md) 同级的产品交互契约；架构与工程文档 **SHOULD** 引用本页，而非重复定义 UX 规范。

## 目的

本规范定义 AetherMD **产品 north star** 的可验收交互行为。  
[架构原则](principles.md) 声明 **体验定义架构 (UX-Driven)**：技术分层的审判标准是是否达成下文三项体验。本页将三项体验落实为 **可测试场景**。

## 三项核心体验

| 体验                                 | 含义                                       | 用户可感知                                     |
| ------------------------------------ | ------------------------------------------ | ---------------------------------------------- |
| **Instant Morphing（即时形态转换）** | 块在 **渲染态** 与 **源码态** 之间即时切换 | 聚焦块时看到 Markdown 源码；失焦后看到排版结果 |
| **Block Focus（块级独立）**          | 任意时刻最多一个块处于源码编辑态           | 编辑集中在当前块，其他块保持渲染态             |
| **零延迟打字**                       | 输入无感知卡顿；caret 不因整页重建而漂移   | 连续打字手感接近原生输入                       |

## 块双态模型

每个可编辑块有两种呈现态：

### Rendered state（渲染态）

- 用户看到 **排版结果**（粗体、列表、链接等），**不**显示 Markdown 标记符。
- 文档处于「阅读 / 浏览」感知，但仍可点击聚焦。

### Source state（源码态）

- 用户看到该块的 **Markdown 源码**（例如 `**bold**`、`- item`）。
- 光标在该块内编辑；编辑经 Command Bus 提交后更新 `AetherDoc`。

### Morph 规则

1. **聚焦块** → 该块 **MUST** 从 rendered morph 到 source（Instant Morphing）。
2. **失焦块**（焦点移到其他块或取消焦点）→ 该块 **MUST** morph 回 rendered，且保留已提交内容。
3. Morph **MUST NOT** 通过销毁并重建整个编辑器实例完成。
4. Morph **MUST NOT** 依赖单独的「预览面板」才能看到源码——源码即聚焦块的编辑表面。

## Block Focus

- 全文档任意时刻 **最多一个** 块处于 source state。
- 焦点切换时：先前块先完成 rendered morph（或并行完成，但用户不得看到两块同时处于源码态）。
- 非聚焦块 **MUST NOT** 因其他块编辑而被重置。

### 验收场景（维护者 / CI 可对照）

**场景 A — 聚焦显示源码**

- **GIVEN** 文档含粗体段落 `Hello **world**`
- **WHEN** 用户聚焦该段落块
- **THEN** 编辑表面显示含 `**` 的 Markdown 源码
- **AND** 无独立 preview 栏亦可编辑源码

**场景 B — 失焦恢复渲染**

- **GIVEN** 段落处于 source state 且用户已编辑
- **WHEN** 焦点移开
- **THEN** 该块显示渲染后的排版
- **AND** 序列化 Markdown 与编辑一致

**场景 C — 单块源码态**

- **GIVEN** 多块文档
- **WHEN** 用户聚焦块 B
- **THEN** 仅块 B 为 source state，其他块为 rendered state

## 零延迟打字

以下视为 **违背 north star** 的缺陷（Phase 0 壳可存在，但不得标注为已满足本规范）：

- 每次按键触发整编辑器 remount
- caret 因全量 `updateState` 漂移
- 块内打字导致 unrelated 块内容重置
- 合法 inline 标记在块内编辑中被无声剥离（非语法错误场景）

## 分层职责（实现时遵守）

| 层                    | 职责                                                         | MUST NOT                      |
| --------------------- | ------------------------------------------------------------ | ----------------------------- |
| **Core**              | Command Bus、Event Hub、文档快照、块稳定标识（实现切片定形） | Markdown 渲染语义、morph 分支 |
| **Preset / 块插件**   | 块类型 schema、rendered 视图、source 编辑表面                | 绕过 Command Bus 写文档       |
| **Engine Adapter**    | 事务应用；PM 仅在 Adapter 内部                               | 泄漏 PM 类型到 Core           |
| **Shell（React 等）** | 块 focus 状态机、挂载块 surface、GateLock                    | 内嵌 GFM 语法逻辑             |

块类型行为 **SHOULD** 通过 Manifest `runtime.interactiveRenderers`（或后继契约）扩展，见 [Manifest](../sdk/manifest.md)、[CustomBlockRenderer](../sdk/custom-block-renderer.md)。

## North star 分层（与 demo 关系）

| 层级                   | 载体                      | 证明什么                                               | 是否等于本规范          |
| ---------------------- | ------------------------- | ------------------------------------------------------ | ----------------------- |
| **L1 架构管线 demo（模式）**   | `examples/react` (`content`)    | React Shell + GFM + GateLock + 连续编辑 + probes 同步 | **否** — Phase 0 集成壳 |
| **L2 产品 north star（模式）** | `examples/react` (`morphing`) | Instant Morphing + Block Focus（Slice A–D）            | **是**                  |

L1 有价值，**不得**在 README 或对外叙事中冒充 L2。

## Phase 0 interim shell（当前实现）

M5 `@aether-md/react` + 常驻 ProseMirror `EditorView` + 下方 Markdown preview 属于 **Phase 0 集成壳**：

- 证明 `createEditor` → DOM → Command → serialize 管线
- **不是**本规范定义的产品终态
- 保留至 L2 Slice A 可替代编辑体验

详见 [MVP 实施计划](../engineering/mvp-implementation-plan.md)（**当前活跃**：Block Morphing Slice A–D）、[Demo Slice 交付计划](../engineering/demo-slice-delivery-program.md)（L1 历史记录，已闭合）。

## 实现切片（规划，非本页范围）

| 切片    | 范围                                    |
| ------- | --------------------------------------- |
| Slice A | 单段落块 rendered ↔ source morphing MVP |
| Slice B | GFM inline marks 在 source 态保真       |
| Slice C | 多块 + Block Focus 切换                 |
| Slice D | 列表 / 链接等块插件化                   |

实现 change：`block-morphing-slice-1`（已归档）、`block-morphing-slice-b`（已归档）、`block-morphing-slice-c`（已归档）、`block-morphing-slice-d`（已归档）。

## 相关文档

- [架构原则](principles.md)
- [数据流](../engineering/data-flow.md)
- [路线图 — Slice 叙事](roadmap.md)
- [项目状态](../project-status.md)
- [复盘：MVP 意图 vs 架构证明](../../essays/product-delivery/01-mvp-intent-vs-architecture-proof.md)
