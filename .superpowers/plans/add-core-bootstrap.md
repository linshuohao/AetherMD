# add-core-bootstrap Implementation Plan

## Change

OpenSpec change：`add-core-bootstrap`

目标：为 MVP M1 Core Bootstrap 创建最小 `@aether-md/core` 实现路径。该路径只覆盖 Manifest 加载与校验、Service Capability 校验、`metadata.dependsOn` 拓扑顺序、生命周期启动与销毁。

范围边界：

- 包含：`packages/core` 最小包表面、Manifest/types、fatal bootstrap errors、依赖排序、lifecycle hooks、M1 验证。
- 排除：Command Bus、Event Hub、Adapter、React Shell、Remark、ProseMirror、GFM preset、Markdown parse/serialize、Worker、热插拔、Telemetry 后端、权限沙盒执行。
- 文档语言：本 plan 及后续 Superpowers workflow 产物使用中文说明性正文；代码标识、API 名称、包名、路径和工具结构关键词保持英文。

## Source Artifacts

OpenSpec artifacts：

- `openspec/changes/add-core-bootstrap/proposal.md`
- `openspec/changes/add-core-bootstrap/design.md`
- `openspec/changes/add-core-bootstrap/specs/core-bootstrap/spec.md`
- `openspec/changes/add-core-bootstrap/tasks.md`

