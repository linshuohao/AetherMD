# @aether-md/example-block-morphing

**Shell: `AetherMorphingDocument`** — Instant Morphing 多块壳，预设全部 GFM 插件，加载可编辑的语法展示文稿。

## 运行

```bash
pnpm install   # 仓库根目录
pnpm build
pnpm --filter @aether-md/example-block-morphing dev
```

## 说明

- 插件：与 `react-basic` 相同的全套 GFM 预设
- 文稿：共享 `SHOWCASE_MARKDOWN`（段落与列表块支持 morphing；标题块在 ProseMirror 壳中可见）
- 点击块可在渲染态与 Markdown 源码态之间切换（Block Focus）
- 本包 `private: true`，不发布 npm

## 脚本

- `pnpm dev` — Vite 开发服务器
- `pnpm typecheck` / `pnpm test` — 纳入根 `pnpm check`

## 浏览器 E2E

```bash
pnpm e2e:install
pnpm e2e:test
```
