# AetherMD 组件库治理规范

> 状态：设计草案 + M1 Core Bootstrap。本文定义 AetherMD 作为 NPM 包型 Monorepo、引擎库和 SDK 库长期演进时的治理规则。

## 1. 文档定位

本文不是架构总览，也不是 SDK 使用文档。架构原则、系统边界和路线图仍由 `docs/architecture/` 维护；插件可见的类型与行为仍由 `docs/sdk/` 维护；具体运行时策略仍由本分区其他工程文档维护。

本文解决的是包型库长期演进中的治理问题：

- 多包演进如何避免边界腐化。
- Core、SDK、插件、Adapter 和示例之间如何保持职责清晰。
- 对外 API 如何稳定、标记、变更和弃用。
- 新组件、新能力、新包如何进入项目。
- 版本、Changeset、发布和迁移如何管理。
- 质量门禁如何保护插件作者、框架适配层和最终应用方。

本文的规则分为两类：

- **M1 基线规则**：当前 `@aether-md/core` 最小实现和文档变更已经需要遵守。
- **长期治理目标**：进入 SDK、Plugin、Adapter 和生态包阶段后逐步强制。

## 2. 治理目标

AetherMD 的组件库治理服务于以下目标：

- 保持 Core 框架无关，不依赖 React、Vue、Svelte 或其他 UI 框架。
- 保持公开契约稳定，让插件作者和宿主应用能基于文档判断兼容性。
- 防止组件、插件能力、Adapter 行为向 Core 无序侵入。
- 防止 workspace package 之间形成循环依赖。
- 防止 public package 依赖 private runtime package。
- 保障 ESM、CJS、types 和 package `exports` 对消费侧可预测。
- 保障 Docs、OpenSpec、代码实现和验证记录同步演进。
- 让插件作者、框架适配层、最终应用方都能理解系统边界。

## 3. 包类型治理

AetherMD Monorepo 中的包应先被归类，再讨论发布、依赖和门禁。当前仓库只建立了 `packages/core`，其他类型是长期演进时的治理分类。

| 包类型 | 是否可发布到 NPM | 是否可被 public package 依赖 | `exports` | `types` | Changeset | 可依赖 Core | 可依赖 UI 框架 | 可依赖 DOM / 宿主运行时 | 典型例子 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Public Runtime Package | 是 | 是 | 必须 | 必须 | 对外可见变更必须 | 视职责而定 | 不允许，除非该包本身是 Adapter | 不允许，除非契约声明 | `@aether-md/core`、未来 `@aether-md/preset-gfm` |
| Public Adapter Package | 是 | 是 | 必须 | 必须 | 对外可见变更必须 | 允许 | 仅对应框架 Adapter 允许 | 允许，但必须声明边界 | `@aether-md/react`、`@aether-md/vue`、`@aether-md/plugin-prosemirror` |
| Public Plugin Package | 是 | 是 | 必须 | 必须 | 对外可见变更必须 | 允许依赖公开契约 | 默认不允许 | 默认不允许；需要权限声明 | `@aether-md/plugin-heading` |
| Internal Workspace Package | 否 | 不允许被 public runtime dependency 依赖 | 推荐 | 推荐 | 通常不需要 | 允许 | 视用途而定 | 视用途而定 | 内部测试工具、构建辅助包 |
| Source-only Module | 否 | 可通过源码归属被同包使用，不作为 runtime dependency 暴露 | 不适用 | 不适用 | 不需要 | 视所在包而定 | 视所在包而定 | 视所在包而定 | `src/internal/*`、同包内共享模块 |
| Example / Playground Package | 不发布 | 不允许 | 可选 | 可选 | 不需要 | 允许依赖 public package | 允许 | 允许 | `examples/react-basic`、playground |
| Config Package | 通常不发布；若发布需单独审查 | 仅用于构建或开发配置 | 若发布则必须 | 若发布则推荐 | 若发布且对外可见则必须 | 不应依赖 Core | 不应依赖 UI 框架 | 不应依赖 DOM | tsconfig、eslint config、测试配置 |

