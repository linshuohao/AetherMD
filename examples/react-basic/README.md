# @aether-md/example-react-basic

**Shell: `AetherEditorContent`** — Phase 0 ProseMirror 集成壳，预设全部 GFM 插件，加载可编辑的语法展示文稿。

## 运行

```bash
pnpm install   # 仓库根目录
pnpm build
pnpm --filter @aether-md/example-react-basic dev
```

## 说明

- 插件：`@aether-md/example-shared` 的 `createGfmEditorPlugins()`（bootstrap + remark + prosemirror + GFM preset）
- 文稿：`SHOWCASE_MARKDOWN`（标题、段落、粗体、斜体、链接、无序/有序列表）
- 本包 `private: true`，不发布 npm

## 脚本

- `pnpm dev` — Vite 开发服务器
- `pnpm typecheck` — `tsc --noEmit`（纳入根 `pnpm check`）