长期 source docs：

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/core-api.md`
- `docs/architecture/compatibility.md`
- `docs/architecture/package-layout.md`
- `docs/sdk/manifest.md`
- `docs/sdk/capabilities-and-permissions.md`
- `docs/sdk/lifecycle.md`
- `docs/engineering/manifest-loading.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/error-model.md`
- `docs/glossary.md`
- `docs/maintenance.md`

Accepted ADRs：

- `docs/adr/001-microkernel-architecture.md`
- `docs/adr/002-declarative-manifest-merging.md`
- `docs/adr/005-manifest-capabilities-versioning.md`
- `docs/adr/006-layered-manifest-permission-model.md`

## Implementation Phases

### Phase 1: 最小包与公共类型边界

建立 `packages/core` 的最小 TypeScript 包结构，只暴露 M1 所需 public exports。该阶段不写 runtime bootstrap 行为，只固定导出边界和基础类型，避免后续任务一边改 public contract 一边写逻辑。

输出应覆盖：

- `ExtensionManifest`、`ManifestMetadata`、`RuntimeManifest`、`ExtensionPlugin`
- `PluginName`、`CapabilityId` 及相关 capability 类型
- `SUPPORTED_MANIFEST_VERSIONS`
- `CoreError` 或等价 fatal bootstrap error shape

### Phase 2: Manifest shape 与版本校验

实现纯数据层的 Manifest loading/normalization/validation。该阶段只处理 `ExtensionPlugin.manifest` 入口、分层 Manifest shape、`metadata.manifestVersion` 校验和 fatal error。

输出应覆盖：

- 有效分层 Manifest 通过；
- 缺失 `manifest.metadata` 或 metadata 关键字段时失败；
- 不支持的 `metadata.manifestVersion` 失败；
- validation failure 发生在 lifecycle hooks 前。

### Phase 3: Service Capability 校验

实现 M1 capability registry 与 `metadata.provides` / `metadata.requires` 校验。该阶段必须显式处理 Adapter-backed capability 的边界，不得 silent claim `core:engine` 或 `core:parser` 已可用。

输出应覆盖：

- 明确的 M1 Core-provided Service Capability set；
- loaded plugins 的 `metadata.provides` 收集；
- 每个 plugin 的 `metadata.requires` 校验；
- 缺失 capability 时 fatal startup failure。

### Phase 4: Plugin dependency 拓扑排序

实现 `metadata.dependsOn` 的确定性排序。该阶段只关注插件名依赖图，不处理 Service Capability 冲突裁决或 compile layer merge。

输出应覆盖：

- 按宿主传入顺序作为无依赖或同层节点的稳定 tie-breaker；
- 依赖项先于依赖者；
- missing dependency fatal；
- cycle fatal。

### Phase 5: Lifecycle startup 与 dispose

在前面校验全部成功后，串联 bootstrap runtime。按 resolved dependency order 执行 `runtime.onInit`，再执行 `runtime.onReady`，并记录 successful lifecycle order 供 `dispose()` 逆序调用 `runtime.onDestroy`。

输出应覆盖：

- hook 缺失时跳过；
- async `onInit` 被 await；
- `onReady` 按顺序运行；
- `dispose()` 逆序运行 `onDestroy`；
- startup validation failure 不进入 running state。

### Phase 6: M1 验证与边界检查

补齐 unit/contract tests，并检查没有引入后续里程碑依赖。该阶段应保存验证命令和结果，供后续 `aether-workflow-validate-task` 使用。

输出应覆盖：

- Manifest version tests；
- Manifest shape tests；
- Service Capability tests；
- `dependsOn` ordering/missing/cycle tests；
- lifecycle startup/dispose order tests；
- package export boundary tests；
- scope guard：测试不依赖 Command Bus、Event Hub、Adapter、React、Remark、ProseMirror、GFM preset。

## Dependency Order

1. 先完成 Phase 1，因为后续实现和测试都依赖 `packages/core` 结构、public exports 与 error shape。
2. 再完成 Phase 2，因为 Manifest shape/version validation 是所有后续 bootstrap 行为的前置条件。
3. 再完成 Phase 3，因为 lifecycle 前必须知道 Service Capability 是否满足。
4. 再完成 Phase 4，因为 lifecycle hook 顺序依赖 `metadata.dependsOn` 解析结果。
5. 再完成 Phase 5，因为 lifecycle startup/dispose 只能在 Manifest、Capability、plugin dependency 全部校验通过后执行。
6. 最后完成 Phase 6，把每个 requirement 映射到测试，并执行 scope guard。

跨阶段约束：

- 不允许在 Phase 1 之外随意扩大 public API。
- 不允许在 Phase 3 中实现 Adapter 或默认 ConflictResolver。
- 不允许在 Phase 5 中引入 Command Bus、Event Hub 或 DOM 运行时。
- 如果任一阶段发现 OpenSpec 与 docs/ADR 冲突，暂停并更新 OpenSpec change，而不是直接编码绕过。

## Boundary Risks

| 风险 | 触发点 | 处理方式 |
| --- | --- | --- |
| M1 膨胀到 M2/M3 | 为了完整 `createEditor` 而引入 Command/Event/Adapter | 本 change 只实现 bootstrap 子集；需要后续 change 才能实现 M2/M3 |
| Adapter-backed capability 被误认为已可用 | `CORE_SERVICE_REGISTRY` 文档包含 `core:engine`、`core:parser` | 在 M1 显式定义 capability set；未实现 Adapter 前不得 silent provide |
| public contract 被实现任务顺手扩张 | 增加 docs 未定义的 exported API | 暂停并更新 OpenSpec；review 检查 exports |
| duplicate `metadata.provides` 语义不清 | 多插件声明同一 Service Capability | 保留为 open question；不在任务中偷偷发明 ConflictResolver 行为 |
| lifecycle failure cleanup 未明确 | `onInit` 或 `onReady` 抛错后部分插件已启动 | 在后续 task 中显式限定失败语义和测试；必要时记录 deviation |
| `dispose()` 幂等语义不清 | 多次调用 `dispose()` | 保留为 open question；实现任务不得隐式宣称完整幂等支持 |
| 文档语言漂移 | 后续 plan/task/validation/review 使用英文长正文 | 任务模板和 review focus 中检查中文说明性正文 |

## Validation Matrix

| Spec Requirement | 验证类型 | 核心场景 | 预期结果 |
| --- | --- | --- | --- |
| Minimal Core package exists | package/export test | import `@aether-md/core` M1 exports | 只暴露 M1 bootstrap 所需 API，不暴露后续里程碑 API |
| Manifest version is validated during bootstrap | unit/contract test | `manifestVersion: 1` | validation 通过 |
| Manifest version is validated during bootstrap | unit/contract test | unsupported `manifestVersion` | fatal Core bootstrap error，hooks 不运行 |
| Manifest shape is validated before lifecycle hooks | unit test | 缺失 `manifest.metadata` | fatal Core bootstrap error，`onInit`/`onReady` 不运行 |
| Service Capability requirements are validated | unit/contract test | required capability 已由 Core 或 plugin provide | bootstrap 继续 |
| Service Capability requirements are validated | unit/contract test | required capability 缺失 | fatal Core bootstrap error，hooks 不运行 |
| Plugin dependsOn order is resolved deterministically | unit test | `table` depends on `heading` | `heading` 在 `table` 前 |
| Plugin dependsOn order is resolved deterministically | unit test | missing dependency | fatal Core bootstrap error，hooks 不运行 |
| Plugin dependsOn order is resolved deterministically | unit test | dependency cycle | fatal Core bootstrap error，hooks 不运行 |
| Lifecycle hooks run in dependency order | contract test | 多 plugin 有 `onInit`/`onReady` | 按 dependency order 调用 |
| Dispose destroys plugins in reverse lifecycle order | contract test | 多 plugin 成功启动后 dispose | `onDestroy` 按 successful lifecycle order 逆序调用 |
| M1 excludes later milestone behavior | scope/export test | 搜索或 import boundary 检查 | 不依赖 Command Bus、Event Hub、Adapter、React、Remark、ProseMirror、GFM preset |
| Workflow documents are written in Chinese | docs review | plan/task/validation/review/archive artifacts | 说明性正文为中文，代码标识和工具关键词保留英文 |

## Task Breakdown

### Task 01: 创建 `packages/core` 最小包与类型导出

范围：

- 创建 M1 所需包结构；
- 定义 Manifest、plugin、capability、version、error 基础类型；
- 建立 package export 入口；
- 不实现 bootstrap 行为。

映射 requirement：

- `Minimal Core package exists`

验证：

- TypeScript 类型检查或等价 package export 检查；
- 确认没有 Command/Event/Adapter/Shell exports。

### Task 02: 实现 Manifest shape 与 version validation

范围：

- 实现 Manifest loading/normalization；
- 校验 `metadata.manifestVersion`；
- 对 invalid shape 与 unsupported version 返回 fatal Core bootstrap error；
- 保证 lifecycle hooks 前失败。

映射 requirement：

- `Manifest version is validated during bootstrap`
- `Manifest shape is validated before lifecycle hooks`

验证：

- valid version 测试；
- unsupported version 测试；
- invalid shape 测试；
- hook 未调用测试。

### Task 03: 实现 Service Capability 校验

范围：

- 定义 M1 Core-provided Service Capability set；
- 收集 plugin `metadata.provides`；
- 校验 `metadata.requires`；
- 缺失 capability fatal。

映射 requirement：

- `Service Capability requirements are validated`

验证：

- capability provided by Core 测试；
- capability provided by plugin 测试；
- missing capability fatal 测试；
- Adapter-backed capability 不被 silent provide 的边界测试。

### Task 04: 实现 `metadata.dependsOn` 拓扑排序

范围：

- 解析 plugin name dependency graph；
- 使用稳定确定性排序；
- 处理 missing dependency；
- 处理 dependency cycle。

映射 requirement：

- `Plugin dependsOn order is resolved deterministically`

验证：

- simple dependency order 测试；
- no-dependency stable order 测试；
- missing dependency fatal 测试；
- cycle fatal 测试。

### Task 05: 实现 lifecycle startup 与 `dispose()`

范围：

- 串联前置 validation 与 dependency order；
- 按顺序运行 `runtime.onInit` 和 `runtime.onReady`；
- 记录 successful lifecycle order；
- 在 `dispose()` 中逆序运行 `runtime.onDestroy`。

映射 requirement：

- `Lifecycle hooks run in dependency order`
- `Dispose destroys plugins in reverse lifecycle order`

验证：

- `onInit` order 测试；
- `onReady` after `onInit` 测试；
- async `onInit` await 测试；
- `onDestroy` reverse order 测试。

### Task 06: 完成 M1 范围验证与 workflow 文档语言检查

范围：

- 汇总并运行 M1 验证；
- 检查 package/source/test 中没有后续里程碑依赖；
- 检查 Superpowers artifacts 使用中文说明性正文；
- 记录验证结果供后续 validation skill 使用。

映射 requirement：

- `M1 excludes later milestone behavior`
- `Workflow documents are written in Chinese`

验证：

- scope guard 检查；
- test suite 运行；
- docs language review。

## Review Focus

- 每个实现文件是否能映射到本 plan 的单个 task 和 `core-bootstrap` spec requirement。
- `packages/core` 是否保持 M1 bootstrap 子集，没有引入 Command Bus、Event Hub、Adapter、React、Remark、ProseMirror、GFM preset。
- public exports 是否只包含 OpenSpec 明确允许的最小类型、常量和 bootstrap/error 表面。
- `SUPPORTED_MANIFEST_VERSIONS` 是否与 `docs/sdk/manifest.md` 和 `docs/architecture/compatibility.md` 保持一致。
- Service Capability 术语是否遵循 `docs/glossary.md` 与 `docs/sdk/capabilities-and-permissions.md`。
- M1 Core-provided capability set 是否显式、可测试，且没有 silent provide Adapter-backed capabilities。
- `dependsOn` 排序是否确定性，且 missing dependency/cycle 均 fatal。
- lifecycle hooks 是否只在全部前置 validation 通过后运行。
- `dispose()` 是否按 successful lifecycle order 的逆序调用 `onDestroy`。
- fatal bootstrap error 是否符合 `docs/engineering/error-model.md` 的 Core bootstrap abort 方向。
- 测试是否保护 public contract 和架构边界，而不是只测内部实现细节。
- workflow 产物说明性正文是否为中文。

## Open Questions

- M1 Core-provided Service Capability set 的精确内容是什么？当前计划要求显式定义并测试，但不预先假设 `core:engine` 或 `core:parser` 可用。
- 重复的 `metadata.provides` 是否应在 M1 中 fatal？当前计划倾向不在 M1 发明 ConflictResolver 行为，除非 OpenSpec 后续明确。
- `dispose()` 是否应在 M1 中要求幂等？当前计划只要求逆序 `onDestroy`；重复 dispose 行为需在 task 或后续 change 中明确。
- `onInit` 或 `onReady` 运行时失败后的 partial cleanup 语义是否纳入 M1？当前计划要求在 lifecycle task 中显式限定并测试，若超出 spec 则记录 deviation 或更新 OpenSpec。
