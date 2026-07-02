# CustomBlockRenderer

> 状态：设计草案。实现开始前，本页作为对应主题的维护入口。

## CustomBlockRenderer

```typescript
export interface CustomBlockRenderer {
  mount(domContainer: HTMLElement, blockData: unknown): void;
  update?(newBlockData: unknown): void;
  unmount?(): void;
}
```

使用 `interactiveRenderers` **SHOULD** 在 `security.requests` 中声明 `perm:dom`。

---