强约束：

```text
会发布的包不能依赖不会发布的 runtime package。
```

如果一个 public package 需要共享逻辑，只能选择以下路径之一：

1. 把共享逻辑沉淀为同样可发布的 public package，并为其定义公开契约。
2. 将共享逻辑下沉为同包内的 source-only module，不通过 package dependency 暴露。
3. 在构建阶段显式内联，并确保最终产物的 `dependencies` 不暴露内部包。

M1 阶段的立即规则：

- `@aether-md/core` 的 public surface 只以 `packages/core/package.json` 的 `exports` 和对应类型声明为准。
- `packages/core` 不应依赖框架、DOM UI 组件、示例代码或未来 Adapter 包。
- 当前 `@aether-md/core` 仍为 `private: true` 时，不代表可以随意扩大 public API；M1 已暴露的入口仍按 public API 审查。

## 4. 包分层与依赖方向

推荐依赖方向：

```text
adapter packages  -> core
plugin packages   -> sdk / core public contract
examples          -> public packages
core              -> framework-independent primitives only
```

更完整的长期方向：

```text
examples / playground
  -> public adapter packages
  -> public plugin packages
  -> public runtime packages
  -> framework-independent core primitives
```

禁止：

- `core` 依赖 React、Vue、Svelte、DOM UI 组件或框架生命周期。
- `core` 依赖具体应用层状态管理。
- Adapter 包反向污染 Core 设计，把宿主框架约束写入 Core。
- Example / Playground 被 runtime package 依赖。
- Public package 依赖 private package 作为 runtime dependency。
- 不经过 ADR 或 OpenSpec 修改公开插件契约。
- Adapter 直接暴露第三方编辑器原生类型作为 SDK 稳定契约，除非对应文档明确允许。

## 5. 组件 / 能力生命周期治理

本文中的“组件”是广义概念，包括：

- Core primitive
- Editor capability
- Plugin capability
- SDK contract
- Adapter component
- Command
- Extension point
- Runtime behavior

生命周期状态如下：

| 状态 | 进入条件 | 是否允许外部依赖 | 文档要求 | OpenSpec 要求 | 测试要求 | Breaking change | ADR 要求 | 退出条件 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Proposal | 有明确问题、范围和归属判断 | 不允许 | 需要提案或归属文档 | 影响契约时需要 | 可无测试 | 允许调整 | 架构取舍重大时需要 | 进入 Experimental 或关闭 |
| Experimental | 有最小实现或可验证设计，已标记实验状态 | 允许试用，不承诺稳定 | 必须标记实验 | 影响契约时需要 | 至少有设计验证或最小测试 | 允许，但必须记录 | 重大边界变化需要 | 稳定化、废弃或移除 |
| Stable | 契约清晰、文档完整、测试覆盖关键路径 | 允许 | 必须有正式入口 | 必须同步主规格或引用 | 必须有自动化或契约验证 | 需要 major 或迁移策略 | 破坏长期边界时需要 | Deprecated |
| Deprecated | 有替代方案和迁移说明 | 允许继续使用 | 必须标记替代方案 | 公开契约变化时需要 | 兼容窗口内必须覆盖 | 不应再扩大能力 | 通常不需要 | Removed |
| Removed | 已过兼容窗口或符合例外条件 | 不允许 | 必须记录移除和迁移 | 公开契约移除时需要 | 移除后测试应覆盖新路径 | 属于 breaking change | 不可逆重大移除需要 | 完成移除 |

阶段约束：

- M1 阶段默认只允许少量能力进入 Stable，例如已经实现并由 OpenSpec 覆盖的 Core Bootstrap surface。
- Experimental 能力必须在文档、导出名或注释中明确标记，不得在示例或 README 中伪装成稳定 API。
- Stable 能力发生破坏性变更必须走 major version，或在 pre-1.0 阶段给出明确 breaking note 和迁移策略。

