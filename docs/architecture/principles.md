# 架构原则与边界

> 状态：设计草案 + M1–M3 最小基座已实现。本页作为对应主题的维护入口。

## 愿景与核心哲学

AetherMD 是一个**交互驱动、框架无关、高度插件化**的下一代现代富文本 Markdown 引擎。它的存在旨在切断上层业务对前端 UI 框架及底层富文本内核的强绑定，让顶级、沉浸的书写体验能够以最高内聚的资产形式跨技术栈沉淀。

* **体验定义架构 (UX-Driven)**：一切技术分层、IoC 设计、生命周期划分，其最终审判标准均是且仅是：是否达成了产品层所定义的即时形态转换（Instant Morphing）、块级独立（Block Focus）与零延迟打字输入体验。
* **极致的内核纯净性 (Pure Microkernel)**：核心库（Core）保持业务盲区。内核不了解 Markdown 语法，不操作 DOM，不介入具体语义渲染。它只作为生命周期调度、命令总线与契约注入的通用底座。
* **依赖防御性 (Asset Preservation)**：引入 Adapter 机制对底层重型依赖（如 ProseMirror、Remark）进行完全容器化隔离，确保核心资产在未来 5~10 年内具备对抗依赖大版本升级冲击的技术免疫力。

*附：上层交互行为规范请参见《AetherMD 产品交互体验设计规范 (Product Experience Specification)》。*

---


## 架构最高宪章

1. **语义与交互皆可插件化**：Markdown 语法、交互菜单、快捷键、块级渲染器皆为可插拔插件。Undo / Redo、Selection、Clipboard 由内核内置托管。
2. **命令驱动意图，事件驱动观察**：Command 承载主动意图；Event 承载状态观察。
3. **命令通达天下** **MUST**：一切状态改变 **MUST** 通过 Command Bus 路由。
4. **内核业务盲区** **MUST**：内核 **MUST NOT** 理解具体 Markdown 语义。
5. **外壳组件可抛弃 (Framework is Disposable)**：React/Vue 外壳可整体替换而不伤及核心资产。
6. **适配器埋葬依赖** **MUST**：第三方依赖 API **MUST** 封装在 Adapter 内。
7. **声明式优先，命令式作为运行时补充**：Schema、Keymap、Commands 走 Manifest；生命周期钩子仅用于运行时副作用。
8. **数据不可变性**：单次 Transaction 内契约数据保持不可变。
9. **非必要不新增抽象** **MUST NOT**：新增抽象 **MUST** 证明解决已存在或高度确定的痛点。

---


## 业务边界与非目标

### In Scope

生命周期调度、Manifest 合并、Command Dispatcher、Event Hub、Adapter 隔离、框架外壳、内置状态机底座。

### Non-goals

* No Collaborative CRDT
* No Cloud Storage / DB
* No UI Widgets
* No AI Agent Logic

---


## 质量属性分级指标

| 质量属性维度 | 卓越 (Excellent) | 目标 (Target) | 红线 (Maximum) |
| --- | --- | --- | --- |
| 500KB 长文本加载延迟 | $< 80\text{ms}$ | $< 150\text{ms}$ | $< 200\text{ms}$ |
| 持续输入每帧打字延迟 | $< 8\text{ms}$ | $< 12\text{ms}$ | $< 16\text{ms}$ |
| 微内核冷启动体积 (Gzip) | $< 15\text{KB}$ | $< 25\text{KB}$ | $< 30\text{KB}$ |
| GFM 预设包整体体积 (Gzip) | $< 180\text{KB}$ | $< 220\text{KB}$ | $< 250\text{KB}$ |
| 10,000 次挂载销毁堆残留 | $0\text{B}$ | $0\text{B}$ | $< 100\text{B}$ |

---
