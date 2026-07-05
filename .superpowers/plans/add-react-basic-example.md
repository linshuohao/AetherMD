# add-react-basic-example Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use Superpowers task execution (`aether-workflow-create-task` → `aether-workflow-implement-task` / `aether-workflow-execute-task-loop`) to implement this plan task-by-task. Do not redefine OpenSpec requirements in code.

**Goal:** 交付 `examples/react-basic`（workspace private、Vite + React 最小可运行 demo），演示 `@aether-md/react` + `createGfmPreset()` 显式 adapter wiring、受控 `value`/`onChange` 与 Shell GateLock；将 example `typecheck` 纳入根 `pnpm check`（G6 扩展至 `headless-gfm` + `react-basic`）；轻量文档同步。**不**修改五包 public API、**不**引入 Playwright / 浏览器 CI、**不**执行 npm publish。

**Architecture:** 新建 `examples/react-basic` 作为 ADR 009 §4 第二个 Demo 形态：Vite 宿主消费 `@aether-md/react`（`AetherEditorRoot` / `AetherEditorContent` / `useAetherEditor`），`src/plugins.ts` 复制 `examples/headless-gfm/src/run.ts` 与 `packages/react/src/test-helpers.ts` 的 GFM wiring 模式（**不**依赖 react 内部 test 模块）；`App.tsx` 以受控 props +「Force parent rerender」按钮演示 GateLock；CI 主路径仅 `tsc --noEmit`（与 M6 `headless-gfm` 一致），本地 `pnpm dev` 供维护者手动探索。

**Tech Stack:** TypeScript、Vite、`@vitejs/plugin-react`、React 19、pnpm workspace、Turborepo `pnpm check`；workspace 依赖五包中的 `@aether-md/react`、`@aether-md/core`、`@aether-md/preset-gfm`、plugin packages；**无** Playwright、**无** happy-dom（包内测试职责）、**无** `vite build` CI。

---

## Change

| 字段 | 值 |
| --- | --- |
| OpenSpec change | `add-react-basic-example` |
| Branch | `feature/add-react-basic-example`（自 `main`；plan 时工作树仅含 OpenSpec artifacts） |
| OpenSpec status | **complete**（4/4 artifacts：`proposal` / `design` / `specs` / `tasks`）；`openspec validate add-react-basic-example --strict` 待 implementation 后确认 |
| Apply readiness | `isComplete: true`；OpenSpec high-level tasks 0/7 sections complete |
| Version impact | **无 SemVer 变更** — 五包 public API / runtime 语义 **不变**；`manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` **不变**（`[1]`）；新 `@aether-md/example-react-basic` workspace **private** package；`pnpm-lock.yaml` **预期变更**（Vite/React devDeps）；**不**发布 npm；**无** Changeset publish 影响 |
| Expected commit scope | `feat(examples)`、`docs(status)`、`docs(community)`、`docs(architecture)`；OpenSpec 产物 `spec(examples)` / `docs(openspec)` |
| Commit strategy | **每 task 可独立 commit**（Conventional Commits）；PR body 须追踪 OpenSpec change id 与 task id；whole-change squash 留 PR merge 时决定 |

范围边界：

- **包含：** `examples/react-basic` scaffold、Vite + React 入口、`plugins.ts` GFM wiring、`App.tsx` GateLock 演示 UI、G6 `typecheck` 纳入 `pnpm check`、`docs/project-status.md` / `release-process.md` / `ci-checklist.md` / 可选 `test-strategy.md` 更新。
- **排除：** npm publish、`NPM_TOKEN`、去五包 `private: true`、Release workflow（M7）、Playwright / 浏览器 CI、`vite build` CI 主路径、toolbar/theme/History UI、Core/React public API 或 GateLock 语义变更、`docs/sdk/examples.md` 大规模改写。
- **文档语言：** 说明性正文中文；API 名称、包名、路径与 OpenSpec 结构关键词 English。

## Source Artifacts

