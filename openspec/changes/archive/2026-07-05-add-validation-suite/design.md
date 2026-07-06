## Context

M1–M5 已实现并通过 `pnpm check`：`@aether-md/core` headless `createEditor`、`@aether-md/preset-gfm` GFM round-trip、`@aether-md/react` Shell 与 happy-dom 集成测试。根目录 `LICENSE`（MIT）已随 ADR 009 落地，但五包 `package.json` 仍缺 `license` 字段；`.changeset/config.json` 的 `fixed`/`linked` 为空；无 `examples/` 目录；ci-checklist 多项 G5/G6/G11 与行为回归项未勾选。

[ADR 009](docs/adr/009-release-governance.md) 冻结 M6 为**验证套件 + publish 预备**，M7 才执行 npm publish。本 design 抽取 M6 implementation contract；长期事实来源为 `docs/`。

约束：

- **MUST NOT** 执行 `npm publish`、配置 `NPM_TOKEN`、启用 Release workflow。
- **MUST NOT** 修改 Core/React 运行时语义，除非测试暴露 bug 并记录 deviation。
- compile-layer Schema 合并、宿主 `ConflictResolver` 注入仍为 MVP 非目标（`docs/engineering/mvp-implementation-plan.md`）。
- 说明性正文使用中文；API 名称、包名、路径与 OpenSpec 关键词保持 English。

## Goals / Non-Goals

**Goals:**

- 交付 `examples/headless-gfm`（workspace private，Node 脚本，无 UI）。
- 完成 ADR 009 M6 publish 预备：五包 MIT `license`、`repository`/`files`/`publishConfig`、Changesets `linked` 五包、根 `changeset:publish` 脚本、`release-process.md` 完善。
- 启用 G11 manifest 版本一致性校验；G6 examples `tsc --noEmit`；纳入 `pnpm check`。
- G5 契约测试关键路径保持绿并补充 manifest / example 门禁。
- G12：在 `project-status.md` 与 `roadmap.md`（或单一主落点 + 交叉引用）显式标注 v1.0 差距。
- ci-checklist 已启用项勾选更新。
- Scope 合理时：`createEditor` 启动中止集成测试（见 Decision 6）。

**Non-Goals:**

- M7：npm publish、去 `private: true`、`NPM_TOKEN`、Release CI、`pnpm pack` consumer smoke。
- `examples/react-basic`、Playwright、Vue Shell、examples matrix。
- PermissionGuard、Worker Thread、History/Selection/Clipboard 完整实现、独立 `@aether-md/sdk`。
- compile-layer Schema 合并实现、`EditorConfig.conflictResolver` 新公开 API。
- `tsd` 快照、`CORE_SERVICE_REGISTRY` 自动比对（ci-checklist 可延后项）。

## Decisions

### 1. 新增 capability `validation-suite`；`engineering-workflow` 仅 MODIFIED CI 门禁措辞

**选择：** M6 验收要求独立为 `validation-suite` capability。若根 `pnpm check` 新增 manifest / examples 步骤，则 `engineering-workflow` delta **仅 MODIFIED** Quality gates 相关 SHALL，**不**改 workflow path 路由规则。

**理由：** 与 M5 `react-shell` + 最小 boundary delta 模式一致。

### 2. `examples/headless-gfm` 布局与职责

**选择：**

```text
examples/headless-gfm/
  package.json          # name: @aether-md/example-headless-gfm, private: true
  tsconfig.json
  src/run.ts            # 或 index.ts：async main
```

- 脚本 **SHALL** 使用 `createEditor` + `createGfmPreset()` + remark/prosemirror 显式 wiring（与 M4.5 headless integration 相同模式）。
- 接受 CLI 参数或内置 fixture Markdown；stdout 输出 round-trip 后 Markdown 或成功日志。
- `package.json` scripts：`typecheck`（`tsc --noEmit`）、`start`（`node` 运行编译产物或 `tsx`/`ts-node` 若已有先例——优先与仓库现有 example 模式一致，implementation 定形为 `tsc` + `node`）。
- 接入 `pnpm-workspace.yaml`（`examples/*` glob 或显式路径）；turbo `typecheck` 任务参与 `pnpm check`。
- **MUST NOT** 发布 npm；**MUST NOT** 依赖 React/DOM。

