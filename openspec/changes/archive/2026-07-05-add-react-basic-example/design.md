## Context

M6 已闭合 headless 集成路径：`examples/headless-gfm`（`@aether-md/example-headless-gfm`，`private: true`）演示 `createEditor` + `createGfmPreset()` + 显式 adapter wiring，且 G6 `typecheck` 已纳入 `pnpm check`。`@aether-md/react` M5 基线提供 `AetherEditorRoot` / `AetherEditorContent` / `useAetherEditor`、Shell GateLock 与 happy-dom 集成测试，但仓库尚无**可复制、可本地运行的 React 宿主 demo**。

[ADR 009](docs/adr/009-release-governance.md) §4 冻结第二个 Demo 为 `examples/react-basic`（最小 Vite + React，演示 `@aether-md/react` 与 GateLock）；[发布流程](docs/community/release-process.md) 明确 `examples/*` 不发布 npm。本 design 抽取 implementation contract；长期事实来源为 `docs/` 与 `openspec/specs/`。

约束：

- **MUST NOT** 执行 npm publish、配置 `NPM_TOKEN`、修改五包 public API。
- **MUST NOT** 引入 Playwright / 浏览器 CI。
- **MUST NOT** 修改 Core/React 运行时语义，除非测试暴露 bug 并记录 deviation。
- 说明性正文使用中文；API 名称、包名、路径与 OpenSpec 关键词保持 English。

## Goals / Non-Goals

**Goals:**

- 交付 `examples/react-basic`（workspace private，Vite + React 最小 UI）。
- 演示 `@aether-md/react` + `createGfmPreset()` + 显式 adapter wiring（复用 headless / react test helper 模式）。
- 演示受控 `value` + `onChange` 与 GateLock（父组件 force rerender 时等值 `value` 不重设文档）。
- 将 `examples/react-basic` `typecheck` 纳入根 `pnpm check`（G6 扩展）。
- 轻量文档同步：`project-status.md`、`release-process.md`、`ci-checklist.md`。

**Non-Goals:**

- Playwright、examples matrix、Vue Shell、toolbar/theme/History UI。
- M7：npm publish、去 `private: true`、Release CI、`pnpm pack` consumer smoke。
- 修改 `@aether-md/react` / Core public API 或 GateLock 实现语义。
- 在 CI 主路径运行 `vite build` 或 E2E（除非后续 change 明确要求）。
- `docs/sdk/examples.md` 大规模改写（该页为插件 Manifest 示例，非 React 宿主教程）。

## Decisions

### 1. MODIFIED `validation-suite` + `engineering-workflow`；无新 capability 名

**选择：** 验收要求作为 `validation-suite` delta（新增 react-basic 要求 + 扩展 G6）；`engineering-workflow` delta 仅 MODIFIED examples typecheck 失败场景。

**理由：** 与 M6 `add-validation-suite` 模式一致；react-basic 是 validation / demo 交付物，非新 runtime capability。

### 2. `examples/react-basic` 布局与职责

**选择：**

```text
examples/react-basic/
  package.json          # name: @aether-md/example-react-basic, private: true
  tsconfig.json         # app + Vite 类型；typecheck 用 tsc --noEmit
  vite.config.ts
  index.html
  src/
    main.tsx            # ReactDOM.createRoot
    App.tsx             # 受控编辑器 + GateLock 演示
    plugins.ts          # createGfmEditorPlugins()（与 headless-gfm / react test-helpers 同模式）
```

- **SHALL** 使用 `AetherEditorRoot` + `AetherEditorContent`；**MAY** 使用 `useAetherEditor` 展示 `markdown` 只读预览。
- **SHALL** 通过 `value` + `onChange` 受控 props 演示 GateLock：提供「强制父 rerender」控件，在 `value` 字符串不变时验证编辑会话未被重设（行为与 `gate-lock.integration.test.tsx` 一致，但以可运行 UI 叙事呈现）。
- **SHALL** 使用 `createGfmPreset()` + bootstrap/remark/prosemirror stub plugins + preset adapters 显式 wiring（复制 `examples/headless-gfm/src/run.ts` 与 `packages/react/src/test-helpers.ts` 模式，避免 example 依赖 `@aether-md/react` 内部 test 模块）。
- `package.json` scripts：`dev`（`vite`）、`build`（`vite build`，本地验证用）、`typecheck`（`tsc --noEmit`）、`check`（`pnpm typecheck`）。
- 已存在 `pnpm-workspace.yaml` `examples/*` glob；**无需**改 workspace 边界。
- **MUST NOT** 发布 npm；**MUST NOT** 被五包 `dependencies` 引用。

**与包内测试区分：** `@aether-md/react` happy-dom 测试验证 Shell 契约与 CI 回归；`examples/react-basic` 验证**宿主集成故事**（Vite 消费路径、文档可引用、维护者可 `pnpm dev` 手动探索）。

**备选：** 仅扩展 README 片段。否决：ADR 009 明确要求可运行 react-basic example。

### 3. Vite + React 工具链

**选择：**