OpenSpec artifacts：

- `openspec/changes/add-react-basic-example/proposal.md`
- `openspec/changes/add-react-basic-example/design.md`
- `openspec/changes/add-react-basic-example/specs/validation-suite/spec.md`
- `openspec/changes/add-react-basic-example/specs/engineering-workflow/spec.md`
- `openspec/changes/add-react-basic-example/tasks.md`

长期 source docs / ADRs：

- `docs/adr/009-release-governance.md`（§4 Demo 形态、G6）
- `docs/community/release-process.md`（`examples/*` 不发布矩阵）
- `docs/project-status.md`（`react-basic` 待落地项）
- `docs/architecture/package-layout.md`（`examples/react-basic` 规划路径）
- `docs/architecture/ci-checklist.md`（G6、GateLock #41）
- `docs/engineering/test-strategy.md`（M6 不覆盖 react-basic → 本 change 闭合）
- `docs/engineering/component-library-governance.md`（Example / Playground 包类型）
- `openspec/specs/react-shell/spec.md`（GateLock、Root/Content/hook）
- `openspec/specs/validation-suite/spec.md`（headless example、G6 基线）
- `examples/headless-gfm/`（workspace private 示例结构参考）
- `packages/react/src/test-helpers.ts`、`packages/react/src/gate-lock.integration.test.tsx`（wiring / GateLock 行为参考）

## Code-Management

创建 plan 时 `git status --short`：

```
?? openspec/changes/add-react-basic-example/
```

当前分支：`feature/add-react-basic-example`

- **允许修改区：** `examples/react-basic/**`、`pnpm-lock.yaml`、根 `package.json` / `turbo.json`（仅当 check 调度需显式调整）、`docs/project-status.md`、`docs/community/release-process.md`、`docs/architecture/ci-checklist.md`、可选 `docs/engineering/test-strategy.md`。
- **禁止纳入本 change：** 无关 dirty 文件、五包 `packages/**` 生产 runtime 语义变更（除非测试暴露 bug 并记录 deviation）、`AGENTS.md` / workflow skill mirrors（除非单独 workflow PR）、Playwright CI、M7 publish 配置。
- **禁止新建：** `packages/vue`、compile-layer merge、独立 npm 发布配置。
- **Example 边界：** **MUST NOT** 从 `@aether-md/react` 导入 `test-helpers` 或任何 test-only 路径；**MUST NOT** 被五包 `dependencies` 引用。

## File Map

| 路径 | 职责 |
| --- | --- |
| `examples/react-basic/package.json` | `@aether-md/example-react-basic`，`private: true`；`dev` / `build` / `typecheck` / `check` scripts |
| `examples/react-basic/tsconfig.json` | Vite app + `tsc --noEmit`；`jsx: react-jsx`；含 `vite/client` types |
| `examples/react-basic/vite.config.ts` | Vite + React plugin；`resolve.dedupe: ['react','react-dom']` 防 monorepo 双实例 |
| `examples/react-basic/index.html` | Vite 入口 HTML，`#root` mount point |
| `examples/react-basic/src/main.tsx` | `ReactDOM.createRoot` 挂载 `App` |
| `examples/react-basic/src/App.tsx` | 受控编辑器 + GateLock 演示 UI + 只读 markdown 预览 |
| `examples/react-basic/src/plugins.ts` | `createGfmEditorPlugins()` — 对齐 headless-gfm / react test-helpers 模式 |
| `examples/react-basic/src/vite-env.d.ts` | `/// <reference types="vite/client" />` |

**不修改（除非 regression / turbo 调度缺口）：** `packages/core/**`、`packages/react/**` 生产代码、`examples/headless-gfm/**`（保持 M6 基线绿）。

**职责分离：**

| 层 | 职责 |
| --- | --- |
| `@aether-md/react` happy-dom 测试 | Shell 契约断言、CI 回归、`gate-lock.integration.test.tsx` |
| `examples/react-basic` | Vite 宿主集成故事、文档可引用、`pnpm dev` 手动探索 |

