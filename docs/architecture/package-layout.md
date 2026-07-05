# 规范目录结构

> 状态：M1 Core Bootstrap 与 M3 Adapter plugin packages 已实现（MVP 子集）。本页作为包布局主题的维护入口。

## 规范目录结构

```text
aether-md/
├── docs/
│   ├── architecture/                # 架构文档
│   ├── sdk/                         # Plugin SDK
│   └── engineering/                 # 工程文档
├── packages/
│   ├── core/
│   ├── preset-gfm/
│   ├── react/
│   ├── vue/
│   └── plugins/
│       ├── plugin-prosemirror/
│       ├── plugin-remark/
│       └── ...
```

当前实现状态：

- `packages/core` 已建立为 `@aether-md/core`（M1 + M2 + M3 类型 export）。
- `packages/plugins/plugin-remark` 已建立为 `@aether-md/plugin-remark`（M3 Parser/Serializer）。
- `packages/plugins/plugin-prosemirror` 已建立为 `@aether-md/plugin-prosemirror`（M3 EngineAdapter）。
- `packages/preset-gfm`、`packages/react`、`packages/vue` 仍是规划项，尚未建立实现边界。

## 当前最小工程架子

M1 阶段只建立已经有真实职责的工程入口：

| 区域 | 当前状态 | 说明 |
| --- | --- | --- |
| 根 `package.json` | 已建立 | 作为 workspace 工具入口，提供稳定的 `pnpm build`、`pnpm typecheck`、`pnpm test`、`pnpm check` 和 Git 规范检查脚本 |
| `turbo.json` | 已建立 | 声明仓库级 task orchestration 基线，作为根命令背后的 Turborepo 实现细节 |
| `pnpm-workspace.yaml` | 已建立 | 声明 `packages/*` 与 `packages/plugins/*` 的未来 workspace 边界 |
| `packages/core` | 已建立 | 承载 `@aether-md/core`（M1 bootstrap、M2 Command/Event、M3 document/adapter types） |
| `packages/core/package.json` | 已建立 | 声明 ESM package、`exports` 与 types 入口；无 remark/prosemirror/react 依赖 |
| `packages/plugins/plugin-remark` | 已建立 | `@aether-md/plugin-remark`；Remark 依赖隔离在本 package |
| `packages/plugins/plugin-prosemirror` | 已建立 | `@aether-md/plugin-prosemirror`；ProseMirror 依赖隔离在本 package |

Turborepo 只负责调度已有 package 的同名脚本，不改变 package 边界、依赖方向、public API 或是否可发布。后续新增 package 必须提供 `build`、`typecheck`、`test` 同名脚本，才能接入根级 `pnpm build`、`pnpm typecheck`、`pnpm test` 和 `pnpm check`。

## 规划中但暂不建立空包

以下包属于 v1.0 路线图或长期生态方向，但在没有最小可验证职责前不建立空目录或空 package：

| 规划包 | 建立条件 |
| --- | --- |
| `packages/preset-gfm` | M4 GFM round-trip 与 compile-layer 需求明确后 |
| `packages/react` | `createEditor` / Shell 边界已被最小 Core API 和消费侧 smoke path 验证 |
| `packages/vue` | React Adapter 的边界已稳定，且 Vue 适配不需要改变 Core 语义 |

在这些条件满足前，不应为了“看起来像 monorepo”而提前创建空包。新增 package 必须先回答它的包类型、public API、依赖方向、OpenSpec 影响和验证方式，详见 [组件库治理规范](../engineering/component-library-governance.md)。

---