**与包内测试区分：** `packages/core` integration tests 验证 Core 契约；`examples/headless-gfm` 验证**宿主集成故事**（可复制、可独立运行、文档可引用）。

**备选：** 仅维护 `docs/sdk/examples.md` 片段。否决：ADR 009 明确要求可运行 headless example；G6 需可 `tsc` 的实体 package。

### 3. Publish 预备：五包元数据与 Changesets linked

**选择：**

| 字段            | 五包统一值                                         |
| --------------- | -------------------------------------------------- |
| `license`       | `"MIT"`                                            |
| `repository`    | monorepo git URL + `directory` 指向各 package 路径 |
| `files`         | `["dist"]`（或各包现有 publish 惯例）              |
| `publishConfig` | `{ "access": "public" }`                           |
| `private`       | **保持 `true`**（M7 前不去除）                     |

Changesets `.changeset/config.json`：

```json
"linked": [
  [
    "@aether-md/core",
    "@aether-md/plugin-remark",
    "@aether-md/plugin-prosemirror",
    "@aether-md/preset-gfm",
    "@aether-md/react"
  ]
]
```

根 `package.json` 新增：

```json
"changeset:publish": "changeset publish"
```

**MUST NOT** 在 M6 执行 `changeset publish` 或配置 `NPM_TOKEN`。

**理由：** 对齐 ADR 009 G1/G3 与 `release-process.md` M6 预备行。

### 4. G11：`SUPPORTED_MANIFEST_VERSIONS` 文档一致性校验

**选择：** 新增仓库级契约测试（推荐 `packages/core` 内或 `scripts/` + `pnpm check` 调用），断言：

1. `packages/core/src/manifest.ts` 导出 `SUPPORTED_MANIFEST_VERSIONS` 与 `docs/sdk/manifest.md` 文档表格/常量一致（解析 md 中版本列表或维护单一快照 JSON——implementation 选最稳方案）。
2. 官方插件 `packages/plugins/*` 与 `packages/preset-gfm`、`packages/react` 的 `manifestVersion` 均在支持列表内。

失败时 **MUST** 使 `pnpm check` 失败。

**备选：** 纯人工 review。否决：ci-checklist 要求自动化防漂移。

### 5. G6：examples `tsc --noEmit` 主路径

**选择：** **主路径** = `examples/headless-gfm` package `typecheck`（`tsc --noEmit`），经 turbo 纳入根 `pnpm check`。

**次路径（可选）：** 若 `docs/sdk/examples.md` 附录代码需独立 `tsc`，在 `examples/` 或 `scripts/sdk-examples-typecheck/` 增加轻量 tsconfig **仅当** headless example 不足以覆盖 G6；默认 M6 **以 `examples/headless-gfm` 满足 G6**。

**理由：** ADR 009 允许二选一；headless example 同时满足 ADR Demo 形态与 G6。

### 6. Schema 冲突 / 启动中止集成测试（scope 冻结）

**选择（冻结）：**

MVP 未实现 compile-layer Schema 合并（`createEditor` 不合并插件 `compile.schema`）。因此 M6 **不**为完整「Schema 节点/标记同名合并冲突」新增 Core 合并逻辑或 `EditorConfig.conflictResolver` API。

M6 **SHALL** 交付以下**可测路径**，闭合 ci-checklist 行为回归 intent：

| 层级         | 内容                                                                                                                                                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 单元（已有） | `createDefaultConflictResolver` 对 `type: "schema"` 返回 `strategy: "abort"`（`conflict-resolver.test.ts`）                                                                                                                                  |
| 集成（新增） | `createEditor` **启动中止**集成测试文件（如 `startup-abort.integration.test.ts`），覆盖**已接线** fatal 路径：`metadata.manifestVersion` 不在 `SUPPORTED_MANIFEST_VERSIONS`；duplicate `metadata.name`；**不**要求 compile-layer schema 合并 |

若 implementation 发现 duplicate command + forced abort 可在**不修改公开 API** 下通过内部 test hook 覆盖，**MAY** 追加场景；否则 **MUST NOT** 为凑 coverage 扩展 Core 公开面。