## Implementation Phases

每个 Phase 以 **可运行 / 可 typecheck** 为验收点；本 change **不**要求 TDD 新测试文件（example 无 Node test runner），以 **typecheck + 本地 dev smoke** 为主。

### Phase 1: Example scaffold（Task 01, wave-a）

**映射 requirements：**

- `React basic example package demonstrates React Shell integration path`（package 存在、`private: true`）

**产出：** `examples/react-basic` workspace private package；`package.json` + `tsconfig.json`；`pnpm install` 后 workspace 可解析。

### Phase 2: Vite + React 宿主（Task 02, wave-a）

**映射 requirements：**

- `React example runs locally from workspace`（dev server 可启动）

**产出：** `vite.config.ts`、`index.html`、`src/main.tsx`、最小 `App.tsx` shell（可先不含编辑器）。

### Phase 3: React Shell + GFM wiring（Task 03, wave-a）

**映射 requirements：**

- `React example runs locally from workspace`（编辑器挂载、可编辑 GFM）
- `React basic example package demonstrates React Shell integration path`（`createGfmPreset()` + 显式 adapter wiring）

**产出：** `src/plugins.ts`；`App.tsx` 集成 `AetherEditorRoot` + `AetherEditorContent` + 受控 `value`/`onChange`。

### Phase 4: GateLock 演示（Task 04, wave-a）

**映射 requirements：**

- `React example demonstrates controlled value and GateLock`

**产出：**「Force parent rerender」控件 + `useAetherEditor` 只读预览；等值 `value` 下编辑会话不重设。

### Phase 5: G6 门禁（Task 05, wave-b）

**映射 requirements：**

- `Examples package passes TypeScript noEmit check in CI`（react-basic）
- `M6 validation gates participate in root check pipeline`（engineering-workflow delta）
- `Existing M1 through M6 tests remain green`

**产出：** example `typecheck`/`check` scripts；`pnpm check` 调度 `examples/react-basic`；`headless-gfm` 仍绿。

### Phase 6: 文档同步（Task 06, wave-c）

**映射 requirements：**

- `React example is private and not published`（release-process 矩阵）

**产出：** `project-status.md`、`release-process.md`、`ci-checklist.md`、`test-strategy.md`（若措辞仍写 M6 不覆盖）。

### Phase 7: 全量验证 Barrier（Task 07）

**映射 requirements：** 全部 validation-suite + engineering-workflow delta scenarios。

**产出：** `pnpm check` 全绿；`openspec validate add-react-basic-example --strict` 通过；archive 前 main spec sync 清单就绪。

## Dependency Order

```
wave-a:  Task 01 ──► Task 02 ──► Task 03 ──► Task 04
wave-b:  Task 05 ◄── 01, 04          （typecheck 脚本可早加，全绿验收需 04 完成）
wave-c:  Task 06 ◄── 04              （文档描述已交付功能）
Barrier: Task 07 ◄── 01–06 全部完成
```

跨阶段约束：

- Example **MUST** `private: true`；**MUST NOT** 发布 npm。
- CI **仅** `typecheck`；**MUST NOT** 将 `vite build` 纳入 `pnpm check`（design Decision 3 / Open Questions #1 已冻结）。
- Plugin wiring **MUST** 在 example 本地 `src/plugins.ts` 实现；**MUST NOT** import `@aether-md/react` test 模块。
- 五包 **MUST NOT** 新增对 example 的 runtime 依赖。
- 若 OpenSpec 与 Docs/ADR 冲突，暂停并更新 OpenSpec change，禁止 silent 偏离。

## Boundary Risks