## 6. Public API 治理

AetherMD 的 public API 包括：

- package `exports` 暴露的入口。
- SDK 文档声明的接口。
- Plugin manifest schema。
- Capability / Permission 名称。
- Command 名称。
- Event 名称。
- Error code。
- Serialized state / document model。
- OpenSpec 中声明为稳定契约的行为。

以下内容不算 public API：

- 未从 package `exports` 暴露的内部模块。
- `src/internal` 下的内容。
- 测试工具。
- Playground 或 example 代码。
- 未进入 Stable 的实验实现。

治理要求：

- Public API 变更必须有 Changeset；当前 `.changeset/` 只作为 M1 版本影响记录底座，不代表启用正式 npm publish。
- Public API 的破坏性变更必须有 migration note。
- Public API 的新增必须有文档入口。
- Public API 的删除必须经过 deprecation 周期，除非当前阶段明确仍是 pre-1.0 experimental，且变更记录清楚说明影响。
- 未文档化的导出不得被宣传为 Stable API。

## 7. 版本与 Changeset 治理

正式发布前，AetherMD 使用 Changesets 作为版本影响记录机制。当前 `.changeset/` 已启用为 M1 工具底座，只用于记录 public API、package metadata、workspace package 边界和 SemVer 影响；进入对外发布阶段后，才允许将 Changesets 接入正式 npm publish 流程。

### 基本规则

- 所有对外可见变更都必须有 Changeset。
- Patch 用于兼容修复、类型修正、文档中对既有行为的澄清。
- Minor 用于向后兼容的 public API、command、capability、permission 或 manifest schema 新增。
- Major 用于删除、重命名、语义收窄、不兼容类型变化或稳定行为破坏。
- Pre-1.0 阶段仍要判断 breaking change；可以不升 major，但必须在 Changeset、PR 或 migration note 中显式标记。
- 多包联动时，只给实际受影响的发布包写 Changeset；示例或内部工具不应被误列为 runtime 影响包。
- Core 变更如果影响 Adapter 或 Plugin 的编译、运行或契约假设，需要同时评估相关 public package。
- 文档-only 变更通常不需要 Changeset；但如果文档改变了 public contract 的含义，需要记录 version impact，并视为契约变更处理。
- OpenSpec-only 变更通常不需要 Changeset；但如果同步定义了未来 public contract，应在后续实现 Changeset 中引用。
- 工具底座、治理文档或仓库维护变更通常不需要 Changeset，除非它们改变 public package contract、package metadata 或发布语义。
- 不允许本地手动发布正式版本。
- CI 是唯一正式发布入口。

### 判断示例

| 变更 | 建议判断 |
| --- | --- |
| 修改内部实现，不影响 `exports` 和行为 | 无需 Changeset；若发布流程要求可记 patch |
| 新增 command | minor |
| 修改 error code | major；pre-1.0 下至少需要 explicit breaking note |
| 修复类型声明 | patch |
| 修改 plugin manifest schema，兼容新增字段 | minor |
| 修改 plugin manifest schema，要求旧插件改写 | major |
| 删除已公开 API | major |
| 修改 README 入口，不改变契约 | 无需 Changeset |

## 8. 组件新增准入规则

新增 core capability、plugin extension point、adapter component 或 package 前，提案或 PR 必须回答：

- 它解决什么问题？
- 它属于 core、sdk、plugin、adapter，还是 example？
- 它是否框架无关？
- 它是否会成为 public API？
- 它是否需要 OpenSpec？
- 它是否影响插件作者？
- 它是否影响宿主应用？
- 它是否需要 capability / permission 声明？
- 它是否引入新的 runtime dependency？
- 它是否会影响 bundle size？
- 它是否需要 migration guide？
- 它是否已有测试策略？

Checklist：