**ci-checklist 勾选策略：** Schema 冲突行勾选时 **MUST** 在 PR / validation 记录注明：「compile-layer schema merge 集成待后续里程碑；M6 覆盖 default resolver schema abort 单元测试 + createEditor fatal startup 集成测试」。

**Deviation：** 若上述集成测试与既有测试重复，合并为单一 `validation-suite` 回归文件并更新 ci-checklist 注释，**不得** silent 删除要求。

### 7. G12 文档差距标注落点

**选择：**

- **主落点：** `docs/project-status.md` — 新增或扩展「v1.0 差距」小节，列表引用 `docs/architecture/roadmap.md` 必须实现项与 ADR 009 延后项（ConflictResolver 全套、History/Selection/Clipboard、PermissionGuard、compile-layer merge 等）。
- **次落点：** `docs/architecture/roadmap.md` 顶部增加「当前实现差距」短表或链接至 `project-status.md`。
- **ci-checklist：** 勾选 G12 相关文档项（若 checklist 有对应行）或在校验计划中注明已满足。

**理由：** 单一主事实来源（project-status）+ 路线图交叉引用，避免双份漂移。

### 8. `pnpm check` 扩展方式

**选择：** 通过 turbo 注册 `examples/headless-gfm#typecheck` 与 manifest 一致性脚本（可作为 `@aether-md/core` test 子集或根 `workflow:contract-check`），**不**破坏现有 `skills:check` → `workflow:pr-check` → `turbo run check` 顺序。

各 package 现有 `check` 脚本 **SHOULD** 保持；新门禁 **SHOULD** 挂入已有 `turbo.json` pipeline 的 `check` 依赖图。

## Risks / Trade-offs

| 风险                               | 缓解                                                                  |
| ---------------------------------- | --------------------------------------------------------------------- |
| examples 与 integration tests 重复 | 示例侧重可运行叙事与文档引用；测试侧重断言与 CI 回归                  |
| G11 解析 markdown 脆弱             | 优先快照常量或从 `manifest.ts` 生成单一 truth；避免手写双份           |
| Schema 冲突 checklist 与实现差距   | Decision 6 冻结可测路径 + validation 记录注明 deferred compile-layer  |
| linked 五包版本策略错误            | implementation 运行 `changeset status`；文档化于 `release-process.md` |
| 元数据变更被误认为 publish ready   | `private: true` 保持；release-process 标明 M6 不 publish              |

## Migration Plan

1. 合并 OpenSpec artifacts → `aether-workflow-create-plan` → Superpowers tasks。
2. Publish 预备元数据 + Changesets linked（低风险，可先合）。
3. `examples/headless-gfm` scaffold → manifest 一致性测试 → turbo/check 接入。
4. 启动中止集成测试 + 文档 G12 / ci-checklist 更新。
5. `pnpm check` 全绿 → compliance review → archive → `aether-workflow-update-docs-spec` sync `validation-suite` main spec。

**Rollback：** 移除 `examples/headless-gfm` workspace entry；revert changeset linked 与 package 元数据；Core 无行为变更故无 runtime rollback。

## Open Questions

以下问题在本 design **已冻结**（implementation 不得偏离，除非新 OpenSpec deviation 记录）：

| #   | 问题                   | 冻结决策                                                                        |
| --- | ---------------------- | ------------------------------------------------------------------------------- |
| 1   | G6 主路径              | `examples/headless-gfm` `tsc --noEmit`                                          |
| 2   | Changesets linked 范围 | 五包：`core`、`plugin-remark`、`plugin-prosemirror`、`preset-gfm`、`react`      |
| 3   | Schema 冲突集成 scope  | 不实现 compile-layer merge；单元 schema abort + createEditor fatal startup 集成 |
| 4   | G12 主落点             | `docs/project-status.md` + `roadmap.md` 交叉引用                                |

**Implementation 阶段待定形（不阻塞 OpenSpec）：**

- `examples/headless-gfm` 使用 `tsc`+`node` vs `tsx` 运行方式（遵循仓库现有惯例）。
- G11 测试实现为 core 内测试 vs 根脚本（以 `pnpm check` 可执行为准）。
