# ADR 009: 发布与治理策略（M6 预备 / M7 首次发布）

| Field          | Value                                                                                 |
| -------------- | ------------------------------------------------------------------------------------- |
| **Status**     | Accepted                                                                              |
| **Date**       | 2026-07-05                                                                            |
| **Supersedes** | —                                                                                     |
| **Related**    | [ADR 008](008-repo-toolchain-baseline.md)（工具底座；publish 推迟至本 ADR 定义的 M7） |

**Context**

M5 React Shell 已落地，项目即将进入 M6 验证套件。`docs/project-status.md` 仍将 npm publish、canary、独立 Plugin SDK 包、Demo/examples、许可证与发布流程标为「尚未开始」。仓库已具备 Changesets 版本影响记录（ADR 008），但全部 workspace package 为 `private: true`，无 Release workflow 与 `NPM_TOKEN`。

需在 M6 启动前拍板以下取舍，避免验证套件、文档与发布工程各自漂移：

1. Canary 发布是否沿用 Changesets，何时启用。
2. Plugin SDK 是否独立为 `@aether-md/sdk` npm 包。
3. 许可证与 `docs/community/` 协作模型是否一致。
4. Demo / examples 最小形态。
5. v1.0 前必须 vs 可延后的发布门禁。

**术语**

| 术语   | 含义                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------- |
| **M6** | 验证套件：契约测试、示例插件、关键路径 CI（见 [MVP 实施计划](../engineering/mvp-implementation-plan.md)） |
| **M7** | 首次公开发布与生态：npm 发布、canary 通道、`examples/`、许可证文件落地、Release workflow                  |

**Decision**

1. **Canary 与发布（修订 ADR 008 的 publish 时间表，不替换工具底座决策）**
   - **M6**：只完成 publish **预备**（Changesets `fixed`/`linked`、package `repository`/`license`/`files`/`publishConfig`、根脚本预留 `changeset:publish`、起草 `docs/community/release-process.md`）。**不**执行 npm publish，**不**配置 `NPM_TOKEN`。
   - **M7**：启用 **Changesets prerelease + CI publish workflow** 作为 canary 通道（dist-tag 默认 `canary`）；稳定后 promote 至 `latest`。**CI 是唯一正式发布入口**；禁止本地手动发版。

2. **Plugin SDK 包边界**
   - **v1.0 前不**新建 `@aether-md/sdk` npm 包。
   - 插件契约类型继续从 **`@aether-md/core`** 导出；权威文档仍为 `docs/sdk/`。
   - 再评估独立 SDK 包的触发条件（任一满足）：compile-layer 插件需在不依赖 core 运行时的环境下构建；core 与 SDK 类型需不同 SemVer 节奏；消费侧明确要求仅 `peerDependencies: @aether-md/sdk`。

3. **许可证**
   - 项目采用 **MIT License**。
   - **M6 启动前**在仓库根添加 `LICENSE`，并同步 `CONTRIBUTING.md`、`docs/community/README.md`、各 public package 的 `license` 字段与 README。（根目录 `LICENSE` 已随 ADR 009 落地；package `license` 字段在 M6 预备同步。）

4. **Demo / examples 最小形态**
   - **`examples/headless-gfm`**（M6 交付）：Node 可运行脚本，`createEditor` + `createGfmPreset()`，无 UI。
   - **`examples/react-basic`**（M6 末或 M7 初）：最小 Vite + React，演示 `@aether-md/react` 与 GateLock。
   - 两者为 **workspace private package，不发布 npm**。
   - v1.0 前 **不做**：可发布 playground、Playwright 浏览器 CI、Vue examples、examples matrix。

