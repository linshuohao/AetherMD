# 架构决策记录

ADR 用来记录重要架构决策，确保实现开始后仍能追溯当时的背景、取舍和影响。

## 索引

| ADR | 标题 | 状态 | 日期 |
| --- | --- | --- | --- |
| [ADR-001](001-microkernel-architecture.md) | 采用微内核架构，而非一体化组件 | Accepted | 2026-01-15 |
| [ADR-002](002-declarative-manifest-merging.md) | 强声明式 Manifest 合并，而非弹性 Hook | Accepted | 2026-01-15 |
| [ADR-003](003-remark-prosemirror-dual-track.md) | Remark 与 ProseMirror 双轨分离 | Accepted | 2026-01-20 |
| [ADR-004](004-command-queue-error-model.md) | Command Queue 与类型化 Error Model | Accepted | 2026-06-01 |
| [ADR-005](005-manifest-capabilities-versioning.md) | Manifest 能力系统与 manifestVersion | Accepted | 2026-06-01 |
| [ADR-006](006-layered-manifest-permission-model.md) | Manifest 分层与 Service / Permission 双轨模型 | Accepted | 2026-07-01 |
| [ADR-007](007-document-suite-split.md) | 文档体系三分法 | Accepted | 2026-07-01 |
| [ADR-008](008-repo-toolchain-baseline.md) | 采用轻量统一仓库工具底座 | Accepted | 2026-07-04 |

## 新增 ADR

1. 复制 [ADR 模板](../templates/adr.md)。
2. 文件名使用 `NNN-short-title.md`。
3. 初始状态使用 `Proposed`。
4. 决策完成后再改为最终状态。
5. 如果替代旧 ADR，需要双向链接。

## 状态

| 状态 | 含义 |
| --- | --- |
| Proposed | 正在讨论 |
| Accepted | 当前有效的项目约束 |
| Rejected | 讨论过但未采用 |
| Deprecated | 历史上有效，但不再推荐 |
| Superseded | 已被新的 ADR 替代 |
