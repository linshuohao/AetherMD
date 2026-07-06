# 01 · MVP 措辞没错，验收偏了

> 状态：初稿 · 2026-07  
> 主题：[产品与交付](./README.md)  
> 背景：M1–M6 里程碑闭合后的复盘

## 两种开发策略，不是二选一

项目早期常问：**先设计再一点点实现**，还是 **先做出能用的再优化**？

对 AetherMD 这类插件化、平台型编辑器，两种策略都有道理：

| 策略 | 适合什么 | 风险 |
| --- | --- | --- |
| 设计先行 | 边界清晰、契约长期有效、Adapter 隔离 | 盖很久才住人的房间 |
| 先能用再优化 | 快速验证手感、找真实痛点 | 架构债、边界被 ProseMirror/React 泄漏 |

复盘后的结论不是「选一边」，而是：**缺一条能亲手摸到的纵向切片**。

```
设计先行          ──→  地基（Core / Adapter / Preset / Shell）
先做出能用的      ──→  房间（浏览器里连续打字、选区、撤销）
                    ↑
              缺的是这条竖切，把两者连起来
```

M1–M6 把前者做得相当扎实；后者长时间不是里程碑的驱动轴。

## M1–M6 实际交付了什么

| 已有 | 对「效果」仍缺什么 |
| --- | --- |
| Core bootstrap、Command/Event、Adapter 基座 | 浏览器里「打开 → 打字 → 编辑 → 序列化」的完整体验 |
| GFM preset、六语法 round-trip | History / Selection / Clipboard |
| React Shell（Root / Content / hook、GateLock） | 以 demo 为 north star 的迭代节奏 |
| headless GFM 集成证明（Node） | 用真实使用驱动设计收敛 |
| OpenSpec / ADR / CI 门禁 | — |

「跑不了」需要说清楚含义：

- **能跑**：`examples/headless-gfm` 在 Node 里 parse → edit → serialize，打印 Markdown；测试与 CI 绿。
- **长期不像「编辑器」**：M6 之前验收重心不在「我在浏览器里打了 10 分钟字」；React Shell 主要在 happy-dom 集成测试里验证；`examples/react-basic` 在路线图上曾长期低于 headless 证明的优先级（后在 M6 末期补入，但 History 等体验能力仍未进里程碑）。

挫败感来自：**地基铺好了，能住人的房间来得太晚，且不是验收的硬条件。**

## 文档与代码的比例

按 2026-07 当前仓库的粗略统计，口径为：排除 `node_modules`；代码只计 `packages/` 与 `examples/` 下的 `ts/tsx`；文档只计工作区内 `md` 文件。大致规模如下：

| 类别 | 量级 |
| --- | --- |
| 实现代码（packages + examples 的 ts/tsx） | ~112 文件，~7,900 行量级 |
| 文档 + 规格 + 工作流产物（md） | ~384 文件，~41,000 行量级 |
| 其中 `.superpowers/` alone | ~129 文件，~18,000 行 |

按行数看，文档约为实现代码的 **5 倍**。这当然不等于「文档越多越差」，但它很能解释为什么体感上时间主要不花在 7k 多行代码本身，而花在 **文档、流程、横向铺层**。

这不等于「文档是浪费」——对平台型项目，契约文档是资产。但它说明：**投入体感**会被流程产物放大，若 north star 是「能用的编辑器」，比例就会显得失衡。

## MVP 目标 vs MVP 执行

| | |
| --- | --- |
| **MVP 目标措辞** | 没错——「最小可运行编辑器」 |
| **MVP 执行定义** | 偏了——做成了「最小可验证架构」 |
| **M6 验收重心** | CI 门禁、manifest 一致性、Changesets linked、headless 集成证明 |
| **未成为硬验收** | 「clone → install → dev → 浏览器连续编辑 GFM 10 分钟」 |

M5 做了 React Shell，M6 却先交付 headless example 作为集成证明的主叙事——**对架构验证合理，对「编辑器 MVP」顺序反了**。

已有 ~7,000 行代码 **不是白写**，是有效地基；问题在于 **什么算「完成一个里程碑」**。

## 如果重来：换验收标准，换切法

这里不是说旧验收标准没有价值，而是说它们更适合当 **护栏**，不适合继续充当唯一 north star。

**验收标准：**

```
旧：pnpm check 绿 + 各层测试通过 + OpenSpec archive
新：clone → pnpm install → pnpm dev → 浏览器里能编辑 GFM
     （再叠加 CI / spec / ADR，而不是替代）
```

**里程碑切法：**

```
❌ M1 Core → M2 Command → M3 Adapter → … → M6 Validation
✅ Slice 1: 浏览器能打字
   Slice 2: GFM 渲染与往返
   Slice 3: 插件 demo / 选区 / History …
```

横向铺层可以留在 **包边界** 里（Core 仍 Core、Adapter 仍 Adapter），但 **里程碑编号** 应按用户可感知能力纵向切，而不是按架构层横向切。

## 与设计先行工作流的关系

[AI-native 工作流 · 01 · 为什么需要 AI-native 工作流](../ai-native-workflow/01-why-we-built-an-ai-native-workflow.md) 里的假设仍然成立：Agent 需要约束与可追溯性。

本节的修正不是「不要工作流」，而是：

1. **North star 必须是可摸到的 demo**，否则工作流只是在高效地生产架构证明。
2. **设计跟着 demo 收敛**，不要超前展开 compile-layer、完整 examples matrix 等 deferred 能力。
3. **用 demo 驱动重构**，而不是先重构再猜用户感受。

Full Change 九步对 **public contract 变更** 仍有价值；但对 **「把 react-basic 跑起来」** 这类交付物，更重要的是先把它纳入里程碑硬验收，再讨论要不要给它配同样厚的流程——见 [AI-native 工作流 · 05 · 工作流产物债务](../ai-native-workflow/05-workflow-artifact-debt.md)。

## 适用边界

- **平台 / 框架 / 插件 SDK**：设计先行 + 契约文档合理，但必须配 **最早可能的 vertical demo**。
- **产品功能迭代**：纵向切片应默认优于横向完善。
- **纯内部工具、无 public API**：可更激进地「先能用」；AetherMD 不属于此类。

## 小结

> **目标方向没错，真正偏掉的是“什么算交付完成”。** 把 MVP 做成「架构验证套件」并非没有价值，但它不该继续充当“最小可运行编辑器”的主要验收替身。

下一步优先级应是把 **demo 可感知** 重新放回最前面：先定义哪条纵向切片算“能用”，再让 workflow、spec 和 archive 去服务这条 north star，而不是反过来。

---

系列目录：[产品与交付](./README.md) · [随笔总索引](../README.md)  
相关主题：[AI-native 工作流 · 05 · 工作流产物债务](../ai-native-workflow/05-workflow-artifact-debt.md)
