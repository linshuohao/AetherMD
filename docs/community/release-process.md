# 发布流程

> 本文描述 AetherMD monorepo 从 Changesets 版本影响记录到 npm 发布的流程；公开发布前 workspace 包保持 `private: true`。

## 范围

本文描述 AetherMD monorepo 从 Changesets 版本影响记录到 npm canary / `latest` 发布的流程。工具底座见 [ADR 008](../adr/008-repo-toolchain-baseline.md)；发布时间表与门禁见 [ADR 009](../adr/009-release-governance.md)。

## 发布阶段

| 阶段         | 动作                                                                                 | 就绪条件                                                                                  |
| ------------ | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| 版本影响记录 | `pnpm changeset` 记录 public API 影响；不 publish                                    | Changesets 工作流可用                                                                     |
| 发布预备     | `linked` 版本组、五包 publish 元数据、`LICENSE`、根 `changeset:publish` 脚本、本文档 | 五包 publish 元数据、`LICENSE`、Changesets `linked` 配置与根 `changeset:publish` 脚本就绪 |
| canary 发布  | ~~`changeset pre enter canary`~~ → CI `changeset version` → `changeset publish`      | **推迟至 v1.0.0**（ADR 009 Option C；跳过 canary，直接 `1.0.0` + `latest`）               |
| stable       | `1.0.0` + dist-tag `latest`                                                          | v1.0 能力矩阵与 demo sign-off 满足后启用 Release CI                                       |

## 发布预备完成项（不 publish）

当前仅完成 ADR 009 publish **预备**；五包仍为 `private: true`；**未**配置 `NPM_TOKEN`；**未**执行 `changeset publish`。

| 产物                         | 说明                                                                                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Changesets `linked` 五包** | `.changeset/config.json` 单组链接：`@aether-md/core`、`@aether-md/plugin-remark`、`@aether-md/plugin-prosemirror`、`@aether-md/preset-gfm`、`@aether-md/react` |
| **五包 publish 元数据**      | 各包 `license: "MIT"`、`repository`、`files`、`publishConfig`（`access: "public"`）                                                                            |
| **根 `changeset:publish`**   | 根 `package.json` 脚本 `"changeset:publish": "changeset publish"`（公开发布前仅预留，维护者 **禁止** 本地 `npm publish`）                                      |
| **`LICENSE`**                | 根目录 MIT 许可证；与各 package `license` 字段一致                                                                                                             |
| **`examples/headless-gfm`**  | `private: true`；**不**纳入 npm 发布矩阵                                                                                                                       |
| **`examples/react`**         | `private: true`；**不**纳入 npm 发布矩阵（content / morphing 统一 showcase）                                                                                   |

## 公开发布前置条件

在配置 `NPM_TOKEN` 或 `changeset pre enter` **之前**，维护者 **MUST** 确认：

1. **架构集成**：`examples/react` content 模式可演示；typing-sync CI 绿；浏览器 sign-off 已记录（若适用）。
2. **产品交互**：Instant Morphing MVP 可演示，满足 [产品交互体验规范](../architecture/product-experience-spec.md) 验收场景。
3. **工程**：ADR 009 G1–G12 就绪；`pnpm check` 绿；O1/O2 已决议。

详见 [实施范围 — 发布门禁](../engineering/mvp-implementation-plan.md)、[产品交互体验规范](../architecture/product-experience-spec.md)。

## 发布包矩阵

| Package                         | 发布 |
| ------------------------------- | ---- |
| `@aether-md/core`               | 是   |
| `@aether-md/plugin-remark`      | 是   |
| `@aether-md/plugin-prosemirror` | 是   |
| `@aether-md/preset-gfm`         | 是   |
| `@aether-md/react`              | 是   |
| `examples/*`                    | 否   |

## 维护者流程（公开发布起）

1. 合入带 Changeset 的 PR 至 `main`。
2. Release workflow（待建）检测 pending changesets。
3. CI 运行 `changeset version` bump 版本并更新 CHANGELOG（策略见 ADR 009 O3）。
4. CI 运行 `changeset publish`（或根 `pnpm changeset:publish`）发布至 npm（canary dist-tag）。
5. 发布记录写入 GitHub Release；migration note 随 breaking change 附 PR / CHANGELOG。

**禁止**：维护者本地 `npm publish`（公开发布准备期亦然，直至 Release CI 就绪）。

## 开放问题决议（ADR 009 O1–O4）

| ID  | 问题                                                              | 状态       | 决议                                                                                                                                                      |
| --- | ----------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O1  | 首次 npm 版本号（`0.x` vs `1.0.0` + 能力子集）                    | **已决议** | **`0.1.0`**（0.x 预稳定）；v1.0 差距见 [能力概览](../project-status.md#v10-能力差距)                                                                      |
| O2  | Canary dist-tag（`canary` vs `next`）                             | **已决议** | **`canary`**；维护者启用 publish 前执行 `pnpm changeset pre enter canary`                                                                                 |
| O3  | Changelog（`changelog: false` vs `@changesets/changelog-github`） | **已决议** | 公开发布前延续 `.changeset/config.json` 的 `changelog: false`；真正首次 promote 至 `latest` 前再选手写根 `CHANGELOG.md` 或 `@changesets/changelog-github` |
| O4  | MIT 许可证复核                                                    | **已决议** | 维持 MIT；无需为此单独开 ADR 改评 Apache-2.0                                                                                                              |

完整背景见 [ADR 009](../adr/009-release-governance.md) 开放问题表。首次 publish 前维护者 **MUST**：(1) 完成架构集成与产品交互 sign-off；(2) 配置仓库 `NPM_TOKEN` secret；(3) 按 ADR 009 决议启用 Release CI。

## Release CI

`.github/workflows/release.yml` 已配置 Changesets version + publish（含 consumer smoke），但 **v1.0.0 正式上线前不自动触发**。

| 阶段            | 触发方式                                           | 行为                                                                                        |
| --------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **当前**        | 不触发                                             | 合入 `main` 不运行 Release workflow；`pnpm changeset` 仍用于记录版本影响                    |
| **v1.0.0 上线** | 维护者手动 `workflow_dispatch` 或恢复 `push: main` | 若有 pending changeset 则开 version PR；合入后 `changeset publish` 至 npm（需 `NPM_TOKEN`） |

**禁止**：维护者本地 `npm publish`。

---
