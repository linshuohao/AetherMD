# Plugin SDK 概述

> 状态：设计草案 + M1–M5 最小基线已实现（M5 最小 React Shell 集成在 `@aether-md/react`）。本页作为对应主题的维护入口；完整 Command Pipeline 仍属 v1.0 目标。

## 概述

本规范定义插件与 `@aether-md/core` 之间的全部契约接口，包括：

* Manifest 分层结构
* 类型化 Service Capability / Runtime Permission 双轨系统
* Extension Lifecycle
* Command Pipeline
* EditorContext 边界
* ConflictResolver 策略化

## 类型入口

插件作者 **MUST** 从 **`@aether-md/core`** 导入公开契约类型（Manifest、Capability、Command/Event、document-model、adapter 协议等）。本仓库 **不** 提供独立 `@aether-md/sdk` npm 包；`docs/sdk/` 为权威文档入口。再评估条件见 [ADR 009](../adr/009-release-governance.md)。

---
