## Why

Playwright Phase 1 仅覆盖 4 个列表块场景，未对齐 `product-experience-spec` 场景 A/B/C（段落/链接 inline marks、多块 Block Focus 切换、编辑隔离）。`MorphingBlockSurface` 在真实浏览器下存在 `fill()` + `blur()` 与异步 `handleChange` 竞态，可能导致 CI 间歇失败。

## What

- 扩展 `e2e/playwright/` 至 11 用例（场景 C、Slice B 链接、编辑隔离、click-to-focus、sync 等待）
- 增强 `fixtures/editor.ts`（`focusBlock`、`editSource`、`waitForBlockSynced` 等）
- 修复 `packages/react` morphing 表面：本地 draft、blur 前 flush 待处理编辑、`data-edit-synced` 测试钩子
- 加固 `playwright.config.ts`（CI 超时、artifact 路径、`forbidOnly`）

## Non-Goals

- E2E 升阻塞 CI 门禁
- M7 publish、public API 变更
- `examples/react-basic` Playwright 覆盖

## Source Docs

- `docs/architecture/product-experience-spec.md`（场景 A/B/C）
- `docs/engineering/test-strategy.md`
- `openspec/specs/validation-suite/spec.md`

## Version Impact

none — 无 SemVer bump；`data-edit-synced` / `data-pending-edits` 为测试钩子，非公开 SDK 契约。

## Branch

`cursor/improve-e2e-block-morphing-ef42`

## Single-Task Scope Summary

一个 task：扩展 E2E 至 22 用例（含 react-basic L1）+ 修复 morphing 异步竞态 → `pnpm check` + `pnpm e2e:test` 22 passed。

## Validation Strategy

```bash
pnpm check
pnpm e2e:test
```

## Workflow Path

- **Discover:** Spec Change
- **Next:** `aether-workflow-execute-spec-change`
