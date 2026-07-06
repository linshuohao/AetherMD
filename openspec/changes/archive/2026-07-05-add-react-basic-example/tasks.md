## 1. OpenSpec 与分支确认

- [ ] 1.1 确认 `openspec/changes/add-react-basic-example/` artifacts 完整
- [ ] 1.2 确认 `openspec validate add-react-basic-example --strict` 通过
- [ ] 1.3 确认分支 `feature/add-react-basic-example` 与 change id 一致

## 2. examples/react-basic scaffold

- [ ] 2.1 创建 `examples/react-basic` workspace private package（`@aether-md/example-react-basic`）、`tsconfig.json`、`vite.config.ts`、`index.html`
- [ ] 2.2 添加 Vite + React devDependencies；声明 workspace 依赖（`@aether-md/react`、`@aether-md/core`、`@aether-md/preset-gfm`、plugin packages）
- [ ] 2.3 实现 `src/plugins.ts`：`createGfmPreset()` + 显式 adapter wiring（对齐 `headless-gfm` / react test-helpers 模式）

## 3. React Shell 演示 UI

- [ ] 3.1 实现 `App.tsx`：`AetherEditorRoot` + `AetherEditorContent` + 受控 `value` / `onChange`
- [ ] 3.2 实现 GateLock 演示：父组件 force rerender 且 `value` 不变时不重设文档
- [ ] 3.3 验证 `pnpm dev` 可本地运行并可编辑 GFM 内容

## 4. G6 门禁与 CI

- [ ] 4.1 添加 `typecheck`（`tsc --noEmit`）与 `check` 脚本；确认 turbo `pnpm check` 调度 `examples/react-basic`
- [ ] 4.2 确认 `examples/headless-gfm` 与既有 M1–M6 门禁在扩展后仍全绿

## 5. 文档同步

- [ ] 5.1 更新 `docs/project-status.md`：将 `react-basic` 标为已交付
- [ ] 5.2 更新 `docs/community/release-process.md` 与 `docs/architecture/ci-checklist.md`（G6 扩展）
- [ ] 5.3 按需修正 `docs/engineering/test-strategy.md` 中「M6 不覆盖 react-basic」措辞

## 6. 验证与归档准备

- [ ] 6.1 运行 `pnpm check` 全绿
- [ ] 6.2 运行 `openspec validate add-react-basic-example --strict`
- [ ] 6.3 准备 archive 后 docs/spec sync 清单（`aether-workflow-update-docs-spec`：`validation-suite`、`engineering-workflow` main spec）

## 7. Superpowers 详细任务（本文件仅高层）

- [ ] 7.1 使用 `aether-workflow-create-plan` 生成 implementation plan
- [ ] 7.2 使用 `aether-workflow-create-task` / `aether-workflow-execute-task-loop` 拆分并实现 scoped tasks
