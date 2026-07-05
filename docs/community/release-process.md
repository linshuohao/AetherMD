# 发布流程

> 状态：M6 publish 预备已完成（[ADR 009](../adr/009-release-governance.md)）；**M7 前不执行 npm publish**

## 范围

本文描述 AetherMD monorepo 从 Changesets 版本影响记录到 npm canary / `latest` 发布的流程。工具底座见 [ADR 008](../adr/008-repo-toolchain-baseline.md)；发布时间表与门禁见 [ADR 009](../adr/009-release-governance.md)。

## 阶段

| 阶段 | 动作 | 状态 |
| --- | --- | --- |
| M1–M5 | `pnpm changeset` 记录 public API 影响；不 publish | ✅ 已执行 |
| M6 预备 | `linked` 版本组、五包 publish 元数据、`LICENSE`、根 `changeset:publish` 脚本、本文档 | ✅ 已完成 |
| M7 canary | `changeset pre enter canary` → CI `changeset version` → `changeset publish` | 未开始 |
| stable | promote dist-tag 至 `latest` | 未开始 |

## M6 预备完成项（不 publish）

M6 仅完成 ADR 009 publish **预备**；五包仍为 `private: true`；**未**配置 `NPM_TOKEN`；**未**执行 `changeset publish`。

| 产物 | 说明 |
| --- | --- |
| **Changesets `linked` 五包** | `.changeset/config.json` 单组链接：`@aether-md/core`、`@aether-md/plugin-remark`、`@aether-md/plugin-prosemirror`、`@aether-md/preset-gfm`、`@aether-md/react` |
| **五包 publish 元数据** | 各包 `license: "MIT"`、`repository`、`files`、`publishConfig`（`access: "public"`） |
| **根 `changeset:publish`** | 根 `package.json` 脚本 `"changeset:publish": "changeset publish"`（M7 前仅预留，维护者 **禁止** 本地 `npm publish`） |
| **`LICENSE`** | 根目录 MIT 许可证；与各 package `license` 字段一致 |
| **`examples/headless-gfm`** | `private: true`；**不**纳入 npm 发布矩阵 |

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
3. CI 运行 `changeset version` bump 版本并更新 CHANGELOG（策略见 ADR 009 O3）。
4. CI 运行 `changeset publish`（或根 `pnpm changeset:publish`）发布至 npm（canary dist-tag）。
5. 发布记录写入 GitHub Release；migration note 随 breaking change 附 PR / CHANGELOG。

**禁止**：维护者本地 `npm publish`（M6–M7 过渡期亦然，直至 Release CI 就绪）。

## 开放问题决议（ADR 009 O1–O4）

| ID | 问题 | 状态 | 决议 |
| --- | --- | --- | --- |
| O1 | 首次 npm 版本号（`0.x` vs `1.0.0` + 能力子集） | **延后** | Demo 完善且维护者满意后再议；M7 预备阶段不锁定版本号 |
| O2 | Canary dist-tag（`canary` vs `next`） | **延后** | 与 O1 同批决定；启用 Release workflow 前再确认 |
| O3 | Changelog（`changelog: false` vs `@changesets/changelog-github`） | **已闭合** | M7 之前延续 `.changeset/config.json` 的 `changelog: false`；真正首次 promote 至 `latest` 前再选手写根 `CHANGELOG.md` 或 `@changesets/changelog-github` |
| O4 | MIT 许可证复核 | **已闭合** | 维持 MIT；无需为此单独开 ADR 改评 Apache-2.0 |

完整背景见 [ADR 009](../adr/009-release-governance.md) 开放问题表。O1/O2 延后期间：**不**执行 npm publish、**不**配置 `NPM_TOKEN`、**不** `changeset pre enter`。

---
