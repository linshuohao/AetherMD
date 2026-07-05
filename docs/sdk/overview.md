# Plugin SDK 概述

> 状态：设计草案 + M1–M4 最小基线已实现。本页作为对应主题的维护入口；完整 Command Pipeline 与 Shell 集成仍属 v1.0 目标。

## 概述

本规范定义插件与 `@aether-md/core` 之间的全部契约接口，包括：

* Manifest 分层结构
* 类型化 Service Capability / Runtime Permission 双轨系统
* Extension Lifecycle
* Command Pipeline
* EditorContext 边界
* ConflictResolver 策略化

---
