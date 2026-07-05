# 发布流程

> 状态：草案（[ADR 009](../adr/009-release-governance.md) M6 预备文档；M7 前不执行 npm publish）

## 范围

本文描述 AetherMD monorepo 从 Changesets 版本影响记录到 npm canary / `latest` 发布的流程。工具底座见 [ADR 008](../adr/008-repo-toolchain-baseline.md)；发布时间表与门禁见 [ADR 009](../adr/009-release-governance.md)。

## 阶段

| 阶段 | 动作 | 状态 |
| --- | --- | --- |
| M1–M5 | `pnpm changeset` 记录 public API 影响；不 publish | ✅ 已执行 |
| M6 预备 | `fixed`/`linked` 版本组、package 元数据、`LICENSE`、本文档 | 进行中 |
| M7 canary | `changeset pre enter canary` → CI `changeset version` → `changeset publish` | 未开始 |
| stable | promote dist-tag 至 `latest` | 未开始 |

## 发布包矩阵（M7 目标）

| Package | 发布 |
| --- | --- |
| `@aether-md/core` | 是 |
| `@aether-md/plugin-remark` | 是 |
| `@aether-md/plugin-prosemirror` | 是 |
| `@aether-md/preset-gfm` | 是 |
| `@aether-md/react` | 是 |
| `examples/*` | 否 |

## 维护者流程（M7 起）

1. 合入带 Changeset 的 PR 至 `main`。
2. Release workflow（待建）检测 pending changesets。
3. CI 运行 `changeset version`  bump 版本并更新 CHANGELOG（策略见 ADR 009 O3）。
4. CI 运行 `changeset publish` 发布至 npm（canary dist-tag）。
5. 发布记录写入 GitHub Release；migration note 随 breaking change 附 PR / CHANGELOG。

**禁止**：维护者本地 `npm publish`。

## 开放问题

见 [ADR 009](../adr/009-release-governance.md) O1–O3（首次版本号、dist-tag 命名、changelog 工具）。

---