- [ ] 已确认所属层级和包类型。
- [ ] 已确认是否 public API。
- [ ] 已确认是否改变 Manifest、Command/Event、Capability、Permission 或 Error code。
- [ ] 已确认是否需要 ADR。
- [ ] 已确认是否需要 OpenSpec change。
- [ ] 已确认是否新增 runtime dependency 或 peer dependency。
- [ ] 已确认是否影响 bundle size 或初始化性能目标。
- [ ] 已确认文档入口。
- [ ] 已确认验证方式。
- [ ] 已确认版本影响和 Changeset 要求。

## 9. 质量门禁治理

组件库 / SDK 库的质量门禁不只是 lint。长期门禁应覆盖安装、类型、测试、构建、包契约和消费侧验证。

当前统一验证入口是根级 `pnpm build`、`pnpm typecheck`、`pnpm test` 和 `pnpm check`。Turborepo 只是这些根命令背后的 task orchestration 实现细节，不改变包边界、public API、依赖方向或发布状态。

| Gate | 内容 | M1 Core Bootstrap | M2 SDK / Plugin Expansion | M3 Adapter / Ecosystem Packages |
| --- | --- | --- | --- | --- |
| Gate 1: install | 可重复安装依赖 | 必须 | 必须 | 必须 |
| Gate 2: lint | 代码与文档基础规则 | 视工具可用性执行 | 应补齐 | 必须 |
| Gate 3: typecheck | TypeScript 类型检查 | `packages/core` 必须 | 所有 public package 必须 | 必须 |
| Gate 4: unit test | 小模块行为测试 | `packages/core` 必须 | 必须 | 必须 |
| Gate 5: build | 产物构建 | public package 应执行 | 必须 | 必须 |
| Gate 6: package contract check | `exports`、types、package metadata 校验 | M1 应覆盖 core boundary | 必须 | 必须 |
| Gate 7: docs / OpenSpec sync check | 文档、OpenSpec、代码一致性 | 必须人工检查 | 应自动化部分检查 | 必须 |
| Gate 8: smoke test / consumer test | 消费侧安装和导入验证 | 可手动或最小化 | 应补齐 | 必须 |

当前阶段不要求立刻引入完整工具链。M1 的重点是保护 `@aether-md/core` 的最小导出、Manifest bootstrap 行为、capability 校验、生命周期顺序和文档同步。

M1 最小 CI 质量门禁只运行 `pnpm install --frozen-lockfile`、`pnpm check` 和 `pnpm build`。该门禁不包含 npm publish、canary release、release token、examples matrix 或发布自动化。

后续新增 package 必须提供 `build`、`typecheck`、`test` 同名脚本，或在对应文档中说明为什么该 package 暂不适用某个根命令。没有真实职责和验证方式前，不创建 React、Vue、plugin、preset 或 example 空包。

## 10. 文档同步治理

以下变更必须同步文档：

- 修改 public API。
- 修改 plugin manifest。
- 修改 capability / permission。
- 修改错误模型。
- 修改并发模型。
- 修改数据流。
- 修改包结构。
- 修改发布策略。
- 修改组件生命周期状态。

同步位置：

| 变更类型 | 文档位置 |
| --- | --- |
| 架构边界、Core 职责、路线图 | `docs/architecture/` |
| Manifest、Capability、Permission、Lifecycle、Command/Event | `docs/sdk/` |
| 运行时行为、错误、并发、安全、测试、包治理 | `docs/engineering/` |
| 长期取舍、原则反转、不可逆决策 | `docs/adr/` |
| 贡献、Review、Git、发布协作 | `docs/community/`、`CONTRIBUTING.md` |
| 变更规格、验收、归档 | `openspec/` |

## 11. ADR / OpenSpec 触发条件

必须新增或更新 ADR 的情况：

- 改变包分层。
- 引入新的 public package。
- 修改 Core 边界。
- 引入新的插件能力模型。
- 改变安全 / 权限模型。
- 改变错误模型。
- 改变并发模型。
- 引入不可逆的 breaking change。