| 风险 | 触发点 | 处理方式 |
| --- | --- | --- |
| example 与 `@aether-md/react` happy-dom 测试职责重叠 | 复制 GateLock 断言到 example | 示例侧重 Vite 宿主叙事与 `pnpm dev` 手动探索；包内测试侧重断言与 CI |
| `prosemirror-view` 边界泄漏 | example 直接 import PM | **仅**经 `@aether-md/react` → `@aether-md/plugin-prosemirror` view-bridge；example **不**直接依赖 `prosemirror-view` |
| happy-dom vs 真实浏览器行为差 | GateLock 在 dev 与 CI 表现不一致 | 本 change **不**引入 Playwright；以 happy-dom 集成测试为契约 truth，example 为叙事 demo；本地 `pnpm dev` 作 smoke |
| monorepo 双 React 实例 | Vite 解析多份 `react` | `vite.config.ts` `resolve.dedupe: ['react','react-dom']`；`pnpm dev` 验证编辑无 subtle bug |
| Vite devDeps 泄漏到五包 | 误加 workspace 根或 package deps | Vite/React **仅** `examples/react-basic` devDependencies |
| plugin wiring 复制 drift | headless-gfm / test-helpers 演进 | 单一 `src/plugins.ts`；注释引用 headless-gfm 模式；不 import react test 模块 |
| G6 扩展破坏 `pnpm check` | turbo 未调度新 package | Task 05 确认 example 有 `check` script；故意 TS 错误应使 `pnpm check` 红 |
| 范围膨胀至 M7 publish | 顺带改 Release CI | 严格 non-goals；publish 留 M7 change |

## Validation Matrix

| Phase | OpenSpec Requirement | Validation 入口 | Intuitive Verification | Notes |
| --- | --- | --- | --- | --- |
| 1 | React example is private and not published | review `examples/react-basic/package.json` | `private: true`；`@aether-md/example-react-basic` | 排除 publish 矩阵 |
| 2 | React example runs locally from workspace | `pnpm --filter @aether-md/example-react-basic dev` | 浏览器加载空白/占位 UI | 需先 `pnpm build`（workspace 包） |
| 3 | React example runs locally from workspace | 同上 + 编辑 GFM | 编辑器挂载；可输入 `**bold**` 等 | `createGfmPreset()` wiring |
| 3 | Shell integration path | review `App.tsx` + `plugins.ts` | 使用 `AetherEditorRoot`/`Content`/`useAetherEditor` | 不依赖 react test-helpers |
| 4 | React example demonstrates controlled value and GateLock | `pnpm dev` + 手动：编辑 → Force rerender → 内容保留 | 与 `gate-lock.integration.test.tsx` 行为一致 | ci-checklist #41 intent |
| 5 | React basic example typechecks in check pipeline | `pnpm --filter @aether-md/example-react-basic typecheck` | `tsc --noEmit` PASS | G6 |
| 5 | Headless example typechecks in check pipeline | `pnpm check` | `headless-gfm` 仍 PASS | M6 回归 |
| 5 | Existing M1 through M6 tests remain green | `pnpm check` | 全 workspace 绿 | G5 |
| 5 | React basic example typecheck gate fails check pipeline | 故意引入 TS 错误 → `pnpm check` | check 红 | engineering-workflow delta |
| 6 | React example is private and not published | review `docs/community/release-process.md` | example 行 `private: true` | |
| 6 | 文档与 ADR 009 对齐 | review `docs/project-status.md`、`ci-checklist.md` | `react-basic` 标为已交付 | G6 注释含 react-basic |
| 7 | 全量 gate | `pnpm check && openspec validate add-react-basic-example --strict` | 全绿 | Task 07 Barrier |

**汇总命令映射：**

| 命令 | 覆盖 |
| --- | --- |
| `pnpm install` | Task 01 lockfile |
| `pnpm build` | Task 02–04 前构建 workspace 包（react 测试脚本亦依赖） |
| `pnpm --filter @aether-md/example-react-basic dev` | Task 02–04 本地 smoke |
| `pnpm --filter @aether-md/example-react-basic typecheck` | Task 05 local；Task 07 CI |
| `pnpm check` | Task 05–07 全 workspace gate |
| `openspec validate add-react-basic-example --strict` | Task 07 OpenSpec gate |

