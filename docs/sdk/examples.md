# 插件示例

## 附录 A：BoldPlugin 完整示例

```typescript
export const BoldPlugin = (): ExtensionManifest => ({
  metadata: {
    manifestVersion: 1,
    name: "bold",
    provides: ["plugin:bold"],
    requires: ["core:engine"],
  },
  compile: {
    schema: {
      type: "mark",
      name: "bold",
      matchMarkdownTag: "strong",
      serializeToMarkdown: { open: "**", close: "**" },
    },
    keymaps: {
      "Mod-b": "toggleBold",
      "Mod-B": "toggleBold",
    },
    commands: {
      toggleBold: (ctx) => {
        ctx.services.engine.toggleMark("bold");
      },
    },
  },
});
```

## 附录 B：BubbleMenuPlugin 完整示例

```typescript
export const BubbleMenuPlugin = (): ExtensionManifest => ({
  metadata: {
    manifestVersion: 1,
    name: "bubble-menu",
    requires: ["core:selection"],
  },
  security: {
    requests: ["perm:dom", "perm:timer"],
  },
  runtime: {
    onInit(ctx) {
      const floatingEl = document.createElement("div");
      ctx.events.on("selectionChanged", () => {
        /* 定位浮动层 */
      });
    },
  },
});
```

## 附录 C：TablePlugin 能力依赖示例

```typescript
export const TablePlugin = (): ExtensionManifest => ({
  metadata: {
    manifestVersion: 1,
    name: "table",
    provides: ["plugin:table", "plugin:table-row", "plugin:table-cell"],
    requires: ["core:engine", "core:selection"],
    dependsOn: ["heading"],
  },
  compile: {/* schema, commands, ... */},
});
```

---

_工程实现策略见工程文档；最小实现范围与 CI 校验见架构文档。_
