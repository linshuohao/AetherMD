# ADR 006: Manifest 分层与 Service / Permission 双轨模型

| Field | Value |
| --- | --- |
| **Status** | Accepted |
| **Date** | 2026-07-01 |
| **Supersedes** | — |

**Context**
早期草案将 `requires`（框架服务）与 `runtimeCapabilities`（浏览器权限）平铺在同一 Manifest 根级，语义重叠且 Manifest 持续膨胀。

**Decision**
1. Manifest 拆为 `metadata` / `compile` / `runtime` / `security` 四层。
2. 框架服务统一为 **Service Capability**（`provides` / `requires`），类型化为 `CapabilityId`。
3. 浏览器 API 访问统一为 **Runtime Permission**：插件 `security.requests`，宿主 `EditorConfig.security.grantedPermissions`，运行时 `ctx.grantedPermissions`；类型化为 `PermissionId`。
4. 冲突裁决抽象为可注入的 `ConflictResolver` 接口。

**Trade-offs**
* *优点*：Manifest 可维护；类型安全；宿主可完全自定义冲突策略。
* *代价*：Manifest 作者需要理解 metadata / compile / runtime / security 四层边界。

**Consequences**
Plugin SDK 成为 Manifest 契约的唯一权威来源；Core 提供 `createDefaultConflictResolver()` 作为默认实现。

---