## Task Breakdown

| ID | 任务 | Outcome | Allowed Area | Validation | Version Impact | Depends On | Parallel Group | Barrier |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **01** | scaffold `examples/react-basic`（`package.json`、`tsconfig.json`） | workspace private package 可被 pnpm 解析 | `examples/react-basic/package.json`、`examples/react-basic/tsconfig.json`、`pnpm-lock.yaml` | `pnpm install`；`pnpm --filter @aether-md/example-react-basic typecheck` 预期 FAIL（无 `src/`） | 无 SemVer；新 private example | — | wave-a | false |
| **02** | Vite + React 入口与最小 UI | `pnpm dev` 可启动并渲染占位 UI | `examples/react-basic/vite.config.ts`、`index.html`、`src/main.tsx`、`src/vite-env.d.ts`、`src/App.tsx`（占位）、`package.json`（devDeps） | `pnpm build && pnpm --filter @aether-md/example-react-basic dev` | 无 | 01 | wave-a | false |
| **03** | 集成 `AetherEditorRoot` + `createGfmPreset` wiring | 浏览器可编辑 GFM Markdown | `examples/react-basic/src/plugins.ts`、`src/App.tsx` | `pnpm dev`；编辑 `**bold**` smoke | 无 | 02 | wave-a | false |
| **04** | GateLock 受控示例 UI | force rerender 且 `value` 不变时不重设文档 | `examples/react-basic/src/App.tsx` | `pnpm dev` 手动 GateLock smoke；对照 `gate-lock.integration.test.tsx` | 无 | 03 | wave-a | false |
| **05** | 纳入 `pnpm check` typecheck（G6 扩展） | `examples/react-basic` `tsc --noEmit` 经 turbo 纳入根 check | `examples/react-basic/package.json`（`typecheck`/`check`）、`turbo.json`（仅当调度缺口） | `pnpm --filter @aether-md/example-react-basic typecheck`；`pnpm check` | 无 | 01, 04 | wave-b | false |
| **06** | 文档更新（README / docs 引用） | `react-basic` 标为已交付；G6 / publish 矩阵更新 | `docs/project-status.md`、`docs/community/release-process.md`、`docs/architecture/ci-checklist.md`、可选 `docs/engineering/test-strategy.md` | 人工 review + `rg "react-basic" docs/` | 无 | 04 | wave-c | false |
| **07** | full validation barrier | 全 change 验收通过 | 全 change 允许区（只读验证为主） | `pnpm check && openspec validate add-react-basic-example --strict` | 无 | 01–06 | — | **true** |

### Task 01 详细步骤（scaffold）

1. 确认 `pnpm-workspace.yaml` 已含 `examples/*`（M6 已添加则 **不**重复改）。
2. 创建 `examples/react-basic/package.json`：

```json
{
  "name": "@aether-md/example-react-basic",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "check": "pnpm typecheck"
  },
  "dependencies": {
    "@aether-md/core": "workspace:*",
    "@aether-md/preset-gfm": "workspace:*",
    "@aether-md/plugin-prosemirror": "workspace:*",
    "@aether-md/plugin-remark": "workspace:*",
    "@aether-md/react": "workspace:*",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.7.0",
    "typescript": "^6.0.3",
    "vite": "^6.3.5"
  }
}
```

3. 创建 `examples/react-basic/tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "exactOptionalPropertyTypes": true,
    "types": ["vite/client"]
  },
  "include": ["src/**/*", "src/vite-env.d.ts"]
}
```

4. 运行 `pnpm install` 更新 lockfile。
5. 运行 `pnpm --filter @aether-md/example-react-basic typecheck` — 预期 **FAIL**（无 `src/`）。
6. **Commit:** `feat(examples): scaffold react-basic workspace package`

### Task 02 详细步骤（Vite + React 入口）

