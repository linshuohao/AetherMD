## Why

维护者决定 **推迟 M7 canary（0.1.0 能力子集）**，在路线图 v1.0「必须实现」与「暂不实现」**全部落地**后再首次 npm 发布（目标 **`1.0.0` + `latest`**）。当前 M1–M6、L1/L2 已闭合，但 History / Selection / Clipboard、Command Guard 链、compile-layer、PermissionGuard、Worker Thread、Vue Shell、Telemetry 等仍为空或 stub；须按 [v1.0 路线图](docs/architecture/roadmap.md) 与 [项目状态 v1.0 差距](docs/project-status.md#v10-差距) 系统性闭合后再 publish。

## What Changes

- **发布策略修订（ADR 009 增补）**：取消「0.1.0 canary 先行」；首次 publish 门禁改为 v1.0 全量能力 + G1–G12 + 维护者 sign-off。
- **Wave 1 — 内置底座**：History / Selection / Clipboard Service + `core:undo` / `core:redo` + HistoryCapture middleware；EditorContext 真实 services。
- **Wave 2 — Command Pipeline**：ReadOnlyGuard、CapabilityGuard、HistoryCapture 编排；Command Queue P0–P3 优先级与 coalescing（[并发策略](docs/engineering/concurrency.md)）。
- **Wave 3 — 编排与 Manifest**：ConflictResolver 完整接入 `createEditor`；compile-layer schema merge；分层 Manifest 合并；`bootstrapCore` Adapter silent provide。
- **Wave 4 — 安全与隔离**：PermissionGuard 沙盒；`grantedPermissions` enforce。
- **Wave 5 — Worker Runtime**：Parser / Serializer Worker 化（[线程模型](docs/engineering/thread-model.md)）。
- **Wave 6 — Error Model 完整**：RenderError 降级视图；SerializationError 宿主路径完善。
- **Wave 7 — Vue Shell**：`packages/vue` + `@aether-md/vue` 最小 Root/Content/hook。
- **Wave 8 — Telemetry**：OpenTelemetry 兼容 stub + `TelemetryService` 宿主注入。
- **Wave 9 — 宿主 ConflictResolver 注入**：`EditorConfig.conflictResolver` 可覆盖默认策略。
- **Wave 10 — 生态与发布**：examples matrix；E2E blocking CI；consumer smoke 扩展；**npm `1.0.0` publish**。
- **文档 / ADR / main spec sync**：`project-status.md`、`roadmap.md`、`release-process.md`、相关 main specs。

## Capabilities

### New Capabilities

- `builtin-services`: History、Selection、Clipboard 内核托管 Service 与 Core 命令
- `permission-guard`: Runtime Permission 校验与 API 拦截
- `worker-runtime`: Parser / Serializer Worker 线程与主线程桥接
- `vue-shell`: `@aether-md/vue` 最小 Shell 公开 API
- `telemetry`: EditorContext `TelemetryService` 与 OTel 兼容导出

### Modified Capabilities

- `core-bootstrap`: 分层 Manifest 合并、`bootstrapCore` Adapter plugin 加载与 silent provide
- `command-event-runtime`: Guard 链、Command Queue 优先级、HistoryCapture
- `editor-orchestration`: ConflictResolver 编排集成、compile-layer schema merge、完整 EditorContext、宿主 ConflictResolver 注入
- `document-model`: Selection / block identity 与 History 协调（若需 delta）
- `validation-suite`: 新能力回归、E2E blocking、consumer smoke 扩展
- `engineering-workflow`: CI 门禁扩展（Worker 测试、E2E blocking）
- `react-shell`: 与 builtin-services / PermissionGuard 集成措辞

## Impact

- **代码**：`packages/core`（主要）、`packages/plugin-prosemirror`、`packages/plugin-remark`、`packages/react`、新建 `packages/vue`、examples、CI scripts
- **API**：**BREAKING** 相对 0.x 草案 — 首次 publish 为 `1.0.0`；`EditorContext.services.*` 从 stub 变为真实实现；新增 public exports
- **版本**：五包 linked 组同步 **`1.0.0`**；`manifestVersion` 保持 `[1]` 除非 compile-layer 要求 bump（design 决策）
- **依赖**：可能新增 `prosemirror-history`（或自研栈）、Worker 相关、Vue peer、OTel optional peer
- **CI**：E2E 升为 blocking；Worker 集成测试；Release CI 在 Wave 10 触发
- **ADR**：修订 [ADR 009](docs/adr/009-release-governance.md) 发布策略（canary 推迟 → 1.0.0 完整发布）

## 非目标

- 多人协作、插件热插拔
- 独立 `@aether-md/sdk` npm 包
- 完整 Datadog 生产采样后端（Telemetry 为 OTel 兼容 stub + 接口）
- Playground 可发布站点（examples 仍 workspace private）

## Source Docs

- `docs/architecture/roadmap.md`
- `docs/project-status.md`
- `docs/adr/009-release-governance.md`
- `docs/architecture/principles.md`
- `docs/architecture/core-api.md`
- `docs/sdk/editor-context.md`
- `docs/sdk/command-event-protocol.md`
- `docs/sdk/conflict-resolution.md`
- `docs/engineering/concurrency.md`
- `docs/engineering/thread-model.md`
- `docs/engineering/security.md`
- `docs/engineering/error-model.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/community/release-process.md`

## Version Impact

- 五包 linked 组：**首次 publish `1.0.0`**（跳过 0.1.0 canary）
- `SUPPORTED_MANIFEST_VERSIONS`：默认保持 `[1]`；compile-layer 若需新 manifest 层则在 Wave 3 单独评估
- Changeset `m7-first-canary.md`：**替换**为 `v1-complete-release.md` 于 Wave 10

## Code-Management Status

- **Branch**：`feature/complete-v1-before-release`
- **Conventional Commit type**：`docs(openspec)` → 各 wave `feat(core)` / `feat(vue)` 等
- **OpenSpec change id**：`complete-v1-before-release`

## Acceptance Criteria

- [ ] v1.0 路线图「必须实现」与「暂不实现」表内全部项有 executable 验收（测试 / E2E / consumer smoke）
- [ ] `pnpm check` 与 `pnpm e2e:test` 全绿；E2E 为 blocking CI
- [ ] 五包 `@aether-md/*@1.0.0` 可 npm install；consumer smoke 通过
- [ ] `docs/project-status.md` v1.0 差距表全部闭合
- [ ] ADR 009 修订记录「完整 v1.0 后发布」决策
