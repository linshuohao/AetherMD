## Why

[架构优化原则](docs/architecture/architecture-optimization-principles.md) Phase 1 要求收敛 Markdown 序列化链路：`AetherDoc -> MDAST -> remark-stringify`，并消除 preset / remark serializer 之间的重复 inline 语法实现。

## What

- 在 `@aether-md/plugin-remark` 新增 `AetherDoc <-> MDAST` 对称映射（`mdast-mapping.ts`）
- `SerializerAdapter` 经 MDAST stringifier 输出 Markdown，保持 GFM 六语法 golden strings
- `@aether-md/preset-gfm` 的 `serializeParagraphInlines` 复用 remark 包单一出口
- 新增 `remark-stringify` 直接依赖

## Non-Goals

- Phase 2 Preset block strategies / React renderer 迁移
- Phase 3 block source preservation
- Core / public API 变更
- compile-layer schema merge

## Source Docs

- `docs/architecture/architecture-optimization-principles.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`
- `docs/engineering/adapter-protocol.md`
- `openspec/specs/gfm-preset/spec.md`
- `openspec/specs/adapter-base/spec.md`

## Version Impact

none — 无新 export、无 SemVer bump；行为保持 golden output 等价。

## Branch

`feature/serializer-mdast-convergence`

## Single-Task Scope Summary

一个 task：提取共享 MDAST 映射 → 迁移 serializer 至 remark-stringify → preset 复用 remark 块级 inline 序列化 → 全量测试绿。

## Validation Strategy

- `pnpm --filter @aether-md/plugin-remark test`
- `pnpm --filter @aether-md/preset-gfm test`
- `pnpm --filter @aether-md/react test`
- `pnpm check`

## Escalation Triggers Checked

| 触发器 | 结果 |
| --- | --- |
| Core public API 变更 | **否** |
| 多 task | **否** |
| workflow / CI gate 变更 | **否** |
| golden output 不可保持 | **若失败则暂停评估 handler 配置** |