1. 创建 `examples/react-basic/vite.config.ts`：

```typescript
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
```

2. 创建 `examples/react-basic/index.html`：

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AetherMD React Basic Example</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

3. 创建 `examples/react-basic/src/vite-env.d.ts`：`/// <reference types="vite/client" />`
4. 创建 `examples/react-basic/src/main.tsx`：

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App.js";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Missing #root element");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

5. 创建占位 `examples/react-basic/src/App.tsx`：

```tsx
export function App() {
  return (
    <main>
      <h1>AetherMD React Basic Example</h1>
      <p>Editor mounts in Task 03.</p>
    </main>
  );
}
```

6. Smoke：`pnpm build && pnpm --filter @aether-md/example-react-basic dev` — 浏览器显示标题。
7. **Commit:** `feat(examples): add vite react entry for react-basic`

### Task 03 详细步骤（AetherEditorRoot + GFM wiring）

1. 创建 `examples/react-basic/src/plugins.ts`（复制 `examples/headless-gfm/src/run.ts` L11–78 与 `packages/react/src/test-helpers.ts` 结构，导出 `createGfmEditorPlugins()`）：

```typescript
import type {
  EngineAdapter,
  ExtensionPlugin,
  ParserAdapter,
  SerializerAdapter,
} from "@aether-md/core";
import { createGfmPreset } from "@aether-md/preset-gfm";

interface ExtensionPluginWithAdapters extends ExtensionPlugin {
  adapters?: {
    parser: ParserAdapter;
    serializer: SerializerAdapter;
    engine: EngineAdapter;
  };
}

function createBootstrapStubPlugin(): ExtensionPlugin {
  return {
    manifest: {
      metadata: {
        manifestVersion: 1,
        name: "core-bootstrap-stub",
        provides: ["core:bootstrap"],
      },
    },
  };
}

function createRemarkStubPlugin(): ExtensionPlugin {
  return {
    manifest: {
      metadata: {
        manifestVersion: 1,
        name: "remark",
      },
    },
  };
}

function createProsemirrorStubPlugin(): ExtensionPlugin {
  return {
    manifest: {
      metadata: {
        manifestVersion: 1,
        name: "prosemirror",
      },
    },
  };
}

export function createGfmEditorPlugins(): ExtensionPluginWithAdapters[] {
  const preset = createGfmPreset();
  return [
    createBootstrapStubPlugin(),
    createRemarkStubPlugin(),
    createProsemirrorStubPlugin(),
    {
      manifest: preset.manifest,
      adapters: {
        parser: preset.parser,
        serializer: preset.serializer,
        engine: preset.engine,
      },
    },
  ];
}
```

2. 更新 `examples/react-basic/src/App.tsx`（受控 shell，GateLock 按钮留 Task 04）：

```tsx
import { useState } from "react";

import {
  AetherEditorContent,
  AetherEditorRoot,
  useAetherEditor,
} from "@aether-md/react";

import { createGfmEditorPlugins } from "./plugins.js";

const INITIAL_MARKDOWN = "Hello **AetherMD**\n";

function MarkdownPreview() {
  const { markdown, ready } = useAetherEditor();
  return (
    <section>
      <h2>Markdown preview</h2>
      <pre data-testid="markdown-preview">{ready ? markdown : "Loading…"}</pre>
    </section>
  );
}

export function App() {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN);

  return (
    <main>
      <h1>AetherMD React Basic Example</h1>
      <AetherEditorRoot
        plugins={createGfmEditorPlugins()}
        value={markdown}
        onChange={setMarkdown}
      >
        <AetherEditorContent />
        <MarkdownPreview />
      </AetherEditorRoot>
    </main>
  );
}
```

3. Smoke：`pnpm build && pnpm --filter @aether-md/example-react-basic dev` — 编辑器可挂载；编辑后 preview 更新。
4. **Commit:** `feat(examples): wire react shell and gfm preset in react-basic`

### Task 04 详细步骤（GateLock 受控示例）