必须新增或更新 OpenSpec 的情况：

- 新增或修改 SDK 契约。
- 新增或修改 plugin manifest schema。
- 新增 capability / permission。
- 新增 command / event / error code。
- 修改数据模型或序列化协议。
- 修改 runtime behavior。
- 修改测试策略或 CI 门禁。

只新增文档入口、修正链接、澄清既有规则且不改变契约时，可以不创建 OpenSpec，但 PR 应说明原因。

## 12. Deprecation 治理

弃用流程：

```text
mark deprecated
document alternative
emit warning if applicable
keep compatibility window
remove in allowed version
provide migration note
```

Pre-1.0 阶段：

- 可以缩短兼容窗口，但必须明确标记 breaking note。
- Stable API 即使处于 pre-1.0，也不应无记录删除。
- Experimental API 可以更快调整，但必须避免被文档伪装成 stable。

1.0 之后：

- Deprecated API 应至少保留两个 minor 版本，除非 ADR 或安全修复说明例外。
- 移除必须配套 migration note 和 Changeset。
- 对插件作者可见的 manifest、capability、permission、command 和 event 变更必须优先保证可发现。

例外：

- Security fix 可以缩短兼容窗口。
- Correctness fix 如果旧行为会导致数据损坏、权限绕过或不可恢复错误，可以更快移除，但必须记录原因、影响面和迁移路径。

## 13. Ownership 治理

以下是项目治理角色，不是组织架构。一个维护者可以同时承担多个角色，但 Review 时应明确谁负责哪类判断。

| 角色 | 负责内容 |
| --- | --- |
| Core maintainer | Core 边界、framework-independent 约束、runtime primitive、package export surface |
| SDK contract owner | Manifest、Capability、Permission、Lifecycle、Command/Event、EditorContext |
| Plugin API owner | 插件扩展点、官方插件能力、插件兼容性和弃用路径 |
| Adapter package owner | 宿主框架或底层引擎适配、peer dependency、external dependency、防腐边界 |
| Documentation owner | 文档归属、索引入口、术语一致性、Docs / OpenSpec 同步 |
| Release owner | Changeset、SemVer、发布通道、CI 发布、migration note |

## 14. Anti-corruption Rules

- Core 不依赖 UI 框架。
- Core 不依赖具体应用层状态管理。
- Public package 不依赖 private runtime package。
- 会发布的包必须有明确 `exports` 和类型入口。
- 未文档化的能力不能被当作 stable API。
- 未经 OpenSpec 的契约变更不能进入实现。
- Adapter 只适配，不沉淀核心语义。
- Plugin 只能通过声明过的 capability 访问宿主能力。
- Breaking change 必须有 migration note。
- CI 是唯一正式发布入口。
- 示例代码不得成为 runtime dependency。
- 文档、spec、代码必须同步演进。

## 15. 当前阶段落地建议

### M1 Core Bootstrap

应该立即落地：

- Public API 边界说明。
- Core 不依赖框架规则。
- `packages/core` 的 `exports` / types 契约。
- 根级 `pnpm build`、`pnpm typecheck`、`pnpm test`、`pnpm check` 入口。
- Docs / OpenSpec / code 同步规则。
- Changesets 版本影响记录底座。
- ADR / OpenSpec 触发条件。

暂不强制：

- 多 Adapter 包治理。
- 完整 smoke test matrix。
- examples matrix。
- 可视化回归测试。
- 多 release channel。

### M2 SDK / Plugin Expansion

开始强制：

- Plugin manifest 兼容性规则。
- Capability / Permission lifecycle。
- Consumer smoke test。
- Package contract check。
- Deprecation 流程。

### M3 Adapter / Ecosystem Packages

开始强制：

- Adapter package `peerDependencies`。
- React、Vue、Svelte 等宿主依赖 external。
- Examples matrix。
- Canary release。
- Package ownership。
