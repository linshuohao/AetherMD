# CustomBlockRenderer

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