| 依赖 | 范围 | 说明 |
| --- | --- | --- |
| `vite`, `@vitejs/plugin-react` | example devDependencies | 仅 example 包 |
| `react`, `react-dom` | example dependencies 或 peer + dev | 与 `@aether-md/react` peer 对齐 |
| workspace `*` | dependencies | `@aether-md/react`, `@aether-md/core`, `@aether-md/preset-gfm`, plugin packages |

- `vite.config.ts` **SHOULD** 配置 `resolve.dedupe` 或 `optimizeDeps` 以避免 monorepo 双 React 实例（implementation 以可运行 + typecheck 绿为准）。
- CI **仅** 跑 `typecheck`，**不**将 `vite build` 纳入 `pnpm check`（降低 CI 复杂度；ADR 009 明确不做 Playwright/浏览器 CI）。

**备选：** 使用 `react-scripts` / webpack。否决：Vite 为 ADR 009 与 `package-layout.md` 既定形态，冷启动快、配置最小。

### 4. GateLock 演示 UI（最小）

**选择：** `App.tsx` 包含：

1. `AetherEditorRoot` 受控 `value={markdown}` + `onChange={setMarkdown}`。
2. 只读区域显示当前 `markdown`（via `useAetherEditor` 或父 state）。
3. 按钮「Force parent rerender」：递增本地 counter 触发 React rerender，**不**改变 `markdown` 字符串 — 演示 GateLock 下文档不被重设（用户可继续编辑或观察 probe 状态）。

**MUST NOT** 实现 toolbar、theme、History UI。

**理由：** 对齐 `openspec/specs/react-shell/spec.md` GateLock 要求与 ci-checklist #41 intent。

### 5. G6 扩展：`examples/react-basic` typecheck 纳入 `pnpm check`

**选择：** 沿用 M6 `headless-gfm` 模式：

- `examples/react-basic/package.json` 提供 `typecheck`（`tsc --noEmit`）与 `check`（`pnpm typecheck`）。
- turbo `check` 任务自动调度 workspace 内所有 package 的 `check`（与 `headless-gfm` 相同；`turbo.json` 无需语义变更，除非 implementation 发现缺脚本）。

**主路径：** G6 = `examples/headless-gfm` **与** `examples/react-basic` 均 `tsc --noEmit` 绿。

**理由：** ADR 009 G6 原文 `examples/*`；M6 仅落地 headless；本 change 扩展第二示例，不引入新门禁类型。

### 6. 文档同步落点

**选择：**

| 文档 | 更新 |
| --- | --- |
| `docs/project-status.md` | `react-basic` 从「尚未开始」移至「已有内容」；更新主要产物列表 |
| `docs/community/release-process.md` | M6 预备表增加 `examples/react-basic` 行（`private: true`） |
| `docs/architecture/ci-checklist.md` | G6 注释扩展至 `examples/react-basic` |
| `docs/engineering/test-strategy.md` | 注明 M6 后 react-basic 由本 change 覆盖（若仍写「M6 不覆盖」则修正） |

**理由：** 单一事实来源，避免 `package-layout.md` 与 `project-status` 漂移。

## Risks / Trade-offs

| 风险 | 缓解 |
| --- | --- |
| example 与 `@aether-md/react` 测试重复 | 示例侧重 Vite 宿主叙事与手动探索；测试侧重断言与 CI |
| monorepo 双 React 实例导致 subtle bugs | Vite dedupe；本地 `pnpm dev` 验证 |
| Vite devDeps 增加 lockfile 体积 | 限制在 example 包；五包不引入 |
| 将 `vite build` 纳入 CI 范围膨胀 | design 冻结 CI 仅 `typecheck` |
| plugin wiring 复制 drift | 抽取 `src/plugins.ts` 单一模块；注释引用 headless-gfm 模式 |

## Migration Plan

1. 合并 OpenSpec artifacts → `aether-workflow-create-plan` → Superpowers tasks。
2. Scaffold `examples/react-basic` + Vite/React 最小 app。
3. 实现 GateLock 演示 UI + GFM plugin wiring。
4. 接入 turbo `check` / 验证 `pnpm check` 绿。
5. 文档同步 → compliance review → archive → `aether-workflow-update-docs-spec` sync main specs。

**Rollback：** 移除 `examples/react-basic` 目录；revert 文档与 turbo 无副作用项；五包无行为变更。

## Open Questions

以下问题在本 design **已冻结**（implementation 不得偏离，除非新 OpenSpec deviation 记录）：

| # | 问题 | 冻结决策 |
| --- | --- | --- |
| 1 | CI 是否跑 `vite build` | **否**；CI 仅 `typecheck` |
| 2 | G6 范围 | `headless-gfm` + `react-basic` 均 `tsc --noEmit` |
| 3 | GateLock 演示方式 | 受控 `value` + force parent rerender 按钮 |
| 4 | plugin wiring 来源 | 复制 headless-gfm / react test-helpers 模式，不依赖 react 内部 test 模块 |

**Implementation 阶段待定形（不阻塞 OpenSpec）：**

- `App.tsx` 具体 UI 文案与 fixture Markdown 内容。
- Vite 配置细节（port、base）以可 `pnpm dev` 为准。
