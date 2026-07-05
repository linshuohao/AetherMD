## 1. OpenSpec 与分支确认

- [x] 1.1 确认 `openspec/changes/add-validation-suite/` artifacts 与 `openspec validate add-validation-suite --strict` 通过
- [x] 1.2 确认分支 `feat/add-validation-suite` 与 change id 一致

## 2. Publish 预备（不 publish）

- [x] 2.1 五包添加 `license: "MIT"`、`repository`、`files`、`publishConfig` 元数据
- [x] 2.2 配置 `.changeset/config.json` `linked` 五包版本组
- [x] 2.3 根 `package.json` 添加 `changeset:publish` 脚本；确认未配置 `NPM_TOKEN` / Release workflow
- [x] 2.4 完善 `docs/community/release-process.md` M6 预备状态

## 3. examples/headless-gfm

- [x] 3.1 创建 `examples/headless-gfm` workspace private package 与 `tsconfig.json`
- [x] 3.2 实现 Node 脚本：`createEditor` + `createGfmPreset()` + 显式 adapter wiring
- [x] 3.3 添加 `typecheck`（`tsc --noEmit`）与 `start` 脚本；接入 `pnpm-workspace.yaml` 与 turbo pipeline
- [x] 3.4 验证示例可运行且输出符合 headless GFM 集成预期

## 4. 契约与 CI 门禁

- [x] 4.1 实现 G11：`SUPPORTED_MANIFEST_VERSIONS` 与 `docs/sdk/manifest.md` 一致性校验（失败即 `pnpm check` 红）
- [x] 4.2 验证官方包 `manifestVersion` 在支持列表内
- [x] 4.3 将 manifest 校验与 `examples/headless-gfm` typecheck 纳入根 `pnpm check`
- [x] 4.4 确认 M1–M5 既有测试在扩展后仍全绿（G5）

## 5. 启动中止行为回归

- [x] 5.1 确认 `createDefaultConflictResolver` schema abort 单元测试覆盖
- [x] 5.2 新增或整合 `createEditor` 启动中止集成测试（unsupported manifestVersion、duplicate name）
- [x] 5.3 在 validation 记录注明 compile-layer schema merge 延后范围（若 ci-checklist Schema 项部分满足）

## 6. 文档与 G12

- [x] 6.1 更新 `docs/project-status.md`：M6 状态与 v1.0 差距小节
- [x] 6.2 更新 `docs/architecture/roadmap.md` 交叉引用或差距短表
- [x] 6.3 更新 `docs/architecture/ci-checklist.md`：勾选/注释 M6 已启用项
- [x] 6.4 同步 `docs/engineering/test-strategy.md` M6 基线（若受影响）

## 7. 验证与归档准备

- [x] 7.1 运行 `pnpm check` 全绿
- [x] 7.2 运行 `openspec validate add-validation-suite --strict`
- [x] 7.3 准备 archive 后 docs/spec sync 清单（`aether-workflow-update-docs-spec`：`validation-suite` main spec、可选 `engineering-workflow`）

## 8. Superpowers 详细任务（本文件仅高层）

- [x] 8.1 使用 `aether-workflow-create-plan` 生成 implementation plan
- [x] 8.2 使用 `aether-workflow-create-task` / `aether-workflow-execute-task-loop` 拆分并实现 scoped tasks
