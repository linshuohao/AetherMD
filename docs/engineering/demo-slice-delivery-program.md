# Demo Slice 交付计划（PR0 → PR A → PR B）

> 状态：**已闭合** · Demo Slice 程序（PR0 → PR A → PR B）于 2026-07-06 完成  
> PR B change：`demo-slice-workflow-retention`（workflow 沉淀 + retention 范例）  
> 来源复盘：[随笔 · 产品与交付](../../essays/product-delivery/01-mvp-intent-vs-architecture-proof.md)、[随笔 · AI-native 工作流 · 05](../../essays/ai-native-workflow/05-workflow-artifact-debt.md)

## 目的

M1–M6 闭合后，项目进入 **「纵向 demo 切片 + 轻量流程」** 阶段。本页是 **下一串 PR 的权威执行计划**，用于：

- 固定 PR0 / PR A / PR B 的边界，避免中后期再次横向铺层或误开 Full Change
- 区分 **「指导本次实现的文档」** 与 **「服务长期项目的规范」**
- 为 Agent 与维护者提供单一事实来源（**本页 + 各 PR 的 OpenSpec change**）

**本页负责「计划与阶段状态」**；具体 capability 要求以各 PR 的 OpenSpec delta 为准；长期 workflow 主规范在 PR B 之前 **不** 大改。

## 背景（一句话）

M6 验收偏 **架构验证**；下一阶段 north star 是 **`examples/react-basic` 成为可连续编辑 GFM 的可感知 demo**。workflow 主规范改动 **延后到 PR A 验证之后**（PR B），避免无证据的流程大修。

## 三阶段总览

```mermaid
flowchart LR
    PR0[PR0 前置文档<br/>Spec Change]
    PRA[PR A demo slice<br/>Spec Change 优先]
    PRB[PR B 长期沉淀<br/>Full Change]

    PR0 -->|冻结边界| PRA
    PRA -->|验证结论| PRB
```

| 阶段 | 目标 | 建议路径 | 状态 |
| --- | --- | --- | --- |
| **PR0** | 形成 PR A 的直接指导；不追求写完整个工程方法 | **Spec Change** | **已完成**（`demo-slice-react-basic-pr0`） |
| **PR A** | `react-basic` 成为可摸到的最小 GFM demo | **Spec Change**（必要时升级 Full） | **已完成**（`demo-slice-react-basic`） |
| **PR B** | 把 PR0+PR A 验证过的结论写回 roadmap / workflow / retention | **Full Change** | **已完成**（`demo-slice-workflow-retention`） |

### 原则

1. **无文档先开发** — PR A 必须在 PR0 评审通过、边界冻结后开始。
2. **不一上来重写 workflow** — workflow semantics 改动集中在 PR B。
3. **临时笔记不替代 PR0** — 讨论结论已沉淀为本页；PR0 仍产出可执行的 OpenSpec 薄规格。

## PR0：前置文档

### 唯一目标（一句话）

> **`examples/react-basic` 必须成为一个「可连续编辑 GFM」的最小可感知 demo。**

### 建议 OpenSpec change 名

`demo-slice-react-basic-pr0`（或等价 kebab-case；与 PR A 的 change 可同族不同目录，由维护者定）

### 工作流路径

- **默认：Spec Change**（`aether-workflow-create-spec-change` → `execute-spec-change`）
- **升级 Full Change 当且仅当** PR0 需要修改 workflow semantics、`openspec/specs/**` 主规范大段、或 Discover path rules 正文

### 验收标准（PR A 将逐条兑现）

维护者 **MUST** 能在本地完成：

1. `pnpm install`（仓库根）
2. `pnpm build`（或 PR0 文档声明的最小构建前置）
3. `pnpm --filter @aether-md/example-react-basic dev`
4. 浏览器打开 demo
5. **连续输入**普通段落
6. 编辑 GFM 中 **至少若干项**：标题、加粗、列表、链接（具体子集在 PR0 delta 中冻结）
7. 内容 **无 GateLock 回弹、无意外丢失**
8. 编辑结果 **稳定反映** 到 markdown 预览或等价可见状态（如 `useAetherEditor` 的 `markdown` 输出）

### 非目标（PR0 必须写死，PR A 不得顺手扩展）

- History / Selection / Clipboard
- 完整 toolbar 或富交互套件
- workflow 主规范全面改造（留给 PR B）
- Superpowers retention 入规（留给 PR B；可选并行 chore 不清规范）
- npm publish / M7 canary
- compile-layer merge、完整 ConflictResolver、PermissionGuard
- Vue Shell、examples matrix

