## Context

M1–M6 与 L2 Slice A–D 已交付。M7 工程轨（Release CI、consumer smoke）就绪但未 publish。`EditorContext` 中 history/selection/clipboard 为 noop stub（`packages/core/src/editor/context.ts`）。Command Bus 仅有 handler 错误边界，无 Guard 链与 Queue。ConflictResolver 有单元测试但未接入 `createEditor`。路线图 deferred 项（Worker、PermissionGuard、Vue、Telemetry）均未实现。

维护者选择 **Option C**：全部完成后 **`1.0.0` 发布**。

## Goals / Non-Goals

**Goals:**

- 按 10 个 Wave 顺序交付 v1.0 全量能力（含原 deferred 表）
- 保持 Core / Adapter / Shell 边界（ADR 001、principles.md）
- 每 Wave 结束 `pnpm check` 绿；Wave 10 触发 npm publish
- 修订 ADR 009 发布策略

**Non-Goals:**

- 独立 `@aether-md/sdk` 包
- 可发布 playground 站点
- 生产 Telemetry 后端（仅 OTel-compatible stub）

## Decisions

### D1 — 发布版本与 tag

- **Decision**：首次 publish **`1.0.0`** + dist-tag **`latest`**；不执行 `changeset pre enter canary`。
- **Rationale**：维护者要求功能完整后再发布；避免 0.x 能力子集语义漂移。
- **Alternatives**：保留 canary 仅作 RC — rejected，增加沟通成本。

### D2 — History 实现策略

- **Decision**：Wave 1 在 `@aether-md/core` 实现 `HistoryService` 编排层 + `core:undo`/`core:redo`；Engine 侧通过 `@aether-md/plugin-prosemirror` 暴露 history plugin 钩子（不将 `prosemirror-history` 依赖泄漏到 Core）。
- **Rationale**：原则要求 Undo/Redo 内核托管；ProseMirror 已有成熟 history stack。
- **Alternatives**：纯 Core 文档快照 history — rejected，与现有 engine adapter 重复。

### D3 — Selection / Clipboard

- **Decision**：SelectionService 桥接 engine session selection API；ClipboardService 代理剪贴板并预留 `perm:clipboard` 检查点（Wave 4 enforce）。
- **Rationale**：对齐 `docs/sdk/editor-context.md`。

### D4 — Command Pipeline 顺序

- **Decision**：`dispatch` 路径：`ReadOnlyGuard` → `CapabilityGuard` → `PermissionGuard`（Wave 4）→ handler → `HistoryCapture`（meta.history）。
- **Rationale**：对齐 `docs/sdk/commands.md` middleware 表。

### D5 — compile-layer 与 Manifest

- **Decision**：Wave 3 在 bootstrap 路径实现 metadata + compile + runtime + security 四层 merge；schema merge 在 compile 阶段；fatal abort 保持现有 `CoreError` 路径。
- **Rationale**：ci-checklist 已 deferred 完整 merge；v1.0 路线图要求。

### D6 — Worker Thread

- **Decision**：Wave 5 使用 Node `worker_threads` + 结构化 clone 消息协议；Parser/Serializer 在 Worker，Engine 留主线程。
- **Rationale**：`docs/engineering/thread-model.md`。

### D7 — Vue Shell

- **Decision**：Wave 7 镜像 `@aether-md/react` API 形状（Root/Content/hook）；不共享 React 实现。
- **Rationale**：路线图 `@aether-md/vue` MAY 保留规划，Option C 要求实现。

### D8 — Telemetry

- **Decision**：Wave 8 提供 noop + OTel span 接口；不硬依赖 `@opentelemetry/sdk`（optional peer）。
- **Rationale**：路线图「Telemetry 后端 deferred」但 Option C 包含接口与 stub。

### D9 — 分支与合并策略

- **Decision**：单 long-lived feature branch `feature/complete-v1-before-release`；每 Wave 完成后 commit；测试绿则 merge to main（维护者授权 agent 合入）。
- **Rationale**：用户指令。

## Risks / Trade-offs

- **[Risk] 范围极大、跨多包** → 严格 Wave 边界 + 每 task 单文件 allowed list + `pnpm check` 门禁
- **[Risk] Worker 测试 flaky** → 单元测试 mock Worker；集成测试 optional 短超时
- **[Risk] Vue Shell 维护成本** → 最小 API parity；共享 `@aether-md/core` 类型 only
- **[Risk] BREAKING stub → real services** → 1.0.0 首次 publish，无 npm 消费者包袱

## Migration Plan

1. Waves 1–9：incremental merge to feature branch → main
2. Wave 10：ADR 009 修订、changeset `1.0.0`、Release CI publish
3. Rollback：按 task Rollback Notes revert；publish 前无 npm 消费者

## Open Questions

- compile-layer 是否需要 `manifestVersion: 2` — Wave 3 评估；默认保持 `1` 除非 spec 强制
- OTel optional peer 版本 — Wave 8 选定
