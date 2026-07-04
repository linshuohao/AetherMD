# 项目状态

AetherMD 当前是设计到最小实现过渡阶段的开源项目。

## 当前阶段

| 字段 | 值 |
| --- | --- |
| 阶段 | 设计草案 + M1 Core Bootstrap |
| 实现 | `@aether-md/core` 最小 bootstrap 已开始 |
| 主要产物 | 文档、OpenSpec 规格、`packages/core` 最小实现 |
| 当前目标 | 保持 M1 Core Bootstrap 与长期架构和 SDK 契约同步 |

## 已有内容

- 架构原则与边界
- 插件 SDK 契约草案
- 工程实现策略
- 已接受的 ADR
- 最小实现路线图与 CI 校验计划
- 传统设计文档映射
- MVP 实施计划、Core API、文档模型、Adapter 协议与测试策略草案
- pnpm workspace 与仓库级 Git 规范检查
- `@aether-md/core` M1 Core Bootstrap 基线：Manifest version/shape validation、Service Capability validation、`metadata.dependsOn` lifecycle order、`onInit` / `onReady` startup、reverse `onDestroy` dispose
- `openspec/specs/core-bootstrap/spec.md` 作为已同步的 Core Bootstrap main spec
- `openspec/specs/engineering-workflow/spec.md` 作为已同步的工程工作流 main spec

## 尚未开始

- 已发布包
- Runtime Adapter
- Plugin SDK 包
- Demo 应用
- CI 流水线
- 发布流程

## 近期重点

1. 稳定文档体系。
2. 持续审查 SDK 契约和 M1 Core Bootstrap 的边界。
3. 将路线图和 CI 校验计划转化为后续实现里程碑。
4. 决定仓库治理、许可证和发布策略。
5. 审查 [MVP 实施计划](engineering/mvp-implementation-plan.md)、[Core API](architecture/core-api.md)、[文档模型](architecture/document-model.md)、[Adapter 协议](engineering/adapter-protocol.md) 和 [测试策略](engineering/test-strategy.md)。
6. 在进入 Command/Event、Adapter 或 Shell 里程碑前，继续保持 OpenSpec、Docs 和实现同步。

## 贡献建议

当前阶段优先做能减少歧义并保护 M1 边界的修改：

- 澄清契约语言
- 暴露隐藏假设
- 将宽泛路线图拆成可执行任务
- 为未决取舍新增 ADR
- 明确标出开放问题