### 允许改动范围（PR A 默认上限；PR0 可收紧不可无故放宽）

| 区域 | 说明 |
| --- | --- |
| `examples/react-basic/**` | 首选改动面 |
| `packages/react/**` | Shell 行为、GateLock、挂载修复 |
| `packages/plugins/plugin-prosemirror/**` | 仅当 demo 所需 view/edit 行为 |
| `packages/preset-gfm/**` | 仅当 demo 所需 GFM 路径 |
| 必要测试 | smoke / integration / example typecheck |
| 必要文档 | example README、本计划状态行 |

**PR0 应列出 Forbidden Files**（至少包含无关 packages、workflow skills、无关 openspec main spec）。

### 升级条件（PR A 执行中触发）

自 Spec Change **升级** Full Change，若出现任一：

- 修改 `openspec/specs/**` main spec 的 capability 语义（非 PR B 范围的同步）
- 修改 workflow semantics（Discover 规则、path ladder、skill 行为）
- 多个 **独立** capability 同时新增（非单一 demo slice）
- Core / React Shell **public export** 或 Manifest 契约变更
- 需要超过 **单 task 可完成** 且无法拆为独立后续 PR 的范围

升级时 **暂停**，先补 OpenSpec proposal/design 或拆 PR，**禁止** silent scope creep。

### PR0 最小产物

- change-brief / `proposal.md`（why、what、non-goals、source docs）
- 薄 `design.md` 或 delta spec（验收 scenario、allowed/forbidden files）
- **单个** Superpowers task（Spec Change 模式）
- 本页 **「当前阶段」** 更新为 PR0 进行中 / 已完成

### PR0 完成定义

- [ ] 维护者确认验收清单与非目标
- [ ] OpenSpec delta 可审查
- [ ] 本页 PR0 状态已更新
- [ ] **PR A 边界冻结** — 之后 PR A 仅允许偏差记录，不静默改 scope

## PR A：demo slice 实现

### 目标

在 PR0 冻结边界内，使 `react-basic` 满足 PR0 验收标准。

### 工作流路径