5. **v1.0 发布门禁**
   - **必须在首次 `latest` 前完成（G1–G12）**：见 [Consequences](#consequences) 门禁表。
   - **M7 canary 产品 demo 前置（2026-07-06 拍板，方案 B）**：除工程门禁外，维护者 **MUST** sign-off **L1** `examples/react-basic`（架构管线）**与** **L2 Slice A**（单段落 Instant Morphing MVP，见 [产品交互体验规范](../architecture/product-experience-spec.md)）均可演示后，方可启用 Release CI / `NPM_TOKEN`。L1 通过不得解释为 L2 已满足。
   - **可延后（P1–P10）**：Playwright CI、markdown-link-check 自动化、PR 追踪自动化、完整 Guard 链、Vue Shell、`bootstrapCore` silent provide、examples matrix、Telemetry/Worker、独立 `@aether-md/sdk`、Changesets 自动 changelog（可改用手写 CHANGELOG）。
   - 路线图 v1.0「必须实现」与当前实现仍有差距（ConflictResolver 全套、History/Selection/Clipboard、完整 EditorContext、PermissionGuard）。首次 npm **MAY** 使用 `0.x` 预稳定系列或在 `1.0.0` 文档中明确「能力子集」——维护者在 M7 预备阶段从开放问题 O1 二选一。

**Trade-offs**

- _优点_：M6 聚焦契约验证不被 publish 分心；延续 Changesets 与 ADR 008 工具链；避免过早拆 SDK 包；headless + react-basic 覆盖主要集成路径且 CI 成本低；MIT 降低插件生态采用摩擦。
- _代价_：插件作者须安装 `@aether-md/core` 获取类型；canary 前外部无法 npm 安装；LICENSE 与 examples 仍待 M6 工程落地；路线图与 npm tag 语义需额外沟通。
- _放弃的方案_：M5 后立即 canary publish；v1.0 前独立 `@aether-md/sdk`；仅 Playground 无 headless 示例；Apache-2.0（专利条款更强但维护成本更高）；M6 同步启用 Release workflow。

**Consequences**

**对 M6**

- 交付 `examples/headless-gfm`；契约测试以 `@aether-md/core` 为类型源。
- 完成 LICENSE 与 publish 预备项（linked 版本组、package 元数据）。
- ci-checklist：`docs/sdk/examples.md` 或 `examples/*` 可 `tsc --noEmit`；`SUPPORTED_MANIFEST_VERSIONS` 与文档一致。

**对 M7**

- **产品 demo 前置**：L1 `react-basic` + L2 **Slice A** morphing MVP 维护者 sign-off（方案 B；见 [MVP 实施计划](../engineering/mvp-implementation-plan.md#m7-发布触发条件已拍板方案-b)）。
- 去除目标 package 的 `private: true`；配置 GitHub Actions release job 与 `NPM_TOKEN`。
- Consumer smoke：`pnpm pack` 后空项目 `import` 主入口。
- README 安装说明链接 `examples/`；canary 安装文档化（如 `npm i @aether-md/core@canary`）。

**必须在 v1.0 / 首次 `latest` 前完成的门禁**

| #   | 门禁                                                     | 阶段         |
| --- | -------------------------------------------------------- | ------------ |
| G1  | `LICENSE` 与 package `license` 字段                      | M6→M7        |
| G2  | 去除 `private: true`；`exports` + `types` 可消费         | M7           |
| G3  | Changesets `linked`/`fixed`；public API 变更有 changeset | M6 预备 / M7 |
| G4  | CI：`pnpm check` + `pnpm build` 绿                       | ✅ 已启用    |
| G5  | 契约测试关键路径                                         | M6           |
| G6  | `examples/*` 或 SDK examples 可 `tsc --noEmit`           | M6           |
| G7  | 包导出边界测试                                           | ✅ 持续      |
| G8  | Consumer smoke（`pnpm pack`）                            | M7           |
| G9  | README + docs 安装说明与 public API 一致                 | M7           |
| G10 | Release workflow 仅 CI 可 publish                        | M7           |
| G11 | `SUPPORTED_MANIFEST_VERSIONS` 与 SDK 文档一致            | M6           |
| G12 | 路线图 v1.0 差距在文档中显式标注                         | M6 审查      |

**开放问题（M7 预备阶段维护者确认）**

| ID  | 问题            | 选项                                                      | 状态                                                                   |
| --- | --------------- | --------------------------------------------------------- | ---------------------------------------------------------------------- |
| O1  | 首次 npm 版本号 | `0.x` 预稳定 vs `1.0.0` + 能力子集说明                    | **已闭合**（`0.1.0` 预稳定；能力子集见 `project-status.md` v1.0 差距） |
| O2  | Canary dist-tag | `canary` vs `next`                                        | **已闭合**（`canary`；启用前运行 `changeset pre enter canary`）        |
| O3  | Changelog       | 延续 `changelog: false` vs `@changesets/changelog-github` | **已闭合**（M7 前 `changelog: false`；首次 `latest` 前再定工具）       |
| O4  | MIT 复核        | 若有专利顾虑，单独 ADR 改评 Apache-2.0                    | **已闭合**（维持 MIT）                                                 |

决议详情见 [发布流程 — 开放问题决议](../community/release-process.md#开放问题决议adr-009-o1o4)。

**文档同步**

- `docs/sdk/overview.md`：类型入口 = `@aether-md/core`。
- `docs/project-status.md`、`docs/community/`、`docs/engineering/mvp-implementation-plan.md`：反映 M7 与已拍板治理项。
- [ADR 008](008-repo-toolchain-baseline.md)：M1 publish 推迟持续至 M7；publish 执行策略以本 ADR 为准。

关联文档：

- [组件库治理规范](../engineering/component-library-governance.md)
- [CI 校验计划](../architecture/ci-checklist.md)
- [项目状态](../project-status.md)
- [社区治理](../community/governance.md)

---
