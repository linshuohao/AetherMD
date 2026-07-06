## Context

AetherMD 架构原则声明 **UX-Driven**：Instant Morphing、Block Focus、零延迟输入是审判标准。M1–M6 验证了微内核、Adapter 隔离、GFM round-trip、React Shell 挂载；M5 技术选型为 **常驻 ProseMirror `EditorView` + `core:replaceText` 同步**，属于集成证明路径，**不等同**于产品交互愿景。

复盘文档 `essays/product-delivery/01-mvp-intent-vs-architecture-proof.md` 已指出：MVP 执行偏「架构验证套件」。本 change **不否定** M1–M6 成果，而是 **补齐缺失的产品规格层**，防止继续用 `react-basic` 冒充产品 demo。

## Goals / Non-Goals

**Goals:**

- 发布《产品交互体验设计规范》作为 `principles.md` 引用的权威文档。
- 冻结 **块双态模型**（rendered ↔ source）与 **Block Focus** 状态机语义（文档 + OpenSpec）。
- 建立 **north star 分层**：Phase 0 interim shell vs Product morphing target。
- 为 follow-up 实现 change 提供验收场景与边界（插件 / Shell / Adapter 职责）。

**Non-Goals:**

- 本 change 不写 morphing 运行时代码。
- 不修改 `AdapterCommandRequest` 或 Core Command 词汇表（留给实现切片）。
- 不删除 M5 React Shell 或 view-bridge。

## Decisions

### 1. 产品 north star = Block Morphing，不是「PM 富文本 + 下方 preview」

**选择：** 产品交互 north star 定义为：

- **非聚焦块**：显示 **渲染态**（用户感知为 WYSIWYG）。
- **聚焦块（Block Focus）**：该块 **即时 morph** 为 **Markdown 源码编辑态**（光标所在块显示 `**bold**` 等源码）。
- **失焦**：块 morph 回渲染态；文档经 Command Bus 更新。

**理由：** 与 `principles.md` Instant Morphing / Block Focus 一致；区别于 Notion 式常驻富文本或分屏 preview。

**备选：** 继续以常驻 ProseMirror 为 north star。**否决：** 与已声明愿景相反；会导致实现与原则永久分叉。

### 2. M5 React Shell 定性为 Phase 0 interim integration shell

**选择：** `AetherEditorRoot` + `AetherEditorContent` + view-bridge 标注为 **Phase 0**：验证 `createEditor` → DOM → Command → serialize 管线。文档与 `react-shell` spec **ADD** 约束说明其 **MUST NOT** 被表述为产品终态。

**理由：** 保留现有 CI 与 demo 投资；避免「推翻 M5」的叙事混乱。

### 3. 块交互 primarily 插件化，Core 保持业务盲区

**选择：**

| 层 | 职责 |
| --- | --- |
| Core | Command Bus、Event Hub、块 id / 文档快照；**不**理解 Markdown 渲染语义 |
| Preset / 块插件 | 块类型 schema、rendered 视图、source 编辑表面（或委托 Adapter） |
| Engine Adapter | 事务应用；PM 仅在 Adapter 内 |
| React Shell | 块 focus 状态机、挂载块 surface、GateLock；**不**内嵌 GFM 语义 |

**理由：** 对齐原则「语义与交互皆可插件化」与 ADR 001 微内核。

### 4. North star 验收分层

**选择：**

| 层级 | 载体 | 验收 |
| --- | --- | --- |
| L1 架构管线 | `examples/react-basic` | 连续编辑 GFM 子集、GateLock、preview 同步（已有） |
| L2 产品 north star | 未来 `examples/block-morphing`（名待定） | 块聚焦显示源码、失焦渲染、零分离 preview 栏 |

**理由：** Demo Slice 程序已闭合 L1；L2 需新 change，避免 scope creep。

### 5. 实现切片顺序（follow-up，本 change 仅记录）

1. **Slice A**：单段落块 morphing MVP（rendered ↔ source）
2. **Slice B**：GFM inline marks 在 source 态编辑保真
3. **Slice C**：多块文档 + Block Focus 切换
4. **Slice D**：列表/链接等块类型插件化

## Risks / Trade-offs

| 风险 | 缓解 |
| --- | --- |
| 团队误以为纠偏 = 立刻废弃 PM 壳 | 文档明确 Phase 0 保留至 Slice A 可替代 |
| 规格过大导致 again 只写不做 | 本 change 仅文档+spec；Slice A 单独 change + 硬验收 |
| `interactiveRenderers` 草案与实现差距 | spec 引用 Manifest 钩子，实现切片再细化 API |
| Core 被拉去写 morphing 逻辑 | design 冻结 Core 边界；review 拦截 |

## Migration Plan

1. 本 change merge：文档 + OpenSpec delta + main spec sync（archive 时）。
2. 更新 `react-basic` README：标明「架构验证 demo」。
3. 启动 `block-morphing-slice-1`（或等价）Full Change：实现 Slice A。
4. M7 publish 门禁：产品 north star **L2** 至少 Slice A 可演示（维护者 sign-off）。

## Open Questions

- Slice A 的 source 编辑表面：纯 `textarea`、CodeMirror 子集，还是 PM 仅作 Adapter 内部实现？**留给 slice-1 design。**
- 块 id 是否进入 `AetherDoc` 公开模型？**留给 slice-1，倾向稳定 block key。**
- Vue Shell 是否并行？**Non-goal until React slice 证明。**