- 规划：**Spec Change**（可与 PR0 同 change 延续，或新 change `demo-slice-react-basic`）
- 实施中若触发 [升级条件](#升级条件-pr-a-执行中触发) → 升级 Full Change

### 执行步骤

1. **基线验证** — 记录当前 demo 能力缺口（附命令输出或简短表）
2. **失败验证优先** — 补最贴近用户体验的 smoke / integration（再写实现）
3. **单一 slice** — 只推进「连续编辑 GFM 可感知」
4. **逐条对照 PR0 验收清单** — 不满足不收
5. **完整验证** — `pnpm check` + 本 slice 专项验收
6. **偏差记录** — 与 PR0 假设不符处写入 deviation，供 PR B

### PR A 完成定义（硬）

- [x] 用户能打开 demo（`pnpm dev`）
- [x] 能 **连续编辑** 而不回弹/丢内容（CI：`demo-slice-pr0-acceptance`）
- [x] GFM **至少一组** 核心语法可稳定往返
- [x] 无明显「不像编辑器」的失真（CI 覆盖；建议本地 `pnpm dev` 确认）
- [x] `pnpm check` 通过
- [x] deviation 已记录
- [x] 本页 **当前阶段** 更新为 PR A 已完成

## PR B：长期文档与 workflow 沉淀

### 目标

仅收录 **PR A 已验证** 的结论；不写未经验证的推测。

### 工作流路径

- **Full Change**（预期触及 workflow semantics、roadmap 叙事、retention）

### 预期改动面（PR B 启动前可微调）

| 区域 | 内容 |
| --- | --- |
| `docs/architecture/roadmap.md` | 补充纵向 **Slice** 叙事（与 M1–M6 并存） |
| `docs/project-status.md` | 近期重点、M7 触发条件 |
| `docs/engineering/mvp-implementation-plan.md` | Slice 验收与 M7 关系 |
| `AI_NATIVE_ENGINEERING_WORKFLOW.md` | demo/example 类变更的路径与 retention |
| `openspec/specs/engineering-workflow/spec.md` | 经验证的 workflow requirements |
| `.skills/aether-workflow/` | Discover 降档、archive retention（若 PR A 证明必要） |
| `.superpowers/` | retention 规则落地；可选压缩已归档 change |
| `essays/product-delivery/` | 可选 `02-…` 复盘 PR A（非必须） |

### PR B 完成定义

- [x] 仅包含 PR A deviation / review 中 **已证实** 的条目
- [x] roadmap、project-status、workflow 说法一致
- [x] `pnpm skills:check` / `pnpm check` 通过
- [x] History / Selection / Clipboard 等 **明确进入后续 backlog**
- [x] 本页 **当前阶段** 更新为程序闭合

## 明确后置（本程序期间不做）

| 项 | 后置至 |
| --- | --- |
| M7 npm publish、O1/O2、Release CI | PR B 之后；且需 **demo + 维护者 sign-off**（见 [ADR 009](../adr/009-release-governance.md)） |
| History / Selection / Clipboard | PR B 之后独立 Slice |
| **真实打字同步**（`view-bridge` + `engine`；列表/块级 PM 输入 → markdown） | **已完成**（`demo-slice-typing-sync`，2026-07-06 归档）；CI `insertText` 路径已覆盖；**浏览器 sign-off** 仍为合并前/M7 前维护者责任 |
| compile-layer、完整 Guard 链 | demo 驱动；非本程序 |
| workflow 全面重写 | 禁止；仅 PR B 增量沉淀 |

## 产物归属（避免重复与漂移）

| 内容 | 权威位置 | 说明 |
| --- | --- | --- |
| **三阶段计划与阶段状态** | **本页** | 活跃执行计划 |
| PR0 / PR A 的 capability 与验收 | `openspec/changes/<change>/` | 薄 delta；PR A 实施后 archive |
| PR B 的 workflow 要求 | `openspec/specs/engineering-workflow/spec.md` | PR B 同步 |
| 为什么这样拆（复盘） | `essays/product-delivery/`、`essays/ai-native-workflow/` | 不替代本页 |
| 长期架构事实 | `docs/architecture/`、`docs/sdk/` | PR B 按需更新 |
| 执行记录 | `.superpowers/` | Spec Change 单 task；PR B 后 retention |

**规则：** PR0/PR A 不把长篇方法论写入 `essays/` 或 `AI_NATIVE_ENGINEERING_WORKFLOW.md`；PR B 之前不改 workflow 主规范正文。

## 防跑偏检查清单

每个 PR 合并前自问：

- [ ] 是否仍服务于 PR0 **一句话目标**？
- [ ] 是否触犯 PR0 **非目标**？
- [ ] 改动文件是否在 **允许范围** 内？
- [ ] 是否误开 **Full Change**（demo-only 改动）？
- [ ] 是否把 History / workflow 大修 / M7 **塞进当前 PR**？
- [ ] 验收是否包含 **`pnpm dev` 可感知路径**（PR A）？
- [ ] 长期规范是否 **抢跑**（应在 PR B）？

## 进度日志

| 日期 | 阶段 | 事件 |
| --- | --- | --- |
| 2026-07-06 | — | 采纳 PR0→PR A→PR B 方案；本页创建 |
| 2026-07-06 | PR0 | Spec Change `demo-slice-react-basic-pr0` 创建；baseline-record；PR A 边界冻结 |
| 2026-07-06 | PR B | `demo-slice-workflow-retention`：Discover 降档、Superpowers retention、归档 PR0/PR A |
| 2026-07-06 | follow-up | `demo-slice-typing-sync`：PM `insertText` → markdown CI 覆盖（paragraph/heading/list）；浏览器 sign-off 清单写入 `examples/react-basic/README.md` |
| 2026-07-06 | follow-up | `demo-slice-typing-sync` **归档**；typing-sync 完成；下一项：**History slice** 或 **维护者 `pnpm dev` demo sign-off**（M7 前） |

---

**程序已闭合（2026-07-06）。** Demo slice 程序 PR0→PR B 已闭合；**typing-sync follow-up 已归档（2026-07-06）**。下一 backlog：**History / Selection / Clipboard** 独立 slice，或先完成 **`examples/react-basic` 浏览器 sign-off**（M7 前）。详见 [项目状态](../project-status.md)。

归档索引：

- PR0：`openspec/changes/archive/2026-07-06-demo-slice-react-basic-pr0/`
- PR A：`openspec/changes/archive/2026-07-06-demo-slice-react-basic/`
- PR B：`openspec/changes/archive/2026-07-06-demo-slice-workflow-retention/`
- typing-sync：`openspec/changes/archive/2026-07-06-demo-slice-typing-sync/`