1. 扩展 `App.tsx`，对齐 `packages/react/src/gate-lock.integration.test.tsx` 叙事：

```tsx
import { useState } from "react";

import {
  AetherEditorContent,
  AetherEditorRoot,
  useAetherEditor,
} from "@aether-md/react";

import { createGfmEditorPlugins } from "./plugins.js";

const INITIAL_MARKDOWN = "Hello **AetherMD**\n";

function MarkdownPreview() {
  const { markdown, ready } = useAetherEditor();
  return (
    <section>
      <h2>Markdown preview</h2>
      <pre data-testid="markdown-preview">{ready ? markdown : "Loading…"}</pre>
    </section>
  );
}

export function App() {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN);
  const [renderCount, setRenderCount] = useState(0);

  return (
    <main>
      <h1>AetherMD React Basic Example</h1>
      <p>
        GateLock demo: edit below, then force a parent rerender without changing{" "}
        <code>value</code>. The document should not reset.
      </p>
      <button
        type="button"
        onClick={() => setRenderCount((count) => count + 1)}
      >
        Force parent rerender ({renderCount})
      </button>
      <AetherEditorRoot
        plugins={createGfmEditorPlugins()}
        value={markdown}
        onChange={setMarkdown}
      >
        <AetherEditorContent />
        <MarkdownPreview />
      </AetherEditorRoot>
    </main>
  );
}
```

2. 手动验收（`pnpm dev`）：
   - 在编辑器中将文本改为含 `Hello AetherMD`（或 dispatch 等价编辑）。
   - 点击「Force parent rerender」多次。
   - 确认 preview 仍显示编辑后内容（**不**回退到 `INITIAL_MARKDOWN`）。
3. **Commit:** `feat(examples): add gate-lock controlled demo to react-basic`

### Task 05 详细步骤（G6 typecheck + pnpm check）

1. 确认 `examples/react-basic/package.json` 含：

```json
"typecheck": "tsc --noEmit",
"check": "pnpm typecheck"
```

2. 确认 turbo：`check` task `dependsOn: ["typecheck", "test"]` — example 无 test 时仅 `typecheck` 执行即可（与 `headless-gfm` 相同模式）。
3. 运行 `pnpm --filter @aether-md/example-react-basic typecheck` — 预期 **PASS**。
4. 运行 `pnpm check` — 预期全 workspace 绿，含 `headless-gfm` + `react-basic`。
5. 负向验证（可选 local）：故意在 `App.tsx` 引入 TS 错误 → `pnpm check` 应 **FAIL** → 修复。
6. **Commit:** `chore(examples): wire react-basic typecheck into check pipeline`

### Task 06 详细步骤（文档）

1. `docs/project-status.md`：将 `examples/react-basic` 从「尚未开始」移至「已有内容」/ M6 延伸交付；更新主要产物列表与近期重点 #3。
2. `docs/community/release-process.md`：M6 预备表增加 `examples/react-basic` 行（`private: true`，不发布 npm）。
3. `docs/architecture/ci-checklist.md`：G6 注释扩展至 `examples/react-basic` `tsc --noEmit`。
4. `docs/engineering/test-strategy.md`（若仍写「M6 不覆盖 `examples/react-basic`」）：改为由本 change 覆盖 example typecheck；**不**声称 Playwright 已覆盖。
5. **Commit:** `docs(status): document react-basic example delivery`

### Task 07 详细步骤（Barrier）

1. 运行 `pnpm check` — 预期全绿（skills:check + workflow:pr-check + turbo check 含两 examples + 五包测试）。
2. 运行 `openspec validate add-react-basic-example --strict`。
3. 确认 non-goals：无 publish、无五包 public API 变更、无 Playwright、无 `vite build` CI。
4. 记录 validation evidence 路径供 `aether-workflow-validate-task` / archive 使用：`.superpowers/runs/add-react-basic-example/validation.md`（implementation 阶段创建）。
5. 准备 archive sync 清单：`validation-suite`、`engineering-workflow` main spec（`aether-workflow-update-docs-spec`）。
6. **Commit（可选）：** 仅 validation record 时 `docs(superpowers): add react-basic validation evidence`

