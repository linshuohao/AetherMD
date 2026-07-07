## 1. OpenSpec 与策略

- [ ] 1.1 确认 `openspec validate complete-v1-before-release --strict` 通过
- [ ] 1.2 修订 ADR 009：完整 v1.0 后发布；取消 canary 先行
- [ ] 1.3 更新 `docs/project-status.md` 与 `docs/community/release-process.md` 发布策略

## 2. Wave 1 — 内置底座 (builtin-services)

- [ ] 2.1 HistoryService + `core:undo` / `core:redo` + engine history 桥接
- [ ] 2.2 SelectionService + engine selection 桥接
- [ ] 2.3 ClipboardService + copy/paste 代理
- [ ] 2.4 EditorContext 接入真实 services；集成测试

## 3. Wave 2 — Command Pipeline

- [ ] 3.1 ReadOnlyGuard + CapabilityGuard middleware
- [ ] 3.2 HistoryCapture middleware 与 builtin-services 联动
- [ ] 3.3 Command Queue P0–P3 优先级与 coalescing

## 4. Wave 3 — 编排与 Manifest

- [ ] 4.1 ConflictResolver 接入 `createEditor`
- [ ] 4.2 compile-layer schema merge
- [ ] 4.3 分层 Manifest 合并
- [ ] 4.4 `bootstrapCore` Adapter silent provide

## 5. Wave 4 — PermissionGuard

- [ ] 5.1 Permission 模型与 `grantedPermissions` enforce
- [ ] 5.2 Clipboard / 特权命令 Permission 集成

## 6. Wave 5 — Worker Runtime

- [ ] 6.1 Parser Worker 协议与实现
- [ ] 6.2 Serializer Worker 协议与实现
- [ ] 6.3 `createEditor` Worker 配置与集成测试

## 7. Wave 6 — Error Model

- [ ] 7.1 RenderError 降级视图路径
- [ ] 7.2 SerializationError 宿主可见性完善

## 8. Wave 7 — Vue Shell

- [ ] 8.1 Scaffold `packages/vue` workspace
- [ ] 8.2 AetherEditorRoot / Content / hook 实现
- [ ] 8.3 Vue 集成测试与 example

## 9. Wave 8 — Telemetry

- [ ] 9.1 TelemetryService 宿主注入
- [ ] 9.2 OTel-compatible span 接口（optional peer）

## 10. Wave 9 — 宿主 ConflictResolver

- [ ] 10.1 `EditorConfig.conflictResolver` 注入与测试

## 11. Wave 10 — 生态与发布

- [ ] 11.1 examples matrix 文档与 typecheck
- [ ] 11.2 E2E 升为 blocking CI
- [ ] 11.3 consumer smoke 扩展 v1 exports
- [ ] 11.4 Changeset `1.0.0` + Release CI publish
- [ ] 11.5 main spec sync + archive change

## 12. Superpowers 详细任务

- [ ] 12.1 `aether-workflow-create-plan` 生成 implementation plan
- [ ] 12.2 `aether-workflow-create-task` 按 Wave 创建 task 文件
- [ ] 12.3 `aether-workflow-execute-task-loop` 逐 task 执行