## Review Focus

- 每个改动文件映射到 Task 01–07。
- 每个 Task 映射到 OpenSpec `validation-suite` / `engineering-workflow` requirement 或 `tasks.md` 条目。
- **无** public API breaking change；五包 semver 保持 `0.0.0` private。
- `SUPPORTED_MANIFEST_VERSIONS` / `manifestVersion` 仍为 `[1]`。
- Example **不** import `@aether-md/react` test 模块；**不**直接依赖 `prosemirror-view`。
- Example **不**发布 npm；`private: true` 在 manifest 与 release-process 矩阵一致。
- `gate-lock.integration.test.tsx` 与 example 职责分离清晰。
- CI **仅** typecheck；**不**将 `vite build` 纳入 `pnpm check`。
- 无关 dirty 文件未纳入 commit。
- 说明性正文中文；代码标识 English。

## Open Questions

| 问题 | Plan 阶段处理 | 阻塞？ |
| --- | --- | --- |
| CI 是否跑 `vite build` | design 冻结：**否**；CI 仅 `typecheck` | 否 |
| G6 范围 | `headless-gfm` + `react-basic` 均 `tsc --noEmit` | 否 |
| GateLock 演示方式 | 受控 `value` + force parent rerender 按钮 | 否 |
| plugin wiring 来源 | example 本地 `plugins.ts`；不依赖 react test 模块 | 否 |
| `App.tsx` UI 文案与 fixture Markdown | implementation 可调整；须保留 GateLock 可观测性 | 否 |
| Vite port / base | 以可 `pnpm dev` 为准；无 ADR 约束 | 否 |
| 是否新增 example README | 非 OpenSpec 硬性要求；可选简短 `examples/react-basic/README.md`（若加则 Task 06） | 否 |

实现中若需偏离 OpenSpec design 决定，**MUST** 先更新 OpenSpec change，再改代码。

## Version Impact / Branch / Commit 策略

**Version impact（来自 proposal）：**

- 五包 linked 组：**无** public API 变更；semver **不变**（`0.0.0` private）。
- `examples/react-basic`：新 workspace **private** package；**不**发布 npm；**无** Changeset publish 影响。
- `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS`：**不变**（`[1]`）。
- `pnpm-lock.yaml`：预期变更（Vite/React devDeps）。

**Branch：**

- 当前：`feature/add-react-basic-example`
- 自 `main` 创建；implementation 全程保持单 change scope。

**Commit 策略：**

| Task | 推荐 commit message |
| --- | --- |
| 01 | `feat(examples): scaffold react-basic workspace package` |
| 02 | `feat(examples): add vite react entry for react-basic` |
| 03 | `feat(examples): wire react shell and gfm preset in react-basic` |
| 04 | `feat(examples): add gate-lock controlled demo to react-basic` |
| 05 | `chore(examples): wire react-basic typecheck into check pipeline` |
| 06 | `docs(status): document react-basic example delivery` |
| 07 | validation record only（若有）：`docs(superpowers): add react-basic validation evidence` |

- 推荐 **一 task 一 commit**；PR 描述链接 OpenSpec change id 与各 task id。
- Archive 前使用 `aether-workflow-update-docs-spec` sync main specs（`validation-suite`、`engineering-workflow`）。

## Recommended Next Skill

`aether-workflow-create-task` — 将本 plan 拆成 `.superpowers/tasks/add-react-basic-example/01-*.md` … `07-*.md`（中文说明 + English 标识；每 task 含 Depends On / Parallel Group / Barrier / Allowed Files / Forbidden Files / Validation 命令与 OpenSpec requirement 引用）。

**注意：** 本 session 按用户要求**仅**生成 plan，**未**创建 task 文件。
